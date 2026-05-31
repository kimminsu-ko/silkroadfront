<script setup>
import { ref, onMounted, watch } from "vue";
import { getMyPlans } from "@/api/plan";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "select"]);

const authStore = useAuthStore();
const plans = ref([]);
const isLoading = ref(false);

const fetchPlans = async () => {
  if (!authStore.user) return;
  isLoading.value = true;
  try {
    // MyPlansPage.vue와 동일하게 파라미터 전달
    const res = await getMyPlans({ page: 1, size: 100 });
    if (res.data && res.data.data && res.data.data.plans) {
      plans.value = res.data.data.plans;
    }
  } catch (error) {
    console.error("Failed to fetch plans:", error);
  } finally {
    isLoading.value = false;
  }
};

const selectPlan = (plan) => {
  emit("select", plan);
  emit("close");
};

watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      fetchPlans();
    }
  }
);

onMounted(() => {
  if (props.isVisible) {
    fetchPlans();
  }
});
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>여행 계획 선택</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="isLoading" class="loading">로딩 중...</div>
        <div v-else-if="plans.length === 0" class="empty">
          저장된 여행 계획이 없습니다.
        </div>
        <div v-else class="plan-list">
          <div
            v-for="plan in plans"
            :key="plan.planIndex"
            class="plan-item"
            @click="selectPlan(plan)"
          >
            <div class="plan-info">
              <h3 class="plan-title">{{ plan.name }}</h3>
              <p class="plan-date">{{ plan.startDate }} ~ {{ plan.endDate }}</p>
              <p
                class="plan-regions"
                v-if="plan.regions && plan.regions.length"
              >
                {{ plan.regions.join(", ") }}
              </p>
            </div>
            <button class="select-btn">선택</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-item:hover {
  background-color: #f9f9f9;
  border-color: #ddd;
}

.plan-title {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.plan-date {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: #666;
}

.plan-regions {
  margin: 0;
  font-size: 0.85rem;
  color: #888;
}

.select-btn {
  padding: 8px 16px;
  background-color: #3b2f22;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
