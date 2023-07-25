<template>
	<view class="text">
		{{text}}
		<button @click="sendData">点击Chat</button>
		<button @click="tts">点击播放音频</button>
	</view>

</template>

<script>
	// import Bmob from '@/hydrogen-js-sdk/src/lib/app.js'
	// import Bmob from '@/hydrogen-js-sdk/dist/Bmob-2.5.1.min.js'
	import axios from 'axios';

	// import axiosAdapter from 'axios-miniprogram-adapter'
	import Bmob from 'hydrogen-js-sdk'
	const innerAudioContext = uni.createInnerAudioContext()
	const BMOB_SECRET_KEY = '2b25b4b498fd8734'
	const BMOB_API = 'OdNMppa91loQz7(Q'
	Bmob.initialize(BMOB_SECRET_KEY, BMOB_API);
	let ChatAi = Bmob.ChatAI()
	ChatAi.connect()

	ChatAi.onClose((c) => {
		console.log("连接被关闭");
		//重新连接
		ChatAi.connect()
	})

	function getChat(content) {
		console.log("发送数据");
		let data = {
			"messages": [{
				"content": content,
				"role": "user"
			}],
			"session": "b1"
		}
		ChatAi.send(JSON.stringify(data))
	}


	export default {
		data() {
			return {

				text: '等等',
				audioData: null

			}
		},
		onLoad() {

		},

		methods: {
			sendData() {
				var This = this
				getChat("getAudio")
				let msg = ''
				ChatAi.onMessage((res) => {
					console.log(res);
					if (res == "done") {
						console.log(msg);
						This.text = msg
						This.getAudio(msg)
					} else {
						if (res) {
							msg = msg + res
						}

					}
				})
			},
			getAudio(text) {
				const This = this
				console.log('进入getAudio')
				uni.request({
					url: 'http://komorebicn.top:9080/tts',
					method:"POST",
					data: {
						"text": text,
					},
					success: (res) => {
						console.log(res.data);
						var url = "http://static.komorebicn.top/upload/" + res.data
						innerAudioContext.volume = 1
						innerAudioContext.src = url
						innerAudioContext.autoplay = true
						innerAudioContext.play()
					}
				});
			},
			tts() {
				innerAudioContext.src =
					'http://static.komorebicn.top/upload/output.wav'
				innerAudioContext.autoplay = true
				innerAudioContext.play()
			}

		}
	}
</script>

<style>
</style>