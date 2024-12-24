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
          <q-table
            :rows="venueArray"
            :columns="columns"
            row-key="venue_cd"
            v-model:pagination="pagination"
            flat
            bordered
            class="q-table-style"
            @row-click="onRowClick"
          >
            <!-- 수정/삭제 버튼 슬롯 -->
            <template v-slot:body-cell-actions="props">
              <q-btn
                flat
                dense
                icon="edit"
                color="primary"
                @click="handleUpdate(props.row)"
              />
              <q-btn
                flat
                dense
                icon="delete"
                color="negative"
                @click="handleDelete(props.row)"
              />
            </template>
          </q-table>
        </div>

        <q-btn
          v-if="!(updateMode || deleteMode || insertMode)"
          @click="handleInsert"
          label="신규 경기장 추가"
          class="q-mt-md"
          color="primary"
        />&nbsp;&nbsp;
        <q-btn
          v-if="!(updateMode || deleteMode || insertMode)"
          @click="handleSaveToExcel"
          label="exel로 저장 하기"
          class="q-mt-md"
          color="secondary"
        />&nbsp;&nbsp;
        <q-btn
          v-if="!(updateMode || deleteMode || insertMode)"
          @click="handleSaveToPdf"
          label="PDF로 저장하기"
          class="q-mt-md"
          color="secondary"
        />&nbsp;&nbsp;
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
        <!-- <q-file
          v-model="venueData.venueImage"
          label="경기장 이미지 화일"
          accept="image/*"
          class="q-mb-md"
          @update:model-value="onFileSelected"
        /> -->
        <q-input
          v-model="venueData.venueImageFileName"
          label="화일명"
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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import nanumGothicFont from "@/assets/fonts/NanumGothic.js";
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
  venueImage: "",
  venueImageFileName: "",
});
const insertMode = ref(false);
const updateMode = ref(false);
const deleteMode = ref(false);
let newFileSelected = false;
const message = ref("");

const guideMessage = computed(() => {
  if (insertMode.value) return "정보 입력 후 확인버튼을 클릭하세요.";
  if (updateMode.value) return "경기 정보를 수정한 후 확인버튼을 클릭하세요.";
  if (deleteMode.value) return "삭제할 정보가 맞으면 확인버튼을 클릭하세요.";
  return "";
});

// Quasar Table Columns
const columns = [
  { name: "venue_cd", align: "left", label: "경기장 코드", field: "venue_cd" },
  {
    name: "venue_name",
    align: "left",
    label: "경기장 명",
    field: "venue_name",
  },
  {
    name: "venue_place_info",
    align: "left",
    label: "위치 정보",
    field: "venue_place_info",
  },
  {
    name: "venue_general_info",
    align: "left",
    label: "일반 정보",
    field: "venue_general_info",
  },
  {
    name: "actions",
    align: "center",
    label: "작업",
    field: "actions",
    sortable: false,
  },
];

const pagination = ref({ page: 1, rowsPerPage: 10 });

// 엑셀로 저장하는 함수
const handleSaveToExcel = () => {
  // 1. 데이터를 SheetJS의 JSON 형식으로 변환
  const data = venueArray.value.map((row) => ({
    "경기장 코드": row.venue_cd,
    "경기장 명": row.venue_name,
    "위치 정보": row.venue_place_info,
    "일반 정보": row.venue_general_info,
  }));

  // 2. 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3. 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "경기장 정보");

  // 4. Excel 파일 저장
  XLSX.writeFile(workbook, "경기장_정보.xlsx");
};

// PDF로 저장하는 함수
const handleSaveToPdf = () => {
  // jsPDF 인스턴스 생성
  const doc = new jsPDF();

  // 사용자 정의 폰트 추가
  doc.addFileToVFS("NanumGothic.ttf", nanumGothicFont);
  doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
  doc.setFont("NanumGothic");

  // PDF 데이터 작성
  doc.text("경기장 정보", 10, 10); // 한글 텍스트

  // 테이블 데이터 준비
  const tableColumns = ["경기장 코드", "경기장 명", "위치 정보", "일반 정보"]; // PDF의 헤더
  const tableRows = venueArray.value.map((row) => [
    row.venue_cd,
    row.venue_name,
    row.venue_place_info,
    row.venue_general_info,
  ]);

  // autoTable로 테이블 추가
  doc.autoTable({
    head: [tableColumns], // 헤더 데이터
    body: tableRows, // 행 데이터
    startY: 20, // 테이블 시작 위치
    theme: "striped", // 테이블 스타일 (striped, grid, plain)
    styles: { font: "NanumGothic", fontSize: 10, cellPadding: 5 }, // 스타일 옵션
  });

  // PDF 저장
  doc.save("경기장_정보.pdf");
};

// const onFileSelected = (event) => {
//   const file = event.target.files ? event.target.files[0] : null;
//   // 유효성 검사: 영문자와 숫자만 허용
//   const isValidFileName = /^[a-zA-Z0-9]+$/.test(file.name.split(".")[0]);

//   if (!isValidFileName) {
//     alert("파일 이름은 영문자와 숫자만 허용됩니다.");
//     newFileSelected = false;
//     return; // 유효하지 않은 파일 이름은 처리하지 않음
//   }
//   if (file.name === venueData.value.veue_img_file) {
//     alert("새로운 Upload화일은 기존 화일명과 달라야 합니다.");
//     fileInput.value = "";
//     venueData.value.venueImageFileName = "";
//     newFileSelected = false;
//     return;
//   }
//   if (file) {
//     newFileSelected = true;
//     venueData.value.file = file;
//     venueData.value.venueImageFileName = file.name;
//     alert(file.name);
//   }
// };

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
    venueImageFileName: venue.venue_img_file,
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
