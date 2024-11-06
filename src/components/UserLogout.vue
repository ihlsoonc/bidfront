<template>
  <div class="common-container">
    <div class="content-container">
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Dialog } from "quasar";
import { handleLink } from "../utils/handleLink";
import { fetchLocalSession } from "../utils/fetchLocalSession";
import { APIs } from "../utils/APIs";

const router = useRouter();
const message = ref("");
let localSessionData = {};

const handleLogout = async () => {
  // 로그아웃 요청 보내기
  await axios.post(APIs.USER_LOGOUT, {}, { withCredentials: true });
  const confirmMessage = `로그아웃하시겠습니까?`;

  Dialog.create({
    title: "입찰시스템",
    message: confirmMessage,
    cancel: true, // '취소' 버튼을 추가
    persistent: true, // 모달 외부를 클릭해도 닫히지 않도록 설정
    ok: {
      label: "예",
      color: "primary",
    },
    cancel: {
      label: "아니오",
      color: "negative",
    },
  })
    .onOk(() => {
      logout();
    })
    .onCancel(() => {
      handleLink(router, localSessionData.userClass, "login");
    });
  handleLink(router, localSessionData.userClass, "login");
};

const logout = async () => {
  try {
    // 로그아웃 요청 보내기
    await axios.post(APIs.USER_LOGOUT, {}, { withCredentials: true });
  } catch (error) {
    message.value = "로그아웃에서 오류가 발생하였습니다: " + error;
  }
};
// 컴포넌트가 마운트되면 로그아웃 함수 호출
onMounted(() => {
  localSessionData = fetchLocalSession(["userClass"]);
  handleLogout();
});
</script>

<style scoped></style>
