<script setup>
import { ref , onMounted, computed} from 'vue';
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import { motion } from 'motion-v';
import { fetchNoticeDetail, deleteNotice } from '@/api/notice';
import {useAuthStore} from "@/stores/auth.js";


const props = defineProps({
  noticeIndex: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const errorMsg = ref('');
const notice = ref({})
const {t, locale} = useI18n();
//수정 버튼 핸들러
const handleEdit = () =>{
  router.push(`/notice/${props.noticeIndex}/edit`);
}

//권한있는사람만 지울 수 있게 처리
const canEditOrDelete = computed(()=>{
  if(!auth.user) return false;
  if(!notice.value?.userIndex) return false;

  return (
      auth.user.userIndex === notice.value.userIndex ||
      auth.user.role === 1
  );
});

//API 연결 코드

const loadNotice = async () => {
  try {
    loading.value = true;
    errorMsg.value = '';

    // GET /api/notice/{noticeIndex}
    const res = await fetchNoticeDetail(props.noticeIndex);

    // { code, message, data: { ... } }
    notice.value = res.data?.data ?? res.data;

  } catch (e) {
    console.error(e);
    errorMsg.value = t('notice.loadFail');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
   loadNotice();
});


const handleDelete = async () => {
  if (!confirm(t('notice.deleteConfirm'))) return;

  try {
    await deleteNotice(props.noticeIndex);
    await router.push('/board');
  } catch (e) {
    console.error(e);
    alert(t('notice.deleteFail'));
  }
};

const formatDateTime = (iso) => {
  if (!iso) return '';

  const date = new Date(iso);

  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
</script>

<template>
  <motion.article
      class="notice-detail detail-card"
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.22 }"
  >
    <p v-if="errorMsg" class="detail-error">{{ errorMsg }}</p>
    <p v-else-if="loading" class="detail-loading">{{ t('notice.loading') }}</p>

    <header class="detail-header">
      <h1 class="detail-title">
        {{ notice.title }}
      </h1>
      <div class="detail-meta">
        <div class="left">
          <span class="nickname">{{ notice.userNickname }}</span>
          <span class="dot">·</span>
          <span class="date">{{ formatDateTime(notice.postDate) }}</span>
        </div>
      </div>
    </header>

    <section class="detail-content">
      <p class="detail-text">
        {{ notice.content }}
      </p>
    </section>

    <footer class="detail-footer" v-if="canEditOrDelete">
      <button
          type="button"
          class="secondary-btn"
          @click="handleEdit"
      >
        {{ t('notice.edit') }}
      </button>
      <button type="button" class="danger-btn" @click="handleDelete">
        {{ t('notice.delete') }}
      </button>
    </footer>
  </motion.article>
</template>

<!-- 공통 CSS import (아래 6번에서 설명) -->
<style src="@/assets/css/boardDetail.css"></style>

<style scoped>
/* 공지 전용으로 따로 주고 싶으면 여기서만 스타일 추가 */
</style>
