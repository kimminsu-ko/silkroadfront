<template>
  <div class="ai-route-page">
    <!-- 사이드바: 채팅방 목록 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="switchRoom(null)">
          <span class="plus-icon">+</span>
          <span>{{ t("aiRoutePage.newChat") }}</span>
        </button>
      </div>

      <div class="sidebar-content">
        <div class="sidebar-section-title">{{ t("aiRoutePage.recentActivity") }}</div>
        <div class="chat-room-list">
          <div
            v-for="room in chatRooms"
            :key="room.roomId"
            class="chat-room-item"
            :class="{ active: currentRoomId === room.roomId }"
            @click="switchRoom(room.roomId)"
          >
            <span class="chat-icon">💬</span>
            <span class="room-title">{{ room.title || t("aiRoutePage.roomFallback", { id: room.roomId }) }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <main class="content-area">
      <!-- 1. 전체 화면 지도 배경 -->
      <div class="map-container">
        <NaverMap ref="naverMapRef" :markers="mapMarkers" @markerClick="handleMarkerClick" />
      </div>

      <!-- 2. 플로팅 채팅 패널 (좌측 상단) -->
      <div class="floating-chat-panel">
        <div class="chat-header">
          <div class="header-left">
            <div class="ai-icon">
              <img src="@/assets/logo.png" alt="AI" />
            </div>
            <div class="header-info">
              <h2>{{ t("aiRoutePage.title") }}</h2>
              <span class="status-text">{{ t("aiRoutePage.online") }}</span>
            </div>
          </div>
          <button @click="goBack" class="close-btn">×</button>
        </div>

        <div class="chat-messages" ref="chatBody">
          <ChatMessage v-for="msg in messages" :key="msg.id" :msg="msg" @openPlanModal="openPlanModal" />

          <!-- 로딩 인디케이터 -->
          <div v-if="isLoading" class="message-row ai-row">
            <div class="bubble ai-bubble loading-bubble">
              <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>

        <!-- 입력 영역 -->
        <div class="input-area">
          <input
            type="text"
            class="chat-input"
            :placeholder="t('aiRoutePage.inputPlaceholder')"
            v-model="userInput"
            @keyup.enter="sendMessage"
          />
          <button class="send-btn" @click="sendMessage" :disabled="!userInput.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="send-icon">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 3. 하단 타임라인 (지도 오버레이) -->
      <Timeline
        v-if="mapMarkers.length > 0"
        :mapMarkers="mapMarkers"
        :selectedPlaceId="selectedPlaceId"
        @focusOnPlace="focusOnPlaceById"
      />

      <!-- 모달 컴포넌트 -->
      <PlaceDetailModal :placeId="modalPlaceId" :isVisible="!!modalPlaceId" @close="modalPlaceId = null" />
      <AIPlanModal
        :isVisible="showPlanModal"
        :places="extractedPlaces"
        @close="showPlanModal = false"
        @create="handleCreatePlan"
      />
    </main>
  </div>
</template>

<script setup>
/**
 * Imports
 */
import { ref, nextTick, onMounted, computed, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

// API
import { sendMessage as apiSendMessage, getChatMessages, getChatRooms, createChatRoom } from "@/api/ai";

// Components
import NaverMap from "@/components/NaverMap/NaverMap.vue";
import PlaceDetailModal from "@/components/Place/PlaceDetailModal.vue";
import AIPlanModal from "@/components/Common/AIPlanModal.vue";
import ChatMessage from "@/components/AI/ChatMessage.vue";
import Timeline from "@/components/AI/Timeline.vue";

// Utils
import { getCategoryName, getCategoryMapIcon, getCategoryColor } from "@/utils/categoryUtils";
import { getInfoWindowContent } from "@/utils/mapInfoWindow";

/**
 * Constants & System Prompts
 */
const SYSTEM_INSTRUCTION = `
(System Note: Please provide the response in the following JSON format strictly, no other text.
IMPORTANT: You MUST include the "day" field (integer, e.g., 1, 2) for every item.
{
  "itinerary": [
    {
      "day": 1,
      "time": "HH:MM",
      "place": "Place Name",
      "placeId": 12345,
      "desc": "Short description (1-2 lines)",
      "tags": ["#tag1", "#tag2"],
      "detail": "Long detail description"
    }
  ]
}
If you cannot provide JSON, use this text format with explicit day markers:
📅 1일차
10:00 장소명 [[PLACE_ID: 12345]]
...
📅 2일차
...
If it's not an itinerary request, just answer normally in text.)`;

/**
 * State Management
 */
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// 채팅방 관련 상태
const currentRoomId = ref(route.params.roomId);
const chatRooms = ref([]);
const messages = ref([]);
const userInput = ref("");
const isLoading = ref(false);
const chatBody = ref(null);

// 지도 및 마커 관련 상태
const naverMapRef = ref(null);
const mapMarkers = ref([]);
const selectedPlaceId = ref(null);

// 모달 관련 상태
const modalPlaceId = ref(null);
const showPlanModal = ref(false);
const extractedPlaces = ref([]);

/**
 * Watchers
 */
// URL의 roomId가 변경되면 채팅방 전환
watch(
  () => route.params.roomId,
  (newId) => {
    const current = currentRoomId.value ? String(currentRoomId.value) : "";
    const next = newId ? String(newId) : "";

    if (current !== next) {
      currentRoomId.value = newId;
      loadMessages();
    }
  }
);

/**
 * Helper Functions
 */

// JSON 파싱 시도 (AI 응답 처리용)
const tryParseJSON = (text) => {
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = text.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed.itinerary) {
        // detail 필드에서 [[PLACE_ID: ...]] 태그 제거
        return parsed.itinerary.map((item) => {
          if (item.detail) {
            item.detail = item.detail.replace(/\[\[PLACE_ID:\s*\d+\s*\]\]/g, "").trim();
          }
          return item;
        });
      }
    }
  } catch (e) {
    return null;
  }
  return null;
};

/**
 * Core Logic: 메시지에서 장소 추출 및 일차(Day) 계산
 *
 * 1. JSON 형식인 경우: 명시된 day 필드 사용 또는 시간 역행 감지로 일차 계산
 * 2. 텍스트 형식인 경우: 정규식으로 일차 마커(📅 1일차 등) 감지 또는 시간 역행 감지
 */
const extractPlacesFromMsg = (msg) => {
  if (!msg.content) return [];

  // Case 1: JSON 파싱된 콘텐츠 (Array)
  if (Array.isArray(msg.content)) {
    const places = [];
    const placeMap = new Map((msg.recommendedPlaces || []).map((p) => [p.placeId, p]));

    let currentDay = 1;
    let lastTimeMinutes = -1;

    msg.content.forEach((item) => {
      // 명시적 Day 필드가 있으면 우선 사용
      if (item.day) {
        currentDay = item.day;
        // 새로운 날짜가 시작되면 시간 체크 초기화 (단, 같은 날짜 내 시간 흐름은 체크)
        const parts = item.time ? item.time.split(":") : null;
        if (parts && parts.length === 2) {
          lastTimeMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else {
          lastTimeMinutes = -1;
        }
      }
      // 시간 정보를 통한 일차 추론
      else if (item.time) {
        const parts = item.time.split(":");
        if (parts.length === 2) {
          const minutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
          // 시간이 크게 역행하면(예: 20:00 -> 09:00) 다음 날로 간주
          // 4시간(240분) 버퍼 사용
          if (lastTimeMinutes !== -1 && minutes < lastTimeMinutes - 240) {
            currentDay++;
          }
          lastTimeMinutes = minutes;
        }
      }

      const placeId = item.placeId;
      const place = placeMap.get(placeId);

      if (place) {
        const typeId = place.placeTypeId || place.contentTypeId || place.categoryId;
        places.push({
          day: currentDay,
          name: place.title,
          category: getCategoryName(typeId),
          address: place.addr1,
          lat: place.mapY,
          lng: place.mapX,
          placeId: place.placeId,
          placeTypeId: typeId,
          firstImage: place.firstImage,
        });
      }
    });

    if (places.length > 0) return places;

    // JSON 파싱 실패 시 추천 장소 목록만 반환 (모두 1일차로 가정)
    if (msg.recommendedPlaces && msg.recommendedPlaces.length > 0) {
      return msg.recommendedPlaces.map((p) => {
        const typeId = p.placeTypeId || p.contentTypeId || p.categoryId;
        return {
          day: 1,
          name: p.title,
          category: getCategoryName(typeId),
          address: p.addr1,
          lat: p.mapY,
          lng: p.mapX,
          placeId: p.placeId,
          placeTypeId: typeId,
          firstImage: p.firstImage,
        };
      });
    }
    return [];
  }

  // Case 2: 구형 텍스트 포맷 ("장소 이미지" 키워드 사용)
  if (msg.content.includes("장소 이미지")) {
    return parsePlacesFromContent(msg.content);
  }

  // Case 3: 신형 텍스트 포맷 ([[PLACE_ID: ...]] 태그 사용)
  if (msg.recommendedPlaces && msg.recommendedPlaces.length > 0) {
    const places = [];
    const lines = msg.content.split("\n");
    let currentDay = 1;
    let lastTimeMinutes = -1;

    // 빠른 조회를 위한 Map 생성
    const placeMap = new Map(msg.recommendedPlaces.map((p) => [p.placeId, p]));

    for (const line of lines) {
      // 일차 마커 감지 (예: "2일차", "Day 2", "📅 2일차", "**2일차**")
      const dayMatch = line.match(/(?:📅|Day|DAY|\*+|#+)?\s*(\d+)(?:일차|일)/i);
      if (dayMatch) {
        currentDay = parseInt(dayMatch[1]);
        lastTimeMinutes = -1; // 새 날짜 시작 시 시간 초기화
      }

      // 시간 정보를 통한 일차 추론 (일차 마커가 없는 경우 대비)
      const timeMatch = line.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
        // 시간이 3시간(180분) 이상 역행하면 다음 날로 간주
        if (lastTimeMinutes !== -1 && minutes < lastTimeMinutes - 180) {
          currentDay++;
        }
        lastTimeMinutes = minutes;
      }

      // 장소 ID 태그 매칭
      const matches = line.matchAll(/\[\[PLACE_ID:\s*(\d+)\]\]/g);
      for (const m of matches) {
        const placeId = parseInt(m[1]);
        // 중복 방지
        if (places.some((p) => p.placeId === placeId)) continue;

        const place = placeMap.get(placeId);
        if (place) {
          const typeId = place.placeTypeId || place.contentTypeId || place.categoryId;
          places.push({
            day: currentDay,
            name: place.title,
            category: getCategoryName(typeId),
            address: place.addr1,
            lat: place.mapY,
            lng: place.mapX,
            placeId: place.placeId,
            placeTypeId: typeId,
            firstImage: place.firstImage,
          });
        }
      }
    }

    // 태그로 장소를 찾지 못했지만 추천 장소가 있는 경우 (Fallback)
    if (places.length === 0) {
      return msg.recommendedPlaces.map((p) => {
        const typeId = p.placeTypeId || p.contentTypeId || p.categoryId;
        return {
          day: 1,
          name: p.title,
          category: getCategoryName(typeId),
          address: p.addr1,
          lat: p.mapY,
          lng: p.mapX,
          placeId: p.placeId,
          placeTypeId: typeId,
          firstImage: p.firstImage,
        };
      });
    }

    return places;
  }

  return [];
};

// 구형 텍스트 포맷 파싱 (레거시 지원)
const parsePlacesFromContent = (content) => {
  const lines = content.split("\n");
  const places = [];
  let currentDay = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 일차 확인
    const dayMatch = line.match(/📅\s*(\d+)일차/);
    if (dayMatch) {
      currentDay = parseInt(dayMatch[1]);
      continue;
    }

    // 장소 마커 확인
    if (line === "장소 이미지") {
      if (i + 3 < lines.length) {
        const name = lines[i + 1].trim();
        const category = lines[i + 2].trim();
        const address = lines[i + 3].trim();

        if (name && address) {
          places.push({
            day: currentDay,
            name: name,
            category: category,
            address: address,
          });
        }
        i += 3; // 처리된 라인 건너뛰기
      }
    }
  }
  return places;
};

/**
 * UI Interaction Functions
 */

// 채팅방 목록 로드
const fetchChatRooms = async () => {
  try {
    const rooms = await getChatRooms();
    chatRooms.value = rooms;
  } catch (error) {
    console.error(t("aiRoutePage.chatRoomLoadFailLog"), error);
  }
};

// 채팅방 전환
const switchRoom = (roomId) => {
  if (currentRoomId.value === roomId) return;
  currentRoomId.value = roomId;
  if (roomId) {
    router.push(`/ai-route/${roomId}`);
  } else {
    router.push(`/ai-route`);
  }
  loadMessages();
};

// 뒤로 가기
const goBack = () => {
  router.push("/chat-rooms");
};

// 일정 생성 모달 열기
const openPlanModal = (msg) => {
  extractedPlaces.value = extractPlacesFromMsg(msg);
  if (extractedPlaces.value.length > 0) {
    showPlanModal.value = true;
  } else {
    alert(t("aiRoutePage.noPlaceAlert"));
  }
};

// 일정 생성 완료 후 이동
const handleCreatePlan = (selectedPlaces) => {
  showPlanModal.value = false;
  router.push({
    path: "/plan-creator",
    query: {
      aiPlaces: JSON.stringify(selectedPlaces),
    },
  });
};

// 메시지 로드 및 처리
const loadMessages = async () => {
  messages.value = [];
  mapMarkers.value = [];

  // 채팅방 ID가 없으면 초기 안내 메시지 표시
  if (!currentRoomId.value) {
    messages.value.push({
      id: 1,
      role: "ai",
      type: "text",
      content: t("aiRoutePage.welcome"),
    });
    return;
  }

  isLoading.value = true;

  try {
    const history = await getChatMessages(currentRoomId.value);

    if (history.length === 0) {
      messages.value.push({
        id: 1,
        role: "ai",
        type: "text",
        content: t("aiRoutePage.welcome"),
      });
      isLoading.value = false;
      return;
    }

    // 히스토리 데이터 매핑
    const mappedMessages = [];
    history.forEach((msg) => {
      let content = msg.content;
      let type = "text";
      const role = msg.sender.toLowerCase();

      // 사용자 메시지: 시스템 프롬프트 제거
      if (role === "user") {
        content = content.replace(/\(System Note:[\s\S]*?\)$/, "").trim();
      }

      // AI 메시지: JSON 파싱 시도
      if (role === "ai") {
        const itinerary = tryParseJSON(content);
        if (itinerary) {
          type = "timeline";
          content = itinerary;
        }
      }

      mappedMessages.push({
        id: msg.messageId,
        role: role,
        type: type,
        content: content,
        recommendedPlaces: msg.recommendedPlaces || [],
      });

      // 지도 마커 업데이트 (마지막 추천 장소 기준)
      if (msg.recommendedPlaces && msg.recommendedPlaces.length > 0) {
        const placesWithDay = extractPlacesFromMsg({
          content: content,
          recommendedPlaces: msg.recommendedPlaces,
        });

        if (placesWithDay.length > 0) {
          updateMapMarkers(placesWithDay);
        } else {
          updateMapMarkers(msg.recommendedPlaces);
        }
      }
    });

    messages.value = mappedMessages;
    await scrollToBottom();
  } catch (error) {
    console.error(t("aiRoutePage.messageLoadFailLog"), error);
  } finally {
    isLoading.value = false;
  }
};

// 지도 마커 업데이트
const updateMapMarkers = (places) => {
  mapMarkers.value = places.map((place, index) => {
    const typeId = place.placeTypeId || place.contentTypeId || place.categoryId;
    return {
      lat: place.lat || place.mapY,
      lng: place.lng || place.mapX,
      title: place.name || place.title,
      id: place.placeId,
      type: "recommendation",
      icon: getCategoryMapIcon(typeId),
      image: place.firstImage,
      color: getCategoryColor(typeId),
      isAdded: true,
      sequence: index + 1,
      category: place.category || getCategoryName(typeId),
      day: place.day || 1,
    };
  });
};

// 메시지 전송
const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  // 사용자 메시지 즉시 표시
  messages.value.push({
    id: Date.now(),
    role: "user",
    type: "text",
    content: text,
  });

  userInput.value = "";
  await scrollToBottom();

  isLoading.value = true;

  try {
    let roomId = currentRoomId.value;

    // 채팅방이 없으면 새로 생성
    if (!roomId) {
      const title = text.length > 20 ? text.substring(0, 20) + "..." : text;
      const newRoom = await createChatRoom(title);
      roomId = newRoom.roomId;
      currentRoomId.value = String(roomId);
      router.replace(`/ai-route/${roomId}`);
      fetchChatRooms();
    }

    // API 호출
    const response = await apiSendMessage(roomId, text + SYSTEM_INSTRUCTION);
    const aiMessage = response.aiMessage;

    isLoading.value = false;

    // AI 응답 메시지 추가 (타이핑 효과용 빈 상태)
    const aiMessageId = aiMessage.messageId;
    messages.value.push({
      id: aiMessageId,
      role: "ai",
      type: "text",
      content: "",
      fullContent: aiMessage.content,
      recommendedPlaces: aiMessage.recommendedPlaces || [],
    });

    // 지도 마커 업데이트
    if (aiMessage.recommendedPlaces && aiMessage.recommendedPlaces.length > 0) {
      const placesWithDay = extractPlacesFromMsg({
        content: aiMessage.content,
        recommendedPlaces: aiMessage.recommendedPlaces,
      });

      if (placesWithDay.length > 0) {
        updateMapMarkers(placesWithDay);
      } else {
        updateMapMarkers(aiMessage.recommendedPlaces);
      }
    }

    // 타이핑 효과 시작
    await typeWriterEffect(aiMessage.content, aiMessageId);
  } catch (error) {
    console.error("aiRoutePage.messageSendFailLog", error);
    isLoading.value = false;
    messages.value.push({
      id: Date.now(),
      role: "ai",
      type: "text",
      content: t("aiRoutePage.genericError"),
    });
  }
};

// 타이핑 효과
const typeWriterEffect = async (text, messageId) => {
  const messageIndex = messages.value.findIndex((msg) => msg.id === messageId);
  if (messageIndex === -1) return;

  // JSON 응답인 경우 타이핑 효과 없이 바로 렌더링
  const itinerary = tryParseJSON(text);
  if (itinerary) {
    messages.value[messageIndex].type = "timeline";
    messages.value[messageIndex].content = itinerary;
    await scrollToBottom();
    return;
  }

  // 텍스트 응답인 경우 한 글자씩 출력
  let currentText = "";
  const speed = 10;

  for (let i = 0; i < text.length; i++) {
    currentText += text.charAt(i);
    messages.value[messageIndex].content = currentText;
    await scrollToBottom();
    await new Promise((resolve) => setTimeout(resolve, speed));
  }
};

// 스크롤을 최하단으로 이동
const scrollToBottom = async () => {
  await nextTick();
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight;
  }
};

/**
 * Map & Timeline Interaction
 */

const handleOpenDetailEvent = (e) => {
  modalPlaceId.value = Number(e.detail);
};

const handleCloseInfoWindowEvent = () => {
  if (naverMapRef.value) {
    naverMapRef.value.closeInfoWindow();
  }
};

const focusOnPlaceById = (id) => {
  const marker = mapMarkers.value.find((m) => m.id === id);
  if (marker) {
    handleMarkerClick(marker);
  }
};

const handleMarkerClick = (marker) => {
  if (!naverMapRef.value) return;

  naverMapRef.value.setCenter(marker.lat, marker.lng);
  selectedPlaceId.value = marker.id;

  const content = getInfoWindowContent({
    id: marker.id,
    title: marker.title,
    category: marker.category,
    address: marker.address,
  });

  naverMapRef.value.openInfoWindow(marker.lat, marker.lng, content);
};

const scrollTimeline = (direction) => {
  if (!timelineScroll.value) return;
  const scrollAmount = 300;
  if (direction === "left") {
    timelineScroll.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    timelineScroll.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
};

const onTimelineWheel = (e) => {
  if (timelineScroll.value) {
    timelineScroll.value.scrollLeft += e.deltaY;
  }
};

/**
 * Lifecycle Hooks
 */
onMounted(() => {
  fetchChatRooms();
  loadMessages();

  window.addEventListener("open-place-detail", handleOpenDetailEvent);
  window.addEventListener("close-info-window", handleCloseInfoWindowEvent);
});

onUnmounted(() => {
  window.removeEventListener("open-place-detail", handleOpenDetailEvent);
  window.removeEventListener("close-info-window", handleCloseInfoWindowEvent);
});
</script>

<style scoped>
.ai-route-page {
  display: flex;
  width: 100%;
  height: calc(100vh - 64px); /* 헤더 높이 제외 */
  overflow: hidden;
  background-color: white;
}

/* 사이드바 스타일 */
.sidebar {
  width: 260px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  z-index: 20;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 16px;
}

.new-chat-btn {
  width: 100%;
  padding: 10px 16px;
  background: #e8f0fe;
  color: #b8864b;
  border: none;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.new-chat-btn:hover {
  background: #d2e3fc;
}

.plus-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 16px;
}

.sidebar-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5f6368;
  margin: 16px 12px 8px;
}

.chat-room-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-room-item {
  padding: 10px 12px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #3c4043;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.chat-room-item:hover {
  background: #f1f3f4;
}

.chat-room-item.active {
  background: #e8f0fe;
  color: #1a73e8;
  font-weight: 500;
}

.chat-icon {
  font-size: 1rem;
}

.room-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-area {
  flex: 1;
  position: relative;
  height: 100%;
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
  background-color: white;
}

/* 1. 지도 컨테이너 */
.map-container {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 0;
}

.map-container :deep(.map) {
  width: 100% !important;
  height: 100% !important;
}

/* 2. 플로팅 채팅 패널 */
.floating-chat-panel {
  position: absolute;
  top: 44px;
  left: 44px;
  width: 380px;
  height: calc(100% - 280px); /* 하단 타임라인 공간 확보 */
  max-height: 800px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.chat-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4a3a2a, #8c6b4a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}

.ai-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.header-info h2 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #111;
}

.status-text {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  width: 100%;
}

.ai-row {
  justify-content: flex-start;
}

.user-row {
  justify-content: flex-end;
}

.bubble {
  max-width: 90%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.5;
  position: relative;
}

.ai-bubble {
  background: white;
  color: #333;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-bubble {
  background: #f3e3c4;
  color: white;
  border-top-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(74, 58, 42, 0.2);
}

.plan-action-area {
  margin-top: 12px;
}

.input-area {
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.chat-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 0.9rem;
  outline: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.send-btn {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #4a3a2a;
  cursor: pointer;
  padding: 4px;
}

.send-icon {
  width: 20px;
  height: 20px;
}

/* 3. 하단 타임라인 */
.bottom-timeline {
  position: absolute;
  bottom: 44px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  height: 180px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.timeline-scroll-area {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 4px;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.timeline-scroll-area::-webkit-scrollbar {
  display: none;
}

.timeline-card {
  min-width: 200px;
  height: 160px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.timeline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.timeline-card.active {
  border: 2px solid #4a3a2a;
}

.card-img {
  height: 80px;
  position: relative;
}

.card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 2.5rem;
}

.card-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  background: #4a3a2a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-time {
  font-size: 0.7rem;
  color: #10b981;
  font-weight: 600;
  margin-bottom: 2px;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #222;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-cat {
  font-size: 0.75rem;
  color: #666;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  z-index: 20;
}

.nav-btn:hover {
  background: #f9fafb;
}

/* 로딩 애니메이션 */
.typing-dots {
  display: flex;
  gap: 4px;
}
.typing-dots span {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 마크다운 스타일 */
.markdown-body {
  font-size: 0.9rem;
  color: #333;
}
.markdown-body p {
  margin-bottom: 0.5rem;
}
.markdown-body ul {
  padding-left: 1.2rem;
  margin-bottom: 0.5rem;
}
.markdown-body li {
  margin-bottom: 0.2rem;
}

/* 타임라인 뷰 스타일 */
.timeline-view {
  position: relative;
  padding-left: 10px;
}

.timeline-line {
  position: absolute;
  top: 20px;
  left: 68px;
  bottom: 60px;
  width: 2px;
  background-color: #ddd;
  border-left: 2px dotted #aaa;
  z-index: 0;
}

.timeline-item {
  display: flex;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.time-col {
  width: 60px;
  text-align: right;
  padding-right: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
}

.time-dot {
  position: absolute;
  top: 6px;
  right: -5px;
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid #333;
  border-radius: 50%;
  z-index: 2;
}

.content-col {
  flex: 1;
}

.timeline-box {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.box-header {
  margin-bottom: 8px;
}

.place-name {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #222;
}

.place-desc {
  font-size: 0.8rem;
  color: #666;
  margin: 0 0 8px 0;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.7rem;
  color: #4a90e2;
  background: #eef6fc;
  padding: 2px 6px;
  border-radius: 4px;
}

.box-footer {
  border-top: 1px solid #f5f5f5;
  padding-top: 8px;
  text-align: center;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  width: 100%;
}

.detail-text {
  font-size: 0.8rem;
  color: #444;
  text-align: left;
  margin-bottom: 8px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.action-btn {
  white-space: nowrap;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #ccc;
}

.add-all-btn {
  background: #e6f4ea;
  border-color: #ceead6;
  color: #1e8e3e;
  font-weight: 600;
}
</style>
