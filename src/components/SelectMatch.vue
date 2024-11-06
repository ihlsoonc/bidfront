<template>
  <q-page class="common-container q-pa-md">
    <div v-if="!matchArray || matchArray.length == 0">
      현재 정보가 없습니다.
    </div>
    <q-list v-if="matchArray && matchArray.length > 0">
      <q-card
        v-for="(match, index) in matchArray"
        :key="index"
        @click="handleSelectMatch(index)"
        :class="{ 'bg-primary text-white': selectedButton === index }"
        class="q-mb-md q-pa-md match-card"
        clickable
        bordered
      >
        <q-card-section>
          <div class="text-h6">
            {{ match.match_name }} {{ match.round }} : {{ match.venue_name }}
          </div>
          <q-separator spaced />

          <div>
            <strong>경기번호:</strong> {{ match.match_no }} {{ match.statusCode
            }}<br />
            <strong>경기 일시:</strong> {{ match.start_date }}일
            {{ match.start_time }} ~ {{ match.end_time }}<br />
            <strong>입찰 기간:</strong>
            {{ formatTimeToLocal(match.bid_open_datetime) }} ~
            {{ formatTimeToLocal(match.bid_close_datetime) }}
          </div>

          <q-separator spaced v-if="isAdmin" />
          <div v-if="isAdmin">
            <strong>승인 상태:</strong>
            {{ match.approved === "Y" ? "승인" : "미승인" }}
          </div>
        </q-card-section>
      </q-card>
    </q-list>
    <q-banner v-if="message" class="q-mt-md" type="warning">
      {{ message }}
    </q-banner>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";
import { fetchLocalSession } from "../utils/fetchLocalSession";
import { setLocalSession } from "../utils/setLocalSession";
import { fetchSessionUser } from "../utils/fetchSessionUser";
import { handleLink } from "../utils/handleLink";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

export default {
  setup(props, { emit }) {
    // 상수 및 설정 관련 변수
    const apiMap = {
      U: "GET_ALL_APPROVED_MATCHES", // 일반 사용자
      H: "GET_ALLMATCHES", // 총괄 관리자
      M: "GET_MYMATCHES", // 대회 등록자
    };
    const router = useRouter();

    // 세션 관련 변수
    let sessionResults = {};
    let localSessionData = {};

    // 반응형 변수
    const isAdmin = ref(false);
    const matchArray = ref([]);
    const selectedButton = ref(null);
    const message = ref("");

    const fetchMatches = async () => {
      const selectedApi = apiMap[sessionResults.userType];
      try {
        const response = await axios.get(APIs[selectedApi], {
          params: {
            telno: sessionResults.telno,
            venueCd: localSessionData.venueCd,
          },
        });
        matchArray.value = response.data.map((match) => ({
          ...match,
          statusCode: getBidStatus(
            match.bid_open_datetime,
            match.bid_close_datetime,
            match.bid_open_status
          ),
        }));
      } catch (error) {
        handleError(error);
      }
    };

    const getBidStatus = (
      bid_open_datetime,
      bid_close_datetime,
      bid_open_status
    ) => {
      if (bid_open_status === "F") return "낙찰종료";
      if (!bid_open_datetime || !bid_close_datetime) return "상태 정보 없음";

      const now = new Date();
      const bidOpenDate = new Date(bid_open_datetime);
      const bidCloseDate = new Date(bid_close_datetime);

      if (now < bidOpenDate) return "입찰 시작 전";
      if (now > bidCloseDate) return "입찰 종료";
      return "입찰 중";
    };

    const handleSelectMatch = (index) => {
      const match = matchArray.value[index];
      setLocalSession(localSessionData.userClass, {
        matchNumber: match.match_no,
      });
      selectedButton.value = selectedButton.value === index ? null : index;
      message.value = "";
      emit("update-status", {
        isLoggedIn: true,
        hasSelectedMatch: true,
      });
      handleLink(router, localSessionData.userClass, "bids");
    };

    const handleBackToLogin = () => {
      handleLink(router, localSessionData.userClass, "login");
    };

    const resetLoginStatus = () => {
      emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });
    };

    const handleError = (error) => {
      message.value = error.response
        ? error.response.data
        : error.request
        ? messageCommon.ERR_NETWORK
        : messageCommon.ERR_ETC;
    };

    onMounted(async () => {
      localSessionData = fetchLocalSession([
        "tableName",
        "userClass",
        "venueCd",
      ]);
      if (localSessionData.tableName === "admin") {
        isAdmin.value = true;
      }
      sessionResults = await fetchSessionUser(localSessionData.userClass);
      if (!sessionResults.success) {
        resetLoginStatus();
        handleBackToLogin();
      }
      await fetchMatches();
    });

    return {
      isAdmin,
      matchArray,
      selectedButton,
      message,
      formatTimeToLocal,
      handleSelectMatch,
    };
  },
};
</script>

<style scoped>
.match-card {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.bg-primary {
  background-color: #1976d2 !important;
}

.text-white {
  color: white !important;
}

.q-mb-md {
  margin-bottom: 16px;
}

.q-mt-md {
  margin-top: 16px;
}

.q-banner {
  text-align: center;
}

@media (max-width: 600px) {
  .match-card {
    font-size: 14px;
  }
}
</style>
