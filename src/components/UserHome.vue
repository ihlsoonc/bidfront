<template>
  <q-layout view="hHh lpR fFf" class="page-container">
    <!-- 헤더 -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="toggleLeftDrawer" v-if="$q.screen.lt.md" />
        <q-toolbar-title>User Dashboard</q-toolbar-title>
        <q-btn flat round dense label="Logout" v-if="isLoggedIn" @click="handleLinkAction('userlogout')" />
      </q-toolbar>
    </q-header>

    <!-- 사이드바 (Drawer) -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple @click="handleLinkAction('selectvenue')" :class="{ 'disabled': !isLoggedIn }">
          <q-item-section>홈</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('userlogin')">
          <q-item-section>로그인</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('updateuser')" :class="{ 'disabled': !isLoggedIn }">
          <q-item-section>사용자 정보 수정</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('userlogout')" :class="{ 'disabled': !isLoggedIn }">
          <q-item-section>로그아웃</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- 페이지 컨테이너 -->
    <q-page-container>
      <router-view @update-status="handleUpdateStatus" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { url } from '../utils/messagesAPIs';

export default {
  name: 'UserHome',
  setup() {
    const $q = useQuasar(); // Quasar 인스턴스
    const router = useRouter();
    const isLoggedIn = ref(false);
    const hasSelectedMatch = ref(false);
    const leftDrawerOpen = ref(false); // Drawer 열기 상태

    const handleLinkAction = (action) => {
      router.push(url[action]);  // 링크 클릭 시 라우터로 경로 이동
    };

    const handleUpdateStatus = (status) => {
      isLoggedIn.value = status.isLoggedIn;
      hasSelectedMatch.value = status.hasSelectedMatch;
    };

    const checkLoginStatus = () => {
      if (!isLoggedIn.value) {
        router.push(url.userlogin);
      }
    };

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    onMounted(() => {
      checkLoginStatus(); // 로그인 상태 확인
      sessionStorage.setItem('tableName', "user");
    });

    return {
      handleLinkAction,
      isLoggedIn,
      hasSelectedMatch,
      handleUpdateStatus,
      toggleLeftDrawer,
      leftDrawerOpen,
    };
  },
};
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}

/* 최대 너비 설정: 1200px로 제한 (모바일 제외) */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}

/* 모바일에서 max-width 적용 제거 */
@media (max-width: 600px) {
  .q-toolbar-title {
    font-size: 1.2rem;
  }

  .page-container {
    max-width: 100%; /* 모바일에서는 전체 너비 사용 */
  }
}
</style>
