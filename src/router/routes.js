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
        component: () => import("components/SelectMatchUser.vue"),
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
        component: () => import("src/components/SelectMatchAdmin.vue"),
      }, // 경기 선택
      {
        name: "bidResultsAdmin",
        path: "bidresultsadmin",
        component: () => import("components/BidResults.vue"),
      }, // 입찰 결과
      {
        name: "reserveMatchAdmin",
        path: "reservematchadmin",
        component: () => import("components/ReserveMatchAdmin.vue"),
      }, // 일괄 입찰 승인

      {
        name: "approveMatchAdmin",
        path: "approvematchadmin",
        component: () => import("src/components/ApproveMatchOld.vue"),
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
        component: () => import("src/components/SelectMatchAdmin.vue"),
      }, // 경기 선택
      {
        name: "registerMatch",
        path: "registermatch",
        component: () => import("components/RegisterMatch.vue"),
        props: (route) => ({
          key: route.fullPath, // fullPath를 key로 사용 (경기정보 수정화면에서 경기 등록버튼을 눌렀을때 Mount를 수행하기 위함 -화면 reset등 필요한 작업 수행행)
        }),
      }, // 경기 선택
      {
        name: "updateMatch",
        path: "updatematch",
        component: () => import("components/RegisterMatch.vue"),
      }, // 경기 관리
      {
        name: "reserveMatch",
        path: "reserveMatch",
        component: () => import("src/components/ReserveMatch.vue"),
      }, // 좌석 가격 수정
    ],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
