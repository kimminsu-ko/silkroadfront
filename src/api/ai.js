import client from "./client";

// 채팅방 목록 조회
export const getChatRooms = async () => {
  const response = await client.get("/plans/ai-chat/rooms");
  return response.data;
};

// 채팅방 생성
export const createChatRoom = async (title) => {
  const response = await client.post("/plans/ai-chat/rooms", { title });
  return response.data;
};

// 채팅방 삭제
export const deleteChatRoom = async (roomId) => {
  await client.delete(`/plans/ai-chat/rooms/${roomId}`);
};

// 메시지 전송
export const sendMessage = async (roomId, message) => {
  const response = await client.post(
    `/plans/ai-chat/rooms/${roomId}/messages`,
    { message },
    { timeout: 60000 } // 60초 타임아웃
  );
  return response.data;
};

// 메시지 목록 조회 (이전 대화 불러오기)
export const getChatMessages = async (roomId) => {
  const response = await client.get(`/plans/ai-chat/rooms/${roomId}/messages`);
  return response.data;
};
