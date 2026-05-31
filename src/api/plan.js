import api from "./client";

export const createPlan = (planData) => {
  return api.post("/plans", planData);
};

export const getMyPlans = (params) => {
  return api.get("/plans/my", { params });
};

export const getPlanDetail = (planId) => {
  return api.get(`/plans/${planId}`);
};

export const updatePlan = (planId, planData) => {
  return api.patch(`/plans/${planId}`, planData);
};

export const deletePlan = (planId) => {
  return api.delete(`/plans/${planId}`);
};
