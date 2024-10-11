<template>
  <q-page>
    <q-layout view="lHh Lpr lFf">
      <!-- NavBarAdmin 대체 -->
      <q-header elevated>
        <q-toolbar>
          <q-btn flat dense round icon="menu" aria-label="Menu" />
          <q-toolbar-title>관리자 홈</q-toolbar-title>
          <q-btn flat dense label="로그아웃" v-if="isLoggedIn" @click="handleLinkAction('logout')" />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <!-- 라우터 뷰 -->
        <router-view @update-status="handleUpdateStatus"></router-view>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { url } from '../utils/messagesAPIs';

const router = useRouter();
const isLoggedIn = ref(false);
const hasSelectedMatch = ref(false);

const handleUpdateStatus = (status) => {
  isLoggedIn.value = status.isLoggedIn;
  hasSelectedMatch.value = status.hasSelectedMatch;
};

// 링크 클릭 시 호출되는 함수
const handleLinkAction = (action) => {
  router.push(url[action]); // 여기서 route를 사용하여 경로 이동
};

// 로그인 상태 확인
const checkLoginStatus = () => {
  if (!isLoggedIn.value) {
    router.push('/admin/adminlogin'); // 로그인 페이지로 리디렉션
  }
};

// 컴포넌트가 마운트된 후에 로그인 상태를 체크하고 필요 시 라우팅
onMounted(() => {
  checkLoginStatus();
  sessionStorage.setItem('tableName', 'admin');
});
</script>

<style scoped>
/* Quasar 기본 스타일 활용 */
</style>
