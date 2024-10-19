<template>
  <q-page class="common-container">
    <q-layout view="lHh lpr lFf">
      <q-header>
        <q-toolbar>
          <q-title>경기 정보</q-title>
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="q-pa-md">
          <q-banner
            v-if="!matchArray || matchArray.length === 0"
            type="warning"
          >
            현재 정보가 없습니다.
          </q-banner>
          <q-table
            v-if="matchArray.length > 0"
            :rows="matchArray"
            :columns="columns"
            row-key="match_no"
            flat
            dense
          >
            <!-- <template v-slot:body-cell-approved="props">
              <q-td :props="props">
                {{ props.row.approved === "Y" ? "승인" : "미승인" }}
              </q-td>
            </template> -->

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  v-if="props.row.approved !== 'Y'"
                  label="승인"
                  color="primary"
                  @click="handleApprove(props.row)"
                  flat
                />
                <q-btn
                  v-if="props.row.approved === 'Y'"
                  label="승인취소"
                  color="negative"
                  @click="handleResetApprove(props.row)"
                  flat
                />
                <q-btn
                  label="다운로드"
                  color="secondary"
                  @click="downloadFile(props.row.filename_attached)"
                  flat
                />
              </q-td>
            </template>
          </q-table>

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
                  label="경기 번호"
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
                  :disable="deleteConfirmMode"
                  class="col-12 col-md-6"
                />
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
import axios from "axios";
import { useRouter } from "vue-router";
import { formatTimeToLocal } from "../utils/commonFunction";
import { url, API, messageCommon } from "../utils/messagesAPIs";

const sessionTelno = ref("");
const sessionUserType = ref("");
const matchArray = ref([]);
const matchData = ref({
  matchNumber: "",
  venueCd: "",
  venueName: "",
  matchName: "",
  round: "",
  startTime: "",
  endTime: "",
  isBidAvailable: "",
  fileName: "",
});
const canApprove = ref(false);
const canDisapprove = ref(false);
const canViewFile = ref(false);
const message = ref("");
const router = useRouter();

const columns = [
  { name: "match_no", label: "경기 번호", align: "left", field: "match_no" },
  {
    name: "venue_name",
    label: "경기장 이름",
    align: "left",
    field: "venue_name",
  },
  { name: "match_name", label: "경기명", align: "left", field: "match_name" },
  { name: "round", label: "라운드", align: "left", field: "round" },
  { name: "start_date", label: "일자", align: "left", field: "start_date" },
  { name: "start_time", label: "시작", align: "left", field: "end_time" },
  { name: "end_time", label: "종료", align: "left", field: "end_time" },
  {
    name: "is_bid_available",
    label: "입찰 가능 여부",
    align: "left",
    field: (row) =>
      row.is_bid_available === "Y" ? "입찰 가능" : "입찰 불가능",
  },
  {
    name: "approved",
    label: "승인 상태",
    align: "left",
    field: "approved",
    field: (row) => (row.approved === "Y" ? "승인" : "미승인"),
  },

  { name: "actions", label: "첨부 및 승인", align: "center" },
];

const guideMessage = computed(() => {
  if (canDisapprove.value)
    return "승인 취소할 내용이 맞으면 확인버튼을 클릭하세요.";
  if (canApprove.value) return "승인할 내용이 맞으면 확인버튼을 클릭하세요.";
  if (canViewFile.value) return "상세정보입니다.";
  return "";
});

const fetchMatches = async () => {
  try {
    const response = await axios.get(API.GET_ALLMATCHES, {
      params: { telno: sessionTelno.value, userType: sessionUserType.value },
    });
    if (response.status === 200) {
      matchArray.value = response.data;
    }
  } catch (error) {
    handleError(error);
  }
};

const handleApprove = (match) => {
  if (match.approved === "Y") {
    alert("이미 승인된 건입니다.");
    return;
  }
  canApprove.value = true;
  setSelectedMatchData(match);
};

const handleResetApprove = (match) => {
  if (match.approved !== "Y") {
    alert("아직 승인이 안된 건입니다.");
    return;
  }
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
      telno: sessionTelno.value,
      userType: sessionUserType.value,
      actionType,
    };
    const response = await axios.post(API.APPROVE_MATCH, requestData);
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
    alert("첨부화일이 없습니다.");
    return;
  }
  try {
    const response = await axios.get(API.DOWNLOAD_MATCHINFO, {
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
    console.error(`파일 다운로드 오류: ${error.message}`);
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

const resetState = () => {
  canDisapprove.value = false;
  canApprove.value = false;
  canViewFile.value = false;
};

onMounted(fetchMatches);
</script>

<style scoped>
.common-container {
  padding: 20px;
}
.q-gutter-sm-md-up {
  gap: 10px;
}
@media (max-width: 600px) {
  .q-mt-md {
    margin-top: 12px !important;
  }
}
</style>
