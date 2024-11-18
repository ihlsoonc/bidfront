<template>
  <q-layout view="hHh lpR fFf">
    <!-- 네비게이션 바 -->
    <NavBarAdmin
      :isLoggedIn="isLoggedIn"
      :hasSelectedMatch="hasSelectedMatch"
      @link-action="handleNavigate"
    />
    <!-- 페이지 컨테이너 -->
    <q-page-container>
      <!-- 라우터 뷰를 삽입하고 상태 업데이트 이벤트 처리 -->
      <router-view @update-status="handleUpdateStatus" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";

import { APIs } from "../utils/APIs"; // API 엔드포인트 정의
import NavBarAdmin from "./NavBarAdmin.vue"; // 네비게이션 바 컴포넌트
import { navigate } from "../utils/navigate"; // 페이지 이동 유틸리티 함수
import { setLocalSession } from "../utils/sessionFunctions"; // 세션 설정 유틸리티 함수

// Quasar와 Vue Router 사용 설정
const router = useRouter();
const $q = useQuasar();

// 사용자 클래스 및 테이블명
const userClass = "admin"; // 네비게이션 경로용 사용자 클래스
const userTable = "admin"; // 조회시 사용자 테이블명

// 상태 관리 변수 - 메뉴 버튼 활성화 여부
const isLoggedIn = ref(false); // 로그인 상태 여부
const hasSelectedMatch = ref(false); // 경기 선택 여부

// 상태 업데이트 함수
const handleUpdateStatus = (status) => {
  isLoggedIn.value = status.isLoggedIn; // 로그인 상태 갱신
  hasSelectedMatch.value = status.hasSelectedMatch; // 경기 선택 상태 갱신
};

// 로그인 상태 초기화 함수
const resetLoginStatus = () => {
  isLoggedIn.value = false; // 로그인 상태 초기화
  hasSelectedMatch.value = false; // 경기 선택 상태 초기화
};

// 로그아웃 확인 및 처리 함수
const confirmAndLogout = async () => {
  const isConfirmed = window.confirm("로그아웃하시겠습니까"); // 로그아웃 확인 메시지
  if (!isConfirmed) return;

  try {
    await axios.post(APIs.USER_LOGOUT, {}, { withCredentials: true }); // 로그아웃 API 호출
    resetLoginStatus(); // 로그인 상태 초기화
  } catch (error) {
    alert("시스템 오류입니다."); // 오류 메시지
  } finally {
    navigate(router, userClass, "login"); // 로그인 페이지로 이동
  }
};

// 페이지 이동 처리 함수
const handleNavigate = async (action) => {
  if (action === "logout") {
    await confirmAndLogout(); // 로그아웃 처리
  } else {
    navigate(router, userClass, action); // 다른 페이지로 이동
  }
};

// 컴포넌트 마운트 시 실행
onMounted(() => {
  // 사용자 세션 설정
  setLocalSession(userClass, {
    tableName: userTable, // 사용자 테이블명 설정
    userClass: userClass, // 사용자 클래스 설정
  });
  handleNavigate("login"); // 로그인 페이지로 이동
});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1; /* 툴바 제목의 공간 확장 */
}
</style>
