<template>
  <div class="my-plans-page">
    <div class="page-header">
      <h1>{{ t("myPlans.title") }}</h1>
      <p>{{ t("myPlans.subtitle") }}</p>
    </div>

    <div class="header-divider"></div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t("myPlans.loading") }}</p>
    </div>

    <div v-else-if="upcomingPlans.length === 0 && pastPlans.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>{{ t("myPlans.emptyTitle") }}</h3>
      <p>{{ t("myPlans.emptyDesc") }}</p>
      <router-link to="/plan-creator" class="create-btn">
        {{ t("myPlans.create") }}
      </router-link>
    </div>

    <div v-else class="plans-container">
      <!-- 다가오는 여행 목록 -->
      <section class="plan-section" v-if="upcomingPlans.length > 0">
        <div class="section-header">
          <h2>{{ t("myPlans.upcomingTitle") }}</h2>
          <span class="section-desc">{{ t("myPlans.upcomingDesc") }}</span>
        </div>

        <div class="plans-grid">
          <div
            v-for="plan in upcomingPlans"
            :key="plan.planIndex"
            class="plan-card"
            @click="goToDetail(plan.planIndex)"
          >
            <div class="card-thumbnail">
              <img :src="plan.thumbnail || '/images/default-thumbnail.jpg'" @error="handleImageError" />
              <div class="card-overlay">
                <span class="d-day-badge">{{ getDDay(plan.startDate) }}</span>
                <span class="plan-area" v-if="plan.regions?.length">
                  {{ displayRegions(plan.regions) }}
                </span>
              </div>
            </div>

            <div class="card-content">
              <h3 class="plan-title">{{ plan.name }}</h3>
              <div class="plan-date">{{ formatLocalDate(plan.startDate) }} ~ {{ formatLocalDate(plan.endDate) }}</div>

              <div class="plan-tags" v-if="plan.tags?.length">
                <span v-for="(tagLabel, i) in displayTags(plan.tags)" :key="i" class="tag"> # {{ tagLabel }} </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 두 목록이 모두 있을 때 구분선 -->
      <div class="section-divider" v-if="upcomingPlans.length > 0 && pastPlans.length > 0"></div>

      <!-- 지난 여행 목록 -->
      <section class="plan-section" v-if="pastPlans.length > 0">
        <div class="section-header">
          <h2>{{ t("myPlans.pastTitle") }}</h2>
          <span class="section-desc">{{ t("myPlans.pastDesc") }}</span>
        </div>
        <div class="plans-grid">
          <div
            v-for="plan in pastPlans"
            :key="plan.planIndex"
            class="plan-card past"
            @click="goToDetail(plan.planIndex)"
          >
            <div class="card-thumbnail">
              <img :src="plan.thumbnail || '/images/default-thumbnail.jpg'" @error="handleImageError" />
              <div class="card-overlay">
                <span class="status-badge">
                  {{ t("myPlans.statusDone") }}
                </span>
                <span class="plan-area" v-if="plan.regions && plan.regions.length > 0">
                  {{ displayRegions(plan.regions) }}
                </span>
              </div>
            </div>
            <div class="card-content">
              <h3 class="plan-title">{{ plan.name }}</h3>
              <p class="plan-date">{{ formatDate(plan.startDate) }} ~ {{ formatDate(plan.endDate) }}</p>
              <div class="plan-tags" v-if="plan.tags && plan.tags.length > 0">
                <span v-for="tag in plan.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
                <span v-if="plan.tags.length > 3" class="tag more">+{{ plan.tags.length - 3 }}</span>
              </div>
            </div>
            <!-- 이하 동일 -->
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { getMyPlans } from "@/api/plan";
import { useAuthStore } from "@/stores/auth";
import { REGION_SERVER_TO_KEY, TAG_SERVER_TO_KEY } from "@/utils/tagReverseMapper";

const router = useRouter();
const authStore = useAuthStore();
const { t, te, locale } = useI18n();

const plans = ref([]);
const isLoading = ref(true);

//날짜 파싱
const parseLocalDate = (yyyyMMdd) => {
  if (!yyyyMMdd) return null;
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  return new Date(y, m - 1, d); // 로컬 타임존으로 생성
};

// 여행 계획 필터링을 위한 계산된 속성
const upcomingPlans = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return plans.value.filter((plan) => {
    const end = parseLocalDate(plan.endDate);
    end.setHours(0, 0, 0, 0);
    return end >= today;
  });
});

const pastPlans = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return plans.value.filter((plan) => {
    const end = parseLocalDate(plan.endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
  });
});

const getDDay = (startDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = parseLocalDate(startDate);
  if (!start) return "";
  start.setHours(0, 0, 0, 0);

  const diffTime = start - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "D-Day";
  if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
  return `D-${diffDays}`;
};

const fetchPlans = async () => {
  if (!authStore.isLoggedIn) {
    alert(t("myPlans.loginRequired"));
    await router.push("/login");
    return;
  }

  isLoading.value = true;
  try {
    const response = await getMyPlans({ page: 1, size: 100 }); // 우선 100개 조회
    if (response.data && response.data.code === "SU") {
      plans.value = response.data.data.plans; // PlanListResponse 데이터 구조 확인 필요
    } else {
      console.error("Failed to fetch plans:", response.data.message);
    }
  } catch (error) {
    console.error("Error fetching plans:", error);
  } finally {
    isLoading.value = false;
  }
};

const goToDetail = (planId) => {
  router.push(`/plans/${planId}`);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

// 날짜 표시: locale 맞춰 "2025년 12월 24일" / "Dec 24, 2025" / "2025年12月24日" 이런 식
const formatLocalDate = (yyyyMMdd) => {
  if (!yyyyMMdd) return "";
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  // 중요: undefined 말고 locale.value
  return new Intl.DateTimeFormat(locale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// 지역 표시: server(서울) -> key(seoul) -> i18n
const displayRegions = (regions = []) => {
  return regions
    .map((r) => {
      const key = REGION_SERVER_TO_KEY[r] ?? r;
      return t(`planCreator.regions.${key}`);
    })
    .join(", ");
};

// 태그 표시: server(가족과함께) -> key(family) -> i18n(테마/시즌 둘 다 체크)
const displayTags = (tags = []) => {
  return tags.map((tg) => {
    const key = TAG_SERVER_TO_KEY[tg] ?? tg;

    // theme/season 둘 중 어디인지 모르니까 둘 다 시도
    const themePath = `planCreator.themes.${key}`;
    const seasonPath = `planCreator.seasons.${key}`;

    if (typeof te === "function" && te(themePath)) return t(themePath);
    if (typeof te === "function" && te(seasonPath)) return t(seasonPath);

    // te 안 쓰는 프로젝트면 그냥 fallback
    return t(themePath) || t(seasonPath) || tg;
  });
};

const handleImageError = (e) => {
  const img = e.target;

  // 이미 로컬로 떨어졌으면 더 이상 아무 것도 하지 마
  if (img.dataset.fallback === "local") return;

  // 아직 외부 placeholder 안 써봤으면 1회 시도
  if (!img.dataset.fallback) {
    img.dataset.fallback = "placeholder";
    img.src = "https://via.placeholder.com/300x200?text=No+Image";
    return;
  }

  // placeholder도 실패했으면 로컬로 고정
  img.dataset.fallback = "local";
  img.onerror = null; // ★ 이거 없으면 또 무한
  img.src = "/images/default-thumbnail.jpg";
};

onMounted(() => {
  fetchPlans();
});
</script>

<style scoped>
.my-plans-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #fdfdfd;
  min-height: 80vh;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin-bottom: 40px;
  width: 100%;
}

.page-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
  font-weight: 400;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 100px 0;
  color: #95a5a6;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 24px;
  opacity: 0.8;
}

.create-btn {
  display: inline-block;
  margin-top: 24px;
  padding: 12px 28px;
  background-color: #4a3a2a;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(74, 58, 42, 0.2);
}

.create-btn:hover {
  background-color: #362b1f;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 58, 42, 0.3);
}

.plans-container {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.section-header {
  margin-bottom: 24px;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #34495e;
  font-weight: 700;
  margin: 0;
}

.section-desc {
  color: #95a5a6;
  font-size: 0.95rem;
}

.section-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 0 20px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
}

.plan-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.plan-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.card-thumbnail {
  position: relative;
  height: 200px;
  background-color: #f5f5f5;
  overflow: hidden;
}

.card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.plan-card:hover .card-thumbnail img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.d-day-badge {
  background: #ff6b6b;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
}

.status-badge {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.plan-area {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 20px;
}

.plan-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-date {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.plan-date::before {
  content: "📅";
  font-size: 0.9rem;
}

.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #f0f2f5;
  color: #57606f;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: background 0.2s;
}

.plan-card:hover .tag {
  background: #e2e6ea;
}

/* 지난 여행 카드 스타일 */
.plan-card.past .card-thumbnail img {
  filter: grayscale(30%);
}

.plan-card.past:hover .card-thumbnail img {
  filter: grayscale(0%);
}
</style>
