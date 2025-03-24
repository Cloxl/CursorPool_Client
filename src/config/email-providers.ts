/**
 * 邮箱提供商配置
 */
export interface EmailProvider {
  label: string
  domain: string
  color: 'error' | 'success' | 'warning' | 'info' | 'default' | 'primary'
}

export const emailProviders: EmailProvider[] = [
  {
    label: 'Google',
    domain: 'gmail.com',
    color: 'error',
  },
  {
    label: '腾讯',
    domain: 'qq.com',
    color: 'success',
  },
  {
    label: '腾讯',
    domain: 'foxmail.com',
    color: 'success',
  },
  {
    label: '网易',
    domain: '163.com',
    color: 'warning',
  },
  {
    label: '网易',
    domain: '126.com',
    color: 'warning',
  },
  {
    label: 'Microsoft',
    domain: 'outlook.com',
    color: 'info',
  },
  {
    label: 'Microsoft',
    domain: 'hotmail.com',
    color: 'info',
  },
  {
    label: 'Yahoo',
    domain: 'yahoo.com',
    color: 'primary',
  },
  {
    label: '网易',
    domain: 'yeah.net',
    color: 'warning',
  },
  {
    label: '新浪',
    domain: 'sina.com',
    color: 'error',
  },
  {
    label: '新浪',
    domain: 'sina.cn',
    color: 'error',
  },
  {
    label: '新浪',
    domain: '21cn.com',
    color: 'error',
  },
  {
    label: '阿里',
    domain: 'aliyun.com',
    color: 'primary',
  },
  {
    label: '搜狐',
    domain: 'sohu.com',
    color: 'info',
  },
  {
    label: '139',
    domain: '139.com',
    color: 'success',
  },
]

/**
 * 隐藏的域名列表
 */
export const hiddenValidDomains = ['cloxl.com', '52ai.org']
