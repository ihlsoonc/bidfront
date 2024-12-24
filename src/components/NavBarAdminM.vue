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
        입찰 시스템 대회 등록
        <span
          v-if="username && username.trim() !== ''"
          style="font-size: 14px; display: inline-block; margin-left: 8px"
          >- {{ username }}님</span
        >
      </q-toolbar-title>

      <!-- 데스크탑용 버튼들 -->
      <q-btn
        flat
        round
        dense
        label="경기장 선택"
        @click="handleClickAction('selectVenue')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="대회 등록"
        @click="handleClickAction('registerMatch')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="사용자 정보 수정"
        @click="handleClickAction('updateUser')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        icon="home"
        @click="handleClickAction('login')"
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
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />
    </q-toolbar>
  </q-header>

  <!-- 모바일용 드로어 (사이드 메뉴) -->
  <q-drawer v-model="leftDrawerOpen" side="left" bordered>
    <q-list>
      <q-item
        clickable
        v-ripple
        @click="handleClickAction('selectVenue')"
        :class="{ disabled: !isLoggedIn }"
      >
        <q-item-section>경기장선택</q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        @click="handleClickAction('updateUser')"
        :class="{ disabled: !isLoggedIn }"
      >
        <q-item-section>사용자 정보 수정</q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        @click="handleClickAction('registerMatch')"
        :class="{ disabled: !isLoggedIn }"
      >
        <q-item-section>대회 등록</q-item-section>
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
        v-ripple
        @click="handleClickAction('logout')"
        :class="{ disabled: !isLoggedIn }"
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
