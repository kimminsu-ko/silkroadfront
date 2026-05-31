import api from './client'

//로그인
export function signIn({userId, userPassword}){
    return api.post('/auth/sign-in',{userId,userPassword})
}

//로그아웃
export function signOut(){
    return api.post('/auth/sign-out')
}

//회원가입
export function signUp(data){
    return api.post('/auth/sign-up',data)
}

/* 소셜 로그인 - 네이버, 구글, 카카오*/

//네이버 로그인
export function socialNaverLogin() {
    window.open(
        '/oauth2/authorization/naver',
        'naverLogin',
        'width=480,height=640,top=100,left=100'
    )
}

//구글 로그인
export function socialGoogleLogin(){
    window.open(
        '/oauth2/authorization/google',
        'googleLogin',
        'width=480,height=640,top=100,left=100'
    )
}

//카카오 로그인
export function socialKakaoLogin(){
    window.open(
        '/oauth2/authorization/kakao',
        'kakaoLogin',
        'width=480,height=640,top=100,left=100'
    )
}

//회원탈퇴
export function deleteAccount({password}){
    return api.post('/auth/delete',{password})
}

/* 회원 필터링 */

//이메일 중복 확인
export function checkEmailDuplicate(email){
    return api.get('/auth/email-check',{
        params:{email}
    })
}

//이메일 인증코드 발송
export function sendEmailCode(email){
    return api.post('/auth/email/send',{email})
}

//이메일 인증코드 검증
export function verifyEmailCode({email,code}){
    return api.post('/auth/email/verify',{email,code})
}

//비밀번호 찾기
//POST = 임시 비밀번호 메일 발송
//PATCH = newPassword 변경
export function sendTempPassword({id,name,email}){
    return api.post('/auth/find-password',{id,name,email})
}

export function resetPassword({tempPassword,newPassword}){
    return api.patch('/auth/find-password',{tempPassword,newPassword})
}

/* 회원가입 중복 확인 api*/

// 아이디 중복 체크
export function checkUserId(userid) {
    return api.post('/auth/check/user-id', { userid })
}

// 닉네임 중복 체크
export function checkNickname(nickname) {
    return api.post('/auth/check/nickname', { nickname })
}

// 이메일 중복 체크
export function checkEmail(email) {
    return api.post('/auth/check/email', { email })
}

// 전화번호 중복 체크
export function checkPhone(phone) {
    return api.post('/auth/check/phone', { phone })
}