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
              hint="전화번호11자리"
              filled
              type="tel"
              maxlength="11"
              minlength="11"
            />
            <q-input
              v-model="userData.password"
              label="암호"
              type="password"
              hint="비밀번호를 입력하세요"
              filled
            />
            <q-btn
              @click="handleSubmit"
              type="submit"
              label="로그인"
              color="primary"
            />
          </q-form>
        </q-card-section>

        <q-card-section v-if="message">
          <q-banner type="warning">{{ message }}</q-banner>
        </q-card-section>

        <q-card-actions align="around">
          <q-btn
            label="비밀번호 찾기"
            @click="handleFindPassword"
            flat
            color="standard"
          />
          <q-btn label="비밀번호 변경" @click="handleChangePassword" flat />
          <div v-if="isNotAdmin">
            <q-btn label="회원가입" @click="handleRegister" flat />
          </div>
          <q-btn label="알림톡" @click="handleSendAlimTalk" flat />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";
import { fetchLocalSession } from "../utils/fetchLocalSession";
import { fetchSessionUser } from "../utils/fetchSessionUser";
import { handleLink } from "../utils/handleLink";

const router = useRouter();
const emit = defineEmits(["update-status"]);
const userData = ref({
  query: "",
  password: "",
});
const isNotAdmin = ref(false);
const message = ref("");
let localSessionData = {};

const handleFindPassword = () => {
  handleLink(router, localSessionData.userClass, "password", { tab: 1 });
};

const handleChangePassword = () => {
  handleLink(router, localSessionData.userClass, "password", { tab: 2 });
};

const handleRegister = () => {
  handleLink(router, localSessionData.userClass, "register");
};

const handleGotoSelect = () => {
  handleLink(router, localSessionData.userClass, "selectVenue");
};

const handleBackToLogin = () => {
  handleLink(router, localSessionData.userClass, "login");
};

const handleSendAlimTalk = async () => {
  await axios.post(
    APIs.SEND_KAKAO_ALIMTALK,
    { query: userData.value.query, queryType: "telno" },
    { withCredentials: true }
  );
};

const handleSubmit = async () => {
  message.value = "";
  const userTypeMap = {
    user: "U",
    adminm: "M",
    admin: "H",
    default: "unknown",
  };

  try {
    if (!validateInput(userData.value)) return;

    const response = await axios.post(
      APIs.USER_LOGIN,
      {
        query: userData.value.query,
        queryType: "telno",
        password: userData.value.password,
        table: localSessionData.tableName,
        userClass: localSessionData.userClass,
      },
      { withCredentials: true }
    );
    console.log("======================================================");
    if (response.status === 200) {
      if (response.data.userType !== userTypeMap[localSessionData.userClass]) {
        message.value = `현재 시스템에 권한이 없습니다. db Type => ${
          response.data.userType
        } ${userTypeMap[localSessionData.userClass]}`;
        resetLoginStatus();
        return;
      } else {
        handleGotoSelect();
      }
    }
  } catch (error) {
    handleError(error);
  }
};

const validateInput = ({ query, password }) => {
  const isQueryValid = query?.trim();
  const isPasswordValid = password?.trim();

  if (!isQueryValid) {
    alert("전화번호를 입력해 주세요.");
    return false;
  }

  if (!isPasswordValid) {
    alert("비밀번호를 입력해 주세요.");
    return false;
  }

  return true;
};

const resetLoginStatus = () => {
  emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });
};

watch(() => userData.value.query, resetLoginStatus);
watch(() => userData.value.password, resetLoginStatus);

const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

onMounted(async () => {
  localSessionData = fetchLocalSession(["tableName", "userClass"]);
  isNotAdmin.value = localSessionData.userClass !== "admin";
  const sessionResults = await fetchSessionUser(localSessionData.userClass);
  if (sessionResults.success) {
    message.value = `${sessionResults.userName}님은 로그인 상태입니다. (User Class: ${sessionResults.userClass})`;
    emit("update-status", { isLoggedIn: true, hasSelectedMatch: false });
  } else {
    resetLoginStatus();
    handleBackToLogin();
  }
});
</script>

<style scoped>
/* 스타일을 Quasar에 맞게 조정할 수 있습니다. */
</style>
