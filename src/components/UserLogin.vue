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
import { fetchLocalSession, setLocalSession } from "../utils/sessionFunctions";
import axiosInstance from "../utils/axiosInterceptor";
import { navigate } from "../utils/navigate";
import qs from "qs";
const token = localStorage.getItem("authToken");
const router = useRouter();
const emit = defineEmits(["update-status"]);

const userData = ref({ query: "", password: "" });
const isRootUser = ref(false);
const message = ref("");
const localSessionData = fetchLocalSession(["userClass"]);

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
      APIs.LOGIN,
      qs.stringify({
        username: userData.value.query, // spring security용 사용자 이름 (사용자 전화번호)
        password: userData.value.password, // spring security용 비밀번호
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // login, register는 urlencoded로 보냄
        },
        withCredentials: true, // 쿠키와 함께 요청
      }
    );

    // 응답에서 토큰 추출
    const newAccess = response.headers["authorization"]?.replace("Bearer ", "");
    const newRefresh = response.data.refresh;

    // 응답 출력 :서버에서 refresh는 body와 쿠키로 보내줌(쿠키로 보내는 경우 axios interceptor reissue에서 )
    // const cookies = response.headers["set-cookie"];
    // console.log("Set-Cookie 헤더에서 추출한 쿠키:", cookies);
    // const refreshToken = getCookie("refresh", ctx);
    // if (!refreshToken) {
    //   alert("no refresh in cookie");
    // } else {
    //   console.log("refresh in cookie", refresh);
    // }
    if (newAccess && newRefresh) {
      // 토큰을 localStorage에 저장
      localStorage.setItem("authToken", newAccess);
      localStorage.setItem("refresh", newRefresh);
      localStorage.setItem("telno", response.data.telno);
      setLocalSession(localSessionData.userClass, {
        telno: response.data.telno,
        role: response.data.role,
        username: response.data.username,
      });
    } else {
      message.value = "서버에 오류가 발생하였습니다. (토큰 발급 에러)";
      return;
    }
    const getCookie = async () => {
      // 브라우저의 쿠키 문자열을 가져옴
      const cookies = document.cookie;

      if (!cookies) return null; // 쿠키가 없는 경우 null 반환

      // 쿠키 문자열을 세미콜론으로 분리하여 배열로 변환
      const cookieArray = cookies.split(";");

      // 요청한 쿠키 이름을 검색
      for (let cookie of cookieArray) {
        const [name, value] = cookie.trim().split("=");
        if (name === cookieName) {
          return decodeURIComponent(value); // 값을 URI 디코딩하여 반환
        }
      }

      return null; // 쿠키를 찾지 못한 경우 null 반환
    };

    const requiredRole = localSessionData.userClass;
    if (requiredRole === "user") {
      // 모든 권한을 가진 사용자가 이용가능
      emit("update-status", { isLoggedIn: true, hasSelectedMatch: false });
      handleNavigate("selectVenue");
    }
    // 그외에는 요구되는 권한과 조회된 사용자의 권한이 같아야함. required role이 admin, adminm(대회등록자)
    if (requiredRole === response.data.role) {
      emit("update-status", { isLoggedIn: true, hasSelectedMatch: false });
      handleNavigate("selectVenue");
    } else {
      handlePermissionError(response.data.role);
    }
  } catch (error) {
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
const handlePermissionError = (roleInDB) => {
  const requiredRole = localSessionData.userClass;
  message.value = "현재 시스템에 권한이 없습니다.";
  console.log(
    `현재 시스템에 권한이 없습니다. db Type => ${roleInDB}, 허용된 타입 => ${requiredRole}`
  );

  resetLoginStatus();
};

// 세션 로그인 상태 초기화
const resetLoginStatus = () =>
  emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });

// 세션 데이터 확인 및 초기 메시지 설정
const initializeSession = async () => {
  fetchLocalSession(["userClass", "venueCd"]);
  isRootUser.value = localSessionData.userClass === "admin";
  // const refreshToken = getCookie("refresh", ctx);
  // if (!refreshToken) {
  //   alert("no refresh in cookie");
  // } else {
  //   console.log("refresh in cookie", refresh);
  // }
  if (token) {
    alert("현재 로그인 상태입니다.");
    emit("update-status", { isLoggedIn: true });
  }
};

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
