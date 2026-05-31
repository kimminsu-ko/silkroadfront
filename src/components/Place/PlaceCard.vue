<template>
  <div class="place-card" @click="$emit('click', place)">
    <div class="image-wrapper">
      <img v-if="place.firstImage && !imageError" :src="place.firstImage" @error="handleImageError" alt="place" />
      <div v-else class="placeholder-emoji">
        {{ getCategoryMapIcon(place.placeTypeId) }}
      </div>
      <button class="like-btn" @click.stop="$emit('toggleLike', place)">
        <PhHeart v-if="place.liked" :size="24" weight="fill" color="#ff385c" />
        <PhHeart
          v-else
          :size="24"
          weight="regular"
          color="white"
          style="filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5))"
        />
      </button>
    </div>
    <div class="card-info">
      <div class="card-header">
        <h3 class="place-title">{{ place.title }}</h3>
        <div class="rating-like-wrapper">
          <span class="rating">★ {{ place.ratingAvg || "0.0" }}</span>
          <span class="like-count">❤️ {{ place.likeCount || 0 }}</span>
        </div>
      </div>
      <p class="place-desc">{{ place.addr1 }}</p>
      <p class="place-cat">
        {{ getCategoryName(place.placeTypeId) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { PhHeart } from "@phosphor-icons/vue";
import { getCategoryName, getCategoryMapIcon } from "@/utils/categoryUtils";

const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
});

defineEmits(["click", "toggleLike"]);

const imageError = ref(false);
const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.place-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 비율 */
  height: 0;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.placeholder-emoji {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background-color: #f3f4f6;
  transition: transform 0.3s;
}

.place-card:hover .placeholder-emoji {
  transform: scale(1.05);
}

.place-card:hover .image-wrapper img {
  transform: scale(1.05);
}

.like-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.2s;
}

.like-btn:hover {
  transform: scale(1.1);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.place-title {
  font-size: 1rem;
  font-weight: 600;
  color: #222;
  margin: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.rating-like-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating {
  font-size: 0.9rem;
  color: #222;
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-count {
  font-size: 0.85rem;
  color: #666;
}

.place-desc {
  font-size: 0.9rem;
  color: #717171;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-cat {
  font-size: 0.9rem;
  color: #222;
  font-weight: 500;
  margin: 0;
}
</style>
