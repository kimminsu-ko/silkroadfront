<template>
  <div class="result-item" @click="$emit('click', place)">
    <div class="result-icon">
      <component :is="place.icon" :size="24" weight="fill" />
    </div>
    <div class="result-info">
      <div class="result-name">{{ place.name }}</div>
      <div class="result-meta">
        <span class="like-count">❤️ {{ place.likeCount }}</span>
        <span class="result-addr">{{ place.address }}</span>
      </div>
    </div>
    <button class="add-btn" :class="{ remove: isInSchedule }" @click.stop="$emit('toggleSchedule', place)">
      {{ isInSchedule ? "-" : "+" }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  place: {
    type: Object,
    required: true,
  },
  isInSchedule: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["click", "toggleSchedule"]);
</script>

<style scoped>
.result-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #f9fafb;
}

.result-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: #4a3a2a;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #111;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.like-count {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 600;
  flex-shrink: 0;
}

.result-addr {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.add-btn {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: none;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background-color: #4a3a2a;
  color: white;
}

.add-btn.remove {
  background-color: #ef4444;
  color: white;
}
</style>
