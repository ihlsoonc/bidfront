<template>
  <div class="common-container">
    <q-card v-if="!venueArray || venueArray.length === 0">
      <br />
      <br />
      <br />
      <q-banner>현재 경기장 정보가 없습니다.</q-banner>
      <br />
      <br />
      <br />
    </q-card>

    <div
      v-if="venueArray && venueArray.length > 0"
      class="columnflex-container"
    >
      <h6>경기장을 선택하세요.</h6>
      <q-list>
        <q-item
          v-for="(venue, index) in venueArray"
          :key="venue.venue_cd"
          class="q-mb-md"
        >
          <q-card @click="handleSelectVenue(index)" class="full-width">
            <q-card-section>
              <div class="text-h6">{{ venue.venue_name }}</div>
            </q-card-section>
            <!-- q-img사용시 이미지가 안떠  img tag사용 -->
            <img
              :src="getImageUrl(venue.venue_img_file)"
              :alt="venue.venue_name"
              class="venue-image"
              @click="handleSelectVenue(index)"
              ratio="16/9"
            />
          </q-card>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import axiosInstance from "../utils/axiosInterceptor";
import { navigate } from "../utils/navigate";
import { setLocalSession, fetchLocalSession } from "../utils/sessionFunctions";
import { APIs } from "../utils/APIs";
import { messageCommon } from "../utils/messageCommon";

// 상태 및 라우터 정의
const router = useRouter();
const localSessionData = fetchLocalSession(["userClass"]);
const token = localStorage.getItem("authToken");
const venueArray = ref([]);
const selectedVenueCd = ref("");
const selectedVenueIndex = ref(null);
const message = ref("");
const emit = defineEmits(["update-status"]);

// 서버에서 경기장 데이터를 가져오는 함수
const fetchVenues = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_ALL_VENUES, {
      headers: {
        Authorization: `Bearer ${token}`, // 토큰을 헤더에 추가
      },
      withCredentials: true, // 쿠키 사용을 위한 설정
    });
    venueArray.value = response.data;
  } catch (error) {
    handleError(error);
  }
};

// 이미지 URL 생성 함수
const getImageUrl = (fileName) => {
  const url = new URL(`../assets/images/venues/${fileName}`, import.meta.url)
    .href;
  console.log(`FileName: ${fileName}, URL: ${url}`); // 파일 이름과 URL 출력
  return url;
};

// 경기장 선택 처리
const handleSelectVenue = (index) => {
  const venue = venueArray.value[index];
  selectedVenueCd.value = venue.venue_cd;
  setLocalSession(localSessionData.userClass, {
    venueCd: selectedVenueCd.value,
  });
  navigate(router, localSessionData.userClass, "selectMatch");
};

// 선택된 경기장 데이터
const selectedVenue = computed(() => {
  return selectedVenueIndex.value !== null
    ? venueArray.value[selectedVenueIndex.value]
    : null;
});

// 오류 처리 함수
const handleError = (error) => {
  message.value = error.response
    ? error.response.data
    : error.request
    ? messageCommon.ERR_NETWORK
    : messageCommon.ERR_ETC;
};

// 컴포넌트가 마운트될 때 실행
onMounted(async () => {
  fetchVenues();
});
</script>

<style scoped>
.venue-image {
  display: block;
  width: 100%;
  height: auto;
}

h6 {
  align-self: center;
}

button {
  padding: 8px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  background-color: white;
  border-radius: 5px;
}

button:hover {
  background-color: white;
  cursor: pointer;
}
</style>
