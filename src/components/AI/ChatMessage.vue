<template>
  <div class="message-row" :class="msg.role === 'ai' ? 'ai-row' : 'user-row'">
    <!-- 메시지 버블 -->
    <div class="bubble" :class="msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'">
      <!-- 타임라인 뷰 (AI JSON 응답) -->
      <div v-if="msg.type === 'timeline'" class="timeline-view">
        <div class="timeline-line"></div>
        <div v-for="(item, idx) in msg.content" :key="idx" class="timeline-item">
          <div class="time-col">
            <span class="time-text">{{ item.time }}</span>
            <div class="time-dot"></div>
          </div>
          <div class="content-col">
            <div class="timeline-box">
              <div class="box-header">
                <h4 class="place-name">{{ item.place }}</h4>
                <p class="place-desc">{{ item.desc }}</p>
                <div class="tags">
                  <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="box-footer">
                <div class="detail-text" v-if="item.expanded">
                  {{ item.detail }}
                  <button class="toggle-btn" @click="item.expanded = false">
                    {{ t("aiRoutePage.collapse") }}
                  </button>
                </div>
                <button v-else class="toggle-btn" @click="item.expanded = true">
                  {{ t("aiRoutePage.viewDetail") }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="action-buttons">
          <button class="action-btn add-all-btn" @click="$emit('openPlanModal', msg)">
            {{ t("aiRoutePage.addAllToPlan") }}
          </button>
        </div>
      </div>

      <!-- 텍스트 뷰 (사용자 또는 일반 AI 응답) -->
      <div v-else class="message-content">
        <template v-for="(segment, idx) in parsedContent" :key="idx">
          <!-- 텍스트 세그먼트 -->
          <div
            v-if="segment.type === 'text'"
            class="text-segment markdown-body"
            v-html="renderMarkdown(segment.value)"
          ></div>
        </template>

        <!-- 일정 생성 버튼 (장소가 포함된 경우) -->
        <div v-if="msg.role === 'ai' && hasPlaces" class="plan-action-area">
          <button class="action-btn add-all-btn" @click="$emit('openPlanModal', msg)">
            {{ t("aiRoutePage.addToMyPlan") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { marked } from "marked";

const { t } = useI18n();

const props = defineProps({
  msg: {
    type: Object,
    required: true,
  },
});

defineEmits(["openPlanModal"]);

const hasPlaces = computed(() => {
  return props.msg.recommendedPlaces && props.msg.recommendedPlaces.length > 0;
});

const parsedContent = computed(() => {
  return parseMessageContent(props.msg.content, props.msg.recommendedPlaces);
});

// Helper functions moved from parent or duplicated if simple
const renderMarkdown = (text) => {
  if (!text) return "";
  return marked(text);
};

const parseMessageContent = (content, places) => {
  if (!content) return [];
  const segments = [];
  const regex = /\[\[PLACE_ID:\s*(\d+)\]\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: content.substring(lastIndex, match.index),
      });
    }
    // 태그 부분은 현재 텍스트에서 제외 (타임라인 뷰가 있으므로)
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.substring(lastIndex) });
  }

  return segments;
};
</script>

<style scoped>
/* Styles from AIRoutePage.vue */
.message-row {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
}

.ai-row {
  justify-content: flex-start;
}

.user-row {
  justify-content: flex-end;
}

.bubble {
  max-width: 85%;
  padding: 16px 20px;
  border-radius: 20px;
  font-size: 0.95rem;
  line-height: 1.6;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ai-bubble {
  background-color: white;
  border-top-left-radius: 4px;
  color: #333;
  border: 1px solid #e5e7eb;
}

.user-bubble {
  background-color: #4a3a2a;
  color: white;
  border-top-right-radius: 4px;
}

/* Timeline View */
.timeline-view {
  position: relative;
  padding-left: 10px;
}

.timeline-line {
  position: absolute;
  left: 19px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background-color: #e5e7eb;
}

.timeline-item {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.time-col {
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 20px;
  position: relative;
}

.time-text {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
  margin-top: 2px;
}

.time-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4a3a2a;
  position: absolute;
  right: -25px;
  top: 6px;
  z-index: 1;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #4a3a2a;
}

.content-col {
  flex: 1;
}

.timeline-box {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.box-header {
  margin-bottom: 12px;
}

.place-name {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111;
}

.place-desc {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 0.75rem;
  color: #4a3a2a;
  background-color: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
}

.box-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.detail-text {
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 8px;
  white-space: pre-wrap;
}

.toggle-btn {
  background: none;
  border: none;
  color: #4a3a2a;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.toggle-btn:hover {
  text-decoration: underline;
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.add-all-btn {
  background-color: #4a3a2a;
  color: white;
}

.add-all-btn:hover {
  background-color: #362b1f;
  transform: translateY(-1px);
}

.plan-action-area {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  text-align: right;
}

/* Markdown Styles */
.markdown-body {
  font-size: 0.95rem;
  line-height: 1.6;
}

.markdown-body :deep(p) {
  margin-bottom: 0.5em;
}

.markdown-body :deep(strong) {
  font-weight: 700;
  color: #111;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 0.5em;
}
</style>
