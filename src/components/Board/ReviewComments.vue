<script setup>
import {ref, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {motion} from 'motion-v';
import {
  fetchComments,
  createComment,
  deleteComment
} from '@/api/posts.js';

const props = defineProps({
  reviewIndex : {
    type: Number,
    required: true
  }
})


const newComment = ref('');
const loading = ref(false);
const errorMsg = ref('');
const comments = ref([]);
const { t} = useI18n();

//실제 API 연결시 사용할 코드

const loadComments = async () => {
  try{
    loading.value = true;
    errorMsg.value = '';

    const res = await fetchComments(props.reviewIndex);
    comments.value = res.data?.data?.commentData ?? [];
  } catch (e) {
    console.error(e);
    errorMsg.value = t('comments.loadFail');
  } finally {
    loading.value = false;
  }
}

onMounted(()=>{
  loadComments();
})


const submitting = ref(false);

//댓글 다는 핸들러
const handleSubmit = async () => {
  const content = newComment.value.trim();
  if (!content) return;

  try{
    submitting.value = true;

    //API 연결시 사용할 코드
    await createComment(props.reviewIndex,content);
    await loadComments();

    newComment.value = '';
  }catch(e){
    console.error(e);
    alert(t('comments.createFail'))
  }finally {
    submitting.value = false;
  }
}

const handleDelete = async (commentIndex) => {
  if(!confirm(t('comments.deleteConfirm')))return;

  try{
    //api연결시 사용할 코드
    await deleteComment(props.reviewIndex,commentIndex);
    await loadComments();


    comments.value = comments.value.filter(
        (c) => c.commentIndex !== commentIndex,
    )
  }catch(e){
    console.error(e);
    alert(t('comments.deleteFail'))
  }
}

const formatDateTime = (iso) => {
  if (!iso) return '';
  return iso.replace('T', ' ').slice(0, 16);
};
</script>

<template>

  <motion.section
      class="comments-wrap"
      :initial="{ opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.2 }"
  >
    <h2 class="comments-title">{{ $t('comments.title') }}</h2>

    <p v-if="errorMsg" class="comments-error">{{ errorMsg }}</p>
    <p v-else-if="loading" class="comments-loading">  {{ $t('comments.loading') }}</p>

    <ul class="comments-list">
      <motion.li
          v-for="(c, idx) in comments"
          :key="c.commentIndex"
          class="comment-item"
          :initial="{ opacity: 0, y: 4 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: idx * 0.03 }"
      >
        <div class="comment-header">
          <span class="nickname">{{ c.userNickname }}</span>
          <span class="dot">·</span>
          <span class="date">{{ formatDateTime(c.commentDate) }}</span>
          <button
              type="button"
              class="delete-btn"
              @click="handleDelete(c.commentIndex)"
          >
            {{ $t('comments.delete') }}
          </button>
        </div>
        <p class="comment-content">
          {{ c.content }}
        </p>
      </motion.li>
    </ul>

    <form class="comment-form" @submit.prevent="handleSubmit">
      <textarea
          v-model="newComment"
          class="comment-input"
          rows="3"
          :placeholder="$t('comments.placeholder')"
      />
      <div class="comment-form-footer">
        <motion.button
            type="submit"
            class="comment-submit-btn"
            :disabled="submitting || !newComment.trim()"
            :whileHover="{ scale: 1.03 }"
            :whileTap="{ scale: 0.96 }"
        >
          {{ $t('comments.submit') }}
        </motion.button>
      </div>
    </form>
  </motion.section>
</template>

<style scoped>
.comments-wrap {
  margin-top: 12px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.comments-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: #3b2f22;
}

.comments-error,
.comments-loading {
  font-size: 13px;
  margin-bottom: 8px;
  color: #d23737;
}

.comments-list {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-item {
  padding: 6px 0;
  border-bottom: 1px solid rgba(226, 199, 155, 0.3);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a08c72;
}

.comment-content {
  margin: 2px 0 0;
  font-size: 13px;
  color: #3b2f22;
  white-space: pre-wrap;
}

.delete-btn {
  margin-left: auto;
  font-size: 11px;
  border: none;
  background: transparent;
  color: #c6483b;
  cursor: pointer;
}

.comment-form {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.comment-input {
  width: 100%;
  resize: vertical;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(210, 184, 140, 0.8);
  font-size: 13px;
  box-sizing: border-box;
}

.comment-form-footer {
  display: flex;
  justify-content: flex-end;
}

.comment-submit-btn {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: none;
  background: #4a3a2a;
  color: #f9f0dd;
  cursor: pointer;
}
</style>