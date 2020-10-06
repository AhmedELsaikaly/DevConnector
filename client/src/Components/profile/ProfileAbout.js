import React, { Fragment } from "react";
import PropTypes from "prop-types";

const ProfileAbout = ({
  profile: {
    user: { name },
    bio,
    skills,
  },
}) => (
  <div className="profile-about bg-light p-2">
    {bio && (
      <Fragment>
        <h2 className="text-primary">{name.split(" ")[0]}'s Bio</h2>
        <p>{bio}</p>
      </Fragment>
    )}

    {skills && (
      <Fragment>
        <div className="line"></div>
        <h2 className="text-primary">Skill Set</h2>
        <div className="skills">
          {skills.map((skill, index) => (
            <div key={index} className="p-1">
              <i className="fa fa-check"></i> {skill}
            </div>
          ))}
        </div>
      </Fragment>
    )}
  </div>
);

ProfileAbout.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default ProfileAbout;
