<template>
  <div class="common-container">
    <div v-if="!venueArray || venueArray.length == 0">
      현재 정보가 없습니다.
    </div>
    <!-- 서버에서 데이터를 받아온 후 리스트로 보여주기 -->
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
          <q-card @click="selectVenue(index)" class="full-width">
            <q-card-section>
              <div class="text-h6">{{ venue.venue_name }}</div>
            </q-card-section>
            <q-img
              :src="getImageUrl(venue.venue_img_file)"
              :alt="venue.venue_name"
              class="venue-image"
              @click="selectVenue(index)"
              ratio="16/9"
            />
          </q-card>
        </q-item>
      </q-list>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { API, url, messageCommon } from "../utils/messagesAPIs";
import axios from "axios";

export default {
  setup() {
    const router = useRouter();
    const venueArray = ref([]);
    const selectedVenueCd = ref("");
    const selectedVenueIndex = ref(null);
    const tableName = ref("");
    const message = ref("");

    // 서버에서 데이터 가져오기
    const fetchVenues = async () => {
      try {
        const response = await axios.get(API.GET_ALL_VENUES); // 서버에서 경기장 데이터를 읽어옴
        venueArray.value = response.data;
      } catch (error) {
        handleError(error);
      }
    };
    const getImageUrl = (fileName) => {
      return new URL(`/images/venues/${fileName}`, import.meta.url).href;
    };

    // 경기장 선택 처리
    const selectVenue = (index) => {
      const venue = venueArray.value[index];
      selectedVenueCd.value = venue.venue_cd;
      sessionStorage.setItem("venueNumber", selectedVenueCd.value);
      if (tableName.value == "user") {
        router.push(url.selectMatchUser);
      } else {
        router.push(url.selectMatchAdmin);
      }
    };

    // 선택한 경기장 데이터 계산
    const selectedVenue = computed(() => {
      return selectedVenueIndex.value !== null
        ? venueArray.value[selectedVenueIndex.value]
        : null;
    });

    const handleError = (error) => {
      if (error.response) {
        message.value = error.response.data;
      } else if (error.request) {
        message.value = messageCommon.ERR_NETWORK;
      } else {
        message.value = messageCommon.ERR_ETC;
      }
    };
    // 페이지가 로드될 때 서버로부터 경기장 데이터를 받아옴
    onMounted(() => {
      const sessiontableName = sessionStorage.getItem("tableName");
      if (sessiontableName) {
        tableName.value = sessiontableName;
      }
      fetchVenues();
    });

    return {
      venueArray,
      getImageUrl,
      selectedVenueIndex,
      selectVenue,
      selectedVenue,
      message,
    };
  },
};
</script>

<style scoped>
.venue-image {
  max-width: 100%px;
  height: auto;
  margin-top: 2px;
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
  cursor: point;
}
</style>
