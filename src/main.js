import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Quasar 임포트
import { Quasar, Notify } from "quasar";
import "quasar/src/css/index.sass"; // Quasar의 기본 스타일
import "./assets/Common.css"; // 사용자 정의 CSS

// Quasar 플러그인 및 설정
const quasarOptions = {
  plugins: {
    Notify,
  },
};

// 애플리케이션 인스턴스 생성 및 설정
createApp(App)
  .use(Quasar, quasarOptions) // Quasar 인스턴스에 옵션 추가
  .use(router) // Vue Router 사용
  .mount("#app"); // 애플리케이션 마운트
