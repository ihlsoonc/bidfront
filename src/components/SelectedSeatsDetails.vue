<template>
  <div class="common-container">
    <div style="text-align: center">선택 좌석 상세 정보</div>
    <table>
      <thead>
        <tr>
          <th>좌석 번호</th>
          <th>좌석 가격</th>
          <th>총 입찰자 수</th>
          <th>최고 입찰 금액</th>
          <th v-if="isUser">입찰 금액</th>
          <th v-if="isUser">비고</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="seat in selectedSeats" :key="seat.uniqueSeatId">
          <td>{{ seat.seat_no }}번 : {{ seat.row_no }}열 {{ seat.col_no }}</td>
          <td>{{ seat.seat_price }}원</td>
          <td>{{ seat.total_bidders }}명</td>
          <td>{{ seat.current_bid_amount }}원</td>
          <td v-if="isUser">
            <input
              type="number"
              v-model.number="localBidAmounts[seat.uniqueSeatId]"
              @input="onBidAmountChange($event, seat)"
              :disabled="isClosedBid"
            />
          </td>
          <td v-if="isUser">{{ seat.submitResult }}</td>
        </tr>
        <tr v-if="selectedSeats.length === 0">
          <td colspan="6" style="text-align: center">선택 정보가 없습니다.</td>
        </tr>
      </tbody>
    </table>
    <div>
      <span>최저 입찰 금액 합계: {{ minBidAmount }}원</span>
      <span>현재 입찰 금액: {{ bidTotal }}원</span>
    </div>
  </div>
  <div v-if="isUser">
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
  </div>
</template>

<script>
import { reactive, computed, watch, toRefs } from "vue";

export default {
  props: {
    selectedSeats: {
      type: Array,
      required: true,
    },
    bidAmounts: {
      type: Object,
      required: true,
    },
    isUser: {
      type: Boolean,
      required: true,
    },
    isClosedBid: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { emit }) {
    const state = reactive({
      localBidAmounts: { ...props.bidAmounts },
    });

    watch(
      () => props.bidAmounts,
      (newVal) => {
        state.localBidAmounts = { ...newVal };
      },
      { deep: true }
    );

    const onBidAmountChange = (event, seat) => {
      const value = parseFloat(event.target.value) || 0;
      emit("bidAmountChange", value, seat);
    };

    const minBidAmount = computed(() => {
      return props.selectedSeats.reduce((sum, seat) => {
        const chosenAmount =
          seat.current_bid_amount > 0
            ? seat.current_bid_amount
            : seat.seat_price;
        return sum + (chosenAmount || 0);
      }, 0);
    });

    const bidTotal = computed(() => {
      return Object.values(state.localBidAmounts).reduce(
        (sum, amount) => sum + amount,
        0
      );
    });

    const handleBidSubmit = () => {
      emit("submit-bid", bidTotal.value);
    };

    const cancelBidSubmit = () => {
      state.localBidAmounts = {};

      emit("cancel-bid");
    };

    return {
      ...toRefs(state),
      onBidAmountChange,
      minBidAmount,
      bidTotal,
      handleBidSubmit,
      cancelBidSubmit,
    };
  },
};
</script>

<style scoped>
.q-btn:disabled {
  background-color: gray !important; /* 비활성화된 버튼 배경색을 회색으로 설정 */
  color: white !important; /* 텍스트 색상 설정 */
  opacity: 1 !important; /* Quasar의 기본 투명도 제거 */
}
</style>
