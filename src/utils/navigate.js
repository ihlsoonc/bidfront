import { url } from "./urls";

export const navigate = (router, userClass, action, query = null) => {
  console.log("navigate 호출:", {
    router,
    userClass,
    action,
    query,
  });

  const urlTogo = url[action]?.[userClass];
  urlTogo
    ? router
        .push({ name: urlTogo, ...(query && { query }) })
        .catch((err) =>
          console.error("라우팅 에러:", urlTogo, query, err.message || err)
        )
    : console.warn("유효하지 않은 url입니다.------------ :", urlTogo);
};
