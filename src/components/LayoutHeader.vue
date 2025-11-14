<script setup>
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from './LanguageSwitcher.vue';
import {RouterLink} from 'vue-router';

const {t} = useI18n();
</script>

<template>

<header class="header">
  <!-- 왼쪽 -->
  <div class="header-left">
    <div class="logo">
      <img src="../assets/logo.png" alt="logo" class="logo-img" />
      <span class="logo-text">{{t('brand.name')}}</span>
    </div>
  </div>
  <!-- 중앙 -->
  <nav class="header-nav">
    <RouterLink to="/routes" class="nav-link">{{t('header.routes')}}</RouterLink>
    <RouterLink to="/board"  class="nav-link">{{t('header.board')}}</RouterLink>
    <RouterLink to="/mypage" class="nav-link">{{t('header.mypage')}}</RouterLink>
  </nav>
  <!-- 오른쪽 -->
  <nav>
    <div class="header-right">
      <LanguageSwitcher />
      <button class="text-btn">
        {{t('header.login')}}
      </button>
      <button class="primary-btn">
        {{t('header.signup')}}
      </button>
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
  background: #f3e3c4;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
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
}

.nav-link:hover {
  color: #b8864b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-btn {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #70563a;
  cursor: pointer;
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