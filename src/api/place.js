import client from "./client";

export const searchPlaces = async (params) => {
  try {
    console.log("Searching places with params:", params);
    const response = await client.get("/places", { params });
    return response.data;
  } catch (error) {
    console.error("Error searching places:", error);
    throw error;
  }
};

export const getPlaceDetail = async (placeId) => {
  try {
    const response = await client.get(`/places/${placeId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting place detail:", error);
    throw error;
  }
};

export const addLike = async (placeId) => {
  try {
    const response = await client.post(`/places/${placeId}/likes`);
    return response.data;
  } catch (error) {
    console.error("Error adding like:", error);
    throw error;
  }
};

export const removeLike = async (placeId) => {
  try {
    const response = await client.delete(`/places/${placeId}/likes`);
    return response.data;
  } catch (error) {
    console.error("Error removing like:", error);
    throw error;
  }
};

export const getReviews = async (placeId) => {
  try {
    const response = await client.get(`/places/${placeId}/reviews`);
    return response.data;
  } catch (error) {
    console.error("Error getting reviews:", error);
    throw error;
  }
};

export const addReview = async (placeId, data) => {
  try {
    const response = await client.post(`/places/${placeId}/reviews`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

export const updateReview = async (reviewId, data) => {
  try {
    const response = await client.put(`/places/reviews/${reviewId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await client.delete(`/places/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
