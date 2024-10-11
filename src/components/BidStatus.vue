<template>
    <q-card class="q-mb-xs"> <!-- 하나의 q-card로 합침 -->
      <q-card-section>
        <!-- bidStatus가 없을 때 표시할 내용 -->
        <div v-if="!bidStatus">
          <q-spinner color="primary" size="30px" />
          <q-banner class="q-mt-sm">경기 정보를 조회 중입니다.</q-banner>
        </div>

        <!-- bidStatus가 있을 때 표시할 내용 -->
        <div v-else>
          <q-item>
            <q-item-section>
              <q-item-label>
                경기번호 ({{ bidStatus.match_no }}) {{ matchRound }}
                <span class="bold-text">{{ openStatus }}</span>
              </q-item-label>
              <q-item-label>경기 시간</q-item-label>
              {{ bidStatus.start_date }}일 {{ bidStatus.start_time }} ~ {{ bidStatus.end_time }}
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>입찰 기간</q-item-label>
              <q-item-section>
                {{ formatTimeToLocal(bidStatus.bid_open_datetime) }} ~
                {{ formatTimeToLocal(bidStatus.bid_close_datetime) }}
              </q-item-section>
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { formatTimeToLocal } from '../utils/commonFunction';

export default defineComponent({
  name: 'BidStatus',
  props: {
    bidStatus: {
      type: Object,
      default: () => null
    }
  },
  setup(props) {
    const openStatus = computed(() => {
      if (!props.bidStatus) return '확인 중...';
      switch (props.bidStatus.bidStatusCode) {
        case 'N': return '입찰 미개시';
        case 'O': return '입찰 가능';
        case 'C': return '입찰 종료';
        case 'F': return '낙찰 종료';
        default: return '현재 입찰할 수 없습니다.';
      }
    });

    const matchRound = computed(() => {
      if (!props.bidStatus) return '';

      const { match_name, round, venue_name } = props.bidStatus;
      return `${match_name} ${round} (${venue_name})`;
    });

    return {
      openStatus,
      matchRound,
      formatTimeToLocal
    };
  }
});
</script>

<style scoped>
.bold-text {
  font-weight: bold;
}

/* 작은 화면 대응 */
@media (max-width: 600px) {
  .q-item-label {
    font-size: 14px;
  }

  .q-item-section {
    font-size: 12px;
  }
}
</style>
