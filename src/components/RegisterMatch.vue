<template>
  <q-page class="common-container">
    <h6>대회 정보 등록 및 수정</h6>
    <!-- <p>정보를 입력한 후 확인 버튼을 누르세요.</p> -->

    <div :key="formKey">
      <q-form @submit.prevent="handleSubmit">
        <p>{{ insertMessage }}</p>
        <div class="rowflex-container">
          <q-input
            v-model="matchData.matchNumber"
            label="경기 번호"
            readonly
            class="col-12 col-md-6"
          />
          <div class="rowflex-container">
            경기장&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <q-select
              v-model="matchData.venueName"
              :options="venueOptions"
              class="col-12 col-md-6"
              @update:model-value="handleVenueChange"
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
          <div class="rowflex-container">
            입찰여부&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <q-select
              v-model="matchData.bidLable"
              :options="bidOptions"
              class="col-12 col-md-6"
              @update:model-value="handleBidAvaialableChange"
            />
          </div>
        </div>
        <div class="rowflex-container">
          <q-input
            v-model="matchData.matchName"
            label="경기명"
            class="col- col-md-6"
          />
          <q-input
            v-model="matchData.round"
            label="라운드"
            class="col-12 col-md-6"
          />
        </div>
        <div class="rowflex-container">
          <q-input
            v-model="matchData.startDate"
            label="경기 일자"
            type="date"
            class="col-12 col-md-6"
          />

          <q-input
            v-model="matchData.startTime"
            label="시작 시간"
            type="time"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.endTime"
            label="종료 시간"
            type="time"
            class="col-12 col-md-6"
          />
        </div>

        <div class="rowflex-container">
          <q-input
            v-model="matchData.bidOpenTime"
            label="입찰 개시"
            type="datetime-local"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.bidCloseTime"
            label="입찰 종료"
            type="datetime-local"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.payDue"
            label="결제 시한"
            type="datetime-local"
            class="col-12 col-md-6"
          />
        </div>
        <div class="rowflex-container">
          <q-input
            v-model="matchData.fileNameShort"
            label="첨부 화일명"
            readonly
          />
          <div hidden>{{ matchData.fileName }}</div>
          <q-btn
            push
            color="white"
            text-color="blue-grey-14"
            class="q-mt-md col-xs-12 col-sm-6"
            @click="downloadFile(matchData.fileName)"
            label="첨부 보기"
          />
        </div>
        <div class="columnflex-container">
          <p>업로드 파일 선택</p>
          <input
            id="fileInput"
            type="file"
            @change="handleFileChange"
            class="col-12 col-md-6"
          />
        </div>
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
          :disable="!insertMode && !updateMode"
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
      <q-banner v-if="message" type="info">{{ message }}</q-banner>
      <q-banner v-if="fileMessage" type="info">{{ fileMessage }}</q-banner>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axiosInstance from "../utils/axiosInterceptor";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";
import { getSessionContext, fetchSessionData } from "../utils/sessionFunctions";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";
import { navigate } from "../utils/navigate";

// Router 및 session 관련 변수
const router = useRouter();
const route = useRoute();
const sessionContext = getSessionContext();
const localSessionData = fetchSessionData(sessionContext, [
  "venueCd",
  "telno",
  "matchNumber",
]);
let newVenueCd = "";
let newBidCd = "";
let newFileSelected = false;
const insertMessage = ref("");

// Reactive 상태
const venueArray = ref([]);
let match = ref({});
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
  file: null,
  fileName: "",
  fileNameShort: "",
});

const insertMode = ref(false);
const updateMode = ref(false);
const message = ref("");
const fileMessage = ref("");

const venueOptions = computed(() =>
  venueArray.value.map((v) => ({ label: v.venue_name, value: v.venue_cd }))
);
const bidOptions = computed(() => [
  { label: "입찰 가능", value: "Y" },
  { label: "입찰 불가능", value: "N" },
]);

// upload화일명에 추가하기 위한 난수 : 화일명 중복을 피하기 위함
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
  if (file.name === matchData.value.fileNameShort) {
    alert("새로운 Upload화일은 기존 화일명과 달라야 합니다.");
    fileInput.value = "";
    matchData.value.fileName = "";
    newFileSelected = false;
    return;
  }
  if (file) {
    newFileSelected = true;
    matchData.value.file = file;
    matchData.value.fileName = file.name;
    matchData.value.fileNameShort = file.name;
  }
};

const fetchMatch = async (matchNumber) => {
  try {
    const response = await axiosInstance.get(APIs.GET_BID_STATUS, {
      params: { matchNumber: matchNumber },
    });

    if (response.status === 200) {
      setNewMatchData(response.data);
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
  if (!validateInput()) return;

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
  };

  // 현재 모드 확인
  const currentMode = insertMode.value
    ? "insert"
    : updateMode.value
    ? "update"
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
      resetFileState();
    } else {
    }
  } catch (error) {
    handleError(error);
  }
};

const handleSubmitCancel = () => {
  const userConfirmed = window.confirm("작업을 취소하시겠습니까?");
  if (userConfirmed) {
    resetFileState();
    resetMessage();
  }
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
  resetMessage();
  insertMessage.value = "정보를 입력한 후 확인버튼을 눌러주세요.";
  insertMode.value = true;
};

const handleUpdate = () => {
  resetMessage();
  insertMessage.value = "정보를 수정한 후 확인버튼을 눌러주세요.";
  updateMode.value = true;
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
    isBidAvailable: match.is_bid_available,
    // 일자 시간 형식으로 변환
    bidOpenTime: parseDateTime(match.bid_open_datetime),
    bidCloseTime: parseDateTime(match.bid_close_datetime),
    payDue: parseDateTime(match.pay_due_datetime),
    fileNameShort: match.filename_attached.split("_").pop(),
    fileName: match.filename_attached,
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
    isBidAvailable,
    bidOpenTime,
    bidCloseTime,
    payDue,
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

  if (isBidAvailable === undefined || isBidAvailable === "") {
    alert("입찰 구분을 선택해 주세요.");
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

  return true;
};

const resetFileState = () => {
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
    isBidAvailable: "N",
    payDue: "",
    fileName: "",
    fileNameShort: "",
  };
  message.value = "";
  fileMessage.value = "";
};

const resetMessage = () => {
  message.value = "";
  fileMessage.value = "";
};

// Lifecycle hooks
onMounted(async () => {
  await fetchVenues();
  const workMode = route.query.workMode;
  if (workMode == "update") {
    await fetchMatch(localSessionData.matchNumber);
    handleUpdate();
  } else {
    handleInsert();
  }
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
