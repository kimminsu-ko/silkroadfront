<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { loadNaverMap } from "@/utils/loadNaverMap.js";
import { applyMapOptions, defaultMapConfig } from "@/utils/naverMapOptions.js";

const props = defineProps({
  markers: {
    type: Array,
    default: () => [],
  },
  autoFitBounds: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["markerClick", "load"]);

const { locale } = useI18n();
const mapElement = ref(null);
let mapInstance = null;
let naverInstance = null;
let markerInstances = [];
let infoWindowInstance = null;
let hoverInfoWindow = null;

//여기서 수정 가능
const mapConfig = {
  ...defaultMapConfig,
  mapTypeControl: false,
};

// 외부에서 호출 가능한 메서드들
const setCenter = (lat, lng) => {
  if (mapInstance && naverInstance) {
    const newCenter = new naverInstance.maps.LatLng(lat, lng);
    mapInstance.setCenter(newCenter);
    mapInstance.setZoom(15); // 적절한 줌 레벨로 변경
  }
};

const openInfoWindow = (lat, lng, content) => {
  if (mapInstance && naverInstance) {
    if (infoWindowInstance) {
      infoWindowInstance.close();
    }
    // 클릭으로 정보창 열 때 호버 정보창이 있다면 닫기
    if (hoverInfoWindow) {
      hoverInfoWindow.close();
    }

    infoWindowInstance = new naverInstance.maps.InfoWindow({
      content: content,
      borderWidth: 1,
      anchorSkew: true,
      anchorColor: "#fff",
      backgroundColor: "#fff",
    });

    const position = new naverInstance.maps.LatLng(lat, lng);
    infoWindowInstance.open(mapInstance, position);
  }
};

const closeInfoWindow = () => {
  if (infoWindowInstance) {
    infoWindowInstance.close();
  }
};

const fitBounds = (markers) => {
  if (!mapInstance || !naverInstance || !markers || markers.length === 0) return;

  const bounds = new naverInstance.maps.LatLngBounds();
  let hasValidMarker = false;

  markers.forEach((marker) => {
    const lat = marker.lat || (marker.position && marker.position.y);
    const lng = marker.lng || (marker.position && marker.position.x);

    if (lat && lng) {
      bounds.extend(new naverInstance.maps.LatLng(lat, lng));
      hasValidMarker = true;
    }
  });

  if (hasValidMarker) {
    mapInstance.fitBounds(bounds);
  }
};

defineExpose({
  setCenter,
  openInfoWindow,
  closeInfoWindow,
  fitBounds,
});

async function setupMap(lang) {
  const currentLang = lang || "ko";

  if (!mapElement.value) return;

  //로드 -> 되있으면 재사용
  const naver = await loadNaverMap(currentLang);
  naverInstance = naver;

  mapInstance = new naver.maps.Map(mapElement.value, {
    center: new naver.maps.LatLng(37.566535, 126.977969),
    zoom: 12,
    mapTypeControl: mapConfig.mapTypeControl,
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_RIGHT,
    },
  });

  applyMapOptions(mapInstance, mapConfig);

  updateMarkers();
  emit("load", mapInstance);
}

function updateMarkers() {
  if (!mapInstance || !naverInstance) return;

  // 기존 마커 제거
  markerInstances.forEach((marker) => marker.setMap(null));
  markerInstances = [];

  if (!props.markers || props.markers.length === 0) return;

  const bounds = new naverInstance.maps.LatLngBounds();

  props.markers.forEach((markerData) => {
    if (markerData.lat && markerData.lng) {
      const position = new naverInstance.maps.LatLng(markerData.lat, markerData.lng);
      const markerOptions = {
        position: position,
        map: mapInstance,
        title: markerData.title,
      };

      // 커스텀 마커 적용
      const badgeHtml = markerData.isAdded
        ? `
        <div style="
          position: absolute; 
          top: -5px; 
          right: -5px; 
          width: 20px; 
          height: 20px; 
          background: #10B981; 
          border-radius: 50%; 
          border: 2px solid white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-size: 12px; 
          font-weight: bold; 
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${markerData.sequence || "✓"}</div>
      `
        : "";

      if (markerData.image) {
        // 1. 썸네일(Photo) 마커
        markerOptions.icon = {
          content: `
            <div class="custom-marker-container" style="position: relative;">
              <div class="custom-marker-image" style="
                width: 40px; 
                height: 40px; 
                border-radius: 50%; 
                border: 2px solid ${markerData.isAdded ? "#10B981" : "white"}; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
                background-image: url('${markerData.image}');
                background-size: cover;
                background-position: center;
                background-color: #eee;
                transition: all 0.2s ease;
              "></div>
              ${badgeHtml}
            </div>
          `,
          size: new naverInstance.maps.Size(40, 40),
          anchor: new naverInstance.maps.Point(20, 20),
        };
      } else if (markerData.icon) {
        // 2. 드롭 핀(Drop Pin) 스타일 (이미지 없을 때)
        const color = markerData.color || "#4a3a2a";
        const borderColor = markerData.isAdded ? "#10B981" : "white";
        markerOptions.icon = {
          content: `
            <div style="position: relative; width: 30px; height: 40px;">
              <div style="
                width: 30px; 
                height: 30px; 
                background: ${color}; 
                border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg);
                box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid ${borderColor};
              ">
                <div style="transform: rotate(45deg); font-size: 14px;">${markerData.icon}</div>
              </div>
              ${badgeHtml}
            </div>
          `,
          size: new naverInstance.maps.Size(30, 40),
          anchor: new naverInstance.maps.Point(15, 40),
        };
      }

      const marker = new naverInstance.maps.Marker(markerOptions);

      // 마커 클릭 이벤트 리스너 추가
      naverInstance.maps.Event.addListener(marker, "click", () => {
        emit("markerClick", markerData);
      });

      // 마커 호버 이벤트 리스너 추가 (정보창 표시)
      if (markerData.title) {
        naverInstance.maps.Event.addListener(marker, "mouseover", () => {
          const content = `
            <div style="
              padding: 8px 12px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              border: 1px solid #eee;
              font-size: 13px;
              font-weight: 600;
              color: #333;
              white-space: nowrap;
            ">
              ${markerData.title}
            </div>
          `;

          // InfoWindow 생성 및 열기 (호버용)
          if (hoverInfoWindow) {
            hoverInfoWindow.close();
          }

          hoverInfoWindow = new naverInstance.maps.InfoWindow({
            content: content,
            borderWidth: 0,
            backgroundColor: "transparent",
            anchorSize: new naverInstance.maps.Size(10, 10),
            anchorSkew: true,
            anchorColor: "#fff",
            pixelOffset: new naverInstance.maps.Point(0, -5),
          });

          hoverInfoWindow.open(mapInstance, marker);
        });

        naverInstance.maps.Event.addListener(marker, "mouseout", () => {
          if (hoverInfoWindow) {
            hoverInfoWindow.close();
          }
        });
      }

      markerInstances.push(marker);
      bounds.extend(position);
    }
  });

  if (markerInstances.length > 0 && props.autoFitBounds) {
    mapInstance.fitBounds(bounds);
  }
}

watch(
  () => props.markers,
  () => {
    updateMarkers();
  },
  { deep: true }
);

onMounted(async () => {
  await setupMap(locale.value);
});

//언어 바뀔때만 지도 리 로딩
watch(
  () => locale.value,
  async (newLang, oldLang) => {
    if (newLang === oldLang) return;
    await setupMap(newLang);
  }
);

onBeforeUnmount(() => {
  // Naver Maps는 destroy 같은 메서드 없어서
  // 인스턴스 참조만 끊어줌 (GC에 맡김)
  mapInstance = null;
  naverInstance = null;
});
</script>

<template>
  <div class="map" ref="mapElement"></div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 400px;
}
</style>

<style>
/* Global styles for dynamic markers */
.custom-marker-container {
  cursor: pointer;
  z-index: 10;
}
.custom-marker-container:hover {
  z-index: 1000 !important;
}
.custom-marker-image:hover {
  transform: scale(1.2);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3) !important;
}
</style>
