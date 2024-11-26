const routes = [
  //현재 context는 사용하지않음
  {
    path: "/",
    component: () => import("src/components/UserHome.vue"),
    props: { context: "user" },
    children: [
      {
        name: "userLogin",
        path: "userlogin",
        component: () => import("components/UserLogin.vue"),
        props: { context: "user" },
      },
      {
        name: "changeUserPassword",
        path: "changeuserpassword",
        component: () => import("components/ChangeUserPassword.vue"),
      },
      {
        name: "registerUser",
        path: "registeruser",
        component: () => import("components/RegisterUser.vue"),
      },
      {
        name: "updateUser",
        path: "updateuser",
        component: () => import("components/UpdateUser.vue"),
      },
      {
        name: "selectVenueUser",
        path: "selectvenueuser",
        component: () => import("components/SelectVenue.vue"),
      },
      {
        name: "bidSeats",
        path: "bidseats",
        component: () => import("components/BidSeats.vue"),
      },
      {
        name: "selectMatchUser",
        path: "selectmatchuser",
        component: () => import("components/SelectMatch.vue"),
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("components/AdminHome.vue"), // 관리자 기본 레이아웃
    props: { context: "admin" },
    children: [
      {
        name: "adminLogin",
        path: "adminlogin",
        component: () => import("components/UserLogin.vue"),
        props: { context: "admin" },
      }, // 관리자 로그인
      {
        name: "registerAdmin",
        path: "registeradmin",
        component: () => import("components/RegisterUser.vue"),
      }, // 관리자 등록
      {
        name: "updateAdmin",
        path: "updateadmin",
        component: () => import("components/UpdateUser.vue"),
      }, // 관리자 정보 수정
      {
        name: "changeAdminPassword",
        path: "changeadminpassword",
        component: () => import("components/ChangeUserPassword.vue"),
      }, // 관리자 비밀번호 변경
      {
        name: "selectVenueAdmin",
        path: "selectvenueadmin",
        component: () => import("components/SelectVenue.vue"),
      }, // 경기장 선택
      {
        name: "selectMatchAdmin",
        path: "selectmatchadmin",
        component: () => import("components/SelectMatch.vue"),
      }, // 경기 선택
      {
        name: "bidResultsAdmin",
        path: "bidresultsadmin",
        component: () => import("components/BidResults.vue"),
      }, // 입찰 결과
      {
        name: "manageMatchAdmin",
        path: "managematchadmin",
        component: () => import("components/ManageMatch.vue"),
      }, // 경기 관리
      {
        name: "approveMatchAdmin",
        path: "approvematchadmin",
        component: () => import("components/ApproveMatch.vue"),
      }, // 경기 승인
      {
        name: "manageVenueAdmin",
        path: "managevenueadmin",
        component: () => import("components/ManageVenue.vue"),
      }, // 경기장 관리
      {
        name: "updateSeatPriceAdmin",
        path: "updateseatpriceadmin",
        component: () => import("components/UpdateSeatPrice.vue"),
      }, // 좌석 가격 수정
    ],
  },
  {
    path: "/adminm",
    component: () => import("components/AdminMHome.vue"),
    props: { context: "adminm" },
    children: [
      {
        name: "adminMLogin",
        path: "adminmlogin",
        component: () => import("components/UserLogin.vue"),
        props: { context: "adminm" },
      }, // 관리자 로그인
      {
        name: "registerAdminM",
        path: "registeradminm",
        component: () => import("components/RegisterUser.vue"),
      }, // 관리자 등록
      {
        name: "updateAdminM",
        path: "updateadminm",
        component: () => import("components/UpdateUser.vue"),
      }, // 관리자 정보 수정
      {
        name: "changeAdminMPassword",
        path: "changeadminmpassword",
        component: () => import("components/ChangeUserPassword.vue"),
      }, // 관리자 비밀번호 변경
      {
        name: "selectVenueAdminM",
        path: "selectvenueadminm",
        component: () => import("components/SelectVenue.vue"),
      }, // 경기장 선택
      {
        name: "selectMatchAdminM",
        path: "selectmatchadminm",
        component: () => import("components/SelectMatch.vue"),
      }, // 경기 선택
      {
        name: "manageMatchAdminM",
        path: "managematchadminm",
        component: () => import("components/ManageMatch.vue"),
      }, // 경기 관리
    ],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
