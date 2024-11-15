import axios from "axios";
import { API, messageCommon } from "./messageCommon.js";

export const fetchSeatData = async (
  matchNumber,
  selectedSeats,
  setSelectedSeats,
  setMessage
) => {
  try {
    const seatNoArray =
      selectedSeats && Array.isArray(selectedSeats)
        ? selectedSeats.map((seat) => seat.seat_no)
        : [];
    if (seatNoArray.length > 0) {
      const response = await axios.post(API.GET_BIDS_BY_SEATARRAY, {
        seatNoArray,
        matchNumber,
      });
      const fetchedData = response.data;

      // fetchedSeatsData를 seat_no별로 매핑
      const fetchedDataMap = fetchedData.reduce((acc, data) => {
        acc[data.seat_no] = data;
        return acc;
      }, {});

      // selectedSeats의 각 좌석번호에 fetchedData를 업데이트
      const updatedSeatsWithData = selectedSeats.map((seat) => ({
        ...seat,
        ...fetchedDataMap[seat.seat_no], // fetchedDataMap에서 데이터 가져오기
        row_no: fetchedDataMap[seat.seat_no]?.row_no || "0",
        col_no: fetchedDataMap[seat.seat_no]?.col_no || "0",
        seat_price: fetchedDataMap[seat.seat_no]?.seat_price || 0,
        total_bidders: fetchedDataMap[seat.seat_no]?.total_bidders || 0,
        current_bid_amount:
          fetchedDataMap[seat.seat_no]?.current_bid_amount || 0,
      }));
      setSelectedSeats(updatedSeatsWithData);
    }
  } catch (error) {
    if (error.response) {
      setMessage(error.response.data);
    } else if (error.request) {
      setMessage(messageCommon.ERR_NETWORK);
    } else {
      setMessage(messageCommon.ERR_ETC);
    }
  }
};

export default fetchSeatData;
