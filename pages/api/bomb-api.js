import Bmob from 'hydrogen-js-sdk'
const BMOB_SECRET_KEY = '2b25b4b498fd8734'
const BMOB_API = 'OdNMppa91loQz7(Q'
Bmob.initialize(BMOB_SECRET_KEY, BMOB_API);

let ChatAi = Bmob.ChatAI()
ChatAi.connect()
let msg = ''
let isDone=false
ChatAi.onClose((c) => {
	console.log("连接被关闭");
	//重新连接
	ChatAi.connect()
})
ChatAi.onMessage((res) => {
	console.log(res);
	if (res == "done") {
		console.log(msg);
		isDone=true
		// This.text = msg
		// return msg
	} else {
		msg = msg + res
	}
})
// 定义一个等待函数
function waitForDone(callback) {
	if (isDone) {
		// 如果标志为true，直接执行回调函数
		callback();
	} else {
		// 如果标志为false，延迟一段时间后再次调用waitForDone函数
		setTimeout(() => {
			waitForDone(callback);
		}, 500); // 延迟1秒
	}
}

// 调用waitForDone函数，并在标志为true时执行回调函数
waitForDone(() => {
	// 在这里执行您想要执行的函数
	console.log('执行函数');
});

export function getChat(content) {
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