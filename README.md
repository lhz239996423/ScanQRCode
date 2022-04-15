# ScanQRCode
ScanQRCode

借鉴了编码猿的思路，在其开源代码上修改的项目

在公司项目中接触到了这么个需求，需要支持Web和APP、公众号的扫码登录。于是就找了个项目练练手，熟悉和锻炼一下设计流程。

1、NodeServer

使用Node.js运行服务器，redis缓存数据
需要安装redis，默认链接0数据库

2、UniAppCode

使用uni-app开发APP，HbuildX运行;
模拟器调试需要先安装手机模拟器（无法使用相机，只能使用相册）;
真机调试需要允许USB调试;

3、ScanQRCode

使用vue开发，Socket与服务器通信;
直接打开index.html即可进入;

修复了BroadcastChannel广播失效的问题;
修复了Socket无法与服务器通信的问题;
修复了App无法与服务器通信的问题;

为了便于演示，已将redis数据过期默认为20s，支持更改

大致的实现流程如下：

![image](https://user-images.githubusercontent.com/51904762/163546138-a3e284c7-10d7-481b-bf5a-1ce4c8b1c726.png)

总结一下，一技傍身，事业不愁。了解未知，坚持学习，成就自我
