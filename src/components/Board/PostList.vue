<script setup>
import { useRouter } from 'vue-router';
import {useI18n} from "vue-i18n";
import { motion } from 'motion-v';


const router = useRouter();
const {locale} = useI18n();

const props = defineProps({
  posts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  errorMsg: { type: String, default: '' },
});


// 게시글 클릭 시 상세 페이지로 이동
const goDetail = (reviewIndex) => {
  router.push({
    name: 'review-detail', // router에서 이 이름으로 등록할 거
    params: { reviewIndex },
  });
};

// 날짜 간단 포매팅 (YYYY-MM-DD만 쓰고 싶을 때)
const formatDate = (iso) => {
  if (!iso) return '';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};
</script>

<template>
  <section class="post-list">
    <p v-if="errorMsg" class="post-list-error">{{ errorMsg }}</p>
    <p v-else-if="loading" class="post-list-loading">{{ $t('review.loading') }}</p>

    <ul v-else class="post-list-inner">
      <motion.li
          v-for="(post, idx) in posts"
          :key="post.reviewIndex ?? idx"
          class="post-item"
          :initial="{ opacity: 0, y: 4 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: idx * 0.03 }"
          @click="goDetail(post.reviewIndex)"
      >
        <h3 class="post-title">{{ post.title }}</h3>

        <div class="post-meta">
          <div class="post-meta-left">
            <span class="nickname">{{ post.userNickname }}</span>
            <span class="dot">·</span>
            <span class="date">{{ formatDate(post.postDate) }}</span>
          </div>
          <div class="post-meta-right">
            <span class="likes">♥ {{ post.liked ?? 0 }}</span>
          </div>
        </div>
      </motion.li>
    </ul>
  </section>
</template>


<style scoped>
.post-list {
  width: 100%;
}

.post-list-error {
  color: #d23737;
  text-align: center;
  margin: 20px 0;
}

.post-list-loading {
  color: #8b95a1;
  text-align: center;
  margin: 40px 0;
}

.post-list-inner {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  display: block;
  padding: 24px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(74, 58, 42, 0.03);
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  cursor: pointer;
}

.post-item:hover {
  background-color: #fffefc; /* Slightly cream */
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(74, 58, 42, 0.08); /* Warm shadow */
}

.post-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  color: #3b2f22; /* Dark Brown */
  line-height: 1.4;
  word-break: break-all;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #9c8c74; /* Muted warm grey/brown */
}

.post-meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nickname {
  color: #5d4d3a; /* Medium Brown */
  font-weight: 500;
}

.dot {
  font-weight: 400;
  opacity: 0.5;
}

.post-meta-right {
  display: flex;
  align-items: center;
}

.likes {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #c6483b; /* Warm Red */
  font-weight: 500;
}
</style>
