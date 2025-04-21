import { defineStore } from "pinia";

const userStore = defineStore("userInfo", {
  state: () => ({
    userInfo: {},
    isLogin: false
  }),
  actions: {
    setLoginState(userInfo) {
      this.userInfo = userInfo;
      this.isLogin = true;
    },
    clearLoginState() {
      this.userInfo = {};
      this.isLogin = false;
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ['userInfo', 'isLogin']
      }
    ]
  }
});

export { userStore };
