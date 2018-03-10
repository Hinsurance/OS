$(function() {
	clearQueue();
	jobAddToQueue();
	startRun();
})

//var submit = 1;
/**
 * 将单个作业添加到就绪队列中
 * @param  {number} submit 提交时间
 * @return {[type]}        [description]
 */
//function jobAddToQueue(submit)
function jobAddToQueue() {
	var name = '',//作业名称
		submit = 1,
		submit_time = 0,
		serve_time = 0,//服务时间
		btn = $('#input_job_btn'),//提交按钮
		ready_queue = $('#ready_queue');//就绪队列

	btn.on('click',function() {
		if ($('.jcb').length > 0) {
			submit = $('.jcb').length + 1;
		} else {
			submit = 1;
		}

		name = $('#job_name').val();
		submit_time = submit;
		serve_time = $('#serve_time').val();

		//输入为空时提示
		if (!name) {
			layer.msg('请输入作业名',{icon: 5,time:2000, shift: 6,function() {}});
			return false;
		}
		if (!serve_time) {
			layer.msg('请输入服务时间',{icon: 5,time:2000, shift: 6,function() {}});
			return false;
		}

		if (name && serve_time) {
			var tr = $('<tr class="jcb">'+
						'<td class="jcb-name">' + name + '</td>'+
						'<td class="jcb-submit-time">' + submit_time + '</td>'+
						'<td class="jcb-serve-time">' + serve_time + '</td>'+
						'<td class="jcb-status">W</td>'+
						'</tr>');
			ready_queue.append(tr);
			submit++;
			$('#job_name').val('');
			$('#serve_time').val('');
		}
		return false;
	})
}

/**
 * 清空就绪队列
 * @return {[type]} [description]
 */
function clearQueue() {
	var clear_btn = $('#clear_btn');
	clear_btn.on('click',function() {
		$('.jcb').remove();
	})
}

/**
 * 获取整个就绪队列
 * @return {array} ready_arr
 */
function getReadyQueue() {
	var jcb_arr = $('.jcb');
	var ready_arr = [];
	for (var i = 0;i < jcb_arr.length;i++) {
		var jcb = {
			name: '',//作业名称
			submitTime: 0,//提交时间
			serveTime: 0,//服务时间
			status: 'W',//状态
			startTime: 0,//开始时间
			finishTime: 0,//完成时间
			runTime: 0,//周转时间
			powerRunTime: 0//带权周转时间
		};
		jcb.name = $(jcb_arr[i]).find('.jcb-name').html();
		jcb.submitTime = parseInt($(jcb_arr[i]).find('.jcb-submit-time').html());
		jcb.serveTime = parseInt($(jcb_arr[i]).find('.jcb-serve-time').html());
		jcb.status = $(jcb_arr[i]).find('.jcb-status').html();
		ready_arr.push(jcb);
	}
	return ready_arr;
}

/**
 * 运行作业调度
 * @return {[type]} [description]
 */
function startRun() {
	var run_btn = $('#run_btn'),
		clear_all_btn = $('#clear_all_btn'),
		fcfs_radio = $('#fcfs_radio'),
		sjf_radio = $('#sjf_radio'),
		hrrn_radio = $('#hrrn_radio');

	run_btn.on('click',function() {
		if ($('.jcb').length <=0) {
			return false;
		}

		var ready_arr = getReadyQueue();
		var result_arr = [];
		var before_finish_time = 0;//上一个作业的完成时间

		if (fcfs_radio.is(':checked')) {
			$('#fcfs_result').html('');
			methodFCFS(ready_arr,result_arr,before_finish_time);
		} else if (sjf_radio.is(':checked')) {
			$('#sjf_result').html('');
			methodSJF(ready_arr,result_arr,before_finish_time);
		} else if (hrrn_radio.is(':checked')) {
			$('#hrrn_result').html('');
			methodHRRN(ready_arr,result_arr,before_finish_time);
		} else {
			console.log('未选择调度算法');
		}
		return false;
	})

	//全部清空
	clear_all_btn.on('click',function() {
		$('#fcfs_result').html('');
		$('#sjf_result').html('');
		$('#hrrn_result').html('');
	})
}

/**
 * FCFS算法
 * @param  {array} ready_arr          [description]
 * @param  {array} result_arr         [description]
 * @param  {number} before_finish_time [description]
 * @return {[type]}                    [description]
 */
function methodFCFS(ready_arr,result_arr,before_finish_time) {

	if (ready_arr.length > 0) {
		var bft = 0;
		bft = running(ready_arr,before_finish_time,result_arr);
		methodFCFS(ready_arr, result_arr,bft);
		//继续判断
	} else {
		showResult(result_arr,'fcfs_result');
	}
}

/**
 * SJF算法
 * @param  {array} ready_arr          [description]
 * @param  {array} result_arr         [description]
 * @param  {number} before_finish_time [description]
 * @return {[type]}                    [description]
 */
function methodSJF(ready_arr,result_arr,before_finish_time) {

	if (ready_arr.length > 0) {
		var bft = 0;
		bft = running(ready_arr,before_finish_time,result_arr);

		var sjf_arr = [],//存放在当前作业被调度期间到达的作业
			index1 = [],//记录到达作业在ready_arr中的索引
			index2 = 0,//记录服务时间最短的作业在sjf_arr中的索引
			min_serve_time = 0;//最短服务时间

		for (var i = 0;i < ready_arr.length;i++) {
			if (ready_arr[i].submitTime <= bft) {
				sjf_arr.push(ready_arr[i]);
				index1.push(i);
			}
		}

		if (sjf_arr.length > 0) {
			min_serve_time = sjf_arr[0].serveTime;
			for (var i = 1;i < sjf_arr.length;i++) {
				if (sjf_arr[i].serveTime < min_serve_time) {
					index2 = i;
					min_serve_time = sjf_arr[i].serveTime;
				}
			}
			//更新ready_arr
			ready_arr.splice(index1[index2],1);
			ready_arr.splice(0,0,sjf_arr[index2]);
		}
		methodSJF(ready_arr,result_arr,bft);
	} else {
		showResult(result_arr,'sjf_result');
	}
}

/**
 * HRRN算法
 * @param  {array} ready_arr          [description]
 * @param  {array} result_arr         [description]
 * @param  {number} before_finish_time [description]
 * @return {[type]}                    [description]
 */
function methodHRRN(ready_arr,result_arr,before_finish_time) {

	if (ready_arr.length > 0) {
		var bft = 0;
		bft = running(ready_arr,before_finish_time,result_arr);

		var hrrn_arr = [],//存放在当前作业被调度期间到达的作业
			p = [],//到达作业的响应比
			index1 = [],//记录到达作业在ready_arr中的索引
			index2 = 0,//记录响应比最高的作业在hrrn_arr中的索引
			max_p = 0;//最高响应比

		for (var i = 0;i < ready_arr.length;i++) {
			if (ready_arr[i].submitTime <= bft) {
				var pr = 0;
				pr = (bft - ready_arr[i].submitTime) / ready_arr[i].serveTime + 1;
				hrrn_arr.push(ready_arr[i]);
				index1.push(i);
				p.push(pr);
			}
		}

		if (hrrn_arr.length > 0) {
			max_p = p[0];
			for (var i = 1;i < p.length;i++) {
				if (p[i] > max_p) {
					index2 = i;
					max_p = p[i];
				}
			}
			//更新ready_arr
			ready_arr.splice(index1[index2],1);
			ready_arr.splice(0,0,hrrn_arr[index2]);
		}
		methodHRRN(ready_arr,result_arr,bft);
	} else {
		showResult(result_arr,'hrrn_result');
	}
}

/**
 * 调度每个作业
 * @param  {[type]} ready_arr          [description]
 * @param  {[type]} before_finish_time [description]
 * @param  {[type]} result_arr         [description]
 * @return {[type]}                    [description]
 */
function running(ready_arr,before_finish_time,result_arr) {
	var cur_jcb = ready_arr[0],
		start_time = 0,
		finish_time = 0,
		run_time = 0,
		power_run_time = 0;
	
	//开始时间
	if (before_finish_time == 0) {
		start_time = 1;
	} else {
		start_time = before_finish_time;
	}

	//完成时间
	finish_time = start_time + cur_jcb.serveTime;
	//周转时间
	run_time = finish_time - cur_jcb.submitTime;
	//带权周转时间
	power_run_time = run_time / cur_jcb.serveTime;
	//更新
	//before_finish_time = finish_time;

	cur_jcb.startTime = start_time;
	cur_jcb.finishTime = finish_time;
	cur_jcb.runTime = run_time;
	cur_jcb.powerRunTime = power_run_time;

	result_arr.push(cur_jcb);
	// 将完成的作业移出就绪队列数组
	ready_arr.splice(0,1);
	return finish_time;
}

/**
 * 显示调度结果
 * @param  {[type]} result_arr   [description]
 * @param  {[type]} which_result [description]
 * @return {[type]}              [description]
 */
function showResult(result_arr,which_result) {
	var length = result_arr.length,
		T = 0,
		W = 0;

	for (var i = 0;i < length;i++) {
		T = T + result_arr[i].runTime;
		W = W + result_arr[i].powerRunTime;
	}
	T = T / length;
	W = W / length;
	var result = $('#'+which_result);
	for (var i = 0;i < length;i++) {
		var tr = $('<tr>'+
						'<td>' + result_arr[i].name + '</td>'+
						'<td>' + result_arr[i].submitTime + '</td>'+
						'<td>' + result_arr[i].serveTime + '</td>'+
						'<td>' + result_arr[i].startTime + '</td>'+
						'<td>' + result_arr[i].finishTime + '</td>'+
						'<td>' + result_arr[i].runTime + '</td>'+
						'<td>' + result_arr[i].powerRunTime + '</td>'+
					'</tr>');
		result.append(tr);
	}
	var tw = $('<tr>'+
					'<td colspan="4">平均周转时间 T = ' + T + '</td>'+
					'<td colspan="3">平均带权周转时间 W = ' + W + '</td>'+
				'</tr>');
	result.append(tw);
}