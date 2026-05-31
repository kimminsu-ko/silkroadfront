<script setup>
import {ref, computed, onBeforeUnmount, onMounted} from 'vue';
import { useI18n } from 'vue-i18n';
import {setLocale} from "@/i18n.js";

const open = ref(false);
const { locale, t } = useI18n();

const options = computed(() => [
  { value: 'ko', label: t('header.langNames.ko') },
  { value: 'en', label: t('header.langNames.en') },
  { value: 'ja', label: t('header.langNames.ja') },
]);

function toggle() {
  open.value = !open.value;
}

function changeLocale(lang) {
  setLocale(lang);
  //달콤한 유혹
  //window.location.reload();
  open.value = false;
}

let handleClickOutside;

onMounted(() => {
  handleClickOutside = () => {
    open.value = false;
  };
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<!-- src/components/LanguageSwitcher.vue -->
<template>
  <div class="lang-wrapper" @click.stop="toggle">
    <button class="lang-btn">
      <!-- 지구본 아이콘 대신 텍스트 / 나중에 아이콘 넣어도 됨 -->
      🌐
    </button>

    <div v-if="open" class="lang-dropdown">
      <button
          v-for="opt in options"
          :key="opt.value"
          class="lang-item"
          :class="{ active: locale === opt.value }"
          @click.stop="changeLocale(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>



<style scoped>
.lang-wrapper {
  position: relative;
}

.lang-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}

.lang-dropdown {
  position: absolute;
  right: 0;
  margin-top: 8px;
  padding: 8px 0;
  background: #f8ebd3;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  min-width: 120px;
  z-index: 10;
}

.lang-item {
  width: 100%;
  padding: 6px 14px;
  font-size: 13px;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #70563a;
}

.lang-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.lang-item.active {
  font-weight: 600;
  color: #b8864b;
}
*{
  z-index: 999;
}
</style>