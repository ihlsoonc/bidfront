<template>
  <q-layout view="hHh lpR fFf" class="page-container">
    <!-- NavBarUser 컴포넌트를 추가하여 네비게이션 관리 -->
    <NavBarUser
      :isLoggedIn="isLoggedIn"
      :hasSelectedMatch="hasSelectedMatch"
      @link-action="handleLinkAction"
    />
    <!-- 페이지 컨테이너 -->
    <q-page-container>
      <router-view @update-status="handleUpdateStatus" />
    </q-page-container>
  </q-layout>
</template>
<script>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import NavBarUser from "./NavBarUser.vue";
import { handleLink } from "../utils/handleLink";
import { setLocalSession } from "../utils/setLocalSession";

export default {
  name: "UserHome",
  components: { NavBarUser },
  setup() {
    const userClass = "user";
    const $q = useQuasar();
    const router = useRouter();
    const isLoggedIn = ref(false);
    const hasSelectedMatch = ref(false);

    const handleUpdateStatus = (status) => {
      console.log("Status Updated:", status); // 디버깅용 출력
      isLoggedIn.value = status.isLoggedIn;
      hasSelectedMatch.value = status.hasSelectedMatch;
    };

    const checkLoginStatus = () => {
      if (!isLoggedIn.value) {
        handleLink(router, userClass, "login");
      }
    };
    const handleLinkAction = (action) => {
      handleLink(router, userClass, action);
    };

    onMounted(() => {
      setLocalSession(userClass, {
        tableName: userClass,
        userClass: userClass,
      });
      checkLoginStatus();
    });

    return {
      handleLinkAction,
      isLoggedIn,
      hasSelectedMatch,
      handleUpdateStatus,
    };
  },
};
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}

/* 최대 너비 설정: 1200px로 제한 (모바일 제외) */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.disabled {
  pointer-events: none;
  /* opacity: 0.5; */
}
</style>
