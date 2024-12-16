/**
 * navigate
 * - 사용자 동작(action)과 사용자 컨텍스트(userContext)에 따라 URL을 결정하고 해당 URL로 라우팅
 * - URL이 유효하지 않거나 에러 발생 시 경고 또는 에러를 로깅
 *
 * @param {string} userContext - 사용자 컨텍스트 (예: "user", "admin", "adminM")
 * @param {string} action - 수행하려는 동작 (예: "login", "logout", "navigateToDashboard")
 * @param {Object} [query=null] - 라우팅 시 전달할 쿼리 매개변수
 */

import { url } from "./urls";
export const navigate = (router, userContext, action, query = null) => {
  const urlTogo = url[action]?.[userContext];
  // alert(urlTogo);
  if (urlTogo) {
    router.push({ name: urlTogo, ...(query && { query }) }).catch((err) =>
      console.error("라우팅 에러:", {
        urlTogo,
        query,
        error: err.message || err,
      })
    ); // 에러 발생 시 로깅
  } else {
    console.warn("유효하지 않은 URL입니다:", urlTogo); // 유효하지 않은 URL 경고
  }
};
