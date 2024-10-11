<template>
    <div>
      <q-banner class="q-mb-md" type="info" text="좌석을 선택한 후 입찰 금액을 입력하세요." />
      <div class="seat-grid">
        <q-btn
          v-for="seatNumber in 23"
          :key="seatNumber"
          :label="`${seatNumber}번\n${getSeatInfo(seatNumber).highestBid}원\n${getSeatInfo(seatNumber).bidCount}명`"
          :class="{ selected: isSelected(seatNumber), bidded: hasBidders(seatNumber), selectedbidded: isSelected(seatNumber) && hasBidders(seatNumber) }"
          @click="handleSeatClick(seatNumber)"
          flat
          color="primary"
          class="seat-box"
        />
      </div>
    </div>
</template>

<script>
export default {
  props: {
    selectedSeats: Array,
    seatBidArray: Array,
    disabled: Boolean,
    onSeatClick: {
      type: Function,
      required: true
    }
  },
  methods: {
    handleSeatClick(seatNumber) {
      this.$emit('seat-click', seatNumber);
    },
    isSelected(number) {
      return this.selectedSeats.some(seat => seat.uniqueSeatId === number);
    },
    hasBidders(number) {
      const seat = this.seatBidArray.find(s => s.seat_no == number);
      return seat ? seat.total_bidders > 0 : false;
    },
    getSeatInfo(number) {
      const seat = this.seatBidArray.find(s => s.seat_no == number);
      if (seat) {
        return {
          highestBid: seat.current_bid_amount || 0,
          bidCount: seat.total_bidders || 0
        };
      }
      return { highestBid: 0, bidCount: 0 };
    }
  }
};
</script>

<style scoped>
.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); /* 자동으로 크기 조절 */
  gap: 10px;
  max-width: 100%; /* 반응형으로 최대 너비 100% */
  margin: 0 auto;
}

.seat-box {
  height: 60px;
  font-size: 12px;
  font-weight: bold;
  white-space: pre-line;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: background-color 0.3s ease;
  cursor: pointer;
  padding: 5px;
}

.seat-box.selected {
  background-color: #9cd3ec;
}

.seat-box.bidded {
  background-color: #8da1ea;
}

.seat-box.selectedbidded {
  background-color: #d2dafa;
}

@media (max-width: 600px) {
  .seat-box {
    font-size: 10px;
    height: 50px;
  }
}

@media (min-width: 601px) {
  .seat-box {
    font-size: 12px;
    height: 60px;
  }
}
</style>
