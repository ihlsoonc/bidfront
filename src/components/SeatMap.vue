<template>
  <div>
    <br />
    <p>입찰내용이 있는 좌석은 윤곽선으로 표시됨.</p>
    <br />
    <div class="seat-grid">
      <q-btn
        v-for="seatNumber in 40"
        :key="seatNumber"
        :label="`${seatNumber}번\n${getSeatInfo(seatNumber).highestBid}원\n${
          getSeatInfo(seatNumber).bidCount
        }명`"
        :class="{
          selected: isSelected(seatNumber),
          bidded: hasBidders(seatNumber),
          selectedbidded: isSelected(seatNumber) && hasBidders(seatNumber),
        }"
        @click="handleSeatClick(seatNumber)"
        flat
        color="primary"
        text-color="black"
        class="seat-box"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  selectedSeats: Array,
  bidsArray: Array,
  disabled: Boolean,
  onSeatClick: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["seat-click"]);

// 좌석 클릭 핸들러
const handleSeatClick = (seatNumber) => {
  emit("seat-click", seatNumber);
};

// 좌석이 선택되었는지 확인하는 함수
const isSelected = (number) => {
  return props.selectedSeats.some((seat) => seat.uniqueSeatId === number);
};

// 좌석에 입찰자가 있는지 확인하는 함수
const hasBidders = (number) => {
  // bidsArray가 유효한 배열인지 확인
  if (!Array.isArray(props.bidsArray)) {
    console.error("bidsArray is not defined or not an array.");
    return false;
  }

  const seat = props.bidsArray.find((s) => s.seat_no == number);
  return seat ? seat.total_bidders > 0 : false;
};

const getSeatInfo = (number) => {
  // bidsArray 유효한지 확인
  if (!props.bidsArray || !Array.isArray(props.bidsArray)) {
    console.error("bidsArray is invalid:", props.bidsArray);
    return { highestBid: 0, bidCount: 0 };
  }

  const seat = props.bidsArray.find((s) => s.seat_no == number);

  // seat가 없는 경우의 처리
  if (!seat) {
    return { highestBid: 0, bidCount: 0 };
  }

  return {
    highestBid: seat.current_bid_amount || 0,
    bidCount: seat.total_bidders || 0,
  };
};
</script>

<style scoped>
.seat-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(60px, 1fr)
  ); /* 자동으로 크기 조절 */
  gap: 5px;
  max-width: 100%; /* 반응형으로 최대 너비 100% */
  margin-top: none;
}

.seat-box {
  height: 60px;
  font-size: 10px;
  font-weight: bold;
  white-space: pre-line;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: background-color 0.3s ease;
  cursor: pointer;
  padding: 3px;
  background-color: #eff1f7;
}

.seat-box.selected {
  background-color: #9cd3ec;
}

.seat-box.bidded {
  border: 5px solid #a7a3a3; /* 짙은 회색(#a7a3a3) 두께 5px */
  box-shadow: 0 0 8px 3px #a7a3a3; /* 번짐 효과 추가 */
}

/* props 값을 표시할 영역 스타일 */
.props-display {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.props-display p {
  margin: 5px 0;
  font-size: 14px;
}
</style>
