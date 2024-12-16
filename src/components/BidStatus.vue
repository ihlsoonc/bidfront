<template>
  <q-card class="q-mb-xs">
    <!-- 하나의 q-card로 합침 -->
    <q-card-section>
      <!-- bidStatus가 없을 때 표시할 내용 -->
      <div v-if="!bidStatus">
        <q-banner class="q-mt-sm" color="negative">
          경기 정보를 조회 할 수 없습니다.
        </q-banner>
      </div>

      <!-- bidStatus가 있을 때 표시할 내용 -->
      <div v-else>
        <!-- 경기 정보 -->
        <q-item>
          <q-item-section>
            <q-item-label>
              <span class="bold-text">
                {{ matchRound }} {{ bidStatus.bid_status_name }} (경기번호
                {{ bidStatus.match_no }})</span
              >
            </q-item-label>

            <q-item-label
              >경기 시간 {{ bidStatus.start_date }}일
              {{ bidStatus.start_time }} ~
              {{ bidStatus.end_time }}</q-item-label
            >
          </q-item-section>
        </q-item>

        <!-- 입찰 기간 -->
        <q-item v-if="bidStatus.is_bid_available == 'Y'">
          <q-item-section>
            <q-item-label
              >입찰 기간 {{ formatTimeToLocal(bidStatus.bid_open_datetime) }} ~
              {{ formatTimeToLocal(bidStatus.bid_close_datetime) }}&nbsp;&nbsp;
              결제 시한 {{ formatTimeToLocal(bidStatus.pay_due_datetime) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from "vue";
import { formatTimeToLocal } from "../utils/formatTimeToLocal";

// props 정의
const props = defineProps({
  bidStatus: {
    type: Object,
    default: () => null,
  },
});

// 경기 정보 표시 (경기명, 라운드, 장소)
const matchRound = computed(() => {
  if (!props.bidStatus) return "";
  const { match_name, round, venue_name } = props.bidStatus;
  return `${match_name} ${round} (${venue_name})`;
});
</script>

<style scoped>
.bold-text {
  font-weight: bold;
}
</style>
