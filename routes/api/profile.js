const express = require("express");
const axios = require("axios");
const router = express.Router();
const config = require("config");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
// bring in normalize to give us a proper url, regardless of what user entered
const normalize = require("normalize-url");
const UserModel = require("../../models/User.js");
const ProfileModel = require("../../models/Profile");
const PostsModel = require("../../models/Post");
// @ route      GET api/profile/me
// @desc         Get current user profile
// @access        private
router.get("/me", auth, async (req, res) => {
  try {
    const Profile = await ProfileModel.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!Profile) {
      return res.status(400).json({ msg: "There is no Profile for this User" });
    }
    res.send(Profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route      POST api/profile
// @desc        create or update user profile
// @access        private

router.post(
  "/",
  auth,
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    // Build Profile Object
    const profileFields = {
      user: req.user.id,
      company,
      location,
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => " " + skill.trim()),
      status,
      githubusername,
    };

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;

    // Using upsert option (creates new doc if no match is found):
    try {
      let profile = await ProfileModel.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          useFindAndModify: false,
        }
      );
      return res.send(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @ route      GET api/profile
// @desc        Get all profiles
// @access        Public

router.get("/", async (req, res) => {
  try {
    const profiles = await ProfileModel.find().populate("user", [
      "name",
      "avatar",
    ]);
    res.send(profiles);
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route      GET api/profile/user/:user_id
// @desc        Get profile by id
// @access        Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    // check if there is a profile
    if (!profile) {
      res.status(400).json({ msg: "Profile not found" });
    } else {
      res.send(profile);
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @ route        Delete api/profile
// @desc          Delete  profile , user&post
// @access        private

router.delete("/", auth, async (req, res) => {
  try {
    // remove user posts
    await PostsModel.deleteMany({ user: req.user.id }); // delete many it delete all the posts that have the same user id
    // remove user profile
    await ProfileModel.findOneAndDelete({ user: req.user.id });

    // remove the user
    await UserModel.findOneAndDelete({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route        PUT api/profile/experience
// @desc         Add profile experience
// @access        private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Status is required").not().isEmpty(),
      check("company", "Skills is required").not().isEmpty(),
      check("from", "from date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    // destructuring the values
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    // putting the values in variable as an object
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await ProfileModel.findOne({ user: req.user.id });
      // adding experience to the experience array at the first
      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @ route        Delete api/profile/experience/:exp_id
// @desc          Delete profile experience by id
// @access        private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await ProfileModel.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { experience: { _id: `${req.params.exp_id}` } } },
      { new: true }
    );
    return res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route        PUT api/profile/education
// @desc         Add profile education
// @access        private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required").not().isEmpty(),
      check("degree", "degree is required").not().isEmpty(),
      check("fieldofstudy", "fieldofstudy is required").not().isEmpty(),
      check("from", "from date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    // destructuring the values
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    // putting the values in variable as an object
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await ProfileModel.findOne({ user: req.user.id });
      // adding education to the education array at the first
      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @ route        Delete api/profile/education/edu_id
// @desc          Delete profile education by id
// @access        private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await ProfileModel.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { education: { _id: `${req.params.edu_id}` } } },
      { new: true }
    );
    return res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @ route        GET api/profile/github/:username
// @desc          Get User repos from Github
// @access        private

router.get("/github/:username", async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      "user-agent": "node.js",
      Authorization: `token ${config.get("TOKEN")}`,
    };
    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: "No Github profile found" });
  }
});

module.exports = router;
