import { url } from "./urls";

export const handleLink = (router, userClass, action, query = null) => {
  // 파라미터 값 출력
  // console.log("handleLink 호출:", {
  //   router,
  //   userClass,
  //   action,
  //   query,
  // });

  const urlTogo = url[action]?.[userClass];
  urlTogo
    ? router
        .push({ name: urlTogo, ...(query && { query }) })
        .catch((err) =>
          console.error("라우팅 에러:", urlTogo, query, err.message || err)
        )
    : console.warn("유효하지 않은 url입니다.------------ :", urlTogo);
};
