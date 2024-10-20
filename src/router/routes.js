const routes = [
  // {
  //   path: "/",
  //   redirect: "/admin", // 루트 경로로 접근 시 /admin으로 리다이렉트
  // },
  {
    path: "/",
    component: () => import("components/UserHome.vue"),
    children: [
      {
        path: "userlogin",
        name: "userLogin",
        component: () => import("components/UserLogin.vue"),
      },
      {
        path: "changeuserpassword",
        name: "changeUserPassword",
        component: () => import("components/ChangeUserPassword.vue"),
      },
      {
        path: "registeruser",
        name: "registerUser",
        component: () => import("components/RegisterUser.vue"),
      },
      {
        path: "updateuser",
        name: "updateUser",
        component: () => import("components/UpdateUser.vue"),
      },
      {
        path: "userlogout",
        name: "userLogout",
        component: () => import("components/UserLogout.vue"),
      },
      {
        path: "selectvenue",
        name: "selectVenue",
        component: () => import("components/SelectVenue.vue"),
      },
      {
        path: "bidseats",
        name: "bidSeats",
        component: () => import("components/BidSeats.vue"),
      },
      {
        path: "selectmatchuser",
        name: "selectMatchUser",
        component: () => import("components/SelectMatch.vue"),
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("components/AdminHome.vue"), // 관리자 기본 레이아웃
    children: [
      {
        path: "adminlogin",
        name: "adminLogin",
        component: () => import("components/UserLogin.vue"),
      }, // 관리자 로그인
      {
        path: "adminlogout",
        name: "adminLogout",
        component: () => import("components/UserLogout.vue"),
      }, // 관리자 로그아웃
      {
        path: "registeradmin",
        name: "registerAdmin",
        component: () => import("components/RegisterUser.vue"),
      }, // 관리자 등록
      {
        path: "updateadmin",
        name: "updateAdmin",
        component: () => import("components/UpdateUser.vue"),
      }, // 관리자 정보 수정
      {
        path: "changeadminpassword",
        name: "changeAdminPassword",
        component: () => import("components/ChangeUserPassword.vue"),
      }, // 관리자 비밀번호 변경
      {
        path: "selectvenueadmin",
        name: "selectVenueAdmin",
        component: () => import("components/SelectVenue.vue"),
      }, // 경기장 선택
      {
        path: "selectmatchadmin",
        name: "selectMatchAdmin",
        component: () => import("components/SelectMatch.vue"),
      }, // 경기 선택
      {
        path: "bidresults",
        name: "bidResults",
        component: () => import("components/BidResults.vue"),
      }, // 입찰 결과
      {
        path: "managematch",
        name: "manageMatch",
        component: () => import("components/ManageMatch.vue"),
      }, // 경기 관리
      {
        path: "approvematch",
        name: "approveMatch",
        component: () => import("components/ApproveMatch.vue"),
      }, // 경기 승인
      {
        path: "managevenue",
        name: "ManageVenue",
        component: () => import("components/ManageVenue.vue"),
      }, // 경기장 관리
      {
        path: "updateseatprice",
        name: "updateSeatPrice",
        component: () => import("components/UpdateSeatPrice.vue"),
      }, // 좌석 가격 수정
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
