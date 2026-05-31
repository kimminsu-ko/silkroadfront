<script setup>
import PopularPostsSidebar from "@/components/Board/PopularPostsSidebar.vue";
import ReviewDetail from "@/components/Board/ReviewDetail.vue";
import ReviewComments from "@/components/Board/ReviewComments.vue";
import { useRoute } from "vue-router";
import NoticeDropdown from "@/components/Board/NoticeDropdown.vue";
import { computed } from "vue";

const route = useRoute();
const reviewIndex = computed(() => Number(route.params.reviewIndex));
</script>

<template>
  <main class="board-page">
    <section class="board-container">
      <div class="board-notice-row">
        <NoticeDropdown />
      </div>

      <div class="board-content-row">
        <aside class="board-sidebar">
          <PopularPostsSidebar />
        </aside>

        <section class="board-main-list">
          <ReviewDetail :reviewIndex="reviewIndex" :key="reviewIndex" />
          <ReviewComments :reviewIndex="reviewIndex" :key="`comments-${reviewIndex}`" />
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.board-page {
  min-height: calc(100vh - 80px);
  padding: 80px 16px 40px;
  box-sizing: border-box;
  background-color: #fdfcf8;
}

.board-container {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.board-notice-row {
  width: 100%;
}

.board-content-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: flex-start;
}

.board-sidebar {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 96px;
}

.board-main-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 모바일 */
@media (max-width: 900px) {
  .board-content-row {
    flex-direction: column;
    align-items: stretch;
  }

  .board-sidebar {
    position: static;
    width: 100%;
  }
}
</style>
