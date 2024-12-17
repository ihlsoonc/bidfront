<template>
  <q-page class="common-container">
    <!-- 입찰 상태 표시 -->
    <BidStatus :bidStatus="bidStatus" />
    <!-- 좌석 목록 컴포넌트 -->
    <BidsList
      :seats="myBidsArray"
      :tableColumns="tableColumns"
      :selectedHistoryButton="selectedHistoryButton"
      :totalWinAmount="totalWinAmount"
      :totalWinCount="totalWinCount"
      :totalBidAmount="totalBidAmount"
      @toggleHistory="toggleHistory"
      @paySubmit="handlePaySubmit"
      @selectVenue="handleSelectVenue"
    />
    <!-- 새로운 입찰 입력 섹션 -->
    <q-card v-if="!isClosedBid" class="q-pa-md">
      <!-- 좌석박스 및 입찰자수 최고가 표시  -->
      <q-card-section>
        <SeatMap
          :selectedSeats="selectedSeats"
          :bidsArray="allBidsArray"
          :disabled="isClosedBid"
          @seatClick="handleSeatClick"
        />
      </q-card-section>
      <!-- 선택된 좌석 정보와 입찰 금액 -->
      <q-card-section>
        <SelectedSeatsDetails
          :selectedSeats="selectedSeats"
          :bidAmounts="bidAmounts"
          @bidAmountChange="handleBidAmountChange"
          :isClosedBid="isClosedBid"
          @submit-bid="handleSubmitBid"
          @cancel-bid="handleCancelSubmit"
        />
      </q-card-section>
      <q-card-section v-if="message">
        <q-banner color="deep-orange-14">{{ message }}</q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axiosInstance from "../utils/axiosInterceptor";
import { Dialog } from "quasar";

import BidStatus from "./BidStatus.vue";
import BidsList from "./BidsList.vue";
import SeatMap from "./SeatMap.vue";
import SelectedSeatsDetails from "./SelectedSeatsDetails.vue";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";
import { navigate } from "../utils/navigate";
import { getSessionContext, fetchSessionData } from "../utils/sessionFunctions";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

const MAX_SELECTION = 5;
const BID_OPEN = "입찰 진행중";

let matchNumber = 0;
const sessionContext = getSessionContext();
const localSessionData = fetchSessionData(sessionContext, [
  "username",
  "matchNumber",
  "telno",
]);

let queryTelno = "";
let paymentData = {};
const router = useRouter();

const isClosedBid = ref(false);
const selectedHistoryButton = ref(-1);
const myBidsArray = ref([]);
const allBidsArray = ref([]);
const selectedSeats = ref([]);

// const clickCount = ref(0);
const bidAmounts = ref({});
const totalBidAmount = ref(0);
const totalWinAmount = ref(0);
const totalWinCount = ref(0);
const bidStatus = ref({});

const message = ref("");
const tableColumns = ref([
  {
    name: "bidWonStatus",
    required: true,
    label: "낙찰상태",
    align: "left",
    field: (row) => row.bidWonStatus,
  },
  {
    name: "seat_no",
    required: true,
    label: "좌석번호",
    align: "left",
    field: (row) => row.seat_no,
  },
  { name: "bid_amount", label: "입찰 금액", align: "left" },
  { name: "highest_bid_amount", label: "현재 최고가", align: "left" },
  { name: "bidHistory", label: "이력", align: "left" },
]);

//경기정보를 fetch
const fetchBidStatus = async (matchNumber) => {
  try {
    const response = await axiosInstance.get(APIs.GET_BID_STATUS, {
      params: { matchNumber: matchNumber },
    });
    bidStatus.value = response.data;
    if (response.data.bid_status_name !== BID_OPEN) {
      isClosedBid.value = true;
    }
  } catch (error) {
    handleError(error);
  }
};

//사용자의 좌석별 마지막 입찰목록 fetch
const fetchMyLast = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_MY_LASTBIDS, {
      params: { telno: localSessionData.telno, matchNumber: matchNumber },
    });
    // 낙찰된 총 금액과 낙찰된 항목의 수를 계산할 변수
    myBidsArray.value = response.data.map((seat) => {
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
    totalBidAmount.value = myBidsArray.value.reduce(
      (sum, seat) => sum + (seat.bid_amount || 0),
      0
    );
  } catch (error) {
    handleError(error);
  }
};

//사용자의 좌석별 모든 입찰목록 fetch : bidHistoty를 구성하여 내역보기에 사용용
const fetchMyBids = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_MY_BIDS, {
      params: { telno: localSessionData.telno, matchNumber: matchNumber },
    });

    // 서버에서 받아온 데이터를 bidsArray에 매핑 또는 업데이트
    response.data.forEach((seat) => {
      // seat_no가 동일한 항목을 찾음 (string, number 비교 문제 해결을 위해 String 변환)
      const existingSeat = myBidsArray.value.find(
        (bid) => String(bid.seat_no) === String(seat.seat_no)
      );

      // bidHistory가 없다면 bid 정보를 기반으로 새로 생성
      const bidHistory = seat.bidHistory || [
        {
          bid_amount: seat.bid_amount,
          bid_at: seat.bid_at,
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
    handleError(error);
  }
};

//좌석Map에 입찰자수 최고 입찰금액을 보여주기위한 fetch
const fetchBidTallies = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_BID_TALLIES, {
      params: { matchNumber: matchNumber },
    });

    // 서버에서 좌석별 입찰자 수와 최고 입찰 금액을 포함하여 데이터를 가져옴
    allBidsArray.value = response.data.map((seat) => {
      return {
        ...seat,
        seat_no: seat.seat_no,
        highest_bid_amount: seat.current_bid_amount || 0, // 최고 입찰 금액 추가
        bid_count: seat.total_bidders || 0, // 입찰자 수 추가
      };
    });
  } catch (error) {
    handleError(error);
  }
};

//좌석을 click할 때의 처리
const handleSeatClick = (index) => {
  selectedSeats.value = selectedSeats.value.some(
    (seat) => seat.uniqueSeatId === index
  )
    ? selectedSeats.value.filter((seat) => seat.uniqueSeatId !== index) // 이미 선택된 좌석이면 해당 좌석을 리스트에서 제거
    : [...selectedSeats.value, { seat_no: index, uniqueSeatId: index }]; // 선택되지 않은 좌석이면 리스트에 추가

  // 선택한 좌석의 수 확인
  if (selectedSeats.value.length > MAX_SELECTION) {
    Dialog.create({
      title: "오류",
      message: `최대 ${MAX_SELECTION}개의 좌석만 선택할 수 있습니다.`,
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    // 초과된 좌석을 제거하고 최대 개수까지만 유지
    selectedSeats.value = selectedSeats.value.slice(0, MAX_SELECTION);
  }

  // 선택된 좌석이 있을 때만 데이터를 새로 가져옴 (입찰 중인 경우 데이터가 계속변함)
  if (selectedSeats.value.length > 0) {
    fetchSeatData(
      matchNumber,
      selectedSeats.value,
      (data) => {
        selectedSeats.value = data;
      },
      (msg) => {
        message.value = msg;
      }
    );
  }
};

//좌석목록으로 각 좌석의 최신 입찰 최고가 등을 조회
const fetchSeatData = async (
  matchNumber,
  selectedSeats,
  setSelectedSeats,
  setMessage
) => {
  try {
    // selectedSeats가 배열인지 확인하고 좌석 번호 배열 생성
    const seatNoArray =
      selectedSeats && Array.isArray(selectedSeats)
        ? selectedSeats.map((seat) => seat.seat_no)
        : [];

    if (seatNoArray.length > 0) {
      // APIs 요청하여 좌석별 데이터를 가져옴
      const response = await axiosInstance.post(APIs.GET_BIDS_BY_SEATARRAY, {
        seatNoArray,
        matchNumber,
      });

      const fetchedData = response.data;

      // fetchedData를 seat_no 기준으로 매핑
      const fetchedDataMap = fetchedData.reduce((acc, data) => {
        acc[data.seat_no] = data;
        return acc;
      }, {});

      // selectedSeats의 각 좌석에 fetchedData를 매핑하여 업데이트
      const updatedSeatsWithData = selectedSeats.map((seat) => ({
        ...seat,
        ...fetchedDataMap[seat.seat_no], // fetchedDataMap에서 데이터 가져오기
        row_no: fetchedDataMap[seat.seat_no]?.row_no ?? "0", // undefined일 때 "0"을 기본값으로
        col_no: fetchedDataMap[seat.seat_no]?.col_no ?? "0", // undefined일 때 "0"을 기본값으로
        seat_price: fetchedDataMap[seat.seat_no]?.seat_price ?? 0, // undefined일 때 0을 기본값으로
        total_bidders: fetchedDataMap[seat.seat_no]?.total_bidders ?? 0, // undefined일 때 0을 기본값으로
        current_bid_amount:
          fetchedDataMap[seat.seat_no]?.current_bid_amount ?? 0, // undefined일 때 0을 기본값으로
      }));
      // 좌석 데이터 업데이트
      setSelectedSeats(updatedSeatsWithData);
    }
  } catch (error) {
    // 에러 처리
    setMessage && setMessage("데이터를 가져오는 중 오류가 발생했습니다.");
    handleError(error);
  }
};

//입찰 제출전 validation 및 확인
const handleSubmitBid = async (bidTotal) => {
  // 최소 입찰가보다 낮은 입찰을 필터링하는 함수
  const getMinBidPrice = (seat) => {
    return seat.current_bid_amount > 0
      ? seat.current_bid_amount
      : seat.seat_price;
  };

  // 선택된 좌석 중 유효하지 않은 좌석 필터링
  const invalidSeats = selectedSeats.value.filter((seat) => {
    const minBidPrice = getMinBidPrice(seat) || 0;

    const currentBid = bidAmounts.value[seat.uniqueSeatId] || 0;
    return currentBid <= minBidPrice;
  });

  // 유효하지 않은 입찰이 있으면 경고 메시지를 표시하고 중단
  if (invalidSeats.length > 0) {
    const seatNumbers = invalidSeats.map((seat) => seat.seat_no).join(", ");
    Dialog.create({
      title: "오류",
      message: `좌석 ${seatNumbers}의 입찰 금액을 확인하세요. \n 현재 최고 입찰 금액과 좌석 가격보다 커야 합니다..`,
      ok: {
        label: "확인",
        color: "primary",
      },
      persistent: true,
    });
    return;
  }

  // 총 입찰 금액 확인 메시지
  const confirmMessage = `입찰 금액 ${bidTotal}원으로 제출됩니다. 진행하시겠습니까?`;

  Dialog.create({
    title: "입찰 내용 제출",
    message: confirmMessage,
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
};

//입찰 제출
const submitBid = async () => {
  try {
    const response = await axiosInstance.post(
      APIs.SUBMIT_BID, // API URL
      {
        telno: localSessionData.telno, // 요청 데이터
        matchNumber: matchNumber,
        bidArray: selectedSeats.value.map((seat) => ({
          matchNumber: seat.match_no,
          seatNo: seat.seat_no,
          bidAmount: bidAmounts.value[seat.uniqueSeatId] || 0,
        })),
      }
    );

    const fetchedData = response.data;
    const fetchedDataMap = fetchedData.reduce((acc, data) => {
      acc[data.seat_no] = data; // seat_no를 키로 맵을 생성
      return acc;
    }, {});

    selectedSeats.value = selectedSeats.value.map((seat) => {
      const result = fetchedDataMap[seat.seat_no];
      return {
        ...seat,
        submitResult: result?.message || "x", // result가 없을 경우 'x'로 기본값 설정
      };
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
      fetchMyLast(); // 나의 입찰 데이터 다시 불러오기
      fetchMyBids(); // 나의 입찰 데이터 다시 불러오기
      fetchBidTallies();
    }
  } catch (error) {
    handleError(error);
  }
};

//입찰 제출 취소소
const handleCancelSubmit = () => {
  Dialog.create({
    title: "입찰 제출 취소",
    message: "모든 입력 내용이 취소됩니다. 진행하시겠습니까?",
    cancel: true, // '취소' 버튼을 추가
    persistent: true,
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
      //입력내용 취소
      selectedSeats.value = [];
    })
    .onCancel(() => {
      return;
    });
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

const handleBidAmountChange = (value, seat) => {
  bidAmounts.value = {
    ...bidAmounts.value,
    [seat.uniqueSeatId]: parseFloat(value) || 0,
  };
};

// 객체를 쿼리 스트링으로 변환하는 함수
const objectToQueryString = (obj) => {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
};

//낙찰건 결제
const handlePaySubmit = async () => {
  //현재 화면에서 logout한 경우를 체크
  const sessionContext = getSessionContext();
  const newSessionData = fetchSessionData(sessionContext, ["telno"]);
  if (newSessionData.telno == null) {
    alert("세션이 종료되었습니다.  다시 로그인해주세요.");
    handleBackToLogin();
  } else {
    paymentData = {
      matchNumber: matchNumber,
      telno: localSessionData.telno,
      price: totalWinAmount.value,
      goodName: `좌석입찰 총 ${totalWinCount.value} 건`,
    };

    // 결제 데이터를 쿼리 스트링으로 변환
    const queryString = objectToQueryString(paymentData);

    // 리디렉션할 URL 생성
    const redirectUrl = `${
      isMobile() ? APIs.PG_START_MOBILE : APIs.PG_START
    }?${queryString}`;

    window.location.href = redirectUrl;
  }
};

//모바일 여부 확인인
function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

const handleSelectVenue = () => {
  navigate(router, sessionContext, "selectVenue");
};

const handleBackToLogin = () => {
  navigate(router, sessionContext, "login");
};

const handleBackToBids = () => {
  navigate(router, sessionContext, "bids");
};

const handleBackToSelect = () => {
  alert("경기를 선택해주세요.");
  navigate(router, sessionContext, "selectVenue");
};

const fetchData = async () => {
  try {
    await fetchBidStatus(matchNumber);

    await fetchMyLast();

    await fetchMyBids();
    await fetchBidTallies();
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
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);

  if (params.has("telno")) {
    //pgrequest에서 돌아온 경우
    queryTelno = params.get("telno");
    alert("결제요청 후 돌아옴.");
    fetchData();
    // handleBackToBids();
  } else {
    fetchData();
  }
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
