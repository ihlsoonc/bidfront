<template>
  <div class="bids-list">
    <p>입찰 및 낙찰 현황</p>

    <!-- 입찰 좌석이 없는 경우 -->
    <div v-if="rowData.length === 0" class="no-data">
      <p>입찰 내역이 없습니다.</p>
    </div>

    <!-- 최고가 내역 -->
    <div v-else style="width: 100%; height: 100%">
      <ag-grid-vue
        :rowData="rowData"
        :columnDefs="columnDefs"
        style="height: 500px"
        class="ag-theme-alpine"
        :gridOptions="gridOptions"
        @rowClicked="onRowClicked"
      ></ag-grid-vue>
    </div>

    <!-- 입찰 내역  -->
    <div v-if="isDialogOpen" class="dialog-overlay">
      <div class="dialog">
        <p>
          좌석번호 {{ detailedSeatNumber }}&nbsp;&nbsp;&nbsp;&nbsp;입찰 내역
        </p>
        <ag-grid-vue
          :rowData="detailedRowData"
          :columnDefs="detailedColumnDefs"
          style="height: 350px; width: 100%"
          class="ag-theme-alpine"
        ></ag-grid-vue>
        <button @click="closeDialog" class="close-btn">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, computed } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const props = defineProps({
  seats: {
    type: Array,
    default: () => [],
  },
});

const rowData = computed(() =>
  props.seats.map((seat) => ({
    ...seat,
  }))
);

const columnDefs = [
  { headerName: "상태", field: "bidWonStatus", flex: 1 },
  { headerName: "좌석 번호", field: "seat_no", flex: 1 },
  { headerName: "사용자", field: "username", flex: 1 },
  {
    headerName: "입찰 금액",
    field: "bid_amount",
    valueFormatter: (params) => `${params.value.toLocaleString()}원`,
    flex: 1,
  },
  {
    headerName: "입찰 시간",
    field: "bid_at",
    valueFormatter: (params) => formatTimeToLocal(params.value),
    flex: 2,
  },
  {
    headerName: "결제 여부",
    field: "paidStatus",
    valueFormatter: (params) => `${params.value}`,
    flex: 1,
  },
  {
    headerName: "입찰 건수",
    field: "total_bids",
    valueFormatter: (params) => `${params.value}건`,
    flex: 1,
  },
  {
    headerName: "상세 내역",
    field: "total_bids",
    flex: 1,
    cellRenderer: (params) => {
      if (params.value > 1) {
        return `<button type="button" class="view-history-btn" data-id="${params.rowIndex}" title="내역s">내역 보기</button>`;
      }
      return `<span>-</span>`;
    },
  },
];

const gridOptions = {
  defaultColDef: {
    resizable: true,
    sortable: true,
  },
  autoSizeStrategy: {
    type: "fitGridWidth",
  },
  pagination: true,
  paginationPageSizeSelector: [10, 20, 30],
  rowHeight: 50,
};

const isDialogOpen = ref(false);
const detailedSeatNumber = ref("");
const detailedRowData = ref([]);
const detailedColumnDefs = ref([
  { headerName: "입찰자", field: "username", flex: 1 },
  { headerName: "입찰 금액", field: "bid_amount", flex: 1 },
  {
    headerName: "입찰 시간",
    field: "bid_at",
    valueFormatter: (params) => formatTimeToLocal(params.value),
    flex: 1,
    sortable: true,
  },
]);

const onRowClicked = (params) => {
  if (params.data.total_bids > 1) {
    isDialogOpen.value = true;
    detailedSeatNumber.value = params.data.seat_no;
    detailedRowData.value = params.data.bidHistory || []; // 상세 데이터를 설정
  }
};

const closeDialog = () => {
  isDialogOpen.value = false;
};

const formatTimeToLocal = (time) => {
  const date = new Date(time);
  return date.toLocaleString();
};
</script>

<style scoped>
.no-data {
  text-align: center;
  font-size: 1.2em;
  margin-top: 20px;
}

.history-icon {
  cursor: pointer;
  color: rgb(128, 128, 128); /* 기본 회색 */
  font-size: 1.2em;
  display: inline-block;
}

.history-icon:hover {
  color: darkgray;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  text-align: center;
}

.close-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #0056b3;
}
</style>
