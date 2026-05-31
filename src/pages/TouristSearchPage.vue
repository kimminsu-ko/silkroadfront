<template>
  <div class="tourist-search-page">
    <!-- 분할 레이아웃 콘텐츠 -->
    <div class="content-container">
      <div class="split-layout">
        <!-- 왼쪽 패널: 검색 + 목록 -->
        <div class="left-panel">
          <!-- 검색바 영역 -->
          <div class="search-area" :class="{ expanded: isSearchExpanded }">
            <!-- 오버레이 -->
            <div class="search-overlay" v-if="isSearchExpanded" @click="closeSearch"></div>

            <!-- 축소된 검색바 -->
            <div class="compact-search-bar" v-if="!isSearchExpanded" @click="openSearch">
              <div class="compact-text">{{ searchSummary }}</div>
              <button class="compact-icon-btn">
                <svg
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  style="
                    display: block;
                    fill: none;
                    height: 12px;
                    width: 12px;
                    stroke: white;
                    stroke-width: 5.33333;
                    overflow: visible;
                  "
                >
                  <path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2 2 6.925 2 13s4.925 11 11 11zm8-3 9 9"></path>
                </svg>
              </button>
            </div>

            <div class="search-bar" v-else>
              <!-- 1. 지역 -->
              <div class="search-item" :class="{ active: activeTab === 'region' }" @click.stop="toggleTab('region')">
                <div class="label">{{ t("touristSearch.region") }}</div>
                <div class="value">
                  {{ getRegionName(selectedRegion) || t("touristSearch.regionPlaceholder") }}
                </div>
                <div class="dropdown region-dropdown" v-if="activeTab === 'region'" @click.stop>
                  <div class="dropdown-grid">
                    <div
                      v-for="region in regionData"
                      :key="region.code"
                      class="dropdown-item"
                      @click="selectRegion(region.code)"
                    >
                      {{ region.name }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <!-- 2. 시군구 -->
              <div class="search-item" :class="{ active: activeTab === 'sigungu' }" @click.stop="toggleTab('sigungu')">
                <div class="label">{{ t("touristSearch.sigungu") }}</div>
                <div class="value">
                  {{ getSigunguName(selectedSigungu) || t("touristSearch.sigunguPlaceholder") }}
                </div>
                <div class="dropdown" v-if="activeTab === 'sigungu'" @click.stop>
                  <div v-if="!selectedRegion" class="empty-msg">{{ t("touristSearch.regionRequired") }}</div>
                  <div v-else class="dropdown-list">
                    <div class="dropdown-item" @click="selectSigungu('')" :class="{ selected: !selectedSigungu }">
                      {{ t("touristSearch.all") }}
                    </div>
                    <div
                      v-for="sigungu in sigunguOptions"
                      :key="sigungu.code"
                      class="dropdown-item"
                      @click="selectSigungu(sigungu.code)"
                      :class="{ selected: selectedSigungu === sigungu.code }"
                    >
                      {{ sigungu.name }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <!-- 3. 카테고리 -->
              <div
                class="search-item"
                :class="{ active: activeTab === 'category' }"
                @click.stop="toggleTab('category')"
              >
                <div class="label">{{ t("touristSearch.category") }}</div>
                <div class="value">
                  {{ getCategoryLabel(selectedCategory) || t("touristSearch.categoryPlaceholder") }}
                </div>
                <div class="dropdown" v-if="activeTab === 'category'" @click.stop>
                  <div class="dropdown-list">
                    <div class="dropdown-item" @click="selectCategory('')" :class="{ selected: !selectedCategory }">
                      {{ t("touristSearch.categoryAll") }}
                    </div>
                    <div
                      v-for="cat in categories"
                      :key="cat.value"
                      class="dropdown-item"
                      @click="selectCategory(cat.value)"
                      :class="{ selected: selectedCategory === cat.value }"
                    >
                      {{ cat.label }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <!-- 4. 검색어 및 검색 버튼 -->
              <div class="search-item input-item">
                <div class="input-wrapper">
                  <div class="label">{{ t("touristSearch.keyword") }}</div>
                  <input
                    type="text"
                    v-model="searchKeyword"
                    :placeholder="t('touristSearch.keywordPlaceholder')"
                    @keyup.enter="handleSearch"
                  />
                </div>
                <button class="search-btn" @click="handleSearch">
                  <svg
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    style="
                      display: block;
                      fill: none;
                      height: 16px;
                      width: 16px;
                      stroke: white;
                      stroke-width: 4;
                      overflow: visible;
                    "
                  >
                    <path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2 2 6.925 2 13s4.925 11 11 11zm8-3 9 9"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 왼쪽: 목록 -->
          <div class="list-section">
            <!-- 결과 헤더 -->
            <div class="results-header" v-if="totalCount > 0">
              <span class="count-text"> {{ t("touristSearch.resultCount", { count: totalCount }) }}</span>
              <select v-model="sortOrder" @change="handleSearch" class="sort-select">
                <option value="">{{ t("touristSearch.sortDefault") }}</option>
                <option value="likes">{{ t("touristSearch.sortLikes") }}</option>
              </select>
            </div>

            <!-- 그리드 레이아웃 -->
            <div class="places-grid">
              <PlaceCard
                v-for="place in places"
                :key="place.placeId"
                :place="place"
                @click="selectPlace(place.placeId)"
                @toggleLike="handleToggleLike"
              />
            </div>

            <!-- 페이지네이션 -->
            <Pagination
              v-if="totalCount > 0"
              :currentPage="currentPage"
              :totalPages="totalPages"
              @changePage="changePage"
            />
          </div>
        </div>

        <!-- 오른쪽: 지도 -->
        <div class="map-section">
          <NaverMap ref="naverMapRef" :markers="mapMarkers" @markerClick="handleMarkerClick" />
        </div>
      </div>
    </div>

    <!-- 장소 상세 모달 -->
    <PlaceDetailModal
      :placeId="selectedPlaceId"
      :isVisible="!!selectedPlaceId"
      @close="closePlaceDetail"
      @update-place="handlePlaceUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import PlaceDetailModal from "@/components/Place/PlaceDetailModal.vue";
import PlaceCard from "@/components/Place/PlaceCard.vue";
import Pagination from "@/components/Common/Pagination.vue";
import NaverMap from "@/components/NaverMap/NaverMap.vue";
import { usePlace } from "@/composables/usePlace";
import { useRegionSelection } from "@/composables/useRegionSelection";
import { usePagination } from "@/composables/usePagination";
import { regionData } from "@/constants/regions";
import { getCategoryName, getCategoryMapIcon, getCategoryColor } from "@/utils/categoryUtils";
import { getInfoWindowContent } from "@/utils/mapInfoWindow";
import { addLike, removeLike } from "@/api/place";

const { places, isLoading, totalCount, searchPlaces } = usePlace();
const { t } = useI18n();
const imageErrorIds = ref(new Set());

const handleImageError = (placeId) => {
  imageErrorIds.value.add(placeId);
};

const { selectedRegion, selectedSigungu, sigunguOptions } = useRegionSelection();
// 페이지네이션 제한 12로 변경
const { currentPage, pageSize, totalPages, setPage } = usePagination(totalCount, 12);

const selectedCategory = ref("");
const searchKeyword = ref("");
const selectedPlaceId = ref(null);
const sortOrder = ref("");
const activeTab = ref(null); // 'region', 'sigungu', 'category'
const naverMapRef = ref(null);
const isSearchExpanded = ref(false); // 검색바 확장 상태

const categories = computed(() => [
  { value: "", label: t("touristSearch.categoryAll") },
  { value: "12", label: t("touristSearch.category12") },
  { value: "14", label: t("touristSearch.category14") },
  { value: "15", label: t("touristSearch.category15") },
  { value: "28", label: t("touristSearch.category28") },
  { value: "32", label: t("touristSearch.category32") },
  { value: "38", label: t("touristSearch.category38") },
  { value: "39", label: t("touristSearch.category39") },
]);

// 지도 마커
const mapMarkers = computed(() => {
  return places.value.map((place) => ({
    lat: place.mapY,
    lng: place.mapX,
    title: place.title,
    image: place.firstImage,
    placeId: place.placeId,
    type: place.placeTypeId,
    icon: getCategoryMapIcon(place.placeTypeId),
    color: getCategoryColor(place.placeTypeId),
  }));
});

// UI 헬퍼 함수
const getRegionName = (code) => regionData.find((r) => r.code === code)?.name || "";
const getSigunguName = (code) => sigunguOptions.value.find((s) => s.code === code)?.name || "";
const getCategoryLabel = (val) => categories.value.find((c) => c.value === val)?.label || "";

// 검색 요약 텍스트
const searchSummary = computed(() => {
  const region = getRegionName(selectedRegion.value) || t("touristSearch.summaryDefault");
  const sigungu = getSigunguName(selectedSigungu.value);
  const category = getCategoryLabel(selectedCategory.value);
  const keyword = searchKeyword.value;

  const parts = [region];
  if (sigungu) parts.push(sigungu);
  if (category) parts.push(category);
  if (keyword) parts.push(keyword);

  return parts.join(" | ");
});

const openSearch = () => {
  isSearchExpanded.value = true;
  // 확장 시 지역이 선택 안되어 있으면 지역 탭 열기
  if (!selectedRegion.value) {
    activeTab.value = "region";
  }
};

const closeSearch = () => {
  isSearchExpanded.value = false;
  activeTab.value = null;
};

const toggleTab = (tab) => {
  if (activeTab.value === tab) {
    activeTab.value = null;
  } else {
    activeTab.value = tab;
  }
};

const selectRegion = (code) => {
  selectedRegion.value = code;
  activeTab.value = "sigungu"; // Auto switch to next step
};

const selectSigungu = (code) => {
  selectedSigungu.value = code;
  activeTab.value = null;
};

const selectCategory = (val) => {
  selectedCategory.value = val;
  activeTab.value = null;
};

// 외부 클릭 시 드롭다운 닫기
const closeDropdowns = () => {
  activeTab.value = null;
};

const handleToggleLike = async (place) => {
  try {
    if (place.liked) {
      await removeLike(place.placeId);
      place.liked = false;
      place.likeCount = Math.max(0, (place.likeCount || 0) - 1);
    } else {
      await addLike(place.placeId);
      place.liked = true;
      place.likeCount = (place.likeCount || 0) + 1;
    }
  } catch (error) {
    console.error(t("touristSearch.likeFailLog"), error);
    if (error.response && error.response.status === 401) {
      alert(t("touristSearch.loginRequired"));
    }
  }
};

const handlePlaceUpdate = (updatedPlace) => {
  if (!updatedPlace) return;

  const index = places.value.findIndex((p) => p.placeId === updatedPlace.placeId);
  if (index !== -1) {
    // 목록에 있는 장소 정보 업데이트
    places.value[index] = {
      ...places.value[index],
      liked: updatedPlace.liked,
      likeCount: updatedPlace.likeCount,
      ratingAvg: updatedPlace.ratingAvg,
      reviewCount: updatedPlace.reviewCount,
    };
  }
};

const fetchPlaces = async (page) => {
  if (!selectedRegion.value) {
    alert(t("touristSearch.selectRegionAlert"));
    return;
  }

  const params = {
    areaCode: selectedRegion.value,
    page: page,
    size: 12,
  };

  if (selectedSigungu.value) {
    params.sigunguCode = selectedSigungu.value;
  }
  if (selectedCategory.value) {
    params.placeTypeId = selectedCategory.value;
  }
  if (searchKeyword.value) {
    params.keyword = searchKeyword.value;
  }
  if (sortOrder.value) {
    params.sort = sortOrder.value;
  }

  await searchPlaces(params);
};

const handleSearch = async () => {
  activeTab.value = null;
  closeSearch(); // 검색 후 닫기
  setPage(1);
  await fetchPlaces(1);
};

const changePage = async (page) => {
  if (setPage(page)) {
    await fetchPlaces(page);
    // 윈도우가 아닌 목록 섹션 상단으로 스크롤
    const listSection = document.querySelector(".list-section");
    if (listSection) listSection.scrollTop = 0;
  }
};

const selectPlace = (id, shouldCenter = true) => {
  // 선택된 장소로 지도 중심 이동
  const place = places.value.find((p) => p.placeId === id);
  if (place && naverMapRef.value) {
    if (shouldCenter) {
      naverMapRef.value.setCenter(place.mapY, place.mapX);
    }
    const content = getInfoWindowContent({
      id: id,
      title: place.title,
      category: getCategoryName(place.placeTypeId),
      address: place.addr1,
    });
    naverMapRef.value.openInfoWindow(place.mapY, place.mapX, content);
  }
};

const handleMarkerClick = (marker) => {
  selectPlace(marker.placeId, false);
};

const closePlaceDetail = () => {
  selectedPlaceId.value = null;
};

const openDetailHandler = (e) => {
  selectedPlaceId.value = e.detail;
};

const closeInfoWindowHandler = () => {
  if (naverMapRef.value) {
    naverMapRef.value.closeInfoWindow();
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdowns);
  window.addEventListener("open-place-detail", openDetailHandler);
  window.addEventListener("close-info-window", closeInfoWindowHandler);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdowns);
  window.removeEventListener("open-place-detail", openDetailHandler);
  window.removeEventListener("close-info-window", closeInfoWindowHandler);
});
</script>

<style scoped>
.tourist-search-page {
  height: calc(100vh - 64px);
  background-color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 왼쪽 패널 */
.left-panel {
  display: flex;
  flex-direction: column;
  width: 50%; /* 50% split */
  min-width: 500px;
  height: 100%;
  border-right: 1px solid #e5e7eb;
  background-color: white;
  z-index: 10;
  position: relative;
}

/* 검색 영역 */
.search-area {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: center;
  background-color: white;
  position: relative;
  z-index: 51; /* Higher than overlay */
  transition: padding 0.2s ease;
}

.search-area.expanded {
  padding-bottom: 40px;
}

/* 오버레이 */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2); /* Light gray dimming */
  z-index: 50;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 축소된 검색바 */
.compact-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border: 1px solid #dddddd;
  border-radius: 40px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
  height: 48px;
  width: 300px;
  padding: 0 8px 0 24px;
  cursor: pointer;
}

.compact-search-bar:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.08);
}

.compact-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}

.compact-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #b8864b;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #dddddd;
  border-radius: 40px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
  height: 66px;
  position: relative;
  z-index: 51; /* Ensure it sits above overlay */
  width: 100%;
  max-width: 800px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    transform: scale(0.9) translateY(-10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.search-bar:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.08);
}

.search-item {
  padding: 14px 24px;
  border-radius: 32px;
  cursor: pointer;
  position: relative;
  flex: 1;
  min-width: 0; /* Allow shrinking */
  transition: background-color 0.2s;
}

.search-item:hover {
  background-color: #f7f7f7;
}

.search-item.active {
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.search-item.input-item {
  display: flex;
  align-items: center;
  padding-right: 10px;
  flex: 1.5; /* Give more space to input */
}

.search-item.input-item:hover {
  background-color: transparent; /* Input area handles hover */
}

.input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.input-wrapper input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #222;
  font-weight: 600;
  width: 100%;
  padding: 0;
  margin-top: 2px;
}

.input-wrapper input::placeholder {
  color: #717171;
  font-weight: 400;
}

.label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 2px;
}

.value {
  font-size: 0.9rem;
  color: #717171;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active .value {
  color: #222;
}

.divider {
  width: 1px;
  height: 32px;
  background-color: #dddddd;
  flex-shrink: 0;
}

.search-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #b8864b;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 10px;
  flex-shrink: 0;
}

.search-btn:hover {
  background-color: #9b7242;
}

/* 드롭다운 */
.dropdown {
  position: absolute;
  top: 120%;
  left: 0;
  background: white;
  border-radius: 32px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
  padding: 24px;
  min-width: 300px;
  z-index: 20;
  cursor: default;
}

.region-dropdown {
  min-width: 400px;
}

.dropdown-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #222;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background-color: #f7f7f7;
}

.dropdown-item.selected {
  font-weight: 700;
  background-color: #f7f7f7;
}

.empty-msg {
  color: #717171;
  text-align: center;
  padding: 20px;
}

/* 콘텐츠 영역 */
.content-container {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.split-layout {
  display: flex;
  height: 100%;
}

.list-section {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.map-section {
  flex: 1; /* Map takes remaining space */
  height: 100%;
  position: relative;
  background-color: #f0f0f0;
}

.map-section :deep(.map) {
  width: 100% !important;
  height: 100% !important;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.count-text {
  font-size: 1rem;
  font-weight: 600;
  color: #222;
}

.sort-select {
  border: none;
  font-size: 0.9rem;
  color: #222;
  cursor: pointer;
  outline: none;
  background: transparent;
}

/* 그리드 레이아웃 */
.places-grid {
  display: grid;
  /* Use auto-fill with minmax to automatically adjust columns based on available width */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .list-section {
    min-width: 500px;
    flex: 0 0 50%;
  }
}

@media (max-width: 900px) {
  .tourist-search-page {
    height: auto;
    overflow: visible;
  }

  .content-container {
    height: auto;
    overflow: visible;
  }

  .split-layout {
    flex-direction: column-reverse;
    height: auto;
  }

  .map-section {
    height: 300px;
    width: 100%;
  }

  .list-section {
    min-width: 100%;
    overflow-y: visible;
    flex: auto;
  }
}

@media (max-width: 600px) {
  /* 필요 시 모바일 조정 */
}

/* 장소 카드 */
.place-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 비율 (높이/너비 * 100) */
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

/* 페이지네이션 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #222;
  background-color: #f7f7f7;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  font-weight: 500;
}
</style>
