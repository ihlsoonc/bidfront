import { createApp } from "vue"; // Vue 애플리케이션 생성 함수
import App from "./App.vue"; // 애플리케이션의 루트 컴포넌트
import router from "./router"; // Vue Router 설정
import { Quasar, Dialog } from "quasar"; // Quasar UI 라이브러리 및 Notify 플러그인
import "quasar/src/css/index.sass"; // Quasar 기본 스타일시트
import "./assets/Common.css"; // 사용자 정의 CSS
import { AgGridVue } from "ag-grid-vue3"; // AG Grid Vue 3 컴포넌트
import "ag-grid-community/styles/ag-grid.css"; // AG Grid 기본 스타일
import "ag-grid-community/styles/ag-theme-alpine.css"; // AG Grid Alpine 테마 스타일

// Vue 애플리케이션 생성 및 설정
const app = createApp(App); // 애플리케이션 인스턴스 생성

// AG Grid를 전역으로 등록
app.component("AgGridVue", AgGridVue);

app.use(Quasar, {
  plugins: {
    Dialog,
  },
});

// Vue Router 추가
app.use(router);

// DOM의 #app 요소에 애플리케이션 마운트
app.mount("#app");
