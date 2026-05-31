<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { fetchReview, updateReview } from "@/api/posts.js";
import PostForm from "@/components/Board/PostForm.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const reviewIndex = Number(route.params.reviewIndex);

//상태 함수
const loading = ref(true);
const errorMsg = ref("");

const review = ref(null);
const images = ref([]);

//최초 데이터 로딩
const loadReview = async () => {
  try {
    loading.value = true;
    const res = await fetchReview(reviewIndex);

    const data = res.data?.data;
    review.value = data.review;
    images.value = data.image || [];
  } catch (e) {
    console.error(e);
    errorMsg.value = t("review.loadFail");
  } finally {
    loading.value = false;
  }
};

onMounted(loadReview);

//수정 제출
const submit = async ({ title, content, imagesToAdd, imageIndexesToDelete, planId }) => {
  if (!title || !content) {
    alert(t("review.required"));
    return;
  }

  try {
    await updateReview(
      reviewIndex,
      { title, content, planId },
      {
        imageIndexesToDelete,
        imagesToAdd,
      }
    );

    router.push(`/board/${reviewIndex}`);
  } catch (e) {
    console.error(e);
    alert(t("review.editFail"));
  }
};
</script>

<template>
  <main class="board-page">
    <section class="board-container">
      <div v-if="loading">{{ t("review.loading") }}</div>
      <div v-else-if="errorMsg">{{ errorMsg }}</div>

      <PostForm
        v-else
        mode="edit-review"
        :submitLabel="t('review.edit')"
        :initialTitle="review.title"
        :initialContent="review.content"
        :initialImages="images"
        :initialPlanId="review.planIndex"
        :showPlanSelector="true"
        :onSubmit="submit"
      />
    </section>
  </main>
</template>

<style scoped>
.board-page {
  min-height: calc(100vh - 80px);
  padding: 80px 16px 40px;
  background-color: #fdfcf8;
}

.board-container {
  max-width: 1120px;
  margin: 0 auto;
}
</style>
