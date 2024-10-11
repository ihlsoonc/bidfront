const routes = [
  {
    path: '/',
    component: () => import('components/UserHome.vue'),
    children: [
      { path: '', component: () => import('components/UserHome.vue') },
      { path: 'userlogin', component: () => import('components/UserLogin.vue') },
      { path: 'changeuserpassword', component: () => import('components/ChangeUserPassword.vue') },
      { path: 'registeruser', component: () => import('components/RegisterUser.vue') },
      { path: 'updateuser', component: () => import('components/UpdateUser.vue') },
      { path: 'userlogout', component: () => import('components/UserLogout.vue') },
      { path: 'selectvenue', component: () => import('components/SelectVenue.vue')},
      { path: 'bidseats', component: () => import('components/BidSeats.vue') },
      { path: 'selectmatchuser', component: () => import('components/SelectMatch.vue') },
      { path: 'register', component: () => import('components/RegisterUser.vue') }
    ]
  },
  {
    path: '/admin',
    component: () => import('components/AdminHome.vue'),  // 관리자 기본 레이아웃
    children: [
      { path: '', component: () => import('components/AdminHome.vue') },  // 관리자 대시보드
      { path: 'adminlogin', name: 'AdminLogin', component: () => import('components/UserLogin.vue') },  // 관리자 로그인
      { path: 'adminlogout', name: 'AdminLogout', component: () => import('components/UserLogout.vue') },  // 관리자 로그아웃
      { path: 'registeradmin', name: 'RegisterAdmin', component: () => import('components/RegisterUser.vue') },  // 관리자 등록
      { path: 'updateadmin', name: 'UpdateAdmin', component: () => import('components/UpdateUser.vue') },  // 관리자 정보 수정
      { path: 'changeadminpassword', name: 'ChangeAdminPassword', component: () => import('components/ChangeUserPassword.vue') },  // 관리자 비밀번호 변경
      { path: 'selectvenueadmin', name: 'SelectVenueAdmin', component: () => import('components/SelectVenue.vue') },  // 경기장 선택
      { path: 'selectmatch', name: 'SelectMatch', component: () => import('components/SelectMatch.vue') },  // 경기 선택
      { path: 'bidresults', name: 'BidResults', component: () => import('components/BidResults.vue') },  // 입찰 결과
      { path: 'managematch', name: 'ManageMatch', component: () => import('components/ManageMatch.vue') },  // 경기 관리
      { path: 'approvematch', name: 'ApproveMatch', component: () => import('components/ApproveMatch.vue') },  // 경기 승인
      { path: 'managevenue', name: 'ManageVenue', component: () => import('components/ManageVenue.vue') },  // 경기장 관리
      { path: 'updateseatprice', name: 'UpdateSeatPrice', component: () => import('components/UpdateSeatPrice.vue') }  // 좌석 가격 수정
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes;
