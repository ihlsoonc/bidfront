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
      <q-toolbar-title>입찰 시스템 대회 등록</q-toolbar-title>

      <!-- 데스크탑용 버튼들 -->
      <q-btn
        flat
        round
        dense
        label="경기장 선택"
        @click="handleLinkAction('selectVenue')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="대회관리"
        @click="handleLinkAction('manageMatch')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="사용자정보수정"
        @click="handleLinkAction('updateUser')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

      <q-btn
        flat
        round
        dense
        label="로그아웃"
        @click="handleLinkAction('logout')"
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
        @click="handleLinkAction('selectVenue')"
        :class="{ disabled: !isLoggedIn }"
      >
        <q-item-section>경기장선택</q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        @click="handleLinkAction('manageMatch')"
        :class="{ disabled: !isLoggedIn }"
      >
        <q-item-section>대회관리</q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        @click="handleLinkAction('updateUser')"
        :class="{ disabled: !isLoggedIn }"
      >
        <q-item-section>사용자정보수정</q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="handleLinkAction('login')">
        <q-item-section>로그인</q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        @click="handleLinkAction('logout')"
        :class="{ disabled: !isLoggedIn }"
      >
        <q-item-section>로그아웃</q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script>
import { ref, watch, onMounted } from "vue";

export default {
  name: "NavBarAdminM",
  emits: ["link-action"],
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

    // 링크 클릭 시 이벤트를 emit합니다.
    const handleLinkAction = (action) => {
      emit("link-action", action);
    };

    const updateStatus = () => {
      isLoggedIn.value = props.isLoggedIn;
    };

    const toggleDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    // 로그인 상태를 감지합니다.
    watch(
      () => props.isLoggedIn,
      () => {
        updateStatus();
      }
    );

    onMounted(() => {
      updateStatus();
    });

    return {
      handleLinkAction,
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
