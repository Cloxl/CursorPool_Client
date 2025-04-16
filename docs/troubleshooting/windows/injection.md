---
title: 注入教程
outline: deep
---

# 注入教程

注入分为`全自动适配`和`手动选择`俩种  
默认情况下,程序会读取系统环境`path`变量或`正在运行的Cursor`进行注入

如果遇到这个弹窗:
![自动注入失败弹窗](/assets/troubleshooting/windows/injection/auto-injection-failed.png)

说明程序无法实现全自动注入 按照以下步骤来操作:

## 打开Cursor(推荐)

关闭`Cursor Pool`的弹窗, 确保`Cursor`软件正在运行, 并重新点击注入

## 手动选择

如果上述方法无法生效, 请手动选择Cursor可执行文件路径

### 找到`Cursor可执行文件`路径

- 如果桌面有`Cursor`快捷方式
    - 右键点击`Cursor`快捷方式(`Windows 11`按`shift`键+`鼠标右键`)
    - 选择`打开文件位置`
    ![打开文件位置](/assets/troubleshooting/windows/injection/windows-inject-cursor-icon-desktop-select.png)
- 如果桌面没有`Cursor`快捷方式
    - 按下`Win`键或者点击`开始菜单`
    - 输入`Cursor`进行搜索
    - 右键点击`Cursor`
    - 选择`打开文件位置`
    ![打开文件位置](/assets/troubleshooting/windows/injection/windows-inject-cursor-icon-menu.png)

如果操作顺利, 您将看见这样的文件夹
![Cursor目录文件夹](/assets/troubleshooting/windows/injection/windows-inject-cursor-exe-find-path.png)

### 手动注入`Cursor`

在`Cursor Pool`中, 点击`选择文件`按钮, 在弹窗中选择`Cursor`可执行文件路径
![点击选择文件按钮](/assets/troubleshooting/windows/injection/windows-inject-cursorpool-click-button.png)

![选择文件](/assets/troubleshooting/windows/injection/windows-inject-cursorpool-select-file.png)


如果选择的cursor路径正确, 您将看见这样的信息, 表示注入成功
![注入成功](/assets/troubleshooting/windows/injection/auto-injection-success.png)
