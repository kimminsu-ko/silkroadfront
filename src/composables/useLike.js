import { ref } from "vue";

export function useLike() {
  const likedPlaces = ref(new Set());

  const toggleLike = (id) => {
    const newSet = new Set(likedPlaces.value);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    likedPlaces.value = newSet;
  };

  const isLiked = (id) => {
    return likedPlaces.value.has(id);
  };

  return {
    likedPlaces,
    toggleLike,
    isLiked,
  };
}
