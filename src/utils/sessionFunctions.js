/**
 * Session Context 관련 유틸리티 함수
 * - 브라우저의 `localStorage`를 사용하여 사용자 세션 데이터를 관리
 */

// Session Context 저장 함수
export const saveSessionContext = (context) => {
  const contextKey = "sessionContext"; // 고정된 키로 저장
  localStorage.setItem(contextKey, context);

  // 로그 출력
  console.log(`==  context 세팅 : Key = ${contextKey}, Value = ${context}`);
};

// Session Context 가져오기 함수
export const getSessionContext = () => {
  const contextKey = "sessionContext"; // 고정된 키로 조회
  const context = localStorage.getItem(contextKey) || null;

  // 로그 출력
  // console.log(`== Context 조회: Key = ${contextKey}, Value = ${context}`);

  return context;
};

// 데이터를 session에 저장하는 함수
export const saveSessionData = (context, data) => {
  Object.entries(data).forEach(([key, value]) => {
    const sessionKey = `${context}_${key}`;
    localStorage.setItem(sessionKey, value);

    // 로그 출력
    // console.log(`Save Data Set: Key = ${sessionKey}, Value = ${value}`);
  });
};

// 특정 데이터를 session에서 가져오는 함수
export const fetchSessionData = (context, keys) => {
  const result = {};

  keys.forEach((key) => {
    const sessionKey = `${context}_${key}`;
    const value = localStorage.getItem(sessionKey) || null;

    if (value === null) {
      // 값이 없는 경우 콘솔 로그 출력
      console.log(
        `---fetchSessionData 데이터가 없습니다.: Key = ${sessionKey}`
      );
    } else {
      // 값이 있는 경우 로그 출력
      // console.log(`session Key = ${sessionKey}, Value = ${value}`);
    }

    result[key] = value;
  });

  return result;
};

// 특정 데이터를 session에서 삭제하는 함수
export const removeSessionData = (context, keys) => {
  keys.forEach((key) => {
    const sessionKey = `${context}_${key}`;
    if (localStorage.getItem(sessionKey)) {
      localStorage.removeItem(sessionKey);

      // 로그 출력
      console.log(`removeSessionData Session Data 삭제: Key = ${sessionKey}`);
    } else {
      console.log(
        `removeSessionData Session Data 가 없습니다.: Key = ${sessionKey}`
      );
    }
  });
};

// 특정 context에 해당하는 모든 데이터를 삭제하는 함수
export const clearSessionByContext = (context) => {
  console.log("clearSessionByContext 함수 호출됨");
  console.log(`전달된 context: ${context}`);

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(context)) {
      localStorage.removeItem(key);
      console.log(`clearSessionByContext 삭제되었습니다. : Key = ${key}`);
    }
  });
};
