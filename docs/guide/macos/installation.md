# :apple: Windows 安装指南

## :package: 下载安装包

1. :arrow_down: 从 [123 云盘](https://www.123912.com/s/YJhWTd-xa1Wh) 下载最新版本
2. :file_folder: 选择 `macos`文件夹
3. :package: 优先选择`10MB`左右的安装包, 如果安装后界面`无法打开`, 再选择`200MB`的程序安装  
![下载介绍](/assets/guide/macos/macos-download-step1.png)

## :wrench: 安装步骤

1. :mouse2: 双击打开 DMG 文件
2. :arrow_right: 将 Cursor Pool 拖入 Applications 文件夹

## :warning: 常见问题

### MacOS软件已损坏, 移除到废纸篓
<img src="/assets/guide/macos/macos-install-warn1.png" alt="软件已损坏" width="300" height="300"/>

打开`启动台`, 选择`终端`, 输入:
```bash
sudo spctl --master-disable
```
回车运行, 继续输入密码(密码输入时是不可见的), 密码输入完毕后继续回车

如果依旧无法打开 继续在`终端`输入以下命令并执行:
```bash
sudo xattr -r -d com.apple.quarantine /Applications/cursor-pool.app
```