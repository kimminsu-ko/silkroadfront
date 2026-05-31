<script setup>
import { ref, watch } from "vue";
import { motion } from "motion-v";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "@/components/Header/LanguageSwitcher.vue";
import { useRoute } from "vue-router";
import HeaderAuthArea from "@/components/Header/HeaderAuthArea.vue";

const { t } = useI18n();
const isOpen = ref(false);

const route = useRoute();

/*라우터가 바뀌면 드롭다운 끄기*/
watch(
  () => route.fullPath,
  () => {
    isOpen.value = false;
  }
);

const navVariants = {
  open: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.25 },
  },
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18 },
  },
};

const listVariants = {
  open: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  closed: {
    transition: {
      staggerDirection: -1,
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -20 },
};

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <header class="sr-header-mobile">
    <!-- 상단 영역 -->
    <div class="sr-header-bar">
      <RouterLink to="/" class="sr-logo">silkRoad</RouterLink>

      <button
        class="sr-menu-btn"
        :class="{ 'is-open': isOpen }"
        @click="toggle"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <!-- motion-v 네비게이션 -->
    <motion.nav
      class="header-nav"
      :initial="'closed'"
      :animate="isOpen ? 'open' : 'closed'"
      :variants="navVariants"
    >
      <motion.ul class="header-nav-list" :variants="listVariants">
        <!-- 로그인/회원가입 묶음 -->
        <motion.li class="header-auth" :variants="itemVariants">
          <HeaderAuthArea
            login-class="header-link primary"
            signup-class="header-link outline"
            user-class="header-link primary"
            logout-class="header-link outline"
            @logged-out="isOpen = false"
          />
          <LanguageSwitcher class="header-ln" />
        </motion.li>

        <!-- 나머지 메뉴들 -->
        <motion.li class="header-nav-item" :variants="itemVariants">
          <RouterLink to="/ai-route" class="header-link a">{{
            t("header.aiRoute")
          }}</RouterLink>
        </motion.li>
        <motion.li class="header-nav-item" :variants="itemVariants">
          <RouterLink to="/plan-creator" class="header-link a">{{
            t("header.planCreator")
          }}</RouterLink>
        </motion.li>
        <motion.li class="header-nav-item" :variants="itemVariants">
          <RouterLink to="/tourist-search" class="header-link a">{{
            t("header.touristSearch")
          }}</RouterLink>
        </motion.li>
        <motion.li class="header-nav-item" :variants="itemVariants">
          <RouterLink to="/board" class="header-link a">{{
            t("header.board")
          }}</RouterLink>
        </motion.li>
        <motion.li class="header-nav-item" :variants="itemVariants">
          <RouterLink to="/mypage" class="header-link a">{{
            t("header.mypage")
          }}</RouterLink>
        </motion.li>
      </motion.ul>
    </motion.nav>
  </header>
</template>

<style scoped>
/* 모바일 전용 헤더 */
.sr-header-mobile {
  position: sticky;
  top: 0;
  z-index: 40;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.sr-header-bar {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  align-items: center;
}

.sr-logo {
  font-size: 1.2rem;
  font-weight: 700;
  text-decoration: none;
  color: #b8864b;
}
.sr-logo:link,
.sr-logo:visited,
.sr-logo:hover,
.sr-logo:active {
  text-decoration: none;
  color: #b8864b;
}

/* 햄버거 버튼 */
.sr-menu-btn {
  width: 28px;
  height: 24px;
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sr-menu-btn span {
  height: 2px;
  background: #1b2738;
  border-radius: 999px;
  transition: 0.2s;
  transform-origin: center;
}

.sr-menu-btn.is-open span:nth-child(1) {
  transform: translateY(10px) rotate(45deg);
}
.sr-menu-btn.is-open span:nth-child(2) {
  opacity: 0;
}
.sr-menu-btn.is-open span:nth-child(3) {
  transform: translateY(-10px) rotate(-45deg);
}

/* 드롭다운 */
.header-nav {
  overflow: hidden;
  background-color: #f3e3c4;
}

.header-nav-list {
  padding: 0.75rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
}

/* 로그인/회원가입 */
.header-auth {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.header-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  color: #1b2738;
  text-decoration: none;
  font-size: 15px;
}

.header-link.primary {
  flex: 1;
  text-align: center;
  padding: 0.45rem;
  background: #1b2738;
  color: #f3e3c4;
  border-radius: 999px;
}

.header-link.outline {
  flex: 1;
  text-align: center;
  padding: 0.45rem;
  border-radius: 999px;
  border: 1px solid #1b2738;
}
.header-nav-item,
.header-auth {
  list-style: none;
}
.header-nav-item {
  position: relative;
  padding-top: 14px;
  margin-top: 12px;
}
.header-nav-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 48px;
  height: 2px;
  transform: translateX(-50%);
  background-color: rgba(27, 39, 56, 0.85);
  border-radius: 999px;
}
.header-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0; /* 위아래 여백 */
  color: #1b2738;
  text-decoration: none;
  font-size: 15px;
}
.header-ln {
  display: flex;
  align-items: center;
  justify-content: center;
}
.a {
  font-size: 1.5rem;
}

/* 태블릿/데스크탑에서는 숨김 */
@media (min-width: 768px) {
  .sr-header-mobile {
    display: none;
  }
}
</style>
