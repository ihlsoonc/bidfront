<template>
  <q-page class="common-container q-pa-md">
    <h6>사용자 조회 및 수정</h6>

    <!-- 사용자 조회 폼 -->
    <q-form @submit.prevent="handleSearch">
      <q-input
        v-model="searchQuery"
        label="전화번호"
        placeholder="전화번호를 입력하세요."
        outlined
        minlength="11"
        maxlength="11"
        autocomplete="tel"
        :readonly="updateMode"
        class="q-mb-md"
      />

      <q-input
        v-model="password"
        label="비밀번호"
        placeholder="비밀번호 입력"
        type="password"
        outlined
        :readonly="updateMode"
        class="q-mb-md"
      />
      <q-banner v-if="message" type="info">{{ message }}</q-banner>
      <br />
      <q-btn type="submit" label="조회" color="primary" class="full-width" />
    </q-form>

    <!-- 사용자 정보 수정 폼 -->
    <div v-if="updateMode && userData" class="q-mt-lg">
      <q-form @submit.prevent="handleUpdate">
        <q-input
          v-model="userData.username"
          label="사용자 이름"
          placeholder="사용자 이름 수정"
          outlined
          class="q-mb-md"
        />

        <q-input
          v-model="userData.email"
          label="이메일"
          placeholder="이메일 수정"
          outlined
          type="email"
          class="q-mb-md"
          @change="handleEmailChange"
        />
        <q-btn
          label="이메일 유효 확인"
          color="primary"
          @click="handleEmailCheck"
          class="q-mb-md"
        />

        <q-input
          v-model="userData.postcode"
          label="우편번호"
          placeholder="우편번호 수정"
          outlined
          minlength="5"
          maxlength="5"
          class="q-mb-md"
        />

        <q-input
          v-model="userData.addr1"
          label="주소"
          placeholder="주소 수정"
          outlined
          class="q-mb-md"
        />

        <q-input
          v-model="userData.addr2"
          label="상세 주소"
          placeholder="상세 주소 수정"
          outlined
          class="q-mb-md"
        />

        <q-select
          v-if="isAdmin"
          v-model="userData.userType"
          :options="adminTypesOptions"
          label="사용자 타입"
          outlined
          class="q-mb-md"
        />

        <q-btn
          type="submit"
          label="수정 내용 제출"
          color="primary"
          class="full-width q-mb-md"
        />
        <q-btn
          type="reset"
          label="취소"
          color="warning"
          outline
          class="full-width"
          @click="handleReset"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { fetchLocalSession } from "../utils/fetchLocalSession";
import { fetchSessionUser } from "../utils/fetchSessionUser";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";
import { ADMIN_TYPES } from "../utils/ADMIN_TYPES";

// 상수 및 세션 관련 변수 선언
let localSessionData = {};
let userClass = "";

// 입력 및 상태 관련 ref 선언
const searchQuery = ref(""); // 검색어 (사용자 ID 또는 전화번호)
const password = ref(""); // 비밀번호
const updateMode = ref(false);
const isAdmin = ref(false);
const validEmail = ref(true);
const userData = ref(null); // 조회된 사용자 정보
const passwordMsg = ref(""); // 비밀번호 관련 메시지
const message = ref(""); // 상태 메시지

// 사용자 타입 옵션 설정
const adminTypesOptions = Object.keys(ADMIN_TYPES).map((key) => ({
  label: ADMIN_TYPES[key],
  value: key,
}));

// 사용자 정보 조회 함수
const handleSearch = async () => {
  try {
    const response = await axios.post(APIs.GET_USER_INFO, {
      query: searchQuery.value,
      password: password.value,
      queryType: "telno",
      table: localSessionData.tableName,
    });

    if (response.status === 200 && response.data) {
      userData.value = response.data; // 조회된 사용자 정보 저장
      passwordMsg.value = "";
      message.value = "사용자 정보가 조회되었습니다.";
      updateMode.value = true;
    }
  } catch (error) {
    handleError(error);
  }
};

// 사용자 정보 수정 함수
const handleUpdate = async () => {
  if (!validateInput(userData)) return;

  try {
    const response = await axios.post(APIs.UPDATE_USER, {
      ...userData.value,
      table: localSessionData.tableName,
    });

    if (response.status === 200) {
      message.value = "사용자 정보가 성공적으로 수정되었습니다.";
      updateMode.value = false;
    }
  } catch (error) {
    handleError(error);
  }
};

// 이메일 유효 확인 및 수정 처리
const handleEmailChange = () => {
  validEmail.value = false;
};

const handleEmailCheck = () => {
  const email = userData.value.email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("유효한 이메일 형식을 입력해 주세요.");
    return;
  }
  validEmail.value = true;
};

// 입력값 검증 함수
const validateInput = (userData) => {
  const { username, email, telno, postcode } = userData.value;

  if (!username || username.trim() === "") {
    alert("사용자 이름을 입력해 주세요.");
    return false;
  }

  if (!telno) {
    alert("전화번호를 입력해 주세요.");
    return false;
  }

  const telnoPattern = /^\d{10,11}$/;
  if (!telnoPattern.test(telno)) {
    alert("전화번호는 10자리 또는 11자리 숫자여야 합니다.");
    return false;
  }

  if (!email || email.trim() === "") {
    alert("이메일을 입력해 주세요.");
    return false;
  }

  if (!validEmail.value) {
    alert("이메일 유효 확인을 해주세요.");
    return false;
  }

  if (postcode && postcode.trim() !== "") {
    const postcodePattern = /^\d{5}$/;
    if (!postcodePattern.test(postcode)) {
      alert("우편번호는 5자리 숫자여야 합니다.");
      return false;
    }
  }
  return true;
};

// 에러 처리 함수
const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

// 초기화 함수
const handleReset = () => {
  updateMode.value = false;
  message.value = "";
};

const handleBackToLogin = () => {
  handleLink(router, localSessionData.userClass, "login");
};

const resetLoginStatus = () => {
  emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });
};

// onMounted에서 테이블 이름 설정
onMounted(async () => {
  localSessionData = fetchLocalSession(["tableName", "userClass"]);
  const sessionResults = await fetchSessionUser(localSessionData.userClass);
  if (!sessionResults.success) {
    resetLoginStatus();
    handleBackToLogin();
  }
  isAdmin.value = localSessionData.tableName === "admin";
  passwordMsg.value = "사용자 정보 수정을 위해 비밀번호를 입력해주세요.";
});
</script>

<style scoped></style>
