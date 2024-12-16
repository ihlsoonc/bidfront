// bid_open_status가 'F'이면 낙찰 완료로 설정
<!-- if ("F".equals(bidOpenStatus)) {
    bidStatusName = "낙찰 완료"; // 낙찰 완료 상태
    bidStatusCode = "AWARDED";
} else {
    // 현재 시간과 비교하여 상태 코드와 이름 설정
    if (now.isBefore(openDateTime)) {
        bidStatusName = "입찰 개시전"; // 입찰 시작 전
        bidStatusCode = "BEFORE_OPEN";
    } else if (now.isAfter(closeDateTime)) {
        bidStatusName = "입찰 종료"; // 입찰 종료 후 낙찰 처리 전
        bidStatusCode = "CLOSED";
    } else {
        bidStatusName = "입찰 진행중"; // 입찰 진행 중
        bidStatusCode = "IN_PROGRESS";
    }
} -->

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
            {{ match.match_name }} {{ match.round }} :
            {{ match.venue_name }} (경기번호 {{ match.match_no }})
          </div>
          <q-separator spaced />

          <div>
            <strong>{{ match.bid_status_name }}</strong>
            &nbsp;&nbsp; 승인 :<strong>{{
              match.approved === "Y" ? "완료" : "대기"
            }}</strong
            >&nbsp;&nbsp; 입찰 여부 :<strong>{{
              match.is_bid_available === "Y" ? "공개" : "비공개"
            }}</strong
            ><br />
            경기 일시:
            <strong
              >{{ match.start_date }}일 {{ match.start_time }} ~
              {{ match.end_time }}</strong
            ><br />
            <div v-if="match.is_bid_available === 'Y'">
              입찰 기간:
              {{ formatTimeToLocal(match.bid_open_datetime) }} ~
              {{ formatTimeToLocal(match.bid_close_datetime) }}&nbsp;&nbsp; 결제
              시한:
              {{ formatTimeToLocal(match.pay_due_datetime) }}
            </div>
          </div>
          <div class="columflex-container">
            <q-btn
              @click.stop="handleDownLoad(match.filename_attached)"
              color="white"
              text-color="black"
              label="첨부 보기"
              :disable="!match.filename_attached"
            />&nbsp;&nbsp;
            <q-btn
              @click.stop="handleApprove(match.match_no)"
              color="primary"
              label="경기 승인"
              v-if="isAdmin && match.approved !== 'Y'"
            />

            <q-btn
              @click.stop="
                resetApprove(match.match_no, match.match_name + match.round)
              "
              color="warning"
              label="승인 취소"
              v-if="
                isAdmin &&
                match.approved === 'Y' &&
                match.reserved !== 'Y' &&
                (match.bid_status_code === 'BEFORE_OPEN' ||
                  match.bid_status_code === 'INIT' ||
                  match.bid_status_code === 'NO_DATA')
              "
            />
            <!-- 관리자 일괄 좌석 가격 입력 버튼 -->
            <q-btn
              @click.stop="handleInputPrice(match.match_no)"
              color="primary"
              label="가격 입력"
              v-if="
                isAdmin &&
                match.bid_status_code === 'BEFORE_OPEN' &&
                match.approved !== 'Y'
              "
            />
            <!-- 관리자 일괄 입찰 승인용 버튼 -->
            {{ match_reserved }}
            <q-btn
              @click.stop="handleReserveAdmin(match.match_no)"
              color="primary"
              label="일괄 입찰"
              v-if="
                // isAdmin &&
                // match.is_bid_available === 'N' &&
                // match.approved === 'Y' &&
                // match.bid_status_code === 'BEFORE_OPEN' &&
                match.reserved === 'Y' //신청이 있는 경우에만 버튼을 보여줌줌
              "
            />
            <!-- 대회 등록자 일괄 입찰 등록용 버튼 -->
            <q-btn
              @click.stop="handleReserve(match.match_no)"
              color="primary"
              label="일괄 입찰"
              :disabled="match.approved !== 'Y'"
              v-if="isAdminM && match.is_bid_available === 'N'"
            />
            &nbsp;&nbsp;
            <!-- 대회 등록자 경기 정보 수정/삭제 버튼 -->
            <q-btn
              @click.stop="handleUpdate(match.match_no)"
              color="secondary"
              label="수정"
              v-if="isAdminM && match.approved !== 'Y'"
            />&nbsp;&nbsp;
            <q-btn
              @click.stop="
                handleDelete(match.match_no, match.match_name + match.round)
              "
              color="secondary"
              label="삭제"
              v-if="isAdminM && match.approved !== 'Y'"
            />
          </div>
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
  admin: "GET_ALL_MATCHES", // 총괄 관리자
  adminm: "GET_MY_MATCHES", // 대회 등록자
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
const isAdmin = ref(false);
const isAdminM = ref(false);
const canApprove = ref(false);
const canDisapprove = ref(false);
const message = ref("");

// 서버에서 경기 목록을 가져오는 함수
const fetchMatches = async () => {
  const selectedApi = apiMap[sessionContext];
  try {
    const response = await axiosInstance.get(APIs[selectedApi], {
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

const resetApprove = (matchNumber, matchName) => {
  Dialog.create({
    title: "승인 취소 확인",
    message: `${matchNumber}번 ${matchName}경기를  승인취소하겠습니까?`,
    cancel: true,
    persistent: true,
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
      handleSubmit(matchNumber, "N");
    })
    .onCancel(() => {
      return;
    });
};
const handleApprove = (matchNumber) => {
  handleSubmit(matchNumber, "Y");
};

const handleSubmit = async (matchNumber, approveFlag) => {
  try {
    const requestData = {
      matchNumber: matchNumber,
      telno: localSessionData.telno,
      role: localSessionData.role,
      actionType: approveFlag,
    };
    console.log(requestData);
    const response = await axiosInstance.post(APIs.APPROVE_MATCH, requestData);

    if (response.status === 200) {
      Dialog.create({
        title: "알림 ",
        message: response.data.message,
        ok: {
          label: "확인",
          color: "primary",
        },
        persistent: true,
      });
    }
    fetchMatches();
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

const handleReserve = (matchNumber) => {
  saveSessionData(sessionContext, {
    matchNumber: matchNumber,
  });
  navigate(router, sessionContext, "reserveMatch");
};

const handleReserveAdmin = (matchNumber) => {
  saveSessionData(sessionContext, {
    matchNumber: matchNumber,
  });
  navigate(router, sessionContext, "reserveMatch");
};

const handleInputPrice = (matchNumber) => {
  saveSessionData(sessionContext, {
    matchNumber: matchNumber,
  });
  navigate(router, sessionContext, "updateSeatPrice");
};
const handleUpdate = (matchNumber) => {
  saveSessionData(sessionContext, {
    matchNumber: matchNumber,
  });
  navigate(router, sessionContext, "updateMatch", { workMode: "update" });
};

const handleDownLoad = async (fileName) => {
  if (!fileName) {
    message.value("첨부화일이 없습니다.");
    return;
  }
  try {
    const response = await axiosInstance.get(APIs.DOWNLOAD_MATCHINFO, {
      params: { fileName },
      responseType: "blob", // 파일 데이터(이진 데이터) 응답
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    handleError(error);
  }
};

// 로그인 상태 초기화
const resetLoginStatus = () => {
  emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });
};

// 오류 처리 함수
const handleDelete = async (matchNumber, matchName) => {
  // 총 입찰 금액 확인 메시지
  Dialog.create({
    title: "삭제 확인",
    message: `${matchNumber}번 ${matchName}경기를  삭제하겠습니까?`,
    cancel: true,
    persistent: true,
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
      deleteMatch(matchNumber);
    })
    .onCancel(() => {
      return;
    });
};

const deleteMatch = async (matchNumber) => {
  const requestData = {
    matchNumber: matchNumber,
  };

  try {
    // API 요청 시도
    const response = await axiosInstance.post(APIs.DELETE_MATCH, requestData);
    Dialog.create({
      title: "알림 ",
      message: response.data.message,
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    fetchMatches();
  } catch (error) {
    handleError(error);
  }
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
  isAdminM.value = sessionContext === "adminm";
  isAdmin.value = sessionContext === "admin";
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
