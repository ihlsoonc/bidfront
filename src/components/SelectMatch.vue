<template>
  <q-page class="common-container q-pa-md">
    <div v-if="!matchArray || matchArray.length == 0">
      현재 정보가 없습니다.
    </div>
    <q-list v-if="matchArray && matchArray.length > 0">
      <q-card
        v-for="(match, index) in matchArray"
        :key="index"
        @click="handleSelect(index)"
        :class="{ 'bg-primary text-white': selectedButton === index }"
        class="q-mb-md q-pa-md match-card"
        clickable
        bordered
      >
        <q-card-section>
          <div class="text-h6">{{ match.match_name }} {{ match.round }}</div>
          <div>{{ match.venue_name }}</div>
          <q-separator spaced />

          <div>
            <strong>경기번호:</strong> {{ match.match_no }}<br />
            <strong>상태:</strong> {{ match.statusCode }}<br />
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
import { useRouter } from "vue-router";
import axios from "axios";
import { url, API, messageCommon } from "../utils/messagesAPIs";
import { formatTimeToLocal } from "../utils/commonFunction.js";

export default {
  setup(props, { emit }) {
    const sessionTelno = ref("");
    const sessionUserType = ref("");
    const isAdmin = ref(false);
    const tableName = ref("");
    const matchArray = ref([]);
    const selectedButton = ref(null);
    const message = ref("");
    const router = useRouter();

    const fetchMatches = async () => {
      let api;
      if (tableName.value === "user") {
        api = "GET_ALL_APPROVED_MATCHES";
      } else if (tableName.value === "admin") {
        api = "GET_ALLMATCHES";
      }
      try {
        const response = await axios.get(API[api], {
          params: {
            telno: sessionTelno.value,
            userType: sessionUserType.value,
          },
        });
        if (response.status === 200) {
          matchArray.value = response.data.map((match) => {
            const { bid_open_datetime, bid_close_datetime, bid_open_status } =
              match;

            let statusCode = "";
            if (bid_open_status === "F") {
              statusCode = "낙찰종료";
            } else if (bid_open_datetime && bid_close_datetime) {
              const bidOpenDate = new Date(bid_open_datetime);
              const bidCloseDate = new Date(bid_close_datetime);
              const now = new Date();

              if (now < bidOpenDate) {
                statusCode = "입찰 시작 전";
              } else if (now > bidCloseDate) {
                statusCode = "입찰 종료";
              } else {
                statusCode = "입찰 중";
              }
            } else {
              statusCode = "상태 정보 없음";
            }

            return {
              ...match,
              statusCode,
            };
          });
        }
      } catch (error) {
        handleError(error);
      }
    };

    const handleSelect = (index) => {
      const match = matchArray.value[index];
      sessionStorage.setItem("matchNumber", match.match_no);
      selectedButton.value = selectedButton.value === index ? null : index;
      message.value = "";
      emit("update-status", {
        isLoggedIn: true,
        hasSelectedMatch: true,
      });
      if (tableName.value === "user") {
        router.push(url.bidSeats);
      } else if (tableName.value === "admin") {
        router.push(url.bidResults);
      }
    };

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, {
          withCredentials: true,
        });

        if (response.data == "200") {
          sessionTelno.value = response.data.telno;
          sessionUserType.value = response.data.userType;
        }
      } catch (error) {
        alert("로그인이 필요합니다.");
        router.push(url.adminLogin);
      }
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

    onMounted(async () => {
      const sessiontableName = sessionStorage.getItem("tableName");
      if (sessiontableName) {
        tableName.value = sessiontableName;
      }
      if (tableName.value === "admin") {
        isAdmin.value = true;
      }

      await fetchSessionUserId();
      await fetchMatches();
    });

    return {
      sessionTelno,
      sessionUserType,
      isAdmin,
      matchArray,
      selectedButton,
      message,
      formatTimeToLocal,
      handleSelect,
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
