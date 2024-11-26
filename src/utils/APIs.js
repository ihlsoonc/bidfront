import { reactive } from "vue";

// 공통 base URL
const BASE_URL = "http://localhost:5000";

// API 경로 객체
export const APIs = reactive({
  SEND_ONE_SMS: `${BASE_URL}/api/sendsms/send-auth-code`, // 전화로 인증번호 전송
  VERIFY_CODE: `${BASE_URL}/api/sendsms/verify-code`, // 인증번호 verify
  SEND_KAKAO_ALIMTALK: `${BASE_URL}/api/sendkakao/send-kakao-message`, //낙찰내용과 결제시한을 알림톡으로 전송

  LOGIN: `${BASE_URL}/login`,
  LOGOUT: `${BASE_URL}/logout`,
  REISSUE_ACCESS_TOKEN: `${BASE_URL}/reissue-access-token`,
  REGISTER_USER: `${BASE_URL}/register`,

  UPDATE_USER: `${BASE_URL}/api/user/update`,
  GET_USER_INFO: `${BASE_URL}/api/user/getinfo-byquery`,
  GET_USER_WITH_PASSWORD: `${BASE_URL}/api/user/getinfo-byquery-and-password`,
  CHANGE_USER_PASSWORD: `${BASE_URL}/api/user/change-password`,
  GET_EMAIL_COUNT: `${BASE_URL}/api/user/get-email-count`,
  GET_TELNO_COUNT: `${BASE_URL}/api/user/get-telno-count`,

  GET_SEATPRICE: `${BASE_URL}/api/seatprice/getbyid`,
  UPDATE_SEATPRICE: `${BASE_URL}/api/seatprice/update`,
  UPDATE_SEATPRICEARRAY: `${BASE_URL}/api/seatprice/updatearray`,
  DELETE_SEATPRICEARRAY: `${BASE_URL}/api/seatprice/deletearray`,

  GET_BIDS_BY_SEATARRAY: `${BASE_URL}/api/bid/get-by-seatarray`,
  GET_MY_BIDS: `${BASE_URL}/api/bid/get-mybids`,
  GET_MY_LASTBIDS: `${BASE_URL}/api/bid/get-mylastbids`,
  GET_BID_TALLIES: `${BASE_URL}/api/bid/get-bid-tallies`,
  GET_ALL_BIDS: `${BASE_URL}/api/bid/get-all-bids`,
  GET_HIGHEST_BIDS: `${BASE_URL}/api/bid/get-highest-bids`,
  SUBMIT_BID: `${BASE_URL}/api/bid/submit`,
  AWARD_BID: `${BASE_URL}/api/bid/award`,

  GET_BID_STATUS: `${BASE_URL}/api/match/status`,
  GET_ALL_MATCHES: `${BASE_URL}/api/match/getall`,
  GET_MY_MATCHES: `${BASE_URL}/api/match/getmy`,
  GET_ALL_APPROVED_MATCHES: `${BASE_URL}/api/match/getallapproved`,
  ADD_MATCH: `${BASE_URL}/api/match/add`,
  UPDATE_MATCH: `${BASE_URL}/api/match/update`,
  APPROVE_MATCH: `${BASE_URL}/api/match/approve`,
  DELETE_MATCH: `${BASE_URL}/api/match/delete`,

  UPLOAD_MATCHINFO: `${BASE_URL}/api/files/upload`,
  DOWNLOAD_MATCHINFO: `${BASE_URL}/api/files/download`,

  GET_ALL_VENUES: `${BASE_URL}/api/venue/getall`,
  ADD_VENUE: `${BASE_URL}/api/venue/add`,
  UPDATE_VENUE: `${BASE_URL}/api/venue/update`,
  DELETE_VENUE: `${BASE_URL}/api/venue/delete`,

  PG_START: `${BASE_URL}/api/pgstart`,
  PG_START_MOBILE: `${BASE_URL}/api/pgstart-mobile`,

  // USER_LOGIN: `${BASE_URL}/api/user/login`,
  // REGISTER_USER: `${BASE_URL}/api/user/register`,
  // RESTORE_SESSION: `${BASE_URL}/api/session/restore-session`,
  // GET_SESSION_USER: `${BASE_URL}/api/session/get-session-user`,
  // USER_LOGOUT: `${BASE_URL}/api/session/clear`,
});
