<script setup>
import NoticeDropdown from '@/components/Board/NoticeDropdown.vue';
import PopularPostsSidebar from '@/components/Board/PopularPostsSidebar.vue';
import PostList from '@/components/Board/PostList.vue';
import WriteIcon from '@/assets/svg/WriteIcon.vue';
import BoardPagination from "@/components/Board/BoardPagination.vue";

import {useRouter, useRoute} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";
import { ref, onMounted} from "vue";
import { fetchReviews} from "@/api/posts.js";
import {useI18n} from "vue-i18n";


const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const loading = ref(false);
const errorMsg = ref('');
const {t} = useI18n();

//게시글 페이지
const parsePage = (q) => {
  const n = Number(q);
  return Number.isInteger(n) && n > 0 ? n : 1;
};

const page = ref(parsePage(route.query.page));
const size = ref(10);
const posts = ref([]);
const totalPages = ref(1);
const totalCount = ref(0);


const load = async () => {
  try {
    loading.value = true;
    errorMsg.value = '';

    const res = await fetchReviews(page.value, size.value);
    const data = res.data?.data;

    posts.value = data.reviews ?? [];
    totalPages.value = data.totalPages ?? 1;
    totalCount.value = data.totalCount ?? 0;
  } catch (e) {
    console.error(e);
    errorMsg.value = t("board.loadFail");
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const changePage = async (p) => {
  if (!Number.isInteger(p) || p < 1 || p > totalPages.value) return;

  page.value = p;
  await router.replace({
    query: { ...route.query, page: String(p) },
  });
  await load();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

//글작성 핸들러
const handleWrite = ()=>{
  if(!auth.user){
    alert(t("board.loginRequired"))
    router.push({
      path: '/login',
      query:{
        redirect: '/review/write',
      },
    });
    return;
  }
  router.push('/review/write');
}

</script>

<template>
  <main class="board-page">
    <section class="board-container">
      <!-- 상단 공지 드롭다운 -->
      <div class="board-notice-row">
        <NoticeDropdown />
      </div>

      <!-- 아래: 왼쪽 인기글 / 오른쪽 게시판 -->
      <div class="board-content-row">
        <!-- 왼쪽: 인기 글 -->
        <aside class="board-sidebar">
          <PopularPostsSidebar />
        </aside>

        <!-- 오른쪽: 게시글 목록 -->
        <section class="board-main-list">
          <header class="board-main-header">
            <div class="board-main-title">
              <h1>{{ t("board.title") }}</h1>
              <p class="board-main-sub">
                {{ t("board.subtitle") }}
              </p>
            </div>

            <button
                type="button"
                class="write-btn"
                @click="handleWrite"
                aria-label="글쓰기"
            >
              <WriteIcon class="write-icon" />
              <span class="write-text">{{ t("board.write") }}</span>
            </button>
          </header>

          <!-- 게시글 목록 컴포넌트 -->
          <PostList
              :posts="posts"
              :loading="loading"
              :errorMsg="errorMsg"
          />

          <BoardPagination
              :page="page"
              :totalPages="totalPages"
              @change="changePage"
          />
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.board-page {
  min-height: calc(100vh - 60px);
  padding: 40px 20px 80px;
  background-color: #fdfcf8; /* Warm light beige */
  box-sizing: border-box;
}

.board-container {
  max-width: 1024px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 공지 영역 */
.board-notice-row {
  width: 100%;
}

/* 본문 레이아웃 */
.board-content-row {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* 왼쪽: 인기글 사이드바 */
.board-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
}

/* 오른쪽: 메인 피드 */
.board-main-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.board-main-header {
  padding-left: 0.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.board-main-title {
  min-width: 0;
}
.board-main-header h1 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: #3b2f22; /* Dark Brown */
}

.board-main-sub {
  margin: 0;
  font-size: 15px;
  color: #7a6b5a; /* Muted Brown */
}

/* 글쓰기 버튼 */
.write-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(59, 47, 34, 0.18);
  background: rgba(255, 255, 255, 0.92);
  color: #3b2f22;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.write-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.write-btn:hover {
  transform: translateY(-1px);
  background: #ffffff;
  border-color: rgba(59, 47, 34, 0.28);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.write-btn:active {
  transform: translateY(0);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.write-btn:focus-visible {
  outline: 3px solid rgba(231, 214, 182, 0.9);
  outline-offset: 2px;
}


/* 모바일 반응형 */
@media (max-width: 900px) {
  .board-content-row {
    flex-direction: column;
  }

  .board-sidebar {
    width: 100%;
    position: static;
    order: -1;
    margin-bottom: 20px;
  }
  .board-main-list{
    width: 100%;
  }
  .board-main-header{
    text-align: center;
    align-items: center;
    flex-direction: column;
  }
  .write-btn{
    width: 100%;
    justify-content: center;
  }
}
@media (max-width: 520px) {
  .write-text{
    display: none;
  }
  .write-btn{
    width:auto;
    padding: 10px 12px;
  }
}
</style>