<template>
  <div class="plan-detail-page">
    <div class="navigation-header">
      <button @click="goBack" class="back-btn">← 내 플랜 리스트로</button>
    </div>
    <div class="page-container">
      <PlanViewer :planId="planId" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import PlanViewer from "@/components/Plan/PlanViewer.vue";

const route = useRoute();
const router = useRouter();
const planId = computed(() => route.params.id);

const goBack = () => {
  router.push("/my-plans");
};
</script>

<style scoped>
.plan-detail-page {
  min-height: calc(100vh - 5rem);
  background-color: #ffffff;
  padding: 2rem;
  box-sizing: border-box;
}

.navigation-header {
  max-width: 1600px;
  margin: 0 auto 1rem auto;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #4a3a2a;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.back-btn:hover {
  background-color: rgba(74, 58, 42, 0.1);
}

.page-container {
  width: 100%;
  height: calc(100vh - 9rem); /* 5rem header + 4rem padding */
  max-width: 1600px;
  margin: 0 auto;
  background-color: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}
</style>
