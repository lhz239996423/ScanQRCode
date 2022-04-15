const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http); // spcket挂载监听
const utils = require('../utils');
const redis = require('../redis');
const BroadcastChannel = require("../BroadcastChannel");

io.on('connection', (socket) => {
  console.log("io connection: ");
  // Web端获取二维码和uuid
  socket.on('getQRcode', () => {
    let uuid = utils.randomNumber();    // 生成uuid
    let QRcode = utils.getQRcode(uuid); // 根据uuid生成二维码的base64
    redis.set(uuid, '');                // 保存uuid 到redis中，但是用户数据留空，由移动端上传
    socket.emit('sendQRcode', { uuid: uuid, QRcode: QRcode }); // 向web端发送uuid和二维码base64数据
  });

  /**
   * 检查移动端用户是否扫码二维码登录，如果扫码登录了
   * 那么二维码显示登录成功样式，并显示登录用户信息
   */
  socket.on('checkScanCode', async key => {
    console.log(`Web端(Vue)在询问用户是否扫码：${key}...`);

    let userInfo = await redis.get(key);
    // 如果key对应的value为空，那么用户未扫码
    // 反之 用户扫码并确定登录
    userInfo == null || userInfo.length == 0 ? socket.emit("waitScanCode") : socket.emit("SuccessScanCode", userInfo);

  });

  /**
   * 场景：用户已经移动端App扫码登录后，本地保存有用户的id
   * 功能：模仿微信web端发送请求，然后移动端授权web端的本次登录
   * web端主动请求移动端授权登录
   */
  socket.on('WebRequestLogin', async id => {
    console.log("web端请求登录用户的id: ", id);
    let WebId = await redis.get(id);

    // 如果redis中没有数值，表示web端还未开始请求移动端授权登录，那么保存id为redis key
    // 如果redis中有数值，表示web端用户已经在请求移动端授权登录，那么不重复保存id，并且提示web端
    if (WebId == null) {
      redis.set(id, '');   // 使用web端的用户id作为redis的key存储起来，value对应的数值由移动端填充
    } else {
      console.log("不等于null")
      socket.emit("DoNotRepeatRequest", '已发送登录请求，请在移动端授权本次登录')
    }
  });

  // 接受redis key超时的广播通知，也就是用户长时间未扫二维码主要在redis/index.js中进行订阅key失效的事件
  // 然后广播通知被这里代码onmessage到，然后 socket 通知 Vue 前端
  BroadcastChannel.SubscribeExpired_rec.onmessage = event => {
    socket.emit("ScanCodeOvertime")
  };

  // 用户已扫码，但是未确认
  BroadcastChannel.SweepStatus_rec.onmessage = event => socket.emit("ScanCodeing", event.data);

  // 移动端成功授权web端
  BroadcastChannel.AuthorizedWeb_rec.onmessage = function(event) {
    console.log("event: ", event);
    socket.emit("AuthorizedWebSuccess", event);
  };

  socket.on('disconnect', () => console.log('web端用户掉线...'));

});
io.set('origins', '*:*');

http.listen(9080, () => console.log('socket listening on *: 9080'));