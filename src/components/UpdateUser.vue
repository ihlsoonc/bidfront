<template>
  <q-layout view="hHh lpR fFf"> <!-- 반응형 레이아웃 설정 -->
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
        <q-item clickable v-ripple @click="handleLinkAction('userhome')">
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('matches')">
          <q-item-section>Matches</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleLinkAction('settings')">
          <q-item-section>Settings</q-item-section>
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
import NavBarUser from './NavBarUser.vue';
import { url } from '../utils/messagesAPIs';

export default {
  name: 'UserHome',
  components: {
  },
  setup() {
    const $q = useQuasar(); // Quasar 인스턴스 사용
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
        router.push(url.userlogin);
      }
    };

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    onMounted(() => {
      checkLoginStatus();
      sessionStorage.setItem('tableName', 'user');
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

@media (max-width: 600px) {
  .q-toolbar-title {
    font-size: 1.2rem;
  }
}
</style>
