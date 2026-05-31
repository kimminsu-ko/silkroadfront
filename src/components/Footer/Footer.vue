<script setup>
import {useI18n} from "vue-i18n";

const {t} = useI18n();
</script>

<template>
<section class="footer">
  <div class="footer-clause">
    <p>
      <span class="useClause">{{$t('clause.useClause')}}</span>
      |
      <span class="userData">{{t('clause.userData')}}</span>
    </p>
  </div>
  <div class="footer-copyText">
    <p>{{t('clause.warning')}}</p>
  </div>
  <div class="footer-copyRight">
    <p>copyright &copy; silkRoad</p>
  </div>
</section>
</template>

<style scoped>
.footer {
  width: 100%;
  background-color: #222222;
  color: #ffffff;
  font-size: 0.6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
@media (min-width: 768px) {

}
@media (min-width: 1200px){

}
</style>