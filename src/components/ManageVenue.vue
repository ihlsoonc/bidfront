<template>
  <q-page padding>
    <div v-if="!venueArray || venueArray.length === 0">
      <q-banner type="warning">현재 정보가 없습니다.</q-banner>
    </div>
    <div v-else>
      <h5>경기장 정보</h5>
      <q-table :rows="venueArray" :columns="columns" row-key="venue_cd" flat>
        <template v-slot:body-cell-actions="props">
          <q-td>
            <q-btn @click="handleUpdate(props.row)" flat label="수정" />
            <q-btn @click="handleDelete(props.row)" flat label="삭제" />
          </q-td>
        </template>
      </q-table>
    </div>

    <q-btn @click="handleInsert" label="신규 경기장 추가" :disable="canUpdate || canDelete" class="q-mt-md" />

    <div v-if="canInsert || canUpdate || canDelete" class="q-mt-md">
      <q-form @submit.prevent="handleSubmit">
        <q-input v-model="venueData.venueCd" label="경기장 코드" :disable="canUpdate || canDelete" maxlength="3" />
        <q-input v-model="venueData.venueName" label="경기장 이름" :disable="canDelete" />
        <q-input v-model="venueData.venuePlaceInfo" label="경기장 위치 정보" :disable="canDelete" />
        <q-input v-model="venueData.venueGeneralInfo" label="경기장 일반 정보" :disable="canDelete" />

        <q-btn type="submit" label="확인" class="q-mt-md" :disable="!canInsert && !canUpdate && !canDelete" />
        <q-btn @click="handleSubmitCancel" label="취소" color="negative" class="q-mt-md" />
      </q-form>
    </div>

    <q-banner v-if="message" type="info">{{ message }}</q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API } from '../utils/messagesAPIs';

const venueArray = ref([]);
const venueData = ref({
  venueCd: '',
  venueName: '',
  venuePlaceInfo: '',
  venueGeneralInfo: '',
});
const columns = [
  { name: 'venue_cd', label: '경기장 코드', field: 'venue_cd' },
  { name: 'venue_name', label: '경기장 이름', field: 'venue_name' },
  { name: 'venue_place_info', label: '경기장 위치 정보', field: 'venue_place_info' },
  { name: 'venue_general_info', label: '경기장 일반 정보', field: 'venue_general_info' },
  { name: 'actions', label: '변경', align: 'center' }
];

const canInsert = ref(false);
const canUpdate = ref(false);
const canDelete = ref(false);
const message = ref('');

// Fetch Data
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

const handleUpdate = (venue) => {
  canUpdate.value = true;
  canDelete.value = false;
  canInsert.value = false;
  venueData.value = { ...venue };
};

const handleDelete = async (venue) => {
  canDelete.value = true;
  await axios.post(API.DELETE_VENUE, venue);
  fetchVenues();
};

const handleSubmit = async () => {
  if (canInsert.value) {
    await axios.post(API.ADD_VENUE, venueData.value);
  } else if (canUpdate.value) {
    await axios.post(API.UPDATE_VENUE, venueData.value);
  }
  fetchVenues();
};

const handleSubmitCancel = () => {
  canInsert.value = false;
  canUpdate.value = false;
  canDelete.value = false;
  resetForm();
};

const resetForm = () => {
  venueData.value = {
    venueCd: '',
    venueName: '',
    venuePlaceInfo: '',
    venueGeneralInfo: '',
  };
};

// Lifecycle hook
onMounted(() => {
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
</style>
