<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { motion, AnimatePresence } from 'motion-v'

const props = defineProps({
  region: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})

/**
 * 각 지역별 이미지 모음
 * import.meta.glob는 문자열 리터럴이어야 해서 여기서 다 선언해둔 다음
 * region에 따라 골라 씀
 */
const busanModules = import.meta.glob(
  '@/assets/BusanTrail/*.jpg',
  {
    eager: true,
    import: 'default',
    query: '?url',
  }
)
const californiaModules = import.meta.glob(
  '@/assets/CaliforniaTrail/*.jpg',
  {
    eager: true,
    import: 'default',
    query: '?url',
  }
)
const tokyoModules = import.meta.glob(
  '@/assets/TokyoTrail/*.jpg',
  {
    eager: true,
    import: 'default',
    query: '?url',
  }
)

const IMAGE_MAP = {
  busan: Object.values(busanModules),
  california: Object.values(californiaModules),
  tokyo: Object.values(tokyoModules),
}

const imageList = computed(() => IMAGE_MAP[props.region] ?? [])

const trail = ref([])
const lastPos = ref(null)
const idCounter = ref(0)

const SPAWN_DISTANCE = 110 // px
const MAX_ITEMS = 30
const LIFETIME = 1500 // ms

const trailAreaRef = ref(null)
const titleRef = ref(null)

const isAutoTrail = ref(false)
let autoTimer = null

function spawnItem(x, y) {
  const list = imageList.value
  if (list.length === 0) return

  const id = idCounter.value++
  const idx = id % list.length
  const src = list[idx]

  const item = {
    id,
    x,
    y,
    scale: 0.7 + Math.random() * 0.7,
    rotate: -25 + Math.random() * 50,
    src,
  }

  trail.value.push(item)

  if (trail.value.length > MAX_ITEMS) {
    trail.value.splice(0, trail.value.length - MAX_ITEMS)
  }

  window.setTimeout(() => {
    trail.value = trail.value.filter((p) => p.id !== id)
  }, LIFETIME)
}

function handlePointerMove(e) {
  // 모바일 자동 트레일 모드일 때는 pointermove로는 스폰하지 않음
  if (isAutoTrail.value) return

  const el = trailAreaRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()

  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (!lastPos.value) {
    lastPos.value = { x, y }
    spawnItem(x, y)
    return
  }

  const dx = x - lastPos.value.x
  const dy = y - lastPos.value.y
  const dist = Math.hypot(dx, dy)

  if (dist >= SPAWN_DISTANCE) {
    spawnItem(x, y)
    lastPos.value = { x, y }
  }
}

onMounted(() => {
  let isCoarse = false

  if (typeof window !== 'undefined' && window.matchMedia) {
    try {
      isCoarse = window.matchMedia('(pointer: coarse)').matches
    } catch (e) {
      isCoarse = false
    }
  }

  // 모바일 판정: 터치 기반 AND 화면 폭이 좁은 경우에만 자동 스폰
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth <= 900 : false
  isAutoTrail.value = isCoarse && isSmallScreen

  if (isAutoTrail.value) {
    autoTimer = window.setInterval(() => {
      const areaEl = trailAreaRef.value
      const titleEl = titleRef.value
      if (!areaEl || !titleEl) return

      const areaRect = areaEl.getBoundingClientRect()
      const titleRect = titleEl.getBoundingClientRect()

      if (areaRect.width <= 0 || areaRect.height <= 0) return

      // 타이틀 중심 좌표를 trail-area 기준으로 변환
      const centerX = titleRect.left + titleRect.width / 2 - areaRect.left
      const centerY = titleRect.top + titleRect.height / 2 - areaRect.top

      // 타이틀 주변으로 뿌릴 범위 (조정 가능)
      const radiusX = titleRect.width * 1.2
      const radiusY = titleRect.height * 3

      const offsetX = (Math.random() - 0.5) * 2 * radiusX
      const offsetY = (Math.random() - 0.5) * 2 * radiusY

      let x = centerX + offsetX
      let y = centerY + offsetY

      // trail-area 영역 안으로 좌표 클램프
      x = Math.max(0, Math.min(areaRect.width, x))
      y = Math.max(0, Math.min(areaRect.height, y))

      spawnItem(x, y)
    }, 100) // 자동 스폰 간격
  }
})

onBeforeUnmount(() => {
  trail.value = []
  if (autoTimer !== null) {
    clearInterval(autoTimer)
    autoTimer = null
  }
})
</script>

<template>
  <div
      ref="trailAreaRef"
      class="trail-area"
      @pointermove="handlePointerMove"
  >
    <div class="cursor-trail-layer">
      <AnimatePresence>
        <motion.img
            v-for="item in trail"
            :key="item.id"
            class="cursor-img"
            :src="item.src"
            :style="{ left: item.x + 'px', top: item.y + 'px' }"
            :initial="{
            scale: 0,
            opacity: 0,
            rotateZ: item.rotate * 1.6,
          }"
            :animate="{
            scale: item.scale,
            opacity: 1,
            rotateZ: item.rotate,
          }"
            :exit="{
            scale: 0.3,
            opacity: 0,
            rotateZ: item.rotate + 20,
          }"
            :transition="{
            duration: 0.25,
            ease: 'easeOut',
          }"
        />
      </AnimatePresence>
    </div>

    <div class="content">
      <h2 ref="titleRef">{{ title }}</h2>
    </div>
  </div>
</template>

<style scoped>
.trail-area {
  position: relative;
  width: 100%;
  height: 90vh;
  min-height: 60vh;
  overflow: hidden;
  display: block;
}

.cursor-trail-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.content {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  font-size: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.cursor-img {
  position: absolute;
  min-width: 120px;
  width: 180px;
  height: auto;
  object-fit: contain;
  transform: translate(-50%, -50%);
  pointer-events: none;
  will-change: transform, opacity;
}
@media (max-width: 640px) {
  .trail-area {
    height: 60vh;
    min-height: 40vh;
  }
}
</style>