<template>

	<div class="scanCode">
		<h3 class="title">扫码登录 案例</h3>
		<p>Nodejs + Redis + Mysql + Vue + Uni-app</p>
		<button class="scan" type="primary" @click="scanCode">扫码登录</button>
	</div>
		
</template>

<script>
	export default {
		data() {
			return {
				uuid: null,
				StorageSync: null,
				timer: null
			}
		},
		onLoad() {
		},
		created() {
			// 示例中是不停的主动询问服务器，实际应用可改为扫码开始询问->扫码结果明确（二维码失效、同意授权等）后结束询问
			this.setTime(); 
		},
		methods: {
			setTime() {
				this.timer = setInterval(() => {
					this.CheckAuthorization();
				},1000);
			},
			// 定时器，每隔一秒检查web端是否在请求登录
			CheckAuthorization() {
				uni.request({
					url: `${this.$config.baseUrl}/InquiryWebIsLogining`,
					method: 'GET',
					data: {
						uid: uni.getStorageSync('userinfo').id
					}, 
					success: (res) => {
						switch (res.data.status){
							// 没有对应的web端请求登录
							case 404:
								console.log(res.data.msg)
							break;
							// web端正在请求授权 
							case 200:
								clearInterval(this.timer)
								uni.navigateTo({
									url: `/pages/authorization/authorization`
								});
							break;
							// 授权成功，请勿重复授权
							case 500:
								uni.showToast({
								  title: res.data.msg,
								  icon: 'none',
								  duration: 2000
								});
							break;
							default:
							break;
						}
					}
				});
			},
			scanCode() {
				try {
					// 这里捕获异常是因为模拟器的相机会闪退，真机调试可以不用
					uni.scanCode({
					    success: (res) => {
							console.log("scan success: ", res)
							// 保存扫码获得的uuid
							this.uuid = res.result;
							uni.request({
								url: `${this.$config.baseUrl}/SweepStatus`,
								method: 'GET',
								data: {
									uuid: this.uuid
								},
								success: (res) => {
									console.log("ddddddd ------: ", res)
									uni.navigateTo({
										url: `/pages/login/login?uuid=${this.uuid}`
									});
								}
							});
					    },
						fail: (res) => {
							// 调用失败
							console.log("scan fail: ", res)
						},
						complete: (res) => {
							// 调用结束
							console.log("scan complete: ", res)
						},
					});
				} catch(e) {
					//TODO handle the exception
					console.log("scan catch: ", e)
				};

			}
		}
	}
</script>

<style>
	.scanCode {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20% 0;
	}
	p {
		color: #8d8d8d;
		margin-top: 10px;
	}
	.scan {
		margin-top: 30px;
	}
</style>
