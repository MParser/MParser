import { useDark, useToggle } from "@vueuse/core";
import { defineStore } from "pinia";
const themeStore = defineStore("theme", {
  state: () => ({
    isDark: useDark()
  }),
  actions: {
    initTheme() {
      const darkItem = "light"; // 默认为 'light'
      const dark = darkItem === "dark";
      if (dark !== this.isDark.value) {
        useToggle();
      }
    },
    toggleTheme() {
      return useToggle();
    }
  },
  persist: {
    storage: window.localStorage
  }
});

export { themeStore };
