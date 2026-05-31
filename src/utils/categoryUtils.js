import {
  PhCamera,
  PhPalette,
  PhConfetti,
  PhMapTrifold,
  PhSoccerBall,
  PhBed,
  PhShoppingBag,
  PhForkKnife,
  PhMapPin,
} from "@phosphor-icons/vue";

export const categoryNameMap = {
  12: "관광지",
  14: "문화시설",
  15: "축제/공연/행사",
  25: "여행코스",
  28: "레포츠",
  32: "숙박",
  38: "쇼핑",
  39: "음식점",
};

export const categoryIconMap = {
  12: PhCamera,
  14: PhPalette,
  15: PhConfetti,
  25: PhMapTrifold,
  28: PhSoccerBall,
  32: PhBed,
  38: PhShoppingBag,
  39: PhForkKnife,
};

export const categoryMapIconMap = {
  12: "🏔️", // 관광지
  14: "🏛️", // 문화시설
  15: "🎉", // 축제/공연/행사
  25: "🗺️", // 여행코스
  28: "🏄", // 레포츠
  32: "🏨", // 숙박
  38: "🛍️", // 쇼핑
  39: "🍽️", // 음식점
};

export const categoryColorMap = {
  12: "#3B82F6", // 관광지: Blue
  14: "#8B5CF6", // 문화시설: Purple
  15: "#EC4899", // 축제: Pink
  25: "#10B981", // 여행코스: Green
  28: "#F59E0B", // 레포츠: Amber
  32: "#6366F1", // 숙박: Indigo
  38: "#F97316", // 쇼핑: Orange
  39: "#EF4444", // 음식점: Red
};

export const getCategoryName = (typeId) => {
  return categoryNameMap[typeId] || "기타";
};

export const getCategoryIcon = (typeId) => {
  return categoryIconMap[typeId] || PhMapPin;
};

export const getCategoryMapIcon = (typeId) => {
  return categoryMapIconMap[typeId] || "📍";
};

export const getCategoryColor = (typeId) => {
  return categoryColorMap[typeId] || "#6B7280"; // Default Gray
};
