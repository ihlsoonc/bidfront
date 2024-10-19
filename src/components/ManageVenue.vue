<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md q-mb-lg" flat bordered>
      <q-card-section>
        <div v-if="!venueArray || venueArray.length === 0" class="q-mb-md">
          <q-banner type="warning">현재 정보가 없습니다.</q-banner>
        </div>

        <div v-else>
          <h5>경기장 정보</h5>
          <q-table
            :rows="venueArray"
            :columns="columns"
            row-key="venue_cd"
            flat
          >
            <template v-slot:body-cell-actions="props">
              <q-td align="center">
                <q-btn
                  @click="handleUpdate(props.row)"
                  flat
                  label="수정"
                  class="q-mr-sm"
                  :disable="
                    updateInputMode || deleteConfirmMode || insertInputMode
                  "
                />
                <q-btn
                  @click="handleDelete(props.row)"
                  flat
                  color="negative"
                  label="삭제"
                  :disable="
                    updateInputMode || deleteConfirmMode || insertInputMode
                  "
                />
              </q-td>
            </template>
          </q-table>
        </div>

        <q-btn
          v-if="!(updateInputMode || deleteConfirmMode || insertInputMode)"
          @click="handleInsert"
          label="신규 경기장 추가"
          class="q-mt-md"
          color="primary"
        />
      </q-card-section>
    </q-card>
    <q-card>
      <q-banner v-if="guideMessage" type="info" class="q-mt-md">{{
        guideMessage
      }}</q-banner>
    </q-card>
    <div
      v-if="insertInputMode || updateInputMode || deleteConfirmMode"
      class="q-pa-md"
    >
      <q-form @submit.prevent="handleSubmit">
        <q-input
          v-model="venueData.venueCd"
          label="경기장 코드"
          :disable="updateInputMode || deleteConfirmMode"
          maxlength="3"
          class="q-mb-md"
        />
        <q-input
          v-model="venueData.venueName"
          label="경기장 이름"
          :disable="deleteConfirmMode"
          class="q-mb-md"
        />
        <q-input
          v-model="venueData.venuePlaceInfo"
          label="경기장 위치 정보"
          :disable="deleteConfirmMode"
          class="q-mb-md"
        />
        <q-input
          v-model="venueData.venueGeneralInfo"
          label="경기장 일반 정보"
          :disable="deleteConfirmMode"
          class="q-mb-md"
        />
        <q-btn type="submit" label="확인" color="primary" class="q-mt-md" />
        <q-btn
          @click="handleSubmitCancel"
          label="취소"
          color="negative"
          class="q-mt-md"
        />
      </q-form>
    </div>

    <q-banner v-if="message" type="info" class="q-mt-md">{{
      message
    }}</q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { url, API } from "../utils/messagesAPIs";

const venueArray = ref([]);
const venueData = ref({
  venueCd: "",
  venueName: "",
  venuePlaceInfo: "",
  venueGeneralInfo: "",
});
const columns = [
  { name: "venue_cd", label: "경기장 코드", field: "venue_cd" },
  { name: "venue_name", label: "경기장 명", field: "venue_name" },
  {
    name: "venue_place_info",
    label: "위치 정보",
    field: "venue_place_info",
  },
  {
    name: "venue_general_info",
    label: "일반 정보",
    field: "venue_general_info",
  },
  { name: "actions", label: "변경", align: "center" },
];
const sessionTelno = ref("");
const sessionUserType = ref("");
const insertInputMode = ref(false);
const updateInputMode = ref(false);
const deleteConfirmMode = ref(false);
const message = ref("");
const router = useRouter();

const guideMessage = computed(() => {
  if (insertInputMode.value) return "정보 입력 후 확인버튼을 클릭하세요.";
  if (updateInputMode.value)
    return "경기 정보를 수정한 후 확인버튼을 클릭하세요.";
  if (deleteConfirmMode.value)
    return "삭제할 정보가 맞으면 확인버튼을 클릭하세요.";
  return "";
});

const fetchVenues = async () => {
  try {
    const response = await axios.get(API.GET_ALL_VENUES);
    if (response.status === 200) {
      console.log(venueArray.value);
      venueArray.value = response.data;
    }
  } catch (error) {
    handleError(error);
  }
};

const handleSubmit = async () => {
  const requestData = {
    ...venueData.value,
  };
  if (!deleteConfirmMode.value && !validateInput()) return;

  let response;
  try {
    if (insertInputMode.value) {
      response = await axios.post(API.ADD_VENUE, venueData.value);
    } else if (updateInputMode.value) {
      response = await axios.post(API.UPDATE_VENUE, venueData.value);
    } else if (deleteConfirmMode.value) {
      response = await axios.post(API.DELETE_VENUE, requestData);
    }
    if (response.status === 200) {
      alert(response.data.message);
      message.value = response.data.message;
      fetchVenues();
      resetState();
    }
  } catch (error) {
    handleError(error);
  }
};

const handleSubmitCancel = () => {
  resetState();
  message.value = "작업이 취소되었습니다.";
};

const handleInsert = () => {
  resetForm();
  resetState();
  resetMessage();
  insertInputMode.value = true;
};

const handleUpdate = (props) => {
  setNewVenueData(props);
  resetState();
  resetMessage();
  updateInputMode.value = true;
};

const handleDelete = (props) => {
  setNewVenueData(props);
  resetState();
  resetMessage();
  deleteConfirmMode.value = true;
};

const fetchSessionUserId = async () => {
  try {
    const response = await axios.get(API.GET_SESSION_USERID, {
      withCredentials: true,
    });
    if (response.status == "200") {
      sessionTelno.value = response.data.telno;
      sessionUserType.value = response.data.userType;
    }
  } catch (error) {
    alert("로그인이 필요합니다.");
    router.push(url.adminLogin);
  }
};

const handleError = (error) => {
  if (error.response) {
    message.value = error.response.data;
  } else if (error.request) {
    message.value = messageCommon.ERR_NETWORK;
  } else {
    message.value = messageCommon.ERR_ETC;
  }
};

const setNewVenueData = (venue) => {
  venueData.value = {
    venueCd: venue.venue_cd,
    venueName: venue.venue_name,
    venuePlaceInfo: venue.venue_place_info,
    venueGeneralInfo: venue.venue_general_info,
  };
};

const validateInput = () => {
  const { venueCd, venueName, venuePlaceInfo, venueGeneralInfo } =
    venueData.value;

  if (!venueName) {
    alert("경기장명을 입력해 주세요.");
    return false;
  }
  return true;
};

const resetState = () => {
  insertInputMode.value = false;
  updateInputMode.value = false;
  deleteConfirmMode.value = false;
};

const resetForm = () => {
  venueData.value = {
    venueCd: "",
    venueName: "",
    venuePlaceInfo: "",
    venueGeneralInfo: "",
  };
};

const resetMessage = () => {
  message.value = "";
};

onMounted(async () => {
  await fetchSessionUserId();
  await fetchVenues();
});
</script>

<style scoped>
.q-page {
  max-width: 800px;
  margin: 0 auto;
}
.message-box {
  color: #f44336;
  font-weight: bold;
}
.buttons-containers {
  display: flex;
  justify-content: space-between;
}
</style>
