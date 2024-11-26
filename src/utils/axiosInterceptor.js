// axios 임포트
import axios from "axios";
import { useRouter } from "vue-router";
import { Notify } from "quasar"; // Quasar Notify 플러그인
const baseURL = "http://localhost:5000"; // 베이스 URL 설정

const router = useRouter();

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 1000, // 요청 타임아웃 설정
});

// 토큰 유효성 검사 함수
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // JWT payload 디코딩
    const currentTime = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
    return payload.exp < currentTime; // 만료 여부 반환
  } catch (error) {
    console.log("토큰 유효성을 검사할 수 없습니다.");
    return true; // 토큰 디코딩 실패 시 만료된 것으로 간주
  }
};

const decodePayload = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    console.error("토큰 디코딩 실패:", error);
    return null;
  }
};

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
  async function (config) {
    console.log("==================인터셉터 요청 URL:", config.url);

    const accessToken = localStorage.getItem("authToken"); // 로컬 스토리지에서 액세스 토큰 가져오기
    const refresh = localStorage.getItem("refresh"); // 로컬 스토리지에서 리프레시 토큰 가져오기

    if (!accessToken || accessToken.trim() === "") {
      console.log("interceptors : 로컬 스토리지 accessToken 이 null 입니다.");
      if (!refresh || refresh.trim() === "") {
        console.log("interceptors 로컬 스토리지 refreshToken 이 없습니다.");
      }
      return config;
    }

    // 토큰 유효성 검사
    if (isTokenExpired(accessToken)) {
      console.log(
        "interceptors access 토큰이 만료되었습니다. 새로운 토큰을 요청합니다."
      );

      try {
        // JWT의 payload 부분 추출
        const payload = decodePayload(accessToken);
        if (!payload) throw new Error("Payload 추출 실패");

        const { username, role } = payload;

        console.info(
          "interceptors payload : username : ",
          username,
          "  role : ",
          role
        );

        const noInterceptorAxios = axios.create(); // 인터셉터 없는 새 axios 인스턴스 생성
        const response = await noInterceptorAxios.post(
          `${baseURL}/reissue-access-token`, // 갱신 엔드포인트 URL
          { username, role, refresh }, // 요청 데이터
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // 기존 토큰을 헤더에 추가
            },
            withCredentials: true, // 쿠키 사용 설정
          }
        );

        const newAccessToken = response.headers["authorization"]?.replace(
          "Bearer ",
          ""
        );
        const newRefresh = response.data.refresh;

        if (newAccessToken && newRefresh) {
          localStorage.setItem("authToken", newAccessToken); // 새 액세스 토큰 저장
          localStorage.setItem("refresh", newRefresh); // 새 리프레시 토큰 저장
          console.log("새로운 액세스 및 리프레시 토큰 저장 완료");
        }
      } catch (error) {
        console.error("액세스 토큰 재발급 실패:", error);
        return Promise.reject(error);
      }
    }

    // 유효한 토큰이 있는 경우 Authorization 헤더 추가
    config.headers.Authorization = `Bearer ${localStorage.getItem(
      "authToken"
    )}`;

    console.log("interceptors 인터셉터 설정 완료 - 요청 전송 준비");
    return config;
  },
  function (error) {
    console.error("interceptors 요청 중 오류 발생:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  function (response) {
    // 응답 상태 코드가 200번대인 경우 그대로 반환
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    return Promise.reject(
      new Error(`Unexpected response status: ${response.status}`)
    );
  },
  function (error) {
    if (error.response) {
      const { status, data } = error.response; // 상태 코드와 응답 데이터를 가져옴
      let msg = "알 수 없는 오류가 발생했습니다."; // 기본 에러 메시지

      if (status === 400) {
        switch (data.error_code) {
          case "REFRESH_NULL":
            msg = "Refresh 토큰이 요청에 없습니다.";
            break;
          case "REFRESH_EXPIRED":
            msg = "Refresh 토큰이 만료되었습니다. 다시 로그인해주세요.";
            localStorage.removeItem("authToken"); // 토큰 제거
            router.push("/login");
            break;
          case "REFRESH_INVALID":
          case "REFRESH_NOT_IN_DB":
            msg = "Refresh 토큰이 유효하지 않습니다. 다시 로그인해주세요.";
            localStorage.removeItem("authToken"); // 토큰 제거
            router.push("/login");
            break;
          default:
            msg = data.message || "요청 처리 중 문제가 발생했습니다.";
        }
        Notify.create({ type: "negative", message: msg });
      } else if (status === 401) {
        switch (data.error_code) {
          case "TOKEN_EXPIRED":
          case "TOKEN_INVALID":
            msg = "세션이 만료되었습니다. 다시 로그인해주세요.";
            localStorage.removeItem("authToken");
            router.push("/login");
            break;
          default:
            msg =
              data.message || "인증되지 않은 요청입니다. 다시 로그인해주세요.";
            localStorage.removeItem("authToken");
            router.push("/login");
        }
        Notify.create({ type: "negative", message: msg });
      } else if (status === 403) {
        msg = "접근 권한이 없습니다. 관리자에게 문의하세요.";
        Notify.create({ type: "negative", message: msg });
      } else {
        msg = data.message || "알 수 없는 서버 오류가 발생했습니다.";
        Notify.create({ type: "negative", message: msg });
      }
      return Promise.reject(error); // 에러를 그대로 반환
    }

    Notify.create({
      type: "negative",
      message: "서버와 연결할 수 없습니다. 나중에 다시 시도해주세요.",
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
