export const formatTimeToLocal = (sqlDatetime) => {
  if (!sqlDatetime) {
    return "";
  }
  const date = new Date(sqlDatetime);

  // "ko-KR" 로컬 시간대와 12시간 형식을 사용하여 오전/오후로 표시
  const localTime = date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // 12시간 형식 사용
  });

  return localTime;
};
