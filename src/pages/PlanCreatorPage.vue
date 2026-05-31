<template>
  <div class="plan-creator-page">
    <div class="layout-container">
      <!-- 좌측 사이드바 -->
      <aside class="sidebar-panel">
        <!-- 1. 여행 정보 헤더 (제목/날짜) -->
        <div class="sidebar-header">
          <div class="trip-title-row">
            <input
              type="text"
              class="compact-input title-input"
              :placeholder="t('planCreator.titlePlaceholder')"
              v-model="tripTitle"
            />
          </div>
          <div class="trip-date-row">
            <VueDatePicker
              v-model="tripDates"
              range
              :enable-time-picker="false"
              auto-apply
              :clearable="false"
              class="date-picker-custom"
            >
              <template #trigger>
                <div class="custom-date-display">
                  <span class="text">
                    {{ formatTripDates(tripDates) || t("planCreator.datePlaceholder") }}
                  </span>
                </div>
              </template>
            </VueDatePicker>
          </div>
          <div class="trip-tags-row">
            <!-- 지역 선택 -->
            <button
              class="tag-select-btn region-btn"
              @click="openTagModal('region')"
              :class="{ empty: selectedRegions.length === 0 }"
            >
              <span v-if="selectedRegions.length === 0">{{ t("planCreator.selectRegionRequired") }}</span>
              <span v-else class="region-tags">
                📍 {{ selectedRegions.map((k) => t(`planCreator.regions.${k}`)).join(", ") }}
              </span>
            </button>

            <!-- 테마 선택 -->
            <button class="tag-select-btn theme-btn" @click="openTagModal('theme')">
              <span v-if="selectedTags.length === 0">{{ t("planCreator.selectThemeSeason") }}</span>
              <span v-else class="theme-tags"> # {{ selectedTags.map(getTagLabel).join(", ") }} </span>
            </button>
          </div>
        </div>

        <!-- 2. 검색창 (Expandable) -->
        <div class="search-section" :class="{ expanded: isSearchExpanded }">
          <!-- Compact View -->
          <div class="compact-search-bar" v-if="!isSearchExpanded" @click="openSearch">
            <div class="compact-content">
              <span class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                  />
                </svg>
              </span>
              <span class="search-summary-text">{{ searchSummary }}</span>
            </div>
            <button class="expand-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path
                  fill-rule="evenodd"
                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>
          </div>

          <!-- Expanded View -->
          <div class="expanded-search-form" v-else>
            <div class="expanded-header">
              <span class="expanded-title">{{ t("planCreator.searchTitle") || "장소 검색" }}</span>
              <button class="close-search-btn" @click.stop="closeSearch">✕</button>
            </div>

            <!-- 지역 & 시군구 -->
            <div class="search-row">
              <select class="compact-select flex-grow" v-model="searchRegion">
                <option v-for="region in regionData" :key="region.code" :value="region.code">
                  {{ region.name }}
                </option>
              </select>
              <select class="compact-select flex-grow" v-model="searchSigungu" :disabled="!searchRegion">
                <option value="">{{ t("planCreator.all") }}</option>
                <option v-for="sigungu in sigunguOptions" :key="sigungu.code" :value="sigungu.code">
                  {{ sigungu.name }}
                </option>
              </select>
            </div>

            <!-- 카테고리 -->
            <div class="search-row">
              <select class="compact-select full-width" v-model="searchCategory">
                <option value="">{{ t("planCreator.allCategories") }}</option>
                <option v-for="(name, code) in categoryNameMap" :key="code" :value="code">
                  {{ name }}
                </option>
              </select>
            </div>

            <!-- 키워드 & 버튼 -->
            <div class="search-row search-input-box">
              <input
                type="text"
                class="search-input"
                :placeholder="t('planCreator.searchPlaceholder')"
                v-model="searchKeyword"
                @keyup.enter="handleSearch"
              />
              <button class="search-btn" @click="handleSearch">{{ t("planCreator.search") }}</button>
            </div>
          </div>
        </div>

        <!-- 3. 메인 컨텐츠 (스케줄 vs 검색결과) -->
        <div class="sidebar-content">
          <!-- 탭 전환 (항상 표시) -->
          <div class="content-tabs">
            <button class="tab-btn" :class="{ active: activeTab === 'schedule' }" @click="activeTab = 'schedule'">
              {{ t("planCreator.tabSchedule") }}
            </button>
            <button class="tab-btn" :class="{ active: activeTab === 'search' }" @click="activeTab = 'search'">
              {{ t("planCreator.tabSearchResults") }} ({{ totalCount }})
            </button>
          </div>

          <!-- A. 스케줄 뷰 -->
          <div v-show="activeTab === 'schedule'" class="view-container schedule-view">
            <div class="day-selector">
              <div v-if="availableDays.length === 1" class="single-day-label">Day 1</div>
              <select v-else v-model="selectedDay" class="day-select">
                <option v-for="day in availableDays" :key="day" :value="day">Day {{ day.replace("day", "") }}</option>
              </select>
              <button class="add-day-btn" @click="addDay" :title="t('planCreator.addDayTitle')">+</button>
            </div>

            <div class="schedule-list">
              <div v-if="currentSchedule.length === 0" class="empty-state">
                <span class="empty-icon">🗺️</span>
                {{ t("planCreator.scheduleEmptyTitle") }}<br />
                {{ t("planCreator.scheduleEmptyDesc") }}
              </div>
              <ScheduleItem
                v-else
                v-for="(place, index) in currentSchedule"
                :key="place.id"
                :place="place"
                :index="index"
                :dragOverIndex="dragOverIndex"
                :dragSourceIndex="dragSourceIndex"
                @remove="removePlace"
                @update:memo="(val) => (place.memo = val)"
                @dragstart="onDragStart"
                @dragover="onDragOver"
                @drop="onDrop"
                @dragenter="onDragEnter"
                @dragend="onDragEnd"
              />
            </div>
          </div>

          <!-- B. 검색 결과 뷰 -->
          <div v-show="activeTab === 'search'" class="view-container search-view" ref="searchViewContainer">
            <div
              class="sort-controls"
              style="padding: 0.5rem 1rem; display: flex; justify-content: flex-end; border-bottom: 1px solid #f3f4f6"
            >
              <select v-model="sortOrder" @change="handleSearch" class="compact-select" style="width: auto">
                <option value="">{{ t("planCreator.sortDefault") }}</option>
                <option value="likes">{{ t("planCreator.sortLikes") }}</option>
              </select>
            </div>
            <div class="results-list">
              <SearchResultItem
                v-for="place in searchResults"
                :key="place.id"
                :place="place"
                :isInSchedule="isInSchedule(place.id)"
                @click="focusPlace"
                @toggleSchedule="togglePlaceInSchedule"
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

        <!-- 4. 하단 (저장 버튼) -->
        <div class="sidebar-footer">
          <button class="save-btn-sidebar" @click="savePlan">{{ t("planCreator.save") }}</button>
        </div>
      </aside>

      <!-- 우측 지도 영역 -->
      <main class="map-container">
        <NaverMap
          ref="naverMapRef"
          :markers="mapMarkers"
          :autoFitBounds="false"
          style="width: 100%; height: 100%"
          @markerClick="handleMarkerClick"
          @load="onMapLoad"
        />
      </main>
    </div>

    <!-- 장소 상세 모달 -->
    <PlaceDetailModal :placeId="selectedPlaceId" :isVisible="!!selectedPlaceId" @close="closePlaceDetail">
      <template #footer="{ place }">
        <div class="modal-footer-actions">
          <select v-model="modalTargetDay" class="modal-day-select">
            <option v-for="day in availableDays" :key="day" :value="day">Day {{ day.replace("day", "") }}</option>
          </select>
          <button
            class="btn btn-primary flex-grow"
            :class="{
              remove: isInSchedule(place.id || place.placeId),
            }"
            @click="togglePlaceInSchedule(place, modalTargetDay)"
          >
            <span>{{ isInSchedule(place.id || place.placeId) ? t("planCreator.remove") : t("planCreator.add") }}</span>
          </button>
        </div>
      </template>
    </PlaceDetailModal>

    <!-- 태그 선택 모달 -->
    <div v-if="showTagModal" class="tag-modal-overlay" @click.self="showTagModal = false">
      <div class="tag-modal">
        <div class="tag-modal-header">
          <h3>
            {{ tagModalMode === "region" ? t("planCreator.tagModalRegionTitle") : t("planCreator.tagModalThemeTitle") }}
          </h3>
          <button class="close-btn" @click="showTagModal = false">&times;</button>
        </div>
        <div class="tag-modal-body">
          <div class="tag-section" v-if="tagModalMode === 'region'">
            <h4>
              {{ t("planCreator.tagSectionRegion") }} <span class="required">{{ t("planCreator.required") }}</span>
            </h4>
            <div class="tag-list">
              <span
                v-for="r in regions"
                :key="r.key"
                class="tag-item"
                :class="{ selected: selectedRegions.includes(r.key) }"
                @click="toggleRegion(r.key)"
              >
                {{ r.label }}
              </span>
            </div>
          </div>
          <template v-if="tagModalMode === 'theme'">
            <div class="tag-section">
              <h4>{{ t("planCreator.tagSectionTheme") }}</h4>
              <div class="tag-list">
                <span
                  v-for="th in travelThemes"
                  :key="th.key"
                  class="tag-item"
                  :class="{ selected: selectedTags.includes(th.key) }"
                  @click="toggleTag(th.key)"
                >
                  {{ th.label }}
                </span>
              </div>
            </div>
            <div class="tag-section">
              <h4>{{ t("planCreator.tagSectionSeason") }}</h4>
              <div class="tag-list">
                <span
                  v-for="s in seasons"
                  :key="s.key"
                  class="tag-item"
                  :class="{ selected: selectedTags.includes(s.key) }"
                  @click="toggleTag(s.key)"
                >
                  {{ s.label }}
                </span>
              </div>
            </div>
          </template>
        </div>
        <div class="tag-modal-footer">
          <button class="confirm-btn" @click="showTagModal = false">{{ t("planCreator.confirm") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick, markRaw } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { createPlan, getPlanDetail, updatePlan } from "@/api/plan";
import { searchPlaces } from "@/api/place";
import { regionData } from "@/constants/regions";
import { TRAVEL_THEME_KEYS, SEASON_KEYS, REGION_KEYS } from "@/constants/tags";
import { toServerTag, toServerRegion } from "@/utils/tagMapper";
import {
  getCategoryName,
  getCategoryIcon,
  getCategoryMapIcon,
  categoryNameMap,
  getCategoryColor,
} from "@/utils/categoryUtils";
import ScheduleItem from "@/components/Plan/ScheduleItem.vue";
import SearchResultItem from "@/components/Plan/SearchResultItem.vue";
import Pagination from "@/components/Common/Pagination.vue";
import NaverMap from "@/components/NaverMap/NaverMap.vue";
import PlaceDetailModal from "@/components/Place/PlaceDetailModal.vue";
import { usePagination } from "@/composables/usePagination";

// 상태 관리
const { t, te, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const naverMapRef = ref(null);
const searchViewContainer = ref(null);
const tripTitle = ref(t("planCreator.defaultTitle"));
const isEditMode = ref(false);
const planIdToEdit = ref(null);

const travelThemes = computed(() =>
  TRAVEL_THEME_KEYS.map((x) => ({ key: x.key, label: t(`planCreator.themes.${x.key}`) }))
);
const seasons = computed(() => SEASON_KEYS.map((x) => ({ key: x.key, label: t(`planCreator.seasons.${x.key}`) })));
const regions = computed(() => REGION_KEYS.map((x) => ({ key: x.key, label: t(`planCreator.regions.${x.key}`) })));
const getTagLabel = (k) => {
  const themeKey = `planCreator.themes.${k}`;
  const seasonKey = `planCreator.seasons.${k}`;
  if (te(themeKey)) return t(themeKey);
  if (te(seasonKey)) return t(seasonKey);
  return k; // 번역 없으면 키라도 보여줘라
};

const TAG_KEY_TO_SERVER = Object.fromEntries([...TRAVEL_THEME_KEYS, ...SEASON_KEYS].map((t) => [t.key, t.server]));

const REGION_KEY_TO_SERVER = Object.fromEntries(REGION_KEYS.map((r) => [r.key, r.server]));

const today = new Date();
const defaultEnd = new Date(today);
defaultEnd.setDate(today.getDate() + 2); // 기본 2박 3일

const formatDateToYYYYMMDD = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const tripDates = ref([today, defaultEnd]);
const startDate = ref(formatDateToYYYYMMDD(today));
const endDate = ref(formatDateToYYYYMMDD(defaultEnd));
const selectedTags = ref([]);
const selectedRegions = ref([]);
const showTagModal = ref(false);
const tagModalMode = ref("region"); // 'region' | 'theme'

const openTagModal = (mode) => {
  tagModalMode.value = mode;
  showTagModal.value = true;
};

const toggleRegion = (region) => {
  if (selectedRegions.value.includes(region)) {
    selectedRegions.value = selectedRegions.value.filter((r) => r !== region);
  } else {
    // 지역은 여러 개 선택 가능하도록 (또는 1개만 선택하게 하려면 여기서 제한)
    selectedRegions.value.push(region);
  }
};

const toggleTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag);
  } else {
    if (selectedTags.value.length >= 5) {
      alert(t("planCreator.alertTagLimit"));
      return;
    }
    selectedTags.value.push(tag);
  }
};

const formatTripDates = (dates) => {
  if (!Array.isArray(dates)) return "";

  const [start, end] = dates;
  const fmt = new Intl.DateTimeFormat(locale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const safe = (d) => {
    if (!d) return "";
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    return fmt.format(date);
  };

  const s = safe(start);
  const e = safe(end);

  if (s && e) return `${s} ~ ${e}`;
  if (s) return s;
  return "";
};

// tripDates 변경 시 startDate, endDate 업데이트
watch(tripDates, (newDates) => {
  if (newDates && newDates.length === 2) {
    const start = newDates[0];
    const end = newDates[1];
    if (start) startDate.value = formatDateToYYYYMMDD(start);
    if (end) endDate.value = formatDateToYYYYMMDD(end);
  }
});

const selectedDay = ref("day1");
const modalTargetDay = ref("day1"); // 모달용 선택 날짜
const selectedPlaceId = ref(null);
const activeTab = ref("schedule"); // 'schedule' | 'search'

// selectedDay 변경 시 modalTargetDay도 동기화
watch(selectedDay, (newVal) => {
  modalTargetDay.value = newVal;
});

// 검색 필터
const searchRegion = ref("1"); // 기본값: 서울
const searchSigungu = ref("");
const searchCategory = ref("");
const searchKeyword = ref("");
const sortOrder = ref(""); // 정렬 순서 추가

const isSearchExpanded = ref(false);
const searchSummary = computed(() => {
  const regionName = regionData.find((r) => r.code === searchRegion.value)?.name || t("planCreator.allRegions");
  const sigunguName = sigunguOptions.value.find((s) => s.code === searchSigungu.value)?.name;
  const categoryName = categoryNameMap[searchCategory.value] || t("planCreator.allCategories");
  const keyword = searchKeyword.value;

  const parts = [regionName];
  if (sigunguName) parts.push(sigunguName);
  if (searchCategory.value) parts.push(categoryName);
  if (keyword) parts.push(`"${keyword}"`);

  return parts.join(" · ");
});

const openSearch = () => {
  isSearchExpanded.value = true;
};

const closeSearch = () => {
  isSearchExpanded.value = false;
};

// 시군구 옵션 (지역 선택에 따라 변경)
const sigunguOptions = computed(() => {
  const region = regionData.find((r) => r.code === searchRegion.value);
  return region ? region.sigungu : [];
});

// 지역 변경 시 시군구 초기화
watch(searchRegion, () => {
  searchSigungu.value = "";
});

// 데이터
const searchResults = ref([]);
const totalCount = ref(0);
const { currentPage, pageSize, totalPages, setPage } = usePagination(totalCount, 50);

const mapMarkers = computed(() => {
  const markers = [];
  const addedIds = new Set();

  // 전체 일정에 포함되어 있는지 확인하는 헬퍼 함수
  const isAddedToAnySchedule = (placeId) => {
    return isInSchedule(placeId);
  };

  // 현재 선택된 날짜의 일정에서 순서를 찾는 헬퍼 함수
  const getSequenceInCurrentSchedule = (placeId) => {
    const index = currentSchedule.value.findIndex((p) => String(p.id) === String(placeId));
    return index !== -1 ? index + 1 : null;
  };

  // 1. 검색 결과 마커
  if (activeTab.value === "search") {
    searchResults.value.forEach((place) => {
      if (place.lat && place.lng) {
        const isAdded = isAddedToAnySchedule(place.id);
        const sequence = getSequenceInCurrentSchedule(place.id);
        markers.push({
          lat: place.lat,
          lng: place.lng,
          title: place.name,
          id: place.id,
          type: "search",
          icon: place.mapIcon || getCategoryMapIcon(place.categoryId),
          image: place.firstImage, // 썸네일 이미지
          color: getCategoryColor(place.categoryId), // 카테고리 색상 (ID 기반)
          isAdded: isAdded,
          sequence: sequence, // 순서 추가
        });
        if (isAdded) addedIds.add(String(place.id));
      }
    });
  }

  // 2. 현재 스케줄 마커
  currentSchedule.value.forEach((place, index) => {
    if (place.lat && place.lng) {
      // 검색 탭이고 이미 검색 결과로 표시된 경우 중복 방지
      if (activeTab.value === "search" && addedIds.has(String(place.id))) {
        return;
      }

      markers.push({
        lat: place.lat,
        lng: place.lng,
        title: place.name,
        id: place.id,
        type: "schedule",
        icon: place.mapIcon || getCategoryMapIcon(place.categoryId),
        image: place.firstImage,
        color: getCategoryColor(place.categoryId),
        isAdded: true, // 스케줄에 있는 항목은 항상 추가됨 표시
        sequence: index + 1, // 순서 추가
      });
    }
  });

  return markers;
});

const fetchPlaces = async (page) => {
  try {
    const params = {
      areaCode: searchRegion.value,
      sigunguCode: searchSigungu.value || null,
      placeTypeId: searchCategory.value || null,
      keyword: searchKeyword.value || null,
      sort: sortOrder.value || null, // 정렬 파라미터 추가
      page: page,
      size: pageSize,
    };

    const response = await searchPlaces(params);

    if (response.data && response.data.places) {
      searchResults.value = response.data.places.map((place) => ({
        id: place.placeId,
        name: place.title,
        category: getCategoryName(place.placeTypeId),
        categoryId: place.placeTypeId, // ID 저장
        icon: markRaw(getCategoryIcon(place.placeTypeId)),
        mapIcon: getCategoryMapIcon(place.placeTypeId),
        firstImage: place.firstImage, // 이미지 저장
        likeCount: place.likeCount || 0, // 좋아요 수 추가
        address: place.addr1,
        phone: "",
        lat: place.mapY ? parseFloat(place.mapY) : null,
        lng: place.mapX ? parseFloat(place.mapX) : null,
      }));
      totalCount.value = response.data.totalCount;
    } else {
      searchResults.value = [];
      totalCount.value = 0;
    }
  } catch (error) {
    console.error(t("planCreator.searchFailLog"), error);
    alert(t("planCreator.searchError"));
  }
};

const handleSearch = async () => {
  activeTab.value = "search"; // 검색 시 탭 전환
  isSearchExpanded.value = false; // 검색 후 축소
  setPage(1);
  await fetchPlaces(1);
  if (searchResults.value.length > 0 && naverMapRef.value) {
    naverMapRef.value.fitBounds(searchResults.value);
  }
};

const changePage = async (page) => {
  if (setPage(page)) {
    await fetchPlaces(page);
    if (searchResults.value.length > 0 && naverMapRef.value) {
      naverMapRef.value.fitBounds(searchResults.value);
    }
    await nextTick();
    if (searchViewContainer.value) {
      searchViewContainer.value.scrollTop = 0;
    }
  }
};

const schedule = reactive({
  day1: [],
});

const availableDays = ref(["day1"]);

const addDay = () => {
  const nextDayNum = availableDays.value.length + 1;
  const nextDayKey = `day${nextDayNum}`;
  availableDays.value.push(nextDayKey);
  schedule[nextDayKey] = [];
  selectedDay.value = nextDayKey; // 새로 추가된 날짜로 이동
};

const currentSchedule = computed(() => schedule[selectedDay.value]);

const onMapLoad = () => {
  if (currentSchedule.value.length > 0 && naverMapRef.value) {
    naverMapRef.value.fitBounds(currentSchedule.value);
  }
};

const focusPlace = (place) => {
  if (place.lat && place.lng && naverMapRef.value) {
    naverMapRef.value.setCenter(place.lat, place.lng);
    openInfoWindow(place);
  }
};

const handleMarkerClick = (markerInfo) => {
  // markerInfo는 NaverMap에서 넘어오는 객체 (lat, lng, title, id 등 포함)
  // id를 이용해 place 객체를 찾아야 함
  let place = searchResults.value.find((p) => p.id === markerInfo.id);
  if (!place) {
    place = currentSchedule.value.find((p) => p.id === markerInfo.id);
  }

  if (place) {
    openInfoWindow(place);
  }
};

const savePlan = async () => {
  if (!tripTitle.value) {
    alert(t("planCreator.alertNeedTripTitle"));
    return;
  }
  if (!tripDates.value || tripDates.value.length !== 2) {
    alert(t("planCreator.alertNeedTripDates"));
    return;
  }

  // Prepare places list
  const places = [];
  Object.keys(schedule).forEach((dayKey) => {
    const dayNum = parseInt(dayKey.replace("day", ""));
    schedule[dayKey].forEach((place, index) => {
      places.push({
        placeId: place.id,
        day: dayNum,
        sequence: index + 1,
        memo: place.memo || "",
      });
    });
  });

  if (places.length === 0) {
    alert(t("planCreator.alertNeedPlaces"));
    return;
  }

  if (selectedRegions.value.length === 0) {
    alert(t("planCreator.alertNeedRegionAtLeastOne"));
    showTagModal.value = true;
    return;
  }

  const planData = {
    name: tripTitle.value,
    startDate: startDate.value,
    endDate: endDate.value,
    places,
    tags: selectedTags.value.map(toServerTag),
    regions: selectedRegions.value.map(toServerRegion),
  };
  try {
    let response;
    if (isEditMode.value && planIdToEdit.value) {
      response = await updatePlan(planIdToEdit.value, planData);
    } else {
      response = await createPlan(planData);
    }

    if (response.data.code === "SU") {
      alert(isEditMode.value ? t("planCreator.updated") : t("planCreator.saved"));
      // 저장 성공 시 상세 페이지로 이동
      const targetId = isEditMode.value ? planIdToEdit.value : response.data.planId || response.data.data?.planId;

      if (targetId) {
        router.push(`/plans/${targetId}`);
      } else {
        // ID를 못 찾으면 목록으로 이동
        router.push("/my-plans");
      }
    } else {
      alert(t("planCreator.saveFailPrefix") + response.data.message);
    }
  } catch (error) {
    console.error("Error saving plan:", error);
    alert(t("planCreator.saveError"));
  }
};

const openInfoWindow = (place) => {
  if (!naverMapRef.value) return;

  const dayOptions = availableDays.value
    .map(
      (day) =>
        `<option value="${day}" ${day === selectedDay.value ? "selected" : ""}>Day ${day.replace("day", "")}</option>`
    )
    .join("");

  const isAdded = isInSchedule(place.id);
  const btnText = isAdded ? t("planCreator.remove") : t("planCreator.add");
  const btnStyle = isAdded ? "background:#ef4444; cursor:pointer;" : "background:#4a3a2a; cursor:pointer;";
  const btnAction = isAdded
    ? `window.removeFromSchedule('${place.id}')`
    : `window.addToSchedule('${place.id}', document.getElementById('popup-day-select-${place.id}').value)`;

  const content = `
    <div style="padding:15px; min-width:220px; background:white; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); position: relative;">
      <button onclick="window.closeInfoWindow()" style="position:absolute; top:5px; right:5px; background:none; border:none; font-size:18px; cursor:pointer; color:#999; line-height: 1;">&times;</button>
      <h4 style="margin:0 0 8px 0; font-size:16px; font-weight:bold; color:#333; cursor:pointer; padding-right: 20px;" onclick="window.openDetail('${place.id}')">
        ${place.name} <span style="font-size:12px; color:#888;">></span>
      </h4>
      <p style="margin:0 0 10px 0; font-size:13px; color:#666;">${place.category}</p>
      
      <div style="display: flex; gap: 5px;">
        <select id="popup-day-select-${place.id}" style="flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
          ${dayOptions}
        </select>
        <button 
          id="popup-add-btn-${place.id}"
          onclick="${btnAction}" 
          style="padding:6px 12px; color:white; border:none; border-radius:4px; font-weight:bold; font-size: 12px; white-space: nowrap; ${btnStyle}"
        >
          ${btnText}
        </button>
      </div>
    </div>
  `;

  naverMapRef.value.openInfoWindow(place.lat, place.lng, content);
};

const removePlace = (placeId) => {
  // Remove from all days
  Object.keys(schedule).forEach((dayKey) => {
    schedule[dayKey] = schedule[dayKey].filter((p) => String(p.id) !== String(placeId));
  });
};

const movePlace = (index, direction) => {
  const list = schedule[selectedDay.value];
  if (direction === "up" && index > 0) {
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
  } else if (direction === "down" && index < list.length - 1) {
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
  }
};

// 글로벌 함수 등록
const loadPlanForEdit = async (planId) => {
  try {
    const response = await getPlanDetail(planId);
    if (response.data && response.data.code === "SU") {
      const data = response.data.data;

      tripTitle.value = data.name;

      // Dates
      if (data.startDate && data.endDate) {
        tripDates.value = [new Date(data.startDate), new Date(data.endDate)];
        startDate.value = data.startDate;
        endDate.value = data.endDate;
      }

      selectedTags.value = data.tags || [];
      selectedRegions.value = data.regions || [];

      // Region (Optional: try to match area name to code)
      // const region = regionData.find((r) => r.name === data.area);
      // if (region) {
      //   searchRegion.value = region.code;
      // }

      // Schedule
      // Reset schedule
      for (const key in schedule) {
        delete schedule[key];
      }
      availableDays.value = [];

      if (data.places && Array.isArray(data.places)) {
        // Group by day
        const tempSchedule = {};
        data.places.forEach((item) => {
          const dayKey = `day${item.day}`;
          if (!tempSchedule[dayKey]) tempSchedule[dayKey] = [];

          const placeInfo = item.place || item;

          tempSchedule[dayKey].push({
            id: placeInfo.placeId || placeInfo.id,
            name: placeInfo.title || placeInfo.name,
            category: getCategoryName(placeInfo.placeTypeId || placeInfo.categoryId),
            categoryId: placeInfo.placeTypeId || placeInfo.categoryId,
            icon: markRaw(getCategoryIcon(placeInfo.placeTypeId || placeInfo.categoryId)),
            mapIcon: getCategoryMapIcon(placeInfo.placeTypeId || placeInfo.categoryId),
            firstImage: placeInfo.firstImage || placeInfo.image,
            address: placeInfo.addr1 || placeInfo.address,
            phone: placeInfo.tel || placeInfo.phone || "",
            lat: placeInfo.mapY || placeInfo.lat ? parseFloat(placeInfo.mapY || placeInfo.lat) : null,
            lng: placeInfo.mapX || placeInfo.lng ? parseFloat(placeInfo.mapX || placeInfo.lng) : null,
            memo: item.memo || "",
            sequence: item.sequence,
          });
        });

        // Sort and assign
        Object.keys(tempSchedule)
          .sort((a, b) => {
            const dayA = parseInt(a.replace("day", ""));
            const dayB = parseInt(b.replace("day", ""));
            return dayA - dayB;
          })
          .forEach((dayKey) => {
            availableDays.value.push(dayKey);
            schedule[dayKey] = tempSchedule[dayKey].sort((a, b) => a.sequence - b.sequence);
          });

        // Ensure at least day1 exists
        if (availableDays.value.length === 0) {
          availableDays.value.push("day1");
          schedule["day1"] = [];
        }

        selectedDay.value = "day1";
      }
    } else {
      alert(t("planCreator.loadPlanFail"));
      await router.push("/my-plans");
    }
  } catch (error) {
    console.error("Error loading plan:", error);
    alert(t("planCreator.loadPlanError"));
    await router.push("/my-plans");
  }
};

onMounted(async () => {
  // AI Places Check
  const aiPlacesParam = route.query.aiPlaces;
  if (aiPlacesParam) {
    try {
      const aiPlaces = JSON.parse(aiPlacesParam);
      if (Array.isArray(aiPlaces)) {
        // Reset schedule first if needed, or just append?
        // Usually new plan creation implies empty schedule.

        aiPlaces.forEach((place, index) => {
          const dayKey = `day${place.day || 1}`;

          // Ensure day exists
          if (!schedule[dayKey]) {
            schedule[dayKey] = [];
            if (!availableDays.value.includes(dayKey)) {
              availableDays.value.push(dayKey);
            }
          }

          const newPlace = {
            id: place.placeId || `ai-${Date.now()}-${index}`,
            name: place.name,
            category: getCategoryName(place.placeTypeId),
            categoryId: place.placeTypeId || 0,
            icon: place.placeTypeId ? markRaw(getCategoryIcon(place.placeTypeId)) : null,
            mapIcon: place.placeTypeId ? getCategoryMapIcon(place.placeTypeId) : null,
            firstImage: place.firstImage || null,
            address: place.address,
            phone: "",
            lat: place.lat ? parseFloat(place.lat) : null,
            lng: place.lng ? parseFloat(place.lng) : null,
            memo: t("planCreator.aiRecommendedMemo"),
          };

          schedule[dayKey].push(newPlace);
        });

        // Update trip dates based on max day found
        const maxDay = Math.max(...aiPlaces.map((p) => p.day || 1));
        if (maxDay > 2) {
          // Default is 2 days (day1, day2)
          const newEnd = new Date(today);
          newEnd.setDate(today.getDate() + maxDay - 1); // day 1 is today
          tripDates.value = [today, newEnd];
          endDate.value = formatDateToYYYYMMDD(newEnd);

          // Update availableDays
          availableDays.value = [];
          for (let i = 1; i <= maxDay; i++) {
            availableDays.value.push(`day${i}`);
            if (!schedule[`day${i}`]) schedule[`day${i}`] = [];
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse AI places", e);
    }
  }

  // Edit Mode Check
  const planId = route.params.id || route.query.planId;
  if (planId) {
    isEditMode.value = true;
    planIdToEdit.value = planId;
    await loadPlanForEdit(planId);
  }

  window.addToSchedule = (placeId, dayId) => {
    const place = searchResults.value.find((p) => String(p.id) === String(placeId));
    if (place) {
      addPlaceToSchedule(place, dayId);
    }
  };

  window.removeFromSchedule = (placeId) => {
    removePlace(placeId);
    // 지도 정보창 업데이트를 위해 다시 열거나 닫음
    if (naverMapRef.value) {
      naverMapRef.value.closeInfoWindow();
    }
  };

  window.openDetail = (placeId) => {
    selectedPlaceId.value = placeId;
  };

  window.closeInfoWindow = () => {
    if (naverMapRef.value) {
      naverMapRef.value.closeInfoWindow();
    }
  };
});

onUnmounted(() => {
  delete window.addToSchedule;
  delete window.removeFromSchedule;
  delete window.openDetail;
  delete window.closeInfoWindow;
});

const closePlaceDetail = () => {
  selectedPlaceId.value = null;
};

const isInSchedule = (placeId) => {
  // Check all days
  return Object.values(schedule).some((dayList) => dayList.some((p) => String(p.id) === String(placeId)));
};

const togglePlaceInSchedule = (place, dayId) => {
  const targetDay = dayId || selectedDay.value;
  const placeId = place.id || place.placeId;

  if (isInSchedule(placeId)) {
    removePlace(placeId);
  } else {
    addPlaceToSchedule(place, targetDay);
  }
};

const addPlaceToSchedule = (place, dayId) => {
  const targetDay = dayId || selectedDay.value;
  const placeId = place.id || place.placeId;

  if (isInSchedule(placeId)) {
    alert(t("planCreator.alreadyInSchedule"));
    return;
  }

  let newPlace;
  if (place.placeId && !place.id) {
    // Raw API object check
    newPlace = {
      id: place.placeId,
      name: place.title,
      category: getCategoryName(place.placeTypeId),
      categoryId: place.placeTypeId, // ID 추가
      icon: markRaw(getCategoryIcon(place.placeTypeId)),
      mapIcon: getCategoryMapIcon(place.placeTypeId),
      firstImage: place.firstImage || (place.images && place.images.length > 0 ? place.images[0] : null), // 이미지 추가
      address: place.addr1,
      phone: place.tel || "",
      lat: place.mapY ? parseFloat(place.mapY) : null,
      lng: place.mapX ? parseFloat(place.mapX) : null,
      memo: "",
    };
  } else {
    newPlace = {
      ...place,
      memo: "",
    };
  }

  schedule[targetDay].push(newPlace);
  if (naverMapRef.value) {
    naverMapRef.value.closeInfoWindow();
  }
};

// --- Drag and Drop Logic ---
const dragOverIndex = ref(null);
const dragSourceIndex = ref(null);

const onDragStart = (index, event) => {
  dragSourceIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.dropEffect = "move";
  event.dataTransfer.setData("application/json", JSON.stringify({ day: selectedDay.value, index }));
};

const onDragOver = (event) => {
  event.preventDefault();
};

const onDragEnter = (index) => {
  dragOverIndex.value = index;
};

const onDragEnd = () => {
  dragOverIndex.value = null;
  dragSourceIndex.value = null;
};

const onDrop = (targetIndex, event) => {
  event.preventDefault();
  dragOverIndex.value = null;
  dragSourceIndex.value = null;

  const data = event.dataTransfer.getData("application/json");
  if (!data) return;

  const { day: sourceDay, index: sourceIndex } = JSON.parse(data);

  if (sourceDay !== selectedDay.value) return;

  const list = schedule[selectedDay.value];
  const [movedItem] = list.splice(sourceIndex, 1);

  list.splice(targetIndex, 0, movedItem);
};
</script>

<style scoped>
.plan-creator-page {
  min-height: calc(100vh - 5rem);
  background-color: white;
  padding: 1rem;
  box-sizing: border-box;
}

.layout-container {
  display: flex;
  width: 100%;
  height: calc(100vh - 7rem); /* 5rem header + 2rem padding */
  max-width: 100%;
  margin: 0 auto;
  background-color: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

/* Sidebar */
.sidebar-panel {
  width: 400px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.trip-title-row {
  margin-bottom: 0.75rem;
}

.title-input {
  width: 100%;
  font-size: 1.25rem;
  font-weight: bold;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.25rem 0;
  transition: border-color 0.2s;
}

.title-input:focus {
  outline: none;
  border-bottom-color: #4a3a2a;
}

.trip-date-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.date-picker-custom {
  width: 100%;
  --dp-primary-color: #4a3a2a;
  --dp-border-radius: 0.5rem;
  --dp-input-padding: 0.5rem 0.75rem;
}

/* Search Section */
.search-section {
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-row {
  display: flex;
  gap: 12px; /* Increased gap */
  width: 100%;
}

.compact-select {
  padding: 12px 16px; /* Increased padding */
  border: 1px solid #e5e7eb;
  border-radius: 12px; /* Rounded corners */
  background-color: #f9fafb; /* Light background */
  outline: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  cursor: pointer;
  appearance: none; /* Custom appearance */
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 12px top 50%;
  background-size: 10px auto;
  padding-right: 30px;
}

.compact-select:hover {
  background-color: #fff;
  border-color: #d1d5db;
}

.compact-select:focus {
  background-color: #fff;
  border-color: #4a3a2a;
  box-shadow: 0 0 0 3px rgba(74, 58, 42, 0.1);
}

.flex-grow {
  flex: 1;
  min-width: 0;
}

.full-width {
  width: 100%;
}

.search-input-box {
  display: flex;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px; /* Rounded corners */
  overflow: hidden;
  transition: all 0.2s;
}

.search-input-box:focus-within {
  background-color: #fff;
  border-color: #4a3a2a;
  box-shadow: 0 0 0 3px rgba(74, 58, 42, 0.1);
}

.search-input {
  flex: 1;
  border: none;
  padding: 12px 16px; /* Increased padding */
  font-size: 0.9rem;
  outline: none;
  background: transparent;
}

.search-btn {
  padding: 0 20px;
  background-color: #4a3a2a;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #362b1f;
}

/* Content Area */
.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  font-weight: 600;
  color: #9ca3af;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #4a3a2a;
  border-bottom-color: #4a3a2a;
}

.view-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* Schedule View */
.day-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: center;
}

.single-day-label {
  font-weight: bold;
  color: #4a3a2a;
  font-size: 1.1rem;
  padding: 0.5rem;
}

.day-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #4a3a2a;
  outline: none;
  background-color: white;
}

.add-day-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-day-btn:hover {
  background-color: #e5e7eb;
  color: #4a3a2a;
}

.modal-footer-actions {
  display: flex;
  width: 100%;
  align-items: stretch;
}

.modal-day-select {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #4a3a2a;
  border-right: none;
  border-radius: 0.5rem 0 0 0.5rem;
  font-size: 0.95rem;
  outline: none;
  background-color: white;
  color: #333;
  cursor: pointer;
  appearance: none; /* Remove default arrow */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a3a2a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.modal-day-select:focus {
  background-color: #fdfdfd;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #4a3a2a;
  color: white;
  border: 1px solid #4a3a2a; /* Match border with select */
}

.btn-primary:hover {
  background-color: #362b1f;
  border-color: #362b1f;
}

/* Integrated Group Style Override for Button */
.modal-footer-actions .btn {
  border-radius: 0 0.5rem 0.5rem 0;
  padding-left: 2rem;
  padding-right: 2rem;
  font-size: 1rem;
}

.day-chip {
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  background-color: white;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.day-chip.active {
  background-color: #4a3a2a;
  color: white;
  border-color: #4a3a2a;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #f3f4f6;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.schedule-index {
  width: 1.5rem;
  height: 1.5rem;
  background-color: #4a3a2a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.schedule-info {
  flex: 1;
}

.schedule-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 0.1rem;
}

.schedule-cat {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.schedule-memo {
  width: 100%;
  border: none;
  background-color: #f9fafb;
  padding: 0.4rem 0.6rem;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  color: #4b5563;
}

.order-controls {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid #e5e7eb;
  background-color: white;
  color: #6b7280;
  font-size: 10px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  color: #4a3a2a;
}

.order-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.delete-btn {
  background: none;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  padding: 0.25rem;
}

.delete-btn:hover {
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

/* Search Results View */
.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.result-item:hover {
  background-color: #f9fafb;
}

.result-icon {
  font-size: 1.5rem;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

.like-count {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 600;
  flex-shrink: 0;
}

.result-addr {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.add-btn {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background-color: #f3f4f6;
  border: none;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover {
  background-color: #4a3a2a;
  color: white;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  font-size: 0.875rem;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.save-btn-sidebar {
  flex: 1;
  background-color: #4a3a2a;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.save-btn-sidebar:hover {
  background-color: #362b1f;
}

/* Map Container */
.map-container {
  flex: 1;
  position: relative;
  background-color: #e5e7eb;
}

/* Modal Styles */
.full-width {
  width: 100%;
  justify-content: center;
}

.already-added {
  width: 100%;
  padding: 0.75rem;
  text-align: center;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.add-btn.remove {
  background-color: #ef4444;
  color: white;
}

.btn.remove {
  background-color: #ef4444;
  border-color: #ef4444;
}

.add-btn.disabled {
  background-color: #ccc;
  cursor: not-allowed;
  color: #fff;
}

.btn.disabled {
  background-color: #ccc;
  cursor: not-allowed;
  border-color: #ccc;
}

/* Drag and Drop Styles */
.drag-handle {
  cursor: grab;
  color: #9ca3af;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.drag-handle:active {
  cursor: grabbing;
}

.schedule-item.drag-over-up {
  border-top: 2px solid #4a3a2a;
  background-color: #f9fafb;
}

.schedule-item.drag-over-down {
  border-bottom: 2px solid #4a3a2a;
  background-color: #f9fafb;
}

/* Custom Date Picker Trigger */
.custom-date-display {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  width: 100%;
  height: 45px;
  box-sizing: border-box;
}

.custom-date-display:hover {
  border-color: #aaa;
}

.custom-date-display .icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.custom-date-display .text {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  text-align: center;
}

.clear-btn {
  color: #999;
  font-size: 14px;
  padding: 5px;
}

.clear-btn:hover {
  color: #333;
}

.trip-tags-row {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tag-select-btn {
  width: 100%;
  padding: 10px 12px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s;
}

.tag-select-btn:hover {
  background-color: #e5e7eb;
  border-color: #999;
}

.tag-select-btn.region-btn {
  font-weight: 600;
  color: #4a3a2a;
  background-color: #fff;
  border: 1px solid #4a3a2a;
}

.tag-select-btn.region-btn.empty {
  border-color: #ef4444;
  color: #ef4444;
  background-color: #fef2f2;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.tag-select-btn.theme-btn {
  background-color: #f9fafb;
  border: 1px dashed #ccc;
}

/* Tag Modal */
.tag-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.tag-modal {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.tag-modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.tag-modal-body {
  padding: 20px;
  overflow-y: auto;
}

.tag-section {
  margin-bottom: 20px;
}

.tag-section h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #4a3a2a;
  font-weight: 600;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #f0f0f0;
  color: #555;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.tag-item:hover {
  background-color: #e0e0e0;
}

.tag-item.selected {
  background-color: #4a3a2a;
  color: white;
  border-color: #4a3a2a;
}

.tag-modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

.confirm-btn {
  padding: 8px 20px;
  background-color: #4a3a2a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

/* Search Section Expansion - Modern & Emotional */
.search-section {
  margin-bottom: 1.5rem;
  background-color: rgba(255, 255, 255, 0.85); /* Glassmorphism background */
  backdrop-filter: blur(12px); /* Glassmorphism blur */
  border-radius: 24px; /* Rounded corners */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); /* Soft shadow */
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); /* Smooth transition */
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6); /* Subtle border */
  padding: 0;
}

.search-section.expanded {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  background-color: rgba(255, 255, 255, 0.95);
}

/* Compact Bar */
.compact-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px; /* Increased padding */
  cursor: pointer;
  transition: background-color 0.2s;
}

.compact-search-bar:hover {
  background-color: rgba(249, 250, 251, 0.5);
}

.compact-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.search-icon {
  color: #4a3a2a;
  display: flex;
  align-items: center;
  background-color: #f3f4f6;
  padding: 8px;
  border-radius: 50%; /* Circle icon background */
}

.search-summary-text {
  font-size: 0.95rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.expand-btn {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s;
  opacity: 0;
  transform: scale(0.8);
}

.compact-search-bar:hover .expand-btn {
  opacity: 1;
  transform: scale(1);
  background-color: #e5e7eb;
  color: #111;
}

/* Expanded Form */
.expanded-search-form {
  padding: 24px; /* Generous padding */
  display: flex;
  flex-direction: column;
  gap: 16px; /* Whitespace between rows */
  animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.expanded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.expanded-title {
  font-size: 1rem;
  font-weight: 800;
  color: #111;
  letter-spacing: -0.02em;
}

.close-search-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.close-search-btn:hover {
  background-color: #f3f4f6;
  color: #111;
}
</style>
