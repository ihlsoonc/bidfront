<template>
  <q-page class="common-container">
    <q-card class="q-pa-md">
      <q-card-section>
        <q-title level="h5">사용자 등록 및 수정</q-title>
      </q-card-section>

      <q-form @submit.prevent="handleSubmit">
        <!-- 전화번호 입력 -->
        <q-input
          v-model="userData.telno"
          label="전화번호"
          placeholder="전화번호를 입력하세요."
          :rules="[val => (val.length === 11) || '전화번호는 11자리여야 합니다.']"
          @input="checkTelNumber"
          maxlength="11"
        />
        <q-btn @click="handleTelnoCheck" label="인증번호 발송" color="primary" />

        <!-- 인증번호 입력 -->
        <q-input
          v-if="codeInputMode"
          v-model="userData.authNumber"
          label="인증번호"
          placeholder="인증번호 6자리를 입력하세요."
          maxlength="6"
          @input="checkAuthNumber"
        />
        <q-btn v-if="codeInputMode" @click="handleTelnoCheck" label="재발송" color="secondary" />

        <q-banner v-if="telmsg" class="q-mt-md">{{ telmsg }}</q-banner>

        <!-- 암호 입력 -->
        <q-input
          v-model="userData.password"
          label="암호"
          type="password"
          placeholder="암호를 입력하세요."
          :rules="[val => !!val || '암호를 입력해 주세요.']"
        />

        <!-- 사용자 이름 입력 -->
        <q-input
          v-model="userData.userName"
          label="사용자 이름"
          placeholder="이름을 입력하세요."
          :rules="[val => !!val || '이름을 입력해 주세요.']"
        />

        <!-- 이메일 입력 -->
        <q-input
          v-model="userData.email"
          label="이메일"
          type="email"
          placeholder="이메일을 입력하세요."
        />

        <!-- 우편번호 입력 -->
        <q-input
          v-model="userData.postCode"
          label="우편번호"
          type="number"
          placeholder="우편번호를 입력하세요."
          :rules="[val => val && val.length === 5 || '우편번호는 5자리여야 합니다.']"
        />

        <!-- 주소 입력 -->
        <q-input v-model="userData.addr1" label="주소 1" placeholder="주소를 입력하세요." />
        <q-input v-model="userData.addr2" label="주소 2" placeholder="세부 주소를 입력하세요." />

        <!-- 사용자 타입 선택 (관리자용) -->
        <q-select
          v-if="!isUserTable"
          v-model="userData.userType"
          label="사용자 타입"
          :options="adminTypesOptions"
        />

        <q-btn label="입력 내용 제출" type="submit" color="primary" class="q-mt-md" />

        <q-banner v-if="message" class="q-mt-md">{{ message }}</q-banner>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { API, messageCommon, ADMIN_TYPES } from '../utils/messagesAPIs';

export default {
  setup() {
    const userData = ref({
      userId: '',
      password: '',
      userName: '',
      email: '',
      telno: '',
      postCode: '',
      addr1: '',
      addr2: '',
      userType: ''
    });
    const message = ref('');
    const tableName = ref('');
    const isUserTable = ref(false);
    const codeInputMode = ref(false);
    const isValidTelno = ref(false);
    const telmsg = ref('');

    const handleTelnoCheck = async () => {
      userData.value.authNumber = '';
      if (!userData.value.telno) {
        alert("전화번호를 입력해 주세요.");
        return false;
      }

      const telnoPattern = /^\d{11}$/;
      if (!telnoPattern.test(userData.value.telno)) {
        alert("전화번호는 11자리 숫자여야 합니다.");
        return false;
      }
      codeInputMode.value = true;
      try {
        const response = await axios.post(API.SEND_ONE_SMS, { ...userData.value, table: tableName.value });
        if (response.status === 200) {
          telmsg.value = response.data.message + response.data.verificationCode;
          message.value = '';
        }
      } catch (error) {
        telmsg.value = error.response.data;
      }
    };

    const checkTelNumber = () => {
      telmsg.value = "전화번호가 변경되었습니다. 인증번호발송을 눌러주세요.";
      isValidTelno.value = false;
    };

    const checkAuthNumber = () => {
      if (userData.value.authNumber.length === 6) {
        compareAuthNumber();
      }
    };

    const compareAuthNumber = async () => {
      try {
        const response = await axios.post(API.VERIFY_CODE, { ...userData.value, table: tableName.value });
        if (response.status === 200) {
          telmsg.value = response.data.message;
          isValidTelno.value = true;
          codeInputMode.value = false;
          userData.value.authNumber = '';
        }
      } catch (error) {
        telmsg.value = error.response.data;
      }
    };

    const handleSubmit = async () => {
      if (!validateInput(userData.value)) {
        return;
      }
      try {
        const response = await axios.post(API.REGISTER_USER, { ...userData.value, table: tableName.value });
        if (response.status === 200) {
          message.value = '사용자가 성공적으로 등록되었습니다.';
        }
      } catch (error) {
        handleError(error);
      }
    };

    const validateInput = (userData) => {
      const { password, userName, userType } = userData;
      if (!isValidTelno.value) {
        alert("전화번호 인증해 주세요.");
        return false;
      }
      if (!password || password.trim() === "") {
        alert("비밀번호를 입력해 주세요.");
        return false;
      }
      if (!userName || userName.trim() === "") {
        alert("사용자 이름을 입력해 주세요.");
        return false;
      }
      if (tableName.value != 'user' && (!userType || userType.trim() === "")) {
        alert("사용자 타입을 선택해 주세요.");
        return false;
      }
      return true;
    };

    const handleError = (error) => {
      if (error.response) {
        message.value = error.response.data;
      } else if (error.request) {
        message.value = messageCommon.ERR_NETWORK;
      } else {
        message.value = messageCommon.ERR_ETC;
      }
    };

    onMounted(() => {
      const sessiontableName = sessionStorage.getItem('tableName');
      if (sessiontableName) {
        tableName.value = sessiontableName;
      }
      if (tableName.value === 'user') {
        isUserTable.value = true;
      }
    });

    return {
      userData,
      message,
      telmsg,
      isUserTable,
      isValidTelno,
      codeInputMode,
      checkAuthNumber,
      checkTelNumber,
      compareAuthNumber,
      adminTypesOptions: ADMIN_TYPES,
      handleTelnoCheck,
      handleSubmit,
    };
  }
};
</script>

<style scoped>
.common-container {
  padding: 20px;
}

.q-btn {
  margin: 10px 0;
}
</style>
