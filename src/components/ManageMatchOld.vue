<template>
  <q-page class="common-container">
    <q-card v-if="!matchArray || matchArray.length === 0">
      <br /><br /><br />
      <q-banner>현재 대회 정보가 없습니다.</q-banner>
      <br /><br /><br />
    </q-card>

    <div v-else>
      <h5 class="text-center">경기 정보</h5>
      <ag-grid-vue
        class="ag-theme-alpine"
        :rowData="computedMatchArray"
        :columnDefs="columnDefs"
        :gridOptions="gridOptions"
        style="width: 100%; height: 500px"
        @cellClicked="onCellClicked"
      ></ag-grid-vue>
    </div>

    <div class="row q-mt-md q-col-gutter-md">
      <q-btn
        v-if="!(updateMode || deleteMode || insertMode)"
        @click="handleInsert"
        label="경기 추가"
        class="q-mt-md"
        color="primary"
      />
    </div>
    <q-card>
      <q-banner v-if="guideMessage" type="info" class="q-mt-md">{{
        guideMessage
      }}</q-banner>
    </q-card>

    <!-- 기타 작업 상태 관리 및 메시지 -->
    <q-banner v-if="message" type="info">{{ message }}</q-banner>
    <q-banner v-if="fileMessage" type="info">{{ fileMessage }}</q-banner>

    <div v-if="insertMode || updateMode || deleteMode" class="q-mt-md">
      <q-form @submit.prevent="handleSubmit">
        <div class="row q-col-gutter-md">
          <q-input
            v-model="matchData.matchNumber"
            label="경기 번호"
            readonly
            class="col-12 col-md-6"
          />
          <div>
            <div class="rowflex-container">
              경기장&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <q-select
                v-model="matchData.venueName"
                :options="venueOptions"
                :disable="deleteMode"
                class="col-12 col-md-6"
                @update:model-value="handleVenueChange"
              />
            </div>
            <div class="rowflex-container">
              입찰여부&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <q-select
                v-model="matchData.bidLable"
                :options="bidOptions"
                class="col-12 col-md-6"
                :disable="deleteMode"
                @update:model-value="handleBidAvaialableChange"
              />
            </div>
            <!-- 현재 선택된 경기장 코드  -->
            <div hidden>
              {{ matchData.venueCd }}
            </div>
            <div hidden>
              <!-- 현재 선택된 입찰 가능여부 코드  -->
              {{ matchData.isBidAvailable }}
            </div>
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <q-input
            v-model="matchData.matchName"
            label="경기명"
            :disable="deleteMode"
            class="col-12 col-md-6"
          />
        </div>
        <div class="row q-col-gutter-md">
          <q-input
            v-model="matchData.round"
            label="라운드"
            :disable="deleteMode"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.startDate"
            label="경기 일자"
            type="date"
            :disable="deleteMode"
            class="col-12 col-md-6"
          />
        </div>
        <div class="row q-col-gutter-md">
          <q-input
            v-model="matchData.startTime"
            label="시작 시간"
            type="time"
            :disable="deleteMode"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.endTime"
            label="종료 시간"
            type="time"
            :disable="deleteMode"
            class="col-12 col-md-6"
          />
        </div>
        <div class="row q-col-gutter-md">
          <q-input
            v-model="matchData.bidOpenTime"
            label="입찰 개시"
            type="datetime-local"
            :disable="deleteMode"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.bidCloseTime"
            label="입찰 종료"
            type="datetime-local"
            :disable="deleteMode"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.payDue"
            label="결제 시한"
            type="datetime-local"
            :disable="deleteMode"
            class="col-12 col-md-6"
          />
        </div>
        <div class="row q-col-gutter-md">
          <!-- q-input에서 input으로 수정함 q-input의 경우 오류발생 -->
          <input
            type="file"
            @change="handleFileChange"
            :disabled="deleteMode"
            class="col-12 col-md-6"
          />
        </div>
        <br />
      </q-form>
      <div class="row q-col-gutter-md">
        <q-btn
          push
          color="whilte"
          text-color="blue-grey-14"
          class="q-mt-md col-xs-12 col-sm-6"
          @click="handleSubmit"
          type="submit"
          label="확인"
          :disable="!insertMode && !updateMode && !deleteMode"
        />
        <q-btn
          push
          color="white"
          text-color="deep-orange-14"
          class="q-mt-md col-xs-12 col-sm-6"
          @click="handleSubmitCancel"
          label="취소"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
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

// Router 및 session 관련 변수
const router = useRouter();
const sessionContext = getSessionContext();
const localSessionData = fetchSessionData(sessionContext, ["venueCd", "telno"]);
let newVenueCd = "";
let newBidCd = "";
let newFileSelected = false;

// Reactive 상태
const matchArray = ref([]);
const venueArray = ref([]);
const matchData = ref({
  matchNumber: "",
  venueCd: "",
  venueName: "",
  matchName: "",
  round: "",
  startDate: "",
  startTime: "",
  endTime: "",
  bidOpenTime: "",
  bidCloseTime: "",
  payDue: "",
  isBidAvailable: "",
  file: null,
  fileName: "",
});

const insertMode = ref(false);
const updateMode = ref(false);
const deleteMode = ref(false);
const message = ref("");
const fileMessage = ref("");

const computedMatchArray = computed(() => {
  return matchArray.value.map((match) => ({
    ...match,
    bid_open_time: formatTimeToLocal(match.bid_open_datetime),
    bid_close_time: formatTimeToLocal(match.bid_close_datetime),
    pay_due_datetime: formatTimeToLocal(match.pay_due_datetime),
    approveStatus: match.approved === "Y" ? "승인" : "미승인", // 승인 상태 필드
    bidLable: match.is_bid_available === "Y" ? "입찰가능" : "입찰불가능",
  }));
});

const venueOptions = computed(() =>
  venueArray.value.map((v) => ({ label: v.venue_name, value: v.venue_cd }))
);

const bidOptions = computed(() => [
  { label: "입찰 가능", value: "Y" },
  { label: "입찰 불가능", value: "N" },
]);

const guideMessage = computed(() => {
  if (insertMode.value) return "정보 입력 후 확인버튼을 클릭하세요.";
  if (updateMode.value) return "경기 정보를 수정한 후 확인버튼을 클릭하세요.";
  if (deleteMode.value) return "삭제할 정보가 맞으면 확인버튼을 클릭하세요.";
  return "";
});

// ag-grid columnDefs
const columnDefs = [
  { headerName: "번호", field: "match_no", flex: 1 },
  { headerName: "경기장", field: "venue_name", flex: 1 },
  { headerName: "경기명", field: "match_name", flex: 1 },
  { headerName: "라운드", field: "round", flex: 1 },
  {
    headerName: "경기 일자",
    field: "start_date",
    sortable: true,
  },
  { headerName: "시작 시간", field: "start_time", flex: 1 },
  { headerName: "종료 시간", field: "end_time", flex: 1 },
  { headerName: "입찰 허용 여부", field: "bidLable", flex: 1 },
  { headerName: "입찰 개시", field: "bid_open_time", flex: 2 },
  { headerName: "입찰 종료", field: "bid_close_time", flex: 2 },
  {
    headerName: "결제 시한",
    field: "pay_due_datetime",
    flex: 2,
    sortable: true,
  },
  { headerName: "상태", field: "approveStatus", flex: 1 },
  {
    headerName: "첨부",
    field: "actions",
    cellRenderer: (params) => `
      <button class="btn-download" data-id="${params.data.match_no}">보기</button>
    `,
  },
  {
    headerName: "수정",
    field: "actions",
    cellRenderer: (params) => `
      <button class="btn-edit" data-id="${params.data.match_no}">수정</button>
    `,
    sortable: false,
  },
  {
    headerName: "삭제",
    field: "actions",
    cellRenderer: (params) => `
      <button class="btn-delete" data-id="${params.data.match_no}">삭제</button>
    `,

    sortable: false,
  },
];

const gridOptions = {
  defaultColDef: {
    resizable: true, // 열 크기 조정 가능
    sortable: true, // 기본 정렬 활성화
  },

  onFirstDataRendered: (params) => {
    // 데이터 로드 후 자동 너비 조정
    const allColumnIds = params.columnApi
      .getAllColumns()
      .map((col) => col.getId());
    params.columnApi.autoSizeColumns(allColumnIds);
  },
  autoSizeStrategy: {
    type: "fitGridWidth",
  },

  pagination: true,
  paginationPageSizeSelector: [10, 20, 30],
  rowHeight: 40,
};

// 클릭 이벤트 처리
const onCellClicked = (params) => {
  const target = params.event.target;

  // 삽입 모드에서는 삭제와 수정 버튼 클릭 무시
  if (
    insertMode.value &&
    (target.classList.contains("btn-edit") ||
      target.classList.contains("btn-delete"))
  ) {
    return;
  }

  // 수정 모드에서는 삭제 버튼 클릭 무시
  if (updateMode.value && target.classList.contains("btn-delete")) {
    return;
  }

  // 삭제 모드에서는 수정 버튼 클릭 무시
  if (deleteMode.value && target.classList.contains("btn-edit")) {
    return;
  }

  // 버튼 이벤트 처리
  if (target.classList.contains("btn-edit")) {
    handleUpdate(params.data); // 수정 처리
  } else if (target.classList.contains("btn-delete")) {
    handleDelete(params.data); // 삭제 처리
  } else if (target.classList.contains("btn-download")) {
    downloadFile(params.data.filename_attached); // 파일 다운로드 처리
  }
};

// 테이블 컬럼 정의

const generateRandomNumber = () => {
  const randomNum = Math.floor(Math.random() * 1e10);
  return randomNum.toString().padStart(10, "0");
};

const handleVenueChange = (newValue) => {
  newVenueCd = newValue.value; // 선택된 값을 저장
};

const handleBidAvaialableChange = (newValue) => {
  newBidCd = newValue.value; // 선택된 값을 저장
};

const handleFileChange = (event) => {
  const file = event.target.files ? event.target.files[0] : null;
  // 유효성 검사: 영문자와 숫자만 허용
  const isValidFileName = /^[a-zA-Z0-9]+$/.test(file.name.split(".")[0]);

  if (!isValidFileName) {
    alert("파일 이름은 영문자와 숫자만 허용됩니다.");
    newFileSelected = false;
    return; // 유효하지 않은 파일 이름은 처리하지 않음
  }
  if (file) {
    newFileSelected = true;
    matchData.value.file = file;
    matchData.value.fileName = file.name;
  }
};

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

const fetchVenues = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_ALL_VENUES);
    venueArray.value = response.data;
  } catch (error) {
    handleError(error);
  }
};

const handleSubmit = async () => {
  //삭제의 경우 validateInput을 수행하지 않음
  if (!deleteMode.value && !validateInput()) return;

  let venueCd;
  if (newVenueCd) {
    venueCd = newVenueCd;
  } else {
    venueCd = matchData.value.venueCd;
  }

  let bidCd;
  if (newBidCd) {
    bidCd = newBidCd;
  } else {
    bidCd = matchData.value.isBidAvailable;
  }

  if (newFileSelected) {
    const uniqueId = generateRandomNumber();
    matchData.value.fileName = uniqueId + "_" + matchData.value.fileName;
  } else {
    fileMessage.value = "업로드 할 파일이 없습니다.";
  }
  const requestData = {
    ...matchData.value,
    telno: localSessionData.telno,
    role: localSessionData.role,
    venueCd: venueCd,
    isBidAvailable: bidCd,
  };

  const apiMapping = {
    insert: APIs.ADD_MATCH,
    update: APIs.UPDATE_MATCH,
    delete: APIs.DELETE_MATCH,
  };

  // 현재 모드 확인
  const currentMode = insertMode.value
    ? "insert"
    : updateMode.value
    ? "update"
    : deleteMode.value
    ? "delete"
    : null;

  // 유효한 모드가 설정되었는지 확인
  if (!currentMode) {
    console.warn("유효한 작업 모드가 설정되지 않았습니다.");
    return;
  }

  const apiUrl = apiMapping[currentMode];
  try {
    // API 요청 시도
    const response = await axiosInstance.post(apiUrl, requestData);

    // 응답 성공 확인
    if (response.status === 200) {
      message.value = response.data.message;
      // 파일 업로드 확인
      if ((updateMode.value || insertMode.value) && newFileSelected) {
        alert("첨부화일이 업로드되었습니다.");
        handleFileUpload();
      }

      fetchMatches();
      resetState();
    } else {
    }
  } catch (error) {
    handleError(error);
  }
};

const handleSubmitCancel = () => {
  resetState();
  resetMessage();
};

const handleFileUpload = async () => {
  const formData = new FormData();

  // FormData에 파일 추가 (세 번째 인수로 파일명을 지정)
  formData.append("file", matchData.value.file, matchData.value.fileName);

  try {
    // 서버로 파일 업로드
    const response = await axiosInstance.post(APIs.UPLOAD_MATCHINFO, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // 파일 업로드에 적합한 헤더 설정
      },
    });

    if (response.status === 200) {
      fileMessage.value = "파일 업로드가 성공적으로 수행되었습니다.";
    }
  } catch (error) {
    handleError(error);
  }
};

const downloadFile = async (fileName) => {
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

const handleInsert = () => {
  resetForm();
  resetState();
  resetMessage();
  insertMode.value = true;
};

const handleUpdate = (props) => {
  setNewMatchData(props);
  resetState();
  resetMessage();
  updateMode.value = true;
};

const handleDelete = (props) => {
  setNewMatchData(props);
  resetState();
  resetMessage();
  deleteMode.value = true;
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

const setNewMatchData = (match) => {
  const parseDate = (dateStr) => {
    return dateStr && !isNaN(new Date(dateStr).getTime())
      ? new Date(dateStr).toISOString().slice(0, 10)
      : ""; // 유효하지 않으면 빈 문자열 반환
  };

  const parseDateTime = (dateTimeStr) => {
    return dateTimeStr && !isNaN(new Date(dateTimeStr).getTime())
      ? new Date(dateTimeStr).toISOString().slice(0, 16)
      : ""; // 유효하지 않으면 빈 문자열 반환
  };

  matchData.value = {
    matchNumber: match.match_no,
    venueCd: match.venue_cd,
    venueName: match.venue_name,
    matchName: match.match_name,
    round: match.round,
    // startDate는 YYYY-MM-DD 형식으로 변환
    startDate: parseDate(match.start_date),
    // startTime과 endTime을 HH:MM 형식으로 변환
    startTime: match.start_time ? match.start_time.slice(0, 5) : "",
    endTime: match.end_time ? match.end_time.slice(0, 5) : "",
    // 일자 시간 형식으로 변환
    bidOpenTime: parseDateTime(match.bid_open_datetime),
    bidCloseTime: parseDateTime(match.bid_close_datetime),
    payDue: parseDateTime(match.pay_due_datetime),
    fileName: match.filename_attached,
    isBidAvailable: match.is_bid_available,
    bidLable: match.is_bid_available === "Y" ? "입찰가능" : "입찰불가능",
  };
};

const validateInput = () => {
  const {
    matchName,
    round,
    startDate,
    startTime,
    endTime,
    bidOpenTime,
    bidCloseTime,
    payDue,
    isBidAvailable,
  } = matchData.value;

  if (!matchName) {
    alert("경기명을 입력해 주세요.");
    return false;
  }

  if (!round) {
    alert("라운드를 입력해 주세요.");
    return false;
  }

  if (!startDate) {
    alert("경기 일자를 입력해 주세요.");
    return false;
  }

  if (!startTime) {
    alert("시작 시간을 입력해 주세요.");
    return false;
  }

  if (!endTime) {
    alert("종료 시간을 입력해 주세요.");
    return false;
  }

  // 경기 종료 시간이 경기 시작 시간보다 커야 함
  if (new Date(endTime) <= new Date(startTime)) {
    alert("경기 종료 시간은 시작 시간보다 커야 합니다.");
    return false;
  }

  // 입찰 개시 시간이 입력되었는지 확인
  if (bidOpenTime) {
    const bidStart = new Date(bidOpenTime);
    const bidEnd = new Date(bidCloseTime);
    const start = new Date(startDate); // 경기 일
    const due = new Date(payDue); // 결제 시한

    // 입찰 종료 시간이 입찰 시작 시간보다 커야 함
    if (bidEnd <= bidStart) {
      alert("입찰 마감시간은 입찰 시작시간보다 커야 합니다.");
      return false;
    }

    // 입찰 종료 시간이 경기 시작 시간보다 크면 안 됨
    if (bidEnd >= start) {
      alert("입찰 종료 시간은 경기 시작 시간보다 작아야 합니다.");
      return false;
    }
    if (due) {
      if (due <= bidEnd) {
        alert("결제 시한은 입찰 종료시간보다 커야 합니다.");
        return false;
      }
    } else {
      alert("결제 시한을 입력해 주세요.");
      return false;
    }
    if (due >= start) {
      alert("결제 시한은 경기 시작일보다 작아야 합니다.");
      return false;
    }
  }

  // if (isBidAvailable === undefined || isBidAvailable === "") {
  //   alert("입찰 구분을 선택해 주세요.");
  //   return false;
  // }

  return true;
};

const resetState = () => {
  insertMode.value = false;
  updateMode.value = false;
  deleteMode.value = false;
  newFileSelected = false;
};

const resetForm = () => {
  matchData.value = {
    matchNumber: "",
    venueCd: "",
    venueName: "",
    matchName: "",
    round: "",
    startDate: "",
    startTime: "",
    endTime: "",
    bidOpenTime: "",
    bidCloseTime: "",
    payDue: "",
    isBidAvailable: "",
    fileName: "",
  };
  message.value = "";
  fileMessage.value = "";
};

const resetMessage = () => {
  guideMessage.value = "";
  message.value = "";
  fileMessage.value = "";
};

// Lifecycle hooks
onMounted(async () => {
  await fetchVenues();
  await fetchMatches();
});
</script>

<style scoped>
.btn-download {
  font-size: 10px; /* 글씨 크기 */
  background-color: #007bff; /* 버튼 배경색 */
  color: white; /* 글씨 색 */
  border: none; /* 테두리 제거 */
  border-radius: 2px; /* 버튼 모서리 둥글게 */
  cursor: pointer; /* 마우스 커서 변경 */
}

.btn-download:hover {
  background-color: #0056b3; /* 호버 시 배경색 */
}
</style>
