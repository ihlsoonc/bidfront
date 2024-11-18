<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-center">로그인</div>
        </q-card-section>

        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input
              v-model="userData.query"
              label="전화번호"
              hint="전화번호 11자리"
              filled
              type="tel"
              maxlength="11"
              minlength="11"
              @update:model-value="revalidateUser"
            />
            <q-input
              v-model="userData.password"
              label="암호"
              type="password"
              hint="비밀번호를 입력하세요"
              filled
              @update:model-value="revalidateUser"
            />
          </q-form>
        </q-card-section>
        <q-btn
          @click="handleSubmit"
          type="submit"
          label="로그인"
          color="primary"
        />
        <q-card-section v-if="message">
          <q-banner type="warning">{{ message }}</q-banner>
        </q-card-section>

        <q-card-actions align="around">
          <q-btn
            label="비밀번호 찾기"
            @click="handleNavigate('password', 1)"
            flat
            color="standard"
          />
          <q-btn
            label="비밀번호 변경"
            @click="handleNavigate('password', 2)"
            flat
          />
          <q-btn
            v-if="!isRootUser"
            label="회원가입"
            @click="handleNavigate('register')"
            flat
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, defineEmits } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";
import { fetchLocalSession, fetchSessionUser } from "../utils/sessionFunctions";
import { navigate } from "../utils/navigate";

const router = useRouter();
const emit = defineEmits(["update-status"]);

const userData = ref({ query: "", password: "" });
const isRootUser = ref(false);
const message = ref("");
let localSessionData = {};
let sessionResults = {};

// 버튼 액션 핸들러
const handleNavigate = (action, tab) =>
  navigate(router, localSessionData.userClass, action, { tab });

// 로그인 요청
const handleSubmit = async () => {
  if (!validateInput()) {
    return;
  }

  try {
    const response = await axios.post(
      APIs.USER_LOGIN,
      {
        ...userData.value,
        queryType: "telno",
        table: localSessionData.tableName,
        userClass: localSessionData.userClass,
      },
      { withCredentials: true }
    );

    const currentType = mapUserType(localSessionData.userClass);
    if (currentType === response.data.userType) {
      emit("update-status", { isLoggedIn: true, hasSelectedMatch: false });
      handleNavigate("selectVenue");
    } else {
      handlePermissionError(response.data.userType);
    }
  } catch (error) {
    console.error(
      "----------------------------------로그인 중 오류 발생",
      error
    );
    handleError(error);
  }
};

// 입력 값 유효성 검사
const validateInput = () => {
  if (!userData.value.query.trim()) {
    alert("전화번호를 입력해 주세요.");
    return false;
  }
  if (!userData.value.password.trim()) {
    alert("비밀번호를 입력해 주세요.");
    return false;
  }
  return true;
};

// 권한 오류 처리
const handlePermissionError = (dbUserType) => {
  const currentType = mapUserType(localSessionData.userClass);
  message.value = "현재 시스템에 권한이 없습니다.";
  console.log(
    `현재 시스템에 권한이 없습니다. db Type => ${dbUserType}, 허용된 타입 => ${currentType}`
  );

  resetLoginStatus();
};

// 사용자 유형 매핑
const mapUserType = (userClass) =>
  ({
    user: "U",
    adminm: "M",
    admin: "H",
    default: "unknown",
  }[userClass] || "unknown");

// 세션 로그인 상태 초기화
const resetLoginStatus = () =>
  emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });

// 세션 데이터 확인 및 초기 메시지 설정
const initializeSession = async () => {
  localSessionData = fetchLocalSession(["tableName", "userClass"]);
  isRootUser.value = localSessionData.userClass === "admin";

  sessionResults = await fetchSessionUser(localSessionData.userClass);
  if (sessionResults.success) {
    message.value = `${sessionResults.userName}님은 로그인 상태입니다.`;
    emit("update-status", { isLoggedIn: true, hasSelectedMatch: false });
  } else {
    resetLoginStatus();
    message.value = "로그인 해 주세요";
  }
};

// 오류 메시지 처리
const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

// 입력 변경 감지
const revalidateUser = () => {
  // 세션 데이터와 비교가 필요하면 여기에서 처리
};

onMounted(async () => {
  initializeSession();
});
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}
</style>
