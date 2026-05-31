<template>
  <div
    class="schedule-item"
    draggable="true"
    @dragstart="$emit('dragstart', index, $event)"
    @dragover.prevent="$emit('dragover', $event)"
    @drop="$emit('drop', index, $event)"
    @dragenter="$emit('dragenter', index)"
    @dragend="$emit('dragend')"
    :class="{
      'drag-over-up': dragOverIndex === index && dragSourceIndex > index,
      'drag-over-down': dragOverIndex === index && dragSourceIndex < index,
    }"
  >
    <div class="drag-handle">⋮⋮</div>
    <div class="schedule-index">{{ index + 1 }}</div>
    <div class="schedule-info">
      <div class="schedule-name">{{ place.name }}</div>
      <div class="schedule-cat">{{ place.category }}</div>
      <input type="text" class="schedule-memo" :placeholder="t('planCreator.memoPlaceholder')" v-model="place.memo" />
    </div>
    <button class="delete-btn" @click="$emit('remove', place.id)">✕</button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  place: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  dragOverIndex: Number,
  dragSourceIndex: Number,
});

defineEmits(["remove", "dragstart", "dragover", "drop", "dragenter", "dragend"]);
</script>

<style scoped>
.schedule-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  gap: 0.75rem;
  transition: all 0.2s;
}

.schedule-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.drag-handle {
  cursor: grab;
  color: #9ca3af;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.drag-handle:active {
  cursor: grabbing;
}

.schedule-index {
  width: 1.5rem;
  height: 1.5rem;
  background-color: #4a3a2a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
}

.schedule-info {
  flex: 1;
  min-width: 0;
}

.schedule-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #111;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-cat {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.schedule-memo {
  width: 100%;
  border: none;
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  color: #4b5563;
}

.schedule-memo:focus {
  outline: none;
  background-color: #e5e7eb;
}

.delete-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
}

.delete-btn:hover {
  color: #ef4444;
}

.schedule-item.drag-over-up {
  border-top: 2px solid #4a3a2a;
  background-color: #f9fafb;
}

.schedule-item.drag-over-down {
  border-bottom: 2px solid #4a3a2a;
  background-color: #f9fafb;
}
</style>
