$(function() {
	processAddToQueue();
	clearQueue();
	startRun();
})

/**
 * 添加进程
 * @return {[type]} [description]
 */
function processAddToQueue() {
	var name = '',//进程名称
		submit = 1,
		submit_time = 0,
		serve_time = 0,//服务时间
		priority = 0,//优先权
		btn = $('#input_process_btn'),//提交按钮
		ready_queue = $('#ready_queue');//就绪队列

	btn.on('click',function() {
		//自动计算提交时间
		if ($('.pcb').length > 0) {
			submit = $('.pcb').length + 1;
		} else {
			submit = 1;
		}

		//获取用户输入的进程信息
		name = $('#process_name').val();
		submit_time = submit;
		serve_time = $('#serve_time').val();
		priority = $('#priority').val();

		//输入为空时提示
		if (!name) {
			layer.msg('请输入进程名',{icon: 5,time:2000, shift: 6,function() {}});
			return false;
		}
		if (!serve_time) {
			layer.msg('请输入服务时间',{icon: 5,time:2000, shift: 6,function() {}});
			return false;
		}
		if (!priority) {
			layer.msg('请输入优先权',{icon: 5,time:2000, shift: 6,function() {}});
			return false;
		}

		if (name && serve_time && priority) {
			var tr = $('<tr class="pcb">'+
							'<td class="pcb-name">' + name + '</td>'+
							'<td class="pcb-submit-time">' + submit_time + '</td>'+
							'<td class="pcb-serve-time">' + serve_time + '</td>'+
							'<td class="pcb-priority">' + priority + '</td>'+
							'<td class="pcb-status">W</td>'+
						'</tr>');
			ready_queue.append(tr);
			submit++;
			$('#process_name').val('');
			$('#serve_time').val('');
			$('#priority').val('');
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
		$('.pcb').remove();
	})
}

/**
 * 获取整个就绪队列
 * @return {array} ready_arr
 */
function getReadyQueue() {
	var pcb_arr = $('.pcb');
	var ready_arr = [];
	for (var i = 0;i < pcb_arr.length;i++) {
		var pcb = {
			name: '',//进程名称
			submitTime: 0,//提交时间，即到达时间
			serveTime: 0,//服务时间
			priority: 0,//优先数
			runTime: 0,//已运行时间
			status: 'W',//状态
			startTime: 0,//开始时间
			finishTime: 0//完成时间
		};
		pcb.name = $(pcb_arr[i]).find('.pcb-name').html();
		pcb.submitTime = parseInt($(pcb_arr[i]).find('.pcb-submit-time').html());
		pcb.serveTime = parseInt($(pcb_arr[i]).find('.pcb-serve-time').html());
		pcb.priority = parseInt($(pcb_arr[i]).find('.pcb-priority').html());
		pcb.status = $(pcb_arr[i]).find('.pcb-status').html();
		ready_arr.push(pcb);
	}
	return ready_arr;
}

/**
 * 运行进程调度
 * @return {[type]} [description]
 */
function startRun() {
	var run_btn = $('#run_btn'),
		clear_all_btn = $('#clear_all_btn'),
		fcfs_radio = $('#fcfs_radio'),
		rr_radio = $('#rr_radio'),
		sp_radio = $('#sp_radio');

	run_btn.on('click',function() {
		if ($('.pcb').length <=0) {
			return false;
		}

		var ready_arr = getReadyQueue();
		var finish_arr = [];

		if (fcfs_radio.is(':checked')) {
			$('#fcfs_result').html('');//清空原先结果
			methodFCFS(ready_arr,finish_arr,1);
			window.location.href = '#fcfs';//定位
		} else if (rr_radio.is(':checked')) {
			var time_piece = $('#time_piece').val();
			$('#show_time_piece').html(time_piece);
			if (time_piece) {
				$('#rr_result').html('');//清空原先结果
				methodRR(ready_arr,finish_arr,time_piece);
				window.location.href = '#rr';//定位
			} else {
				layer.msg('请填写时间片',{icon: 5,time:2000, shift: 6,function() {}}); 
			}
		} else if (sp_radio.is(':checked')) {
			//按优先数从小到大排序
			/*var length = ready_arr.length;
			for (var i = length - 1;i >= 0;i--) {
				for (var j = 0;j < i;j++) {
					if (ready_arr[j].priority > ready_arr[i].priority) {
						ready_arr.splice(i,0,ready_arr[j]);
						ready_arr.splice(j,1,ready_arr[i+1]);
						ready_arr.splice(i+1,1);
					}
				}
			}*/
			$('#sp_result').html('');//清空原先结果
			methodSP(ready_arr,finish_arr,1);
			window.location.href = '#sp';//定位
		} else {
			console.log('未选择调度算法');
		}
		return false;
	})

	//全部清空
	clear_all_btn.on('click',function() {
		$('#fcfs_result').html('');
		$('#rr_result').html('');
		$('#sp_result').html('');
		$('#show_time_piece').html('');
	})
}

/**
 * 先来先服务算法
 * @param  {[type]} ready_arr  [description]
 * @param  {[type]} finish_arr [description]
 * @return {[type]}            [description]
 */
function methodFCFS(ready_arr,finish_arr,start_time) {
	if (ready_arr.length > 0) {
		var cur_pcb = ready_arr[0],
			serve_time = cur_pcb.serveTime;

		//设置当前进程为运行状态
		cur_pcb.status = 'R';

		//各进程开始时间、完成时间
		cur_pcb.startTime = start_time;
		cur_pcb.finishTime = cur_pcb.startTime + cur_pcb.serveTime;
		//下一个进程的开始时间（当前进程的完成时间 = 下一进城的开始时间）
		var bft = cur_pcb.finishTime;

		//从就绪队列中撤销当前进程
		ready_arr.splice(0,1);
		//运行时间
		cur_pcb.runTime = '0 → ' + serve_time;
		//创建显示运行进程、就绪队列、各进程PCB的html
		createContentHtml('fcfs_result');
		//插入结果的目标html
		var aim_list = $('#fcfs_result').find('.layui-colla-item'),
			aim_length = aim_list.length,
			aim = aim_list[aim_length - 1];
		//输出运行进程
		var tr = createTr(cur_pcb,cur_pcb.runTime);
		$($(aim).find('.running-pcb')[0]).append(tr);
		//更新面板
		window.initElement();
		//输出就绪队列
		for (var i = 0; i < ready_arr.length;i++) {
			var inner_html = createTr(ready_arr[i],ready_arr[i].runTime);
			$($(aim).find('.ready-pcb')[0]).append(inner_html);
		}
		
		//将完成进程加入完成队列
		cur_pcb.runTime = serve_time;
		cur_pcb.status = 'F';
		finish_arr.push(cur_pcb);
		
		//输出完成进程的PCB
		for (var i = 0;i < finish_arr.length;i++) {
			var inner_html = createTr(finish_arr[i],finish_arr[i].runTime);
			$($(aim).find('.all-pcb')[0]).append(inner_html);
		}
		//输出就绪队列的PCB
		if (ready_arr.length > 0) {
			ready_arr[0].status = 'R';
			for (var i = 0;i < ready_arr.length;i++) {
				var inner_html = createTr(ready_arr[i],ready_arr[i].runTime);
				$($(aim).find('.all-pcb')[0]).append(inner_html);
			}
		}
		//遍历调用直至所有进程完成
		methodFCFS(ready_arr,finish_arr,bft);
	} else {
		return false;
	}
}

/**
 * 简单时间片轮转法
 * @param  {[type]} ready_arr  [description]
 * @param  {[type]} finish_arr [description]
 * @param  {[type]} time_piece [description]
 * @return {[type]}            [description]
 */
function methodRR(ready_arr,finish_arr,time_piece) {
	if (ready_arr.length > 0) {
		var cur_pcb = ready_arr[0],
			serve_time = cur_pcb.serveTime,//服务时间
			run_time = cur_pcb.runTime,//已运行时间
			need_time = serve_time - run_time;//还需要多少时间
			cur_pcb.status = 'R';

		createContentHtml('rr_result');//结果容器

		window.initElement();//更新面板

		var aim_list = $('#rr_result').find('.layui-colla-item'),
			aim_length = aim_list.length,
			aim = aim_list[aim_length - 1];

		if (need_time <= time_piece) {
			for (var i = 0;i <= need_time;i++) {
				var running_pcb_html = createTr(cur_pcb,cur_pcb.runTime + i);
				$($(aim).find('.running-pcb')[0]).append(running_pcb_html);//输出运行进程
			}
			cur_pcb.runTime += need_time;//更新已运行时间
			cur_pcb.status = 'F';//更新状态
			finish_arr.push(cur_pcb);//已完成进程加入完成数组
			ready_arr.splice(0,1);//从就绪队列中撤销已完成进程

			for (var i = 0; i < ready_arr.length;i++) {
				var waiting_pcb_html = createTr(ready_arr[i],ready_arr[i].runTime);
				$($(aim).find('.ready-pcb')[0]).append(waiting_pcb_html);//输出就绪队列
			}

		} else {
			for (var i = 0;i <= time_piece;i++) {
				var running_pcb_html = createTr(cur_pcb,cur_pcb.runTime + i);
				$($(aim).find('.running-pcb')[0]).append(running_pcb_html);//输出运行进程
			}

			cur_pcb.status = 'W';
			ready_arr.splice(0,1);

			for (var i = 0; i < ready_arr.length;i++) {
				var waiting_pcb_html = createTr(ready_arr[i],ready_arr[i].runTime);
				$($(aim).find('.ready-pcb')[0]).append(waiting_pcb_html);//输出就绪队列
			}

			cur_pcb.runTime += parseInt(time_piece);
			ready_arr.push(cur_pcb);
		}

		if (finish_arr.length > 0) {
			for (var i = 0;i < finish_arr.length;i++) {
				var finish_pcb_html = createTr(finish_arr[i],finish_arr[i].runTime);
				$($(aim).find('.all-pcb')[0]).append(finish_pcb_html);//输出PCB
			}
		}
		
		if (ready_arr.length > 0) {
			ready_arr[0].status = 'R';
			for (var i = 0;i < ready_arr.length;i++) {
				var ready_pcb_html = createTr(ready_arr[i],ready_arr[i].runTime);
				$($(aim).find('.all-pcb')[0]).append(ready_pcb_html);//输出PCB
			}
		}

		methodRR(ready_arr,finish_arr,time_piece);

	} else {
		return false;
	}
}

/**
 * 静态优先权调度算法
 * @param  {[type]} ready_arr  [description]
 * @param  {[type]} finish_arr [description]
 * @return {[type]}            [description]
 */
function methodSP(ready_arr,finish_arr,before_finish_time) {
	if (ready_arr.length > 0) {
		var cur_pcb = ready_arr[0],
			serve_time = cur_pcb.serveTime;

		//设置当前进程为运行状态
		cur_pcb.status = 'R';
		//当前进程的开始时间、完成时间
		cur_pcb.startTime = before_finish_time;
		cur_pcb.finishTime = cur_pcb.startTime + serve_time;
		//下一个进程的开始时间
		var bft = cur_pcb.finishTime;

		//从就绪队列中撤销当前进程
		ready_arr.splice(0,1);

		cur_pcb.runTime = '0 → ' + serve_time;
		
		createContentHtml('sp_result');

		var aim_list = $('#sp_result').find('.layui-colla-item'),
			aim_length = aim_list.length,
			aim = aim_list[aim_length - 1];

		//输出运行进程
		var tr = createTr(cur_pcb,cur_pcb.runTime);
		$($(aim).find('.running-pcb')[0]).append(tr);

		window.initElement();//更新面板

		//输出就绪队列
		for (var i = 0; i < ready_arr.length;i++) {
			var inner_html = createTr(ready_arr[i],ready_arr[i].runTime);
			$($(aim).find('.ready-pcb')[0]).append(inner_html);
		}

		cur_pcb.runTime = serve_time;
		cur_pcb.status = 'F';

		finish_arr.push(cur_pcb);
		//输出完成进程的PCB
		if (finish_arr.length > 0) {
			for (var i = 0;i < finish_arr.length;i++) {
				var inner_html = createTr(finish_arr[i],finish_arr[i].runTime);
				$($(aim).find('.all-pcb')[0]).append(inner_html);
			}
		}

		var sp_arr = [],//存放在当前进程被调度期间到达的作业
			index1 = [],//记录到达进程在ready_arr中的索引
			index2 = 0,//记录优先数最小的进程在sp_arr中的索引
			min_priority = 0;//最小优先数

		for (var i = 0;i < ready_arr.length;i++) {
			if (ready_arr[i].submitTime <= bft) {
				sp_arr.push(ready_arr[i]);
				index1.push(i);
			}
		}

		if (sp_arr.length > 0) {
			min_priority = sp_arr[0].priority;
			for (var i = 1;i < sp_arr.length;i++) {
				if (sp_arr[i].priority < min_priority) {
					index2 = i;
					min_priority = sp_arr[i].priority;
				}
			}
			//更新ready_arr
			ready_arr.splice(index1[index2],1);
			ready_arr.splice(0,0,sp_arr[index2]);
		}

		//输出就绪队列的PCB
		if (ready_arr.length > 0) {
			ready_arr[0].status = 'R';
			for (var i = 0;i < ready_arr.length;i++) {
				var inner_html = createTr(ready_arr[i],ready_arr[i].runTime);
				$($(aim).find('.all-pcb')[0]).append(inner_html);
			}
		}

		methodSP(ready_arr,finish_arr,bft);
	} else {
		return false;
	}
}

/**
 * 每次调度显示结果的html容器
 * @param  {[type]} insertId [description]
 * @return {[type]}          [description]
 */
function createContentHtml(insertId) {
	var inner_html = $('<div class="layui-colla-item">' +
							'<h2 class="layui-colla-title" style="color:#c2c2c2;background-color:#393D49;">第' + ($('#'+insertId).find('.layui-colla-item').length +1) + '次调度</h2>' +
							'<div class="layui-colla-content layui-show">' +
								'<div class="print-text">运行进程：</div>' +
								'<table class="layui-table method-result">' +
									'<colgroup>' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col>' +
									'</colgroup>' +
									'<thead>' +
										'<tr>' +
											'<td>进程名称</td>' +
											'<td>提交时间</td>' +
											'<td>服务时间</td>' +
											'<td>已运行时间</td>' +
											'<td>优先数</td>' +
											'<td>状态</td>' +
										'</tr>' +
									'</thead>' +
									'<tbody class="running-pcb">' +
									'</tbody>' +
								'</table>' +
								'<div class="print-text">就绪队列：</div>' +
								'<table class="layui-table method-result">' +
									'<colgroup>' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col>' +
									'</colgroup>' +
									'<thead>' +
										'<tr>' +
											'<td>进程名称</td>' +
											'<td>提交时间</td>' +
											'<td>服务时间</td>' +
											'<td>已运行时间</td>' +
											'<td>优先数</td>' +
											'<td>状态</td>' +
										'</tr>' +
									'</thead>' +
									'<tbody class="ready-pcb">' +
									'</tbody>' +
								'</table>' +
								'<div class="print-text">各个进程的PCB：(上一次下一次调度切换时刻)</div>' +
								'<table class="layui-table method-result">' +
									'<colgroup>' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col width="120">' +
										'<col>' +
									'</colgroup>' +
									'<thead>' +
										'<tr>' +
											'<td>进程名称</td>' +
											'<td>提交时间</td>' +
											'<td>服务时间</td>' +
											'<td>已运行时间</td>' +
											'<td>优先数</td>' +
											'<td>状态</td>' +
										'</tr>' +
									'</thead>' +
									'<tbody class="all-pcb">' +
									'</tbody>' +
								'</table>' +
							'</div>' +
						'</div>');
	$('#'+insertId).append(inner_html);
}

/**
 * 单个PCB数据的html
 * @param  {[type]} obj     [description]
 * @param  {[type]} runTime [description]
 * @return {[type]}         [description]
 */
function createTr(obj,runTime) {
	var tr = $('<tr>' +
					'<td>' + obj.name + '</td>' +
					'<td>' + obj.submitTime + '</td>' +
					'<td>' + obj.serveTime + '</td>' +
					'<td>' + runTime + '</td>' +
					'<td>' + obj.priority + '</td>' +
					'<td>' + obj.status + '</td>' +
				'</tr>');
	return tr;
}