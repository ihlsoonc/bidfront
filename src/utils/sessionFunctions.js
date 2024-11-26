// import axios from "axios";
// import { APIs } from "./APIs";

// export const fetchSessionUser = async (userClass) => {
//   try {
//     const response = await axiosInstance.get(APIs.GET_SESSION_USER, {
//       headers: {
//         Authorization: `Bearer ${token}`, // 토큰을 헤더에 추가
//       },
//       withCredentials: true,
//     });

//     console.log("fetchSessionUser API 응답:", response.data);

//     // API 응답의 userClass와 파라미터로 받은 userClass 비교
//     if (response.data.userClass !== userClass) {
//       console.warn("userClass 불일치:", {
//         expected: userClass,
//         actual: response.data.userClass,
//       });
//       return {
//         success: false,
//         errorMessage: "세션이 종료되었습니다. 다시 로그인 해주세요.",
//       };
//     }

//     // 필요한 세션 정보를 객체로 반환
//     return {
//       success: true,
//       telno: response.data.telno,
//       userName: response.data.userName,
//       role: response.data.role,
//       userClass: response.data.userClass,
//     };
//   } catch (error) {
//     console.log("세션이 종료되었습니다.:", error.message || error);

//     // 오류 발생 시 실패 상태로 반환
//     return {
//       success: false,
//       errorMessage: "로그인 해주세요.",
//       userClass: userClass,
//     };
//   }
// };

export const setLocalSession = (uniqueContext, data) => {
  Object.keys(data).forEach((key) => {
    sessionStorage.setItem(`${uniqueContext}_${key}`, data[key]);
  });
};

export const fetchLocalSession = (items = []) => {
  const parts = window.location.pathname.split("/");
  let uniqueContext;

  // URL 경로 조건에 따라 uniqueContext 설정
  if (parts.length >= 3 && parts[2]) {
    uniqueContext = parts[1]; // 두 번째 요소 추출
  } else {
    uniqueContext = "user"; // 기본값 설정
  }

  // 결과 객체에 각 항목을 동적으로 추가
  const result = {};
  items.forEach((item) => {
    // sessionStorage에서 값을 가져오며, 없으면 null로 설정
    const key = `${uniqueContext}_${item}`;
    const value = sessionStorage.getItem(key) || null;

    // 각 항목에 대한 키와 값을 출력
    // console.log(`local session retrieved ----- Key: ${key}, Value: ${value}`);

    result[item] = value;
  });

  return result;
};
