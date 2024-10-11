<template>
  <q-page class="common-container q-pa-md">
    <div class="columnflex-container q-gutter-md">
      <BidStatus :bidStatus="bidStatus" />
      <div v-if="message" class="q-message q-pa-md bg-negative text-white">
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
        class="seatmap-container"
      />
      <q-btn
        label="데이터 다시 불러오기"
        @click="handleRefresh"
        color="primary"
        class="q-mt-md full-width"
        flat
      />
    </div>

    <div class="columnflex-container q-gutter-md">
      <div class="buttons-container" v-if="canAwardBid">
        <q-btn
          label="낙찰 진행"
          color="secondary"
          @click="handleAwardBid"
          flat
          class="full-width"
        />
      </div>
      <div v-if="countSelectedSeats > 0" class="selected-seat-headers q-gutter-md">
        <div class="spaced-span">
          선택된 좌석수&nbsp;: {{ countSelectedSeats }}개&nbsp;
        </div>
        <div class="spaced-span">
          입찰 좌석수&nbsp;: {{ countbiddedSeats }}개&nbsp;
        </div>
        <div class="spaced-span">
          입찰금액 합계: {{ bidTotal }}원
        </div>&nbsp;
        <div>합계 : {{ minBidAmount }}원</div>
      </div>
      <div v-if="countSelectedSeats > 0">
        <!-- 입찰금액입력란 및 제출결과 필드 Show -->
        <SelectedSeatsDetails
          :selectedSeats="selectedSeats"
          :bidAmounts="[]"
          @bidAmountChange="handleBidAmountChange"
          :isUser="false"
          :isClosedBid="false"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import BidStatus from './BidStatus.vue';
import SeatMap from './SeatMap.vue';
import SelectedSeatsDetails from './SelectedSeatsDetails.vue';
import { url, API, messageCommon } from '../utils/messagesAPIs.js';

export default {
  components: {
    BidStatus,
    SeatMap,
    SelectedSeatsDetails
  },
  setup() {
    const router = useRouter();
    const sessionUserId = ref('');
    const matchNumber = ref(0);
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
    const message = ref('');
    const selectedAction = ref('all');

    const radioOptions = [
      { label: '전체좌석 보기', value: 'all' },
      { label: '입찰좌석 보기', value: 'bidded' }
    ];

    const handleActionChange = (value) => {
      if (value === 'all') {
        handleAllClick();
      } else if (value === 'bidded') {
        handleBiddedSeat();
      }
    };

    onMounted(async () => {
      const sessionMatchNumber = sessionStorage.getItem('matchNumber');
      if (sessionMatchNumber) {
        try {
          matchNumber.value = sessionMatchNumber;
          await fetchSessionUserId();
          await fetchBidStatus(sessionMatchNumber);
          await fetchAllBids();
        } catch (error) {
          console.error('비동기 함수 호출 중 오류 발생:', error);
          alert('오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        alert('경기를 먼저 선택해주세요.');
        router.push(url.selectmatch);
      }
    });

    watch(
      selectedSeats,
      () => {
        calculateBiddedSeats();
        const minBidAmountCalc = selectedSeats.value.reduce((sum, seat) => {
          const chosenAmount = seat.current_bid_amount > 0 ? seat.current_bid_amount : seat.seat_price;
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

    const handleRefresh = async () => {
      await fetchAllBids();
    };

// 좌석 클릭 처리 함수
const handleSeatClick = (index) => {
    const MAX_SELECTION = 100;
    let updatedSeats;

    // 클릭된 좌석이 이미 선택된 좌석인지 확인
    if (selectedSeats.value.some(seat => seat.uniqueSeatId === index)) {
      // 이미 선택된 좌석이면 해당 좌석을 선택 목록에서 제거
      updatedSeats = selectedSeats.value.filter(seat => seat.uniqueSeatId !== index);
    } else {
      // 좌석이 선택되지 않은 경우
      if (selectedSeats.value.length >= MAX_SELECTION) {
        alert(`최대 ${MAX_SELECTION}개의 좌석만 선택할 수 있습니다.`);
        return;
      }
      
      // allSeatBidArray에서 해당 좌석 데이터 가져오기
      const seatData = allSeatBidArray.value.find(seat => seat.uniqueSeatId === index);
      
      if (seatData) {
        // 좌석 데이터를 selectedSeats에 추가
        updatedSeats = [...selectedSeats.value, seatData];
        clickCount.value += 1;
      } else {
        // 좌석 데이터를 찾지 못한 경우
        alert('해당 좌석 정보를 찾을 수 없습니다.');
        return;
      }
    }

  // 선택된 좌석 목록 업데이트
  selectedSeats.value = updatedSeats;
  countSelectedSeats.value = updatedSeats.length;
};

// 낙찰을 진행하는 함수
const handleAwardBid = async () => {
        if (!canAwardBid.value) {
          alert("낙찰을 진행할 수 없습니다.");
          return;
        }
  
        const isConfirmed = window.confirm('낙찰을 진행하겠습니까?');
        if (!isConfirmed) return;
  
        try {
          const response = await axios.post(API.AWARD_BID, {
            matchNumber: matchNumber.value
          });
          if (response.status === 200) {
            alert('성공적으로 낙찰 처리가 되었습니다.');
            message.value = response.data.message;
            fetchBidStatus(matchNumber.value)
            canAwardBid.value = false;
          }
        } catch (error) {
          handleError(error);
        }
      };

// 전체 좌석 선택 시 처리 함수
const handleAllClick = async () => {
        countbiddedSeats.value = 0;
        message.value = '';
        minBidAmount.value = 0;
        bidTotal.value = 0;
        clickCount.value = 0;
        selectedSeats.value = allSeatBidArray.value;
        countSelectedSeats.value = selectedSeats.value.length;
      };
  
      // 좌석 선택 화면으로 이동 함수
      const handleBiddedSeat = () => {
        selectedSeats.value = allSeatBidArray.value.filter(seat => seat.total_bidders > 0);
        countSelectedSeats.value = selectedSeats.value.length;
        countbiddedSeats.value = selectedSeats.value.length;
        message.value = '';
        minBidAmount.value = 0;
        bidTotal.value = 0;
        clickCount.value = 0;
      };
  

// 사용자 ID를 가져오는 함수
const fetchSessionUserId = async () => {
        try {
          const response = await axios.get(API.GET_SESSION_USERID, { withCredentials: true });
          if (response.status === 200) {
            sessionUserId.value = response.data.userId;
          }
        } catch (error) {
          alert('로그인이 필요합니다.');
          router.push(url.adminlogin);
        }
      };
  
      // 입찰 상태를 가져오는 함수
      const fetchBidStatus = async (sessionMatchNumber) => {
        try {
          const response = await axios.get(API.GET_BIDSTATUS, { params: { matchNumber: sessionMatchNumber } }, { withCredentials: true });
          if (response.status === 200 && response.data) {
            bidStatus.value = response.data;
            if (bidStatus.value.bidStatusCode == 'C' && biddedSeatCount.value >0)
                {canAwardBid.value = true}
          }
        } catch (error) {
          handleError(error);
        }
      };
    const fetchAllBids = async () => {
    try {
      const response = await axios.get(API.GET_ALL_BIDS, {
        params: { userId: sessionUserId.value, matchNumber: matchNumber.value }
      });

      // 서버에서 좌석별 입찰자 수와 최고 입찰 금액을 포함하여 데이터를 가져옴
      allSeatBidArray.value = response.data.map(seat => {
        const uniqueSeatId = Number(seat.seat_no); // seat_no를 숫자로 변환
        if (seat.total_bidders > 0)
          {biddedSeatCount.value +=1}
        return {
          ...seat,
          uniqueSeatId: uniqueSeatId, // 변환된 uniqueSeatId 할당
        };
        });

      // total_bidders가 0보다 큰 좌석을 selectedSeats에 추가
      selectedSeats.value = allSeatBidArray.value.filter(seat => seat.total_bidders > 0);
      countSelectedSeats.value = selectedSeats.value.length;
      } catch (error) {
        handleError(error);
      }
  };


    const calculateBiddedSeats = () => {
      const count = selectedSeats.value.filter((seat) => seat.total_bidders > 0).length;
      countbiddedSeats.value = count;
    };

    return {
      sessionUserId,
      matchNumber,
      bidStatus,
      canAwardBid,
      biddedSeatCount,
      allSeatBidArray,
      selectedSeats,
      countSelectedSeats,
      clickCount,
      countbiddedSeats,
      minBidAmount,
      bidTotal,
      message,
      handleSeatClick,
      handleAwardBid,
      handleAllClick,
      handleRefresh,
      handleBiddedSeat,
      handleActionChange,
      radioOptions
    };
  }
};
</script>

<style scoped>
.columnflex-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.spaced-span {
  margin-right: 10px;
}

.q-message {
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
}

.q-btn {
  margin-top: 20px;
}

.full-width {
  width: 100%;
}

@media (max-width: 600px) {
  .buttons-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .spaced-span {
    display: block;
    margin-bottom: 5px;
  }

  .q-btn {
    width: 100%;
  }

  .q-message {
    font-size: 0.9rem;
    padding: 8px;
  }
}
</style>
