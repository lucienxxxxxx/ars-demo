<template>
	<view class="content">
		<textarea class="result" placeholder="语音识别内容" :value="result"></textarea>
		<view class="recogniz">
			<view style="color: #0000CC;">
				<text>{{title}}</text>
			</view>
			<view class="partial">
				<text>{{partialResult}}</text>
			</view>
			<view class="volume" :style="{width:valueWidth}"></view>
		</view>
		<view >
			<text>{{gptTempRes}}</text>
		</view>
		<button type="default" @touchstart="startRecognize" @touchend="endRecognize">按下开始&amp;松开结束</button>
	</view>
</template>
<script>
	import Bmob from 'hydrogen-js-sdk'
	const BMOB_SECRET_KEY = '2b25b4b498fd8734'
	const BMOB_API = 'OdNMppa91loQz7(Q'
	const innerAudioContext = uni.createInnerAudioContext()
	Bmob.initialize(BMOB_SECRET_KEY, BMOB_API);
	let ChatAi = Bmob.ChatAI()
	//开始连接ChatAi
	ChatAi.connect()
	//ChatAi WS关闭函数
	ChatAi.onClose((c) => {
		console.log("连接被关闭");
		//重新连接
		ChatAi.connect()
	})
	//发送数据，获取GTP回答
	function getChat(content) {
		console.log("发送数据");
		let data = {
			"messages": [{
				"content": content,
				"role": "user"
			}],
			"session": "b1"
		}
		//发送数据
		ChatAi.send(JSON.stringify(data))
	}

	export default {
		data() {
			return {
				title: '未开始',
				text: '',
				partialResult: '...',
				result: '',
				valueWidth: '0px',
				gptTempRes: '',
				gptRes: ''
			}
		},
		onLoad() {
			// #ifdef APP-PLUS
			// 监听语音识别事件
			plus.speech.addEventListener('start', this.ontStart, false);
			plus.speech.addEventListener('volumeChange', this.onVolumeChange, false);
			plus.speech.addEventListener('recognizing', this.onRecognizing, false);
			plus.speech.addEventListener('recognition', this.onRecognition, false);
			plus.speech.addEventListener('end', this.onEnd, false);
			// #endif
		},
		methods: {
			ontStart() {
				this.title = '...倾听中...';
				this.text = '';
				console.log('Event: start');
			},
			onVolumeChange(e) {
				this.valueWidth = 100 * e.volume + 'px';
				console.log('Event: volumeChange ' + this.valueWidth);
			},
			onRecognizing(e) {
				this.partialResult = e.partialResult;
				console.log('Event: recognizing');
			},
			onRecognition(e) {
				this.text += e.result;
				this.text ? (this.text += '\n') : this.text = '';
				this.result = this.text;
				this.partialResult = e.result;
				console.log('Event: recognition');
			},
			onEnd() {
				if (!this.text || this.text == '') {
					plus.nativeUI.toast('没有识别到内容');
				}
				this.result = this.text;
				console.log(this.result)
				this.title = '未开始';
				this.valueWidth = '0px';
				this.partialResult = '...';
			},
			startRecognize() {
				console.log('startRecognize');
				// #ifdef APP-PLUS
				plus.speech.startRecognize({
					engine: 'baidu',
					lang: 'zh-cn',
					'userInterface': false,
					'continue': true
				});
				// #endif
			},
			endRecognize() {
				console.log('endRecognize');
				this.startChat()
				// #ifdef APP-PLUS
				plus.speech.stopRecognize();
				// #endif
			},
			startChat() {
				const This = this
				//发起Chat请求
				getChat(This.title)

				//获取GPT回答
				let msg = ''
				this.gptRes=''
				this.gptTempRes=''
				
				ChatAi.onMessage((res) => {
					console.log(res);
					if (res == "done") {
						console.log(msg);
						//得到GPT完整回答
						This.gptRes = msg
						//开始TextToSpeech
						This.textToSpeech()
					} else {
						msg = msg + res
						This.gptTempRes = msg
					}
				})
			},
			textToSpeech() {
				this.getAudio(this.gptRes)
			},
			getAudio(text) {
				const This = this
				console.log('进入getAudio')
				uni.request({
					url: 'http://komorebicn.top:9080/tts',
					method: "POST",
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

		}
	}
</script>
<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.recogniz {
		width: 200px;
		height: 100px;
		padding: 12px;
		margin: 50px auto;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 16px;
		text-align: center;
	}

	.partial {
		width: 100%;
		height: 40px;
		margin-top: 16px;
		font-size: 12px;
		color: #FFFFFF;
	}

	.volume {
		width: 10px;
		height: 6px;
		border-style: solid;
		display: inline-block;
		box-sizing: border-box;
		border-width: 1px;
		border-color: #CCCCCC;
		border-radius: 50%;
		background-color: #00CC00;
	}

	.result {
		color: #CCCCCC;
		border: #00CCCC 1px solid;
		margin: 25px auto;
		padding: 6px;
		width: 80%;
		height: 100px;
	}
</style>