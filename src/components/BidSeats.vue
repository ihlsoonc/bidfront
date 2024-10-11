<template>
  <q-page class="common-container">
    <!-- 입찰 상태 표시 -->
    <BidStatus :bidStatus="bidStatus" />
    <q-card class="q-mt-xs q-mb-xs">
      <q-card-section>
        <q-title class="text-center">입찰 및 낙찰 현황</q-title>
        <!-- 입찰 좌석이 없는 경우 -->
        <q-banner v-if="seatBidArray.length === 0" class="message-box">
          입찰 좌석이 없습니다.
        </q-banner>
        <!-- 입찰 좌석이 있는 경우 -->
        <q-list v-else>
          <q-item v-for="(seat, index) in seatBidArray" :key="index" class="q-mb-sm">
            <!-- 좌석 정보와 버튼을 한 줄에 배치 -->
            <div class="columnflex-container">
              <q-item-section>
                <span class="bold-text">{{ seat.seat_no }} 번 좌석: {{ seat.bidWonStatus }}</span>
                입찰액: {{ seat.bid_amount.toLocaleString() }}원( {{ formatTimeToLocal(seat.bid_at) }})
                <br/>현재 최고가: {{ (seat.highest_bid_amount || 0).toLocaleString() }}원 {{ seat.paidStatus }}
              </q-item-section>

              <!-- 이력보기 버튼 -->
              <q-item-section side>
                <q-btn
                  v-if="seat.bidHistory && seat.historyButtonEnabled"
                  @click="showHistory(index)"
                  :class="['small-button', { active: selectedHistoryButton === index }]"
                  :label="`이력보기 ${seat.bidHistory.length}건`"
                  color="primary"
                  flat
                />
              </q-item-section>
            <!-- 아코디언: 선택된 버튼 아래에 내용 표시 -->
            <q-item-section v-if="seat.historyShow" class="accordion-content">
              <q-item-label>입찰액 &nbsp;&nbsp;&nbsp;입찰 시각</q-item-label>
              <q-list dense>
                <q-item v-for="(history, hIndex) in seat.bidHistory" :key="hIndex">
                  <q-item-section>
                    {{ history.bid_amount.toLocaleString() }}원 &nbsp;&nbsp;&nbsp; {{ formatTimeToLocal(history.bid_at) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-item-section>
            </div>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- 결제 및 총 입찰 금액 -->
    <q-card class="q-pa-md">
      <q-card-section>
        <q-item>
          낙찰가격 합계: {{ totalWinAmount.toLocaleString() }}원 {{ totalWinCount }}건
          &nbsp;&nbsp;&nbsp;&nbsp; 입찰가격 합계: {{ totalBidAmount.toLocaleString() }}원
        </q-item>
        <div class="rowflex-container q-mt-md">
          <q-btn
            @click="handlePaySubmit"
            :disable="isApproved || totalWinAmount == 0"
            label="결제 진행"
            class="medium-button"
            color="primary"
          />
          <q-btn
            @click="handleSelectVenue"
            label="경기 다시 선택"
            class="medium-button"
            color="secondary"
          />
      </div>
      </q-card-section>
    </q-card>

    <!-- 새로운 입찰 입력 섹션 -->
    <q-card v-if="!isClosedBid" class="q-pa-xs q-mt-xs">
      <q-card-section>
        <q-title class="text-center">새로운 입찰 입력</q-title>

        <!-- SeatMap 컴포넌트 -->
        <SeatMap
          :selectedSeats="selectedSeats"
          @seatClick="handleSeatClick"
          :disabled="isClosedBid"
          :seatBidArray="allSeatBidArray"
        />
      <br/>
      <br/>
        <!-- 선택된 좌석 정보와 입찰 금액 -->
        <SelectedSeatsDetails
          :selectedSeats="selectedSeats"
          :bidAmounts="bidAmounts"
          @bidAmountChange="handleBidAmountChange"
          :isClosedBid="isClosedBid"
          :isUser="isUser"
        />

        <q-item>
          <span class="spaced-span">최저 입찰 금액 합계: {{ minBidAmount }}원</span>&nbsp;&nbsp;
          <span>현재 입찰금액: {{ bidTotal }}원</span>
        </q-item>

        <q-btn
          v-if="selectedSeats.length > 0 && !isClosedBid"
          @click="handleBidSubmit"
          label="입찰 제출"
          class="medium-button q-mt-md"
          color="primary"
        />
      </q-card-section>
    </q-card>
    <q-banner v-if="message" class="message-box q-mt-md">{{ message }}</q-banner>
  </q-page>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import BidStatus from './BidStatus.vue';
import SeatMap from './SeatMap.vue';
import SelectedSeatsDetails from './SelectedSeatsDetails.vue';
import { formatTimeToLocal } from '../utils/commonFunction';
import { fetchSeatData } from '../utils/fetchSeatData';
import { url, API, messageCommon } from '../utils/messagesAPIs.js';

const MAX_SELECTION = 5;

export default {
  components: {
    BidStatus,
    SeatMap,
    SelectedSeatsDetails
  },
  setup() {
    const router = useRouter();
    const sessionUserId = ref('');
    const sessionTelno = ref('');
    const matchNumber = ref(0);
    const bidStatus = ref({});
    const isClosedBid = ref(false);
    const selectedSeats = ref([]);
    const clickCount = ref(0);
    const selectedHistoryButton = ref(-1);
    const minBidAmount = ref(0);
    const bidAmounts = ref({});
    const bidTotal = ref(0);
    const message = ref('');
    const seatBidArray = ref([]);
    const allSeatBidArray = ref([]);
    const isApproved = ref(false);
    const isUser = ref(true);
    const totalBidAmount = ref(0);
    const totalWinAmount = ref(0);
    const totalWinCount = ref(0);

    // 기타 함수 및 API 호출 함수들
    const handleSeatClick = (index) => {
      selectedSeats.value = selectedSeats.value.some(seat => seat.uniqueSeatId === index)
        ? selectedSeats.value.filter(seat => seat.uniqueSeatId !== index)
        : [...selectedSeats.value, { seat_no: index, uniqueSeatId: index }];

      if (selectedSeats.value.length > MAX_SELECTION) {
        alert(`최대 ${MAX_SELECTION}개의 좌석만 선택할 수 있습니다.`);
        selectedSeats.value = selectedSeats.value.slice(0, MAX_SELECTION);
      }
      clickCount.value += 1;
    };
    
    watch([selectedSeats, bidAmounts], ([newSelectedSeats, newBidAmounts]) => {
    if (newSelectedSeats && newBidAmounts) {
      const minBidAmountCalc = newSelectedSeats.reduce((sum, seat) => {
        const chosenAmount = seat.current_bid_amount > 0 ? seat.current_bid_amount : seat.seat_price;
        return sum + (chosenAmount || 0);
      }, 0);
      minBidAmount.value = minBidAmountCalc;

      const bidTotalCalc = newSelectedSeats.reduce((sum, seat) => {
        return sum + (newBidAmounts[seat.uniqueSeatId] || 0);
      }, 0);
      bidTotal.value = bidTotalCalc;
    }

    }, { deep: true });
    watch([clickCount], () => {
    if (selectedSeats.value.length > 0) {
      fetchSeatData(matchNumber.value, selectedSeats.value, (data) => {
        selectedSeats.value = data;
      }, (msg) => {
        message.value = msg;
      });
    }

    }, { deep: true });
    
    const handleBidAmountChange = (value, seat) => {
      bidAmounts.value = {
        ...bidAmounts.value,
        [seat.uniqueSeatId]: parseFloat(value) || 0
      };
    };

    const handleBidSubmit = async () => {
      const confirmMessage = `입찰 금액 ${bidTotal.value}원으로 등록됩니다. 진행하시겠습니까?`;
      const isConfirmed = window.confirm(confirmMessage);

      if (!isConfirmed) return;

      // 입찰 제출 로직
      try {
        const response = await axios.post(
          API.SUBMIT_BID,
          {
            telno: sessionTelno.value,
            matchNumber: matchNumber.value,
            bidArray: selectedSeats.value.map(seat => ({
              seatNo: seat.seat_no,
              bidAmount: bidAmounts.value[seat.uniqueSeatId] || 0
            }))
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          message.value = response.data.message;
          fetchMyLast();
          fetchMyBids();
          fetchAllBids();
        }
      } catch (error) {
        handleError(error);
      }
    };

    const handlePaySubmit = () => {
      const paymentData = {
        telno: sessionTelno.value,
        price: totalWinAmount.value,
        goodName: `좌석입찰 총 ${totalWinCount.value} 건`
      };
      const queryString = new URLSearchParams(paymentData).toString();
      const redirectUrl = `${API.PG_START}?${queryString}`;
      window.location.href = redirectUrl;
    };

    const handleSelectVenue = () => {
      router.push(url.selectvenue);
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

    onMounted(async () => {
      const sessionMatchNumber = sessionStorage.getItem('matchNumber');
      if (sessionMatchNumber) {
        matchNumber.value = sessionMatchNumber;
      } else {
        alert('경기를 먼저 선택해주세요.');
        router.push(url.selectmatchuser);
      }

      const params = new URLSearchParams(window
      .location.search);

      if (params.has('telno')) {
        sessionTelno.value = params.get('telno');
      } else {
        await fetchSessionUserId();
      }

      await fetchBidStatus(matchNumber.value);
      await fetchMyLast();
      await fetchMyBids();
      await fetchAllBids();
    });

    const fetchSessionUserId = async () => {
      try {
        const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
        sessionUserId.value = response.data.userId;
        sessionTelno.value = response.data.telno;
      } catch (error) {
        alert('로그인이 필요합니다.');
        router.push(url.userlogin);
      }
    };

    const fetchBidStatus = async (sessionMatchNumber) => {
      try {
        const response = await axios.get(API.GET_BIDSTATUS, {
          params: { matchNumber: sessionMatchNumber },
          withCredentials: true
        });
        bidStatus.value = response.data;
        if (response.data.bidStatusCode !== 'O') {
          isClosedBid.value = true;
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchMyLast = async () => {
      try {
        const response = await axios.get(API.GET_MY_LASTBIDS, {
          params: { telno: sessionTelno.value, matchNumber: matchNumber.value }
        });

        totalWinAmount.value = 0;
        totalWinCount.value = 0;

        seatBidArray.value = response.data.map(seat => {
          if (bidStatus.value.bid_open_status === 'F' && seat.bid_won === 'Y') {
            totalWinAmount.value += seat.bid_amount || 0;
            totalWinCount.value++;
          }
          return {
            ...seat,
            bidWonStatus: bidStatus.value.bid_open_status === 'F' ? (seat.bid_won === 'Y' ? '낙찰' : '유찰') : '',
            paidStatus: seat.bid_paid === 'Y' ? '결제완료' : '미결제',
            historyButtonEnabled: false,
            historyShow: false
          };
        });

        totalBidAmount.value = seatBidArray.value.reduce((sum, seat) => sum + (seat.bid_amount || 0), 0);
      } catch (error) {
        handleError(error);
      }
    };

    const fetchMyBids = async () => {
      try {
        const response = await axios.get(API.GET_MY_BIDS, {
          params: { telno: sessionTelno.value, matchNumber: matchNumber.value }
        });

        response.data.forEach(seat => {
          const existingSeat = seatBidArray.value.find(bid => String(bid.seat_no) === String(seat.seat_no));
          const bidHistory = seat.bidHistory || [{ bid_amount: seat.bid_amount, bid_at: seat.bid_at }];

          if (existingSeat) {
            existingSeat.bidHistory = existingSeat.bidHistory || [];
            existingSeat.bidHistory = [...existingSeat.bidHistory, ...bidHistory];
            existingSeat.historyButtonEnabled = existingSeat.bidHistory.length > 1;
            existingSeat.historyShow = false;
          }
        });
      } catch (error) {
        handleError(error);
      }
    };

    const fetchAllBids = async () => {
      try {
        const response = await axios.get(API.GET_ALL_BIDS, {
          params: { matchNumber: matchNumber.value }
        });

        allSeatBidArray.value = response.data.map(seat => ({
          ...seat,
          seat_no: seat.seat_no,
          highest_bid_amount: seat.current_bid_amount || 0,
          bid_count: seat.total_bidders || 0
        }));
      } catch (error) {
        handleError(error);
      }
    };

    const showHistory = (index) => {
      const seat = seatBidArray.value[index];
      if (selectedHistoryButton.value === index) {
        seat.historyShow = false;
        selectedHistoryButton.value = -1;
      } else {
        selectedHistoryButton.value = index;
        seat.historyShow = true;
      }
    };

    return {
      sessionUserId,
      sessionTelno,
      matchNumber,
      bidStatus,
      selectedSeats,
      minBidAmount,
      bidAmounts,
      bidTotal,
      seatBidArray,
      selectedHistoryButton,
      allSeatBidArray,
      totalBidAmount,
      totalWinAmount,
      totalWinCount,
      isClosedBid,
      isApproved,
      isUser,
      formatTimeToLocal,
      handleSeatClick,
      handleBidSubmit,
      showHistory,
      handleBidAmountChange,
      handlePaySubmit,
      handleSelectVenue,
      message
    };
  }
};
</script>

<style scoped>
.accordion-content {
  background-color: #f1f1f1;
  padding: 5px;
  border: 1px solid #ddd;
  margin-top: 5px;
  border-radius: 5px;
  display: block;
  transition: max-height 0.2s ease-out;
}


/* 작은 화면을 위한 스타일 */
@media (max-width: 500px) {

}
</style>
