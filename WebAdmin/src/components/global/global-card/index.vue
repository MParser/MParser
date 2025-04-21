<script setup></script>

<template>
  <div class="global-card">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.global-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 
              0 1px 6px -1px rgba(0, 0, 0, 0.02), 
              0 2px 4px 0 rgba(0, 0, 0, 0.02);
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08), 
                0 2px 16px -2px rgba(0, 0, 0, 0.06), 
                0 4px 12px 0 rgba(0, 0, 0, 0.04);
  }
}
</style>
