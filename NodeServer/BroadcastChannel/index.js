const { BroadcastChannel } = require('broadcast-channel');

module.exports = {
  // BroadcastChannel实例不能自己监听自己，故生成专用的发送和接受实例
  SubscribeExpired_pos: new BroadcastChannel('SubscribeExpired'),
  SubscribeExpired_rec: new BroadcastChannel('SubscribeExpired'),
  SweepStatus_pos: new BroadcastChannel('SweepStatus'),
  SweepStatus_rec: new BroadcastChannel('SweepStatus'),
  AuthorizedWeb_pos: new BroadcastChannel('AuthorizedWeb'),
  AuthorizedWeb_rec: new BroadcastChannel('AuthorizedWeb')
};