<script setup>
import { ref, watch, onBeforeUnmount, onMounted, defineExpose, computed } from "vue";
import PlanSelectionModal from "@/components/Board/PlanSelectionModal.vue";
import PlanViewer from "@/components/Plan/PlanViewer.vue";
import { useI18n } from "vue-i18n";

const { t, te } = useI18n();

const props = defineProps({
  mode: {
    type: String,
    required: true,
  },
  submitLabel: {
    type: String,
    required: true,
  },
  initialTitle: {
    type: String,
    default: "",
  },
  initialContent: {
    type: String,
    default: "",
  },
  initialImages: {
    type: Array,
    default: () => [],
  },
  initialPlanId: {
    type: [Number, String],
    default: null,
  },
  showPlanSelector: {
    type: Boolean,
    default: false,
  },
  onSubmit: {
    type: Function,
    required: true,
  },
});

const submitLabelText = computed(() => (te(props.submitLabel) ? t(props.submitLabel) : props.submitLabel));

const title = ref(props.initialTitle);
const content = ref(props.initialContent);
const selectedPlan = ref(null);
const isPlanModalVisible = ref(false);
const fileInputRef = ref(null);
const selectedFiles = ref([]);
let dragIndex = null;

// 초기 planId가 있으면 설정 (상세 정보는 PlanViewer가 로드하거나 별도 로직 필요)
// 여기서는 단순히 ID만 가지고 있다고 가정하고, PlanViewer에 넘김
if (props.initialPlanId) {
  selectedPlan.value = { planIndex: props.initialPlanId };
}

const openPlanModal = () => {
  isPlanModalVisible.value = true;
};

const onPlanSelected = (plan) => {
  selectedPlan.value = plan;
};

//이미지 상태
const imageItems = ref(
  props.initialImages.map((img) => ({
    type: "existing",
    imageIndex: img.imageIndex,
    url: img.imageUrl,
  }))
);

//이미지 추가
const selectedFileText = computed(() => {
  if (!selectedFiles.value.length) {
    return t("postForm.noFileSelected");
  }
  return selectedFiles.value.map((f) => f.name).join(", ");
});

//커스텀 인풋상자
const openFileDialog = () => {
  fileInputRef.value?.click();
};

const onFileChange = (e) => {
  const files = Array.from(e.target.files || []);
  files.forEach((file) => {
    imageItems.value.push({
      type: "new",
      file,
      url: URL.createObjectURL(file),
    });
  });
  e.target.value = ""; // 같은 파일 재선택 가능하게
};

/* 파일 텍스트 */
const selectedFilesText = computed(() => {
  const newFiles = imageItems.value.filter((i) => i.type === "new");
  if (!newFiles.length) return "";
  const first = newFiles[0].file.name;
  return newFiles.length > 1 ? `${first} + ${newFiles.length - 1}` : first;
});

//이미지 제거
const removeImageAt = (index) => {
  imageItems.value.splice(index, 1);
};

//변경감지
const isDirty = ref(false);
watch(
  [title, content, imageItems, selectedPlan],
  () => {
    isDirty.value = true;
  },
  { deep: true }
);

//제출
const submit = () => {
  //추가된 이미지
  const imagesToAdd = imageItems.value.filter((i) => i.type === "new").map((i) => i.file);
  //삭제된 이미지
  const imageIndexesToDelete = props.initialImages
    .filter((img) => !imageItems.value.some((i) => i.type === "existing" && i.imageIndex === img.imageIndex))
    .map((img) => img.imageIndex);

  props.onSubmit({
    title: title.value.trim(),
    content: content.value.trim(),
    imagesToAdd,
    imageIndexesToDelete,
    planId: selectedPlan.value?.planIndex,
  });

  isDirty.value = false;
};

//드래그 정렬
const onDragStart = (index) => {
  dragIndex = index;
};

const onDrop = (dropIndex) => {
  if (dragIndex == null || dragIndex === dropIndex) return;
  const moved = imageItems.value.splice(dragIndex, 1)[0];
  imageItems.value.splice(dropIndex, 0, moved);
  dragIndex = null;
};

//이탈방지
const beforeUnload = (e) => {
  if (!isDirty.value) return;
  e.preventDefault();
  e.returnValue = "";
};

onMounted(() => {
  window.addEventListener("beforeunload", beforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeUnload);
});

//부모에서 접근 가능하도록 노출
defineExpose({
  isDirty,
});
</script>

<template>
  <section class="post-card">
    <header class="post-header">
      <h1>{{ submitLabelText }}</h1>
    </header>

    <div class="form">
      <!-- 여행 계획 선택 (옵션) -->
      <div v-if="showPlanSelector" class="field">
        <label>여행 계획</label>
        <div v-if="!selectedPlan" class="plan-selector-placeholder">
          <p>후기에 포함할 여행 계획을 선택해주세요.</p>
          <button class="select-plan-btn" @click="openPlanModal">여행 계획 불러오기</button>
        </div>
        <div v-else class="selected-plan-preview">
          <div class="plan-preview-header">
            <span class="plan-label">선택된 여행 계획</span>
            <button class="change-plan-btn" @click="openPlanModal">변경</button>
          </div>
          <div class="plan-viewer-wrapper">
            <PlanViewer :planId="selectedPlan.planIndex" :readOnly="true" style="height: 800px" />
          </div>
        </div>
      </div>

      <!-- 제목 -->
      <div class="field">
        <label>{{ $t("postForm.titleLabel") }}</label>
        <input v-model="title" class="input" :placeholder="$t('postForm.titlePlaceholder')" maxlength="60" />
      </div>

      <!-- 내용 -->
      <div class="field">
        <label>{{ $t("postForm.contentLabel") }}</label>
        <textarea v-model="content" class="textarea" rows="10" :placeholder="$t('postForm.contentPlaceholder')" />
      </div>

      <!-- 이미지 목록 (기존 + 신규 통합) -->
      <div v-if="imageItems.length" class="field">
        <label>{{ $t("postForm.imagesLabel") }}</label>

        <div class="image-list">
          <div
            v-for="(img, index) in imageItems"
            :key="index"
            class="image-item"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover.prevent
            @drop="onDrop(index)"
          >
            <img :src="img.url" />

            <!-- 삭제 버튼 -->
            <button type="button" class="image-remove" @click.stop="removeImageAt(index)">✕</button>

            <!-- 기존 / 신규 표시 (선택) -->
            <span v-if="img.type === 'existing'" class="badge">
              {{ $t("postForm.badgeExisting") }}
            </span>
            <span v-else class="badge new">
              {{ $t("postForm.badgeNew") }}
            </span>
          </div>
        </div>
      </div>

      <!-- 이미지 추가 -->
      <div v-if="mode !== 'edit-notice'" class="field">
        <label>{{ $t("postForm.addImagesLabel") }}</label>

        <!-- 숨겨진 실제 input -->
        <input
          ref="fileInputRef"
          class="file-input-hidden"
          type="file"
          multiple
          accept="image/*"
          @change="onFileChange"
        />

        <!-- 커스텀 UI -->
        <div class="file-row">
          <button type="button" class="file-btn" @click="openFileDialog">
            {{ $t("postForm.selectFile") }}
          </button>

          <span class="file-hint" :class="{ empty: !selectedFilesText }">
            {{ selectedFilesText || $t("postForm.noFileSelected") }}
          </span>
        </div>

        <p class="file-help">
          {{ $t("postForm.fileHelp") }}
        </p>
      </div>

      <!-- 제출 -->
      <button class="submit-btn" @click="submit">
        {{ submitLabelText }}
      </button>
    </div>

    <PlanSelectionModal :isVisible="isPlanModalVisible" @close="isPlanModalVisible = false" @select="onPlanSelected" />
  </section>
</template>

<style scoped>
.post-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 18px;
  padding: 22px 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(74, 58, 42, 0.12);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.post-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #2f241a;
  letter-spacing: -0.2px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(47, 36, 26, 0.85);
}

.input,
.textarea {
  width: 100%;
  border: 1px solid rgba(74, 58, 42, 0.22);
  border-radius: 12px;
  padding: 12px 12px;
  font-size: 14px;
  outline: none;
  background: rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
}

.textarea {
  resize: vertical;
  min-height: 220px;
  line-height: 1.6;
}

.input:focus,
.textarea:focus {
  border-color: rgba(74, 58, 42, 0.45);
  box-shadow: 0 0 0 4px rgba(231, 214, 182, 0.65);
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.image-item {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(74, 58, 42, 0.18);
  background: #fff;
  cursor: grab;
}

.image-item:active {
  cursor: grabbing;
}

.image-item img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

.image-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 999px;
  width: 26px;
  height: 26px;
  cursor: pointer;
}

.badge {
  position: absolute;
  left: 8px;
  bottom: 8px;
  background: rgba(59, 47, 34, 0.92);
  color: #fff;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
}

.badge.new {
  background: rgba(198, 72, 59, 0.92);
}

.submit-btn {
  margin-top: 6px;
  align-self: flex-end;
  border: 1px solid rgba(74, 58, 42, 0.25);
  background: #4a3a2a;
  color: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}

.submit-btn:hover {
  filter: brightness(1.05);
}

@media (max-width: 520px) {
  .post-card {
    padding: 18px 14px;
  }
  .image-item img {
    height: 96px;
  }
}

.file-input-hidden {
  display: none;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-btn {
  flex: 0 0 auto;
  border: 1px solid rgba(74, 58, 42, 0.25);
  background: rgba(231, 214, 182, 0.45);
  color: #3b2f22;
  padding: 9px 12px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: filter 0.15s, transform 0.05s;
}

.file-btn:hover {
  filter: brightness(1.03);
}

.file-btn:active {
  transform: translateY(1px);
}

.file-hint {
  flex: 1 1 auto;
  min-width: 0;
  border: 1px dashed rgba(74, 58, 42, 0.22);
  background: rgba(255, 255, 255, 0.75);
  color: #3b2f22;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-hint.empty {
  color: rgba(47, 36, 26, 0.45);
}

.file-help {
  margin: 0;
  font-size: 12px;
  color: rgba(47, 36, 26, 0.55);
}

.image-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
}

.badge {
  position: absolute;
  left: 6px;
  bottom: 6px;
  background: #3b2f22;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
}

.plan-selector-placeholder {
  border: 2px dashed rgba(74, 58, 42, 0.2);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
}

.plan-selector-placeholder p {
  margin: 0 0 16px 0;
  color: #666;
}

.select-plan-btn {
  padding: 10px 20px;
  background-color: #3b2f22;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.selected-plan-preview {
  border: 1px solid rgba(74, 58, 42, 0.12);
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.plan-preview-header {
  padding: 12px 16px;
  background: #f9f0dd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(74, 58, 42, 0.1);
}

.plan-label {
  font-weight: 700;
  color: #3b2f22;
}

.change-plan-btn {
  padding: 4px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.plan-viewer-wrapper {
  height: 800px;
  overflow: hidden;
}
</style>
