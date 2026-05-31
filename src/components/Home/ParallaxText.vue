<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { animate } from "motion";

/**
 * props:
 * text: 흘러갈 문구
 * baseVelocity: 기본 이동 속도 +,-로 방향 조절
 * repeat : 문구 반복 횟수 화면 채우기위함
 * */
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  baseVelocity: {
    type: Number,
    //px/sex
    default: 60,
  },
  repeat: {
    type: Number,
    default: 15,
  },
  tone: {
    type: String,
    default: "sane",
  },
  size: {
    type: String,
    default: "md",
  },
});

const scrollerRef = ref(null);

//스크롤 속도 감지용
let lastScrollY = window.scrollY;
let lastTime = performance.now();
const scrollVelocity = ref(0);

//Animation 루프
let rafId = 0;
let lastFrameTime = performance.now();
const baseX = ref(0);
let direction = 1;

//반복 텍스트 배열
const items = computed(() =>
  Array.from(
    {
      length: props.repeat,
    },
    () => props.text
  )
);

//wrap 함수
const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

const updateScrollVelocity = () => {
  const now = performance.now();
  const y = window.scrollY;

  const dt = (now - lastTime) / 1000;
  if (dt > 0) {
    scrollVelocity.value = (y - lastScrollY) / dt; // px/sec
  }

  lastScrollY = y;
  lastTime = now;
};

const loop = (now) => {
  const dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  // 스크롤 방향 따라 텍스트 이동 방향 반전
  if (scrollVelocity.value < 0) direction = -1;
  else if (scrollVelocity.value > 0) direction = 1;

  // 스크롤 속도에 따라 가속 (너무 미쳐날뛰지 않게 clamp)
  const velocityFactor = Math.max(-5, Math.min(5, scrollVelocity.value / 1000)); // 대충 보정
  let moveBy = direction * props.baseVelocity * dt;
  moveBy += direction * moveBy * velocityFactor;

  baseX.value += moveBy;

  // scroller 폭에 맞춰 wrap 하기 위해 실제 width 측정
  const el = scrollerRef.value;
  if (el) {
    const w = el.scrollWidth / 2; // 절반쯤을 루프 구간으로 사용
    const x = wrap(-w, 0, baseX.value);
    el.style.transform = `translate3d(${x}px,0,0)`;
  }

  rafId = requestAnimationFrame(loop);
};

onMounted(() => {
  // 스크롤 이벤트는 velocity만 업데이트
  window.addEventListener("scroll", updateScrollVelocity, { passive: true });

  // 살짝 부드럽게 시작 (선택)
  if (scrollerRef.value) {
    animate(scrollerRef.value, { opacity: [0, 1] }, { duration: 0.25 });
  }

  rafId = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateScrollVelocity);
  cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="parallax" :class="[`tone-${tone}`, `size-${size}`]">
    <div ref="scrollerRef" class="scroller" aria-hidden="true">
      <span v-for="(t, i) in items" :key="i">{{ t }}</span>
    </div>
  </div>
</template>

<style scoped>
.parallax {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  padding: 10px 0; /* 줄 높이 */
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.scroller {
  display: inline-flex;
  gap: 32px;
  white-space: nowrap;
  will-change: transform;

  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* 사이즈 */
.size-sm .scroller {
  font-size: 22px;
}
.size-md .scroller {
  font-size: 30px;
}
.size-lg .scroller {
  font-size: 40px;
}

/* 톤: 배경 구간에 맞춰 색/광택 */
.tone-sand {
  background: rgba(244, 239, 229, 0.55);
  color: #4a3a2a;
}

.tone-navy {
  background: rgba(27, 39, 56, 0.35);
  color: #f3e3c4;
  border-top: 1px solid rgba(243, 227, 196, 0.2);
  border-bottom: 1px solid rgba(243, 227, 196, 0.2);
}

.tone-night {
  background: rgba(15, 15, 15, 0.35);
  color: rgba(243, 227, 196, 0.9);
  border-top: 1px solid rgba(243, 227, 196, 0.16);
  border-bottom: 1px solid rgba(243, 227, 196, 0.16);
}

.parallax span {
  display: inline-block;
}
</style>
