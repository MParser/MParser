import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<User | null>(null);

    const hasLogin = computed<boolean>({
        get: (): boolean => {
            return !!userInfo.value && 0 < userInfo.value.id;
        },
        set: (): void => void 0
    });

    const setUser = (user: User): void => {
        userInfo.value = user;
    };

    return {
        userInfo, hasLogin, setUser
    };
}, {
    persist: true
});
