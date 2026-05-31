<template>
  <svg
      :width="size"
      :height="size"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="icon"
  >
    <path
        d="M14.5 2.5C14.8978 2.10217 15.4374 1.87868 16 1.87868C16.5626 1.87868 17.1022 2.10217 17.5 2.5C17.8978 2.89782 18.1213 3.43739 18.1213 4C18.1213 4.56261 17.8978 5.10217 17.5 5.5L6.5 16.5L2 18L3.5 13.5L14.5 2.5Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 20,
  },
});
</script>

<style scoped>
.icon {
  display: block;
}
</style>