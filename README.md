# Bili-downloader

一个用于下载B站视频（包括普通视频和番剧）的Python工具，提供命令行和Web界面两种使用方式。

## 功能特点

- ✅ 支持下载普通视频和番剧内容
- ✅ 自动提取视频标题、描述、标签等元数据
- ✅ 下载视频封面图片
- ✅ 分离下载视频和音频并自动合并
- ✅ 支持预览版番剧下载
- ✅ 下载内容自动分类整理
- ✅ 提供Web界面和命令行两种使用方式
- ✅ 实时显示下载进度
- ✅ 支持选择下载选项（视频、音频、封面、元数据）
- ✅ 下载完成后自动打开文件夹

## 安装说明

### 1. 克隆仓库

```bash
git clone https://github.com/L-zum1/Bili-downloader.git
cd Bili-downloader
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 安装FFmpeg

该工具依赖FFmpeg进行视频处理，请确保已安装FFmpeg：

- **Mac**: `brew install ffmpeg`
- **Windows**: 从[官网](https://ffmpeg.org/download.html)下载并添加到环境变量
- **Linux**: `sudo apt-get install ffmpeg`

## 使用方法

### 方式一：Web界面

```bash
python app.py
```

然后在浏览器中打开 `http://localhost:5001`，即可使用Web界面下载视频。

#### Web界面功能

1. 在输入框中粘贴B站视频或番剧URL
2. 选择下载选项（默认全部选中）
3. 点击"开始下载"按钮
4. 查看视频信息和下载进度
5. 下载完成后可选择打开文件夹或再次下载

### 方式二：命令行

```bash
python main.py
```

然后输入视频URL：

```
请输入视频URL: https://www.bilibili.com/video/BVxxxxxx
# 或番剧URL
请输入视频URL: https://www.bilibili.com/bangumi/play/epxxxxxx
```

## 下载文件结构

```
downloads/
├── images/      # 视频封面图片
├── info/        # 视频元数据
└── videos/      # 下载的视频文件
```

## 注意事项

1. 该工具仅用于学习和个人使用，请遵守B站的相关规定
2. 对于需要登录或付费的内容，可能无法下载
3. 番剧预览版可能没有单独的音频流，视频文件本身可能已包含音频
4. 下载速度取决于网络环境和B站的限制
5. Web界面运行在本地服务器（localhost:5001），仅能在本地访问

## 示例

### 下载普通视频

**Web界面**：
1. 启动服务器：`python app.py`
2. 打开浏览器访问 `http://localhost:5001`
3. 粘贴URL：`https://www.bilibili.com/video/BV1xx411c7mD`
4. 点击"开始下载"

**命令行**：
```bash
python main.py
请输入视频URL: https://www.bilibili.com/video/BV1xx411c7mD
```

### 下载番剧

**Web界面**：
1. 启动服务器：`python app.py`
2. 打开浏览器访问 `http://localhost:5001`
3. 粘贴URL：`https://www.bilibili.com/bangumi/play/ep290864022`
4. 点击"开始下载"

**命令行**：
```bash
python main.py
请输入视频URL: https://www.bilibili.com/bangumi/play/ep290864022
```

## 依赖

- crawl4ai
- beautifulsoup4
- requests
- moviepy
- flask
- ffmpeg

## 许可证

MIT