<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { fetchNoticeDetail, updateNotice } from "@/api/notice.js";
import PostForm from "@/components/Board/PostForm.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const noticeIndex = Number(route.params.noticeIndex);

const loading = ref(true);
const errorMsg = ref("");

const notice = ref(null);

//공지사항 로딩
const loadNotice = async () => {
  try {
    loading.value = true;
    const res = await fetchNoticeDetail(noticeIndex);
    notice.value = res.data?.data;
  } catch (e) {
    console.error(e);
    errorMsg.value = t("board.noticeEdit.loadFail");
  } finally {
    loading.value = false;
  }
};

onMounted(loadNotice);

//수정 제출
const submit = async ({ title, content }) => {
  if (!title || !content) {
    alert(t("board.noticeEdit.requiredAlert"));
    return;
  }

  try {
    await updateNotice(noticeIndex, { title, content });
    await router.push(`/board/notice/${noticeIndex}`);
  } catch (e) {
    console.error(e);
    alert(t("board.noticeEdit.submitFail"));
  }
};
</script>

<template>
  <main class="board-page">
    <section class="board-container">
      <div v-if="loading">{{ t("board.noticeEdit.loading") }}</div>
      <div v-else-if="errorMsg">{{ errorMsg }}</div>

      <PostForm
        v-else
        mode="edit-notice"
        :submitLabel="t('board.noticeEdit.submitLabel')"
        :initialTitle="notice.title"
        :initialContent="notice.content"
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
