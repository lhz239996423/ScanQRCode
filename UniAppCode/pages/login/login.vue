<template>
  <div class="login">
    <h2>确认登录吗</h2>
    <h2 v-if="loginSuccess">登录成功</h2>
    <button type="primary" @click="submitLogin">确 认</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        uuid: "",
        loginSuccess: false
      }
    },
    onLoad(option) {
      this.uuid = option.uuid;
    },
    methods: {
      submitLogin() {
        uni.request({
          url: `${this.$config.baseUrl}/login`,
          method: 'GET',
          data: {
            uuid: this.uuid,
            uid: uni.getStorageSync('userinfo').id
          },
          success: (res) => {
            if (res.data.status == 404) {
              uni.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              });
            } else {
              uni.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 3000
              });
              this.loginSuccess = true
            }
            console.log("res ------: ", JSON.stringify(res));
          }
        });
      }
    }
  }
</script>

<style scoped>
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20% 0;
    text-align: center;
    flex-direction: column;
  }
  h2 {
    margin-bottom: 20px;
  }
</style>
