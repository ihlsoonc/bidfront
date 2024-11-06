<template>
  <q-layout view="hHh lpR fFf">
    <!-- NavBarUser 컴포넌트를 추가하여 네비게이션 관리 -->
    <NavBarAdmin
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
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import NavBarAdmin from "./NavBarAdmin.vue";
import { handleLink } from "../utils/handleLink";
import { setLocalSession } from "../utils/setLocalSession";

export default {
  name: "AdminHome",
  components: { NavBarAdmin },
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const userClass = "admin";
    const isLoggedIn = ref(false);
    const hasSelectedMatch = ref(false);
    const leftDrawerOpen = ref(false);

    const handleUpdateStatus = (status) => {
      isLoggedIn.value = status.isLoggedIn;
      hasSelectedMatch.value = status.hasSelectedMatch;
    };

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
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
      toggleLeftDrawer,
      leftDrawerOpen,
    };
  },
};
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}
</style>
