<template>
  <q-header elevated>
    <q-toolbar>
      <!-- 모바일에서는 햄버거 버튼 -->
      <q-btn
        flat
        round
        dense
        icon="menu"
        @click="toggleDrawer"
        v-if="$q.screen.lt.md"
      />
      <q-toolbar-title>
        입찰 시스템 관리자용 시스템
        <!-- 로그인된 경우 사용자 이름 표시 -->
        <span
          v-if="username && username.trim() !== ''"
          style="font-size: 14px; display: inline-block; margin-left: 8px"
          >- {{ username }}님</span
        >
      </q-toolbar-title>

      <!-- 데스크탑에서만 버튼 표시 -->
      <q-btn
        flat
        round
        dense
        label="경기장선택"
        @click="handleClickAction('selectVenue')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="경기장 등록 및 수정"
        @click="handleClickAction('manageVenue')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        icon="home"
        @click="handleClickAction('home')"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="로그인"
        v-if="!isLoggedIn"
        @click="handleClickAction('login')"
      />
      <q-btn
        flat
        round
        dense
        label="로그아웃"
        icon="logout"
        @click="handleClickAction('logout')"
        v-if="isLoggedIn"
      />
    </q-toolbar>
  </q-header>

  <!-- 모바일용 드로어 (사이드 메뉴) -->
  <q-drawer v-model="leftDrawerOpen" side="left" bordered>
    <q-list>
      <q-item
        clickable
        @click="handleClickAction('selectVenue')"
        :disable="!isLoggedIn"
      >
        <q-item-section>경기장 선택</q-item-section>
      </q-item>

      <q-item
        clickable
        @click="handleClickAction('manageVenue')"
        :disable="!isLoggedIn"
      >
        <q-item-section>경기장 등록 및 수정</q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="handleClickAction('login')">
        <q-icon name="home" />홈
      </q-item>
      <q-item
        v-if="!isLoggedIn"
        clickable
        v-ripple
        @click="handleClickAction('login')"
      >
        <q-item-section>로그인</q-item-section>
      </q-item>
      <q-item
        clickable
        @click="handleClickAction('logout')"
        :disable="!isLoggedIn"
        icon="logout"
      >
        <q-icon name="logout" />로그아웃
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup>
import { ref, toRefs, onMounted } from "vue";
import { useQuasar } from "quasar";

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true,
  },
  hasSelectedMatch: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    default: null, // 기본값 설정
  },
});

const emit = defineEmits(["link-action"]);
const leftDrawerOpen = ref(false);
const handleClickAction = (action) => {
  leftDrawerOpen.value = false;
  emit("link-action", action);
};

const toggleDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>

<style scoped>
/* Quasar 기본 스타일 활용 */
</style>
