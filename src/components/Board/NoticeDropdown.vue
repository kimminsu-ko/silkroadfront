<script setup>
import {ref, computed, onMounted, watch, reactive} from 'vue';
import {motion} from "motion-v";
import { fetchNotices } from '@/api/notice';
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";


const router = useRouter();
const {t,locale} = useI18n();
//실제 API 연동 코드


const notices = ref([]);
const errorMsg = ref('');
const latestNotice = ref(null);
const loading = ref(true);

const loadNotices = async (page = 1, size = 5) => {
  try {
    errorMsg.value = '';
    const res = await fetchNotices(page, size);
    notices.value = res.data?.data?.notices ?? res.data?.data ?? [];
  } catch (e) {
    console.error(e);
    errorMsg.value =  t('notice.loadFail');
  } finally {
    loading.value = false;
  }
};
onMounted(() =>{
  loadNotices();
})

watch(() => notices.value, (newNotices) => {
  if (newNotices.length > 0) {
    latestNotice.value = newNotices[0];  // 첫 번째 공지사항을 latestNotice에 할당
  } else {
    latestNotice.value = null;  // 공지사항이 없으면 null로 설정
  }
});

const isOpen = ref(false);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

//날짜 표시
const formatDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);

  if (locale.value === 'ko') {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  if (locale.value === 'ja') {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

//공지 상세 이동
const goNoticeDetail = (noticeIndex) => {
  isOpen.value = false;
  router.push({
    name : 'notice-detail',
    params: {noticeIndex},
  })
}

</script>

<template>
  <div class="notice-wrapper">
    <!-- 상단 한 칸짜리 바 -->
    <div class="notice-bar" @click="toggle">
      <div class="notice-left">
        <span class="notice-label">{{ $t('notice.label') }}</span>

        <span v-if="latestNotice" class="notice-title">
          {{ latestNotice.title }}
        </span>
        <span v-else class="notice-empty">{{ $t('notice.empty') }}</span>
      </div>

      <button type="button" class="notice-toggle-btn" @click.stop="toggle">
        <span class="notice-toggle-text">
           {{ isOpen ? $t('notice.collapse') : $t('notice.more') }}
        </span>
        <span class="chevron" :class="{ 'chevron-open': isOpen }">
          ▼
        </span>
      </button>
    </div>

    <!-- 오버레이 패널 -->
    <motion.div
        v-if="isOpen && !loading"
        class="notice-panel"
        :initial="{ opacity: 0, y: -8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.18 }"
    >
      <ul class="notice-list">
        <li
            v-for="n in notices"
            :key="n.noticeIndex"
            class="notice-item"
            @click.stop="goNoticeDetail(n.noticeIndex)"
        >

          <div class="notice-item-title">{{ n.title }}</div>
          <div class="notice-item-meta">
            <span class="notice-item-author">{{ n.userNickname }}</span>
            <span class="notice-item-date">
              {{ formatDate(n.postDate) }}
            </span>
          </div>
        </li>
      </ul>
    </motion.div>
  </div>
</template>

<style scoped>
.notice-wrapper {
  position: relative;
  width: 100%;
  z-index: 10;
}

.notice-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(74, 58, 42, 0.05);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.notice-bar:hover {
  box-shadow: 0 8px 20px rgba(74, 58, 42, 0.1);
}

.notice-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.notice-label {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #8c6239; /* Deep Warm Brown Accent */
  background: #f4f0e6; /* Soft beige background */
}

.notice-title {
  font-size: 15px;
  font-weight: 500;
  color: #3b2f22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-empty {
  font-size: 15px;
  color: #9c8c74;
}

.notice-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #9c8c74;
  cursor: pointer;
}

.chevron {
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 10px;
}

.chevron-open {
  transform: rotate(180deg);
}

.notice-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  padding: 12px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(74, 58, 42, 0.12);
  border: 1px solid rgba(235, 230, 220, 0.8);
  max-height: 280px;
  overflow-y: auto;
}

.notice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-item {
  padding: 12px 14px;
  border-radius: 12px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.notice-item:hover {
  background-color: #fdfcf8;
}

.notice-item-title {
  font-size: 15px;
  font-weight: 500;
  color: #3b2f22;
  margin-bottom: 4px;
}

.notice-item-meta {
  font-size: 12px;
  color: #9c8c74;
  display: flex;
  justify-content: space-between;
}
</style>