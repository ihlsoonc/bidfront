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
      <q-toolbar-title>입찰 등록 및 결제 시스템</q-toolbar-title>

      <!-- 데스크탑에서만 버튼 표시 -->
      <q-btn
        flat
        round
        dense
        label="경기장 선택"
        @click="handleClickAction('selectVenue')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="사용자정보수정"
        @click="handleClickAction('updateUser')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        icon="home"
        @click="handleClickAction('login')"
        v-if="$q.screen.gt.md"
      />
      &nbsp;&nbsp;&nbsp;&nbsp;

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
        :disable="!isLoggedIn"
      >
        <q-item-section>경기장선택</q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="handleClickAction('updateUser')"
        :disable="!isLoggedIn"
      >
        <q-item-section>사용자 정보 수정</q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="handleClickAction('login')"
        :disable="isLoggedIn"
      >
        <q-icon name="home" />홈
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="handleClickAction('logout')"
        :disable="!isLoggedIn"
      >
        <q-icon name="logout" />로그아웃
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup>
import { ref, toRefs, onMounted } from "vue";

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true,
  },
  hasSelectedMatch: {
    type: Boolean,
    required: true,
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

onMounted(() => {});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}
</style>
