<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue'
  import { NModal, NSpace, NButton, NScrollbar } from 'naive-ui'
  import { useArticleStore } from '../stores/article'
  import { useTheme } from '../composables/theme'
  import type { Article } from '../api/types'

  // 获取主题变量和当前主题
  const { isDarkMode } = useTheme()

  // 初始化store
  const articleStore = useArticleStore()
  const showModal = ref(false)
  const currentArticle = ref<Article | null>(null)
  const readyToShow = ref(false) // 添加标志，表示已准备好显示公告

  // HTML实体解码函数
  function decodeHtmlEntities(text: string): string {
    const textArea = document.createElement('textarea')
    textArea.innerHTML = text
    return textArea.value
  }

  // 在内容中注入样式以确保链接颜色正确
  const processedContent = computed(() => {
    if (!currentArticle.value) return ''
    let content = decodeHtmlEntities(currentArticle.value.content)

    // 仅在暗色模式下修改链接样式
    if (isDarkMode.value) {
      // 使用DOM解析和处理HTML内容，以便直接修改链接样式
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content

      // 查找所有链接并添加内联样式
      const links = tempDiv.querySelectorAll('a')
      links.forEach((link) => {
        link.style.color = '#63e2b7'
        link.style.fontWeight = '500'
        link.style.textDecoration = 'none'
      })

      content = tempDiv.innerHTML
    }

    return content
  })

  // 在组件挂载时获取公告
  onMounted(async () => {
    await articleStore.init()

    // 添加更长的延迟确保已读状态已完全加载
    setTimeout(() => {
      readyToShow.value = true
      checkAndShowUnreadArticle()
    }, 1000)
  })

  // 显示公告详情
  function viewArticle(article: Article) {
    if (!readyToShow.value) return // 如果未准备好，不显示公告

    // 再次检查文章是否确实未读
    if (articleStore.isRead(article.id)) {
      return
    }
    currentArticle.value = article

    showModal.value = true
  }

  // 检查并显示未读公告
  function checkAndShowUnreadArticle() {
    if (!articleStore.articles.length || !readyToShow.value) return

    // 获取所有未读公告
    const unreadArticles = articleStore.articles.filter(
      (article) => !articleStore.isRead(article.id),
    )

    if (unreadArticles.length === 0) return

    // 按ID降序排序，优先显示ID最大的公告
    const sortedArticles = [...unreadArticles].sort((a, b) => b.id - a.id)
    const latestArticle = sortedArticles[0]

    // 显示ID最大的公告
    viewArticle(latestArticle)

    // 将其他未读公告标记为已读（但不包括当前正在显示的）
    if (sortedArticles.length > 1) {
      setTimeout(async () => {
        // 除了第一个（最新的公告）外，将其他所有公告标记为已读
        for (let i = 1; i < sortedArticles.length; i++) {
          await articleStore.markAsRead(sortedArticles[i].id)
        }
      }, 1000)
    }
  }

  // 用户点击已读按钮
  async function markAsRead() {
    if (currentArticle.value) {
      const articleId = currentArticle.value.id

      await articleStore.markAsRead(articleId)
      showModal.value = false
      currentArticle.value = null

      // 延迟一段时间后检查是否还有其他未读公告
      setTimeout(() => {
        // 重新获取所有未读公告
        const remainingUnread = articleStore.articles.filter(
          (article) => !articleStore.isRead(article.id),
        )

        // 如果还有未读公告，按ID降序排序，显示ID最大的
        if (remainingUnread.length > 0) {
          const sortedRemaining = [...remainingUnread].sort((a, b) => b.id - a.id)
          viewArticle(sortedRemaining[0])

          // 标记其他公告为已读
          if (sortedRemaining.length > 1) {
            setTimeout(async () => {
              for (let i = 1; i < sortedRemaining.length; i++) {
                await articleStore.markAsRead(sortedRemaining[i].id)
              }
            }, 500)
          }
        }
      }, 1000)
    }
  }

  // 监听文章变化，当有新公告时检查是否需要显示
  watch(
    () => articleStore.articles,
    (newArticles) => {
      if (newArticles.length && !showModal.value && readyToShow.value) {
        setTimeout(() => {
          checkAndShowUnreadArticle()
        }, 500)
      }
    },
    { deep: true },
  )

  // 监听已读状态变化
  watch(
    () => articleStore.readArticleIds,
    () => {},
    { deep: true },
  )
</script>

<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="currentArticle?.title || '系统公告'"
    class="w-600px max-w-90vw"
    :mask-closable="false"
  >
    <n-scrollbar class="max-h-60vh">
      <div
        v-if="currentArticle"
        class="p-4 leading-normal article-content"
        :class="isDarkMode ? 'article-dark' : 'article-light'"
        v-html="processedContent"
      ></div>
    </n-scrollbar>
    <template #footer>
      <n-space justify="end">
        <n-button type="primary" @click="markAsRead">已读</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style>
  /* 浅色主题样式 */
  .article-light :deep(h1),
  .article-light :deep(h2),
  .article-light :deep(h3) {
    @apply mt-4 mb-2 text-[#333] font-bold;
  }

  .article-light :deep(p) {
    @apply my-4 text-[#555];
  }

  .article-light :deep(a) {
    @apply text-[#2080f0] no-underline hover:underline;
  }

  .article-light :deep(ul),
  .article-light :deep(ol) {
    @apply pl-6 my-4;
  }

  .article-light :deep(li) {
    @apply my-2;
  }

  .article-light :deep(img) {
    @apply max-w-full h-auto rounded;
  }

  /* 暗色主题样式 */
  .article-dark :deep(.n-card) {
    @apply bg-[#1e1e1e];
  }

  .article-dark :deep(.n-card-header__main) {
    @apply text-white font-bold;
  }

  .article-dark :deep(h1),
  .article-dark :deep(h2),
  .article-dark :deep(h3) {
    @apply mt-4 mb-2 text-white font-bold;
  }

  .article-dark :deep(p) {
    @apply my-4 text-[#e6e6e6];
  }

  /* 增强链接样式 */
  .article-dark :deep(a),
  .article-dark :deep(a:link),
  .article-dark :deep(a:visited) {
    color: #63e2b7 !important;
    font-weight: 500 !important;
    text-decoration: none !important;
  }

  .article-dark :deep(a:hover) {
    text-decoration: underline !important;
    color: #7aefc7 !important;
  }

  .article-content.article-dark a {
    color: #63e2b7 !important;
  }

  .article-dark :deep(ul),
  .article-dark :deep(ol) {
    @apply pl-6 my-4 text-[#e6e6e6];
  }

  .article-dark :deep(li) {
    @apply my-2 text-[#e6e6e6];
  }

  .article-dark :deep(code) {
    @apply bg-[#2c2c2c] text-[#63e2b7] px-1 py-0.5 rounded font-mono;
  }

  .article-dark :deep(pre) {
    @apply bg-[#2c2c2c] p-3 rounded overflow-x-auto;
  }

  .article-dark :deep(hr) {
    @apply border-t border-[#444] my-4;
  }

  .article-dark :deep(blockquote) {
    @apply border-l-4 border-[#63e2b7] pl-4 my-4 text-[#e0e0e0] bg-[rgba(99,226,183,0.1)] p-2;
  }
</style>
