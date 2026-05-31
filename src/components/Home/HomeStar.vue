<script setup>
import { Motion } from "motion-v";

const stars = [
  { id: 1, cx: 60, cy: 40, r: 1.6, duration: 2.2, delay: 0 },
  { id: 2, cx: 140, cy: 25, r: 1.2, duration: 2.6, delay: 0.4 },
  { id: 3, cx: 220, cy: 55, r: 1.8, duration: 2.0, delay: 0.8 },
  { id: 4, cx: 320, cy: 30, r: 1.4, duration: 2.8, delay: 1.0 },
  { id: 5, cx: 410, cy: 20, r: 1.9, duration: 2.4, delay: 0.6 },
  { id: 6, cx: 500, cy: 45, r: 1.3, duration: 3.0, delay: 1.2 },
  { id: 7, cx: 540, cy: 70, r: 1.1, duration: 2.1, delay: 1.4 },
  { id: 8, cx: 90, cy: 75, r: 1.3, duration: 2.7, delay: 0.9 },
  { id: 9, cx: 280, cy: 15, r: 1.5, duration: 2.3, delay: 1.1 },
  { id: 10, cx: 450, cy: 60, r: 1.2, duration: 2.9, delay: 1.6 },
  { id: 11, cx: 50, cy: 10, r: 1.2, duration: 2.4, delay: 0.3 },
  { id: 12, cx: 120, cy: 80, r: 1.4, duration: 2.9, delay: 0.7 },
  { id: 13, cx: 200, cy: 35, r: 1.1, duration: 2.2, delay: 1.1 },
  { id: 14, cx: 310, cy: 90, r: 1.3, duration: 2.7, delay: 0.5 },
  { id: 15, cx: 360, cy: 50, r: 1.7, duration: 3.1, delay: 0.9 },
  { id: 16, cx: 430, cy: 85, r: 1.2, duration: 2.5, delay: 1.3 },
  { id: 17, cx: 520, cy: 30, r: 1.5, duration: 2.8, delay: 0.4 },
  { id: 18, cx: 575, cy: 75, r: 1.1, duration: 2.3, delay: 1.0 },
];
/* opacity : 시작할때 투명도
 *  scale : 시작할 때 원래 크기의 어느정도로 시작하는지
 *  Animate 배열 : 시작 -> 중간 -> 끝 순으로 값
 *  duration : 사이클 시간
 * delay : 시작 지연시간
 * */
const starInitial = { opacity: 0, scale: 0.4 };
const starAnimate = { opacity: [0, 1, 0], scale: [0.4, 1.3, 0.8] };
</script>

<template>
  <div class="night-hero">
    <div class="night-hero-inner">
      <svg class="night-svg" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice">
        <!-- 별들 -->
        <Motion
          v-for="star in stars"
          :key="star.id"
          as="circle"
          class="star"
          :cx="star.cx"
          :cy="star.cy"
          :r="star.r"
          :initial="starInitial"
          :animate="starAnimate"
          :transition="{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.5, 1],
            delay: star.delay,
          }"
        />
      </svg>
      <div class="hero-text">
        <h1 class="hero-title">
          <span class="hero-title-desktop">
            {{ $t("hero.title") }}
          </span>
          <span class="hero-title-mobile">
            {{ $t("hero.title") }}
          </span>
        </h1>
        <p class="hero-sub hero-sub-desktop">
          {{ $t("hero.subtitle") }}
        </p>
        <p class="heor-sub hero-sub-mobile">
          {{ $t("hero.subtitle") }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.night-hero {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: clamp(3rem, 6rem, 4.5rem) clamp(1.5rem, 4vw, 3rem);

  /* 땅(아래) → 밤하늘(위) 그라데이션 */
  background: linear-gradient(to bottom, #050814 0%, #060a18 30%, #0b1020 55%, #2c1d14 75%, #f5f2ea 100%);
  overflow: hidden;
}

.night-hero-inner {
  width: min(1100px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100%;
}
.night-svg {
  width: 100%;
  height: auto;
  flex: 1 0 auto;
}
.hero-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 1.5rem;
  padding-bottom: 20vh;
}
.hero-title {
  font-weight: 700;
  color: #f8f3c9;
  margin: 0;
}
.hero-sub {
  margin-top: 0.5rem;
  color: #e6ddc4;
  line-height: 1.5;
}
.hero-title-desktop,
.hero-sub-desktop {
  display: none;
}
.hero-title-mobile,
.hero-sub-mobile {
  display: block;
}

@media (min-width: 768px) and (max-width: 1199px) {
  .night-hero {
    width: 100%;
  }
  .hero-title-desktop,
  .hero-sub-desktop {
    display: block;
  }

  .hero-title-mobile,
  .hero-sub-mobile {
    display: none;
  }

  .hero-title {
    font-size: 6rem;
  }

  .hero-sub {
    font-size: 3rem;
    max-width: 32rem;
  }
}
@media (min-width: 1200px) {
  .hero-title-desktop,
  .hero-sub-desktop {
    display: block;
  }

  .hero-title-mobile,
  .hero-sub-mobile {
    display: none;
  }

  .hero-title {
    font-size: 6rem;
  }
  .hero-sub {
    font-size: 2rem;
  }
}

/* 별 기본 스타일 */
.star {
  fill: #f8f3c9;
  opacity: 0.7;
}
</style>
