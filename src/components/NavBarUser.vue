<template>
  <q-layout>
    <!-- 툴바 -->
    <q-header elevated>
      <q-toolbar>
        <!-- 모바일에서는 햄버거 버튼 -->
        <q-btn flat round dense icon="menu" @click="toggleDrawer" v-if="$q.screen.lt.md" />
        <q-toolbar-title>사용자 네비게이션</q-toolbar-title>
        <q-btn flat round dense label="홈" @click="handleClick('selectvenue')" :disable="!isLoggedIn" v-if="$q.screen.gt.md" />
        <q-btn flat round dense label="로그인" @click="handleClick('userlogin')" v-if="$q.screen.gt.md" />
        <q-btn flat round dense label="사용자정보수정" @click="handleClick('updateuser')" :disable="!isLoggedIn" v-if="$q.screen.gt.md" />
        <q-btn flat round dense label="로그아웃" @click="handleClick('userlogout')" :disable="!isLoggedIn" v-if="$q.screen.gt.md" />
      </q-toolbar>
    </q-header>

    <!-- 모바일용 드로어 (사이드 메뉴) -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered v-if="$q.screen.lt.md">
      <q-list>
        <q-item clickable v-ripple @click="handleClick('selectvenue')">
          <q-item-section>홈</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleClick('userlogin')">
          <q-item-section>로그인</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleClick('updateuser')" :disable="!isLoggedIn">
          <q-item-section>사용자정보수정</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleClick('userlogout')" :disable="!isLoggedIn">
          <q-item-section>로그아웃</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </q-layout>
</template>

<script>
import { ref, watch, onMounted } from 'vue';

export default {
  name: 'NavBarUser',
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    hasSelectedMatch: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const isLoggedIn = ref(props.isLoggedIn);
    const leftDrawerOpen = ref(false);

    const handleClick = (action) => {
      emit('link-action', action);
    };

    const updateStatus = () => {
      isLoggedIn.value = props.isLoggedIn;
    };

    const toggleDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    watch([() => props.isLoggedIn], () => {
      updateStatus();
    });

    onMounted(() => {
      updateStatus();
    });

    return {
      handleClick,
      toggleDrawer,
      leftDrawerOpen,
    };
  },
};
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}

.q-btn {
  margin-right: 10px;
}
</style>
