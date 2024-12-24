<template>
  <q-header elevated>
    <q-toolbar>
      <!-- 모바일: 햄버거 버튼 -->
      <q-btn
        flat
        round
        dense
        icon="menu"
        @click="toggleDrawer"
        v-if="$q.screen.lt.md"
      />

      <!-- 타이틀 -->
      <q-toolbar-title>
        입찰 등록 및 결제 시스템
        <span
          v-if="username && username.trim() !== ''"
          style="font-size: 14px; display: inline-block; margin-left: 8px"
          >- {{ username }}님</span
        >
      </q-toolbar-title>

      <!-- 데스크톱: 버튼 -->
      <q-space />
      <div v-if="$q.screen.gt.md">
        <q-btn
          flat
          round
          dense
          label="경기장 선택"
          @click="handleClickAction('selectVenue')"
          :disable="!isLoggedIn"
        />&nbsp;&nbsp;&nbsp;
        <q-btn
          flat
          round
          dense
          label="사용자정보수정"
          @click="handleClickAction('updateUser')"
          :disable="!isLoggedIn"
        />&nbsp;&nbsp;&nbsp;

        <q-btn
          flat
          round
          dense
          icon="home"
          @click="handleClickAction('home')"
        />&nbsp;&nbsp;&nbsp;
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
          icon="logout"
          label="로그아웃"
          v-if="isLoggedIn"
          @click="handleClickAction('logout')"
        />
      </div>
    </q-toolbar>
  </q-header>

  <!-- 모바일: 드로어 -->
  <q-drawer v-model="leftDrawerOpen" side="left" bordered>
    <q-list>
      <q-item
        clickable
        v-ripple
        @click="handleClickAction('selectVenue')"
        :disable="!isLoggedIn"
      >
        <q-item-section>경기장 선택</q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        @click="handleClickAction('updateUser')"
        :disable="!isLoggedIn"
      >
        <q-item-section>사용자 정보 수정</q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="handleClickAction('home')">
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
        v-ripple
        @click="handleClickAction('logout')"
        v-if="isLoggedIn"
      >
        <q-icon name="logout" />로그아웃
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup>
import { ref, onMounted } from "vue";

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

onMounted(() => {});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}
</style>
