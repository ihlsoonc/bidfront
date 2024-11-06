<template>
  <q-layout view="hHh lpR fFf">
    <!-- 헤더 -->
    <NavBarAdminM
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
import NavBarAdminM from "./NavBarAdminM.vue";
import { handleLink } from "../utils/handleLink";
import { setLocalSession } from "../utils/setLocalSession";

export default {
  name: "AdminMHome",
  components: { NavBarAdminM },
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const userClass = "adminm";
    const userTable = "admin";
    const isLoggedIn = ref(false);
    const hasSelectedMatch = ref(false);

    const handleUpdateStatus = (status) => {
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
        tableName: userTable,
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

.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>
