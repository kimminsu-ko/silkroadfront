<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { signOut } from "@/api/auth";

const props = defineProps({
  loginClass: {
    type: String,
    default: "",
  },
  signupClass: {
    type: String,
    default: "",
  },
  userClass: {
    type: String,
    default: "",
  },
  logoutClass: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["logged-out"]);

const { t } = useI18n();
const auth = useAuthStore();

const isLoggedIn = computed(() => !!auth.user);

const displayName = computed(() => auth.user?.userNickname || auth.user?.userEmail || "api매칭오류");

const handleLogout = async () => {
  await auth.logout();
  emit("logged-out");
};
</script>

<template>
  <template v-if="isLoggedIn">
    <RouterLink to="/mypage" :class="['header-link', userClass]">
      {{ displayName || t("header.login") }}
    </RouterLink>

    <button type="button" :class="['header-link', logoutClass]" @click="handleLogout">
      {{ t("header.logout") }}
    </button>
  </template>

  <template v-else>
    <RouterLink to="/login" :class="['header-link', loginClass]">
      {{ t("header.login") }}
    </RouterLink>
    <RouterLink to="/signup" :class="['header-link', signupClass]">
      {{ t("header.signup") }}
    </RouterLink>
  </template>
</template>

<style scoped>
a {
  color: inherit;
  text-decoration: none;
}

/* 기본: 모바일 공통 스타일 */
.header-link {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;

  /* 모바일 */
  padding: 0.45rem 1.2rem;
  border-radius: 999px;
  background: #1b2738;
  color: #f3e3c4;
  border: 1px solid #1b2738;
}

/* 버튼 */
button.header-link {
  border: 1px solid #1b2738;
  background: #1b2738;
  color: #f3e3c4;
  cursor: pointer;
}

/* 데스크탑 */
@media (min-width: 768px) {
  .header-link,
  button.header-link {
    padding: 0; /* 알약 패딩 제거 */
    border-radius: 0; /* 둥근 모서리 제거 */
    border: none; /* 테두리 제거 */
    background: transparent; /* 배경 제거 */
    /* color: #1b2738;          헤더 텍스트 색 - 제거하여 외부 클래스 적용 가능하게 함 */
  }
}
</style>
