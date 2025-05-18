<script setup lang="ts">
import { useLogin } from './hooks/use-login';

const { push } = useRouter();
const {
  loginFormRef,
  loginForm, rules,
  submitForm
} = useLogin();
</script>

<template>
  <ElForm
      ref="loginFormRef"
      :model="loginForm"
      :rules="rules"
      labelPosition="left"
      labelWidth="48px"
      size="large"
      class="mt-32px"
      @submit.prevent
  >
    <ElFormItem
        label="邮箱"
        prop="email"
        class="form-item"
    >
      <ElInput
          v-model="loginForm.email"
          placeholder="Email"
      />
    </ElFormItem>
    <ElFormItem label="密码" prop="password" class="form-item">
      <ElInput
          v-model="loginForm.password"
          placeholder="Password"
          showPassword
      />
    </ElFormItem>
    <ElFormItem style="padding-left: 39px; margin-top: 32px">
      <ElButton
          type="primary"
          size="large"
          nativeType="submit"
          @click="submitForm(loginFormRef)"
      >
        Login
      </ElButton>
    </ElFormItem>
  </ElForm>

  <ElFooter class="boxFooter">
<!--    <div style="width: 50%; justify-content: center">-->
<!--      <themeOption tipPlacement="top" />-->
<!--    </div>-->
    <div
        style="
            width: 50%;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
          "
    >
      <ElTooltip content="注册" placement="top">
        <ElButton
            link
            type="primary"
            size="large"
            class="text-1em"
            @click="() => push({ name: 'Register' })"
        >Register</ElButton>
      </ElTooltip>
    </div>
  </ElFooter>
</template>

<style lang="scss" scoped>

</style>