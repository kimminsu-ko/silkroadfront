<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {useI18n} from "vue-i18n";
import { getChatRooms, createChatRoom, deleteChatRoom } from "@/api/ai";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const chatRooms = ref([]);
const isLoading = ref(false);
const {t} = useI18n();

// 모달 상태
const isModalOpen = ref(false);
const newRoomTitle = ref("");

// 채팅방 목록 불러오기
const fetchChatRooms = async () => {
  if (!authStore.isLoggedIn) {
    alert(t("chatRooms.authRequiredAlert"));
    router.push("/login");
    return;
  }

  isLoading.value = true;
  try {
    const data = await getChatRooms();

    chatRooms.value = data.map((room) => {
      if (room.lastMessage) {
        let cleanMsg = room.lastMessage.replace(/\(System Note:[\s\S]*?\)$/, "").trim();

        if (cleanMsg.includes('"itinerary":') || cleanMsg.includes("```json")) {
          cleanMsg = t("chatRooms.itinerarySuggested");
        }

        room.lastMessage = cleanMsg;
      }
      return room;
    });
  } catch (error) {
    console.error(t("chatRooms.fetchFailLog"), error);
    alert(t("chatRooms.fetchFailAlert"));
  } finally {
    isLoading.value = false;
  }
};

// 모달 열기
const openCreateModal = () => {
  newRoomTitle.value = "";
  isModalOpen.value = true;
};

// 모달 닫기
const closeCreateModal = () => {
  isModalOpen.value = false;
};

// 새 채팅방 만들기 (API 호출)
const confirmCreateRoom = async () => {
  const title = newRoomTitle.value.trim() || t("chatRooms.defaultRoomTitle");

  try {
    const newRoom = await createChatRoom(title);
    closeCreateModal();
    await router.push(`/ai-route/${newRoom.roomId}`);
  } catch (error) {
    console.error(t("chatRooms.createFailLog"), error);
    alert(t("chatRooms.createFail"));
  }
};
// 채팅방 삭제
const handleDeleteRoom = async (roomId) => {
  if (!confirm(t("chatRooms.deleteConfirm"))) return;

  try {
    await deleteChatRoom(roomId);
    await fetchChatRooms();
  } catch (error) {
    console.error(t("chatRooms.deleteFailLog"), error);
    alert(t("chatRooms.deleteFail"));
  }
};

// 채팅방 입장
const enterRoom = (roomId) => {
  router.push(`/ai-route/${roomId}`);
};

onMounted(() => {
  fetchChatRooms();
});
</script>

<template>
  <div class="chat-room-list-page">
    <div v-if="isLoading" class="loading">{{ t('chatRooms.loading') }}</div>

    <div v-else-if="chatRooms.length === 0" class="empty-container">
      <div class="header-section">
        <h1>{{ t('chatRooms.title') }}</h1>
        <p>{{ t('chatRooms.subtitle') }}</p>
        <button class="create-btn big-btn" @click="openCreateModal">
          {{ t('chatRooms.createButton') }}
        </button>
      </div>
      <div class="empty-state-msg">
        <p>{{ t('chatRooms.emptyTitle') }}</p>
        <p>{{ t('chatRooms.emptyDesc') }}</p>
      </div>
    </div>

    <div v-else class="list-container">
      <div class="list-header">
        <h2>{{ t('chatRooms.myListTitle') }}</h2>
        <button class="create-btn small-btn" @click="openCreateModal">
          {{ t('chatRooms.createButton') }}
        </button>
      </div>

      <div class="room-list">
        <div
            v-for="room in chatRooms"
            :key="room.roomId"
            class="room-card"
            @click="enterRoom(room.roomId)"
        >
          <div class="room-info">
            <h3 class="room-title">{{ room.title }}</h3>
            <p class="room-last-message">
              {{ room.lastMessage || t('chatRooms.lastMessageFallback') }}
            </p>
            <span class="room-date">{{ new Date(room.updatedAt).toLocaleString() }}</span>
          </div>
          <button class="delete-btn" @click.stop="handleDeleteRoom(room.roomId)">
            {{ t('chatRooms.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-content">
        <h3>{{ t('chatRooms.modalTitle') }}</h3>
        <input
            type="text"
            v-model="newRoomTitle"
            :placeholder="t('chatRooms.modalPlaceholder')"
            class="modal-input"
            @keyup.enter="confirmCreateRoom"
            autoFocus
        />
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeCreateModal">{{ t('chatRooms.cancel') }}</button>
          <button class="confirm-btn" @click="confirmCreateRoom">{{ t('chatRooms.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-room-list-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 60vh;
  background-color: white;
}

/* 공통 버튼 스타일 */
.create-btn {
  background-color: #b8864b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 600;
}

.create-btn:hover {
  background-color: #a07540;
}

/* === Case 1: 채팅방 없을 때 (Empty State) === */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.header-section h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 16px;
}

.header-section p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 32px;
}

.big-btn {
  padding: 16px 32px;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(184, 134, 75, 0.3);
}

.empty-state-msg {
  text-align: center;
  color: #999;
  line-height: 1.6;
}

/* === Case 2: 채팅방 있을 때 (List State) === */
.list-container {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #eee;
}

.list-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.small-btn {
  padding: 10px 20px;
  font-size: 0.95rem;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.room-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #dcb059;
}

.room-info {
  flex: 1;
  padding-right: 20px;
}

.room-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #2c2c2c;
}

.room-last-message {
  color: #666;
  font-size: 1rem;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 600px;
}

.room-date {
  font-size: 0.85rem;
  color: #9ca3af;
}

.delete-btn {
  background: white;
  border: 1px solid #e5e7eb;
  color: #9ca3af;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* 모달 스타일 (기존 유지) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #333;
  text-align: center;
}

.modal-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 20px;
  outline: none;
  transition: border-color 0.2s;
}

.modal-input:focus {
  border-color: #b8864b;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.confirm-btn {
  padding: 10px 20px;
  background: #b8864b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.confirm-btn:hover {
  background: #a07540;
}
</style>
