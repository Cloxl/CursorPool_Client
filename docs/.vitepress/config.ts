// @ts-ignore
import { defineConfig } from 'vitepress'
import markdownItEmoji from 'markdown-it-emoji'
import { withMermaid } from "vitepress-plugin-mermaid";
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

export default withMermaid(defineConfig({
    lang: 'zh-CN',
    title: 'Cursor Pool 文档',
    description: 'Cursor Pool - 赋能下一代生产力',

    vite: {
        resolve: {
            alias: {
                '@assets': '/assets'
            }
        },
        build: {
            assetsDir: 'assets',
            rollupOptions: {
                output: {
                    assetFileNames: 'assets/[name].[hash][extname]'
                }
            }
        },
    },

    mermaid: {
        theme: 'default',
    },
    lastUpdated: true,
    cleanUrls: true,
    
    themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            { 
                text: '入门指南', 
                link: '/guide/introduction',
                activeMatch: '/guide/'
            },
            { 
                text: '故障排除', 
                link: '/troubleshooting/windows/activation',
                activeMatch: '/troubleshooting/'
            },
            { 
                text: 'Cursor 问题', 
                link: '/cursor-issues/network',
                activeMatch: '/cursor-issues/'
            },
            { 
                text: '常见问题', 
                link: '/faq',
                activeMatch: '/faq'
            }
        ],
        siteTitle: 'Cursor Pool',
        sidebar: [
            {
                text: '入门指南',
                collapsed: false,
                items: [
                    { text: '基础概念', link: '/guide/introduction' },
                    {
                        text: '安装教程',
                        collapsed: true,
                        items: [
                            { text: 'Windows 安装', link: '/guide/windows/installation' },
                            { text: 'macOS 安装', link: '/guide/macos/installation' },
                        ]
                    }
                ]
            },
            {
                text: '故障排除',
                collapsed: false,
                items: [
                    {
                        text: 'Windows',
                        collapsed: true,
                        items: [
                            { text: '注入问题', link: '/troubleshooting/windows/injection' },
                        ]
                    },
                    {
                        text: 'macOS',
                        collapsed: true,
                        items: [
                            { text: '权限问题', link: '/troubleshooting/macos/permissions' },
                        ]
                    }
                ]
            },
            {
                text: 'Cursor 问题',
                collapsed: false,
                items: [
                    { text: '网络连接', link: '/cursor-issues/network' },
                    { text: 'API Key', link: '/cursor-issues/api-key' },
                    { text: 'AI 模型', link: '/cursor-issues/models' },
                    { text: '使用限制', link: '/cursor-issues/limits' },
                ]
            },
            {
                text: '常见问题',
                link: '/faq'
            }
        ],
        editLink: {
            pattern: 'https://github.com/Cloxl/CursorPool_Client/edit/docs/docs/:path',
            text: '在 GitHub 上编辑'
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/Cloxl/CursorPool_Client' }
        ],
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-present'
        },
        lastUpdated: {
            text: '最后更新于',
            formatOptions: {
                dateStyle: 'full',
                timeStyle: 'medium'
            }
        },
        outline: {
            level: [2, 3],
            label: '页面导航'
        }
    },
    markdown: {
        config: (md) => {
            md.use(markdownItEmoji)
            md.use(markdownItAnchor, {
                permalinkSymbol: '#',
                permalinkBefore: true,
                permalinkClass: 'anchor',
                permalinkSpace: true,
                level: [1, 2, 3],
                slugify: (s) => s.toLowerCase().replace(/[\s\(\)]/g, '-')
            })
            md.use(markdownItToc, {
                level: [2, 3],
                containerClass: 'table-of-contents'
            })
        }
    },
    sitemap: {
        hostname: 'https://github.com/Cloxl/CursorPool_Client',
        lastmodDateOnly: false
    }
}))

