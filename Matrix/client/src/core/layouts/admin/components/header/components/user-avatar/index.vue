<script setup lang="ts">
/**
 * 用户头像组件
 * @author Prk<code@imprk.me>
 */

</script>

<template>
    <div>
        <ElPopover
            :width="120"
            trigger="hover"
            placement="bottom-end"
        >
            <template #reference>
                <div class="avatar-box" tabindex="0">
                    <el-avatar class="avatarBtn" :src="avatarSrc">{{
                        userInfo.username.charAt(0).toUpperCase()
                        }}</el-avatar>
                    <el-text type="primary">{{ userInfo.username }}</el-text>
                </div>
            </template>

            <div class="p-4px-0">
                <button class="menu-item" @click="handleCommand('profile')">
                    <el-icon>
                        <component :is="icons['BiSolidUser']" />
                    </el-icon>
                    <span>个人中心</span>
                </button>

                <div class="divider"></div>
                <button class="menu-item" @click="handleCommand('logout')">
                    <el-icon>
                        <component :is="icons['BiSolidLogOut']" />
                    </el-icon>
                    <span>退出</span>
                </button>
            </div>
        </ElPopover>
    </div>
</template>

<style lang="scss" scoped>

</style>
