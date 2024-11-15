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
      <q-toolbar-title>입찰 시스템 관리자용 시스템</q-toolbar-title>

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
        label="입찰현황 및 낙찰진행"
        @click="handleClickAction('bids')"
        :disable="!isLoggedIn || !hasSelectedMatch"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="대회관리"
        @click="handleClickAction('manageMatch')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="대회승인"
        @click="handleClickAction('approveMatch')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="좌석가격입력"
        @click="handleClickAction('updateSeatPrice')"
        :disable="!isLoggedIn || !hasSelectedMatch"
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
        @click="handleClickAction('login')"
        v-if="$q.screen.gt.md"
      />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
        @click="handleClickAction('selectVenue')"
        :disabled="!isLoggedIn"
      >
        <q-item-section>경기장 선택</q-item-section>
      </q-item>

      <q-item
        clickable
        @click="handleClickAction('bids')"
        :disable="!isLoggedIn || !hasSelectedMatch"
      >
        <q-item-section>입찰현황 및 낙찰진행</q-item-section>
      </q-item>

      <q-item
        clickable
        @click="handleClickAction('manageMatch')"
        :disable="!isLoggedIn"
      >
        <q-item-section>대회관리</q-item-section>
      </q-item>

      <q-item
        clickable
        @click="handleClickAction('approveMatch')"
        :disable="!isLoggedIn"
      >
        <q-item-section>대회승인</q-item-section>
      </q-item>

      <q-item
        clickable
        @click="handleClickAction('updateSeatPrice')"
        :disable="!isLoggedIn || !hasSelectedMatch"
      >
        <q-item-section>좌석가격입력</q-item-section>
      </q-item>

      <q-item
        clickable
        @click="handleClickAction('manageVenue')"
        :disable="!isLoggedIn"
      >
        <q-item-section>경기장 등록 및 수정</q-item-section>
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
    default: false,
  },
  hasSelectedMatch: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["link-action"]);
const { isLoggedIn } = toRefs(props);
const { hasSelectedMatch } = toRefs(props);
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
