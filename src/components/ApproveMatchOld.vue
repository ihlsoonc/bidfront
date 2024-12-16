<template>
  <q-page class="common-container">
    <q-layout view="lHh lpr lFf">
      <h6>경기 정보</h6>

      <q-page-container>
        <q-page class="q-pa-md">
          <q-card v-if="!matchArray || matchArray.length === 0">
            <br />
            <br />
            <br />
            <q-banner>현재 대회 정보가 없습니다.</q-banner>
            <br />
            <br />
            <br />
          </q-card>

          <!-- ag-grid 테이블 -->
          <ag-grid-vue
            v-if="matchArray.length > 0"
            class="ag-theme-alpine"
            :rowData="computedMatchArray"
            :columnDefs="columnDefs"
            :gridOptions="gridOptions"
            style="width: 100%; height: 500px"
            @cellClicked="onCellClicked"
          ></ag-grid-vue>

          <!-- 추가 작업 카드 -->
          <q-card
            v-if="canApprove || canDisapprove || canViewFile"
            class="q-mt-lg"
          >
            <q-card-section>
              <q-banner v-if="guideMessage" class="q-mb-md">{{
                guideMessage
              }}</q-banner>

              <q-form class="q-gutter-md q-gutter-sm-md-up">
                <q-input
                  v-model="matchData.matchNumber"
                  label="번호"
                  type="number"
                  disable
                  class="col-xs-12 col-sm-6"
                />
                <q-input
                  v-model="matchData.venueName"
                  label="경기장"
                  disable
                  class="col-xs-12 col-sm-6"
                />
                <q-input
                  v-model="matchData.matchName"
                  label="경기"
                  disable
                  class="col-xs-12 col-sm-6"
                />
                <q-input
                  v-model="matchData.round"
                  label="라운드"
                  disable
                  class="col-xs-12 col-sm-6"
                />
                <q-input
                  v-model="matchData.startDate"
                  label="경기 일자"
                  type="date"
                  disable
                  class="col-12 col-md-6"
                />
                <q-input
                  v-model="matchData.startTime"
                  label="시작 시간"
                  type="time"
                  disable
                  class="col-12 col-md-6"
                />
                <q-input
                  v-model="matchData.endTime"
                  label="종료 시간"
                  type="time"
                  disable
                  class="col-12 col-md-6"
                />
                <q-input
                  v-model="matchData.isBidAvailable"
                  label="입찰 가능 여부"
                  disable
                  class="col-xs-12 col-sm-6"
                />
              </q-form>

              <div class="row">
                <q-btn
                  :disable="!canDisapprove && !canApprove && !canViewFile"
                  label="확인"
                  @click="handleSubmit"
                  class="q-mt-md col-xs-12 col-sm-6"
                />
                <q-btn
                  :disable="!canDisapprove && !canApprove && !canViewFile"
                  push
                  color="white"
                  text-color="deep-orange-14"
                  label="취소"
                  @click="handleSubmitCancel"
                  class="q-mt-md col-xs-12 col-sm-6"
                />
              </div>
            </q-card-section>
          </q-card>
          <q-banner v-if="message" class="q-mt-lg">{{ message }}</q-banner>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { AgGridVue } from "ag-grid-vue3"; // ag-grid-vue3 추가
import "ag-grid-community/styles/ag-grid.css"; // ag-grid 기본 스타일
import "ag-grid-community/styles/ag-theme-alpine.css"; // ag-grid 테마
import axiosInstance from "../utils/axiosInterceptor";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";
import { getSessionContext, fetchSessionData } from "../utils/sessionFunctions";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";
import { navigate } from "../utils/navigate";

const router = useRouter();
const sessionContext = getSessionContext();
const localSessionData = fetchSessionData(sessionContext, ["venueCd", "telno"]);
const matchArray = ref([]);
const matchData = ref({});
const canApprove = ref(false);
const canDisapprove = ref(false);
const canViewFile = ref(false);
const message = ref("");

// 컴퓨티드 데이터
const computedMatchArray = computed(() =>
  matchArray.value.map((match) => ({
    ...match,
    is_bid_available:
      match.is_bid_available === "Y" ? "입찰 가능" : "입찰 불가능",
    approved: match.approved === "Y" ? "승인" : "미승인",
  }))
);

const guideMessage = computed(() => {
  if (canDisapprove.value)
    return "승인 취소할 내용이 맞으면 확인버튼을 클릭하세요.";
  if (canApprove.value) return "승인할 내용이 맞으면 확인버튼을 클릭하세요.";
  if (canViewFile.value) return "상세정보입니다.";
  return "";
});

// 컬럼 정의
const columnDefs = [
  { headerName: "번호", field: "match_no", flex: 1 },
  { headerName: "경기명", field: "match_name", flex: 2 },
  { headerName: "라운드", field: "round", flex: 2 },
  { headerName: "일자", field: "start_date", flex: 2 },
  { headerName: "시작", field: "start_time", flex: 1 },
  { headerName: "종료", field: "end_time", flex: 1 },

  { headerName: "승인 상태", field: "approved", flex: 1 },
  // 승인 버튼 열
  {
    headerName: "승인",
    field: "approve",
    cellRenderer: (params) => {
      const isApproved = params.data.approved === "승인";
      return `
        <button class="btn-approve" data-id="${params.data.match_no}" ${
        isApproved ? "disabled" : ""
      }>승인</button>
      `;
    },
    sortable: false,
    flex: 1,
  },

  // 취소 버튼 열
  {
    headerName: "취소",
    field: "reset",
    cellRenderer: (params) => {
      const isApproved = params.data.approved === "승인";
      return `
        <button class="btn-reset" data-id="${params.data.match_no}" ${
        !isApproved ? "disabled" : ""
      }>취소</button>
      `;
    },
    sortable: false,
    flex: 1,
  },

  // 첨부 다운로드 버튼 열
  {
    headerName: "첨부",
    field: "download",
    cellRenderer: (params) => `
      <button class="btn-download" data-id="${params.data.match_no}">보기</button>
    `,
    sortable: false,
    flex: 1,
  },
];

// ag-grid 옵션
const gridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: true,
  },
  autoSizeStrategy: {
    type: "fitGridWidth",
  },
  pagination: true,
  paginationPageSizeSelector: [10, 20, 30],
  rowHeight: 50,
};

// API 호출
const fetchMatches = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_ALL_MATCHES, {
      params: {
        telno: localSessionData.telno,
        role: localSessionData.role,
        venueCd: localSessionData.venueCd,
      },
    });
    if (response.status === 200) {
      matchArray.value = response.data;
    }
  } catch (error) {
    handleError(error);
  }
};

// 버튼 클릭 이벤트 처리
const onCellClicked = (params) => {
  const target = params.event.target;
  const matchNo = target.getAttribute("data-id");

  if (target.classList.contains("btn-approve")) {
    handleApprove(params.data);
  } else if (target.classList.contains("btn-reset")) {
    handleResetApprove(params.data);
  } else if (target.classList.contains("btn-download")) {
    downloadFile(params.data.filename_attached);
  }
};

const handleApprove = (match) => {
  canApprove.value = true;
  setSelectedMatchData(match);
};

const handleResetApprove = (match) => {
  canDisapprove.value = true;
  setSelectedMatchData(match);
};

const setSelectedMatchData = (match) => {
  const formattedStartDate = formatTimeToLocal(match.start_datetime);
  const formattedEndDate = formatTimeToLocal(match.end_datetime);
  matchData.value = {
    matchNumber: match.match_no,
    venueCd: match.venue_cd,
    venueName: match.venue_name,
    matchName: match.match_name,
    round: match.round,
    startDate: match.start_date
      ? new Date(match.start_date).toISOString().slice(0, 10)
      : "",
    // startTime과 endTime을 HH:MM 형식으로 변환
    startTime: match.start_time ? match.start_time.slice(0, 5) : "",
    endTime: match.end_time ? match.end_time.slice(0, 5) : "",
    isBidAvailable: match.is_bid_available,
    fileName: match.filename_attached,
  };
};

const handleSubmit = async () => {
  try {
    let actionType = canDisapprove.value ? "N" : "Y";
    const requestData = {
      ...matchData.value,
      telno: localSessionData.telno,
      role: localSessionData.role,
      actionType,
    };
    const response = await axiosInstance.post(APIs.APPROVE_MATCH, requestData);

    if (response.status === 200) {
      message.value = "성공적으로 작업이 수행되었습니다.";
      fetchMatches();
      resetState();
    }
  } catch (error) {
    handleError(error);
  }
};

const handleSubmitCancel = () => {
  resetState();
};

const downloadFile = async (fileName) => {
  if (!fileName) {
    alert("첨부 파일이 없습니다.");
    return;
  }
  try {
    const response = await axiosInstance.get(APIs.DOWNLOAD_MATCHINFO, {
      params: { fileName },
      responseType: "blob",
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
    console.error("파일 다운로드 오류:", error);
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

const resetState = () => {
  canDisapprove.value = false;
  canApprove.value = false;
  canViewFile.value = false;
};

onMounted(() => {
  fetchMatches();
});
</script>

<style scoped>
.btn-approve,
.btn-reset,
.btn-download {
  margin: 2px;
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-approve {
  background-color: #007bff;
  color: white;
}

.btn-reset {
  background-color: #ff6f61;
  color: white;
}

.btn-download {
  background-color: #4caf50;
  color: white;
}

.btn-approve:hover,
.btn-reset:hover,
.btn-download:hover {
  opacity: 0.8;
}
</style>
