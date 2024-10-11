<template>
  <q-layout view="hHh lpR fFf">
    <!-- 헤더 -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="toggleLeftDrawer" v-if="$q.screen.lt.md" />
        <q-toolbar-title>Admin Dashboard</q-toolbar-title>
        <q-btn flat round dense label="Logout" v-if="isLoggedIn" @click="handleLinkAction('adminlogout')" />
      </q-toolbar>
    </q-header>

    <!-- 사이드바 (Drawer) -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item clickable v-ripple @click="handleLinkAction('adminlogin')">
          <q-item-section>로그인</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('selectmatch')" :class="{ 'disabled': !isLoggedIn }">
          <q-item-section>대회선택</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('bidresults')" :class="{ 'disabled': !isLoggedIn || !hasSelectedMatch }">
          <q-item-section>입찰현황 및 낙찰진행</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('managematch')" :class="{ 'disabled': !isLoggedIn }">
          <q-item-section>대회관리</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('approvematch')" :class="{ 'disabled': !isLoggedIn }">
          <q-item-section>대회승인</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('updateseatprice')" :class="{ 'disabled': !isLoggedIn || !hasSelectedMatch }">
          <q-item-section>좌석가격입력</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('managevenue')" :class="{ 'disabled': !isLoggedIn }">
          <q-item-section>경기장관리</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('updateadmin')" :class="{ 'disabled': !isLoggedIn }">
          <q-item-section>사용자정보수정</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('adminlogout')" :class="{ 'disabled': !isLoggedIn }">
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
  name: 'AdminDashboard',
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const isLoggedIn = ref(false);
    const hasSelectedMatch = ref(false);
    const leftDrawerOpen = ref(false);

    const handleLinkAction = (action) => {
      router.push(url[action]);
    };

    const handleUpdateStatus = (status) => {
      isLoggedIn.value = status.isLoggedIn;
      hasSelectedMatch.value = status.hasSelectedMatch;
    };

    const checkLoginStatus = () => {
      if (!isLoggedIn.value) {
        router.push('/admin/adminlogin');
      }
    };

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    onMounted(() => {
      checkLoginStatus();
      sessionStorage.setItem('tableName', 'admin');
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

.disabled {
  pointer-events: none;
  opacity: 0.5;
}

@media (max-width: 600px) {
  .q-toolbar-title {
    font-size: 1.2rem;
  }
}
</style>
