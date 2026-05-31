<script setup>
import "@/assets/css/main.css"
import Footer from "@/components/Footer/Footer.vue";
import Header from "@/components/Header/Header.vue";
</script>

<template>
<div class="app-root">
  <Header />
  <main class = "main-layout">
    <RouterView />
  </main>
  <Footer />
</div>
</template>

<style>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 메인 영역이 남는 세로 공간을 채우게 */
.main-layout {
  flex: 1 0 auto;
}
</style>
