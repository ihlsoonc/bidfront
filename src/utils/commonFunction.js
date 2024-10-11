
export const getSportName = (code) => {
  const sports = {
    '01': '야구',
    '02': '축구',
    '03': '수영',
    '04': '탁구',
    '05': '하키',
    '06': '체조',
    '07': '배드민턴',
    '08': '수구',
  };
  return sports[code] || ' ';
};



export const formatTimeToLocal= (sqlDatetime) =>{
  if (!sqlDatetime) {
    return '';
  }
  const date = new Date(sqlDatetime);

  // "ko-KR" 로컬 시간대와 12시간 형식을 사용하여 오전/오후로 표시
  const localTime = date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, // 12시간 형식 사용
  });

  return localTime;
}
