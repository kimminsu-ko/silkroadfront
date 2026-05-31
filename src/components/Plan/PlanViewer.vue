<template>
  <div class="plan-viewer">
    <div class="layout-container">
      <!-- 좌측 사이드바 (정보 및 일정) -->
      <aside class="sidebar-panel">
        <!-- 1. 여행 정보 헤더 -->
        <div class="sidebar-header">
          <div class="trip-title-row">
            <h1 class="trip-title">{{ planTitle }}</h1>
          </div>
          <div class="trip-info-row">
            <span class="trip-date">{{ formattedDateRange }}</span>
            <span class="trip-area" v-if="regions && regions.length > 0">
              📍 {{ regions.map(renderServerTag).join(", ") }}
            </span>
          </div>
          <div class="trip-tags-row" v-if="tags && tags.length > 0">
            <span v-for="tag in tags" :key="tag" class="tag-badge"> #{{ renderServerTag(tag) }} </span>
          </div>
          <!-- 수정/삭제 버튼 (소유자만 표시) -->
          <div class="owner-actions" v-if="isOwner && !readOnly">
            <button class="action-btn edit-btn" @click="handleEdit">
              {{ t("planViewer.edit") }}
            </button>
            <button class="action-btn delete-btn" @click="handleDelete">
              {{ t("planViewer.delete") }}
            </button>
          </div>
        </div>

        <!-- 2. 일정 리스트 -->
        <div class="sidebar-content">
          <div class="day-selector">
            <select v-model="selectedDay" class="day-select">
              <option v-for="day in availableDays" :key="day" :value="day">
                {{ t("planViewer.dayPrefix") }} {{ day }}
              </option>
            </select>
          </div>

          <div class="schedule-list">
            <div v-if="!currentSchedule || currentSchedule.length === 0" class="empty-state">
              <p>{{ t("planViewer.emptySchedule") }}</p>
            </div>
            <div
              v-else
              v-for="(place, index) in currentSchedule"
              :key="place.id || index"
              class="schedule-item"
              @click="focusPlace(place)"
            >
              <div class="schedule-index">{{ index + 1 }}</div>
              <div class="schedule-info">
                <div class="schedule-name">{{ place.name }}</div>

                <!-- ✅ touristSearch 번역 재활용 -->
                <div class="schedule-cat">
                  {{ renderCategory(place.categoryId, place.category) }}
                </div>

                <div class="schedule-memo" v-if="place.memo">📝 {{ place.memo }}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 우측 지도 영역 -->
      <main class="map-container">
        <NaverMap
          ref="naverMapRef"
          :markers="mapMarkers"
          :autoFitBounds="true"
          style="width: 100%; height: 100%"
          @markerClick="handleMarkerClick"
          @load="onMapLoad"
        />
      </main>
    </div>

    <!-- Place Detail Modal -->
    <PlaceDetailModal :placeId="selectedPlaceId" :isVisible="!!selectedPlaceId" @close="selectedPlaceId = null" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import NaverMap from "@/components/NaverMap/NaverMap.vue";
import PlaceDetailModal from "@/components/Place/PlaceDetailModal.vue";
import { getPlanDetail, deletePlan } from "@/api/plan";
import { useAuthStore } from "@/stores/auth";
import { usePlanCreatorTagI18n } from "@/utils/planCreatorTagI18n.js";
import { getCategoryMapIcon, getCategoryColor, getCategoryName } from "@/utils/categoryUtils";

const props = defineProps({
  planId: {
    type: [String, Number],
    default: null,
  },
  planData: {
    type: Object,
    default: null,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const authStore = useAuthStore();
const naverMapRef = ref(null);
const isLoading = ref(false);
const { t } = useI18n();
const { renderServerTag } = usePlanCreatorTagI18n();

// Plan Data State
const planTitle = ref("");
const startDate = ref("");
const endDate = ref("");
const regions = ref([]);
const tags = ref([]);
const writerId = ref(null); // 작성자 ID 저장
const scheduleMap = ref({}); // { 1: [places], 2: [places] } -> Key is Day Number
const availableDays = ref([]);
const selectedDay = ref(1);
const selectedPlaceId = ref(null); // For Detail Modal

const renderCategory = (categoryId, fallbackText = "") => {
  const id = Number(categoryId);

  // touristSearch에 이미 category12, category14... 있음
  const key = `touristSearch.category${id}`;
  const translated = t(key);

  // 없는 키면 보통 key 문자열 그대로 나와서 fallback 처리
  if (translated === key) return fallbackText || "";

  return translated;
};

// Computed
const isOwner = computed(() => {
  // 로그인한 유저가 있고, 작성자 ID와 일치하는지 확인
  return authStore.user && writerId.value && Number(authStore.user.userIndex) === Number(writerId.value);
});

const formattedDateRange = computed(() => {
  if (!startDate.value || !endDate.value) return "";
  return `${startDate.value} ~ ${endDate.value}`;
});

const currentSchedule = computed(() => {
  return scheduleMap.value[selectedDay.value] || [];
});

const mapMarkers = computed(() => {
  const markers = [];
  // 현재 선택된 날짜의 마커만 보여줄지, 전체를 보여줄지 결정
  // 여기서는 전체 일정을 보여주되, 선택된 날짜는 강조하는 방식 등을 고려할 수 있음
  // 일단 전체 마커를 표시
  Object.entries(scheduleMap.value).forEach(([day, places]) => {
    places.forEach((place, index) => {
      if (place.lat && place.lng) {
        const isSelectedDay = parseInt(day) === selectedDay.value;
        markers.push({
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lng),
          title: place.name,
          id: place.id,
          type: "schedule",
          icon: getCategoryMapIcon(place.categoryId),
          color: getCategoryColor(place.categoryId),
          image: place.image, // 이미지 전달
          day: parseInt(day),
          sequence: place.sequence || index + 1, // 순서 추가
          isAdded: isSelectedDay, // 선택된 날짜만 번호(뱃지) 표시
        });
      }
    });
  });
  return markers;
});

// Methods
const loadPlanData = async () => {
  if (props.planData) {
    setPlanData(props.planData);
    return;
  }

  if (!props.planId) return;

  isLoading.value = true;
  try {
    const response = await getPlanDetail(props.planId);
    if (response.data && response.data.code === "SU") {
      setPlanData(response.data.data); // API 응답 구조에 따라 수정 필요
    } else {
      // Fallback or Error handling
      console.error("Failed to load plan:", response.data.message);
    }
  } catch (error) {
    console.error("Error loading plan:", error);
  } finally {
    isLoading.value = false;
  }
};

const setPlanData = (data) => {
  planTitle.value = data.name;
  startDate.value = data.startDate;
  endDate.value = data.endDate;
  regions.value = data.regions || [];
  tags.value = data.tags || [];
  writerId.value = data.userIndex; // 작성자 ID 설정

  // Schedule Data Parsing
  // Assuming data.places is array of { day, sequence, place: { ... } } or similar
  // 백엔드 응답 구조에 맞춰 파싱 로직이 필요함.
  // 여기서는 createPlan에서 보낸 구조가 그대로 온다고 가정하고,
  // 실제로는 place 상세 정보가 포함되어야 함.

  const tempSchedule = {};

  if (data.places && Array.isArray(data.places)) {
    data.places.forEach((item) => {
      const day = item.day;
      if (!tempSchedule[day]) tempSchedule[day] = [];

      // item.place에 상세 정보가 있다고 가정 (Join된 결과)
      // 만약 평면적인 구조라면 item 자체가 장소 정보일 수 있음
      const placeInfo = item.place || item;

      tempSchedule[day].push({
        id: placeInfo.placeId || placeInfo.id,
        name: placeInfo.title || placeInfo.name,
        category: getCategoryName(placeInfo.placeTypeId || placeInfo.categoryId),
        categoryId: placeInfo.placeTypeId || placeInfo.categoryId,
        lat: placeInfo.mapY || placeInfo.lat,
        lng: placeInfo.mapX || placeInfo.lng,
        image: placeInfo.firstImage || placeInfo.image, // 이미지 추가
        memo: item.memo,
        sequence: item.sequence,
      });
    });

    // Sort by sequence
    Object.keys(tempSchedule).forEach((day) => {
      tempSchedule[day].sort((a, b) => a.sequence - b.sequence);
    });
  }

  scheduleMap.value = tempSchedule;
  availableDays.value = Object.keys(tempSchedule)
    .map(Number)
    .sort((a, b) => a - b);
  if (availableDays.value.length > 0) {
    selectedDay.value = availableDays.value[0];
  }
};

const focusPlace = (place) => {
  if (place.lat && place.lng && naverMapRef.value) {
    naverMapRef.value.setCenter(place.lat, place.lng);
    openInfoWindow(place);
  }
};

const handleMarkerClick = (marker) => {
  // 마커 클릭 시 해당 날짜로 이동하거나 정보창 표시
  if (marker.day) {
    selectedDay.value = marker.day;
  }
  // Find the place object from scheduleMap to pass full details
  const place = scheduleMap.value[marker.day]?.find((p) => String(p.id) === String(marker.id));
  if (place) {
    openInfoWindow(place);
  }
};

const openInfoWindow = (place) => {
  if (!naverMapRef.value) return;

  const content = `
    <div style="padding:15px; min-width:200px; background:white; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); position: relative;">
      <button onclick="window.closeInfoWindow()" style="position:absolute; top:5px; right:5px; background:none; border:none; font-size:18px; cursor:pointer; color:#999; line-height: 1;">&times;</button>
      <h4 style="margin:0 0 8px 0; font-size:16px; font-weight:bold; color:#333; cursor:pointer; padding-right: 20px;" onclick="window.openDetail('${
        place.id
      }')">
        ${place.name} <span style="font-size:12px; color:#888;">></span>
      </h4>
      <p style="margin:0 0 5px 0; font-size:13px; color:#666;">${place.category}</p>
      ${
        place.memo
          ? `<p style="margin:5px 0 0 0; font-size:12px; color:#888; border-top:1px solid #eee; padding-top:5px;">📝 ${place.memo}</p>`
          : ""
      }
    </div>
  `;

  naverMapRef.value.openInfoWindow(place.lat, place.lng, content);
};

const onMapLoad = () => {
  // 초기 로드 시 바운드 조정은 autoFitBounds가 처리
};

const handleEdit = () => {
  router.push(`/plans/${props.planId}/edit`);
};

const handleDelete = async () => {
  if (!confirm(t("planViewer.confirmDelete"))) return;

  try {
    const response = await deletePlan(props.planId);
    if (response.data.code === "SU") {
      alert(t("planViewer.deleteSuccess"));
      await router.push("/my-plans");
    } else {
      alert(`${t("planViewer.deleteFail")}: ${response.data.message}`);
    }
  } catch (error) {
    console.error("Error deleting plan:", error);
    alert(t("planViewer.deleteError"));
  }
};

watch(() => props.planId, loadPlanData);
watch(() => props.planData, loadPlanData);

onMounted(() => {
  loadPlanData();

  // Global handlers for InfoWindow interactions
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
  delete window.openDetail;
  delete window.closeInfoWindow;
});
</script>

<style scoped>
.plan-viewer {
  height: 100%;
  background-color: #f6f1e7;
}

.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: white;
  overflow: hidden;
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

.trip-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111;
  margin: 0 0 0.5rem 0;
}

.trip-info-row {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.trip-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-badge {
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.owner-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #e5e7eb;
  color: #374151;
}

.edit-btn:hover {
  background-color: #d1d5db;
}

.delete-btn {
  background-color: #fee2e2;
  color: #ef4444;
}

.delete-btn:hover {
  background-color: #fecaca;
}

/* Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.day-selector {
  margin-bottom: 1rem;
}

.day-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #4a3a2a;
  outline: none;
  background-color: white;
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
  padding: 1rem;
  background-color: white;
  border: 1px solid #f3f4f6;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.2s;
}

.schedule-item:hover {
  border-color: #4a3a2a;
  background-color: #fafafa;
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
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.schedule-cat {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.schedule-memo {
  background-color: #f9fafb;
  padding: 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

/* Map */
.map-container {
  flex: 1;
  position: relative;
  background-color: #e5e7eb;
}
</style>
