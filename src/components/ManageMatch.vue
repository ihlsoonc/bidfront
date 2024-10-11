<template>
  <q-page padding>
    <q-banner v-if="!venueArray || venueArray.length === 0" type="warning">
      현재 정보가 없습니다.
    </q-banner>

    <div v-else>
      <h5 class="text-center">경기 정보</h5>
      <q-table
        :rows="matchArray"
        :columns="columns"
        row-key="match_no"
        flat
        grid
        :rows-per-page-options="[5, 10, 15]"
        dense
      >
        <template v-slot:body-cell-actions="props">
          <q-td>
            <q-btn @click="handleDownload(props.row)" flat label="첨부보기" class="q-mr-sm" />
            <q-btn
              v-if="props.row.approved !== 'Y'"
              @click="handleUpdate(props.row)"
              flat
              label="수정"
              class="q-mr-sm"
            />
            <q-btn
              v-if="props.row.approved !== 'Y'"
              @click="handleDelete(props.row)"
              flat
              label="삭제"
              class="q-mr-sm"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <div class="row q-mt-md q-col-gutter-md">
      <q-btn
        @click="handleInsert"
        label="경기 추가"
        :disable="canUpdate || canDelete"
        class="col-12 col-md-4"
        color="primary"
      />
    </div>

    <div v-if="canInsert || canUpdate || canDelete" class="q-mt-md">
      <q-form @submit.prevent="handleSubmit">
        <div class="row q-col-gutter-md">
          <q-input v-model="matchData.matchNumber" label="경기 번호" readonly class="col-12 col-md-6" />
          <q-select
            v-model="matchData.venueCd"
            label="경기장 코드"
            :options="venueOptions"
            :disable="!canInsert && !canUpdate || canDelete"
            class="col-12 col-md-6"
            @input="updateVenueName"
          />
        </div>
        <div class="row q-col-gutter-md">
          <q-input v-model="matchData.venueName" label="경기장" readonly class="col-12 col-md-6" />
          <q-input v-model="matchData.matchName" label="경기명" :disable="canDelete" class="col-12 col-md-6" />
        </div>
        <div class="row q-col-gutter-md">
          <q-input v-model="matchData.round" label="라운드명" :disable="canDelete" class="col-12 col-md-6" />
          <q-input v-model="matchData.startDate" label="경기 일자" type="date" :disable="canDelete" class="col-12 col-md-6" />
        </div>
        <div class="row q-col-gutter-md">
          <q-input v-model="matchData.startTime" label="경기 시작 시간" type="time" :disable="canDelete" class="col-12 col-md-6" />
          <q-input v-model="matchData.endTime" label="경기 종료 시간" type="time" :disable="canDelete" class="col-12 col-md-6" />
        </div>
        <div class="row q-col-gutter-md">
          <q-input v-model="matchData.bidOpenTime" label="입찰 개시" type="datetime-local" :disable="canDelete" class="col-12 col-md-6" />
          <q-input v-model="matchData.bidCloseTime" label="입찰 종료" type="datetime-local" :disable="canDelete" class="col-12 col-md-6" />
        </div>
        <div class="row q-col-gutter-md">
          <q-select
            v-model="matchData.isBidAvailable"
            label="입찰 가능 여부"
            :options="[{ label: '입찰 가능', value: 1 }, { label: '입찰 불가능', value: 0 }]"
            :disable="canDelete"
            class="col-12 col-md-6"
          />
          <q-input type="file" @change="handleFileChange" :disable="canDelete" class="col-12 col-md-6" />
        </div>
        <div class="row q-col-gutter-md">
          <q-btn type="submit" label="확인" color="primary" class="col-12 col-md-4 q-mt-md" :disable="!canInsert && !canUpdate && !canDelete" />
          <q-btn @click="handleSubmitCancel" label="취소" color="negative" class="col-12 col-md-4 q-mt-md" />
        </div>
      </q-form>
    </div>

    <q-banner v-if="message" type="info">{{ message }}</q-banner>
    <q-banner v-if="fileMessage" type="info">{{ fileMessage }}</q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { API } from '../utils/messagesAPIs';

const matchArray = ref([]);
const venueArray = ref([]);
const matchData = ref({
  matchNumber: '',
  venueCd: '',
  venueName: '',
  matchName: '',
  round: '',
  startDate: '',
  startTime: '',
  endTime: '',
  bidOpenTime: '',
  bidCloseTime: '',
  isBidAvailable: 1,
  fileName: '',
});
const columns = [
  { name: 'match_no', label: '경기 번호', field: 'match_no' },
  { name: 'venue_name', label: '경기장', field: 'venue_name' },
  { name: 'match_name', label: '경기명', field: 'match_name' },
  { name: 'round', label: '라운드', field: 'round' },
  { name: 'start_time', label: '경기 시간', field: 'start_time' },
  { name: 'is_bid_available', label: '입찰 가능 여부', field: 'is_bid_available' },
  { name: 'bid_period', label: '입찰 기간', field: 'bid_period' },
  { name: 'approved', label: '승인 상태', field: 'approved' },
  { name: 'actions', label: '변경', align: 'center' }
];
const venueOptions = computed(() => venueArray.value.map(v => ({ label: v.venue_cd, value: v.venue_cd })));

const canInsert = ref(false);
const canUpdate = ref(false);
const canDelete = ref(false);
const message = ref('');
const fileMessage = ref('');

// Fetch Data
const fetchMatches = async () => {
  const response = await axios.get(API.GET_ALLMATCHES);
  matchArray.value = response.data;
};
const fetchVenues = async () => {
  const response = await axios.get(API.GET_ALL_VENUES);
  venueArray.value = response.data;
};

const handleInsert = () => {
  canInsert.value = true;
  canUpdate.value = false;
  canDelete.value = false;
  resetForm();
};

const handleSubmit = async () => {
  if (canInsert.value) {
    await axios.post(API.ADD_MATCH, matchData.value);
  } else if (canUpdate.value) {
    await axios.post(API.UPDATE_MATCH, matchData.value);
  } else if (canDelete.value) {
    await axios.post(API.DELETE_MATCH, matchData.value);
  }
  fetchMatches();
};

const handleFileChange = event => {
  const file = event.target.files[0];
  matchData.value.fileName = file ? file.name : '';
};

const resetForm = () => {
  matchData.value = {
    matchNumber: '',
    venueCd: '',
    venueName: '',
    matchName: '',
    round: '',
    startDate: '',
    startTime: '',
    endTime: '',
    bidOpenTime: '',
    bidCloseTime: '',
    isBidAvailable: 1,
    fileName: '',
  };
};

// Lifecycle hook
onMounted(() => {
  fetchMatches();
  fetchVenues();
});
</script>

<style scoped>
.q-btn {
  margin-top: 10px;
}
.q-banner {
  margin-top: 20px;
}
.text-center {
  text-align: center;
}
.q-mr-sm {
  margin-right: 10px;
}
</style>
