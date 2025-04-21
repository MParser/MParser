import { defineStore } from "pinia";

const collapseStore = defineStore("collapse", {
  state: () => ({
    isCollapse: false
  }),
  actions: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    }
  },
  persist: {
    storage: window.localStorage
  }
});

export { collapseStore };