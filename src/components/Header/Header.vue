<script setup>

import LayoutHeader from "@/components/Header/LayoutHeader.vue";
import MobileHeader from "@/components/Header/MobileHeader.vue";
</script>

<template>
  <LayoutHeader class="desktop-header" />
  <MobileHeader class="mobile-header" />

</template>

<style scoped>
@media (max-width: 767px) {
  .desktop-header { display: none; }
}

@media (min-width: 768px) {
  .mobile-header { display: none; }
}
</style>