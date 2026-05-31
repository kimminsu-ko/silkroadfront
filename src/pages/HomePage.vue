<script setup>
import HomeStar from "@/components/Home/HomeStar.vue";
import HomeIntro from "@/components/Home/HomeIntro.vue";
import CursorTrailTest from "@/components/Home/CursorTrailTest.vue";
</script>

<template>
  <div class="home-container">
    <!-- Sticky Hero Section -->
    <div class="sticky-hero">
      <HomeStar />
    </div>

    <!-- Content Layer (Scrolls over the hero) -->
    <div class="content-layer">
      <HomeIntro />
      <CursorTrailTest />
    </div>
  </div>
</template>

<style scoped>
.home-container {
  position: relative;
  width: 100%;
}

.sticky-hero {
  position: sticky;
  top: 0;
  z-index: 0;
  width: 100%;
  height: 100vh; /* Force full height for the sticky effect */
  overflow: hidden;
}

.content-layer {
  position: relative;
  z-index: 10;
  background-color: #fdfcf8; /* Warm white to cover the hero */
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05); /* Subtle shadow for depth */
  min-height: 100vh;
}
</style>
