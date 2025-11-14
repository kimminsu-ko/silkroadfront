<script setup>

import LayoutHeader from "@/components/LayoutHeader.vue";
</script>

<template>
<div class="app-root">
  <LayoutHeader />
  <main class = "main-layout">

  </main>
</div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  background-color: #e7d6b6;
  color : #4a3a2a;
  font-family: system-ui,-apple-system,BlinkMacSystemFont,'Noto Sans KR',
  sans-serif;
}
.main-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding : 48px 24px 80px;
}
</style>
