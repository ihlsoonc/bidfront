import axios from "axios";
import { APIs } from "../utils/APIs";

export const fetchSessionUser = async (userClass) => {
  // console.log("fetchSessionUser 호출됨:", { userClass });

  try {
    const response = await axios.get(APIs.GET_SESSION_USER, {
      withCredentials: true,
    });

    console.log("fetchSessionUser API 응답:", response.data);

    // API 응답의 userClass와 파라미터로 받은 userClass 비교
    if (response.data.userClass !== userClass) {
      console.warn("userClass 불일치:", {
        expected: userClass,
        actual: response.data.userClass,
      });
      return {
        success: false,
        errorMessage: "세션이 종료되었습니다. 다시 로그인 해주세요.",
      };
    }

    // 필요한 세션 정보를 객체로 반환
    return {
      success: true,
      telno: response.data.telno,
      userName: response.data.userName,
      userType: response.data.userType,
      userClass: response.data.userClass,
    };
  } catch (error) {
    console.log("세션이 종료되었습니다.:", error.message || error);

    // 오류 발생 시 실패 상태로 반환
    return {
      success: false,
      errorMessage: "로그인 해주세요.",
      userClass: userClass,
    };
  }
};
