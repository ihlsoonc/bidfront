<template>
  <q-page class="common-container">
    <BidStatus :bidStatus="bidStatus" />
    <div v-if="message" class="q-message q-pa-md bg-warning text-white">
      {{ message }}
    </div>
    <div class="buttons-container">
      <q-option-group
        inline
        :options="radioOptions"
        v-model="selectedAction"
        @update:model-value="handleActionChange"
        class="q-mt-sm"
      />
    </div>

    <!-- SeatMap 컴포넌트 -->
    <SeatMap
      :selectedSeats="selectedSeats"
      @seatClick="handleSeatClick"
      :disabled="isClosedBid"
      :seatBidArray="allSeatBidArray"
    />

    <div class="columnflex-container q-gutter-md">
      <q-card-section>
        <q-btn
          push
          color="white"
          text-color="blue-grey-14"
          label="낙찰 진행"
          @click="handleAwardBid"
          :disable="isClosedBid"
        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn
          push
          color="white"
          text-color="blue-grey-14"
          label="낙찰 결과 알림톡 보내기"
          @click="handleSendAlimtalk"
        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn
          push
          color="white"
          text-color="blue-grey-14"
          label="경기 다시 선택하기"
          @click="handleReSelect"
        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn
          push
          color="white"
          text-color="deep-orange-14"
          label="데이터 다시 불러오기"
          @click="handleRefresh"
        />
      </q-card-section>

      <div v-if="countSelectedSeats > 0" class="colomnflex-container">
        <div class="spaced-span">
          선택된 좌석수&nbsp;: {{ countSelectedSeats }}개&nbsp; 입찰
          좌석수&nbsp;: {{ countbiddedSeats }}개&nbsp; 입찰금액 합계:
          {{ bidTotal }}원 &nbsp; 합계 : {{ minBidAmount }}원
        </div>
      </div>
      <BidsListAdmin
        :seats="bidsArray"
        :tableColumns="tableColumns"
        :selectedHistoryButton="selectedHistoryButton"
        :totalWinAmount="totalWinAmount"
        :totalWinCount="totalWinCount"
        :totalBidAmount="totalBidAmount"
        :isApproved="isApproved"
        @toggleHistory="toggleHistory"
      />
      <div v-if="countSelectedSeats > 0">
        <!-- 입찰금액입력란 및 제출결과 필드 Show -->
        <!-- <SelectedSeatsDetails
          :selectedSeats="selectedSeats"
          :bidAmounts="[]"
          :isUser="isUser"
          :isClosedBid="isClosedBid"
        /> -->
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

import BidStatus from "./BidStatus.vue";
import SeatMap from "./SeatMap.vue";
import SelectedSeatsDetails from "./SelectedSeatsDetails.vue";
import BidsListAdmin from "./BidsListAdmin.vue";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";
import { navigate } from "../utils/navigate";
import { fetchLocalSession, fetchSessionUser } from "../utils/sessionFunctions";

const router = useRouter();
let localSessionData = {};
let sessionResults = {};
let matchNumber = 0;
const selectedHistoryButton = ref(-1);
const radioOptions = [
  { label: "전체좌석 보기", value: "all" },
  { label: "입찰좌석 보기", value: "bidded" },
];
const tableColumns = ref([
  {
    name: "bidWonStatus",
    required: true,
    label: "낙찰 상태",
    align: "left",
    field: (row) => row.bidWonStatus, // 낙찰 여부
  },
  {
    name: "seat_info",
    required: true,
    label: "좌석 정보",
    align: "left",
    field: (row) =>
      `${row.seat_no} (${row.row_no}열 ${row.col_no}번) ${row.paidStatus}`, // 좌석 번호와 결제 상태
  },
  {
    name: "user_info",
    label: "최고 응찰자",
    align: "left",
    field: (row) => `${row.username} :`, // 사용자명
  },
  {
    name: "bid_amount",
    label: "입찰 금액 및 시간",
    align: "left",
    field: (row) =>
      `${row.bid_amount.toLocaleString()}원 : ${formatTimeToLocal(row.bid_at)}`, // 입찰 금액과 시간
  },
  {
    name: "total_bidders",
    label: "입찰자 수",
    align: "left",
    field: (row) => `${row.total_bidders} :`, // 사용자명
  },
  {
    name: "total_bids",
    label: "전체 내용 보기",
    align: "left",
    field: (row) => `${row.total_bids} :`, // 사용자명
  },
]);

const bidsArray = ref([]);
// const isUser = ref(false);
const isClosedBid = ref(false);
const isApproved = ref(false);
const bidStatus = ref({});
const biddedSeatCount = ref(0);
const canAwardBid = ref(false);
const selectedSeats = ref([]);
const allSeatBidArray = ref([]);
const countSelectedSeats = ref(0);
const clickCount = ref(0);
const countbiddedSeats = ref(0);
const minBidAmount = ref(0);
const bidTotal = ref(0);
const totalBidAmount = ref(0);
const totalWinAmount = ref(0);
const totalWinCount = ref(0);
const message = ref("");
const selectedAction = ref("all");

// 좌석 클릭 처리 함수
const handleSeatClick = (index) => {
  const MAX_SELECTION = 100;
  let updatedSeats;

  if (selectedSeats.value.some((seat) => seat.uniqueSeatId === index)) {
    updatedSeats = selectedSeats.value.filter(
      (seat) => seat.uniqueSeatId !== index
    );
  } else {
    if (selectedSeats.value.length >= MAX_SELECTION) {
      alert(`최대 ${MAX_SELECTION}개의 좌석만 선택할 수 있습니다.`);
      return;
    }
    const seatData = allSeatBidArray.value.find(
      (seat) => seat.uniqueSeatId === index
    );
    if (seatData) {
      updatedSeats = [...selectedSeats.value, seatData];
      clickCount.value += 1;
    } else {
      alert("선택한 좌석의 최저입찰가가 없습니다. 관리자에게 문의하세요.");
      return;
    }
  }

  selectedSeats.value = updatedSeats;
  countSelectedSeats.value = updatedSeats.length;
};

// 경기 다시 선택
const handleReSelect = () => {
  navigate(router, localSessionData.userClass, "selectVenue");
};

//새로운 경기내용 불러오기
const handleRefresh = async () => {
  await fetchHighestBids(matchNumber);
  await fetchBidsDetail(matchNumber);
};

// 전체 좌석 선택 시 처리 함수
const handleAllClick = () => {
  countbiddedSeats.value = 0;
  message.value = "";
  minBidAmount.value = 0;
  bidTotal.value = 0;
  clickCount.value = 0;
  selectedSeats.value = allSeatBidArray.value;
  countSelectedSeats.value = selectedSeats.value.length;
};

// 낙찰을 진행하는 함수
const handleAwardBid = async () => {
  // if (!canAwardBid.value) {
  //   alert("낙찰을 진행할 수 없습니다.");
  //   return;
  // }

  //테스트를 위해 계속 낙찰할 수 있도록
  const isConfirmed = window.confirm("낙찰을 진행하겠습니까?");
  if (!isConfirmed) return;

  try {
    const response = await axios.post(APIs.AWARD_BID, {
      matchNumber: matchNumber,
    });
    if (response.status === 200) {
      alert("성공적으로 낙찰 처리가 되었습니다.");
      message.value = response.data.message;
      await fetchBidStatus(matchNumber);
      canAwardBid.value = false;
    }
  } catch (error) {
    handleError(error);
  }

  try {
    const response = await axios.post(APIs.AWARD_BID, {
      matchNumber: matchNumber,
    });
    if (response.status === 200) {
      alert("성공적으로 낙찰 처리가 되었습니다.");
      message.value = response.data.message;
      await fetchBidStatus(matchNumber);
      canAwardBid.value = false;
    }
  } catch (error) {
    handleError(error);
  }
};

// 알림톡 보내기
const handleSendAlimtalk = async () => {
  const isConfirmed = window.confirm("알림톡을 보내시겠습니까?");
  if (!isConfirmed) return;

  try {
    await axios.post(
      APIs.SEND_KAKAO_ALIMTALK,
      { matchNumber: matchNumber },
      { withCredentials: true }
    );
    alert("알림톡이 전송되었습니다.");
  } catch (error) {
    handleError(error);
  }
};

// 입찰 상태를 가져오는 함수
const fetchBidStatus = async (matchNumber) => {
  try {
    const response = await axios.get(
      APIs.GET_BIDSTATUS,
      { params: { matchNumber: matchNumber } },
      { withCredentials: true }
    );

    if (response.status === 200) {
      bidStatus.value = response.data;
      if (bidStatus.value.bidStatusCode == "C" && biddedSeatCount.value > 0) {
        canAwardBid.value = true;
      }
    }
  } catch (error) {
    handleError(error);
  }
};

//각 좌석별 최고 입찰내역
const fetchHighestBids = async (matchNumber) => {
  try {
    const response = await axios.get(APIs.GET_HIGHEST_BIDS, {
      params: { matchNumber: matchNumber },
      withCredentials: true,
    });
    // 낙찰된 총 금액과 낙찰된 항목의 수를 계산할 변수
    bidsArray.value = response.data.map((seat) => {
      // 낙찰 여부에 따라 total_win_amount와 total_win_count를 업데이트
      if (bidStatus.value.bid_open_status === "F" && seat.bid_won === "Y") {
        totalWinAmount.value += seat.bid_amount || 0;
        totalWinCount.value++;
      }
      return {
        ...seat,
        bidWonStatus:
          bidStatus.value.bid_open_status === "F"
            ? seat.bid_won === "Y"
              ? "낙찰"
              : "유찰"
            : " ",
        paidStatus:
          bidStatus.value.bid_open_status === "F"
            ? seat.bid_paid === "Y"
              ? "결제완료"
              : "미결제"
            : " ",
        historyButtonEnabled: false,
        historyShow: false,
      };
    });

    // 총 입찰 금액을 계산
    totalBidAmount.value = bidsArray.value.reduce(
      (sum, seat) => sum + (seat.bid_amount || 0),
      0
    );
  } catch (error) {
    handleError(error);
  }
};

//전체 낙찰 내역
const fetchBidsDetail = async (matchNumber) => {
  try {
    const response = await axios.get(APIs.GET_ALL_BIDS, {
      params: { matchNumber: matchNumber },
      withCredentials: true,
    });

    // 서버에서 받아온 데이터를 bidsArray에 매핑
    response.data.forEach((seat) => {
      // seat_no가 동일한 항목을 찾음 (string, number 비교 문제 해결을 위해 String 변환)
      const existingSeat = bidsArray.value.find(
        (bid) => String(bid.seat_no) === String(seat.seat_no)
      );

      // bidHistory가 없다면 bid 정보를 기반으로 새로 생성
      const bidHistory = seat.bidHistory || [
        {
          bid_amount: seat.bid_amount,
          bid_at: seat.bid_at,
          username: seat.username,
        },
      ];

      if (existingSeat) {
        // 기존 항목에 데이터를 추가 (bidHistory 등 필요에 따라 추가)
        existingSeat.bidHistory = existingSeat.bidHistory || []; // null 방지, 빈 배열로 초기화
        existingSeat.bidHistory = [...existingSeat.bidHistory, ...bidHistory]; // 새 이력 추가

        existingSeat.historyButtonEnabled = existingSeat.bidHistory.length > 1;
        existingSeat.historyShow = false;
      } else {
        console.log("오류: 좌석번호가 match되지 않는 이력이 있습니다.:", seat); // 새로 추가할 좌석 데이터를 출력
      }
    });
  } catch (error) {
    console.error("에러 발생:", error); // 에러가 발생한 경우 로그 출력
    handleError(error);
  }
};

//좌석 box안의 입찰자수 최고 입찰액 표시
const fetchBidsTallies = async () => {
  try {
    const response = await axios.get(APIs.GET_BID_TALLIES, {
      params: {
        telno: sessionResults.telno,
        matchNumber: matchNumber,
      },
    });

    allSeatBidArray.value = response.data.map((seat) => {
      const uniqueSeatId = Number(seat.seat_no);
      if (seat.total_bidders > 0) {
        biddedSeatCount.value += 1;
      }
      return { ...seat, uniqueSeatId: uniqueSeatId };
    });

    selectedSeats.value = allSeatBidArray.value.filter(
      (seat) => seat.total_bidders > 0
    );
    countSelectedSeats.value = selectedSeats.value.length;
  } catch (error) {
    handleError(error);
  }
};

const toggleHistory = (seat) => {
  if (selectedHistoryButton.value === seat.seat_no) {
    seat.historyShow = false;
    selectedHistoryButton.value = -1;
  } else {
    selectedHistoryButton.value = seat.seat_no;
    seat.historyShow = true;
  }
};

// 에러 핸들링
const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

watch(
  selectedSeats,
  () => {
    const minBidAmountCalc = selectedSeats.value.reduce((sum, seat) => {
      const chosenAmount =
        seat.current_bid_amount > 0 ? seat.current_bid_amount : seat.seat_price;
      return sum + (chosenAmount || 0);
    }, 0);
    minBidAmount.value = minBidAmountCalc;

    const bidtotal = selectedSeats.value.reduce((sum, seat) => {
      return sum + (seat.current_bid_amount || 0);
    }, 0);
    bidTotal.value = bidtotal;
  },
  { deep: true }
);

const handleActionChange = (value) => {
  if (value === "all") {
    handleAllClick();
  } else if (value === "bidded") {
    handleBiddedSeat();
  }
};

onMounted(async () => {
  localSessionData = fetchLocalSession(["matchNumber", "userClass"]);
  matchNumber = localSessionData.matchNumber;
  if (matchNumber) {
    try {
      sessionResults = await fetchSessionUser(localSessionData.userClass);
      await fetchBidStatus(matchNumber);
      await fetchBidsTallies();
      await fetchHighestBids(matchNumber);
      await fetchBidsDetail(matchNumber);
    } catch (error) {
      handleError(error);
    }
  } else {
    alert("경기를 먼저 선택해주세요.");
    navigate(router, localSessionData.userClass, "selectMatch");
  }
});
</script>

<style scoped>
.spaced-span {
  margin-right: 10px;
}

.q-message {
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
}

.full-width {
  width: 100%;
}
</style>
