const express = require("express");
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const normalize = require("normalize-url");
const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();
const UserModel = require("../../models/User.js");
// @ route      POST api/users
// @desc         Registration Route
// @access        Public
router.post(
  "/",
  [
    check("name", "name is required").not().isEmpty(),
    check("email", "please include a valid email").isEmail(),
    check(
      "password",
      "please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, password, email } = req.body;
    // see if the exists
    try {
      let user = await UserModel.findOne({ email });
      // check if the user exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      //making symbol avatar for the user
      const avatar = normalize(
        gravatar.url(email, {
          s: "200", // size
          r: "pg", // rating
          d: "mm", // default
        }),
        { forceHttps: true }
      );

      // creat instance from the model
      user = new UserModel({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonWebtoken

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
    // UserModel.findOne({email:email}).then((result)=>{

    // }).catch((err)=>{

    // })
  }
);
module.exports = router;
