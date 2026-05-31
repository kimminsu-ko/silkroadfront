<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import icon from "@/assets/Profile/userIcon.png";

const DEFAULT_PROFILE_URL = icon;
const { t } = useI18n();
const emit = defineEmits(["update-field", "change-photo"]);

const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
});

const profileImgUrl = computed(() => {
  const url = props.profile.profileUrl;
  if (url === "<null>" || !url) return DEFAULT_PROFILE_URL;
  return url;
});

const editNickname = () => {
  const current = props.profile.userNickname;
  const next = prompt(t("profile.normal.prompts.nickname"), current);
  if (!next || next === current) return;
  emit("update-field", { userNickname: next });
};

const editPhone = () => {
  const current = props.profile.phone;
  const next = prompt(t("profile.normal.prompts.phone"), current);
  if (!next || next === current) return;
  emit("update-field", { phone: next });
};

const editBirth = () => {
  const current = props.profile.birth;
  const next = prompt(t("profile.normal.prompts.birth"), current);
  if (!next || next === current) return;
  emit("update-field", { birth: next });
};

// 파일 선택 후 부모로 전달
const onFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  emit("change-photo", file);
  e.target.value = "";
};
</script>

<template>
  <div class="profile-container">
    <!-- 왼쪽: 사진 영역 -->
    <div class="profile-left">
      <div class="profile-img-box">
        <img :src="profileImgUrl" alt="profile" class="profile-img" />

        <!-- 숨겨진 인풋 -->
        <input id="normal-profile-file" type="file" accept="image/*" class="file-input" @change="onFileChange" />

        <!-- label 클릭만으로 파일 선택창 뜸 -->
        <label class="edit-photo-btn" for="normal-profile-file">
          {{ t("profile.normal.editPhoto") }}
        </label>
      </div>
    </div>

    <!-- 오른쪽: 정보 영역 -->
    <div class="profile-right">
      <div class="field">
        <span class="label">{{ t("profile.normal.id") }}</span>
        <span class="value">{{ profile.userId }}</span>
      </div>

      <div class="field">
        <span class="label">{{ t("profile.normal.nickname") }}</span>
        <span class="value">{{ profile.userNickname }}</span>
        <button class="edit-btn" @click="editNickname">{{ t("profile.normal.edit") }}</button>
      </div>

      <div class="field">
        <span class="label">{{ t("profile.normal.email") }}</span>
        <span class="value">{{ profile.userEmail }}</span>
      </div>

      <div class="field">
        <span class="label">{{ t("profile.normal.phone") }}</span>
        <span class="value">{{ profile.phone }}</span>
        <button class="edit-btn" @click="editPhone">{{ t("profile.normal.edit") }}</button>
      </div>

      <div class="field">
        <span class="label">{{ t("profile.normal.birth") }}</span>
        <span class="value">{{ profile.birth }}</span>
        <button class="edit-btn" @click="editBirth">{{ t("profile.normal.edit") }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 40px 24px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(74, 58, 42, 0.05); /* Warm shadow */
  max-width: 600px;
  margin: 0 auto;
}

/* 상단 사진 영역 */
.profile-left {
  display: flex;
  justify-content: center;
}

.profile-img-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-img {
  width: 120px;
  height: 120px;
  border-radius: 50%; /* Circle */
  object-fit: cover;
  border: 4px solid #fdfcf8; /* Ring effect */
  background: #fdfcf8;
  box-shadow: 0 0 0 1px rgba(74, 58, 42, 0.1);
}

.file-input {
  display: none;
}

.edit-photo-btn {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #c49a6c; /* Warm Gold/Tan */
  background: transparent;
  cursor: pointer;
}

/* 하단 정보 리스트 */
.profile-right {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f4f0e6;
}

.field:last-child {
  border-bottom: none;
}

.label {
  font-size: 15px;
  font-weight: 500;
  color: #9c8c74; /* Muted warm grey */
}

.value {
  font-size: 16px;
  font-weight: 600;
  color: #3b2f22; /* Dark Brown */
  text-align: right;
  flex: 1;
  margin: 0 16px;
}

.edit-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: #f4f0e6;
  color: #5d4d3a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #e6dfcf;
}
</style>
