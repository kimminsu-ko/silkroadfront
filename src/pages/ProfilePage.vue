<script setup>
import {ref, onMounted, computed} from 'vue'
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {fetchMyProfile, updateProfile, uploadProfileImage} from "@/api/user";
import SocialProfileView from "@/components/Profile/SocialProfileView.vue";
import NormalProfileView from "@/components/Profile/NormalProfileView.vue";
import imageCompression from 'browser-image-compression'


const router = useRouter();
const profile = ref(null)
const errorMsg = ref('')
const {t} = useI18n();

const loadProfile = async () => {
  try{
    errorMsg.value = ''

    const res= await fetchMyProfile()
    profile.value = res.data.data
  }catch (e) {
    console.error(e)
    if(e.response?.status === 401){
      alert(t("profile.loginRequired"))
      errorMsg.value = t("profile.loginRequired")

      await router.replace({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }else{

      errorMsg.value = t("profile.loadFail")
    }
  }
}
onMounted(loadProfile)

//소셜로그인인지 확인 여부
const isSocial = computed(() => {
  if (!profile.value) return false
  return profile.value.socialType !== null
})

/**
 * 형식 검증
 * */
// 전화번호 형식 (010-1234-5678 or 01012345678)
const isValidPhone = (phone) => {
  const regex = /^01[016789]-?\d{3,4}-?\d{4}$/;
  return regex.test(phone);
};

// 생년월일 (YYYYMMDD)
const isValidBirth = (birth) => {
  const regex = /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;
  return regex.test(birth);
};

//일반 필드 수정
const handleUpdateField = async (payload) => {

  if (payload.phone && !isValidPhone(payload.phone)) {
    alert(t("profile.phoneInvalid"));
    return;
  }

  if (payload.birth && !isValidBirth(payload.birth)) {
    alert(t("profile.birthInvalid"));
    return;
  }

  try {
    const fullData = {
      userEmail: profile.value.userEmail,
      userNickname: profile.value.userNickname,
      phone: profile.value.phone,
      birth: profile.value.birth,
      profileUrl: profile.value.profileUrl,
      ...payload   // 변경된 값만 덮어쓰기
    }

    await updateProfile(fullData)

    // 화면 반영
    Object.assign(profile.value, fullData)

    // 로컬스토리지 반영
    const saved = JSON.parse(localStorage.getItem('user'))
    Object.assign(saved, fullData)
    localStorage.setItem('user', JSON.stringify(saved))
  } catch (e) {
    console.error('프로필 수정 실패', e)
  }
}

// 사진 변경 처리
const handleChangePhoto = async (file) => {
  try {

    // 1. 사진 크면 리사이징
    const compressed = await imageCompression(file, {
      // 사진 옵션
      maxWidthOrHeight: 800, //사이즈
      maxSizeMB: 1, //용량 MB
      useWebWorker: true  //성능향상
    })

    // 2. 업로드 → profileUrl 반환
    const newUrl = await uploadProfileImage(compressed)

    // 3. 해당 URL로 다시 PATCH
    //await updateProfile({ profileUrl: newUrl })

    // 4. 상태 반영
    profile.value.profileUrl = newUrl

    const saved = JSON.parse(localStorage.getItem('user'))
    saved.profileUrl = newUrl
    localStorage.setItem('user', JSON.stringify(saved))
  } catch (e) {
    console.error('사진 변경 실패', e)
  }
}
</script>

<template>
  <main class="profile-page">
    <h1 class="title">{{ t("profile.title") }}</h1>

    <p v-if="errorMsg">{{ errorMsg }}</p>

    <section v-else-if="profile">
      <!-- 소셜 회원 -->
      <SocialProfileView
          v-if="isSocial"
          :profile="profile"
          @update-field="handleUpdateField"
          @change-photo="handleChangePhoto"
      />

      <!-- 일반 회원 -->
      <NormalProfileView
          v-else
          :profile="profile"
          @update-field="handleUpdateField"
          @change-photo="handleChangePhoto"
      />
    </section>
  </main>
</template>


<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.title {
  margin-bottom: 24px;
  align-content: center;
  text-align: center;
}
</style>