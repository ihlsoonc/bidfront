import axios from "axios";
import { APIs } from "../utils/APIs";

export const logout = async () => {
  const confirmMessage = `로그아웃하시겠습니까?`;
  const isConfirmed = window.confirm(confirmMessage);

  if (isConfirmed) {
    await axios.post(APIs.USER_LOGOUT, {}, { withCredentials: true });
  } else {
    return;
  }
};
