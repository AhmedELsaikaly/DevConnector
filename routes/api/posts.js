const express = require("express");
const router = express.Router();
const config = require("config");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");
const UserModel = require("../../models/User.js");
const PostModel = require("../../models/Post");
const ProfileModel = require("../../models/Post");

// @ route      Post api/posts
// @desc         creat Post
// @access        private

router.post(
  "/",
  [auth, [check("text", "Text field is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await UserModel.findById(req.user.id).select("-password");
      const newPost = new PostModel({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @ route      GET api/posts
// @desc         Get all Posts
// @access        private
router.get("/", auth, async (req, res) => {
  try {
    const Posts = await PostModel.find().sort({ date: -1 });
    res.json(Posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @ route      GET api/posts/:id
// @desc         Get Post by Post id
// @access        private
router.get("/:id", auth, async (req, res) => {
  try {
    const Post = await PostModel.findById(req.params.id);
    if (!Post) {
      return res.status(404).json({ msg: "Post no t found" });
    }
    res.json(Post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @ route      Delete api/posts/:id
// @desc         Delete Post by Post id
// @access        private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    // check if there is a post
    if (!post) {
      return res.status(401).json({ msg: "Post not found" });
    }
    // check if the user is the same as in deleted post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    // remove the post
    await post.remove();
    // sending the response of removing the post
    res.json({ msg: "Post removed" });
  } catch (error) {
    console.error(error.message);
    // if the id is not correct
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @ route      POST api/posts/like/:id
// @desc         Like a post
// @access        private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    // check the post already liked by the user
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    // adding the post in the first of the array of likes
    post.likes.unshift({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @ route      DELETE api/posts/unlike/:id
// @desc       Unlike on a post
// @access        private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    // Check if the post has not yet been liked
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post not yet been liked" });
    }
    // removing the like from the post

    const Post = await ProfileModel.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { likes: { user: `${req.user.id}` } } },
      { new: true }
    );
    return res.status(200).json(Post.likes);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @ route      Post api/posts/comment/:id
// @desc       Add comment on a post
// @access        private

router.post(
  "/comment/:id",
  [auth, [check("text", "Text field is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await PostModel.findById(req.params.id);
      const user = await UserModel.findById(req.user.id).select("-password");
      const newcomment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newcomment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    // Pull out the comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // make sure that comment is existed
    if (!comment) {
      return res.status(404).json({ msg: "comment not found" });
    }

    //check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }

    const NewPost = await PostModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: {
          comments: { user: `${req.user.id}`, _id: req.params.comment_id },
        },
      },
      { new: true }
    );
    return res.status(200).json(NewPost.comments);

    // another solution

    // // filter the comment that not have the comment :comment_id
    // post.comments = post.comments.filter(
    //   ({ id }) => id !== req.params.comment_id
    // );

    // await post.save();

    // return res.json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
