<script>
	export default {
		onLaunch: function() {
			// 模拟数据，保存用户id，实际项目中这应该是用户token
			uni.setStorageSync('userinfo', { id: 1 });
			console.log('App Launch')
		},
		onShow: function() {
			
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
