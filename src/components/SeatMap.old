<template>
  <div>
    <div class="box-container">
      <h6 style="text-align: center">
        좌석을 선택한 후 입찰 금액을 입력하세요.
      </h6>
      <div class="box-container">
        <q-btn
          id="seat-1"
          class="box"
          :class="{
            selected: isSelected(1),
            bidded: hasBidders(1),
            selectedbidded: isSelected(1) && hasBidders(1),
          }"
          @click="handleSeatClick(1)"
          label="1번\n{{ getSeatInfo(1).highestBid }}원\n{{ getSeatInfo(1).bidCount }}명"
          flat
        />

        <q-btn
          id="seat-2"
          class="box"
          :class="{
            selected: isSelected(2),
            bidded: hasBidders(2),
            selectedbidded: isSelected(2) && hasBidders(2),
          }"
          @click="handleSeatClick(2)"
          label="2번\n{{ getSeatInfo(2).highestBid }}원\n{{ getSeatInfo(2).bidCount }}명"
          flat
        />

        <q-btn
          id="seat-3"
          class="box"
          :class="{
            selected: isSelected(3),
            bidded: hasBidders(3),
            selectedbidded: isSelected(3) && hasBidders(3),
          }"
          @click="handleSeatClick(3)"
          label="3번\n{{ getSeatInfo(3).highestBid }}원\n{{ getSeatInfo(3).bidCount }}명"
          flat
        />

        <q-btn
          id="seat-4"
          class="box"
          :class="{
            selected: isSelected(4),
            bidded: hasBidders(4),
            selectedbidded: isSelected(4) && hasBidders(4),
          }"
          @click="handleSeatClick(4)"
          label="4번\n{{ getSeatInfo(4).highestBid }}원\n{{ getSeatInfo(4).bidCount }}명"
          flat
        />

        <q-btn
          id="seat-5"
          class="box"
          :class="{
            selected: isSelected(5),
            bidded: hasBidders(5),
            selectedbidded: isSelected(5) && hasBidders(5),
          }"
          @click="handleSeatClick(5)"
          label="5번\n{{ getSeatInfo(5).highestBid }}원\n{{ getSeatInfo(5).bidCount }}명"
          flat
        />

        <!-- 필요한 만큼 q-btn 추가 -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    selectedSeats: Array,
    seatBidArray: Array, // 좌석별 입찰 정보를 받을 수 있도록 설정
    disabled: Boolean,
    onSeatClick: {
      type: Function,
      required: true,
    },
  },
  methods: {
    handleSeatClick(seatNumber) {
      this.$emit("seat-click", seatNumber);
    },
    isSelected(number) {
      return this.selectedSeats.some((seat) => seat.uniqueSeatId === number);
    },
    hasBidders(number) {
      const seat = this.seatBidArray.find((s) => s.seat_no == number);
      return seat ? seat.total_bidders > 0 : false;
    },
    getSeatInfo(number) {
      const seat = this.seatBidArray.find((s) => s.seat_no == number);
      if (seat) {
        return {
          highestBid: seat.current_bid_amount || 0,
          bidCount: seat.total_bidders || 0,
        };
      }
      return { highestBid: 0, bidCount: 0 };
    },
  },
};
</script>

<style scoped>
.box-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
}

.box.selected {
  background-color: #9cd3ec;
}

.box.bidded {
  background-color: #8da1ea;
}

.box.selectedbidded {
  background-color: #d2dafa;
}
</style>
