<script setup lang="ts">
import { ref } from 'vue'
import California from "@/components/Home/ImgFlowVue/California.vue";
import Tokyo from "@/components/Home/ImgFlowVue/Tokyo.vue";
import Busan from "@/components/Home/ImgFlowVue/Busan.vue";
import ParallaxText from "@/components/Home/ParallaxText.vue";

</script>

<template>
  <div class="travel-flow">
    <ParallaxText
        text="California"
        :baseVelocity="80"
        tone="sand"
        size="md"
    />
    <ParallaxText
        text="California"
        :baseVelocity="-80"
        tone="sand"
        size="md"
    />
    <section class="region region-california">
      <California />
    </section>
    <ParallaxText
        text="busan"
        :baseVelocity="80"
        tone="sand"
        size="md"
    />
    <ParallaxText
        text="busan"
        :baseVelocity="-80"
        tone="sand"
        size="md"
    />
    <section class="region region-busan">
      <Busan />
    </section>
    <ParallaxText
        text="tokyo"
        :baseVelocity="80"
        tone="night"
        size="md"
    />
    <ParallaxText
        text="tokyo"
        :baseVelocity="-80"
        tone="night"
        size="md"
    />
    <section class="region region-tokyo">
      <Tokyo />
    </section>
  </div>

</template>

<style scoped>
.divider-california {
  height: 15vh;

}
.divider-busan {
  height: 15vh;

}
.divider-tokyo {
  height: 15vh;

}

.travel-flow {
  width: 100%;
  overflow-x: hidden;
  background: linear-gradient(
      to bottom,
      #f4efe5 0%,
      #f4efe5 20%,
      #eee6d7 30%,   /* f4efe5 -> eadfcc 사이 중간 톤 */
      #eadfcc 40%,
      #d2bfa1 52%,   /* 사막 모래 톤 */
      #b59d7c 60%,   /* 딥 사막 톤 */
      #1b2738 70%,
      #131720 85%,   /* 1b2738 -> 0f0f0f 사이 중간 톤 */
      #0f0f0f 100%
  );
}
.region {
  position: relative;
  overflow: hidden;
  margin : 0;
}
.region::before,
.region::after {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 10vh; /* 0vh -> 10vh 정도 */
  pointer-events: none;
  z-index: 2;

  /* 블러 + 페이드용 기본 세팅 */
  backdrop-filter: blur(10px);
}
/* 위쪽 페이드 */
.region::before {
  top: 0;
  mask-image: linear-gradient(to bottom, black 0%, transparent 100%);

}

/* 아래쪽 페이드 */
.region::after {
  bottom: 0;
  mask-image: linear-gradient(to top, black 0%, transparent 100%);

}
</style>
