<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-center">로그인</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleSubmit" class="q-gutter-md">
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
            <q-btn type="submit" label="로그인" color="primary" />
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
          <q-btn label="회원가입" @click="handleRegister" flat />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { API, url, messageCommon } from "../utils/messagesAPIs";

export default {
  setup(props, { emit }) {
    const userData = ref({
      query: "",
      password: "",
    });
    const sessionTelno = ref("");
    const sessionUserName = ref("");
    const tableName = ref("");
    const message = ref("");
    const router = useRouter();

    const handleFindPassword = () => {
      if (tableName.value === "user") {
        router.push({ path: url.changeUserPassword, query: { tab: 1 } });
      } else {
        router.push({ path: url.changeAdminPassword, query: { tab: 1 } });
      }
    };

    const handleChangePassword = () => {
      router.push({
        path:
          tableName.value === "user"
            ? url.changeUserPassword
            : url.changeAdminPassword,
        query: { tab: 2 },
      });
    };

    const handleRegister = () => {
      router.push(
        tableName.value === "user" ? url.registerUser : url.registerAdmin
      );
    };

    const handleSubmit = async () => {
      message.value = "";
      try {
        if (!validateInput(userData.value)) {
          return;
        }

        const response = await axios.post(
          API.USER_LOGIN,
          {
            query: userData.value.query,
            password: userData.value.password,
            table: tableName.value,
            queryType: "telno",
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          emit("update-status", { isLoggedIn: true, hasSelectedMatch: false });
          router.push(
            tableName.value === "user"
              ? url.selectVenueUser
              : url.selectVenueAdmin
          );
        }
      } catch (error) {
        handleError(error);
      }
    };

    const validateInput = (data) => {
      const { query, password } = data;
      if (!query || query.trim() === "") {
        alert("사용자 아이디 또는 전화번호를 입력해 주세요.");
        return false;
      }

      if (!password || password.trim() === "") {
        alert("비밀번호를 입력해 주세요.");
        return false;
      }

      return true;
    };

    const resetSetting = () => {
      userData.value = { query: "", password: "" };
      emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });
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

    const fetchSessionTableName = () => {
      const sessiontableName = sessionStorage.getItem("tableName");
      if (sessiontableName) {
        tableName.value = sessiontableName;
      }
    };

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, {
          withCredentials: true,
        });
        if (response.status === 200) {
          sessionTelno.value = response.data.telno;
          sessionUserName.value = response.data.userName;
          emit("update-status", { isLoggedIn: true, hasSelectedMatch: false });
        } else {
          message.value = `로그인 해주세요.`;
          resetSetting();
        }
      } catch (error) {
        message.value = `로그인 해주세요.`;
        resetSetting();
      }
    };

    onMounted(() => {
      fetchSessionTableName();
      resetSetting();
      fetchSessionUserId();
    });

    return {
      userData,
      sessionTelno,
      sessionUserName,
      message,
      tableName,
      handleSubmit,
      handleFindPassword,
      handleChangePassword,
      handleRegister,
    };
  },
};
</script>

<style scoped>
/* 스타일을 Quasar에 맞게 조정할 수 있습니다. */
</style>
