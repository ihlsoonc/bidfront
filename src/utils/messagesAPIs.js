import { reactive } from 'vue';

// 관리자 유형 객체
export const ADMIN_TYPES = {
  H: '총괄관리자',
  A: '대회승인자',
  B: '대회운영자',
  C: '보조운영자',
  U: '일반사용자'
};

// 공통 메시지 객체
export const messageCommon = {
  ERR_NETWORK: '서버와의 연결에 문제가 있습니다. 네트워크 상태를 확인해 주세요.',
  ERR_ETC: '오류가 발생하였습니다. 문제가 계속되면 고객 지원에 문의하세요.',
  ERR_SERVER_DEFAULT: '서버에서 오류가 발생했습니다.',
};


// URL 객체
export const url = reactive({
  adminlogin: `/admin/adminlogin`,
  adminlogout: `/admin/adminlogout`,
  changeadminpassword :`/admin/changeadminpassword`,
  updateadmin :`/admin/updateadmin`,
  registeradmin :`/admin/registeradmin`,
  selectvenueadmin:`/admin/selectvenueadmin`,
  approvematch:`/admin/approvematch`,
  managevenue:`/admin/managevenue`,
  managematch:`/admin/managematch`,
  updateseatprice:`/admin/updateseatprice`,
  selectmatch:`/admin/selectmatch`,
  bidresults: `/admin/bidresults`,

  userhome :`/userhome`,
  userlogin: `/userlogin`,
  userlogout: `/userlogout`,
  changeuserpassword :`/changeuserpassword`,
  registeruser :`/registeruser`,
  updateuser :`/updateuser`,
  selectvenue :`/selectvenue`,
  selectmatchuser: `/selectmatchuser`,
  bid: `/bidseats`,
});

// API 경로 객체
export const API = reactive({
  RESTORE_SESSION:          'http://localhost:5000/api/session/restore',
  GET_SESSION_USERID:       'http://localhost:5000/api/session/getuserid',
  USER_LOGOUT:              'http://localhost:5000/api/session/clear',
  SEND_ONE_SMS:              'http://localhost:5000/api/sendsms/sendauthcode',
  VERIFY_CODE:              'http://localhost:5000/api/sendsms/verify-code',


  USER_LOGIN:               'http://localhost:5000/api/user/login',
  REGISTER_USER:            'http://localhost:5000/api/user/register',
  UPDATE_USER:              'http://localhost:5000/api/user/update',
  GET_USER_INFO:            'http://localhost:5000/api/user/getinfobyquery',
  CHANGE_USER_PASSWORD:     'http://localhost:5000/api/user/change-password',
  FIND_USERID:              'http://localhost:5000/api/user/find-id',


  GET_SEATPRICE:            'http://localhost:5000/api/seatprice/getbyid',
  UPDATE_SEATPRICE:         'http://localhost:5000/api/seatprice/update',
  UPDATE_SEATPRICEARRAY:    'http://localhost:5000/api/seatprice/updatearray',
  DELETE_SEATPRICEARRAY:    'http://localhost:5000/api/seatprice/deletearray',

  GET_BIDS_BY_SEATARRAY:        'http://localhost:5000/api/bid/getbyseatarray',
  GET_MY_BIDS:              'http://localhost:5000/api/bid/getmybids',
  GET_MY_LASTBIDS:          'http://localhost:5000/api/bid/getmylastbids',
  GET_ALL_BIDS:          'http://localhost:5000/api/bid/getallbids',
  SUBMIT_BID:               'http://localhost:5000/api/bid/submit',
  AWARD_BID:                'http://localhost:5000/api/bid/award',
  INIT_BID:                 'http://localhost:5000/api/bid/initialize',

  GET_BIDSTATUS:            'http://localhost:5000/api/match/status',
  GET_MATCHBYID:            'http://localhost:5000/api/match/getbyid',
  GET_ALLMATCHES:           'http://localhost:5000/api/match/getall',
  GET_ALL_APPROVED_MATCHES: 'http://localhost:5000/api/match/getallapproved',
  ADD_MATCH:                'http://localhost:5000/api/match/add',
  UPDATE_MATCH:             'http://localhost:5000/api/match/update',
  APPROVE_MATCH:            'http://localhost:5000/api/match/approve',
  DELETE_MATCH:             'http://localhost:5000/api/match/delete',
  
  UPLOAD_MATCHINFO:         'http://localhost:5000/api/files/upload',
  DOWNLOAD_MATCHINFO:       'http://localhost:5000/api/files/download',

  GET_VENUEBYCODE:          'http://localhost:5000/api/vunue/getbycode',
  GET_ALL_VENUES:           'http://localhost:5000/api/venue/getall',
  ADD_VENUE:                'http://localhost:5000/api/venue/add',
  UPDATE_VENUE:             'http://localhost:5000/api/venue/update',
  DELETE_VENUE:             'http://localhost:5000/api/venue/delete',

  PG_START:                 'http://localhost:5000/api/pgstart',
});
