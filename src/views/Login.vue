<template>
<div id="login" :class="{ recaptcha: recaptcha.length > 0 }">
  <div>
    <form class="loginAsAdmin" @submit="loginAsAdmin">
      <input type="submit" :value="$t('login.submit')">
    </form>
    <form class="loginAsUser" @submit="loginAsUser">
      <input type="submit" :value="$t('login.submitD')">
    </form>
  </div>
</div>
</template>

<script>
import * as auth from '@/utils/auth'
import { name, logoURL, recaptcha, recaptchaKey, signup } from '@/utils/constants'

export default {
  name: 'login',
  computed: {
    signup: () => signup,
    name: () => name,
    logoURL: () => logoURL
  },
  data: function () {
    return {
      createMode: false,
      error: '',
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
    loginAsAdmin (event) {
      this.username = 'admin'
      this.password = 'admin'
      this.submit(event)
    },
    loginAsUser (event) {
      this.username = 'user1'
      this.password = 'user1'
      this.submit(event)
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

        await auth.login(this.username, this.password, captcha)
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
