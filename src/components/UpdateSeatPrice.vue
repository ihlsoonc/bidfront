<template>
  <q-page class="common-container q-pa-md">
    <BidStatus :bidStatus="bidStatus" />

    <div class="flexcolum-container q-gutter-md">
      <div v-if="seatUpdateMode" class="q-mt-md q-gutter-xs row">
        <br />
        <div>
          <q-btn
            push
            color="white"
            text-color="blue-grey-14"
            label="좌석 일괄 생성"
            @click="handleCreatSeatArray"
          ></q-btn
          >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <q-btn
            push
            text-color="blue-grey-14"
            @click="handleAddRow"
            label="새로운 행 추가"
          />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <q-btn
            push
            color="white"
            text-color="deep-orange-14"
            @click="handleCancelEdit"
            label="입력내용 취소"
          />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <q-btn color="primary" @click="handleSubmit" label="수정 내용 제출" />
        </div>
      </div>

      <div class="q-mt-md">
        <q-banner v-if="message" class="q-mt-md">{{ message }}</q-banner>
        <q-dialog v-model="showSeatCreatePrompt">
          <q-card>
            <q-card-section>
              <div class="q-mb-md">
                <q-input
                  v-model.number="seatCount"
                  label="생성할 좌석수"
                  type="number"
                  outlined
                />
              </div>
              <div class="q-mb-md">
                <q-input
                  v-model.number="startSeatNumber"
                  label="시작 번호"
                  type="number"
                  outlined
                />
              </div>
              <div class="q-mb-md">
                <q-input
                  v-model.number="basePrice"
                  label="기본 가격"
                  type="number"
                  outlined
                />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                push
                color="white"
                text-color="primary"
                @click="submitCreateSeatArray"
                label="생성"
              />
              <q-btn
                push
                color="white"
                text-color="deep-orange-14"
                @click="hideSeatCreatePrompt"
                label="취소"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <div v-if="!seatArray || seatArray.length === 0" class="q-mb-md">
          <q-banner type="warning">
            좌석 일괄 생성 버튼을 눌러 가격을 입력하여 주세요.
          </q-banner>
        </div>

        <div v-else>
          <br />
          <q-toolbar-title level="h6">좌석별 최소 입찰 가격</q-toolbar-title>
          <br />
          <q-table
            :rows="seatArray"
            :columns="columns"
            row-key="seat_no"
            class="q-mt-none text-xs"
          >
            <template v-slot:body-cell-seat_no="props">
              <q-td :props="props">
                <q-input
                  v-model="props.row.seat_no"
                  dense
                  type="text"
                  @input="handleInputChange(props.row, 'seat_no', $event)"
                  readonly
                />
              </q-td>
            </template>
            <template v-slot:body-cell-row_no="props">
              <q-td :props="props">
                <q-input
                  v-model="props.row.row_no"
                  dense
                  type="text"
                  @input="handleInputChange(props.row, 'row_no', $event)"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-col_no="props">
              <q-td :props="props">
                <q-input
                  v-model="props.row.col_no"
                  dense
                  type="text"
                  @input="handleInputChange(props.row, 'col_no', $event)"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-seat_price="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.seat_price"
                  dense
                  type="number"
                  @input="handleInputChange(props.row, 'seat_price', $event)"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" align="right">
                <q-btn
                  @click="handleRemoveRow(props.row)"
                  push
                  color="white"
                  text-color="deep-orange-14"
                  label="삭제"
                  :disable="!seatUpdateMode"
                />
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import axiosInstance from "../utils/axiosInterceptor";
import BidStatus from "./BidStatus.vue";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";
import { navigate } from "../utils/navigate";
import { fetchLocalSession } from "../utils/sessionFunctions";
import { showConfirmDialog } from "../utils/dialogUtils";

//session
let matchNumber = 0;
const localSessionData = fetchLocalSession(["matchNumber", "userClass"]);
const token = localStorage.getItem("authToken");
const router = useRouter();

//reactive
const bidStatus = ref({});
const seatArray = ref([]);
const fetchedSeatArray = ref([]);
const seatCount = ref(0);
const startSeatNumber = ref(1);
const basePrice = ref(1);
const showSeatCreatePrompt = ref(false);
const seatUpdateMode = ref(false);
const message = ref("");

//const and columns
const seatArrayToDelete = [];
const MAX_SEAT_PRICE = 500000;
const INITIAL_BID_STATUS = "N"; //이 경우에만 좌석 일괄 생성과 수정이 가능하다.
const columns = [
  {
    name: "seat_no",
    label: "좌석",
    align: "left",
    field: "seat_no",
    sortable: true,
  },
  {
    name: "row_no",
    label: "열",
    align: "left",
    field: "row_no",
    sortable: true,
  },
  {
    name: "col_no",
    label: "컬럼",
    align: "left",
    field: "col_no",
    sortable: true,
  },
  {
    name: "seat_price",
    label: "최소 입찰가",
    align: "right",
    field: "seat_price",
    sortable: true,
  },
  { name: "actions", label: "", align: "right" },
];

const fetchBidStatus = async (matchNumber) => {
  try {
    const response = await axiosInstance.get(APIs.GET_BID_STATUS, {
      params: { matchNumber },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    bidStatus.value = response.data;
    seatUpdateMode.value = bidStatus.value.bidStatusCode === INITIAL_BID_STATUS;
  } catch (error) {
    handleError(error);
  }
};

const fetchSeats = async (matchNumber) => {
  try {
    const response = await axiosInstance.get(APIs.GET_SEATPRICE, {
      params: { matchNumber },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    seatArray.value = response.data.map((seat) => ({ ...seat, matchNumber }));
    fetchedSeatArray.value = JSON.parse(JSON.stringify(seatArray.value));
  } catch (error) {
    handleError(error);
  }
};

const handleSubmit = async () => {
  const { isValid } = validateSeats(seatArray.value);

  if (!isValid) {
    return;
  }
  const seatArrayToUpdate = getSeatsToUpdate(
    seatArray.value,
    fetchedSeatArray.value
  );

  if (seatArrayToUpdate.length === 0 && seatArrayToDelete.value.length === 0) {
    alert("변경된 내용이 없습니다.");
    return;
  }
  const confirmMessage = createConfirmMessage(
    seatArrayToUpdate.length,
    seatArrayToDelete.value.length
  );

  if (!confirm(confirmMessage)) return;
  let messageDelete;
  let messageUpdate;

  if (seatArrayToDelete.value.length > 0) {
    messageDelete = await deleteSeats(seatArrayToDelete.value, matchNumber);
    seatArrayToDelete.value = [];

    if (seatArrayToUpdate.length > 0) {
      (messageUpdate = await updateSeats(seatArrayToUpdate)), matchNumber;
    }
    alert("작업이 성공적으로 수행되었습니다.");

    // 새로운 정보 불러오기
    try {
      await fetchSeats(matchNumber);
    } catch (error) {
      handleError(error);
    }
  }
};
const deleteSeats = async (seatArrayToDelete, matchNumber) => {
  try {
    const response = await axiosInstance.post(
      APIs.DELETE_SEATPRICEARRAY,
      {
        seatPriceArray: seatArrayToDelete,
        matchNumber: matchNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    return response.data.message;
  } catch (error) {
    handleError(error);
    return null;
  }
};

const updateSeats = async (seatArrayToUpdate, matchNumber) => {
  try {
    const response = await axiosInstance.post(
      APIs.UPDATE_SEATPRICEARRAY,
      {
        seatPriceArray: seatArrayToUpdate,
        matchNumber: matchNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    return response.data.message;
  } catch (error) {
    handleError(error);
    return null;
  }
};

const validateSeats = (seatArray) => {
  const invalidSeats = seatArray.filter(
    (seat) =>
      !seat.seat_no ||
      seat.seat_no.trim() === "" ||
      seat.seat_price <= 0 ||
      seat.seat_price > MAX_SEAT_PRICE
  );

  if (invalidSeats.length === 0) {
    return { isValid: true, message: "" };
  }

  const missingSeatNo = invalidSeats.filter(
    (seat) => !seat.seat_no || seat.seat_no.trim() === ""
  );
  const invalidPriceSeat = invalidSeats.filter(
    (seat) => seat.seat_price <= 0 || seat.seat_price > MAX_SEAT_PRICE
  );

  let message = "";
  if (missingSeatNo.length > 0) {
    message += `좌석 번호가 없는 항목: ${missingSeatNo
      .map((seat) => `(가격: ${seat.seat_price})`)
      .join(", ")}\n`;
  }
  if (invalidPriceSeat.length > 0) {
    message += `가격이 0 이하이거나 ${MAX_SEAT_PRICE} 이상인 항목이 있습니다.\n: ${invalidPriceSeat
      .map((seat) => `좌석번호 ${seat.seat_no} (가격: ${seat.seat_price})\n`)
      .join(", ")}\n`;
  }
  alert(message);
  return { isValid: false };
};

const getSeatsToUpdate = (seatArray, fetchedSeatArray) => {
  return seatArray.filter((seat) => {
    const originalSeat = fetchedSeatArray.find(
      (s) => s.seat_no === seat.seat_no
    );
    return (
      !originalSeat ||
      originalSeat.seat_price !== seat.seat_price ||
      originalSeat.row_no !== seat.row_no ||
      originalSeat.col_no !== seat.col_no
    );
  });
};

const createConfirmMessage = (updateCount, deleteCount) => {
  if (updateCount > 0 && deleteCount > 0) {
    return `총 ${updateCount}개의 좌석이 업데이트되고 ${deleteCount}개의 좌석이 삭제됩니다. 계속하시겠습니까?`;
  } else if (updateCount > 0) {
    return `총 ${updateCount}개의 좌석이 업데이트됩니다. 계속하시겠습니까?`;
  } else if (deleteCount > 0) {
    return `총 ${deleteCount}개의 좌석이 삭제됩니다. 계속하시겠습니까?`;
  } else {
    return `변경 사항이 없습니다.`;
  }
};

const handleInputChange = (row, field, value) => {
  row[field] = value;
};

const handleRemoveRow = (row) => {
  const seat_no = row.seat_no;

  // seat_no가 없거나 빈 문자열일 경우 seatArray에서 현재 row와 일치하는 항목을 필터링해 제거
  if (!seat_no || seat_no.trim() === "") {
    seatArray.value = seatArray.value.filter((seat) => seat !== row);
    return;
  }

  showConfirmDialog({
    title: "좌석 삭제 확인",
    message:
      "정말로 이 좌석을 삭제하시겠습니까? 최종삭제는 작업 종료 후 `수정 내역 제출버튼`을 누르면 반영됩니다.",
    okLabel: "예",
    cancelLabel: "아니오",
    onOk: () => {
      seatArrayToDelete.value.push({ seat_no: seat_no });
      seatArray.value = seatArray.value.filter((seat) => seat !== row);
    },
    onCancel: () => {
      console.log("좌석 삭제가 취소되었습니다.");
    },
  });
};

const handleAddRow = () => {
  const lastSeatNo = Math.max(
    0,
    ...seatArray.value.map((seat) => Number(seat.seat_no) || 0)
  );
  seatArray.value.push({
    row_no: "",
    col_no: "",
    seat_no: String(lastSeatNo + 1),
    seat_price: 0,
    matchNumber: matchNumber,
  });
};

const handleCreatSeatArray = async () => {
  let messageDelete;
  if (seatArray.value.length === 0) {
    showSeatCreatePrompt.value = true;
  } else {
    showConfirmDialog({
      title: "새로운 좌석 정보 생성",
      message:
        "현재 좌석이 모두 삭제된 후 새 좌석이 생성됩니다. 계속하시겠습니까?",
      onOk: async () => {
        seatArrayToDelete.value = seatArray.value;
        if (seatArrayToDelete.value.length > 0) {
          messageDelete = await deleteSeats(
            seatArrayToDelete.value,
            matchNumber
          );
        }
        // 삭제 완료 후 초기화
        fetchedSeatArray.value = [];
        seatArrayToDelete.value = [];
        seatArray.value = [];
        showSeatCreatePrompt.value = true;
        message.value = messageDelete;
      },
      onCancel: () => {
        alert("작업이 취소되었습니다.");
      },
    });
  }
};

const submitCreateSeatArray = async () => {
  if (seatCount.value <= 0 || startSeatNumber.value < 1) {
    alert("좌석 개수와 시작 번호는 1 이상의 숫자여야 합니다.");
    return;
  }
  seatArray.value = Array.from({ length: seatCount.value }, (_, index) => ({
    row_no: "",
    col_no: "",
    seat_no: String(startSeatNumber.value + index),
    seat_price: basePrice.value,
    matchNumber: matchNumber,
  }));
  const seatArrayToUpdate = seatArray.value.map((item) => ({ ...item }));

  if (seatArrayToUpdate.length > 0) {
    message.value = await updateSeats(seatArrayToUpdate);
    showSeatCreatePrompt.value = false;
    // 새로운 정보 불러오기
    try {
      await fetchSeats(matchNumber);
    } catch (error) {
      handleError(error);
    }
  }
};

const handleCancelEdit = () => {
  showConfirmDialog({
    title: "입력 내용 취소",
    message: "정말로 변경 내용을 취소하고 원래 상태로 되돌리시겠습니까?",
    okLabel: "예",
    cancelLabel: "아니오",
    onOk: () => {
      // 사용자가 확인을 선택한 경우 원래 상태로 되돌림
      seatArray.value = JSON.parse(JSON.stringify(fetchedSeatArray.value));
    },
    onCancel: () => {},
  });
};

const hideSeatCreatePrompt = () => {
  showSeatCreatePrompt.value = false;
};

const handleBackToLogin = () => {
  navigate(router, localSessionData.userClass, "login");
};

const resetLoginStatus = () => {
  emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });
};

const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

onMounted(async () => {
  matchNumber = localSessionData.matchNumber;
  if (matchNumber) {
    await fetchBidStatus(matchNumber);
    await fetchSeats(matchNumber);
  } else {
    alert("경기를 먼저 선택해주세요.");
    navigate(router, localSessionData.userClass, "selectMatch");
  }
});
</script>

<style scoped></style>
