<template>
  <div v-if="isVisible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ $t('planCreator.createPlanModal.title') }}</h2>
        <button class="close-btn" @click="close" :aria-label="$t('planCreator.createPlanModal.close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="selection-controls">
          <button class="control-btn" @click="selectAll"> {{ $t('planCreator.createPlanModal.selectAll') }}</button>
          <button class="control-btn" @click="deselectAll"> {{ $t('planCreator.createPlanModal.deselectAll') }}</button>
        </div>

        <div class="places-list">
          <div
            v-for="(place, index) in places"
            :key="index"
            class="place-item"
            :class="{ selected: isSelected(place) }"
            @click="toggleSelection(place)"
          >
            <div class="checkbox-wrapper">
              <input type="checkbox" :checked="isSelected(place)" @click.stop="toggleSelection(place)" />
            </div>
            <div class="place-info">
              <div class="place-header">
                <span class="day-badge" v-if="place.day">{{ place.day }}{{ $t('planCreator.createPlanModal.daySuffix') }}</span>
                <span class="place-name">{{ place.name }}</span>
                <span class="place-category">{{ place.category }}</span>
              </div>
              <div class="place-address">{{ place.address }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="create-btn" @click="createPlan" :disabled="selectedPlaces.length === 0">
          {{ $t('planCreator.createPlanModal.createWithSelected') }} ({{ selectedPlaces.length }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import {useI18n} from "vue-i18n";

const props = defineProps({
  isVisible: Boolean,
  places: {
    type: Array,
    default: () => [],
  },
});

const {t} = useI18n();
const emit = defineEmits(["close", "create"]);

const selectedPlaces = ref([]);

watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      // 모달이 열릴 때 기본적으로 모든 장소 선택
      selectedPlaces.value = [...props.places];
    } else {
      selectedPlaces.value = [];
    }
  }
);

const close = () => {
  emit("close");
};

const isSelected = (place) => {
  return selectedPlaces.value.some((p) => p.name === place.name && p.address === place.address);
};

const toggleSelection = (place) => {
  if (isSelected(place)) {
    selectedPlaces.value = selectedPlaces.value.filter((p) => !(p.name === place.name && p.address === place.address));
  } else {
    selectedPlaces.value.push(place);
  }
};

const selectAll = () => {
  selectedPlaces.value = [...props.places];
};

const deselectAll = () => {
  selectedPlaces.value = [];
};

const createPlan = () => {
  emit("create", selectedPlaces.value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.selection-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.control-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background-color: #e9ecef;
}

.places-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.place-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.place-item:hover {
  background-color: #f8f9fa;
}

.place-item.selected {
  border-color: #4a3a2a;
  background-color: #fdfbf7;
}

.checkbox-wrapper {
  margin-right: 12px;
  padding-top: 2px;
}

.place-info {
  flex: 1;
}

.place-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}

.day-badge {
  background-color: #4a3a2a;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.place-name {
  font-weight: bold;
  color: #333;
}

.place-category {
  font-size: 0.8rem;
  color: #888;
  background-color: #f1f1f1;
  padding: 2px 6px;
  border-radius: 4px;
}

.place-address {
  font-size: 0.85rem;
  color: #666;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.create-btn {
  width: 100%;
  padding: 12px;
  background-color: #4a3a2a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: #3a2d21;
}

.create-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
