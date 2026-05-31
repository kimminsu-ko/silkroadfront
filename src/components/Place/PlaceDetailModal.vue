<template>
  <div v-if="isVisible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ detail?.title || t("placeDetailModal.loadingTitle") }}
        </h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body" v-if="detail">
        <div class="info-group">
          <h3 class="info-label">{{ t("placeDetailModal.location") }}</h3>
          <p class="info-text">
            {{ detail.addr1 }}
          </p>
        </div>

        <div class="info-group" v-if="detail.tel">
          <h3 class="info-label">{{ t("placeDetailModal.contact") }}</h3>
          <p class="info-text"><span class="icon">📞</span> {{ detail.tel }}</p>
        </div>

        <div class="info-group">
          <h3 class="info-label">{{ t("placeDetailModal.description") }}</h3>
          <div
            class="info-content"
            :class="{ collapsed: !isOverviewExpanded }"
            v-html="detail.overview || t('placeDetailModal.noDetail')"
          ></div>
          <button
            v-if="detail.overview && detail.overview.length > 100"
            class="more-btn"
            @click="isOverviewExpanded = !isOverviewExpanded"
          >
            {{ isOverviewExpanded ? t("placeDetailModal.collapse") : t("placeDetailModal.more") }}
          </button>
        </div>

        <div class="info-group" v-if="processedIntro.length > 0">
          <h3 class="info-label">{{ t("placeDetailModal.usageInfo") }}</h3>
          <ul class="intro-list">
            <li v-for="(item, index) in processedIntro" :key="index">
              <span class="intro-key">{{ item.key }}</span>
              <span class="intro-value" v-html="item.value"></span>
            </li>
          </ul>
        </div>

        <div class="info-group" v-if="detail.images && detail.images.length > 0">
          <h3 class="info-label">{{ t("placeDetailModal.images") }}</h3>
          <div class="image-list">
            <img
              v-for="(img, idx) in detail.images"
              :key="idx"
              :src="img"
              class="modal-image"
              @click="openImageModal(img)"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- 리뷰 섹션 -->
        <div class="info-group review-section">
          <h3 class="info-label">{{ t("placeDetailModal.reviewRating") }}</h3>
          <div class="review-summary">
            <div class="rating-score">
              <span class="star-icon">⭐</span>
              <span class="score">{{ detail.ratingAvg || "0.0" }}</span>
              <span class="max-score">/ 5.0</span>
              <span class="review-count">
                ({{ t("placeDetailModal.reviewsCount", { count: detail.reviewCount || 0 }) }})
              </span>
            </div>
            <div class="like-info" @click="toggleLike" :class="{ liked: detail.liked }">
              <span class="heart-icon">{{ detail.liked ? "❤️" : "🤍" }}</span>
              <span class="like-text">
                {{ t("placeDetailModal.likeCount", { count: detail.likeCount || 0 }) }}
              </span>
            </div>
          </div>

          <!-- 리뷰 입력 폼 -->
          <div class="review-form">
            <div class="rating-input">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ active: star <= newReview.rating }"
                @click="newReview.rating = star"
                >★</span
              >
            </div>
            <div class="input-wrapper">
              <input
                v-model="newReview.content"
                type="text"
                :placeholder="t('placeDetailModal.reviewPlaceholder')"
                @keyup.enter="submitReview"
              />
              <button @click="submitReview" :disabled="isSubmitting">
                {{ t("placeDetailModal.submit") }}
              </button>
            </div>
          </div>

          <!-- 리뷰 목록 -->
          <div class="review-list" v-if="reviews.length > 0">
            <div class="review-header">{{ t("placeDetailModal.latestReviews") }}</div>
            <div v-for="review in displayedReviews" :key="review.reviewId" class="review-item">
              <div class="review-user-profile">
                <img :src="review.userProfileImage || '/default-profile.png'" alt="Profile" class="profile-img" />
              </div>
              <div class="review-content-wrapper">
                <div v-if="editingReviewId !== review.reviewId">
                  <div class="review-meta">
                    <span class="nickname">{{ review.userNickname }}</span>
                    <span class="date">{{ formatDate(review.createdAt) }}</span>
                    <div class="user-rating">
                      <span v-for="n in 5" :key="n" class="star-small" :class="{ filled: n <= review.rating }">★</span>
                    </div>
                  </div>
                  <p class="review-text">{{ review.content }}</p>
                </div>

                <!-- 수정 폼 -->
                <div v-else class="edit-form">
                  <div class="rating-input">
                    <span
                      v-for="star in 5"
                      :key="star"
                      class="star-small pointer"
                      :class="{ filled: star <= editForm.rating }"
                      @click="editForm.rating = star"
                      >★</span
                    >
                  </div>
                  <div class="edit-input-wrapper">
                    <input v-model="editForm.content" class="edit-input" @keyup.enter="handleUpdateReview" />
                    <div class="edit-actions">
                      <button @click="handleUpdateReview" class="save-btn">
                        {{ t("placeDetailModal.edit.save") }}
                      </button>
                      <button @click="cancelEdit" class="cancel-btn">{{ t("placeDetailModal.edit.cancel") }}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="review.isMyReview && editingReviewId !== review.reviewId" class="review-actions">
                <button class="action-btn edit-btn" @click="startEdit(review)">✎</button>
                <button class="action-btn delete-btn" @click="handleDeleteReview(review.reviewId)">✕</button>
              </div>
            </div>

            <button v-if="reviews.length > displayCount" class="more-reviews-btn" @click="showMoreReviews">
              {{ t("placeDetailModal.showMore") }} ⌄
            </button>
          </div>
          <div v-else class="no-reviews">
            <p>{{ t("placeDetailModal.noReviews") }}</p>
          </div>
        </div>
      </div>

      <div class="modal-actions" v-if="$slots.footer && detail">
        <slot name="footer" :place="detail"></slot>
      </div>

      <div v-if="!detail" class="loading-state">
        <p>{{ t("placeDetailModal.loadingInfo") }}</p>
      </div>
    </div>

    <div v-if="selectedImage" class="image-viewer-overlay" @click.stop="closeImageModal">
      <div class="image-viewer-content" @click.stop>
        <img :src="selectedImage" class="enlarged-image" />
        <button class="close-viewer-btn" @click="closeImageModal">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePlace } from "@/composables/usePlace";
import { getCategoryName } from "@/utils/categoryUtils";
import { introKeyMap } from "@/constants/place";
import { getReviews, addReview, deleteReview, updateReview, addLike, removeLike } from "@/api/place";

const props = defineProps({
  placeId: {
    type: [Number, String],
    default: null,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "update-place"]);
const { t } = useI18n();
const { selectedPlace: detail, getPlaceDetail } = usePlace();
const isOverviewExpanded = ref(false);
const selectedImage = ref(null);

const openImageModal = (img) => {
  selectedImage.value = img;
};

const closeImageModal = () => {
  selectedImage.value = null;
};

// 리뷰 관련 상태
const reviews = ref([]);
const newReview = ref({
  rating: 5,
  content: "",
});
const isSubmitting = ref(false);
const displayCount = ref(3);

// 수정 관련 상태
const editingReviewId = ref(null);
const editForm = ref({
  rating: 5,
  content: "",
});

const displayedReviews = computed(() => {
  return reviews.value.slice(0, displayCount.value);
});

const fetchReviews = async () => {
  if (!props.placeId) return;
  try {
    const response = await getReviews(props.placeId);
    if (response && response.data) {
      reviews.value = response.data;
    } else {
      reviews.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    reviews.value = [];
  }
};

const submitReview = async () => {
  if (isSubmitting.value) return;
  if (!newReview.value.rating) {
    alert(t("placeDetailModal.alerts.selectRating"));
    return;
  }

  isSubmitting.value = true;
  try {
    await addReview(props.placeId, newReview.value);
    newReview.value = { rating: 5, content: "" };
    await fetchReviews(); // 리뷰 목록 갱신
    await getPlaceDetail(props.placeId); // 장소 정보(평점 등) 갱신
    emit("update-place", detail.value);
    // alert(t("placeDetailModal.alerts.reviewAdded"));
  } catch (error) {
    console.error("Failed to submit review:", error);
    if (error.response && error.response.status === 409) {
      alert(t("placeDetailModal.alerts.reviewAlready"));
    } else {
      alert(t("placeDetailModal.alerts.reviewAddFail"));
    }
  } finally {
    isSubmitting.value = false;
  }
};

const startEdit = (review) => {
  editingReviewId.value = review.reviewId;
  editForm.value = {
    rating: review.rating,
    content: review.content,
  };
};

const cancelEdit = () => {
  editingReviewId.value = null;
  editForm.value = { rating: 5, content: "" };
};

const handleUpdateReview = async () => {
  if (!editForm.value.rating) {
    alert(t("placeDetailModal.alerts.selectRating"));
    return;
  }

  try {
    await updateReview(editingReviewId.value, editForm.value);
    await fetchReviews();
    await getPlaceDetail(props.placeId);
    emit("update-place", detail.value);
    cancelEdit();
    alert(t("placeDetailModal.alerts.reviewUpdated"));
  } catch (error) {
    console.error("Failed to update review:", error);
    alert(t("placeDetailModal.alerts.reviewUpdateFail"));
  }
};

const handleDeleteReview = async (reviewId) => {
  if (!confirm(t("placeDetailModal.alerts.confirmDelete"))) return;
  try {
    await deleteReview(reviewId);
    await fetchReviews();
    await getPlaceDetail(props.placeId);
    emit("update-place", detail.value);
    alert(t("placeDetailModal.alerts.reviewDeleted"));
  } catch (error) {
    console.error("Failed to delete review:", error);
    alert(t("placeDetailModal.alerts.reviewDeleteFail"));
  }
};

const toggleLike = async () => {
  if (!detail.value) return;

  try {
    if (detail.value.liked) {
      await removeLike(detail.value.placeId);
      detail.value.liked = false;
      detail.value.likeCount = Math.max(0, (detail.value.likeCount || 0) - 1);
    } else {
      await addLike(detail.value.placeId);
      detail.value.liked = true;
      detail.value.likeCount = (detail.value.likeCount || 0) + 1;
    }
    emit("update-place", detail.value);
  } catch (error) {
    console.error("Failed to toggle like:", error);
    if (error.response && error.response.status === 401) {
      alert(t("placeDetailModal.alerts.loginRequired"));
    }
  }
};

const showMoreReviews = () => {
  displayCount.value += 5;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(
    2,
    "0"
  )}`;
};

watch(
  () => props.placeId,
  async (newId) => {
    if (newId && props.isVisible) {
      isOverviewExpanded.value = false;
      await getPlaceDetail(newId);
      await fetchReviews();
      displayCount.value = 3;
      newReview.value = { rating: 5, content: "" };
      cancelEdit();
    }
  },
  { immediate: true }
);

watch(
  () => props.isVisible,
  async (newVal) => {
    if (newVal && props.placeId) {
      // 모달이 열릴 때 데이터 갱신
      await getPlaceDetail(props.placeId);
      await fetchReviews();
      displayCount.value = 3;
      newReview.value = { rating: 5, content: "" };
      cancelEdit();
    }
  }
);

watch(
  () => props.isVisible,
  async (newVal) => {
    if (newVal && props.placeId) {
      await getPlaceDetail(props.placeId);
    }
  }
);

const processedIntro = computed(() => {
  if (!detail.value || !detail.value.intro || Object.keys(detail.value.intro).length === 0) {
    return [];
  }

  return Object.entries(detail.value.intro)
    .filter(([key]) => key !== "contentid")
    .map(([key, value]) => {
      let displayValue = value;
      if (key === "contenttypeid") {
        displayValue = getCategoryName(value);
      }
      return {
        key: introKeyMap[key] || key,
        value: displayValue,
      };
    });
});

const handleImageError = (e) => {
  e.target.style.display = "none";
};

const close = () => {
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a3a2a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.info-group {
  margin-bottom: 1.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
}

.info-text {
  color: #4a3a2a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.info-content {
  color: #4b5563;
  line-height: 1.6;
}

.info-content.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-btn {
  background: none;
  border: none;
  color: #4a3a2a;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-decoration: underline;
}

.more-btn:hover {
  color: #2c2219;
}

.intro-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

.intro-list li {
  font-size: 0.9rem;
  color: #4b5563;
  background-color: #f9fafb;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.intro-key {
  font-weight: 600;
  color: #4a3a2a;
  font-size: 0.8rem;
  opacity: 0.8;
}

.intro-value {
  word-break: break-all;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.modal-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.modal-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f3f4f6;
  background-color: white;
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

/* 리뷰 섹션 스타일 */
.review-section {
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.review-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.rating-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.star-icon {
  color: #fbbf24;
}

.score {
  font-weight: bold;
  font-size: 1.2rem;
}

.max-score {
  color: #9ca3af;
  font-size: 0.9rem;
}

.review-count {
  color: #6b7280;
  font-size: 0.9rem;
  margin-left: 0.2rem;
}

.like-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #ef4444;
  font-weight: 500;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.like-info:hover {
  background-color: #fee2e2;
}

.review-form {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.rating-input {
  margin-bottom: 0.5rem;
  display: flex;
  gap: 0.2rem;
}

.star {
  cursor: pointer;
  color: #d1d5db;
  font-size: 1.5rem;
  transition: color 0.2s;
}

.star.active {
  color: #fbbf24;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.input-wrapper input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.9rem;
}

.input-wrapper button {
  padding: 0.5rem 1rem;
  background-color: #4a3a2a;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.input-wrapper button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-header {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.review-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.review-user-profile {
  flex-shrink: 0;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e5e7eb;
}

.review-content-wrapper {
  flex: 1;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.nickname {
  font-weight: 600;
  font-size: 0.9rem;
}

.date {
  color: #9ca3af;
  font-size: 0.8rem;
}

.user-rating {
  display: flex;
  gap: 0.1rem;
}

.star-small {
  color: #d1d5db;
  font-size: 0.8rem;
}

.star-small.filled {
  color: #fbbf24;
}

.review-text {
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.4;
}

.delete-review-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem;
}

.delete-review-btn:hover {
  color: #ef4444;
}

.review-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem;
}

.action-btn:hover {
  color: #4a3a2a;
}

.delete-btn:hover {
  color: #ef4444;
}

.edit-form {
  width: 100%;
}

.pointer {
  cursor: pointer;
}

.edit-input-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.edit-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.9rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.save-btn {
  padding: 0.5rem 1rem;
  background-color: #4a3a2a;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  color: #4b5563;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
}

.more-reviews-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;
}

.more-reviews-btn:hover {
  background-color: #e5e7eb;
}

.no-reviews {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.modal-image {
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-image:hover {
  filter: brightness(0.7) blur(1px);
  transform: scale(1.02);
}

.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.enlarged-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.close-viewer-btn {
  position: fixed;
  top: 30px;
  right: 30px;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
  padding: 10px;
  z-index: 2001;
}

.close-viewer-btn:hover {
  color: #fbbf24;
}
</style>
