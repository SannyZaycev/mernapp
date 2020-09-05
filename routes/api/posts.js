const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

const Post = require('../../models/Post');
const User = require('../../models/User');

//@route  POST api/posts
//@desc   Create a post
//@access Private
router.post('/', [
    auth, [
            check('text', 'Вы забыли написать текст').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        try{
            const user = await User.findById(req.user.id).select('-password');
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });
            const post = await newPost.save();
            res.json(post);
        } catch (err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


//@route  GET api/posts
//@desc   Get all a posts
//@access Private

router.get('/', async (req, res) => {
   try{
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
   } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');
   }
});


//@route  GET api/posts/:post_id
//@desc   Get single a post
//@access Private

router.get('/:post_id', auth, async (req, res) => {
   try{
        const post = await Post.findById(req.params.post_id);
        if(!post){
            return res.status(404).json({ msg: "Пост не найден" });
        }
        res.json(post);
   } catch (err){
        console.error(err.message);
        if(err.name === 'CastError'){
            return res.status(400).json({ msg: "Пост не найден" });
        }
        res.status(500).send('Server Error');
   }
});


//@route  DELETE api/posts/:post_id
//@access Private
//@desc   Delete post

router.delete('/:post_id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.post_id);
        if(!post){
            return res.status(404).json({ msg: "Пост не найден" });
        }
        //Check User
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'Вы не можете изменять посты, которые вам не принадлежат' });
        }
        await post.remove();
        res.json({ msg: "Пост был удалён" });
    } catch (err){
        console.error(err.message);
        if(err.name === 'CastError'){
            return res.status(400).json({ msg: "Пост не найден" });
        }
        res.status(500).send('Server Error');
    }
});


//@route  PUT api/posts/like/:post_id
//@access Private
//@desc   Add like
router.put('/like/:post_id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.post_id);
        //Check if post already liked by user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ msg: 'Вы уже голосовали за данный пост' });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (err){
        console.error(err.message);
        if(err.name === 'CastError'){
            return res.status(400).json({ msg: "Пост не найден" });
        }
        res.status(500).send('Server Error');
    }
});


//@route  PUT api/posts/unlike/:post_id
//@access Private
//@desc   Add like
router.put('/unlike/:post_id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.post_id);
        //Check if post already liked by user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ msg: 'Вы уже голосовали за данный пост' });
        }

        //Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);
    } catch (err){
        console.error(err.message);
        if(err.name === 'CastError'){
            return res.status(400).json({ msg: "Пост не найден" });
        }
        res.status(500).send('Server Error');
    }
});


//@route  POST api/posts/comment/:post_id
//@desc   Create a comment
//@access Private
router.post('/comment/:post_id', [
        auth, [
            check('text', 'Вы забыли написать текст').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        try{
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.post_id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);
            await post.save();
            await res.json(post.comments);
        } catch (err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


//@route  DELETE api/posts/comment/:post_id/:com_id
//@access Private
//@desc   Delete comment

router.delete('/comment/:post_id/:com_id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.post_id);
        //Make sure post exist
        if(!post){ return res.status(404).json({ msg: "Пост не найден" }); }
        //Find comment
        const comment = post.comments.find(comment => comment.id === req.params.com_id);
        //Make sure comment exist
        if(!comment){ return res.status(404).json({ msg: 'Комментарий не найден' }); }
        //Check User
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'Вы не можете изменять комментарии, которые вам не принадлежат' });
        }

        //Get remove index
        const removeIndex = post.comments.map(com => com.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);
    } catch (err){
        console.error(err.message);
        if(err.name === 'CastError'){
            return res.status(400).json({ msg: "Пост не найден" });
        }
        res.status(500).send('Server Error');
    }
});
module.exports = router;