import axios from "axios";
import { setAlert } from "./alert";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE,
} from "./types";
import setAuthToken from "../utils/setAuthToken";

// Load User
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }
  try {
    const res = await axios.get("/api/auth");

    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    console.log(err.response);
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

// Register User
export const register = ({ name, email, password }) => async (dispatch) => {
  const config = {
    headers: {
      Content_Type: "application/json",
    },
  };
  const body = { name, email, password };
  try {
    const res = await axios.post("/api/users", body, config);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });

    // dispatch(loadUser()); // dispatching loadUser after Register
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      for (var i = 0; i < errors.length; i++) {
        dispatch(setAlert(errors[i].msg, "danger"));
      }
    }

    dispatch({
      type: REGISTER_FAIL,
    });
  }
};

// login User
export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      Content_Type: "application/json",
    },
  };
  const body = { email, password };

  try {
    const res = await axios.post("/api/auth", body, config);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser()); // dispatching loadUser after login
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      for (var i = 0; i < errors.length; i++) {
        dispatch(setAlert(errors[i].msg, "danger"));
      }
    }

    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

// Logout User

export const logout = () => (dispatch) => {
  dispatch({
    type: CLEAR_PROFILE,
  });
  dispatch({
    type: LOGOUT,
  });
};
