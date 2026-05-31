<script setup>
import { ref, onMounted, computed } from "vue";
import { motion } from "motion-v";
import { useAuthStore } from "@/stores/auth.js";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import PlanViewer from "@/components/Plan/PlanViewer.vue";
import { fetchReview, deleteReview, likeReview, unlikeReview, fetchReviewLikedStatus } from "@/api/posts.js";

const props = defineProps({
  reviewIndex: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const auth = useAuthStore();
const { t } = useI18n();

const loading = ref(false);
const errorMsg = ref("");
const review = ref({});
const likeErrorMsg = ref("");

//수정 버튼 핸들러
const handleEdit = () => {
  router.push(`/review/${props.reviewIndex}/edit`);
};

//권한있는사람만 지울 수 있게 처리
const canEditOrDelete = computed(() => {
  if (!auth.user) return false;

  if (!review.value?.userIndex) return false;

  return auth.user.userIndex === review.value.userIndex || auth.user.role === 1;
});
//API 연결
const loadReview = async () => {
  try {
    loading.value = true;
    errorMsg.value = "";

    const res = await fetchReview(props.reviewIndex);
    review.value = res.data?.data?.review ?? res.data;
  } catch (e) {
    console.error(e);
    errorMsg.value = t("review.detail.loadFail");
  } finally {
    loading.value = false;
  }
};
//좋아요 했는지 체크
const loadLikedStatus = async () => {
  try {
    const res = await fetchReviewLikedStatus(props.reviewIndex);
    review.value.likedByMe = !!res?.data?.checked;
  } catch (e) {
    const status = e?.response?.status;
    const data = e?.response?.data;

    //비로그인 일때 처리
    if (status === 404 || status === 401) {
      review.value.likedByMe = false;
      likeErrorMsg.value = "";
      return;
    }
    //그 외의 에러 처리
    review.value.likedByMe = false;

    if (status === 400 || status === 500) {
      likeErrorMsg.value = data?.error || t("review.detail.likeStatusFail");
      console.warn("좋아요 여부 조회 실패 : ", status, data?.code, data?.error);
      return;
    }
    likeErrorMsg.value = "";
    console.error(e);
  }
};

onMounted(async () => {
  await loadReview();
  await loadLikedStatus();
});

const likeLoading = ref(false);

//like toggle
const toggleLike = async () => {
  try {
    likeLoading.value = true;

    if (review.value.likedByMe) {
      await unlikeReview(props.reviewIndex);
      review.value.likedByMe = false;
      review.value.liked = Math.max(0, review.value.liked - 1);
    } else {
      await likeReview(props.reviewIndex);
      review.value.likedByMe = true;
      review.value.liked = (review.value.liked || 0) + 1;
    }
  } catch (e) {
    console.error(e);
  } finally {
    likeLoading.value = false;
  }
};

//delete handler
const handleDelete = async () => {
  if (!confirm(t("review.detail.deleteConfirm"))) return;

  try {
    await deleteReview(props.reviewIndex);
    await router.push("/board");
  } catch (e) {
    console.error(e);
    alert(t("review.detail.deleteFail"));
  }
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  return iso.replace("T", " ").slice(0, 16);
};

const planId = computed(() => {
  return review.value?.planIndex || review.value?.planId;
});
</script>

<template>
  <motion.article
    class="review-detail"
    :initial="{ opacity: 0, y: 10 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.22 }"
  >
    <p v-if="errorMsg" class="detail-error">{{ errorMsg }}</p>
    <p v-else-if="loading" class="detail-loading">{{ $t("review.detail.loading") }}</p>

    <header class="detail-header">
      <h1 class="detail-title">
        {{ review.title }}
      </h1>
      <div class="detail-meta">
        <div class="left">
          <span class="nickname">{{ review.userNickname }}</span>
          <span class="dot">·</span>
          <span class="date">{{ formatDateTime(review.postDate) }}</span>
        </div>
        <div class="right">
          <motion.button
            type="button"
            class="like-btn"
            :class="{ active: review.likedByMe }"
            :disabled="likeLoading"
            :whileHover="{ scale: 1.05 }"
            :whileTap="{ scale: 0.95 }"
            @click="toggleLike"
          >
            ♥ {{ review.liked ?? 0 }}
          </motion.button>
          <p v-if="likeErrorMsg" class="like-error">
            {{ likeErrorMsg }}
          </p>
        </div>
      </div>
    </header>

    <section class="detail-content">
      <div v-if="planId" class="plan-viewer-container">
        <PlanViewer :planId="planId" :readOnly="true" />
      </div>
      <p class="detail-text">
        {{ review.content }}
      </p>
    </section>

    <footer class="detail-footer" v-if="canEditOrDelete">
      <button type="button" class="secondary-btn" @click="handleEdit">
        {{ $t("review.detail.edit") }}
      </button>
      <button type="button" class="danger-btn" @click="handleDelete">
        {{ $t("review.detail.delete") }}
      </button>
    </footer>
  </motion.article>
</template>

<!-- 공통 카드 스타일 -->
<style src="@/assets/css/boardDetail.css"></style>

<style scoped>
.like-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #d23737;
  text-align: right;
}

.plan-viewer-container {
  margin-bottom: 24px;
  height: 600px;
  border: 1px solid rgba(74, 58, 42, 0.12);
  border-radius: 12px;
  overflow: hidden;
}
</style>
