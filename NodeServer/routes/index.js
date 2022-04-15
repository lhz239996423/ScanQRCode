const express = require('express');
const router = express.Router();
const sql = require("../mysql");
const redis = require("../redis");
const BroadcastChannel = require("../BroadcastChannel");

/**
 * 用户已扫码但是未确认，这个接口只是为了通知web端，用户当前的进展状态
 */
router.get('/SweepStatus', async (req, res, next) => {
  let uuid = req.query.uuid;
  BroadcastChannel.SweepStatus_pos.postMessage(uuid);
  res.json({ status: 200, msg: '发送成功', data: null })
});

/**
 * 移动端App确认登录按钮点击时候的ajax处理
 */
router.get('/login', async (req, res, next) => {
  let uuid = req.query.uuid; // uuid
  let uid = req.query.uid;   // 用户id

  let RedisUid = await redis.get(uuid);
  if (RedisUid == null || RedisUid == undefined) {
    res.json({
      status: 404,
      msg: '二维码失效或不存在',
      data: null
    });
  } else {
    if (RedisUid.length !== 0) {
      res.json({
        status: 404,
        msg: '已登录，请勿重复扫码',
        data: null
      });
    } else {
      // 查询用户信息
      let user = (await sql.query({ sql: 'select * from user where id = ?', data: [ uid ] }))[0];
      // 保存用户数据到对应key的redis中
      redis.set(uuid, JSON.stringify(user));
      res.json({
        status: 200,
        msg: '扫码成功',
        data: null
      });
    }
  }

});

/**
 * TODO
 * 被移动端App轮询的接口，主要让移动端知道，我移动端现在已登录的用户所对
 * 应的web端是否在请求让我授权登录，如果在web端在请求登录，那么移动端自
 * 动进入授权页面让用户授权，授权后结束轮询，否则一直轮询
 * PS: uniapp 无法连接到 Node.js 的 socket.io，所以只能用很low而且
 * 很消耗移动端资源的轮询了。等解决这个问题自然用socket重写这里实现
 */
router.get('/InquiryWebIsLogining', async (req, res, next) => {
  let uid = req.query.uid;   // 用户id
  // console.log("redis: ", redis);
  let UserId = await redis.get(uid);
  // 没有查询到redis的 uid 数据的话
  if (UserId == null || UserId == undefined) {
    res.json({
      status: 404,
      msg: '没有对应的web端请求登录',
      data: null
    });
  } else {
    // UserId 有数值，但是为空，表示web请求登录，但移动端未授权
    if (UserId.length == 0) {
      res.json({
        status: 200,
        msg: 'web端正在请求授权',
        data: null
      });
    // UserId 有数值，但是不为空，表示web请求登录，移动端已授权，并且redis未超时
    } else {
      res.json({
        status: 500,
        msg: '授权成功，请勿重复授权',
        data: null
      })
    }
  }

});

/**
 * 授权web端登录的接口，主要被移动端App调用拿到移动端给的用户id，
 * 然后从数据库获取用户的详细数据，通过广播把用户数据通知给web端
 */
router.get('/AuthorizedWeb', async (req, res, next) => {
  let uid = req.query.uid;   // 用户id
  let UserId = await redis.get(uid);

  if (UserId == null || UserId == undefined) {
    res.json({
      status: 404,
      msg: '没有对应的web端请求登录',
      data: null
    });
  } else {
    // UserId 有数值，但是为空
    if (UserId.length == 0) {
      // 查询用户信息
      let user = (await sql.query({ sql: 'select * from user where id = ?', data: [ uid ] }))[0];
      // 保存用户数据到对应key的redis中
      redis.set(uid, JSON.stringify(user));
      BroadcastChannel.AuthorizedWeb_pos.postMessage(user);
      res.json({
        status: 200,
        msg: '成功授权',
        data: null
      });

      // UserId 有数值，但是不为空，表示web请求登录，移动端已授权，并且redis未超时
    } else {
      res.json({
        status: 404,
        msg: '授权成功，请勿重复授权',
        data: null
      })
    }
  }
});
module.exports = router;
