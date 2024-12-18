/**
 * URL 매핑 객체
 * - 각 사용자 컨텍스트(user, admin, adminm)에 따라 특정 동작(action)의 라우팅 이름을 정의
 * - Vue Router의 `router.push`에 사용될 경로 이름을 관리
 */

import { reactive } from "vue";

export const url = reactive({
  home: {
    user: `userHome`,
    admin: `adminHome`,
    adminm: `adminMHome`,
  },

  login: {
    user: `userLogin`,
    admin: `adminLogin`,
    adminm: `adminMLogin`,
  },

  logout: {
    user: `userLogout`,
    admin: `adminLogout`,
    adminm: `adminMLogout`,
  },

  password: {
    user: `changeUserPassword`,
    admin: `changeAdminPassword`,
    adminm: `changeAdminMPassword`,
  },

  register: {
    user: `registerUser`,
    admin: `registerAdmin`,
    adminm: `registerAdminM`,
  },

  selectVenue: {
    user: `selectVenueUser`,
    admin: `selectVenueAdmin`,
    adminm: `selectVenueAdminM`,
  },

  reserveMatch: {
    adminm: `reserveMatch`,
    admin: `reserveMatchAdmin`,
  },

  registerMatch: {
    adminm: `registerMatch`,
    admin: `registerMatch`,
  },

  updateMatch: {
    adminm: `updateMatch`,
  },

  selectMatch: {
    user: `selectMatchUser`,
    admin: `selectMatchAdmin`,
    adminm: `selectMatchAdminM`,
  },

  updateUser: {
    user: `updateUser`,
    admin: `updateAdmin`,
    adminm: `updateAdminM`,
  },

  approveMatch: {
    admin: `approveMatchAdmin`,
  },

  manageVenue: {
    admin: `manageVenueAdmin`,
  },

  updateSeatPrice: {
    admin: `updateSeatPriceAdmin`,
  },

  bids: {
    user: `bidSeats`,
    admin: `bidResultsAdmin`,
  },
});
