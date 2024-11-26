<template>
  <div class="common-container">
    <h5>새로운 사용자 등록</h5>
    <div class="input-box">
      <!-- 전화번호 입력 -->
      <label>
        전화번호:
        <input
          type="text"
          v-model="userData.telno"
          class="input"
          placeholder="전화번호를 입력하세요."
          minlength="10"
          maxlength="11"
          autocomplete="tel"
          @input="resetTelnoStatus"
        />
      </label>
      <button @click="validateTelno" type="button" :disabled="isValidTelno">
        인증번호 발송
      </button>

      <!-- 인증번호 입력 -->
      <div v-if="authCodeInputMode" class="rowflex-container">
        <input
          type="text"
          v-model="userData.authNumber"
          class="input"
          style="font-size: 23px; margin-right: 10px"
          minlength="6"
          maxlength="6"
          placeholder="인증번호 6자리를 입력하세요."
          @input="checkAuthNumber"
        />
        <button @click="validateTelno" type="button">재발송</button>
      </div>
      <!-- 메시지 박스 -->
      <q-banner v-if="message" class="message-box">{{ message }}</q-banner>
      <!-- 사용자 정보 입력 -->
      <div v-if="isValidTelno">
        <label>
          비밀번호:
          <input
            type="password"
            v-model="userData.password"
            class="input"
            placeholder="비밀번호를 입력하세요."
            autocomplete="new-password"
          />
        </label>
        <label>
          비밀번호 확인:
          <input
            type="password"
            v-model="userData.password2"
            class="input"
            placeholder="비밀번호를 다시 입력하세요."
            autocomplete="new-password"
            @input="checkPassword"
          />
        </label>

        <label>
          사용자 이름:
          <input
            type="text"
            v-model="userData.username"
            class="input"
            placeholder="이름을 입력하세요."
            autocomplete="name"
          />
        </label>

        <label>
          이메일:
          <input
            type="email"
            v-model="userData.email"
            class="input"
            placeholder="이메일을 입력하세요."
            autocomplete="email"
            @input="resetEmailStatus"
          />
        </label>
        <q-btn @click="validateEmail" type="button"> 이메일 유효 확인 </q-btn>

        <label>
          우편번호:
          <input
            type="number"
            v-model="userData.postcode"
            class="input"
            placeholder="우편번호를 입력하세요."
            min="10000"
            max="99999"
            autocomplete="postal-code"
          />
        </label>

        <label>
          주소 1:
          <input
            type="text"
            v-model="userData.addr1"
            class="input"
            placeholder="주소를 입력하세요."
            autocomplete="address-line1"
          />
        </label>
        <label>
          주소 2:
          <input
            type="text"
            v-model="userData.addr2"
            class="input"
            placeholder="세부 주소를 입력하세요."
            autocomplete="address-line2"
          />
        </label>

        <!-- 제출 버튼 -->
        <br /><br />
        <q-btn @click="handleSubmit" color="primary">입력 내용 제출</q-btn>
        <q-btn @click="cancelSubmit" color="secondary">작업 취소</q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import qs from "qs";
import axiosInstance from "../utils/axiosInterceptor";
import { ref } from "vue";
import { fetchLocalSession } from "../utils/sessionFunctions";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

const localSessionData = fetchLocalSession(["userClass"]);

// 사용자 데이터 초기화
const userData = ref({
  userid: "",
  password: "",
  password2: "",
  username: "",
  email: "",
  telno: "",
  postcode: "",
  addr1: "",
  addr2: "",
  role: "",
});
const isValidTelno = ref(false);
const isExistingTelno = ref(false);
const isValidEmail = ref(false);
const isExistingEmail = ref(false);
const authCodeInputMode = ref(false);
const message = ref("");

// 전화번호 인증 관련 함수
const validateTelno = async () => {
  if (!validateTelnoPattern()) return;
  await checkDuplicateTelno();

  if (isExistingTelno.value) {
    alert("등록된 전화번호가 있습니다. 다시 입력해주세요.");
    message.value = "";
    isValidTelno.value = false;
    return;
  }

  userData.value.authNumber = "";
  authCodeInputMode.value = true;

  try {
    const response = await axiosInstance.post(APIs.SEND_ONE_SMS, {
      ...userData.value,
    });
    if (response.status === 200) {
      message.value = `인증번호가 발송되었습니다. ${response.data.verificationCode}`;
    }
  } catch (error) {
    handleError(error);
  }
};

// 전화번호 인증 관련 함수
const validateEmail = async () => {
  if (!validateEmailPattern()) return;
  await checkDuplicateEmail();

  if (isExistingEmail.value) {
    alert("등록된 이메일이 있습니다. 다시 입력해주세요.");
    message.value = "";
    isValidEmail.value = false;
    return;
  }
  alert("사용 가능한 이메일입니다.");
  isValidEmail.value = true;
};

const resetTelnoStatus = () => {
  message.value = "전화번호가 변경되었습니다. 인증번호 발송을 눌러주세요.";
  isValidTelno.value = false;
};

const resetEmailStatus = () => {
  message.value = "이메일이 변경되었습니다. 이메일확인을 눌러주세요.";
  isValidEmail.value = false;
};

const checkAuthNumber = () => {
  if (userData.value.authNumber.length === 6) compareAuthNumber();
};

const compareAuthNumber = async () => {
  try {
    const response = await axiosInstance.post(APIs.VERIFY_CODE, {
      ...userData.value,
    });
    if (response.status === 200) {
      message.value = "인증번호가 확인되었습니다.";
      isValidTelno.value = true;
      authCodeInputMode.value = false;
      userData.value.authNumber = "";
    }
  } catch (error) {
    handleError(error);
  }
};

const checkDuplicateTelno = async () => {
  try {
    const response = await axiosInstance.post(APIs.GET_TELNO_COUNT, {
      telno: userData.value.telno,
    });
    let telnoCount = response.data.telno_count;
    if (telnoCount > 0) {
      isExistingTelno.value = true;
    } else {
      message.value = "사용가능한 전화번호입니다.";
      isExistingTelno.value = false;
    }
  } catch (error) {
    isExistingTelno.value = false;
    handleError(error);
  }
};

const checkDuplicateEmail = async () => {
  try {
    const response = await axiosInstance.post(APIs.GET_EMAIL_COUNT, {
      telno: userData.value.telno,
      email: userData.value.email,
    });
    let emailCount = response.data.email_count;
    if (emailCount > 0) {
      isExistingEmail.value = true;
    } else {
      message.value = "사용가능한 이메일입니다.";
      isExistingEmail.value = false;
    }
  } catch (error) {
    isExistingEmail.value = false;
    handleError(error);
  }
};

const cancelSubmit = async () => {
  isValidTelno.value = false;
  message.value = "";
};
// 제출 함수
const handleSubmit = async () => {
  if (!isValidEmail.value) {
    alert("이메일 유효확인을 해주세요");
    return;
  }
  if (!validateInput()) return;

  userData.value.role = localSessionData.userClass;
  try {
    const response = await axiosInstance.post(
      APIs.REGISTER_USER,
      qs.stringify({
        ...userData.value,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true, // 쿠키와 함께 요청
      }
    );
    if (response.status === 200) {
      message.value = "사용자가 성공적으로 등록되었습니다.";
      isValidTelno.value = false;
    }
  } catch (error) {
    handleError(error);
  }
};
const validateInput = () => {
  const { password, password2, username } = userData.value;
  if (!password) {
    message.value = "비밀번호를 입력해 주세요.";
    return false;
  }
  if (!password2) {
    message.value = "확인 비밀번호를 입력해 주세요.";
    return false;
  }
  if (password !== password2) {
    message.value = "비밀번호가 일치하지 않습니다.";
    return false;
  }
  if (!username) return alert("사용자 이름을 입력해 주세요.") && false;
  return true;
};

const checkPassword = () => {
  const { password, password2, username } = userData.value;
  if (!password) {
    message.value = "비밀번호를 입력해 주세요.";
    return false;
  }
  if (!password2) {
    message.value = "확인 비밀번호를 입력해 주세요.";
    return false;
  }
  if (password !== password2) {
    message.value = "비밀번호가 일치하지 않습니다.";
    return false;
  }
};

const validateTelnoPattern = () => {
  const telnoPattern = /^\d{10,11}$/;
  if (!telnoPattern.test(userData.value.telno)) {
    alert("전화번호는 11자리 숫자로 입력해 주세요.");
    return false;
  }
  return true;
};
const validateEmailPattern = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(userData.value.email)) {
    alert("유효하지 않은 이메일 형식입니다. 확인해 주세요.");
    return false;
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
</script>

<style scoped>
.common-container {
  padding: 20px;
}
.message-box {
  margin-top: 10px;
  color: red;
}
.input-box label {
  display: block;
  margin: 10px 0;
}
</style>
