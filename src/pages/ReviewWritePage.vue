<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { createReview } from "@/api/posts.js";
import PostForm from "@/components/Board/PostForm.vue";

const router = useRouter();
const { t } = useI18n();

const submit = async ({ title, content, imagesToAdd, planId }) => {
  if (!title || !content) {
    alert(t("review.createRequired"));
    return;
  }
  const formData = new FormData();
  formData.append(
    "review",
    JSON.stringify({
      title,
      content,
      planId,
    })
  );
  imagesToAdd.forEach((file) => {
    formData.append("image", file);
  });

  try {
    const res = await createReview(formData);

    const reviewIndex = res.data?.data?.review?.reviewIndex;
    await router.push(`/board/${reviewIndex}`);
  } catch (e) {
    console.error(e);
    alert(t("review.createFail"));
  }
};
</script>

<template>
  <main class="board-page">
    <section class="board-container">
      <PostForm mode="create" :submitLabel="t('review.create')" :onSubmit="submit" :showPlanSelector="true" />
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
