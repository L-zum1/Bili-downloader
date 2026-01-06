// DOM元素选择
const downloadBtn = document.getElementById('download-btn');
const videoUrlInput = document.getElementById('video-url');
const videoInfoSection = document.getElementById('video-info-section');
const progressSection = document.getElementById('progress-section');
const resultSection = document.getElementById('result-section');

const videoTitle = document.getElementById('video-title');
const videoCover = document.getElementById('video-cover');
const videoDescription = document.getElementById('video-description');
const videoTags = document.getElementById('video-tags');

const coverProgress = document.getElementById('cover-progress');
const coverStatus = document.getElementById('cover-status');
const videoProgress = document.getElementById('video-progress');
const videoStatus = document.getElementById('video-status');
const audioProgress = document.getElementById('audio-progress');
const audioStatus = document.getElementById('audio-status');
const mergeProgress = document.getElementById('merge-progress');
const mergeStatus = document.getElementById('merge-status');

const openFolderBtn = document.getElementById('open-folder-btn');
const downloadAgainBtn = document.getElementById('download-again-btn');

// 模拟视频数据
const mockVideoData = {
    title: '【年度混剪】2026年B站热门视频精彩瞬间',
    description: '这是一个年度混剪视频，收录了2026年B站最热门的视频精彩瞬间，包括游戏、动画、生活、科技等各个领域。希望大家喜欢！',
    tags: '年度混剪,B站,热门视频,2026,精彩瞬间',
    cover: 'https://i0.hdslb.com/bfs/archive/5e8e97b4a4c7737b1c1b3b8d9c7d6e5f4a3b2c1d.jpg'
};

// 下载按钮点击事件
function downloadVideo() {
    const videoUrl = videoUrlInput.value.trim();
    
    // 表单验证
    if (!videoUrl) {
        showError('请输入视频链接');
        return;
    }
    
    // 检查是否为B站链接
    if (!videoUrl.includes('bilibili.com')) {
        showError('请输入有效的B站视频链接');
        return;
    }
    
    // 禁用下载按钮
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span class="loading"></span> 解析中...';
    
    // 隐藏其他区域
    progressSection.style.display = 'none';
    resultSection.style.display = 'none';
    
    // 调用API获取视频信息
    fetch('http://localhost:5001/api/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络请求失败');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        // 更新视频信息
        videoTitle.textContent = data.title;
        videoDescription.textContent = data.description;
        videoTags.textContent = data.tags;
        
        // 加载封面图片
        videoCover.onload = () => {
            videoInfoSection.style.display = 'block';
            window.scrollTo({ top: videoInfoSection.offsetTop - 80, behavior: 'smooth' });
        };
        videoCover.onerror = () => {
            videoCover.src = 'https://via.placeholder.com/200x113?text=Cover+Not+Found';
            videoInfoSection.style.display = 'block';
            window.scrollTo({ top: videoInfoSection.offsetTop - 80, behavior: 'smooth' });
        };
        videoCover.src = data.cover_url;
        
        // 显示下载完成
        setTimeout(() => {
            resultSection.style.display = 'block';
            window.scrollTo({ top: resultSection.offsetTop - 80, behavior: 'smooth' });
        }, 1000);
        
        showSuccess('视频下载完成！');
        
    })
    .catch(error => {
        showError(`下载失败: ${error.message}`);
    })
    .finally(() => {
        // 恢复下载按钮状态
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fa fa-download"></i> 开始下载';
    });
}

// 显示视频信息
function showVideoInfo() {
    // 更新视频信息
    videoTitle.textContent = mockVideoData.title;
    videoDescription.textContent = mockVideoData.description;
    videoTags.textContent = mockVideoData.tags;
    
    // 加载封面图片
    videoCover.onload = () => {
        videoInfoSection.style.display = 'block';
        window.scrollTo({ top: videoInfoSection.offsetTop - 80, behavior: 'smooth' });
    };
    videoCover.onerror = () => {
        videoCover.src = 'https://via.placeholder.com/200x113?text=Cover+Not+Found';
        videoInfoSection.style.display = 'block';
        window.scrollTo({ top: videoInfoSection.offsetTop - 80, behavior: 'smooth' });
    };
    videoCover.src = mockVideoData.cover;
}

// 开始下载流程
function startDownloadProcess() {
    // 显示进度区域
    progressSection.style.display = 'block';
    window.scrollTo({ top: progressSection.offsetTop - 80, behavior: 'smooth' });
    
    // 下载封面
    downloadCover();
}

// 下载封面（模拟）
function downloadCover() {
    coverStatus.textContent = '下载中...';
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            coverProgress.style.width = '100%';
            coverStatus.textContent = '下载完成';
            
            // 开始下载视频
            setTimeout(() => {
                downloadVideoPart();
            }, 500);
        } else {
            coverProgress.style.width = `${progress}%`;
            coverStatus.textContent = `下载中 ${Math.round(progress)}%`;
        }
    }, 300);
}

// 下载视频（模拟）
function downloadVideoPart() {
    videoStatus.textContent = '下载中...';
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            videoProgress.style.width = '100%';
            videoStatus.textContent = '下载完成';
            
            // 开始下载音频
            setTimeout(() => {
                downloadAudioPart();
            }, 500);
        } else {
            videoProgress.style.width = `${progress}%`;
            videoStatus.textContent = `下载中 ${Math.round(progress)}%`;
        }
    }, 400);
}

// 下载音频（模拟）
function downloadAudioPart() {
    audioStatus.textContent = '下载中...';
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            audioProgress.style.width = '100%';
            audioStatus.textContent = '下载完成';
            
            // 开始合并视频和音频
            setTimeout(() => {
                mergeVideoAudio();
            }, 500);
        } else {
            audioProgress.style.width = `${progress}%`;
            audioStatus.textContent = `下载中 ${Math.round(progress)}%`;
        }
    }, 300);
}

// 合并视频和音频（模拟）
function mergeVideoAudio() {
    mergeStatus.textContent = '合并中...';
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            mergeProgress.style.width = '100%';
            mergeStatus.textContent = '合并完成';
            
            // 完成下载流程
            setTimeout(() => {
                completeDownload();
            }, 500);
        } else {
            mergeProgress.style.width = `${progress}%`;
            mergeStatus.textContent = `合并中 ${Math.round(progress)}%`;
        }
    }, 500);
}

// 完成下载
function completeDownload() {
    // 显示结果区域
    resultSection.style.display = 'block';
    window.scrollTo({ top: resultSection.offsetTop - 80, behavior: 'smooth' });
    
    // 恢复下载按钮状态
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<i class="fa fa-download"></i> 开始下载';
}

// 打开文件夹
function openFolder() {
    fetch('http://localhost:5001/api/open-folder')
    .then(response => {
        if (!response.ok) {
            throw new Error('网络请求失败');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        showSuccess('已尝试打开文件夹');
    })
    .catch(error => {
        showError(`打开文件夹失败: ${error.message}`);
    });
}

// 再次下载
function downloadAgain() {
    // 隐藏结果区域
    resultSection.style.display = 'none';
    
    // 重置进度
    coverProgress.style.width = '0%';
    coverStatus.textContent = '准备中';
    videoProgress.style.width = '0%';
    videoStatus.textContent = '准备中';
    audioProgress.style.width = '0%';
    audioStatus.textContent = '准备中';
    mergeProgress.style.width = '0%';
    mergeStatus.textContent = '准备中';
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 清空视频URL
    videoUrlInput.focus();
}

// 事件监听
downloadBtn.addEventListener('click', downloadVideo);
openFolderBtn.addEventListener('click', openFolder);
downloadAgainBtn.addEventListener('click', downloadAgain);

// 回车键触发下载
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        downloadVideo();
    }
});

// URL输入变化时隐藏已显示的区域
videoUrlInput.addEventListener('input', () => {
    if (resultSection.style.display === 'block') {
        resultSection.style.display = 'none';
    }
});

// 页面加载完成后自动填写示例URL
window.addEventListener('DOMContentLoaded', () => {
    videoUrlInput.value = 'https://www.bilibili.com/video/BV1xx411c7mD';
});

// 平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 添加加载动画到按钮
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<span class="loading"></span> 处理中...';
    element.disabled = true;
    
    return () => {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// 表单验证函数
function validateForm() {
    const videoUrl = videoUrlInput.value.trim();
    const isValid = {
        url: videoUrl && videoUrl.includes('bilibili.com'),
        hasEmptyFields: !videoUrl
    };
    
    return isValid;
}

// 显示错误信息
function showError(message) {
    // 创建错误提示元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ff4d4f;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    errorDiv.innerHTML = `
        <i class="fa fa-exclamation-circle" style="margin-right: 8px;"></i>
        ${message}
    `;
    
    // 添加到页面
    document.body.appendChild(errorDiv);
    
    // 3秒后移除
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 3000);
}

// 显示成功信息
function showSuccess(message) {
    // 创建成功提示元素
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #52c41a;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    successDiv.innerHTML = `
        <i class="fa fa-check-circle" style="margin-right: 8px;"></i>
        ${message}
    `;
    
    // 添加到页面
    document.body.appendChild(successDiv);
    
    // 3秒后移除
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);