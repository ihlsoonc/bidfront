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
        :disable="!isLoggedIn"
        @click="handleLinkAction('selectVenue')"
        v-if="$q.screen.gt.md"
      />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="사용자정보수정"
        @click="handleLinkAction('updateUser')"
        :disable="!isLoggedIn"
        v-if="$q.screen.gt.md"
      />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <q-btn
        flat
        round
        dense
        label="로그인"
        :disable="isLoggedIn"
        @click="handleLinkAction('login')"
        v-if="$q.screen.gt.md"
      />
      &nbsp;&nbsp;&nbsp;&nbsp;
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
        :disable="!isLoggedIn"
      >
        <q-item-section>경기장선택</q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="handleLinkAction('updateUser')"
        :disable="!isLoggedIn"
      >
        <q-item-section>사용자 정보 수정</q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="handleLinkAction('login')"
        :disable="isLoggedIn"
      >
        <q-item-section>로그인</q-item-section>
      </q-item>

      <q-item
        clickable
        v-ripple
        @click="handleLinkAction('logout')"
        :disable="!isLoggedIn"
      >
        <q-item-section>로그아웃</q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script setup>
import { ref, toRefs, watch, onMounted } from "vue";

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

const handleLinkAction = (action) => {
  emit("link-action", action);
};
// const updateStatus = () => {
//   isLoggedIn.value = props.isLoggedIn;
// };

const toggleDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

// watch([() => props.isLoggedIn], () => {
//   updateStatus();
// });

// isLoggedIn의 변경을 모니터링하여 로그 출력
watch(isLoggedIn, (newValue, oldValue) => {
  console.log("==========================isLoggedIn changed:", {
    oldValue,
    newValue,
  });
});
onMounted(() => {
  // updateStatus();
});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}

.disabled {
  pointer-events: none;
}
</style>
