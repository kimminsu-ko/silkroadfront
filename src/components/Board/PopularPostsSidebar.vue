<script setup>
import {ref, onMounted} from "vue";
import {useRouter} from "vue-router";
import { useI18n} from "vue-i18n";
import {motion} from "motion-v";
import { fetchPopularReviews } from '@/api/main';
import dummy from '@/assets/homeImg/dummy.png'

const router = useRouter();
const {t} = useI18n();

//API 연결
const popularPosts = ref([]);
const errorMsg = ref('');

const dummyImages = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d',
];

const loadPopular = async () => {
  try {
    errorMsg.value = "";

    const res = await fetchPopularReviews();

    // 명세서: res.data.data 가 Top5 배열
    const rows = res?.data?.data ?? [];

    // 화면에서 쓰기 좋게 flatten
    popularPosts.value = rows.map((row, idx) => {
      const review = row?.review ?? {};
      const images = Array.isArray(row?.image) ? row.image : [];

      const thumbnail =
          images.length > 0
              ? images[0]?.imageUrl
              : dummyImages[idx % dummyImages.length]; // 없으면 더미

      return {
        reviewIndex: review.reviewIndex,
        title: review.title ?? "-",
        userNickname: review.userNickname ?? "-",
        liked: review.liked ?? 0,
        thumbnail,
      };
    });
  } catch (e) {
    console.error(e);
    errorMsg.value = t("main.popular.loadFail");
    popularPosts.value = [];
  }
};

onMounted(loadPopular);

//상세 페이지 이동
const goReviewDetail = (reviewIndex) => {
  router.push({
    name : 'review-detail',
    params: {reviewIndex},
  })
}
</script>

<template>
  <section class="popular-section">
    <header class="popular-header">
      <h2>{{ $t("main.popular.title") }}</h2>
      <span class="popular-sub">{{ $t("main.popular.subtitle") }}</span>
    </header>

    <!-- 필요하면 켜 -->
    <!-- <p v-if="errorMsg" class="popular-error">{{ errorMsg }}</p> -->

    <div class="popular-list">
      <motion.div
          v-for="(post, idx) in popularPosts"
          :key="post.reviewIndex ?? idx"
          class="popular-item"
          :initial="{ opacity: 0, x: -10 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ delay: idx * 0.04 }"
          @click="goReviewDetail(post.reviewIndex)"
      >
        <div class="popular-rank">
          {{ idx + 1 }}
        </div>

        <!-- 썸네일 ?? 더미 -->
        <div class="popular-thumbnail">
          <img :src="post.thumbnail" alt="" />
        </div>

        <div class="popular-info">
          <div class="popular-title">
            {{ post.title }}
          </div>
          <div class="popular-meta">
            <span class="nickname">{{ post.userNickname }}</span>
            <span class="likes">♥ {{ post.liked }}</span>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
</template>

<style scoped>
.popular-section {
  background: #ffffff;
  padding: 24px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(74, 58, 42, 0.04);
}

.popular-header {
  margin-bottom: 20px;
}

.popular-header h2 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #3b2f22;
}

.popular-sub {
  font-size: 13px;
  color: #9c8c74; /* Muted warm grey */
}

.popular-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.popular-item:hover {
  background-color: #fdfcf8; /* Light warm hover */
}

/* 랭크 배지: 아주 모던하게 */
.popular-rank {
  width: 24px;
  font-size: 16px;
  font-weight: 700;
  color: #9c8c74;
  text-align: center;
  flex-shrink: 0;
}

/* 1~3위 강조: 사막의 금색/황토색 */
.popular-item:nth-child(1) .popular-rank,
.popular-item:nth-child(2) .popular-rank,
.popular-item:nth-child(3) .popular-rank {
  color: #d4a373; /* Gold/Sand Accent */
}

.popular-thumbnail {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: #f4f0e6;
  flex-shrink: 0;
}

.popular-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popular-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.popular-title {
  font-size: 15px;
  font-weight: 500;
  color: #3b2f22;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popular-meta {
  font-size: 12px;
  color: #9c8c74;
  display: flex;
  align-items: center;
  gap: 6px;
}
@media (max-width: 768px) {
  .popular-header{
    text-align: center;
  }

}
</style>