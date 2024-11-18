<template>
  <q-page class="common-container">
    <q-card v-if="!matchArray || matchArray.length === 0">
      <br />
      <br />
      <br />
      <q-banner>현재 대회 정보가 없습니다.</q-banner>
      <br />
      <br />
      <br />
    </q-card>

    <div v-else>
      <h5 class="text-center">경기 정보</h5>
      <q-table
        :rows="computedMatchArray"
        :columns="columns"
        row-key="match_no"
        flat
        dense
        :rows-per-page="20"
      >
        <template v-slot:body-cell-actions="props">
          <q-td>
            <q-btn
              label="첨부 다운로드"
              color="secondary"
              :disable="!props.row.filename_attached"
              icon="download"
              @click="downloadFile(props.row.filename_attached)"
              flat
            />
            <div v-if="props.row.approved !== APPROVED_MATCH">
              <q-btn
                @click="handleUpdate(props.row)"
                push
                color="white"
                text-color="blue-grey-14"
                label="수정"
                :disable="
                  updateInputMode || deleteConfirmMode || insertInputMode
                "
              />

              <q-btn
                @click="handleDelete(props.row)"
                push
                color="white"
                text-color="deep-orange-14"
                label="삭제"
                :disable="
                  updateInputMode || deleteConfirmMode || insertInputMode
                "
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <div class="row q-mt-md q-col-gutter-md">
      <q-btn
        v-if="!(updateInputMode || deleteConfirmMode || insertInputMode)"
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
    <div
      v-if="insertInputMode || updateInputMode || deleteConfirmMode"
      class="q-mt-md"
    >
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
                :disable="deleteConfirmMode"
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
                :disable="deleteConfirmMode"
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
            :disable="deleteConfirmMode"
            class="col-12 col-md-6"
          />
        </div>
        <div class="row q-col-gutter-md">
          <q-input
            v-model="matchData.round"
            label="라운드"
            :disable="deleteConfirmMode"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.startDate"
            label="경기 일자"
            type="date"
            :disable="deleteConfirmMode"
            class="col-12 col-md-6"
          />
        </div>
        <div class="row q-col-gutter-md">
          <q-input
            v-model="matchData.startTime"
            label="시작 시간"
            type="time"
            :disable="deleteConfirmMode"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.endTime"
            label="종료 시간"
            type="time"
            :disable="deleteConfirmMode"
            class="col-12 col-md-6"
          />
        </div>
        <div class="row q-col-gutter-md">
          <q-input
            v-model="matchData.bidOpenTime"
            label="입찰 개시"
            type="datetime-local"
            :disable="deleteConfirmMode"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="matchData.bidCloseTime"
            label="입찰 종료"
            type="datetime-local"
            :disable="deleteConfirmMode"
            class="col-12 col-md-6"
          />
        </div>
        <div class="row q-col-gutter-md">
          <!-- q-input에서 input으로 수정함 q-input의 경우 오류발생 -->
          <input
            type="file"
            @change="handleFileChange"
            :disabled="deleteConfirmMode"
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
          :disable="!insertInputMode && !updateInputMode && !deleteConfirmMode"
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
    <q-banner v-if="message" type="info">{{ message }}</q-banner>
    <q-banner v-if="fileMessage" type="info">{{ fileMessage }}</q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

import { useRouter } from "vue-router";
import axios from "axios";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";
import { fetchLocalSession, fetchSessionUser } from "../utils/sessionFunctions";
import { navigate } from "../utils/navigate";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

// Router 및 session 관련 변수
const router = useRouter();
let localSessionData = {};
let sessionResults = {};
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
  isBidAvailable: "",
  file: null,
  fileName: "",
});

const insertInputMode = ref(false);
const updateInputMode = ref(false);
const deleteConfirmMode = ref(false);
const message = ref("");
const fileMessage = ref("");

// 컴퓨티드 프로퍼티, 컬럼 등
const APPROVED_MATCH = "Y";

const computedMatchArray = computed(() => {
  return matchArray.value.map((match) => ({
    ...match,
    bid_open_time: formatTimeToLocal(match.bid_open_datetime),
    bid_close_time: formatTimeToLocal(match.bid_close_datetime),
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
  if (insertInputMode.value) return "정보 입력 후 확인버튼을 클릭하세요.";
  if (updateInputMode.value)
    return "경기 정보를 수정한 후 확인버튼을 클릭하세요.";
  if (deleteConfirmMode.value)
    return "삭제할 정보가 맞으면 확인버튼을 클릭하세요.";
  return "";
});

// 테이블 컬럼 정의
const columns = [
  { name: "match_no", label: "경기번호", field: "match_no" },
  { name: "venue_name", label: "경기장", field: "venue_name" },
  { name: "match_name", label: "경기명", field: "match_name" },
  { name: "round", label: "라운드", field: "round" },
  { name: "start_date", label: "경기 일자", field: "start_date" },
  { name: "start_time", label: "시작 시간", field: "start_time" },
  { name: "end_time", label: "종료 시간", field: "end_time" },
  { name: "bidLable", label: "입찰 허용 여부", field: "bidLable" },
  { name: "bid_open_time", label: "입찰 개시", field: "bid_open_time" },
  { name: "bid_close_time", label: "입찰 종료", field: "bid_close_time" },
  { name: "approveStatus", label: "상태", field: "approveStatus" },
  { name: "actions", label: "변경", align: "center" },
];

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
  if (file) {
    newFileSelected = true;
    matchData.value.file = file;
    matchData.value.fileName = file.name;
  }
};

const fetchMatches = async () => {
  try {
    const response = await axios.get(APIs.GET_ALLMATCHES, {
      params: {
        telno: sessionResults.telno,
        userType: sessionResults.userType,
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
    const response = await axios.get(APIs.GET_ALL_VENUES);
    if (response.status === 200) {
      venueArray.value = response.data;
    }
  } catch (error) {
    handleError(error);
  }
};

const handleSubmit = async () => {
  if (!deleteConfirmMode.value && !validateInput()) return;

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
    telno: sessionResults.telno,
    userType: sessionResults.userType,
    venueCd: localSessionData.venueCd,
    isBidAvailable: bidCd,
  };

  const apiMapping = {
    insert: APIs.ADD_MATCH,
    update: APIs.UPDATE_MATCH,
    delete: APIs.DELETE_MATCH,
  };

  // 현재 모드 확인
  const currentMode = insertInputMode.value
    ? "insert"
    : updateInputMode.value
    ? "update"
    : deleteConfirmMode.value
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
    const response = await axios.post(apiUrl, requestData);

    // 응답 성공 확인
    if (response.status === 200) {
      message.value = response.data.message;
      // 파일 업로드 확인
      if ((updateInputMode.value || insertInputMode.value) && newFileSelected) {
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
  message.value = "작업이 취소되었습니다.";
};

const handleFileUpload = async () => {
  const formData = new FormData();

  // FormData에 파일 추가 (세 번째 인수로 파일명을 지정)
  formData.append("file", matchData.value.file, matchData.value.fileName);

  try {
    // 서버로 파일 업로드
    const response = await axios.post(APIs.UPLOAD_MATCHINFO, formData, {
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
    const response = await axios.get(APIs.DOWNLOAD_MATCHINFO, {
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
    handleError(error);
  }
};

const handleInsert = () => {
  resetForm();
  resetState();
  resetMessage();
  resetForm();
  insertInputMode.value = true;
};

const handleUpdate = (props) => {
  setNewMatchData(props);
  resetState();
  resetMessage();
  updateInputMode.value = true;
};

const handleDelete = (props) => {
  setNewMatchData(props);
  resetState();
  resetMessage();
  deleteConfirmMode.value = true;
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

const setNewMatchData = (match) => {
  matchData.value = {
    matchNumber: match.match_no,
    venueCd: match.venue_cd,
    venueName: match.venue_name,
    matchName: match.match_name,
    round: match.round,
    // startDate는 YYYY-MM-DD 형식으로 변환
    startDate: match.start_date
      ? new Date(match.start_date).toISOString().slice(0, 10)
      : "",
    // startTime과 endTime을 HH:MM 형식으로 변환
    startTime: match.start_time ? match.start_time.slice(0, 5) : "",
    endTime: match.end_time ? match.end_time.slice(0, 5) : "",
    bidOpenTime: match.bid_open_datetime
      ? new Date(match.bid_open_datetime).toISOString().slice(0, 16)
      : "",
    bidCloseTime: match.bid_close_datetime
      ? new Date(match.bid_close_datetime).toISOString().slice(0, 16)
      : "",
    isBidAvailable: match.is_bid_available,
    bidLable: match.is_bid_available === "Y" ? "입찰가능" : "입찰불가능",
    fileName: match.filename_attached,
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
    isBidAvailable,
  } = matchData.value;

  // bidOpenTime과 bidCloseTime을 먼저 Date 객체로 변환
  const bidStartDateTime = new Date(bidOpenTime);
  const bidEndDateTime = new Date(bidCloseTime);

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

  // 입찰 종료 시간이 입찰 시작 시간보다 커야 함
  if (bidEndDateTime <= bidStartDateTime) {
    alert("입찰 마감시간은 입찰 시작시간보다 커야 합니다.");
    return false;
  }

  // 입찰 종료 시간이 경기 시작 시간보다 크면 안 됨
  if (bidEndDateTime >= new Date(startDate)) {
    alert("입찰 종료 시간은 경기 시작 시간보다 작아야 합니다.");
    return false;
  }

  // 경기 종료 시간이 경기 시작 시간보다 커야 함
  if (new Date(endTime) <= new Date(startTime)) {
    alert("경기 종료 시간은 시작 시간보다 커야 합니다.");
    return false;
  }

  // if (isBidAvailable === undefined || isBidAvailable === "") {
  //   alert("입찰 구분을 선택해 주세요.");
  //   return false;
  // }

  return true;
};

const resetState = () => {
  insertInputMode.value = false;
  updateInputMode.value = false;
  deleteConfirmMode.value = false;
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
    isBidAvailable: "",
    fileName: "",
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
  localSessionData = fetchLocalSession(["userClass", "venueCd"]);
  sessionResults = await fetchSessionUser(localSessionData.userClass);
  await fetchVenues();
  await fetchMatches();
});
</script>

<style scoped></style>
