<template>
  <div class="bottom-timeline" v-if="mapMarkers.length > 0">
    <button class="nav-btn prev" @click="scrollTimeline('left')">‹</button>
    <div class="timeline-scroll-area" ref="timelineScroll" @wheel.prevent="onTimelineWheel">
      <div
        v-for="(marker, index) in mapMarkers"
        :key="marker.id"
        class="timeline-card"
        :class="{ active: selectedPlaceId === marker.id }"
        @click="$emit('focusOnPlace', marker.id)"
      >
        <div class="card-img">
          <img v-if="marker.image" :src="marker.image" @error="marker.image = null" alt="place" />
          <div
            v-else
            class="card-placeholder"
            :style="{ backgroundColor: marker.color ? marker.color + '20' : '#f3f4f6' }"
          >
            <span class="placeholder-icon">{{ marker.icon }}</span>
          </div>
          <div class="card-badge">{{ index + 1 }}</div>
        </div>
        <div class="card-info">
          <span class="card-time" v-if="marker.day">{{ marker.day }}일차</span>
          <h4 class="card-title">{{ marker.title }}</h4>
          <span class="card-cat">{{ marker.category }}</span>
        </div>
      </div>
    </div>
    <button class="nav-btn next" @click="scrollTimeline('right')">›</button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  mapMarkers: {
    type: Array,
    default: () => [],
  },
  selectedPlaceId: {
    type: [Number, String],
    default: null,
  },
});

defineEmits(["focusOnPlace"]);

const timelineScroll = ref(null);

const scrollTimeline = (direction) => {
  if (!timelineScroll.value) return;
  const scrollAmount = 300;
  if (direction === "left") {
    timelineScroll.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    timelineScroll.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
};

const onTimelineWheel = (e) => {
  if (!timelineScroll.value) return;
  timelineScroll.value.scrollLeft += e.deltaY;
};
</script>

<style scoped>
.bottom-timeline {
  position: absolute;
  bottom: 44px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  height: 180px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.timeline-scroll-area {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 4px;
  scroll-behavior: smooth;
  height: 100%;
  align-items: center;
}

.timeline-scroll-area::-webkit-scrollbar {
  height: 6px;
}

.timeline-scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.timeline-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.timeline-card {
  flex: 0 0 280px;
  height: 120px;
  background: white;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.timeline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.timeline-card.active {
  border: 2px solid #4a3a2a;
  background-color: #fffaf0;
}

.card-img {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.card-time {
  font-size: 0.75rem;
  color: #d97706;
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-cat {
  font-size: 0.8rem;
  color: #6b7280;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #4a3a2a;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.nav-btn:hover {
  background: #f9fafb;
  transform: scale(1.05);
}
</style>
