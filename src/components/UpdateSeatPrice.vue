<template>
  <q-page class="common-container q-pa-md">
    <BidStatus :bidStatus="bidStatus" />

    <div class="flexcolum-container q-gutter-md">
      <div v-if="seatUpdateMode" class="q-mt-md">
        <q-btn
          @click="handleCreateNewArray"
          label="좌석 일괄 생성"
          color="primary"
          flat
          class="full-width q-mb-sm"
        />
        <q-btn
          @click="handleSubmit"
          label="작업 내용 제출"
          color="secondary"
          flat
          class="full-width q-mb-sm"
        />
        <q-btn
          @click="handleAddRow"
          label="새로운 행 추가"
          color="tertiary"
          flat
          class="full-width"
        />
      </div>

      <div class="q-mt-md">
        <q-title level="h6">좌석별 최소 입찰 가격</q-title>
        <q-banner v-if="message" class="q-mt-md">{{ message }}</q-banner>

        <q-dialog v-model="showPrompt">
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
                @click="handleSeatCountSubmit"
                label="생성"
                color="primary"
                flat
              />
              <q-btn @click="hidePrompt" label="취소" color="secondary" flat />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- 좌석 입력 테이블 -->
        <q-table
          :rows="seatArray"
          :columns="columns"
          row-key="seat_no"
          class="q-mt-md"
          hide-bottom
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="right">
              <q-btn
                v-if="seatUpdateMode"
                @click="handleRemoveRow(props.row)"
                label="삭제"
                color="negative"
                flat
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import BidStatus from "./BidStatus.vue";
import { url, API, messageCommon } from "../utils/messagesAPIs";

export default {
  components: {
    BidStatus,
  },
  setup() {
    const router = useRouter();
    const sessionTelno = ref("");
    const sessionUserType = ref("");
    const matchNumber = ref("0");
    const bidStatus = ref({});
    const seatArray = ref([]);
    const seatArrayToDelete = ref([]);
    const originalSeats = ref([]);
    const seatCount = ref(0);
    const startSeatNumber = ref(1);
    const basePrice = ref(1);
    const showPrompt = ref(false);
    const seatUpdateMode = ref(false);
    const message = ref("");

    const columns = [
      {
        name: "seat_no",
        label: "좌석 번호",
        align: "left",
        field: "seat_no",
        sortable: true,
      },
      {
        name: "row_no",
        label: "열 번호",
        align: "left",
        field: "row_no",
        sortable: true,
      },
      {
        name: "col_no",
        label: "컬럼 번호",
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

    const fetchBidStatus = async (sessionMatchNumber) => {
      try {
        const response = await axios.get(
          API.GET_BIDSTATUS,
          { params: { matchNumber: sessionMatchNumber } },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data) {
          bidStatus.value = response.data;

          if (bidStatus.value.bidStatusCode === "N") {
            seatUpdateMode.value = true;
            alert("업데이트 가능여부. :" + seatUpdateMode.value);
          }
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchSeats = async (sessionMatchNumber) => {
      try {
        const response = await axios.get(API.GET_SEATPRICE, {
          params: { matchNumber: sessionMatchNumber },
        });
        seatArray.value = response.data.map((seat) => ({
          ...seat,
          matchNumber: sessionMatchNumber,
        }));
        originalSeats.value = JSON.parse(JSON.stringify(response.data));
      } catch (error) {
        handleError(error);
      }
    };

    const handleInputChange = (index, field, value) => {
      seatArray.value[index][field] = value;
    };

    const handleRemoveRow = (index) => {
      const confirmDelete = window.confirm(
        "정말로 이 좌석을 삭제하시겠습니까?"
      );
      if (confirmDelete) {
        seatArrayToDelete.value.push(seatArray.value[index].seat_no);
        seatArray.value.splice(index, 1);
      }
    };

    const handleAddRow = () => {
      const newSeat = {
        row_no: "",
        col_no: "",
        seat_no: "",
        seat_price: "",
        matchNumber: "",
      };
      seatArray.value = [...seatArray.value, newSeat];
    };

    const handleCreateNewArray = () => {
      if (seatArray.value.length === 0) {
        showPrompt.value = true;
      } else {
        const userConfirmed = confirm(
          `현재 좌석이 모두 삭제된 후 새 좌석이 생성됩니다. 계속하시겠습니까?`
        );
        if (userConfirmed) {
          seatArrayToDelete.value = seatArray.value.map((seat) => seat.seat_no);
          seatArray.value = [];
          showPrompt.value = true;
        }
      }
    };

    const handleSeatCountSubmit = () => {
      if (seatCount.value <= 0 || startSeatNumber.value < 1) {
        alert("좌석 개수와 시작 번호는 1 이상의 숫자여야 합니다.");
        return;
      }
      const newSeats = Array.from({ length: seatCount.value }, (_, index) => ({
        row_no: "",
        col_no: "",
        seat_no: String(startSeatNumber.value + index),
        seat_price: basePrice.value,
        matchNumber: matchNumber.value,
      }));

      seatArray.value = [...newSeats];
      showPrompt.value = false;
    };

    const handleSubmit = async () => {
      const updatedSeatArray = seatArray.value.filter((seat) => {
        const originalSeat = originalSeats.value.find(
          (s) => s.seat_no === seat.seat_no
        );
        return (
          !originalSeat ||
          originalSeat.seat_price !== seat.seat_price ||
          originalSeat.row_no !== seat.row_no ||
          originalSeat.col_no !== seat.col_no
        );
      });

      if (updatedSeatArray.length === 0) {
        alert("변경된 내용이 없습니다.");
        return;
      }

      const userConfirmed = confirm(
        `총 ${updatedSeatArray.length}개의 좌석이 처리됩니다. 계속하시겠습니까?`
      );
      if (!userConfirmed) return;

      try {
        const response = await axios.post(API.UPDATE_SEATPRICEARRAY, {
          seatPriceArray: updatedSeatArray,
        });

        if (response.status === 200) {
          alert("좌석이 성공적으로 업데이트되었습니다.");
          message.value = response.data.message;
        }
      } catch (error) {
        alert("좌석 업데이트 중 오류가 발생했습니다.");
      }
    };

    const hidePrompt = () => {
      showPrompt.value = false;
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

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, {
          withCredentials: true,
        });
        if (response.status == "200") {
          sessionTelno.value = response.data.telno;
          sessionUserType.value = response.data.userType;
        }
      } catch (error) {
        alert("로그인이 필요합니다.");
        router.push(url.adminLogin);
      }
    };

    onMounted(async () => {
      const sessionMatchNumber = sessionStorage.getItem("matchNumber");
      if (sessionMatchNumber) {
        matchNumber.value = sessionMatchNumber;
        await fetchSessionUserId();
        await fetchBidStatus(sessionMatchNumber);
        await fetchSeats(sessionMatchNumber);
      } else {
        alert("경기를 먼저 선택해주세요.");
        router.push(url.selectMatchAdmin);
      }
    });

    return {
      sessionTelno,
      sessionUserType,
      seatArray,
      matchNumber,
      bidStatus,
      originalSeats,
      message,
      seatCount,
      startSeatNumber,
      basePrice,
      showPrompt,
      seatUpdateMode,
      handleInputChange,
      handleRemoveRow,
      handleAddRow,
      handleSubmit,
      handleCreateNewArray,
      hidePrompt,
      handleSeatCountSubmit,
      columns,
    };
  },
};
</script>

<style scoped>
.full-width {
  width: 100%;
}

.q-btn {
  margin-top: 10px;
}

.message-box {
  padding: 10px;
  background-color: #f0f4c3;
  border: 1px solid #e0e0e0;
}

.input-prompt {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
}

@media (max-width: 600px) {
  .q-btn {
    width: 100%;
  }
}
</style>
