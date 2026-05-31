/**
 * api는 토큰 사용 권한 필요할 때 사용
 * publicApi는 토큰 사용 안함 권한체크 안할때 사용
 * */
import api from '@/api/client.js';
import publicApi from '@/api/publicClient.js';

/**
 * 공지사항 목록 조회
 * GET url : /api/notice?page = & size =
 * token X
 * page, size 없으면 기본값 1, 10
 * */
export function fetchNotices(page = 1, size = 10) {
    return publicApi.get('/api/notice', {
        params: { page, size },
    });
}

/**
 * 공지사항 상세 조회
 * GET url : /api/notice/{noticeIndex}
 * */
export function fetchNoticeDetail(noticeIndex) {
    return publicApi.get(`/api/notice/${noticeIndex}`);
}

/**
 * 공지사항 작성
 * POST url : /api/notice
 * */
export function createNotice({title, content}) {
    return api.post('/notice',{
        title,
        content,
    });
}
/**
 * 공지사항 수정
 * PUT url : /api/notice/{noticeIndex}
 * */
export function updateNotice(noticeIndex, {title, content}){
    return api.put(`/notice/${noticeIndex}`,{
        title,
        content,
    });
}
/**
 * 공지사항 삭제
 * DELETE url : /api/notice/{noticeIndex}
 * */
export function deleteNotice(noticeIndex){
    return api.delete(`/notice/${noticeIndex}`);
}