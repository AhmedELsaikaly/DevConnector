import React from "react";
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import Spinner from "../Layout/Spinner";
const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading },
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      loading ? (
        <Spinner />
      ) : isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);

// the explanation in the bottom

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);
// const myObj = {
//     name: 'John Doe',
//     age: 35,
//     sex: 'M',
//     dob: new Date(1990, 1, 1)
//   };

//Take property name defined on myObj and assign its value to a new variable
//we call Username. Then, take whatever other properties were defined on myObj
//(i.e., age, sex and dob) and collect them into a new object assigned to the
// variable we name rest.

// const { name: Username, ...rest } = myObj
// console.log(Username); => John Doe
// console.log(rest);=>{age: 35, sex: "M", dob: Thu Feb 01 1990 00:00:00 GMT+0200 (Eastern European Standard Time)}
//https://stackoverflow.com/questions/43484302/what-does-it-mean-rest-in-react-jsx
