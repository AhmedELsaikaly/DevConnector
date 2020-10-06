import React, { Fragment, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "../src/Components/Layout/Navbar";
import Landing from "../src/Components/Layout/Landing";
import Login from "../src/Components/auth/Login";
import Register from "../src/Components/auth/Register";
import CreateProfile from "../src/Components/profile-forms/CreateProfile";
import AddExperience from "../src/Components/profile-forms/AddExperience";
import AddEducation from "../src/Components/profile-forms/AddEducation";
import Alert from "./Components/Layout/Alert";
import { loadUser } from "./actions/auth";
import Dashboard from "../src/Components/dashboard/Dashboard";
import PrivateRoute from "../src/Components/routing/PrivateRoute";
import EditProfile from "../src/Components/profile-forms/EditProfile";
import Profiles from "../src/Components/Profiles/Profiles";
import Profile from "../src/Components/profile/profile";
import Posts from "../src/Components/posts/Posts";
import Post from "./Components/post/Post";
// Redux
import { Provider } from "react-redux";
import store from "../src/store";
import setAuthToken from "../src/utils/setAuthToken";

const App = () => {
  useEffect(() => {
    // check if the token in local storage
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }
    store.dispatch(loadUser());
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path="/" component={Landing} />
          <section>
            <Alert />
            <Switch>
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/profiles" component={Profiles} />
              <Route exact path="/profile/:id" component={Profile} />
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute
                exact
                path="/edit-profile"
                component={EditProfile}
              />
              <PrivateRoute
                exact
                path="/create-profile"
                component={CreateProfile}
              />
              <PrivateRoute
                exact
                path="/add-experience"
                component={AddExperience}
              />
              <PrivateRoute
                exact
                path="/add-education"
                component={AddEducation}
              />
              <PrivateRoute exact path="/posts" component={Posts} />
              <PrivateRoute exact path="/post/:id" component={Post} />
              <Route />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;
