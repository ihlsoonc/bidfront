<template>
  <q-page class="common-container">
    <q-layout view="lHh lpr lFf">
      <h6>경기 정보</h6>

      <q-page-container>
        <q-page class="q-pa-md">
          <!-- 경기 정보가 없을 경우 표시 -->
          <q-card v-if="!matchArray || matchArray.length === 0">
            <br />
            <br />
            <br />
            <q-banner>현재 대회 정보가 없습니다.</q-banner>
            <br />
            <br />
            <br />
          </q-card>
          <!-- 경기 테이블 -->
          <q-table
            v-if="matchArray.length > 0"
            :rows="matchArray"
            :columns="columns"
            row-key="match_no"
            flat
            dense
          >
            <!-- 각 행의 동작 버튼 -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  v-if="props.row.approved !== 'Y'"
                  push
                  color="white"
                  text-color="blue-grey-14"
                  label="승인"
                  @click="handleApprove(props.row)"
                />
                <q-btn
                  v-if="props.row.approved === 'Y'"
                  push
                  color="white"
                  text-color="deep-orange-14"
                  label="취소"
                  @click="handleResetApprove(props.row)"
                />
                <q-btn
                  push
                  color="white"
                  text-color="blue-grey-14"
                  label="첨부 다운로드"
                  :disable="!props.row.filename_attached"
                  icon="download"
                  @click="downloadFile(props.row.filename_attached)"
                />
              </q-td>
            </template>
          </q-table>
          <!-- 승인/취소 및 파일 확인용 카드 -->
          <q-card
            v-if="canApprove || canDisapprove || canViewFile"
            class="q-mt-lg"
          >
            <q-card-section>
              <!-- 사용자 안내 메시지 -->
              <q-banner v-if="guideMessage" class="q-mb-md">{{
                guideMessage
              }}</q-banner>

              <!-- 경기 상세 정보 -->
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

              <!-- 확인 및 취소 버튼 -->
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
          <!-- 성공 메시지 -->
          <q-banner v-if="message" class="q-mt-lg">{{ message }}</q-banner>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";
import { fetchLocalSession, fetchSessionUser } from "../utils/sessionFunctions";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

// 경기 정보 데이터를 저장하는 변수
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

// 버튼 활성화 상태 관리
const canApprove = ref(false);
const canDisapprove = ref(false);
const canViewFile = ref(false);

// 메시지 표시용
const message = ref("");

// 경기 테이블의 열 정보
const columns = [
  { name: "match_no", label: "경기 번호", align: "left", field: "match_no" },
  // 경기장 이름, 경기명 등의 추가 정보
];

// 승인/취소/경기 추가에 따른 사용자 안내 메시지
const guideMessage = computed(() => {
  if (canDisapprove.value)
    return "승인 취소할 내용이 맞으면 확인버튼을 클릭하세요.";
  if (canApprove.value) return "승인할 내용이 맞으면 확인버튼을 클릭하세요.";
  if (canViewFile.value) return "상세정보입니다.";
  return "";
});

// 경기 정보 조회
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

// 승인 처리
const handleApprove = (match) => {
  if (match.approved === "Y") {
    alert("이미 승인된 건입니다.");
    return;
  }
  canApprove.value = true;
  setSelectedMatchData(match);
};

// 승인 취소 처리
const handleResetApprove = (match) => {
  if (match.approved !== "Y") {
    alert("아직 승인이 안된 건입니다.");
    return;
  }
  canDisapprove.value = true;
  setSelectedMatchData(match);
};

// 선택한 경기 데이터 설정
const setSelectedMatchData = (match) => {
  matchData.value = {
    matchNumber: match.match_no,
    venueName: match.venue_name,
  };
};

// 제출 처리
const handleSubmit = async () => {
  try {
    const response = await axios.post(APIs.APPROVE_MATCH, {
      ...matchData.value,
      actionType: canDisapprove.value ? "N" : "Y",
    });
    if (response.status === 200) {
      message.value = "성공적으로 작업이 수행되었습니다.";
      fetchMatches();
      resetState();
    }
  } catch (error) {
    handleError(error);
  }
};

// 상태 초기화
const resetState = () => {
  canDisapprove.value = false;
  canApprove.value = false;
  canViewFile.value = false;
};

// 파일 다운로드 처리
const downloadFile = async (fileName) => {
  if (!fileName) {
    alert("첨부화일이 없습니다.");
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
    console.error(`파일 다운로드 오류: ${error.message}`);
  }
};

// 오류 처리
const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

// 초기 데이터 로드
onMounted(async () => {
  localSessionData = fetchLocalSession(["userClass", "venueCd"]);
  sessionResults = await fetchSessionUser(localSessionData.userClass);

  if (!sessionResults.success) {
    resetLoginStatus();
  }
  await fetchMatches();
});
</script>
