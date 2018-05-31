const router = require('express').Router();
const authRouter = require('./auth');
const userRouter = require('./user');
const chatroomRouter = require('./chatroom');
const chatrequestRouter = require('./chatrequest');

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/chatrooms', chatroomRouter);
router.use('/chatrequest', chatrequestRouter);

module.exports = router;
