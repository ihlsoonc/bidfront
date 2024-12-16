<template>
  <q-page class="common-container">
    <!-- 입찰 상태 표시 컴포넌트 -->
    <BidStatus :bidStatus="bidStatus" />

    <!-- 메시지 표시 -->
    <div v-if="message" class="q-message q-pa-md bg-warning text-white">
      {{ message }}
    </div>
    <br />
    <div v-if="countBiddedSeats > 0" class="colomnflex-container">
      <div class="spaced-span">
        입찰 좌석수&nbsp;: {{ countBiddedSeats }}개 &nbsp; 입찰금액 합계:
        {{ totalBidAmount }}원&nbsp;&nbsp; 입찰내용이 있는 좌석은 윤곽선으로
        표시됨.
      </div>
    </div>
    <br />
    <!-- 좌석 배치도 컴포넌트 -->
    <SeatMap
      :selectedSeats="selectedSeats"
      @seatClick="handleSeatClick"
      :disabled="isClosedBid"
      :bidsArray="allSeatBidArray"
    />
    <br />
    <BidsListAdmin :seats="bidsArray" />
    <div class="columnflex-container q-gutter-md">
      <q-card-section>
        <!-- 낙찰 관련 버튼들 -->
        <q-btn
          push
          color="white"
          text-color="blue-grey-14"
          label="낙찰 진행"
          @click="handleAwardBid"
          :disable="!canAwardBid"
        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <q-btn
          push
          color="white"
          text-color="blue-grey-14"
          label="낙찰 결과 알림톡 보내기"
          @click="handleSendAlimtalk"
          :disable="!canSendAlimtalk"
        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

        <q-btn
          push
          color="white"
          text-color="deep-orange-14"
          label="데이터 다시 불러오기"
          @click="handleRefresh"
          :disable="!canReFetch"
        />
      </q-card-section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, watch } from "vue";
import { useRouter } from "vue-router";
import { Dialog } from "quasar";
import axiosInstance from "../utils/axiosInterceptor";

import BidStatus from "./BidStatus.vue";
import SeatMap from "./SeatMap.vue";
import BidsListAdmin from "./BidsListAdmin.vue";
import { APIs } from "../utils/APIs";
import { navigate } from "../utils/navigate";
import { getSessionContext, fetchSessionData } from "../utils/sessionFunctions";
import { showConfirmDialog } from "../utils/dialogUtils";
import { messageCommon } from "../utils/messageCommon";

// 라우터 설정 및 세션 변수
const router = useRouter();
const sessionContext = getSessionContext();
const localSessionData = fetchSessionData(sessionContext, ["matchNumber"]);
let matchNumber = 0;
let biddedSeatCount = 0; // 입찰된 좌석 수

const BID_WON = "Y";
const OPEN_BID = "입찰 진행중";
const CLOSED_BID = "입찰 종료";
const AWARDED_BID = "낙찰 완료";
const PAID_BID = "Y";
const ALIMTALK_SENT = "Y";

// UI 관련 상태 변수
const selectedHistoryButton = ref(-1); // 선택된 입찰 히스토리 버튼 상태
const bidStatus = ref({}); // 입찰 상태 데이터
const bidsArray = ref([]); // 현재 입찰 데이터 배열
const isClosedBid = ref(false); // 입찰 종료 여부
const canAwardBid = ref(false); // 낙찰 가능 여부
const canSendAlimtalk = ref(false); // 알림톡 전송 가능 여부
const canReFetch = ref(false); // 알림톡 전송 가능 여부
const selectedSeats = ref([]); // 선택된 좌석 배열
const allSeatBidArray = ref([]); // 전체 좌석 데이터 배열
const countBiddedSeats = ref(0); // 선택된 좌석 수
const totalBidAmount = ref(0); // 총 입찰 금액
const message = ref(""); // 사용자 메시지

const tableColumns = ref([
  // 입찰 내역 테이블 열 정의
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
    field: (row) => `${row.username} :`, // 최고 응찰자
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
    field: (row) => `${row.total_bidders} :`, // 총 입찰자 수
  },
  {
    name: "total_bids",
    label: "전체 내용 보기",
    align: "left",
    field: (row) => `${row.total_bids} :`, // 총 입찰 건 수
  },
]);

// `bidsArray` 감시
watch(
  () => bidsArray.value,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      // 데이터가 로드되었을 때 필요한 작업 수행
    }
  }
);

//새로운 경기내용 불러오기
const handleRefresh = async () => {
  await fetchBidStatus(matchNumber);
  await fetchBidsTallies(matchNumber);
  await fetchHighestBids(matchNumber);
  await fetchBidsDetail(matchNumber);
  setButtons();
};

// 낙찰을 진행하는 함수
const handleAwardBid = async () => {
  if (!canAwardBid.value) {
    Dialog.create({
      title: "오류",
      message: "낙찰을 진행할 수 없습니다. 입찰 종료 후 가능합니다.",
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    return;
  }

  showConfirmDialog({
    title: "낙찰 진행 확인",
    message: "낙찰을 진행하겠습니까?",
    okLabel: "예",
    cancelLabel: "아니오",
    onOk: () => {
      awardBid();
    },
    onCancel: () => {
      Dialog.create({
        title: "알림",
        message: "낙찰 진행이 취소 되었습니다.",
        ok: {
          label: "확인",
          color: "primary",
        },
        persistent: true,
      });
    },
  });
};

const awardBid = async () => {
  try {
    const response = await axiosInstance.post(APIs.AWARD_BID, {
      matchNumber: matchNumber,
    });

    if (response.status === 200) {
      Dialog.create({
        title: "알림",
        message: "성공적으로 낙찰 처리가 되었습니다.",
        ok: {
          label: "확인",
          color: "primary",
        },
        persistent: true,
      });
      message.value = response.data.message;
      await fetchBidStatus(matchNumber);
      await fetchHighestBids(matchNumber);
      await fetchBidsDetail(matchNumber);
      setButtons();
    }
  } catch (error) {
    handleError(error);
  }
};

// 알림톡 보내기

const handleSendAlimtalk = async () => {
  showConfirmDialog({
    title: "알림톡 전송 확인",
    message: "알림톡을 보내시겠습니까?",
    okLabel: "예",
    cancelLabel: "아니오",
    onOk: () => {
      sendAlimtalk();
    },
    onCancel: () => {
      Dialog.create({
        title: "알림",
        message: "알림톡 전송이 취소되었습니다.",
        ok: {
          label: "확인",
          color: "primary",
        },
        persistent: true,
      });
    },
  });
};

const sendAlimtalk = async () => {
  try {
    await axiosInstance.post(APIs.SEND_KAKAO_ALIMTALK, {
      matchNumber: matchNumber,
    });
    Dialog.create({
      title: "알림",
      message: "알림톡이 전송되었습니다.",
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    canSendAlimtalk.value = false;
  } catch (error) {
    Dialog.create({
      title: "알림",
      message: "알림톡 전송 중 오류가 발생하였습니다.",
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    handleError(error);
  }
};

// 입찰 상태를 가져오는 함수
const fetchBidStatus = async (matchNumber) => {
  try {
    const response = await axiosInstance.get(APIs.GET_BID_STATUS, {
      params: { matchNumber: matchNumber },
    });

    if (response.status === 200) {
      bidStatus.value = response.data;
    }
  } catch (error) {
    handleError(error);
  }
};

//각 좌석별 최고 입찰내역
const fetchHighestBids = async (matchNumber) => {
  try {
    const response = await axiosInstance.get(APIs.GET_HIGHEST_BIDS, {
      params: { matchNumber: matchNumber },
    });

    // 낙찰된 총 금액과 낙찰된 항목의 수를 계산할 변수
    bidsArray.value = response.data.map((seat) => {
      // 낙찰 여부에 따라 total_win_amount와 total_win_count를 업데이트
      if (
        bidStatus.value.bid_status_name === AWARDED_BID &&
        seat.bid_won === BID_WON
      ) {
      }
      return {
        ...seat,
        bidWonStatus:
          bidStatus.value.bid_status_name === AWARDED_BID
            ? seat.bid_won === BID_WON
              ? "낙찰"
              : "유찰"
            : " ",
        paidStatus:
          bidStatus.value.bid_won === BID_WON
            ? seat.bid_paid === PAID_BID
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
    const response = await axiosInstance.get(APIs.GET_ALL_BIDS, {
      params: { matchNumber: matchNumber },
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
    const response = await axiosInstance.get(APIs.GET_BID_TALLIES, {
      params: {
        telno: localSessionData.telno,
        matchNumber: matchNumber,
      },
    });

    allSeatBidArray.value = response.data.map((seat) => {
      const uniqueSeatId = Number(seat.seat_no);
      if (seat.total_bidders > 0) {
        biddedSeatCount += 1;
      }
      return { ...seat, uniqueSeatId: uniqueSeatId };
    });

    selectedSeats.value = allSeatBidArray.value.filter(
      (seat) => seat.total_bidders > 0
    );
    countBiddedSeats.value = selectedSeats.value.length;
  } catch (error) {
    handleError(error);
  }
};

const handleSeatClick = (index) => {
  //no action here : 사용자 입찰화면에서 사용됨
};

const setButtons = () => {
  // 버튼 초기화
  canAwardBid.value = false;
  canSendAlimtalk.value = false;
  canReFetch.value = false;

  const { bid_status_name, alimtalk_sent } = bidStatus.value;
  // 경매 상태에 따라 버튼 활성화 설정
  if (bid_status_name === CLOSED_BID && biddedSeatCount > 0) {
    canAwardBid.value = true;
  }

  if (bid_status_name === AWARDED_BID && alimtalk_sent !== ALIMTALK_SENT) {
    canSendAlimtalk.value = true;
  }

  if (bid_status_name === OPEN_BID) {
    canReFetch.value = true;
  }
};

// 에러 핸들링

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

onBeforeMount(async () => {
  matchNumber = localSessionData.matchNumber;
  if (matchNumber) {
    try {
      await fetchBidStatus(matchNumber);
      await fetchBidsTallies();
      await fetchHighestBids(matchNumber);
      await fetchBidsDetail(matchNumber);
      setButtons();
    } catch (error) {
      handleError(error);
    }
  } else {
    alert("경기를 먼저 선택해주세요.");
    navigate(router, sessionContext, "selectMatch");
  }
});

// 세션 데이터 및 데이터 불러오기
onMounted(async () => {
  // matchNumber = localSessionData.matchNumber;
  // if (matchNumber) {
  //   try {
  //     await fetchBidStatus(matchNumber);
  //     await fetchBidsTallies();
  //     await fetchHighestBids(matchNumber);
  //     await fetchBidsDetail(matchNumber);
  //     setButtons();
  //   } catch (error) {
  //     handleError(error);
  //   }
  // } else {
  //   alert("경기를 먼저 선택해주세요.");
  //   navigate(router, sessioncontext, "selectMatch");
  // }
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
