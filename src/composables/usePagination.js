import { ref, computed } from "vue";

export function usePagination(totalCountRef, pageSize = 10) {
  const currentPage = ref(1);

  const totalPages = computed(() => {
    if (!totalCountRef.value) return 0;
    return Math.ceil(totalCountRef.value / pageSize);
  });

  const setPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      return true;
    }
    return false;
  };

  const resetPage = () => {
    currentPage.value = 1;
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    setPage,
    resetPage,
  };
}
