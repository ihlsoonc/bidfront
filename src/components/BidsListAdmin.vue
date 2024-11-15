<template>
  <div class="bids-list">
    <q-card class="q-pa-md q-mb-md">
      <q-card-section>
        <h6>입찰 및 낙찰 현황</h6>
      </q-card-section>

      <!-- 입찰 좌석이 없는 경우 -->
      <q-card-section v-if="seats.length === 0">
        <q-banner color="warning">입찰 내역이 없습니다.</q-banner>
      </q-card-section>

      <!-- 입찰 좌석이 있는 경우 -->
      <q-card-section v-else>
        <q-table :rows="seats" :columns="tableColumns" row-key="seat_no" flat>
          <!-- 좌석 번호, 열, 컬럼 -->
          <template v-slot:body="props">
            <!-- 좌석 정보 -->
            <q-tr :props="props">
              <q-td class="important-text">
                {{ props.row.bidWonStatus }}
              </q-td>
              <q-td>
                {{ props.row.seat_no }} ({{ props.row.row_no }} 열
                {{ props.row.col_no }}번)
                {{ props.row.paidStatus }}
              </q-td>
              <q-td> {{ props.row.username }} </q-td>
              <q-td>
                {{ props.row.bid_amount.toLocaleString() }}원 :
                {{ formatTimeToLocal(props.row.bid_at) }}
              </q-td>
              <q-td>
                {{ props.row.total_bidders }}명&nbsp;&nbsp;&nbsp;
                {{ props.row.total_bids }}건</q-td
              >
              <q-td>
                <q-btn
                  v-if="props.row.historyButtonEnabled"
                  @click="toggleHistory(props.row)"
                  :color="
                    isSelectedHistory(props.row) ? 'primary' : 'secondary'
                  "
                  size="xs"
                  :icon="
                    isSelectedHistory(props.row)
                      ? 'keyboard_arrow_up'
                      : 'keyboard_arrow_down'
                  "
                >
                  <q-badge
                    :color="
                      isSelectedHistory(props.row) ? 'primary' : 'secondary'
                    "
                  >
                    입찰이력 {{ props.row.bidHistory.length }}건
                  </q-badge>
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
                    {{ history.username }}&nbsp;&nbsp;
                    {{ history.bid_amount.toLocaleString() }}원 :
                    {{ formatTimeToLocal(history.bid_at) }}
                  </q-item-section>
                </q-item>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <!-- 낙찰금액과 입찰금액 합계 표시 -->
        <div>
          총 {{ totalWinCount }}건 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 입찰금액 합계:
          {{ totalBidAmount.toLocaleString() }}원
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  seats: Array,
  tableColumns: Array,
  selectedHistoryButton: Number,
  totalWinAmount: Number,
  totalWinCount: Number,
  totalBidAmount: Number,
  isApproved: Boolean,
});

const emit = defineEmits(["toggleHistory"]);

// 날짜 및 시간 형식을 로컬 시간으로 포맷하는 함수
const formatTimeToLocal = (time) => {
  const date = new Date(time);
  return date.toLocaleString();
};

// 이력 토글 핸들러
const toggleHistory = (seat) => {
  emit("toggleHistory", seat);
};

// 선택된 이력인지 확인
const isSelectedHistory = (row) => props.selectedHistoryButton === row.seat_no;
</script>

<style scoped></style>
