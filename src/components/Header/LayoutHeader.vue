<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import HeaderAuthArea from "@/components/Header/HeaderAuthArea.vue";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isHome = computed(() => route.path === "/");
const isScrolled = ref(false);

const handleScroll = () => {
  if (!isHome.value) return;
  // Hero section is 100vh. When scroll passes ~90vh, we consider it "scrolled"
  // Adjust threshold as needed.
  isScrolled.value = window.scrollY > window.innerHeight - 80;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Initial check
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const isPlanActive = computed(() => {
  return ["/plan-creator", "/my-plans", "/plans"].some((path) => route.path.startsWith(path));
});

const handleProtectedNavigation = (navigate) => {
  if (!authStore.isLoggedIn) {
    alert(t("header.loginRequired"));
    router.push("/login");
    return;
  }
  navigate();
};
</script>

<template>
  <header
    class="header"
    :class="{
      'header-home': isHome,
      'header-scrolled': isHome && isScrolled,
    }"
  >
    <!-- 왼쪽 -->
    <div class="header-left">
      <RouterLink to="/" class="logo">
        <img src="../../assets/logo.png" alt="logo" class="logo-img" />
        <span class="logo-text">{{ t("brand.name") }}</span>
      </RouterLink>
    </div>
    <!-- 중앙 -->
    <nav class="header-nav">
      <div class="nav-item dropdown" :class="{ 'active-dropdown': isPlanActive }">
        <span class="nav-link dropdown-trigger"> {{ t("header.plan") }}</span>
        <div class="dropdown-menu">
          <RouterLink to="/plan-creator" custom v-slot="{ navigate, href, isActive }">
            <a
              :href="href"
              @click.prevent="handleProtectedNavigation(navigate)"
              class="dropdown-item"
              :class="{ 'router-link-active': isActive }"
            >
              {{ t("header.newPlan") }}
            </a>
          </RouterLink>
          <RouterLink to="/my-plans" custom v-slot="{ navigate, href, isActive }">
            <a
              :href="href"
              @click.prevent="handleProtectedNavigation(navigate)"
              class="dropdown-item"
              :class="{ 'router-link-active': isActive }"
            >
              {{ t("header.myPlans") }}
            </a>
          </RouterLink>
        </div>
      </div>

      <RouterLink to="/chat-rooms" class="nav-link"> {{ t("header.aiAssistant") }}</RouterLink>
      <RouterLink to="/tourist-search" custom v-slot="{ navigate, href, isActive }">
        <a
          :href="href"
          @click.prevent="handleProtectedNavigation(navigate)"
          class="nav-link"
          :class="{ 'router-link-active': isActive }"
        >
          {{ t("header.touristSearch") }}
        </a>
      </RouterLink>
      <RouterLink to="/board" class="nav-link">{{ t("header.board") }}</RouterLink>
      <RouterLink to="/mypage" class="nav-link">{{ t("header.mypage") }}</RouterLink>
    </nav>
    <!-- 오른쪽 -->
    <nav>
      <div class="header-right">
        <LanguageSwitcher />
        <HeaderAuthArea
          :login-class="isHome && !isScrolled ? 'text-btn-light' : 'text-btn'"
          :signup-class="isHome && !isScrolled ? 'text-btn-light' : 'text-btn'"
          :user-class="isHome && !isScrolled ? 'text-btn-light' : 'text-btn'"
          :logout-class="isHome && !isScrolled ? 'text-btn-light' : 'text-btn'"
        />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header {
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

/* Home Page Specific Styles */
.header-home {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: transparent;
  border-bottom: none;
}

/* Initial State on Home (Over Dark Hero) */
.header-home .logo-text {
  color: #f8f3c9; /* Light color matching stars */
}

.header-home .nav-link {
  color: rgba(255, 255, 255, 0.8);
}

.header-home .nav-link:hover,
.header-home .nav-link.router-link-active {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Scrolled State on Home (Over White Intro) */
.header-home.header-scrolled {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-home.header-scrolled .logo-text {
  color: #3b2f22; /* Dark Brown */
}

.header-home.header-scrolled .nav-link {
  color: #3b2f22;
}

.header-home.header-scrolled .nav-link:hover {
  color: #000000;
}

/* Auth Buttons in Scrolled State */
.header-home.header-scrolled :deep(.text-btn) {
  color: #3b2f22;
}

.header-home.header-scrolled :deep(.text-btn:hover) {
  color: #000000;
}

/* Default Styles (Non-Home or Scrolled) */
.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-img {
  width: 28px;
  height: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #b8864b;
}

.header-nav {
  display: flex;
  gap: 24px;
  font-size: 15px;
}

.nav-link {
  text-decoration: none;
  color: #70563a;
  font-weight: 500;
  transition: color 0.2s, font-weight 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active,
.active-dropdown .dropdown-trigger {
  color: #b8864b;
  font-weight: 700;
}

/* Dropdown Styles */
.nav-item.dropdown {
  position: relative;
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 160px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 100;
}

.nav-item.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  top: calc(100% + 5px);
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.dropdown-item:hover {
  background-color: #f9f9f9;
  color: #b8864b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.text-btn) {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #70563a;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s, font-weight 0.2s;
}

:deep(.text-btn:hover) {
  color: #b8864b;
  font-weight: 700;
}

:deep(.text-btn-light) {
  border: none;
  background: transparent;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

:deep(.text-btn-light:hover) {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.primary-btn {
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 999px;
  background: #c79a63;
  color: #fff;
}
</style>
