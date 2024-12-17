<template>
  <q-page class="common-container">
    <!-- 입찰 상태 표시 -->
    <BidStatus :bidStatus="bidStatus" />
    <!-- 일괄 입찰 내용용 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div>총 좌석 갯수 :{{ totalSeatCount }}&nbsp;&nbsp;</div>
        <div>
          좌석 가격 합계 :
          {{ totalSeatPrice }} 원
        </div>
        <div>
          일괄 예약 상태:<strong>{{
            bidStatus.reserved === "Y" ? "신청 완료" : "미신청"
          }}</strong>
        </div>
        <div>
          예약 금액: <strong>{{ bidStatus.reserved_amount }}원</strong>
        </div>
        <div v-if="bidStatus.reserved == 'Y'">
          예약 승인 상태:<strong>{{
            bidStatus.reserved_approval === "Y" ? "승인 완료" : "대기"
          }}</strong>
        </div>
        <div v-if="bidStatus.reserved_approval !== 'Y'">
          예약 금액:
          <q-input
            v-model="bidStatus.reserved_amount"
            type="number"
            dense
            outlined
            @input="updateReservedAmount(bidStatus.reserved_amount)"
          />
        </div>
      </q-card-section>
    </q-card>
    <div>
      <q-btn
        v-if="bidStatus.reserved_approval !== 'Y'"
        @click="handleBidSubmit"
        color="primary"
        label="입찰 제출"
      />&nbsp;&nbsp;
      <q-btn
        @click="handleShowDetail"
        color="secondary"
        label="좌석별 가격 보기"
      />
    </div>
    <!-- 좌석별 가격 리스트 -->
    <q-list v-if="showSeatDetails" bordered class="rounded-borders q-mt-md">
      <q-item v-for="seat in seatPrices" :key="seat.seat_no">
        <q-item-section>
          <div>
            좌석번호 : {{ seat.seat_no }} ({{ seat.row_no }} 열
            {{ seat.col_no }}번) {{ seat.seat_price }}원
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axiosInstance from "../utils/axiosInterceptor";
import { Dialog } from "quasar";

import BidStatus from "./BidStatus.vue";
import { navigate } from "../utils/navigate";
import { getSessionContext, fetchSessionData } from "../utils/sessionFunctions";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

const BID_OPEN = "입찰 진행중";

let matchNumber = 0;
const sessionContext = getSessionContext();
const localSessionData = fetchSessionData(sessionContext, [
  "username",
  "matchNumber",
  "telno",
]);

const router = useRouter();

const isClosedBid = ref(false);
const seatPrices = ref([]);
const totalSeatPrice = ref(0);
const totalSeatCount = ref(0);
const bidStatus = ref({
  reserved: "",
  reserved_approval: "",
  reserved_amount: 0,
  match_no: null,
});
const message = ref("");
const showSeatDetails = ref(false); // 좌석 가격 리스트 표시 여부
let alreadyReserved = false;
let prevBidAmount = 0;

const handleShowDetail = () => {
  showSeatDetails.value = !showSeatDetails.value; // 표시 여부 토글
};

const fetchBidStatus = async (matchNumber) => {
  try {
    const response = await axiosInstance.get(APIs.GET_BID_STATUS, {
      params: { matchNumber: matchNumber },
    });

    // 상태 업데이트
    bidStatus.value = response.data;
    alreadyReserved = bidStatus.value.reserved === "Y";
    prevBidAmount = bidStatus.value.reserved_amount;
    // 입찰 상태가 "입찰 진행중"인지 확인
    if (response.data.bid_status_name !== BID_OPEN) {
      isClosedBid.value = true;
    } else {
    }
  } catch (error) {
    handleError(error);
  }
};

const fetchSeatPrices = async (matchNumber) => {
  try {
    const response = await axiosInstance.get(APIs.GET_SEATPRICES, {
      params: { matchNumber: matchNumber },
    });
    seatPrices.value = response.data;
    const totals = seatPrices.value.reduce(
      (acc, seat) => {
        acc.totalPrice += seat.seat_price;
        acc.totalCount += 1; // 각 좌석은 count가 1로 고정
        return acc;
      },
      { totalPrice: 0, totalCount: 0 }
    );

    totalSeatPrice.value = totals.totalPrice;
    totalSeatCount.value = totals.totalCount;
  } catch (error) {
    handleError(error);
  }
};

const handleBidSubmit = async () => {
  const reserved_amount = bidStatus.value.reserved_amount;
  if (prevBidAmount == reserved_amount) {
    Dialog.create({
      title: "오류",
      message: `같은 금액으로 수정 제출할 수 없습니다.`,
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    return;
  }

  if (reserved_amount <= totalSeatPrice.value) {
    Dialog.create({
      title: "오류",
      message: `입찰 금액을 확인하세요. \n 현재 좌석 가격보다 커야 합니다..`,
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    return;
  }

  if (bidStatus.value.reserved == "Y") {
    Dialog.create({
      title: "제출 확인",
      message: `이미 제출한 내용을 ${reserved_amount}원으로 수정 제출하겠습니까?`,
      cancel: true, // '취소' 버튼을 추가
      persistent: true, // 모달 외부를 클릭해도 닫히지 않도록 설정
      ok: {
        label: "예",
        color: "primary",
      },
      cancel: {
        label: "아니오",
        color: "negative",
      },
    })
      .onOk(() => {
        submitBid();
        return;
      })
      .onCancel(() => {
        Dialog.create({
          title: "작업 취소",
          message: `제출이 취소되었습니다.`,
          ok: {
            label: "확인",
            color: "primary",
          },
          persistent: true,
        });
        return;
      });
  } else {
    Dialog.create({
      title: "입찰 내용 제출",
      message: `입찰 금액 ${reserved_amount}원으로 제출됩니다. 진행하시겠습니까?`,
      cancel: true, // '취소' 버튼을 추가
      persistent: true, // 모달 외부를 클릭해도 닫히지 않도록 설정
      ok: {
        label: "예",
        color: "primary",
      },
      cancel: {
        label: "아니오",
        color: "negative",
      },
    })
      .onOk(() => {
        submitBid();
      })
      .onCancel(() => {
        Dialog.create({
          title: "작업 취소",
          message: `제출이 취소되었습니다.`,
          ok: {
            label: "확인",
            color: "primary",
          },
          persistent: true,
        });
        return;
      });
  }
};
const submitBid = async () => {
  try {
    const response = await axiosInstance.post(APIs.SUBMIT_BATCH_BID, {
      telno: localSessionData.telno,
      matchNumber: matchNumber,
      bidAmount: bidStatus.value.reserved_amount || 0,
    });

    if (response.status === 200) {
      // 응답 상태가 200일 경우
      Dialog.create({
        title: "알림",
        message: `성공적으로 입찰이 등록되었습니다.`,
        ok: {
          label: "확인",
          color: "primary",
        },
        persistent: true,
      });
      message.value = response.data.message;
      fetchData();
    }
  } catch (error) {
    handleError(error);
  }
};

const handleBackToSelect = () => {
  alert("경기를 선택해주세요.");
  navigate(router, sessionContext, "selectVenue");
};

const fetchData = async () => {
  try {
    await fetchBidStatus(matchNumber);
    await fetchSeatPrices(matchNumber);
  } catch (error) {
    handleError(error);
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

onMounted(async () => {
  if (!localSessionData || !localSessionData.telno) {
    alert("사용자 정보가 없습니다.  다시 로그인해주세요.");
  }
  matchNumber = localSessionData.matchNumber;
  if (!matchNumber) {
    alert("경기를 먼저 선택해주세요.");
    handleBackToSelect();
  }
  fetchData();
});
</script>

<style scoped>
/* Quasar 스타일을 사용하지만, 필요시 기본 스타일을 추가로 적용 */
.accordion-content {
  background-color: #f1f1f1;
  padding: 10px;
  border: 1px solid #ddd;
  margin-top: 5px;
  border-radius: 5px;
}
</style>
