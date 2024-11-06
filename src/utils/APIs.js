import { reactive } from "vue";

// API 경로 객체
export const APIs = reactive({
  RESTORE_SESSION: "http://localhost:5000/api/session/restore-session",
  GET_SESSION_USER: "http://localhost:5000/api/session/get-session-user",
  USER_LOGOUT: "http://localhost:5000/api/session/clear",
  SEND_ONE_SMS: "http://localhost:5000/api/sendsms/sendauthcode", // 전화로 인증번호 전송
  VERIFY_CODE: "http://localhost:5000/api/sendsms/verify-code", // 인증번호 verify
  SEND_KAKAO_ALIMTALK: "http://localhost:5000/api/sendkakao/send-kakao-message",

  USER_LOGIN: "http://localhost:5000/api/user/login",
  REGISTER_USER: "http://localhost:5000/api/user/register",
  UPDATE_USER: "http://localhost:5000/api/user/update",
  GET_USER_INFO: "http://localhost:5000/api/user/getinfo-byquery",
  GET_USER_BY_TELNO: "http://localhost:5000/api/user/getuser-bytelno",
  CHANGE_USER_PASSWORD: "http://localhost:5000/api/user/change-password",
  FIND_USERID: "http://localhost:5000/api/user/find-id",

  GET_SEATPRICE: "http://localhost:5000/api/seatprice/getbyid",
  UPDATE_SEATPRICE: "http://localhost:5000/api/seatprice/update",
  UPDATE_SEATPRICEARRAY: "http://localhost:5000/api/seatprice/updatearray",
  DELETE_SEATPRICEARRAY: "http://localhost:5000/api/seatprice/deletearray",

  GET_BIDS_BY_SEATARRAY: "http://localhost:5000/api/bid/getbyseatarray",
  GET_MY_BIDS: "http://localhost:5000/api/bid/getmybids",
  GET_MY_LASTBIDS: "http://localhost:5000/api/bid/getmylastbids",
  GET_ALL_BIDS: "http://localhost:5000/api/bid/getallbids",
  SUBMIT_BID: "http://localhost:5000/api/bid/submit",
  AWARD_BID: "http://localhost:5000/api/bid/award",
  INIT_BID: "http://localhost:5000/api/bid/initialize",

  GET_BIDSTATUS: "http://localhost:5000/api/match/status",
  GET_MATCHBYID: "http://localhost:5000/api/match/getbyid",
  GET_ALLMATCHES: "http://localhost:5000/api/match/getall",
  GET_MYMATCHES: "http://localhost:5000/api/match/getmy",
  GET_ALL_APPROVED_MATCHES: "http://localhost:5000/api/match/getallapproved",
  ADD_MATCH: "http://localhost:5000/api/match/add",
  UPDATE_MATCH: "http://localhost:5000/api/match/update",
  APPROVE_MATCH: "http://localhost:5000/api/match/approve",
  DELETE_MATCH: "http://localhost:5000/api/match/delete",

  UPLOAD_MATCHINFO: "http://localhost:5000/api/files/upload",
  DOWNLOAD_MATCHINFO: "http://localhost:5000/api/files/download",

  GET_VENUEBYCODE: "http://localhost:5000/api/vunue/getbycode",
  GET_ALL_VENUES: "http://localhost:5000/api/venue/getall",
  ADD_VENUE: "http://localhost:5000/api/venue/add",
  UPDATE_VENUE: "http://localhost:5000/api/venue/update",
  DELETE_VENUE: "http://localhost:5000/api/venue/delete",

  PG_START: "http://localhost:5000/api/pgstart",
  PG_START_MOBILE: "http://localhost:5000/api/pgstart-mobile",
});
