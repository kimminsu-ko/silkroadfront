<script setup>
import {computed} from "vue";

const props = defineProps({
  page : {type: Number, required: true},
  totalPages: {type: Number, required: true},
});

const emit = defineEmits(['change']);

const pageNumbers = computed(()=>{
  const maxButtons = 7;
  const tp = props.totalPages;
  const cp = props.page;

  if(tp <= maxButtons)
    return Array.from({length:tp}, (_, i)=> i+1);

  const half = Math.floor(maxButtons / 2);
  let start = cp - half;
  let end = cp + half;

  if(start<1){
    start = 1;
    end = maxButtons;
  }
  if(end > tp){
    end = tp;
    start = tp - maxButtons +1;
  }

  return Array.from(
      {
    length:end-start+1
    },
    (_, i) => start +i
  );
});

const go = (p)=>{
  if(p<1 || p>props.totalPages)return;
  emit('change',p);
};
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination">
    <button class="page-btn" :disabled="page === 1" @click="go(page - 1)">이전</button>

    <button
        v-for="p in pageNumbers"
        :key="p"
        class="page-num"
        :class="{ active: p === page }"
        @click="go(p)"
    >
      {{ p }}
    </button>

    <button class="page-btn" :disabled="page === totalPages" @click="go(page + 1)">다음</button>
  </nav>
</template>

<style scoped>
.pagination{
  display:flex; justify-content:center;
  align-items:center;
  gap:8px;
  margin-top:18px;
}
.page-btn,.page-num{
  border:1px solid rgba(74,58,42,0.25);
  background:rgba(255,255,255,0.9);
  color:#2f241a;
  padding:8px 12px;
  border-radius:999px;
  cursor:pointer;
  font-weight:700;
}
.page-btn:disabled{
  opacity:0.45;
  cursor:not-allowed;
}
.page-num.active{
  background:#4a3a2a;
  color:#fff;
  border-color:#4a3a2a;
}
</style>