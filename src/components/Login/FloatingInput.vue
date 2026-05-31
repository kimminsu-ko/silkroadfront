<script setup>
import { ref, computed, useSlots } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  id: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue','blur','focus','input'])

const focused = ref(false)
const slots = useSlots()

// id
const inputId = computed(() => props.id || undefined)

// 기본 인풋/커스텀 인풋 구분
const hasCustomInput = computed(() => !!slots.input)

// 라벨 올라갈 조건
const isActive = computed(() => {
  return focused.value || !!props.modelValue
})

//input 작동
const onInput = e => {
  const value = e?.target ? e.target.value : e
  emit('update:modelValue', value)
  emit('input', e)
}

const handleFocus = e => {
  focused.value = true
  emit('focus', e)
}

const handleBlur = e => {
  focused.value = false
  emit('blur', e)
}

const clear = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="floating-field">
    <!-- 기본 인풋 -->
    <input
        v-if="!hasCustomInput"
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        class="floating-input"
        @input="onInput"
        @focus="handleFocus"
        @blur="handleBlur"
    />

    <!-- 커스텀 인풋 (예: Cleave) -->
    <div
        v-else
        class="floating-input custom-input-wrapper"
        @focusin="handleFocus"
        @focusout="handleBlur"
    >
      <slot
          name="input"
          :id="inputId"
          :model-value="modelValue"
          :on-input="onInput"
      />
    </div>

    <!-- 라벨 -->
    <label
        v-if="label"
        :for="inputId"
        class="floating-label"
        :class="{ active: isActive }"
    >
      {{ label }}
    </label>

    <!-- X 버튼 -->
    <button
        v-if="modelValue"
        type="button"
        class="clear-button"
        @click="clear"
    >
      x
    </button>
  </div>
</template>

<style scoped>
.floating-field {
  position: relative;
  box-sizing: border-box;
  width: 100%;
}

.floating-input {
  width: 100%;
  box-sizing: border-box;
  padding: 18px 44px 10px 16px;
  border-radius: 10px;
  border: 1px solid #f3e3c4;
  font-size: 15px;
  outline: none;
  background-color: #f8fff8;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.floating-input:focus {
  border-color: #f0d49c;
  background-color: #ffffff;
}

/* Cleave용 래퍼*/
.custom-input-wrapper {
  display: flex;
  align-items: center;
  padding: 4px 44px 2px 12px;
}

/* 라벨 */
.floating-label {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #8f9a96;
  pointer-events: none;
  transition:
      top 0.16s ease,
      font-size 0.16s ease,
      transform 0.16s ease,
      color 0.16s ease;
}

.floating-label.active {
  top: 6px;
  transform: translateY(0);
  font-size: 11px;
  color: #8f9a96;
}

/* X 버튼 */
.clear-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background-color: #d1d8dd;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
</style>
