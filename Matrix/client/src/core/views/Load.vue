<template>

  <div class="spinner">
    <div class="outer">
      <div class="inner tl"></div>
      <div class="inner tr"></div>
      <div class="inner br"></div>
      <div class="inner bl"></div>
    </div>
  </div>
  <div class="loading-text">
    <span>L</span>
    <span>o</span>
    <span>a</span>
    <span>d</span>
    <span>i</span>
    <span>n</span>
    <span>g</span>
    <span>.</span>
    <span>.</span>
    <span>.</span>
  </div>
</template>

<style scoped>
.spinner {
  position: absolute;
  width: 128px;
  height: 128px;
  top: calc(50% - 64px);
  left: calc(50% - 64px);
  transform: perspective(206px) rotateX(45deg);
}

.outer {
  box-sizing: border-box;
  animation: spin 3s linear infinite;
  height: 100%;
}

.inner {
  position: absolute;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  animation: spin 1.8s ease-in-out infinite;
}
.inner.tl {
  top: 0;
  left: 0;
  border-top: 2px solid #14534e;
  border-left: 4px solid #14534e;
}
.inner.tr {
  top: 0;
  right: 0;
  border-top: 2px solid #49e0ae;
  border-right: 4px solid #49e0ae;
}
.inner.br {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid #2982e7;
  border-right: 4px solid #2982e7;
}
.inner.bl {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid #47c9dc;
  border-left: 4px solid #47c9dc;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  position: absolute;
  top: calc(50% + 128px);
  left: calc(50% - 48px);
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.loading-text span {
  display: inline-block;
  animation: wave 1.7s infinite ease-in-out;
}

.loading-text span:nth-child(1) { animation-delay: 0.0s; }
.loading-text span:nth-child(2) { animation-delay: 0.1s; }
.loading-text span:nth-child(3) { animation-delay: 0.2s; }
.loading-text span:nth-child(4) { animation-delay: 0.3s; }
.loading-text span:nth-child(5) { animation-delay: 0.4s; }
.loading-text span:nth-child(6) { animation-delay: 0.5s; }
.loading-text span:nth-child(7) { animation-delay: 0.6s; }
.loading-text span:nth-child(8) { animation-delay: 0.7s; }
.loading-text span:nth-child(9) { animation-delay: 0.8s; }
.loading-text span:nth-child(10) { animation-delay: 0.9s; }

@keyframes wave {
  0% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(0);
  }
}
</style>

<script setup lang="ts">

</script>
