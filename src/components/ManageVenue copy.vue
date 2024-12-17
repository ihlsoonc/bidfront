<template>
  <q-page class="common-container">
    <q-card class="q-pa-md q-mb-lg" flat bordered>
      <q-card-section>
        <q-card v-if="!venueArray || venueArray.length === 0">
          <br />
          <br />
          <br />
          <q-banner>현재 경기장 정보가 없습니다.</q-banner>
          <br />
          <br />
          <br />
        </q-card>

        <div v-else>
          <h5>경기장 정보</h5>
          <!-- ag-grid-vue 테이블 -->
          <ag-grid-vue
            class="ag-theme-alpine"
            :rowData="venueArray"
            :columnDefs="columnDefs"
            :gridOptions="gridOptions"
            style="width: 100%; height: 350px"
            @cellClicked="onCellClicked"
          ></ag-grid-vue>
        </div>

        <q-btn
          v-if="!(updateMode || deleteMode || insertMode)"
          @click="handleInsert"
          label="신규 경기장 추가"
          class="q-mt-md"
          color="primary"
        />
      </q-card-section>
    </q-card>
    <q-card>
      <q-banner v-if="guideMessage" type="info" class="q-mt-md">{{
        guideMessage
      }}</q-banner>
    </q-card>
    <div v-if="insertMode || updateMode || deleteMode" class="q-pa-md">
      <q-form @submit.prevent="handleSubmit">
        <q-input
          v-model="venueData.venueCd"
          label="코드"
          :disable="updateMode || deleteMode"
          maxlength="3"
          class="q-mb-md"
        />
        <q-input
          v-model="venueData.venueName"
          label="경기장 이름"
          :disable="deleteMode"
          class="q-mb-md"
        />
        <q-input
          v-model="venueData.venuePlaceInfo"
          label="경기장 위치 정보"
          :disable="deleteMode"
          class="q-mb-md"
        />
        <q-input
          v-model="venueData.venueGeneralInfo"
          label="경기장 일반 정보"
          :disable="deleteMode"
          class="q-mb-md"
        />
      </q-form>
      <q-btn
        push
        color="white"
        text-color="blue-grey-14"
        label="확인"
        class="q-mt-md col-xs-12 col-sm-6"
        @click="handleSubmit"
      />
      <q-btn
        push
        color="white"
        text-color="deep-orange-14"
        label="취소"
        class="q-mt-md col-xs-12 col-sm-6"
        @click="handleSubmitCancel"
      />
    </div>
    <q-banner v-if="message" type="info" class="q-mt-md">{{
      message
    }}</q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-community/styles/ag-grid.css"; // ag-grid 기본 스타일
import "ag-grid-community/styles/ag-theme-alpine.css"; // ag-grid 테마
import axiosInstance from "../utils/axiosInterceptor";
import { getSessionContext, fetchSessionData } from "../utils/sessionFunctions";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";
import { navigate } from "../utils/navigate";

const router = useRouter();
const sessionContext = getSessionContext();
const localSessionData = fetchSessionData(sessionContext, ["telno"]);
const venueArray = ref([]);
const venueData = ref({
  venueCd: "",
  venueName: "",
  venuePlaceInfo: "",
  venueGeneralInfo: "",
});
const insertMode = ref(false);
const updateMode = ref(false);
const deleteMode = ref(false);
const message = ref("");

const guideMessage = computed(() => {
  if (insertMode.value) return "정보 입력 후 확인버튼을 클릭하세요.";
  if (updateMode.value) return "경기 정보를 수정한 후 확인버튼을 클릭하세요.";
  if (deleteMode.value) return "삭제할 정보가 맞으면 확인버튼을 클릭하세요.";
  return "";
});

// ag-grid columnDefs
const columnDefs = [
  { headerName: "경기장 코드", field: "venue_cd", flex: 1 },
  { headerName: "경기장 명", field: "venue_name", flex: 1 },
  {
    headerName: "위치 정보",
    field: "venue_place_info",
    flex: 2,
    sortable: false,
  },
  {
    headerName: "일반 정보",
    field: "venue_general_info",
    flex: 2,
    sortable: false,
  },
  {
    headerName: "수정",
    field: "edit",
    cellRenderer: (params) =>
      `<button class="btn-edit" data-id="${params.data.venue_cd}">수정</button>`,
    flex: 1,
    sortable: false,
  },
  {
    headerName: "삭제",
    field: "delete",
    cellRenderer: (params) =>
      `<button class="btn-delete" data-id="${params.data.venue_cd}">삭제</button>`,
    flex: 1,
    sortable: false,
  },
];

// ag-grid 옵션
const gridOptions = {
  defaultColDef: {
    resizable: true, // 열 크기 조정 가능
    // 기본 정렬 활성화
  },
  autoSizeStrategy: {
    type: "fitGridWidth",
  },

  pagination: true,
  paginationPageSizeSelector: [10, 20, 30],
  rowHeight: 40,
};

// 버튼 클릭 이벤트 처리
const onCellClicked = (params) => {
  const target = params.event.target;
  const venueCd = target.getAttribute("data-id");

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

  if (target.classList.contains("btn-edit")) {
    const selectedVenue = venueArray.value.find((v) => v.venue_cd === venueCd);
    handleUpdate(selectedVenue);
  } else if (target.classList.contains("btn-delete")) {
    const selectedVenue = venueArray.value.find((v) => v.venue_cd === venueCd);
    handleDelete(selectedVenue);
  }
};

// 데이터 가져오기
const fetchVenues = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_ALL_VENUES, {});
    if (response.status === 200) {
      venueArray.value = response.data;
    }
  } catch (error) {
    handleError(error);
  }
};

// 상태 관리
const handleInsert = () => {
  resetForm();
  resetState();
  insertMode.value = true;
};

const handleUpdate = (venue) => {
  setNewVenueData(venue);
  resetState();
  updateMode.value = true;
};

const handleDelete = (venue) => {
  setNewVenueData(venue);
  resetState();
  deleteMode.value = true;
};

const handleSubmit = async () => {
  const requestData = { ...venueData.value };
  if (!deleteMode.value && !validateInput()) return;

  try {
    let response;
    if (insertMode.value) {
      response = await axiosInstance.post(APIs.ADD_VENUE, venueData.value, {});
    } else if (updateMode.value) {
      response = await axiosInstance.post(
        APIs.UPDATE_VENUE,
        venueData.value,
        {}
      );
    } else if (deleteMode.value) {
      response = await axiosInstance.post(APIs.DELETE_VENUE, requestData, {});
    }

    if (response.status === 200) {
      alert(response.data.message);
      message.value = response.data.message;
      fetchVenues();
      resetState();
    }
  } catch (error) {
    handleError(error);
  }
};

const handleSubmitCancel = () => {
  resetState();
};

// 데이터 설정
const setNewVenueData = (venue) => {
  venueData.value = {
    venueCd: venue.venue_cd,
    venueName: venue.venue_name,
    venuePlaceInfo: venue.venue_place_info,
    venueGeneralInfo: venue.venue_general_info,
  };
};

const validateInput = () => {
  const { venueName } = venueData.value;
  if (!venueName) {
    alert("경기장명을 입력해 주세요.");
    return false;
  }
  return true;
};

const resetState = () => {
  insertMode.value = false;
  updateMode.value = false;
  deleteMode.value = false;
};

const resetForm = () => {
  venueData.value = {
    venueCd: "",
    venueName: "",
    venuePlaceInfo: "",
    venueGeneralInfo: "",
  };
  message.value = "";
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

onMounted(() => {
  fetchVenues();
});
</script>

<style scoped>
.btn-edit,
.btn-delete {
  margin: 2px;
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-delete {
  background-color: #ff6f61;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  opacity: 0.8;
}
</style>
