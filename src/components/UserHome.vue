<template>
  <q-layout view="hHh lpR fFf">
    <!-- NavBar  -->
    <NavBarUser
      :isLoggedIn="isLoggedIn"
      :hasSelectedMatch="hasSelectedMatch"
      :username="username"
      @link-action="handleNavigate"
    />
    <q-card-section v-if="message">
      <q-banner type="warning">{{ message }}</q-banner>
    </q-card-section>
    <!-- 페이지 컨테이너 -->
    <q-page-container>
      <router-view @update-status="handleUpdateStatus" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { Dialog } from "quasar";
import qs from "qs";
import { APIs } from "../utils/APIs";
import axios from "axios"; //로그아웃에서는 토큰 유효성 검사 및 재발급이 필요없으므로 axiosInterceptor를 사용하지 않음
import NavBarUser from "./NavBarUser.vue";
import { navigate } from "../utils/navigate";
import {
  clearSessionByContext,
  fetchSessionData,
  saveSessionContext,
} from "../utils/sessionFunctions";
import { messageCommon } from "../utils/messageCommon";

// Quasar와 Vue Router 사용
const $q = useQuasar();
const router = useRouter();

// sessionContext : navigation path & localStorate prefix
const sessionContext = "user";

// 상태 관리 - 메뉴 버튼 활성화 관리 용
const message = ref("");
const username = ref(fetchSessionData(sessionContext, ["username"]).username);
const isLoggedIn = ref(false);
const hasSelectedMatch = ref(false);

const handleUpdateStatus = (status) => {
  isLoggedIn.value = status.isLoggedIn;
  hasSelectedMatch.value = status.hasSelectedMatch;
};

const resetLoginStatus = () => {
  isLoggedIn.value = false;
  hasSelectedMatch.value = false;
  username.value = "";
};

const confirmAndLogout = async () => {
  const isConfirmed = window.confirm("로그아웃하시겠습니까?");
  if (!isConfirmed) return;

  try {
    const response = await axios.post(
      APIs.LOGOUT, // 로그아웃 API 경로
      qs.stringify({
        username: "", // Spring Security용 사용자 이름 (전화번호)
        password: "", // Spring Security용 비밀번호 (빈 값으로 전달)
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // 요청 데이터 형식 지정
        },
        withCredentials: true, // 쿠키와 함께 요청 전송
      }
    );

    clearSessionByContext(sessionContext);
    resetLoginStatus();
  } catch (error) {
    handleError(error);
  } finally {
    handleNavigate("login");
  }
};

const handleNavigate = async (action) => {
  if (action === "logout") {
    await confirmAndLogout();
  } else {
    navigate(router, sessionContext, action);
  }
};

const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

onBeforeMount(() => {
  saveSessionContext(sessionContext);
});

onMounted(() => {
  handleNavigate("login"); // 로그인 페이지로 이동
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
