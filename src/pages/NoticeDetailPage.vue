<script setup>
import { useRoute } from "vue-router";
import { ref, watch } from "vue";
import NoticeDropdown from "@/components/Board/NoticeDropdown.vue";
import PopularPostsSidebar from "@/components/Board/PopularPostsSidebar.vue";
import NoticeDetail from "@/components/Board/NoticeDetail.vue";

const route = useRoute();
const noticeIndex = ref(Number(route.params.noticeIndex));

watch(
  () => route.params.noticeIndex,
  (newIndex) => {
    noticeIndex.value = Number(newIndex); // noticeIndex를 새 값으로 업데이트
  }
);
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
          <NoticeDetail :noticeIndex="noticeIndex" :key="noticeIndex" />
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Board 레이아웃은 위 ReviewDetailPage와 동일하게 맞춰도 됨 */
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
