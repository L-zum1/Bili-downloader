# 导入必要的库
from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import re
import json
import requests
from bs4 import BeautifulSoup
import asyncio
import aiohttp
from moviepy import VideoFileClip, AudioFileClip

# 创建Flask应用
app = Flask(__name__, static_folder='frontend', template_folder='frontend')

# 定义常量
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'

# 创建必要的目录
os.makedirs('downloads/info', exist_ok=True)
os.makedirs('downloads/images', exist_ok=True)
os.makedirs('downloads/videos', exist_ok=True)

# 主页路由
@app.route('/')
def index():
    return render_template('index.html')

# 静态文件路由
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('frontend', filename)

# 下载视频的API路由
@app.route('/api/download', methods=['POST'])
def download_video_api():
    data = request.json
    video_url = data.get('url', '')
    
    if not video_url or 'bilibili.com' not in video_url:
        return jsonify({'error': '无效的B站视频链接'}), 400
    
    try:
        # 运行异步爬取
        result = asyncio.run(download_video(video_url))
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 异步下载视频函数
async def download_video(url):
    headers = {
        'Referer': url,
        'User-Agent': USER_AGENT,
    }
    
    browser_config = BrowserConfig(
        headless=True,
        user_agent=USER_AGENT
    )
    
    # 异步爬取视频页面
    async with AsyncWebCrawler(config=browser_config) as crawler:
        response = await crawler.arun(
            url,
            js_code="await new Promise(resolve => setTimeout(resolve, 3000));",
            headers=headers,
            cache_mode='bypass'
        )
    
    # 解析HTML
    soup = BeautifulSoup(response.html, 'html.parser')
    
    # 提取视频标题、描述和标签
    title = soup.find('title')
    title = title.text.strip() if title else "未找到标题"
    title = re.sub(r'[\\/:*?"<>|]', '', title)
    
    description = soup.find('meta', attrs={'name': 'description'})
    description = description.get('content', '').strip() if description else "未找到描述"
    
    tags = soup.find('meta', attrs={'name': 'keywords'})
    tags = tags.get('content', '').strip() if tags else "未找到标签"
    
    # 提取视频封面
    cover = soup.find('meta', attrs={'property': 'og:image'})
    cover_url = ''
    if cover:
        cover_url = cover.get('content', '').strip()
        if cover_url.startswith('//'):
            cover_url = 'https:' + cover_url
        cover_url = cover_url.split('@')[0]
        
        # 下载封面
        try:
            cover_response = requests.get(cover_url, headers=headers, timeout=30)
            if cover_response.status_code == 200 and cover_response.content:
                with open(f'downloads/images/{title}.jpg', 'wb') as f:
                    f.write(cover_response.content)
        except Exception as e:
            print(f"封面下载出错: {str(e)}")
    
    # 提取视频链接和音频链接
    video_url = None
    audio_url = None
    
    playinfo_script = None
    for script in soup.find_all('script'):
        if script.string and '__playinfo__' in script.string:
            playinfo_script = script.string
            break
    
    if playinfo_script:
        match = re.search(r'window\.__playinfo__\s*=\s*({.*})', playinfo_script)
        if match:
            playinfo_data = json.loads(match.group(1))
            
            videos = playinfo_data.get('data', {}).get('dash', {}).get('video', [])
            if videos:
                video_url = videos[0].get('baseUrl', '')
            
            audios = playinfo_data.get('data', {}).get('dash', {}).get('audio', [])
            if audios:
                audio_url = audios[0].get('baseUrl', '')
    
    # 处理番剧
    is_bangumi = 'bangumi' in url
    if not video_url and is_bangumi:
        # 提取ep_id
        ep_id_match = re.search(r'ep(\d+)', url)
        if ep_id_match:
            ep_id = ep_id_match.group(1)
            # 使用番剧API
            api_url = f"https://api.bilibili.com/pgc/player/web/v2/playurl?ep_id={ep_id}&fnval=16&fourk=1"
            api_response = requests.get(api_url, headers=headers)
            if api_response.status_code == 200:
                api_data = api_response.json()
                videos = api_data.get('result', {}).get('dash', {}).get('video', [])
                if videos:
                    video_url = videos[0].get('baseUrl', '')
                
                audios = api_data.get('result', {}).get('dash', {}).get('audio', [])
                if audios:
                    audio_url = audios[0].get('baseUrl', '')
    
    if not video_url or not audio_url:
        raise Exception("无法获取视频或音频链接")
    
    # 下载视频
    video_response = requests.get(video_url, headers=headers, timeout=30)
    if video_response.status_code != 200:
        raise Exception("视频下载失败")
    
    # 下载视频
    video_filename = f'{title}.m4s'
    with open(video_filename, 'wb') as f:
        f.write(video_response.content)
    
    # 下载音频
    audio_response = requests.get(audio_url, headers=headers, timeout=30)
    if audio_response.status_code != 200:
        raise Exception("音频下载失败")
    
    audio_filename = f'{title}.m4s'
    with open(audio_filename, 'wb') as f:
        f.write(audio_response.content)
    
    # 合并视频和音频
    print("正在合并视频和音频...")
    video = VideoFileClip(video_filename)
    audio = AudioFileClip(audio_filename)
    video = video.with_audio(audio)
    output_path = f'downloads/videos/{title}.mp4'
    video.write_videofile(output_path)
    
    # 保存信息文件
    with open(f'downloads/info/{title}.txt', 'w', encoding='utf-8') as f:
        f.write(f"视频标题: {title}\n")
        f.write(f"视频描述: {description}\n")
        f.write(f"视频标签: {tags}\n")
    
    # 删除临时文件
    for f in [video_filename, audio_filename]:
        if os.path.exists(f):
            os.remove(f)
    
    return {
        'success': True,
        'title': title,
        'description': description,
        'tags': tags,
        'cover_url': cover_url,
        'output_path': output_path
    }

# 打开下载文件夹
@app.route('/api/open-folder')
def open_folder():
    import subprocess
    try:
        # macOS
        subprocess.run(['open', 'downloads/videos'])
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
