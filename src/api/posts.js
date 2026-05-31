import api from '@/api/client.js';

/** 게시물 목록 조회
* GET url : /api/review?page = & size =
* 기본 값 : page = 1, size = 10
*/
export function fetchReviews(page = 1, size = 10) {
    return api.get('/review', {
        params: { page, size },
    });
}

/**
 * 게시물 상세 조회
 * GET url : /api/review/{reviewIndex}
 * */
export function fetchReview(reviewIndex) {
    return api.get(`/review/${reviewIndex}`);
}

/**
 * 게시물 작성
 * POST url : /api/review
 * param {title : String, content : String}
 * param {File[] | FileList} [images]
 * */
export function createReview(formData) {
    return api.post('/review', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}
/**
 * 게시물 수정(내용 / 이미지삭제 / 이미지 추가)
 * PATCH url : /api/review/{reviewIndex}
 *
 * param {number} reviewIndex
 * param {title : String, content : String} review
 * param {
 *     imageIndexesToDelete : number[],
 *     imagesToAdd?: File[] | FileList
 * }
 * */
export function updateReview(reviewIndex,review,options = {}){
    const {imageIndexesToDelete, imagesToAdd} = options;
    const formData = new FormData();

    formData.append('review',JSON.stringify(review));

    //삭제할 이미지 인덱스 리스트
    if(imageIndexesToDelete && imageIndexesToDelete.length > 0){
        formData.append(
            'imageIndexesToDelete',
            JSON.stringify(imageIndexesToDelete),
        );
    }
    //새로 추가할 이미지 리스트
    if(imagesToAdd && imagesToAdd.length > 0){
        Array.from(imagesToAdd).forEach((file)=>{
            if(file instanceof Blob){
                formData.append('imagesToAdd',file);
            }else{
                console.log("file is not Blob")
            }
        });
    }
    return api.patch(`/review/${reviewIndex}`,formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
}

/**
 * 게시글 삭제
 * DELETE url : /api/review/{reviewIndex}
 * */
export function deleteReview(reviewIndex){
    return api.delete(`/review/${reviewIndex}`);
}

/**
 * 댓글 목록 조회
 * GET url : /api/review/{reviewIndex}/comments?page = & size =
 * */
export function fetchComments(reviewIndex,page = 1,size = 10){
    return api.get(`/review/${reviewIndex}/comment`,{
        params:{page,size}
    });
}

/**
 * 댓글 작성
 * POST url : /api/review/{reviewIndex}/comments
 *
 * param {number} reviewIndex
 * param {string} content
 * */
export function createComment(reviewIndex,content){
    return api.post(`/review/${reviewIndex}/comment`,
        {content}
    );
}

/**
 * 댓글 삭제
 * DELETE url : /api/review/{reviewIndex}/comments/{commentIndex}
 * */
export function deleteComment(reviewIndex, commentIndex){
    return api.delete(`/review/${reviewIndex}/comment/${commentIndex}`);
}

/**
 * 게시글 좋아요
 * POST url : /api/review/{reviewIndex}/like
 * */
export function likeReview(reviewIndex){
    return api.post(`/review/${reviewIndex}/like`)
        .catch(error=>{
            console.error('좋아요 요청 오류 : ',error);
            if(error.response && error.response.status === 401){
                alert('로그인이 필요합니다.')
            }
        })
}

/**
 * 게시글 좋아요 취소
 * DELETE url : /api/review/{reviewIndex}/like
 * */
export function unlikeReview(reviewIndex){
    return api.delete(`/review/${reviewIndex}/like`)
        .catch(error=>{
            console.error('좋아요 취소 요청 오류 : ',error);
            if(error.response && error.response.status === 401){
                alert('로그인이 필요합니다.');
            }
        })
}
/**
 * 게시글 좋아요 여부 확인
 * GET url : /api/review/{reviewIndex}/liked
 * */
export function fetchReviewLikedStatus(reviewIndex){
    return api.get(`/review/${reviewIndex}/liked`);
}

