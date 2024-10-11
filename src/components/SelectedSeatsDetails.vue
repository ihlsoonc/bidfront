<template>
  <div class="common-container">
    <h7 style="text-align: center;">선택 좌석 상세 정보</h7>
    <table class="input-table">
      <thead>
        <tr>
          <th>좌석 번호</th>
          <th>좌석 가격</th>
          <th>총 입찰자 수</th>
          <th>최고 입찰 금액</th>
          <!-- isUser가 true일 때만 입찰 금액과 제출 결과 컬럼을 보여줍니다 -->
          <th v-if="isUser">입찰 금액</th>
          <th v-if="isUser">비고</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="seat in selectedSeats" :key="seat.uniqueSeatId">
          <td>{{ seat.seat_no }}번 : {{ seat.row_no }}열 {{ seat.col_no }}</td>
          <td>{{ seat.seat_price }}원</td>
          <td>{{ seat.total_bidders }}명</td>
          <td>{{ seat.current_bid_amount > 0 ? seat.current_bid_amount : seat.seat_price }}원</td>
          <!-- isUser이나 bid 종료시에는 입찰 제출 버튼 diable -->
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
        <!-- 선택된 좌석이 없을 때 표시 -->
        <tr v-if="selectedSeats.length === 0">
          <td colspan="6" style="text-align: center;">
            선택 정보가 없습니다.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { reactive, watch, toRefs } from 'vue';

export default {
  props: {
    selectedSeats: {
      type: Array,
      required: true
    },
    bidAmounts: {
      type: Object,
      required: true
    },
    isUser: {
      type: Boolean,
      required: true
    },
    isClosedBid: {
      type: Boolean,
      required: true
    }
  },

  setup(props, { emit }) {
    const state = reactive({
      localBidAmounts: { ...props.bidAmounts }
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
      emit('bid-amount-change', value, seat);
    };

    return {
      ...toRefs(state),
      onBidAmountChange
    };
  }
};
</script>

<style scoped>

</style>
