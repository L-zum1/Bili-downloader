# 导入必要的库
import os
import re
import json
from crawl4ai import AsyncWebCrawler, BrowserConfig
from bs4 import BeautifulSoup
import asyncio
import requests
from moviepy import VideoFileClip, AudioFileClip

# 定义常量
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15'

url = input("请输入视频URL: ")

headers = {
    'Referer': url,
    'User-Agent': USER_AGENT,
}

browser_config = BrowserConfig(
    headless=True,
    user_agent=USER_AGENT
)

# 主函数
async def main():
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

        # 提取视频标题、描述和标签，写入info文件
        title = soup.find('title')
        title = title.text.strip() if title else "未找到标题"
        title = re.sub(r'[\\/:*?"<>|]', '', title)

        description = soup.find('meta', attrs={'name': 'description'})
        description = description.get('content', '').strip() if description else "未找到描述"

        tags = soup.find('meta', attrs={'name': 'keywords'})
        tags = tags.get('content', '').strip() if tags else "未找到标签"

        os.makedirs('downloads/info', exist_ok=True)
        with open(f'downloads/info/{title}.txt', 'w', encoding='utf-8') as f:
            f.write(f"视频标题: {title}\n")
            f.write(f"视频描述: {description}\n")
            f.write(f"视频标签: {tags}\n")

        # 提取视频封面，写入images文件
        cover = soup.find('meta', attrs={'property': 'og:image'})
        if cover:
            cover = cover.get('content', '').strip()
            if cover.startswith('//'):
                cover = 'https:' + cover
            cover = cover.split('@')[0]
            print(f"封面URL: {cover}")
            os.makedirs('downloads/images', exist_ok=True)
            try:
                cover_response = requests.get(cover, headers=headers, timeout=30)
                if cover_response.status_code == 200:
                    print(f"图片Content-Type: {cover_response.headers.get('Content-Type', '')}")
                    print(f"图片大小: {len(cover_response.content)} bytes")
                    if cover_response.content:
                        with open(f'downloads/images/{title}.jpg', 'wb') as f:
                            f.write(cover_response.content)
                        print(f"封面下载成功: downloads/images/{title}.jpg")
                    else:
                        print("封面下载失败：内容为空")
                else:
                    print(f"封面下载失败，状态码: {cover_response.status_code}")
            except Exception as e:
                print(f"封面下载出错: {str(e)}")
        else:
            cover = "未找到封面"

        print(f"视频标题: {title}")
        print(f"视频描述: {description}")
        print(f"视频标签: {tags}")
        print(f"视频封面: {cover}")

        playinfo_script = None
        for script in soup.find_all('script'):
            if script.string and '__playinfo__' in script.string:
                playinfo_script = script.string
                break

        # 提取视频链接和音频链接
        video_url = None
        audio_url = None

        if playinfo_script:
            match = re.search(r'window\.__playinfo__\s*=\s*({.*})', playinfo_script)
            if match:
                playinfo_data = json.loads(match.group(1))

                videos = playinfo_data.get('data', {}).get('dash', {}).get('video', [])
                if videos:
                    video_url = videos[0].get('baseUrl', '')
                    print(f"视频链接: {video_url}")
                else:
                    print("未找到视频链接")

                audios = playinfo_data.get('data', {}).get('dash', {}).get('audio', [])
                if audios:
                    audio_url = audios[0].get('baseUrl', '')
                    print(f"音频链接: {audio_url}")
                else:
                    print("未找到音频链接")
            else:
                print("无法解析 playinfo 数据")
        else:
            print("未找到 playinfo 数据")

        if video_url:
            video_response = requests.get(video_url, headers=headers, timeout=30)
            if video_response.status_code == 200:
                with open(f'video.m4s', 'wb') as f:
                    f.write(video_response.content)
                print("视频下载成功")
            else:
                print(f"视频下载失败，状态码: {video_response.status_code}")

        if audio_url:
            audio_response = requests.get(audio_url, headers=headers, timeout=30)
            if audio_response.status_code == 200:
                with open(f'audio.m4s', 'wb') as f:
                    f.write(audio_response.content)
                print("音频下载成功")
            else:
                print(f"音频下载失败，状态码: {audio_response.status_code}")
        
        # 合并视频和音频

        if video_url and audio_url:
            print("正在合并视频和音频...")
            os.makedirs('downloads/videos', exist_ok=True)
            video = VideoFileClip(f'video.m4s')
            audio = AudioFileClip(f'audio.m4s')
            video = video.with_audio(audio)
            output_path = f'downloads/videos/{title}.mp4'
            video.write_videofile(output_path)
            print(f"合并完成！视频已保存至: {output_path}")
        
        # 删除临时文件

        for f in ['video.m4s', 'audio.m4s']:
            if os.path.exists(f):
                os.remove(f)


# 运行主函数

asyncio.run(main())