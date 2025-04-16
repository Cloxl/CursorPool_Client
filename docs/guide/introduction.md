---
title: 功能概览
outline: deep
---

# 功能概览 :swimming_man:

![功能概览](/assets/guide/introduction/intro-guide.png)

快速开始使用Cursor Pool：
- [Windows安装教程](/guide/windows/installation)
- [macOS安装教程](/guide/macos/installation)

::: details 本地账户对话次数介绍 :speech_balloon:
* 云端下发的每个账户拥有50-150次对话额度
* 切换账户时消耗50点卡密额度
* 账户使用限制：每24小时最多50次对话(非固定时间重置)
* 卡密扣除的是保底对话次数，剩余次数可在接下来几天内继续使用
* 历史账户界面可追踪每个账户的使用状态和剩余额度

```mermaid
sequenceDiagram
    participant 用户
    participant Cursor
    participant 额度管理 as 本地Cursor账户对话额度

    Note over 用户,额度管理: 每个账户初始拥有50-150次对话额度

    用户->>Cursor: 发起对话请求

    alt 拥有足够额度
        Cursor-->>用户: 启动AI对话
        Note over 用户,Cursor: 用户提问，AI回答
        
        alt 使用Claude 3.7等高级模型
            Cursor->>额度管理: 扣除2次对话额度
        else 使用普通模型
            Cursor->>额度管理: 扣除1次对话额度
        end
        
        额度管理-->>用户: 更新显示剩余额度
    else 额度不足
        Cursor-->>用户: 提示额度不足
        Note over 用户: 通过Cursor Pool切换新账户
    end

    Note over 用户,额度管理: 每24小时最多使用50次<br>超过限制需等待或换账户<br>账户总额度消耗完毕后无法继续使用
```
:::

::: details 工作原理 :gear:
```mermaid
sequenceDiagram
    participant 用户
    participant 客户端 as Cursor Pool客户端
    participant 服务端 as Cursor Pool服务端
    participant Cursor

    用户->>客户端: 打开Cursor Pool
    客户端->>服务端: 请求Cursor账户
    服务端->>服务端: 协议注册机创建账户
    服务端-->>客户端: 返回可用账户
    客户端->>客户端: 修改本地机器码
    用户->>客户端: 选择账户
    客户端->>Cursor: 启动并注入修改后的机器码
    Cursor-->>用户: 使用选定账户启动
    用户->>Cursor: 使用AI功能
    Cursor->>客户端: 使用情况数据
    客户端->>服务端: 更新使用统计
```
:::
