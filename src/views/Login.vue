<template>
    <div id="login" :class="{ recaptcha: recaptcha }">
      <form @submit="submit">
        <h1>{{ name }}</h1>
        <div v-if="error !== ''" class="wrong">{{ error }}</div>
          <div>
        <input type="radio" name="group1" v-model="rootdir" checked="checked" value="" >D槽目錄
        <textarea cols="50" rows="5" readonly="true">
  　          內容包含：
                ∙ CTBC
                ∙ Incomming
                ∙ Reload
                ∙ backup
                ∙ 驗證PDF
        </textarea>
      </div>
      <div>
        <input type="radio" name="group1" v-model="rootdir" value="G" >G槽目錄
        <textarea cols="50" rows="5" readonly="true">
      　     內容包含：
                ∙ Rawdata
        </textarea>
      </div>
        <input class="input input--block" type="text" v-model="username" :placeholder="$t('login.username')">
        <input class="input input--block" type="password" v-model="password" :placeholder="$t('login.password')">
        <input class="input input--block" v-if="createMode" type="password" v-model="passwordConfirm" :placeholder="$t('login.passwordConfirm')" />
  
        <div v-if="recaptcha" id="recaptcha"></div>
        <input class="button button--block" type="submit" :value="createMode ? $t('login.signup') : $t('login.submit')">
  
        <p @click="toggleMode" v-if="signup">{{ createMode ? $t('login.loginInstead') : $t('login.createAnAccount') }}</p>
      </form>
    </div>
  </template>
  
  <script>
  import * as auth from '@/utils/auth'
  import { name, loginURL, recaptcha, recaptchaKey, signup } from '@/utils/constants'
  
  export default {
    name: 'login',
    computed: {
      signup: () => signup,
      name: () => name,
      loginURL: () => loginURL
    },
    data: function () {
      return {
        createMode: false,
        error: '',
        rootdir: '',
        username: '',
        password: '',
        recaptcha: recaptcha,
        passwordConfirm: ''
      }
    },
    mounted () {
      if (!recaptcha) return
  
      window.grecaptcha.render('recaptcha', {
        sitekey: recaptchaKey
      })
    },
    methods: {
      toggleMode () {
        this.createMode = !this.createMode
      },
      async submit (event) {
        event.preventDefault()
        event.stopPropagation()
  
        let redirect = this.$route.query.redirect
        if (redirect === '' || redirect === undefined || redirect === null) {
          redirect = '/files/'
        }
  
        let captcha = ''
        if (recaptcha) {
          captcha = window.grecaptcha.getResponse()
  
          if (captcha === '') {
            this.error = this.$t('login.wrongCredentials')
            return
          }
        }
  
        if (this.createMode) {
          if (this.password !== this.passwordConfirm) {
            this.error = this.$t('login.passwordsDontMatch')
            return
          }
        }
  
        try {
          if (this.createMode) {
            await auth.signup(this.username, this.password)
          }
  
          console.log(this.username+this.rootdir)
          await auth.login(this.username+this.rootdir, this.password, captcha)
          this.$router.push({ path: redirect })
        } catch (e) {
          if (e.message == 409) {
            this.error = this.$t('login.usernameTaken')
          } else {
            this.error = this.$t('login.wrongCredentials')
          }
        }
      }
    }
  }
  </script>
  