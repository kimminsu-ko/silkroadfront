import publicApi from "@/api/publicClient.js";

/**
 * 인기 후기 리스트 조회
 * GET url : /main/popular
*/
export function fetchPopularReviews() {
    return publicApi.get('/api/review/popular');
}
/**
 * 관리자 추천 여행 계획
 * GET url : /main/recommend
 * */
export function fetchRecommendPlans() {
    return publicApi.get("/main/recommend");
}
/**
 * 메인 배너 리스트
 * GET url : /main/banner
 * */
export function fetchBanners() {
    return publicApi.get("/main/banner");
}