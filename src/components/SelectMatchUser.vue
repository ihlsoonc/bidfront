<template>
  <q-page class="common-container q-pa-md">
    <q-card v-if="!matchArray || matchArray.length === 0">
      <br />
      <br />
      <br />
      <q-banner>현재 대회 정보가 없습니다.</q-banner>
      <br />
      <br />
      <br />
    </q-card>
    <!-- @click="handleSelectMatch(index)" -->
    <q-list v-if="matchArray && matchArray.length > 0">
      <q-card
        v-for="(match, index) in matchArray"
        :key="index"
        :class="{ 'bg-primary text-white': selectedButton === index }"
        class="q-mb-md q-pa-md match-card"
        clickable
        bordered
        @click="handleSelectMatch(index)"
      >
        <q-card-section>
          <div class="text-h6">
            {{ match.match_name }} {{ match.round }} : {{ match.venue_name }}
          </div>
          <q-separator spaced />

          <div>
            <strong>경기번호:</strong> {{ match.match_no }}
            {{ match.bid_status_name }} <br />
            <strong>경기 일시:</strong> {{ match.start_date }}일
            {{ match.start_time }} ~ {{ match.end_time }}<br />
            <strong>입찰 기간:</strong>
            {{ formatTimeToLocal(match.bid_open_datetime) }} ~
            {{ formatTimeToLocal(match.bid_close_datetime) }}
          </div>
          <!-- <q-separator spaced v-if="!isUser" /> -->
        </q-card-section>
      </q-card>
    </q-list>
    <q-banner v-if="message" class="q-mt-md" type="warning">
      {{ message }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosInstance from "../utils/axiosInterceptor";
import { useRouter } from "vue-router";
import { Dialog } from "quasar";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";
import {
  getSessionContext,
  fetchSessionData,
  saveSessionData,
} from "../utils/sessionFunctions";
import { navigate } from "../utils/navigate";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

const apiMap = {
  user: "GET_ALL_APPROVED_MATCHES", // 일반 사용자
};
const emit = defineEmits(["update-status"]);

const sessionContext = getSessionContext();
const localSessionData = fetchSessionData(sessionContext, [
  "venueCd",
  "telno",
  "role",
]);

const router = useRouter();

const matchArray = ref([]);
const selectedButton = ref(null);
const message = ref("");

// 서버에서 경기 목록을 가져오는 함수
const fetchMatches = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_ALL_APPROVED_MATCHES, {
      params: {
        telno: localSessionData.telno, //대회등록자는 본인의 경기만
        venueCd: localSessionData.venueCd,
      },
    });
    matchArray.value = response.data;
  } catch (error) {
    handleError(error);
  }
};

// 경기 선택 처리 함수
const handleSelectMatch = (index) => {
  const match = matchArray.value[index];
  saveSessionData(sessionContext, {
    matchNumber: match.match_no,
  });
  selectedButton.value = selectedButton.value === index ? null : index;
  message.value = "";
  emit("update-status", {
    isLoggedIn: true,
    hasSelectedMatch: true,
  });
  navigate(router, sessionContext, "bids");
};

const handleError = (error) => {
  //refresh expired인 경우 401발생
  if (error.response?.status === 403 || error.response?.status === 401) {
    Dialog.create({
      title: "오류",
      message: "세션이 만료되었거나 권한이 없습니다. \n다시 로그인해 주세요.",
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    navigate(router, sessionContext, "login"); // 로그인 화면으로 이동
  } else {
    if (error.response) {
      message.value = error.response.data;
    } else if (error.request) {
      message.value = messageCommon.ERR_NETWORK;
    } else {
      message.value = messageCommon.ERR_ETC;
    }
  }
};

// 컴포넌트가 마운트될 때 실행
onMounted(async () => {
  await fetchMatches();
});
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
