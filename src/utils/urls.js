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

  manageMatch: {
    admin: `manageMatchAdmin`,
    adminm: `manageMatchAdminM`,
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
    adminm: `manageMatchAdminM`,
  },
});
