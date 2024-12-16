<template>
  <q-layout view="hHh lpR fFf">
    <!-- 네비게이션 바 컴포넌트 -->
    <NavBarAdminM
      :isLoggedIn="isLoggedIn"
      :hasSelectedMatch="hasSelectedMatch"
      :username="username"
      @link-action="handleNavigate"
    />
    <q-card-section v-if="message">
      <q-banner type="warning">{{ message }}</q-banner>
    </q-card-section>
    <q-page-container>
      <!-- 라우터 뷰를 삽입하고 상태 업데이트 이벤트 처리 -->
      <router-view @update-status="handleUpdateStatus" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import qs from "qs";
import { APIs } from "../utils/APIs";
import axios from "axios"; //로그아웃에서는 토큰 유효성 검사 및 재발급이 필요없으므로 axiosInterceptor를 사용하지 않음
import NavBarAdminM from "./NavBarAdminM.vue";
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
const sessionContext = "adminm"; // 네비게이션 경로용 사용자 클래스

// 상태 관리 - 메뉴 버튼 활성화 관리 용
const message = ref("");
const username = ref(fetchSessionData(sessionContext, ["username"]).username);
const isLoggedIn = ref(false);
const hasSelectedMatch = ref(false);

// 상태 업데이트 함수
const handleUpdateStatus = (status) => {
  isLoggedIn.value = status.isLoggedIn; // 로그인 상태 업데이트
  hasSelectedMatch.value = status.hasSelectedMatch; // 경기 선택 상태 업데이트
};

// 로그인 상태 초기화 함수
const resetLoginStatus = () => {
  isLoggedIn.value = false; // 로그인 상태 초기화
  hasSelectedMatch.value = false; // 경기 선택 상태 초기화
  username.value = "";
};

// 로그아웃 확인 및 처리 함수
const confirmAndLogout = async () => {
  const isConfirmed = window.confirm("로그아웃하시겠습니까?");
  if (!isConfirmed) return;

  try {
    const response = await axios.post(
      APIs.LOGOUT,
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

// 페이지 이동 처리 함수
const handleNavigate = async (action) => {
  if (action === "logout") {
    await confirmAndLogout(); // 로그아웃 처리
  } else {
    navigate(router, sessionContext, action); // 다른 페이지로 이동
  }
};

const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

// 초기 세팅
onBeforeMount(() => {
  saveSessionContext(sessionContext);
});

onMounted(() => {
  handleNavigate("login"); // 초기 로그인 페이지로 이동
});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1; /* 툴바 제목의 공간을 확장하여 레이아웃을 정리 */
}
</style>
