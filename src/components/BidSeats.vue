<template>
  <q-page class="common-container">
    <!-- 입찰 상태 표시 -->
    <BidStatus :bidStatus="bidStatus" />
    <!-- 좌석 목록 컴포넌트 -->
    <BidsList
      :seats="seatBidArray"
      :tableColumns="tableColumns"
      :selectedHistoryButton="selectedHistoryButton"
      :totalWinAmount="totalWinAmount"
      :totalWinCount="totalWinCount"
      :totalBidAmount="totalBidAmount"
      :isApproved="isApproved"
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
          @seatClick="handleSeatClick"
          :disabled="isClosedBid"
          :seatBidArray="allSeatBidArray"
        />
      </q-card-section>
      <!-- 선택된 좌석 정보와 입찰 금액 -->
      <q-card-section>
        <SelectedSeatsDetails
          :selectedSeats="selectedSeats"
          :bidAmounts="bidAmounts"
          @bidAmountChange="handleBidAmountChange"
          :isClosedBid="isClosedBid"
          :isUser="isUser"
          @submit-bid="handleSubmitBid"
          @cancel-bid="handleCancelSubmit"
        />
      </q-card-section>
      <q-card-section v-if="message">
        <q-banner color="negative">{{ message }}</q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Dialog } from "quasar";
import BidStatus from "./BidStatus.vue";
import BidsList from "./BidsList.vue";
import SeatMap from "./SeatMap.vue";
import SelectedSeatsDetails from "./SelectedSeatsDetails.vue";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";
import { handleLink } from "../utils/handleLink";
import { fetchLocalSession } from "../utils/fetchLocalSession";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

const MAX_SELECTION = 5;

export default {
  components: {
    BidStatus,
    BidsList,
    SeatMap,
    SelectedSeatsDetails,
  },
  setup() {
    let sessionTelno = "";
    let sessionUserName = "";
    let localSessionUserName = "";
    let localSessionData = {};
    let matchNumber = 0;
    const router = useRouter();
    const bidOpen = "O";
    const queryTelno = ref("");
    const isClosedBid = ref(false);
    const isApproved = ref(false);
    const isUser = ref(true);
    const selectedHistoryButton = ref(-1);
    const seatBidArray = ref([]);
    const allSeatBidArray = ref([]);
    const selectedSeats = ref([]);

    const clickCount = ref(0);
    const minBidAmount = ref(0);
    const bidAmounts = ref({});
    const bidTotal = ref(0);
    const totalBidAmount = ref(0);
    const totalWinAmount = ref(0);
    const totalWinCount = ref(0);
    const bidStatus = ref({});
    const paymentData = ref({});
    const message = ref("");
    const tableColumns = ref([
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

    const fetchBidStatus = async (matchNumber) => {
      try {
        const response = await axios.get(APIs.GET_BIDSTATUS, {
          params: { matchNumber: matchNumber },
          withCredentials: true,
        });
        bidStatus.value = response.data;
        if (response.data.bidStatusCode !== bidOpen) {
          isClosedBid.value = true;
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchMyLast = async () => {
      try {
        const response = await axios.get(APIs.GET_MY_LASTBIDS, {
          params: { telno: sessionTelno, matchNumber: matchNumber },
          withCredentials: true,
        });
        // 낙찰된 총 금액과 낙찰된 항목의 수를 계산할 변수
        seatBidArray.value = response.data.map((seat) => {
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
        totalBidAmount.value = seatBidArray.value.reduce(
          (sum, seat) => sum + (seat.bid_amount || 0),
          0
        );
      } catch (error) {
        handleError(error);
      }
    };

    const fetchMyBids = async () => {
      try {
        const response = await axios.get(APIs.GET_MY_BIDS, {
          params: { telno: sessionTelno, matchNumber: matchNumber },
          withCredentials: true,
        });

        // 서버에서 받아온 데이터를 seatBidArray에 매핑 또는 업데이트
        response.data.forEach((seat) => {
          // seat_no가 동일한 항목을 찾음 (string, number 비교 문제 해결을 위해 String 변환)
          const existingSeat = seatBidArray.value.find(
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
            existingSeat.bidHistory = [
              ...existingSeat.bidHistory,
              ...bidHistory,
            ]; // 새 이력 추가

            existingSeat.historyButtonEnabled =
              existingSeat.bidHistory.length > 1;
            existingSeat.historyShow = false;
          } else {
            console.log(
              "오류: 좌석번호가 match되지 않는 이력이 있습니다.:",
              seat
            ); // 새로 추가할 좌석 데이터를 출력
          }
        });
      } catch (error) {
        console.error("에러 발생:", error); // 에러가 발생한 경우 로그 출력
        handleError(error);
      }
    };

    const fetchAllBids = async () => {
      try {
        const response = await axios.get(APIs.GET_ALL_BIDS, {
          params: { matchNumber: matchNumber },
          withCredentials: true,
        });

        // 서버에서 좌석별 입찰자 수와 최고 입찰 금액을 포함하여 데이터를 가져옴
        allSeatBidArray.value = response.data.map((seat) => {
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

    const handleSeatClick = (index) => {
      selectedSeats.value = selectedSeats.value.some(
        (seat) => seat.uniqueSeatId === index
      )
        ? selectedSeats.value.filter((seat) => seat.uniqueSeatId !== index)
        : [...selectedSeats.value, { seat_no: index, uniqueSeatId: index }];

      if (selectedSeats.value.length > MAX_SELECTION) {
        alert(`최대 ${MAX_SELECTION}개의 좌석만 선택할 수 있습니다.`);
        selectedSeats.value = selectedSeats.value.slice(0, MAX_SELECTION);
      }
      clickCount.value += 1;
    };

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
          const response = await axios.post(
            APIs.GET_BIDS_BY_SEATARRAY,
            { seatNoArray, matchNumber }, // 두 번째 인자는 데이터 (POST body)
            {
              withCredentials: true, // 세 번째 인자로 옵션 전달
            }
          );

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
            row_no: fetchedDataMap[seat.seat_no]?.row_no || "0",
            col_no: fetchedDataMap[seat.seat_no]?.col_no || "0",
            seat_price: fetchedDataMap[seat.seat_no]?.seat_price || 0,
            total_bidders: fetchedDataMap[seat.seat_no]?.total_bidders || 0,
            current_bid_amount:
              fetchedDataMap[seat.seat_no]?.current_bid_amount || 0,
          }));

          // 좌석 데이터 업데이트
          setSelectedSeats(updatedSeatsWithData);
        }
      } catch (error) {
        // 에러 처리
        setMessage && setMessage("데이터를 가져오는 중 오류가 발생했습니다.");
        handleError(error); // handleError 함수가 따로 정의되어 있는지 확인 필요
      }
    };

    const handleSubmitBid = async (localBidAmounts, bidTotal) => {
      // 최소 입찰가보다 낮은 입찰을 필터링하는 함수
      const getMinBidPrice = (seat) => {
        return seat.current_bid_amount > 0
          ? seat.current_bid_amount
          : seat.seat_price;
      };

      // 선택된 좌석 중 유효하지 않은 좌석 필터링
      const invalidSeats = selectedSeats.value.filter((seat) => {
        const minBidPrice = getMinBidPrice(seat);
        const currentBid = bidAmounts.value[seat.uniqueSeatId] || 0;
        return currentBid <= minBidPrice;
      });

      // 유효하지 않은 입찰이 있으면 경고 메시지를 표시하고 중단
      if (invalidSeats.length > 0) {
        const seatNumbers = invalidSeats.map((seat) => seat.seat_no).join(", ");
        alert(
          `좌석 ${seatNumbers}의 입찰 금액이 현재 입찰 최저가보다 작습니다.`
        );
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
          alert("제출이 취소되었습니다.");
          return;
        });
    };

    const submitBid = async () => {
      try {
        const response = await axios.post(
          APIs.SUBMIT_BID,
          {
            telno: sessionTelno,
            matchNumber: matchNumber,
            bidArray: selectedSeats.value.map((seat) => ({
              matchNumber: seat.match_no,
              seatNo: seat.seat_no,
              bidAmount: bidAmounts.value[seat.uniqueSeatId] || 0,
            })),
          },
          {
            withCredentials: true,
          }
        );

        const fetchedData = response.data; // response에서 데이터 추출
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
          message.value = response.data.message;
          fetchMyLast(); // 나의 입찰 데이터 다시 불러오기
          fetchMyBids(); // 나의 입찰 데이터 다시 불러오기
          fetchAllBids();
        }
      } catch (error) {
        handleError(error);
      }
    };

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
        .map(
          (key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
        )
        .join("&");
    };

    const handlePaySubmit = () => {
      localStorage.setItem("telno", sessionTelno);
      paymentData.value = {
        ...paymentData.value,
        telno: sessionTelno,
        price: totalWinAmount.value,
        goodName: `좌석입찰 총 ${totalWinCount.value} 건`,
      };

      // 결제 데이터를 쿼리 스트링으로 변환
      const queryString = objectToQueryString(paymentData.value);

      // 리디렉션할 URL 생성
      const redirectUrl = `${
        isMobile() ? APIs.PG_START_MOBILE : APIs.PG_START
      }?${queryString}`;

      // 리디렉션 실행
      window.location.href = redirectUrl;
    };

    function isMobile() {
      // return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      return true;
    }

    const handleSelectVenue = () => {
      handleLink(router, localSessionData.userClass, "selectVenue");
    };

    const handleBackToLogin = () => {
      handleLink(router, localSessionData.userClass, "login");
    };

    const handleBackToBids = () => {
      handleLink(router, localSessionData.userClass, "bids");
    };

    const handleBackToSelect = () => {
      alert("경기를 선택해주세요.");
      handleLink(router, localSessionData.userClass, "selectVenue");
    };

    const resetLoginStatus = () => {
      emit("update-status", { isLoggedIn: false, hasSelectedMatch: false });
    };
    const restoreSession = async (sessionTelno, localSessionUserName) => {
      try {
        const response = await axios.post(
          APIs.RESTORE_SESSION,
          {
            telno: sessionTelno,
            userName: localSessionUserName,
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("세션 복구가 실패하였습니다.:", error);
      }
    };

    watch(
      [clickCount],
      () => {
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
      },
      { deep: true }
    );
    const fetchData = async () => {
      try {
        await fetchBidStatus(matchNumber);
        await fetchMyLast();
        await fetchMyBids();
        await fetchAllBids();
      } catch (error) {
        handleError(error);
      }
    };

    const fetchSessionUserIdNew = async () => {
      try {
        const response = await axios.get(APIs.GET_SESSION_USER, {
          withCredentials: true,
        });
        sessionTelno = response.data.telno;
        sessionUserName = response.data.userName;
        sessionStorage.setItem("userName", sessionUserName);

        if (queryTelno.value) {
          await fetchData();
          handleBackToBids();
        } else {
          await fetchData();
        }
      } catch (error) {
        message.value = error.response ? error.response.data : error.response;

        if (queryTelno.value) {
          await restoreSession(queryTelno.value, localSessionUserName.value);
          console.log("+++++++++++++세션이 복구되었습니다.");
          handleBackToBids();
        } else {
          handleBackToLogin();
        }
      }
    };

    const handleError = (error) => {
      message.value = error.response
        ? error.response.data
        : error.request
        ? messageCommon.ERR_NETWORK
        : messageCommon.ERR_ETC;
    };

    onMounted(async () => {
      localSessionData = fetchLocalSession(["matchNumber", "userClass"]);
      matchNumber = localSessionData.matchNumber;
      if (!matchNumber) {
        alert("경기를 먼저 선택해주세요.");
        handleBackToSelect();
      }
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);

      if (params.has("telno")) {
        queryTelno.value = params.get("telno");
        console.log(
          "returned from payment----------- telno :" + queryTelno.value
        );
      }
      await fetchSessionUserIdNew();
    });
    return {
      matchNumber,
      bidStatus,
      selectedSeats,
      minBidAmount,
      bidAmounts,
      bidTotal,
      seatBidArray,
      allSeatBidArray,
      totalBidAmount,
      totalWinAmount,
      totalWinCount,
      isClosedBid,
      isApproved,
      isUser,
      fetchSeatData,
      formatTimeToLocal,
      handleSeatClick,
      handleSubmitBid,
      handleCancelSubmit,
      toggleHistory,
      handleBidAmountChange,
      handlePaySubmit,
      handleSelectVenue,
      message,
      selectedHistoryButton,
      tableColumns,
      paymentData,
      clickCount,
    };
  },
};
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
