// sessionStorage에서 선택한 항목만 가져오는 메인 함수
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
    console.log(`local session retrieved ----- Key: ${key}, Value: ${value}`);

    result[item] = value;
  });

  return result;
};
