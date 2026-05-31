<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VueCleave from 'vue-cleave-component'
import FloatingInput from '@/components/Login/FloatingInput.vue'
import { signUp, checkUserId, checkNickname, checkEmail } from '@/api/auth.js'

const { t } = useI18n()

const userId = ref('')
const password = ref('')
const passwordCheck = ref('')
const nickname = ref('')
const birth = ref('')
const phone = ref('')

const emailLocal = ref('')
const emailDomain = ref('')
const emailSelect = ref('')

const userIdError = ref('')
const nicknameError = ref('')
const emailError = ref('')
const phoneError = ref('')
const passwordError = ref('')
const birthError = ref('')

// 비밀번호 확인
const validatePassword = () => {
  if (!password.value || !passwordCheck.value) {
    passwordError.value = ''
    return
  }
  passwordError.value =
      password.value === passwordCheck.value ? '' : t('signup.passwordNotMatch')
}

// 공통 중복 체크 (ref 또는 {value: '...'} 지원)
const checkDuplication = async (apiFn, value, errorRef) => {
  const v = (value ?? '').toString().trim()

  if (!v) {
    errorRef.value = ''
    return
  }

  try {
    const res = await apiFn(v)
    errorRef.value = res.data?.exists ? t('signup.dupInUse') : ''
  } catch (e) {
    console.error(e)
    errorRef.value = t('signup.dupError')
  }
}

const checkUserIdDup = () => checkDuplication(checkUserId, userId.value, userIdError)
const checkNicknameDup = () => checkDuplication(checkNickname, nickname.value, nicknameError)

const fullEmail = computed(() => {
  const local = emailLocal.value.trim()
  const domain = emailDomain.value.trim()
  return local && domain ? `${local}@${domain}` : ''
})
const checkEmailDup = () => checkDuplication(checkEmail, fullEmail.value, emailError)

// 숫자만 추출해서 보낼 용도
const phoneDigits = computed(() => phone.value.replace(/\D/g, ''))

//폼 유효성
const isFormValid = computed(() => {
  return (
      userId.value.trim() &&
      password.value &&
      passwordCheck.value &&
      nickname.value.trim() &&
      birth.value.length === 8 &&
      phoneDigits.value.length === 11 &&
      emailLocal.value.trim() &&
      emailDomain.value.trim() &&
      !userIdError.value &&
      !nicknameError.value &&
      !emailError.value &&
      !passwordError.value
  )
})

//전송
const handleSubmit = async () => {
  if (!isFormValid.value) return

  const payload = {
    userId: userId.value.trim(),
    userPassword: password.value,
    nickname: nickname.value.trim(),
    birth: birth.value,                 // 19960521 같은 8자리
    phone: phoneDigits.value,           // 01042530073 숫자만
    email: `${emailLocal.value.trim()}@${emailDomain.value.trim()}`
  }

  try {
    await signUp(payload)
    alert(t('signup.success'))
  } catch (e) {
    console.error(e)
    alert(t('signup.submitFailed'))
  }
}
</script>


<template>
  <main class="signup-page">
    <section class="signup-card">

      <!-- 아이디 -->
      <div class="signup-field">
        <FloatingInput
            v-model="userId"
            :label="t('signup.id')"
            id="signup-id"
            @blur="checkUserIdDup"
        />
        <p v-if="userIdError" class="error-msg">{{ userIdError }}</p>
      </div>

      <!-- 비밀번호 -->
      <div class="signup-field">
        <FloatingInput
            v-model="password"
            type="password"
            :label="t('signup.password')"
            id="signup-password"
            @input="validatePassword"
        />
      </div>

      <!-- 비밀번호 확인 -->
      <div class="signup-field">
        <FloatingInput
            v-model="passwordCheck"
            type="password"
            :label="t('signup.passwordConfirm')"
            id="signup-password-check"
            @input="validatePassword"
        />
        <p v-if="passwordError" class="error-msg">{{ passwordError }}</p>
      </div>

      <!-- 닉네임 -->
      <div class="signup-field">
        <FloatingInput
            v-model="nickname"
            :label="t('signup.nickname')"
            id="signup-nickname"
            @blur="checkNicknameDup"
        />
        <p v-if="nicknameError" class="error-msg">{{ nicknameError }}</p>
      </div>

      <!-- 생년월일 (라벨 위, 인풋 안에는 YYYYMMDD 만) -->
      <div class="signup-field">
        <p class="field-label">{{ t('signup.birth') }}</p>
        <div class="plain-input-wrapper">
          <VueCleave
              v-model="birth"
              :options="{ blocks: [4, 2, 2], numericOnly: true, delimiter: '' }"
              placeholder="YYYYMMDD"
              class="plain-input"
          />
        </div>
        <p v-if="birthError" class="error-msg">{{ birthError }}</p>
      </div>

      <!-- 휴대폰 번호 (라벨 위, 화면에는 010-4253-0073 형식) -->
      <div class="signup-field">
        <p class="field-label">{{ t('signup.phone') }}</p>
        <div class="plain-input-wrapper">
          <VueCleave
              v-model="phone"
              :options="{
              blocks: [3, 4, 4],
              delimiters: ['-', '-'],
              numericOnly: true
            }"
              placeholder="000-0000-0000"
              class="plain-input"
          />
        </div>
        <p v-if="phoneError" class="error-msg">{{ phoneError }}</p>
      </div>

      <!-- 이메일 (라벨 위, 안에는 example / domain.com 만) -->
      <div class="signup-field">
        <p class="field-label">{{ t('signup.email') }}</p>
        <div class="email-row">
          <div class="email-col">
            <div class="plain-input-wrapper">
              <input
                  v-model="emailLocal"
                  class="plain-input"
                  type="text"
                  placeholder="example"
                  @blur="checkEmailDup"
              />
            </div>
          </div>
          <span class="at">@</span>
          <div class="email-col">
            <div class="plain-input-wrapper">
              <input
                  v-model="emailDomain"
                  class="plain-input"
                  type="text"
                  placeholder="domain.com"
                  @blur="checkEmailDup"
              />
            </div>
          </div>
          <select
              class="email-select"
              v-model="emailSelect"
              @change="() => { emailDomain = emailSelect; checkEmailDup(); }"
          >
            <option value="">{{t('signup.emailDomainSelect')}}</option>
            <option value="naver.com">naver.com</option>
            <option value="google.com">google.com</option>
            <option value="daum.net">daum.net</option>
          </select>
        </div>
        <p v-if="emailError" class="error-msg">{{ emailError }}</p>
      </div>

      <!-- 버튼 -->
      <button
          class="signup-button"
          :class="{ disabled: !isFormValid }"
          :disabled="!isFormValid"
          @click="handleSubmit"
      >
        {{ t('signup.submit') }}
      </button>
    </section>
  </main>
</template>


<style scoped>
.signup-page {
  width: 100%;
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  padding: 48px 16px;
  box-sizing: border-box;
}

.signup-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  padding: 36px 32px 40px;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.06);
}

.signup-field {
  margin-bottom: 20px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
}

/* 생일/폰/이메일용 일반 인풋 박스 */
.plain-input-wrapper {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #f3e3c4;
  background-color: #f8fff8;
  padding: 10px 14px;
  box-sizing: border-box;
}

.plain-input-wrapper:focus-within {
  background-color: #ffffff;
  border-color: #f0d49c;
}

.plain-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
}

/* 에러 문구 */
.error-msg {
  margin-top: 4px;
  font-size: 12px;
  color: #e53935;
}

/* 이메일 행 */
.email-row {
  display: grid;
  grid-template-columns: 1.4fr auto 1.4fr auto;
  align-items: center;
  column-gap: 8px;
}

.email-col {
  width: 100%;
}

.at {
  font-size: 16px;
  color: #666;
  text-align: center;
}

.email-select {
  height: 44px;
  border-radius: 10px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  background: #fafafa;
  font-size: 14px;
}

/* 버튼 */
.signup-button {
  width: 100%;
  margin-top: 10px;
  height: 48px;
  border-radius: 999px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  background-color: #111827;
  color: white;
  cursor: pointer;
  transition: background-color 0.18s ease, transform 0.12s ease,
  box-shadow 0.12s ease;
}

.signup-button.disabled {
  background-color: #d1d5db;
  cursor: default;
  box-shadow: none;
}

.signup-button:not(.disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

/* 반응형 */
@media (max-width: 600px) {
  .signup-card {
    padding: 28px 20px 28px;
    border-radius: 14px;
  }

  .email-row {
    grid-template-columns: 1.4fr auto 1.4fr;
    row-gap: 8px;
  }

  .email-select {
    margin-top: 8px;
    grid-column: 1 / 4;
    width: 100%;
  }
}
</style>

