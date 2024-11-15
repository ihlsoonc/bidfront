<template>
  <q-layout view="hHh lpR fFf">
    <!-- 네비게이션 바 컴포넌트 -->
    <NavBarAdminM
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
import NavBarAdminM from "./NavBarAdminM.vue"; // 네비게이션 바 컴포넌트
import { navigate } from "../utils/navigate"; // 페이지 이동 유틸리티 함수
import { setLocalSession } from "../utils/sessionFunctions"; // 세션 설정 유틸리티 함수

// Quasar와 Vue Router 인스턴스 생성
const $q = useQuasar();
const router = useRouter();

// 사용자 클래스와 테이블 이름 정의
const userClass = "adminm"; // 네비게이션 경로용 사용자 클래스
const userTable = "admin"; // 조회시 사용자 테이블명

// 상태 관리 변수
const isLoggedIn = ref(false); // 로그인 상태
const hasSelectedMatch = ref(false); // 경기 선택 상태

// 상태 업데이트 함수
const handleUpdateStatus = (status) => {
  isLoggedIn.value = status.isLoggedIn; // 로그인 상태 업데이트
  hasSelectedMatch.value = status.hasSelectedMatch; // 경기 선택 상태 업데이트
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
    // 로그아웃 API 호출
    await axios.post(APIs.USER_LOGOUT, {}, { withCredentials: true });
    resetLoginStatus(); // 로그인 상태 초기화
  } catch (error) {
    alert("시스템 오류입니다.");
  } finally {
    handleNavigate("login"); // 로그아웃 후 로그인 페이지로 이동
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

// 컴포넌트가 마운트될 때 실행
onMounted(() => {
  // 사용자 세션 설정
  setLocalSession(userClass, {
    tableName: userTable, // 테이블 이름 설정
    userClass: userClass, // 사용자 클래스 설정
  });
  handleNavigate("login"); // 초기 로그인 페이지로 이동
});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1; /* 툴바 제목의 공간을 확장하여 레이아웃을 정리 */
}
</style>
