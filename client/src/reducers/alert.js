import { SET_ALERT, REMOVE_ALERT } from "../actions/types";
const initialState = []; // the initial state will be array of objects like:
//{id:1,msg:"please log in",alertType:success}

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT:
      return [...state, payload]; // like that numbers= [1,2,3,4] => [...numbers,5]= [1,2,3,4,5]
    // like state.push(payload)

    // payload like an object {id:1,msg:"please log in", alertTypes:"sucess"}
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload);

    default:
      return state;
  }
}
