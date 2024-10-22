<template>
  <q-page class="common-container">
    <!-- 입찰 상태 표시 -->
    <BidStatus :bidStatus="bidStatus" />
    <div class="seat-list">
      <q-card class="q-pa-md q-mb-md">
        <q-card-section>
          <h6>입찰 및 낙찰 현황</h6>
        </q-card-section>

        <!-- 입찰 좌석이 없는 경우 -->
        <q-card-section v-if="seatBidArray.length === 0">
          <q-banner color="warning">입찰 내역이 없습니다.</q-banner>
        </q-card-section>

        <!-- 입찰 좌석이 있는 경우 -->
        <q-card-section v-else>
          <q-table
            :rows="seatBidArray"
            :columns="tableColumns"
            row-key="seat_no"
            flat
          >
            <!-- 좌석 번호, 열, 컬럼 -->
            <template v-slot:body="props">
              <!-- 좌석 정보 -->
              <q-tr :props="props">
                <q-td>
                  {{ props.row.seat_no }} ({{ props.row.row_no }} 열
                  {{ props.row.col_no }}번)
                </q-td>
                <q-td>
                  {{ props.row.bid_amount.toLocaleString() }}원
                  {{ formatTimeToLocal(props.row.bid_at) }}
                </q-td>
                <q-td>
                  {{ (props.row.highest_bid_amount || 0).toLocaleString() }}원
                </q-td>
                <q-td>
                  <q-btn
                    v-if="props.row.historyButtonEnabled"
                    @click="toggleHistory(props.row)"
                    :color="
                      selectedHistoryButton === props.row.seat_no
                        ? 'primary'
                        : 'secondary'
                    "
                    size="xs"
                    :icon="
                      selectedHistoryButton === props.row.seat_no
                        ? 'keyboard_arrow_up'
                        : 'keyboard_arrow_down'
                    "
                  >
                    <q-badge
                      :color="
                        selectedHistoryButton === props.row.seat_no
                          ? 'primary'
                          : 'secondary'
                      "
                      >이력 {{ props.row.bidHistory.length }}건</q-badge
                    >
                  </q-btn>
                </q-td>
              </q-tr>

              <!-- 입찰 이력 (해당 행 아래 표시) -->
              <q-tr v-if="props.row.historyShow">
                <q-td colspan="4">
                  <q-item
                    v-for="(history, hIndex) in props.row.bidHistory"
                    :key="hIndex"
                  >
                    <q-item-section>
                      {{ history.bid_amount.toLocaleString() }}원 -
                      {{ formatTimeToLocal(history.bid_at) }}
                    </q-item-section>
                  </q-item>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- 결제 및 총 입찰 금액 -->
    <q-card class="q-pa-md q-mb-md">
      <q-card-section>
        <div>
          낙찰금액 합계: {{ totalWinAmount.toLocaleString() }}원
          {{ totalWinCount }}건
        </div>
        <div>입찰금액 합계: {{ totalBidAmount.toLocaleString() }}원</div>
      </q-card-section>
      <q-card-section>
        <q-btn
          @click="handlePaySubmit"
          :disable="isApproved || totalWinAmount === 0"
          color="primary"
          label="낙찰 내용 결제"
        />
        <q-btn
          @click="handleSelectVenue"
          color="secondary"
          label="경기 다시 선택"
        />
      </q-card-section>
    </q-card>

    <!-- 새로운 입찰 입력 섹션 -->
    <q-card v-if="!isClosedBid" class="q-pa-md">
      <q-card-section>
        <q-banner class="text-center">새로운 입찰 입력</q-banner>
      </q-card-section>

      <!-- SeatMap 컴포넌트 -->
      <SeatMap
        :selectedSeats="selectedSeats"
        @seatClick="handleSeatClick"
        :disabled="isClosedBid"
        :seatBidArray="allSeatBidArray"
      />

      <!-- 선택된 좌석 정보와 입찰 금액 -->
      <q-card-section>
        <SelectedSeatsDetails
          :selectedSeats="selectedSeats"
          :bidAmounts="bidAmounts"
          @bidAmountChange="handleBidAmountChange"
          :isClosedBid="isClosedBid"
          :isUser="isUser"
        />

        <div class="q-gutter-sm">
          <q-item>
            <q-item-section>
              <span>최저 입찰 금액 합계: {{ minBidAmount }}원</span>
              <span>현재 입찰 금액: {{ bidTotal }}원</span>
            </q-item-section>
            <q-btn
              v-if="selectedSeats.length > 0 && !isClosedBid"
              @click="handleBidSubmit"
              color="primary"
              label="입찰 제출"
            />
            <q-btn
              v-if="selectedSeats.length > 0 && !isClosedBid"
              @click="cancelBidSubmit"
              color="warning"
              label="작업 취소"
            />
          </q-item>
        </div>
      </q-card-section>
      <q-card-section v-if="message">
        <q-banner color="negative">{{ message }}</q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { Dialog } from "quasar";
import BidStatus from "./BidStatus.vue";
import SeatMap from "./SeatMap.vue";
import SelectedSeatsDetails from "./SelectedSeatsDetails.vue";
import { formatTimeToLocal } from "../utils/commonFunction";
import { url, API, messageCommon } from "../utils/messagesAPIs.js";

const MAX_SELECTION = 5;

export default {
  components: {
    BidStatus,
    SeatMap,
    SelectedSeatsDetails,
  },
  setup() {
    const router = useRouter();
    const sessionTelno = ref("");
    const sessionUserName = ref("");
    const localSessionUserName = ref("");
    const matchNumber = ref(0);
    const bidOpen = "O";
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

    const fetchBidStatus = async (localSessionMatchNumber) => {
      try {
        const response = await axios.get(API.GET_BIDSTATUS, {
          params: { matchNumber: localSessionMatchNumber },
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
        const response = await axios.get(API.GET_MY_LASTBIDS, {
          params: { telno: sessionTelno.value, matchNumber: matchNumber.value },
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
            paidStatus: seat.bid_paid === "Y" ? "결제완료" : "미결제",
            historyButtonEnabled: false,
            historyShow: false,
          };
        });

        console.log("====================", seatBidArray.value);
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
        const response = await axios.get(API.GET_MY_BIDS, {
          params: { telno: sessionTelno.value, matchNumber: matchNumber.value },
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

    const toggleHistory = (seat) => {
      if (selectedHistoryButton.value === seat.seat_no) {
        seat.historyShow = false;
        selectedHistoryButton.value = -1;
      } else {
        selectedHistoryButton.value = seat.seat_no;
        seat.historyShow = true;
      }
    };

    const fetchAllBids = async () => {
      try {
        const response = await axios.get(API.GET_ALL_BIDS, {
          params: { matchNumber: matchNumber.value },
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
          // API 요청하여 좌석별 데이터를 가져옴
          const response = await axios.post(
            API.GET_BIDS_BY_SEATARRAY,
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

    const handleBidSubmit = async () => {
      const invalidSeats = selectedSeats.value.filter((seat) => {
        const minBidPrice =
          seat.current_bid_amount > 0
            ? seat.current_bid_amount
            : seat.seat_price;
        const currentBid = bidAmounts.value[seat.uniqueSeatId] || 0;
        return currentBid <= minBidPrice;
      });

      if (invalidSeats.length > 0) {
        const seatNumbers = invalidSeats.map((seat) => seat.seat_no).join(", ");
        alert(
          `좌석 ${seatNumbers}의 입찰 금액이 현재 입찰 최저가보다 작습니다.`
        );
        return;
      }

      const confirmMessage = `입찰 금액 ${bidTotal.value}원으로 제출됩니다. 진행하시겠습니까?`;
      const isConfirmed = window.confirm(confirmMessage);

      if (!isConfirmed) return;
      try {
        const response = await axios.post(
          API.SUBMIT_BID,
          {
            telno: sessionTelno.value,
            matchNumber: matchNumber.value,
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
    const cancelBidSubmit = () => {
      Dialog.create({
        title: "입찰 제출 취소",
        message: "모든 입력 내용이 취소됩니다. 진행하시겠습니까?",
        cancel: true, // '취소' 버튼을 추가
        persistent: true, // 모달 외부를 클릭해도 닫히지 않도록 설정
        ok: {
          label: "예", // 확인 버튼을 '예'로 설정
          color: "primary",
        },
        cancel: {
          label: "아니오", // 취소 버튼을 '아니오'로 설정
          color: "negative",
        },
      })
        .onOk(() => {
          // '예' 버튼을 눌렀을 때 동작
          selectedSeats.value = [];
          alert("입력 내용이 취소되었습니다.");
        })
        .onCancel(() => {
          // '아니오' 버튼을 눌렀을 때 동작
          alert("작업을 계속합니다.");
          return;
        });
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
      localStorage.setItem("telno", sessionTelno.value);
      paymentData.value = {
        ...paymentData.value,
        telno: sessionTelno.value,
        price: totalWinAmount.value,
        goodName: `좌석입찰 총 ${totalWinCount.value} 건`,
      };

      // 결제 데이터를 쿼리 스트링으로 변환
      const queryString = objectToQueryString(paymentData.value);

      // 리디렉션할 URL 생성
      const redirectUrl = `${API.PG_START}?${queryString}`;

      // 리디렉션 실행
      window.location.href = redirectUrl;
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

    watch(
      [selectedSeats, bidAmounts],
      ([newSelectedSeats, newBidAmounts]) => {
        if (newSelectedSeats && newBidAmounts) {
          const minBidAmountCalc = newSelectedSeats.reduce((sum, seat) => {
            const chosenAmount =
              seat.current_bid_amount > 0
                ? seat.current_bid_amount
                : seat.seat_price;
            return sum + (chosenAmount || 0);
          }, 0);
          minBidAmount.value = minBidAmountCalc;

          const bidTotalCalc = newSelectedSeats.reduce((sum, seat) => {
            return sum + (newBidAmounts[seat.uniqueSeatId] || 0);
          }, 0);
          bidTotal.value = bidTotalCalc;
        }
      },
      { deep: true }
    );

    watch(
      [clickCount],
      () => {
        if (selectedSeats.value.length > 0) {
          fetchSeatData(
            matchNumber.value,
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

    const handleSelectVenue = () => {
      router.push(url.selectVenueUser);
    };

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, {
          withCredentials: true,
        });
        if (response.status == "200") {
          sessionTelno.value = response.data.telno;
          sessionUserName.value = response.data.userName;
          sessionStorage.setItem("userName", sessionUserName.value);
        }
      } catch (error) {
        alert("로그인이 필요합니다.");
        router.push(url.userLogin);
      }
    };

    const restoreSession = async (sessionTelno, localSessionUserName) => {
      try {
        const response = await axios.post(
          API.RESTORE_SESSION,
          {
            telno: sessionTelno,
            userName: localSessionUserName,
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          console.log("==============세션이 복구되었습니다.");
        }
      } catch (error) {
        console.error("세션 복구 실패:", error);
      }
    };

    const fetchData = async () => {
      try {
        await fetchBidStatus(matchNumber.value);
        await fetchMyLast();
        await fetchMyBids();
        await fetchAllBids();
      } catch (error) {
        handleError(error);
      }
    };

    onMounted(async () => {
      const localSessionMatchNumber = sessionStorage.getItem("matchNumber");
      if (!localSessionMatchNumber) {
        alert("경기를 먼저 선택해주세요.");
        return router.push(url.selectMatchUser);
      }

      matchNumber.value = localSessionMatchNumber;
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);

      if (params.has("telno")) {
        sessionTelno.value = params.get("telno");
        await restoreSession(sessionTelno.value, localSessionUserName.value);
      } else {
        await fetchSessionUserId();
      }

      await fetchData();
    });

    return {
      sessionTelno,
      sessionUserName,
      localSessionUserName,
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
      handleBidSubmit,
      cancelBidSubmit,
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
