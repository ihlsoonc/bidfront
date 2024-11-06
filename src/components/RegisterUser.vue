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
      <button @click="handleTelnoCheck" type="button" :disabled="isValidTelno">
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
        <button @click="handleTelnoCheck" type="button">재발송</button>
      </div>

      <!-- 사용자 정보 입력 -->
      <div v-if="isValidTelno">
        <label>
          암호:
          <input
            type="password"
            v-model="userData.password"
            class="input"
            placeholder="암호를 입력하세요."
            autocomplete="new-password"
          />
        </label>

        <label>
          사용자 이름:
          <input
            type="text"
            v-model="userData.userName"
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
          />
        </label>

        <label>
          우편번호:
          <input
            type="number"
            v-model="userData.postCode"
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
        <button @click="handleSubmit" type="button">입력 내용 제출</button>
      </div>
    </div>
    <!-- 메시지 박스 -->
    <div v-if="message" class="message-box">{{ message }}</div>
  </div>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { fetchLocalSession } from "../utils/fetchLocalSession";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

export default {
  setup() {
    const userData = ref({
      userId: "",
      password: "",
      userName: "",
      email: "",
      telno: "",
      postCode: "",
      addr1: "",
      addr2: "",
      userType: "",
    });

    const message = ref("");
    const isValidTelno = ref(false);
    const authCodeInputMode = ref(false);
    const isExistingTelno = ref(false);
    const localSessionData = fetchLocalSession(["tableName", "userClass"]);

    // 전화번호 인증 관련 함수
    const handleTelnoCheck = async () => {
      if (!validateTelno()) return;
      await checkDuplicateId();

      if (isExistingTelno.value) {
        alert("등록된 전화번호가 있습니다. 다시 입력해주세요.");
        message.value = "";
        isValidTelno.value = false;
        return;
      }

      userData.value.authNumber = "";
      authCodeInputMode.value = true;

      try {
        const response = await axios.post(APIs.SEND_ONE_SMS, {
          ...userData.value,
          table: localSessionData.tableName,
        });
        if (response.status === 200) {
          message.value = `인증번호가 발송되었습니다. ${response.data.verificationCode}`;
        }
      } catch (error) {
        handleError(error);
      }
    };

    const resetTelnoStatus = () => {
      message.value = "전화번호가 변경되었습니다. 인증번호 발송을 눌러주세요.";
      isValidTelno.value = false;
    };

    const checkAuthNumber = () => {
      if (userData.value.authNumber.length === 6) compareAuthNumber();
    };

    const compareAuthNumber = async () => {
      try {
        const response = await axios.post(APIs.VERIFY_CODE, {
          ...userData.value,
          table: localSessionData.tableName,
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

    // 유효성 검사
    const validateTelno = () => {
      const telnoPattern = /^\d{10,11}$/;
      if (!telnoPattern.test(userData.value.telno)) {
        alert("전화번호는 11자리 숫자로 입력해 주세요.");
        return false;
      }
      return true;
    };

    const checkDuplicateId = async () => {
      try {
        const response = await axios.post(APIs.GET_USER_BY_TELNO, {
          telno: userData.value.telno,
          table: localSessionData.tableName,
        });
        isExistingTelno.value = response.status === 200;
      } catch (error) {
        isExistingTelno.value = false;
        if (error.response && error.response.status === 404) {
          // 404 오류일 경우 전화번호가 중복되지 않았음을 의미
          isExistingTelno.value = false;
        } else {
          // 다른 오류일 경우 일반 오류 처리
          handleError(error);
        }
      }
    };

    const validateInput = () => {
      const { password, userName } = userData.value;
      if (!password) return alert("비밀번호를 입력해 주세요.") && false;
      if (!userName) return alert("사용자 이름을 입력해 주세요.") && false;
      return true;
    };

    // 제출 함수
    const handleSubmit = async () => {
      if (!validateInput()) return;

      try {
        const response = await axios.post(APIs.REGISTER_USER, {
          ...userData.value,
          table: localSessionData.tableName,
        });
        if (response.status === 200) {
          message.value = "사용자가 성공적으로 등록되었습니다.";
          isValidTelno.value = false;
        }
      } catch (error) {
        handleError(error);
      }
    };

    // 에러 처리 함수
    const handleError = (error) => {
      message.value = error.response
        ? error.response.data
        : error.request
        ? messageCommon.ERR_NETWORK
        : messageCommon.ERR_ETC;
    };

    return {
      userData,
      message,
      isValidTelno,
      authCodeInputMode,
      handleTelnoCheck,
      handleSubmit,
      checkAuthNumber,
      resetTelnoStatus,
    };
  },
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
