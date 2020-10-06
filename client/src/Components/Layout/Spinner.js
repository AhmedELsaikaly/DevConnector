import React, { Fragment } from "react";
import spinner from "../../../src/img/spinner.gif";
export default () => {
  // This spinner is for displaying while the page is loading
  return (
    <Fragment>
      <img
        src={spinner}
        style={{ width: "200px", margin: "auto", display: "block" }}
        alt="Loading ...."
      />
    </Fragment>
  );
};
