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
              <q-td>
                {{ props.row.seat_no }} ({{ props.row.row_no }} 열
                {{ props.row.col_no }}번)
                {{ props.row.bidWonStatus }}
                {{ props.row.paidStatus }}
              </q-td>
              <q-td>
                {{ props.row.bid_amount.toLocaleString() }}원 :
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
                    이력 {{ props.row.bidHistory.length }}건
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
          낙찰금액 합계: {{ totalWinAmount.toLocaleString() }}원 &nbsp;&nbsp;
          {{ totalWinCount }}건 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 입찰금액 합계:
          {{ totalBidAmount.toLocaleString() }}원
        </div>
      </q-card-section>

      <!-- 결제 및 경기 선택 버튼 섹션 -->
      <q-card-section>
        <q-btn
          @click="emitPaySubmit"
          :disable="isApproved || totalWinAmount === 0"
          color="primary"
          label="낙찰 내용 결제"
        />
        <q-btn
          @click="emitSelectVenue"
          color="secondary"
          label="경기 다시 선택"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  name: "BidsList",
  props: {
    seats: Array,
    tableColumns: Array,
    selectedHistoryButton: Number,
    totalWinAmount: Number,
    totalWinCount: Number,
    totalBidAmount: Number,
    isApproved: Boolean, // 결제 승인 상태를 확인하는 prop
  },
  emits: ["toggleHistory", "paySubmit", "selectVenue"],
  setup(props, { emit }) {
    const formatTimeToLocal = (time) => {
      const date = new Date(time);
      return date.toLocaleString();
    };

    const toggleHistory = (seat) => {
      emit("toggleHistory", seat);
    };

    const isSelectedHistory = (row) =>
      props.selectedHistoryButton === row.seat_no;

    const emitPaySubmit = () => {
      emit("paySubmit"); // 부모 컴포넌트로 'paySubmit' 이벤트 전송
    };

    const emitSelectVenue = () => {
      emit("selectVenue"); // 부모 컴포넌트로 'selectVenue' 이벤트 전송
    };

    return {
      formatTimeToLocal,
      toggleHistory,
      isSelectedHistory,
      emitPaySubmit,
      emitSelectVenue,
    };
  },
};
</script>

<style scoped></style>
