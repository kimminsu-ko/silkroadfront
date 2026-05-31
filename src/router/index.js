import { createRouter, createWebHistory } from "vue-router";

// 페이지 컴포넌트들
import HomePage from "@/pages/HomePage.vue";
import BoardPage from "@/pages/BoardPage.vue";
import MyPage from "@/pages/ProfilePage.vue";
import LogIn from "@/pages/LogIn.vue";
import SignUp from "@/pages/SignUpPage.vue";
import AIRoutePage from "@/pages/AIRoutePage.vue";
import TouristSearchPage from "@/pages/TouristSearchPage.vue";
import PlanCreatorPage from "@/pages/PlanCreatorPage.vue";
import PlanDetailPage from "@/pages/PlanDetailPage.vue";
import MyPlansPage from "@/pages/MyPlansPage.vue";
import ChatRoomListPage from "@/pages/ChatRoomListPage.vue";
import ReviewDetailPage from "@/pages/ReviewDetailPage.vue";
import NoticeDetailPage from "@/pages/NoticeDetailPage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/board", component: BoardPage },
  { path: "/mypage", component: MyPage },
  { path: "/login", component: LogIn },
  { path: "/signup", component: SignUp },
  { path: "/profile/:id", component: MyPage, props: true },
  //상세후기
  {
    path: "/board/:reviewIndex",
    name: "review-detail",
    component: ReviewDetailPage,
    props: true,
  },
  //공지사항
  {
    path: "/board/notice/:noticeIndex",
    name: "notice-detail",
    component: NoticeDetailPage,
    props: true,
  },
  //각종 글 수정
  {
    path: "/review/write",
    component: () => import("@/pages/ReviewWritePage.vue"),
  },
  {
    path: "/review/:reviewIndex/edit",
    component: () => import("@/pages/ReviewEditPage.vue"),
  },
  {
    path: "/notice/:noticeIndex/edit",
    component: () => import("@/pages/NoticeEditPage.vue"),
  },

  { path: "/chat-rooms", component: ChatRoomListPage },
  { path: "/ai-route", component: AIRoutePage },
  { path: "/ai-route/:roomId", component: AIRoutePage, props: true },
  { path: "/tourist-search", component: TouristSearchPage },
  { path: "/plan-creator", component: PlanCreatorPage },
  { path: "/plans/:id/edit", component: PlanCreatorPage },
  { path: "/plans/:id", component: PlanDetailPage },
  { path: "/my-plans", component: MyPlansPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 뒤로가기/앞으로가기 시 저장된 위치로 이동
    if (savedPosition) {
      return savedPosition;
    }
    // 그 외(새 페이지 이동)에는 맨 위로 스크롤
    return { top: 0 };
  },
});

export default router;
