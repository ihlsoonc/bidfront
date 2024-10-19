<template>
  <div class="common-container">
    <div class="content-container">
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { API, url } from "../utils/messagesAPIs"; // API 및 URL 임포트

export default {
  setup(props, { emit }) {
    const tableName = ref("");
    const message = ref("");
    const router = useRouter();

    const handleLogout = async () => {
      emit("update-status", {
        isLoggedIn: false, // 상태에 맞는 값 설정
        hasSelectedMatch: false,
      });
      try {
        // 로그아웃 요청 보내기
        await axios.post(API.USER_LOGOUT, {}, { withCredentials: true });
      } catch (error) {
        console.error("Logout error:", error);
      }

      if (tableName.value == "user") {
        router.push(url.userLogin);
      } else {
        router.push(url.adminLogin);
      }
    };

    const fetchSessionTableName = () => {
      const sessiontableName = sessionStorage.getItem("tableName");
      if (sessiontableName) {
        tableName.value = sessiontableName;
      }
    };
    // 컴포넌트가 마운트되면 로그아웃 함수 호출
    onMounted(() => {
      fetchSessionTableName();
      handleLogout();
    });

    return {
      message,
      handleLogout,
    };
  },
};
</script>

<style scoped></style>
