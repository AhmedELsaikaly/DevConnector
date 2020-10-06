import { SET_ALERT, REMOVE_ALERT } from "./types";
import uuid from "uuid";

const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
};
export const setAlert = (msg, alertType, timeout = 3000) => (dispatch) => {
  const id = uuid.v4(); // make universal id
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });
  scrollToTop();
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), 3000);
};
