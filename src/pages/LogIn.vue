<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue'
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

import {socialGoogleLogin, socialNaverLogin, socialKakaoLogin} from "@/api/auth";
import {useAuthStore} from "@/stores/auth.js";
import {fetchMyProfile} from "@/api/user.js";

import FloatingInput from "@/components/Login/FloatingInput.vue";
import googleLogo from '@/assets/LoginMark/google/ko/circle.png';
import naverLogo from '@/assets/LoginMark/naver/ko/circle.png';
import kakaoLogo from '@/assets/LoginMark/kakao/ko/logo.png';


const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore()

const logId = ref('')
const logPw = ref('')
const errorMsg = ref('')

const afterLogin= () =>{
  const redirect = route.query.redirect || '/';
  router.push(redirect);
}

const submitLogin = async() => {
  if(!logId.value || !logPw.value){
    errorMsg.value = t('login.errorMsg') || '아이디와 비밀번호를 입력해 주세요'
    return
  }
  try{
    errorMsg.value = ''
    await auth.login({ userId: logId.value, userPassword: logPw.value });
    afterLogin();
  } catch(e){
    console.error(e)
    errorMsg.value=
        e?.response?.data?.message
        || t('login.errorInvalid')
        || '아이디 또는 비밀번호가 올바르지 않습니다.'
  }
}

const onClickGoogle = () => {
  socialGoogleLogin()
}

const onClickNaver = () => {
  socialNaverLogin()
}

const onClickKakao = () => {
  socialKakaoLogin()
}

let messageHandler

onMounted(() => {
  // reason=auth_required면 로그인 알림
  if (route.query.reason === 'auth_required') {
    alert(t('auth.loginRequired'));

    // 한 번만 뜨게 reason 제거
    router.replace({
      query: {
        ...route.query,
        reason: undefined,
      },
    });
  }

  // 소셜 로그인 message handler
  messageHandler = async (event) => {
    if (event.origin !== 'http://localhost:8080') return;

    const data = event.data;
    if (!data || data.type !== 'OAUTH_DONE') {
      console.log('[MSG] OAUTH_DONE 아님 → 무시됨');
      return;
    }

    try {
      const res = await fetchMyProfile();

      auth.setUser(res.data.data);

      // redirect 있으면 그쪽으로 복귀, 없으면 홈
      afterLogin();
    } catch (e) {
      console.error('소셜 로그인 후 프로필 조회 실패', e);

      if (e.response) {
        console.error('[API ERROR] status:', e.response.status);
        console.error('[API ERROR] response:', e.response.data);
      } else {
        console.error('[API ERROR] 네트워크 오류 또는 쿠키 미전송');
      }
    }
  };

  window.addEventListener('message', messageHandler);
});


</script>

<template>
<main class="login-page">
  <section class = "login-card">
    <FloatingInput
      v-model="logId"
      id="login-id"
      :label="t('login.userId')"
      type="text"
    />
    <FloatingInput
      v-model = "logPw"
      id="login-pw"
      :label="t('login.userPassword')"
      type="password"
    />
    <p v-if="errorMsg" class="login-error">{{errorMsg}}</p>

    <button class="login-button" @click="submitLogin">{{t('login.login')}}</button>
    <div class="login-divider"></div>
    <div class="social-login">

      <button class="social-btn google-btn" @click="onClickGoogle">
        <img :src="googleLogo" alt="Google" class="logo" />
        <span class="text">{{t('social.google')}}</span>
      </button>

      <button class="social-btn naver-btn" @click="onClickNaver">
        <img :src="naverLogo" alt="Naver" class="logo" />
        <span class="text">{{t('social.naver')}}</span>
      </button>

      <button class="social-btn kakao-btn" @click="onClickKakao">
        <img :src="kakaoLogo" alt="Kakao" class="logo" />
        <span class="text">{{t('social.kakao')}}</span>
      </button>
    </div>
    <div class="login-divider"></div>
    <div class="login-links">
      <button class="signup-cta" type="button" @click="router.push('/signup')">
        {{ t('login.signup') }}
      </button>
    </div>
  </section>
</main>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 80px 16px 40px;
  box-sizing: border-box;

  background: radial-gradient(circle at top, #f9f0dd 0, #f3e3c4 45%, #e2c79b 100%);
}

/* 로그인 카드 전체 */
.login-card {
  width: 90%;
  max-width: 420px;
  margin: 0 auto;
  padding: 32px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}
/* 에러 표시 */
.login-error {
  margin-top: 4px;
  font-size: 13px;
  color: #d23737;
}
/* 소셜 로그인 */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 공통 버튼 레이아웃 */
.social-btn {
  display: flex;
  align-items: center;

  width: 100%;
  height: 48px;

  border-radius: 8px;
  border: none;
  cursor: pointer;

  padding: 0 14px;

  font-size: 14px;
  font-weight: 600;
}

/* 로고는 왼쪽 고정 */
.social-btn .logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* 텍스트는 '로고 제외 나머지 영역' 가운데 정렬 */
.social-btn .text {
  flex: 1;                /* 남은 공간 전부 먹고 */
  text-align: center;     /* 그 공간 안에서 가운데 정렬 */
}

/* 서비스별 배경색 */
.google-btn {
  background-color: #ffffff;
  border: 1px solid #ddd;
}

.naver-btn {
  background-color: #03c75a;
  color: #fff;
}

.kakao-btn {
  background-color: #fee500;
}

/* 로그인 버튼 */
.login-button {
  margin-top: 4px;
  width: 100%;
  padding: 11px 0;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: #1b2738;          /* 진한 네이비 */
  color: #f3e3c4;               /* 페이지 메인 색과 통일 */
  letter-spacing: 0.03em;
  transition:
      background 0.18s ease,
      transform 0.12s ease,
      box-shadow 0.18s ease;
}

.login-button:hover {
  background: #24344a;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}

.login-button:active {
  transform: translateY(1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}

/* 모바일에서 여백 조금 줄이기 */
@media (max-width: 600px) {
  .login-card {
    margin: 56px 16px 32px;
    padding: 20px 18px 24px;
    border-radius: 16px;
  }

  .login-button {
    font-size: 14px;
    padding: 10px 0;
  }
}
/* 로그인 아래 점선*/
.login-divider {
  margin : 8px 0 8px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.25);
}

/* 하단 회원가입 CTA 영역 */
.login-links {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 회원가입 버튼 (로그인 색상 계열로 통일) */
.signup-cta {
  margin-top: 4px;
  width: 100%;
  padding: 11px 0;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: #1b2738;
  color: #f3e3c4;
  letter-spacing: 0.03em;
  transition:
      background 0.18s ease,
      transform 0.12s ease,
      box-shadow 0.18s ease;
}

.signup-cta:hover {
  background: #24344a;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}

.signup-cta:active {
  transform: translateY(1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}
</style>