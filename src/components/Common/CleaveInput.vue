<script setup>
import { computed } from 'vue'
import VueCleave from 'vue-cleave-component'
import FloatingInput from '@/components/Login/FloatingInput.vue'

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  }
})

const emit = defineEmits(['update:modelValue'])

const cleaveOptions = computed(() => {
  if (props.type === 'phone') {
    return { phone: true, phoneRegionCode: 'KR' }
  }
  if (props.type === 'birth') {
    return { blocks: [4,2,2], numericOnly: true }
  }
  return null
})

const updateValue = event => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <!-- 일반 입력 -->
  <FloatingInput
      v-if="!cleaveOptions"
      :label="props.label"
      :placeholder="props.placeholder"
      :model-value="props.modelValue"
      @update:model-value="emit('update:modelValue', $event)"
  />

  <!-- Cleave 적용되는 입력 -->
  <FloatingInput v-else :label="props.label" :placeholder="props.placeholder">
    <VueCleave
        :model-value="props.modelValue"
        :options="cleaveOptions"
        @input="updateValue"
        class="inner-input"
    />
  </FloatingInput>
</template>

<style scoped>
.inner-input {
  width: 100%;
  height: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}
</style>
