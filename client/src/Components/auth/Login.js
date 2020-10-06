import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { login } from "../../actions/auth";

const Login = ({ login, isAuthenticated }) => {
  // define the formData state
  const [formData, SetFormData] = useState({
    email: "",
    password: "",
  });

  // handle change
  const onChange = (e) =>
    // depreciate every variable in the form data state
    SetFormData({ ...formData, [e.target.name]: e.target.value });

  // deprecating the state values
  const { email, password } = formData;

  // handle submit
  const onSubmit = async (e) => {
    e.preventDefault();
    login(email, password);
  };
  // redirect if Logged in
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }
  return (
    <div>
      <section className="container">
        <h1 className="large text-primary">Sign In</h1>
        <p className="lead">
          <i className="fas fa-user"></i>Sign into
        </p>
        <form
          className="form"
          onSubmit={(e) => {
            onSubmit(e);
          }}
        >
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={email}
              onChange={(e) => onChange(e)}
              required
            />
            <small className="form-text">
              This site uses Gravatar so if you want a profile image, use a
              Gravatar email
            </small>
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              minLength="6"
              value={password}
              onChange={(e) => onChange(e)}
              required
            />
          </div>
          <input type="submit" className="btn btn-primary" value="Login" />
        </form>
        <p className="my-1">
          Already have an account? <Link to="/register">Sign Up</Link>
        </p>
      </section>
    </div>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});
export default connect(mapStateToProps, { login })(Login);
