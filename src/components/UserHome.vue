<template>
  <q-layout view="hHh lpR fFf">
    <!-- NavBar  -->
    <NavBarUser
      :isLoggedIn="isLoggedIn"
      :hasSelectedMatch="hasSelectedMatch"
      @link-action="handleNavigate"
    />

    <!-- 페이지 컨테이너 -->
    <q-page-container>
      <router-view @update-status="handleUpdateStatus" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";
import { APIs } from "../utils/APIs";

import NavBarUser from "./NavBarUser.vue";
import { navigate } from "../utils/navigate";
import { setLocalSession } from "../utils/sessionFunctions";

// Quasar와 Vue Router 사용
const $q = useQuasar();
const router = useRouter();

// userClass : navigation path, userTable : 조회시 사용자 테이블명
const userClass = "user";
const userTable = "user";

// 상태 관리 - 메뉴 버튼 활성화 관리 용
const isLoggedIn = ref(false);
const hasSelectedMatch = ref(false);

const handleUpdateStatus = (status) => {
  isLoggedIn.value = status.isLoggedIn;
  hasSelectedMatch.value = status.hasSelectedMatch;
};

const resetLoginStatus = () => {
  isLoggedIn.value = false;
  hasSelectedMatch.value = false;
};

const confirmAndLogout = async () => {
  const isConfirmed = window.confirm("로그아웃하시겠습니까");
  if (!isConfirmed) return;

  try {
    await axios.post(APIs.USER_LOGOUT, {}, { withCredentials: true });
    resetLoginStatus();
  } catch (error) {
    alert("시스템 오류입니다.");
  } finally {
    navigate(router, userClass, "login");
  }
};

const handleNavigate = async (action) => {
  if (action === "logout") {
    await confirmAndLogout();
  } else {
    navigate(router, userClass, action);
  }
};

onMounted(() => {
  setLocalSession(userClass, {
    tableName: userTable,
    userClass: userClass,
  });
  navigate(router, userClass, "login");
});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
