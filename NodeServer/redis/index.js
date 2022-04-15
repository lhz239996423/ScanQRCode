const redis = require("redis");
const BroadcastChannel = require("../BroadcastChannel");

class Redis {
  constructor() {
    this.client = redis.createClient({
      host:'127.0.0.1',
      port:'6379',
      ttl: 5*60*1000
    });

    this.client.on("error", function(error) {
      console.error(error);
    });

    this.client.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], this.SubscribeExpired);
  }

  async get(key) {
    return new Promise((resolve)=>{
      this.client.get(key, (err,res) => resolve(res));
    })
  }

  set(key, value="", time=20) {
    console.log(`redis set：${key} ,value: ${value}... `);
    this.client.set(key, value);
    // 设置key的过期时间60秒（其实也就是二维码的有效时间）
    this.client.expire(key, time)
  }

  SubscribeExpired(e, r) {
    let sub = redis.createClient(6379);
    const expired_subKey = '__keyevent@0__:expired';
    sub.subscribe(expired_subKey, function (res) {
      sub.on('message', function (chan, msg) {
        console.log(`===============二维码：${msg} 已超时过期.==================`);
        // 二维码失效，通过 BroadcastChannel 通知 routes/socket.js
        BroadcastChannel.SubscribeExpired_pos.postMessage(msg);
      });
    })
  }
}

module.exports = new Redis();

