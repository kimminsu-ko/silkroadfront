import { ref } from "vue";
import {
  searchPlaces as searchPlacesApi,
  getPlaceDetail as getPlaceDetailApi,
} from "@/api/place";

export function usePlace() {
  const places = ref([]);
  const selectedPlace = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const totalCount = ref(0);

  // 관광지 검색
  const searchPlaces = async (params) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await searchPlacesApi(params);
      // 백엔드 응답 구조: { code: "SU", message: "성공", data: { places: [], totalCount: 0 } }
      if (response && response.data && response.data.places) {
        places.value = response.data.places;
        totalCount.value = response.data.totalCount;
      } else if (response && response.places) {
        // 혹시 data 래핑이 없는 경우
        places.value = response.places;
        totalCount.value = response.totalCount;
      } else {
        // 응답이 바로 리스트인 경우
        places.value = Array.isArray(response) ? response : [];
        totalCount.value = places.value.length;
      }
      return places.value;
    } catch (err) {
      error.value = err;
      console.error("Failed to search places:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 관광지 상세 정보 조회
  const getPlaceDetail = async (placeId) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await getPlaceDetailApi(placeId);
      // 백엔드 응답 구조 확인 필요. 보통 data 안에 있음.
      if (response && response.data) {
        selectedPlace.value = response.data;
      } else {
        selectedPlace.value = response;
      }
      return selectedPlace.value;
    } catch (err) {
      error.value = err;
      console.error("Failed to get place detail:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 상태 초기화
  const clearSelection = () => {
    selectedPlace.value = null;
  };

  const clearResults = () => {
    places.value = [];
    totalCount.value = 0;
  };

  return {
    places,
    selectedPlace,
    isLoading,
    error,
    totalCount,
    searchPlaces,
    getPlaceDetail,
    clearSelection,
    clearResults,
  };
}
