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
      <template v-if="!isToolBarClicked">
        <!-- 기본 이미지 표시 -->
        <img
          src="../assets/images/match02.png"
          alt="기본 이미지"
          style="width: 100%; height: auto"
        />
      </template>
      <template v-else>
        <!-- router-view 표시 -->
        <router-view @update-status="handleUpdateStatus" />
      </template>
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
const isToolBarClicked = ref(false);

// 상태 업데이트 함수
const handleUpdateStatus = (status) => {
  isLoggedIn.value = status.isLoggedIn; // 로그인 상태 업데이트
  hasSelectedMatch.value = status.hasSelectedMatch; // 경기 선택 상태 업데이트
  username.value = status.username;
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

const handleNavigate = async (action) => {
  if (action === "logout") {
    await confirmAndLogout();
  } else if (action === "home") {
    isToolBarClicked.value = false;
  } else {
    isToolBarClicked.value = true;
    navigate(router, sessionContext, action);
  }
};

const handleError = (error) => {
  //refresh expired인 경우 400발생
  if (
    error.response?.status === 403 ||
    error.response?.status === 401 ||
    error.response?.status === 400
  ) {
    Dialog.create({
      title: "알림림",
      message: "로그아웃 되었습니다..",
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });

    clearSessionByContext(sessionContext);
    resetLoginStatus();
    navigate(router, sessionContext, "home"); // 로그인 화면으로 이동
  } else {
    if (error.response) {
      message.value = error.response.data;
    } else if (error.request) {
      message.value = messageCommon.ERR_NETWORK;
    } else {
      message.value = messageCommon.ERR_ETC;
    }
  }
};
onBeforeMount(() => {
  saveSessionContext(sessionContext);
});

onMounted(() => {
  resetLoginStatus();
});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1; /* 툴바 제목의 공간을 확장하여 레이아웃을 정리 */
}
</style>
