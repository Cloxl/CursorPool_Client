<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import {
    NCard,
    NForm,
    NFormItem,
    NInput,
    NButton,
    useMessage,
    NSpace,
    NAutoComplete,
    NTag,
    NModal,
    NTabs,
    NTabPane,
    NInputGroup,
    NSelect,
  } from 'naive-ui'
  import { checkUser, sendCode } from '../api'
  import type { SelectOption } from 'naive-ui'
  import { h } from 'vue'
  import { useI18n } from '../locales'
  import { messages } from '../locales/messages'
  import { addHistoryRecord } from '../utils/history'
  import { useUserStore } from '../stores/user'
  import InboundSelector from './InboundSelector.vue'

  // 定义组件事件
  const emit = defineEmits(['login-success'])

  // 基础状态
  const message = useMessage()
  const { currentLang, t } = useI18n()
  const activeTab = ref('login')
  const userStore = useUserStore()

  // 忘记密码相关状态
  const showForgotPassword = ref(false)
  const forgotPasswordLoading = ref(false)
  const forgotPasswordCodeSending = ref(false)
  const forgotPasswordForm = ref({
    email: '',
    smsCode: '',
    newPassword: '',
    confirmPassword: '',
    showDropdown: false,
  })

  // 邮箱验证正则
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // 邮箱提供商配置
  const emailProviders = [
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

  // 隐藏域名列表
  const hiddenValidDomains = ['cloxl.com', '52ai.org']

  /**
   * 表单状态管理
   */
  const formState = reactive({
    // 登录表单
    login: {
      username: '',
      password: '',
      loading: false,
      error: '',
      showDropdown: false,
    },

    // 注册表单
    register: {
      password: '',
      confirmPassword: '',
      email: '',
      code: '',
      loading: false,
      error: '',
      codeSent: false,
      codeSending: false,
      countdown: 0,
      showDropdown: false,
    },
  })

  // 监听Pinia中的登录错误
  watch(
    () => userStore.loginError,
    (newError) => {
      if (newError) {
        if (activeTab.value === 'login') {
          message.error(newError)
        } else {
          message.error(newError)
        }
      }
    },
  )

  // 计算属性
  const canSendCode = computed(() => {
    return (
      formState.register.email &&
      formState.register.countdown === 0 &&
      !formState.register.codeSending
    )
  })

  const canRegister = computed(() => {
    return (
      formState.register.password &&
      formState.register.confirmPassword &&
      formState.register.email &&
      formState.register.code
    )
  })

  // 计算标题
  const formTitle = computed(() =>
    activeTab.value === 'login'
      ? messages[currentLang.value].login.title
      : messages[currentLang.value].login.registerButton,
  )

  // 渲染邮箱选项标签
  const renderLabel = (option: SelectOption) => {
    const domain = option.value?.toString().split('@')[1]
    const provider = emailProviders.find((p) => p.domain === domain)

    return [
      option.label as string,
      ' ',
      h(
        NTag,
        {
          size: 'small',
          type: (provider?.color || 'default') as
            | 'error'
            | 'success'
            | 'warning'
            | 'info'
            | 'default'
            | 'primary',
        },
        {
          default: () => provider?.label || '邮箱',
        },
      ),
    ]
  }

  // 验证邮箱格式
  function isValidEmail(email: string): boolean {
    if (!emailRegex.test(email)) return false
    const domain = email.split('@')[1]
    return (
      emailProviders.some((provider) => provider.domain === domain) ||
      hiddenValidDomains.includes(domain)
    )
  }

  // 检查邮箱后缀是否有效
  function checkEmailDomain(email: string): 'error' | 'warning' | undefined {
    if (!email) return undefined
    if (!emailRegex.test(email)) return 'error'

    const domain = email.split('@')[1]
    if (
      domain &&
      !emailProviders.some((p) => p.domain === domain) &&
      !hiddenValidDomains.includes(domain)
    ) {
      return 'error'
    }
    return undefined
  }

  // 邮箱自动完成选项公共逻辑
  const getEmailOptions = (inputValue: string) => {
    // Always provide options for debugging (remove in production)
    if (!inputValue) {
      return emailProviders.map((provider) => ({
        label: `@${provider.domain}`,
        value: `@${provider.domain}`,
      }))
    }

    if (isValidEmail(inputValue)) {
      return []
    }

    const atIndex = inputValue.lastIndexOf('@')

    // When there's an @ symbol, show all matching domain options
    if (atIndex !== -1) {
      const username = inputValue.substring(0, atIndex)
      const domainPrefix = inputValue.substring(atIndex + 1).toLowerCase()

      // If just @ with no domain prefix yet, show all providers
      if (domainPrefix === '') {
        return emailProviders.map((provider) => ({
          label: `${username}@${provider.domain}`,
          value: `${username}@${provider.domain}`,
        }))
      }

      // Filter providers based on the entered domain prefix
      return emailProviders
        .filter((provider) => provider.domain.toLowerCase().includes(domainPrefix))
        .map((provider) => ({
          label: `${username}@${provider.domain}`,
          value: `${username}@${provider.domain}`,
        }))
    }

    // When there's no @ symbol, show no options except during debugging
    // This makes testing easier
    return emailProviders.slice(0, 3).map((provider) => ({
      label: `${inputValue}@${provider.domain}`,
      value: `${inputValue}@${provider.domain}`,
    }))
  }

  // 邮箱自动完成选项 - 登录
  const loginEmailOptions = computed(() => {
    const options = getEmailOptions(formState.login.username)
    console.log('Login email options:', options.length, options)
    return options
  })

  // 邮箱自动完成选项 - 注册
  const registerEmailOptions = computed(() => {
    const options = getEmailOptions(formState.register.email)
    console.log('Register email options:', options.length, options)
    return options
  })

  // 登录邮箱状态
  const loginEmailStatus = computed(() => checkEmailDomain(formState.login.username))

  // 注册邮箱状态
  const registerEmailStatus = computed(() => checkEmailDomain(formState.register.email))

  // 忘记密码邮箱选项
  const forgotPasswordEmailOptions = computed(() => {
    return getEmailOptions(forgotPasswordForm.value.email)
  })

  // 忘记密码邮箱状态
  const forgotPasswordEmailStatus = computed(() => checkEmailDomain(forgotPasswordForm.value.email))

  /**
   * 表单验证
   */
  const validators = {
    // 密码验证
    validatePassword(value: string): boolean {
      // eslint-disable-next-line no-useless-escape
      return /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/.test(value)
    },

    // 邮箱验证
    validateEmail(value: string): boolean {
      // eslint-disable-next-line no-useless-escape
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },

    // 验证码验证
    validateCode(value: string): boolean {
      // eslint-disable-next-line no-useless-escape
      return /^\d{6}$/.test(value)
    },
  }

  /**
   * 处理登录
   */
  async function handleLogin() {
    const { username, password } = formState.login

    // 表单验证
    if (!username || !password) {
      message.error('请填写完整的登录信息')
      return
    }

    if (!validators.validateEmail(username)) {
      message.error('邮箱格式不正确')
      return
    }

    if (!validators.validatePassword(password)) {
      message.error('密码格式不正确，请使用6-20位字母、数字或特殊字符')
      return
    }

    try {
      formState.login.loading = true
      formState.login.error = ''

      // 使用Pinia store的login方法
      await userStore.login(username, password, 'web')
      message.success('登录成功')
      addHistoryRecord('登录', `用户 ${username} 登录成功`)
      emit('login-success')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败')
    } finally {
      formState.login.loading = false
    }
  }

  /**
   * 处理发送验证码
   */
  async function handleSendCode(email: string, type: 'register' | 'reset' = 'register') {
    // 邮箱验证
    if (!email) {
      if (type === 'register') {
        message.error('请输入邮箱地址')
      } else {
        message.error('请输入邮箱地址')
      }
      return
    }

    if (!validators.validateEmail(email)) {
      if (type === 'register') {
        message.error('邮箱格式不正确')
      } else {
        message.error('邮箱格式不正确')
      }
      return
    }

    try {
      if (type === 'register') {
        formState.register.codeSending = true
        formState.register.error = ''

        // 检查用户是否已存在
        const result = await checkUser(email)
        if (result.msg === '已存在') {
          message.error('该邮箱已被注册')
          return
        }
      } else {
        forgotPasswordCodeSending.value = true
      }

      // 发送验证码 - 这个API调用保留，因为Pinia store中没有对应的方法
      await sendCode(email, type)
      message.success('验证码已发送')

      if (type === 'register') {
        formState.register.codeSent = true

        // 开始倒计时
        formState.register.countdown = 60
        const timer = setInterval(() => {
          formState.register.countdown--
          if (formState.register.countdown <= 0) {
            clearInterval(timer)
          }
        }, 1000)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '发送验证码失败'
      message.error(errorMsg)
    } finally {
      if (type === 'register') {
        formState.register.codeSending = false
      } else {
        forgotPasswordCodeSending.value = false
      }
    }
  }

  /**
   * 处理注册
   */
  async function handleRegister() {
    const { password, confirmPassword, email, code } = formState.register

    // 表单验证
    if (!password || !confirmPassword || !email || !code) {
      message.error('请填写完整的注册信息')
      return
    }

    if (!validators.validatePassword(password)) {
      message.error('密码格式不正确，请使用6-20位字母、数字或特殊字符')
      return
    }

    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }

    if (!validators.validateEmail(email)) {
      message.error('邮箱格式不正确')
      return
    }

    if (!validators.validateCode(code)) {
      message.error('验证码格式不正确')
      return
    }

    try {
      formState.register.loading = true
      formState.register.error = ''

      // 使用Pinia store的register方法
      const success = await userStore.register(email, code, password, 'web')
      message.success('注册成功')
      addHistoryRecord('注册', `用户 ${email} 注册成功`)

      // 注册成功，如果已登录直接触发登录成功事件
      if (success && userStore.isLoggedIn) {
        emit('login-success')
      } else {
        // 注册成功但未自动登录，切换到登录页
        activeTab.value = 'login'
        formState.login.username = email
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册失败')
    } finally {
      formState.register.loading = false
    }
  }

  /**
   * 处理忘记密码
   */
  async function handleForgotPassword() {
    if (
      !forgotPasswordForm.value.email ||
      !validators.validateEmail(forgotPasswordForm.value.email)
    ) {
      message.error('请输入有效的邮箱地址')
      return
    }

    if (!forgotPasswordForm.value.smsCode) {
      message.error('请输入验证码')
      return
    }

    if (!forgotPasswordForm.value.newPassword) {
      message.error('请输入新密码')
      return
    }

    if (forgotPasswordForm.value.newPassword !== forgotPasswordForm.value.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }

    forgotPasswordLoading.value = true
    try {
      // 使用Pinia store的resetPassword方法
      await userStore.resetPassword(
        forgotPasswordForm.value.email,
        forgotPasswordForm.value.smsCode,
        forgotPasswordForm.value.newPassword,
      )
      message.success('密码重置成功')
      showForgotPassword.value = false
    } catch (error) {
      message.error(error instanceof Error ? error.message : '密码重置失败')
    } finally {
      forgotPasswordLoading.value = false
    }
  }

  // 监听输入并展开下拉列表
  const handleLoginInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value || ''

    if (value.includes('@')) {
      // Force dropdown to show when @ is typed and make sure options are visible
      formState.login.showDropdown = true

      // Generate options immediately for empty domain part
      if (value.endsWith('@')) {
        // Force update after DOM update cycle
        setTimeout(() => {
          formState.login.showDropdown = true
        }, 10)
      }
    }
  }

  const handleRegisterInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value || ''

    if (value.includes('@')) {
      // Force dropdown to show when @ is typed and make sure options are visible
      formState.register.showDropdown = true

      // Generate options immediately for empty domain part
      if (value.endsWith('@')) {
        // Force update after DOM update cycle
        setTimeout(() => {
          formState.register.showDropdown = true
        }, 10)
      }
    }
  }

  const handleForgotPasswordInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value || ''

    if (value.includes('@')) {
      // Force dropdown to show when @ is typed and make sure options are visible
      forgotPasswordForm.value.showDropdown = true

      // Generate options immediately for empty domain part
      if (value.endsWith('@')) {
        // Force update after DOM update cycle
        setTimeout(() => {
          forgotPasswordForm.value.showDropdown = true
        }, 10)
      }
    }
  }
</script>

<template>
  <!-- 添加一个隐藏的假表单来欺骗浏览器的自动填充 -->
  <form style="display: none" aria-hidden="true">
    <input type="text" />
    <input type="email" />
    <input type="password" />
  </form>

  <div class="login-overlay">
    <n-card :title="formTitle" class="login-card">
      <n-tabs v-model:value="activeTab" type="line" animated class="full-width-tabs">
        <!-- 登录标签页 -->
        <n-tab-pane name="login" :tab="messages[currentLang].login.title">
          <n-form class="compact-form">
            <n-form-item>
              <n-select
                v-model:value="formState.login.username"
                :options="loginEmailOptions"
                filterable
                :placeholder="messages[currentLang].login.emailPlaceholder"
                :render-label="renderLabel"
                :status="loginEmailStatus"
                :show="formState.login.showDropdown"
                :filter="(pattern, option) => true"
                @keyup.enter="handleLogin"
                @input="handleLoginInput"
                @focus="handleLoginInput"
                @update:show="
                  (show) => {
                    if (!show) formState.login.showDropdown = false
                  }
                "
              />
            </n-form-item>

            <n-form-item>
              <n-input
                v-model:value="formState.login.password"
                type="password"
                show-password-on="click"
                :placeholder="messages[currentLang].login.passwordPlaceholder"
                maxlength="20"
                @keyup.enter="handleLogin"
              />
            </n-form-item>

            <n-space justify="space-between">
              <n-space align="center">
                <n-button
                  type="primary"
                  block
                  :loading="formState.login.loading"
                  class="login-button"
                  @click="handleLogin"
                >
                  {{ messages[currentLang].login.loginButton }}
                </n-button>
                <inbound-selector compact :show-label="false" />
              </n-space>

              <n-button text @click="showForgotPassword = true">
                {{ t('common.forgotPassword') }}
              </n-button>
            </n-space>
          </n-form>
        </n-tab-pane>

        <!-- 注册标签页 -->
        <n-tab-pane name="register" :tab="messages[currentLang].login.registerButton">
          <n-form class="compact-form">
            <n-form-item>
              <n-select
                v-model:value="formState.register.email"
                :options="registerEmailOptions"
                filterable
                :placeholder="messages[currentLang].login.emailPlaceholder"
                :render-label="renderLabel"
                :status="registerEmailStatus"
                :show="formState.register.showDropdown"
                :filter="(pattern, option) => true"
                @input="handleRegisterInput"
                @focus="handleRegisterInput"
                @update:show="
                  (show) => {
                    if (!show) formState.register.showDropdown = false
                  }
                "
              />
            </n-form-item>

            <n-form-item>
              <n-input-group>
                <n-input
                  v-model:value="formState.register.code"
                  :placeholder="messages[currentLang].login.smsCodePlaceholder"
                />
                <n-button
                  :disabled="!canSendCode || registerEmailStatus === 'error'"
                  :loading="formState.register.codeSending"
                  class="send-code-btn"
                  type="primary"
                  ghost
                  @click="handleSendCode(formState.register.email, 'register')"
                >
                  {{
                    formState.register.countdown > 0
                      ? messages[currentLang].login.resendCode.replace(
                          '{seconds}',
                          formState.register.countdown.toString(),
                        )
                      : messages[currentLang].login.sendCode
                  }}
                </n-button>
              </n-input-group>
            </n-form-item>

            <n-form-item>
              <n-input
                v-model:value="formState.register.password"
                type="password"
                show-password-on="click"
                :placeholder="messages[currentLang].login.passwordPlaceholder"
                maxlength="20"
              />
            </n-form-item>

            <n-form-item>
              <n-input
                v-model:value="formState.register.confirmPassword"
                type="password"
                show-password-on="click"
                placeholder="请再次输入密码"
                maxlength="20"
              />
            </n-form-item>

            <n-button
              type="primary"
              block
              :disabled="!canRegister"
              :loading="formState.register.loading"
              style="margin-top: 8px"
              @click="handleRegister"
            >
              {{ messages[currentLang].login.registerButton }}
            </n-button>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>

  <!-- 忘记密码模态框 -->
  <n-modal v-model:show="showForgotPassword">
    <n-card
      style="width: 400px"
      :title="messages[currentLang].login.loginButton === '登录' ? '重置密码' : 'Reset Password'"
    >
      <n-form class="compact-form">
        <n-form-item :label="messages[currentLang].login.emailPlaceholder">
          <n-select
            v-model:value="forgotPasswordForm.email"
            :options="forgotPasswordEmailOptions"
            filterable
            :placeholder="messages[currentLang].login.emailPlaceholder"
            :render-label="renderLabel"
            :status="forgotPasswordEmailStatus"
            :disabled="forgotPasswordLoading"
            :show="forgotPasswordForm.showDropdown"
            :filter="(pattern, option) => true"
            @input="handleForgotPasswordInput"
            @focus="handleForgotPasswordInput"
            @update:show="
              (show) => {
                if (!show) forgotPasswordForm.showDropdown = false
              }
            "
          />
        </n-form-item>

        <n-form-item :label="messages[currentLang].login.smsCodePlaceholder">
          <n-input-group>
            <n-input
              v-model:value="forgotPasswordForm.smsCode"
              :placeholder="messages[currentLang].login.smsCodePlaceholder"
              :disabled="forgotPasswordLoading"
            />
            <n-button
              :disabled="
                forgotPasswordLoading ||
                !validators.validateEmail(forgotPasswordForm.email) ||
                forgotPasswordEmailStatus === 'error'
              "
              class="send-code-btn"
              type="primary"
              ghost
              :loading="forgotPasswordCodeSending"
              @click="handleSendCode(forgotPasswordForm.email, 'reset')"
            >
              {{ messages[currentLang].login.sendCode }}
            </n-button>
          </n-input-group>
        </n-form-item>

        <n-form-item label="新密码">
          <n-input
            v-model:value="forgotPasswordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            :disabled="forgotPasswordLoading"
          />
        </n-form-item>

        <n-form-item label="确认密码">
          <n-input
            v-model:value="forgotPasswordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            :disabled="forgotPasswordLoading"
          />
        </n-form-item>

        <n-space justify="end">
          <n-button @click="showForgotPassword = false">
            {{ messages[currentLang].login.loginButton === '登录' ? '取消' : 'Cancel' }}
          </n-button>
          <n-button type="primary" :loading="forgotPasswordLoading" @click="handleForgotPassword">
            {{ messages[currentLang].login.loginButton === '登录' ? '重置密码' : 'Reset Password' }}
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </n-modal>
</template>

<style scoped>
  .login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    z-index: 1000;
    user-select: none;
  }

  .login-card {
    width: 360px;
    max-width: 90%;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  /* 处理滚动条 */
  /* :deep(.n-scrollbar) {
    overflow: visible !important;
  }

  :deep(.n-scrollbar-rail) {
    z-index: 10 !important;
  } */

  /* 隐藏外部滚动条，保留内部滚动条 */
  /* :deep(.n-base-select-menu > .n-scrollbar > .n-scrollbar-rail) {
    display: none !important;
  }

  :deep(.n-base-select-menu > .n-scrollbar) {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
    overflow: visible !important;
  }

  :deep(.n-base-select-menu > .n-scrollbar::-webkit-scrollbar) {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  } */

  /* 确保内部滚动条正常可用 */
  /* :deep(.n-base-select-menu-option-wrapper) {
    max-height: 250px !important;
    overflow-y: auto !important;
  } */

  /* 标签页容器样式 */
  .full-width-tabs :deep(.n-tabs-wrapper) {
    display: flex;
    width: 100%;
  }

  /* 标签页包装器样式 */
  .full-width-tabs :deep(.n-tabs-tab-wrapper) {
    flex: 1;
    display: flex;
  }

  /* 标签页样式 */
  .full-width-tabs :deep(.n-tabs-tab) {
    flex: 1;
    display: flex;
    justify-content: center;
    font-size: 16px;
    padding: 0;
    margin: 0;
  }

  /* 激活的标签页样式 */
  .full-width-tabs :deep(.n-tabs-tab--active) {
    font-weight: bold;
  }

  /* 隐藏标签页内的padding元素 */
  .full-width-tabs :deep(.n-tabs-tab-pad) {
    display: none !important;
    width: 0 !important;
  }

  /* 标签页下划线样式 */
  .full-width-tabs :deep(.n-tabs-bar) {
    width: 50% !important;
    transition: transform 0.3s var(--n-bezier);
  }

  /* 缩小输入框间距 */
  .compact-form :deep(.n-form-item) {
    margin-bottom: 5px;
  }

  .compact-form :deep(.n-form-item:last-child) {
    margin-bottom: 0;
  }

  /* 发送验证码按钮样式 */
  .send-code-btn {
    min-width: 100px;
    font-size: 13px;
    padding: 0 8px;
  }
</style>
