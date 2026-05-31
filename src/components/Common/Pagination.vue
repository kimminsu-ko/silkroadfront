<template>
  <div class="pagination-container" v-if="totalPages > 0">
    <button class="page-btn" :disabled="currentPage === 1" @click="$emit('changePage', currentPage - 1)">&lt;</button>
    <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
    <button class="page-btn" :disabled="currentPage === totalPages" @click="$emit('changePage', currentPage + 1)">
      &gt;
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

defineEmits(["changePage"]);
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-bottom: 20px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #222;
  background-color: #f7f7f7;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
