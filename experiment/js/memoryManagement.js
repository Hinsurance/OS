$(function() {
	//空闲分区表
	var memory_block_arr = [//分区大小,分区始址,状态
								[80,85,'空闲'],
								[32,175,'空闲'],
								[70,275,'空闲'],
								[60,532,'空闲'],
								[55,603,'空闲']
							],
		job_arr = [//作业大小,状态,内存起始地址,分配内存大小
					[24,'未分配','',0],
					[80,'未分配','',0],
					[55,'未分配','',0],
					[3,'未分配','',0],
					[28,'未分配','',0]
				  ];
	//显示空闲分区表
	showTable(memory_block_arr,'memory_block_table_tbody');
	//显示作业分配情况
	showJobTable(job_arr);

	var start_btn = $('#start_btn'),//开始分配按钮
		recycle_btn = $('#recycle_btn'),//回收按钮
		reset_btn = $('#reset_btn');//重置按钮

	//开始分配
	start_btn.on('click',function() {
		var method = '',//选择的算法
			inputs = $('input[name="memoryMethod"]');

		var size = 1;//不再切割的剩余分区大小

		for (var i = 0;i < inputs.length;i++) {
			if ($(inputs[i]).is(':checked')) {
				method = $(inputs[i]).val();
			}
		}

		if (method === 'FF') {//首次适应
			memorySort(memory_block_arr,1);
			jobSetMemory(job_arr,memory_block_arr,size);
			
		} else if (method === 'NF') {//循环首次适应
			memorySort(memory_block_arr,1);
			var next_index = 0;//起始查寻指针，用于指示下一次起始查寻的空闲分区
			
			for (var i = 0;i < job_arr.length;i++) {
				if (job_arr[i][1] === '未分配') {
					for (var j = next_index;j < memory_block_arr.length;j++) {
						if (job_arr[i][0] <= memory_block_arr[j][0]) {

							job_arr[i][1] = '已分配';//修改作业状态为已分配
							job_arr[i][2] = memory_block_arr[j][1];//作业在内存中的起始地址

							if (memory_block_arr[j][0] - job_arr[i][0] <= size) {
								job_arr[i][3] = memory_block_arr[j][0];//作业得到比自己需求大的分区！！
								memory_block_arr.splice(j,1);//将已分配出去的内存块从空闲分区表中去除
							} else {
								job_arr[i][3] = job_arr[i][0];
								memory_block_arr[j][0] -= job_arr[i][0];//修改内存块大小
								memory_block_arr[j][1] += job_arr[i][0];//修改首指
							}
							next_index = j + 1;
							if (next_index >= memory_block_arr.length) {//若在最后一个空闲分区分配，则下一分配应该回到第零块
								next_index = 0;
							}
							break;//内存块符合作业要求，无需检查下一个内存块
						} else {
							continue;//当前内存块大小不合适，检查下一个内存块
						}
					}
					if (next_index > 0 && job_arr[i][1] === '未分配') {
						for (var j = 0;j < next_index;j++) {
							if (job_arr[i][0] <= memory_block_arr[j][0]) {

								job_arr[i][1] = '已分配';//修改作业状态为已分配
								job_arr[i][2] = memory_block_arr[j][1];//作业在内存中的起始地址

								if (memory_block_arr[j][0] - job_arr[i][0] <= size) {
									job_arr[i][3] = memory_block_arr[j][0];//作业得到比自己需求大的分区！！
									memory_block_arr.splice(j,1);//将已分配出去的内存块从空闲分区表中去除
								} else {
									job_arr[i][3] = job_arr[i][0];
									memory_block_arr[j][0] -= job_arr[i][0];//修改内存块大小
									memory_block_arr[j][1] += job_arr[i][0];//修改首指
								}
								next_index = j + 1;
								if (next_index >= memory_block_arr.length) {//若在最后一个空闲分区分配，则下一分配应该回到第零块
									next_index = 0;
								}
								break;//内存块符合作业要求，无需检查下一个内存块
							} else {
								continue;//当前内存块大小不合适，检查下一个内存块
							}
						}
					}
					continue;
				} else {
					continue;//当前作业已分配，继续检查下一个作业
				}
			}
			//更新空闲分区表、作业情况表
			showTable(memory_block_arr,'memory_block_table_tbody');
			showJobTable(job_arr);

		} else if (method === 'BF') {//最佳适应
			//按分区从小到大排序
			memorySort(memory_block_arr,0);
			jobSetMemory(job_arr,memory_block_arr,size);

		} else if (method === 'WF') {//最坏适应
			
			for (var i = 0;i < job_arr.length;i++) {
				if (job_arr[i][1] === '未分配') {
					//按分区从大到小排序,每次都要找到最大的分区
					memorySort(memory_block_arr,0);
					memory_block_arr.reverse();

					if (job_arr[i][0] <= memory_block_arr[0][0]) {

						job_arr[i][1] = '已分配';//修改作业状态为已分配
						job_arr[i][2] = memory_block_arr[0][1];//作业在内存中的起始地址

						if (memory_block_arr[0][0] - job_arr[i][0] <= size) {
							job_arr[i][3] = memory_block_arr[0][0];//作业得到比自己需求大的分区！！
							memory_block_arr.splice(0,1);//将已分配出去的内存块从空闲分区表中去除
						} else {
							job_arr[i][3] = job_arr[i][0];
							memory_block_arr[0][0] -= job_arr[i][0];//修改内存块大小
							memory_block_arr[0][1] += job_arr[i][0];//修改首指
						}
					}
				}
				continue;//当前作业已分配，继续检查下一个作业	
			}
			//更新空闲分区表、作业情况表
			showTable(memory_block_arr,'memory_block_table_tbody');
			showJobTable(job_arr);
		}
	});

	//回收资源
	recycle_btn.on('click',function() {
		memorySort(memory_block_arr,1);//空闲分区按首地址从小到大排序
		var length = job_arr.length;
		for (var i = 0;i < length;i++) {
			if (job_arr[i][1] === '已分配') {//当前作业已分配，对其进行回收

				//找到当前回收区在空闲表中的插入点，即判断回收区内存起始地址在空闲分区哪个位置
				var job_index = -1;
				for (var j = 0;j < memory_block_arr.length;j++) {
					//var that = j;
					if (job_arr[i][2] > memory_block_arr[j][1]) {
						job_index = j;
						continue;//继续检查下一个空闲分区
					} else {
						break;//分区按从小到大排序，故当前不符合则后面的也不符合，直接break
					}
				}

				if (job_index === -1) {//回收区在第一分区前面
					var next_first_addr = job_arr[i][3] + job_arr[i][2];//回收区下一块首地址，用来判断回收区是否与下一空闲分区对接
					if (next_first_addr === memory_block_arr[0][1]) {
						memory_block_arr[0][0] += job_arr[i][0];//更改空闲分区块首地址
						memory_block_arr[0][1] = job_arr[i][2];//更改空闲分区块大小
					} else {//不对接
						var new_memory = [job_arr[i][3],job_arr[i][2],'空闲'];
						memory_block_arr.splice(0,0,new_memory);//加入到空闲分区表，注意插入位置
					}
					job_arr[i][1] = '已回收';

				} else if (job_index === memory_block_arr.length-1) {//回收区在最后分区的后面
					var end_next_addr = memory_block_arr[memory_block_arr.length-1][0] + memory_block_arr[memory_block_arr.length-1][1];
					if (job_arr[i][2] === end_next_addr) {
						memory_block_arr[memory_block_arr.length-1][0] += job_arr[i][3];	
					} else {
						var new_memory = [job_arr[i][3],job_arr[i][2],'空闲'];
						memory_block_arr.push(new_memory);//加入到空闲分区表
					}
					job_arr[i][1] = '已回收';
				} else {
					var prev_end = memory_block_arr[job_index][0] + memory_block_arr[job_index][1],//上一分区末地址+1
						next_start = memory_block_arr[job_index+1][1],//下一分区首地址
						job_end = job_arr[i][2] + job_arr[i][3];

					if (job_arr[i][2] === prev_end && job_end !== next_start) {//只与前一分区对接
						memory_block_arr[job_index][0] += job_arr[i][3];//修改分区大小
						
					} else if (job_arr[i][2] !== prev_end && job_end === next_start) {//只与后一分区对接
						memory_block_arr[job_index+1][0] += job_arr[i][3];//修改分区大小
						memory_block_arr[job_index+1][1] = job_arr[i][2];//修改分区首地址
						
					} else if (job_arr[i][2] === prev_end && job_end === next_start) {//与前后分区都对接
						memory_block_arr[job_index][0] = memory_block_arr[job_index][0] + job_arr[i][3] + memory_block_arr[job_index+1][0];//修改分区大小
						memory_block_arr.splice(job_index+1,1);//后一分区已经并到前一分区
						
					} else {
						var new_memory = [job_arr[i][3],job_arr[i][2],'空闲'];
						memory_block_arr.splice(job_index+1,0,new_memory);
					}
					job_arr[i][1] = '已回收';
				}
			}
			continue;//继续检查下一个作业
		}
		//更新空闲分区表、作业情况表
		showTable(memory_block_arr,'memory_block_table_tbody');
		showJobTable(job_arr);
	});

	//重置
	reset_btn.on('click',function() {
		memory_block_arr = [//分区大小,分区始址,状态
								[80,85,'空闲'],
								[32,175,'空闲'],
								[70,275,'空闲'],
								[60,532,'空闲'],
								[55,603,'空闲']
							];
		job_arr = [//作业大小,状态,内存起始地址
						[24,'未分配','',0],
						[80,'未分配','',0],
						[55,'未分配','',0],
						[3,'未分配','',0],
						[28,'未分配','',0]
				  ];
		//更新空闲分区表、作业情况表
		showTable(memory_block_arr,'memory_block_table_tbody');
		showJobTable(job_arr);
	});
})

/**
 * 显示空闲分区表数据
 * 显示作业表格数据
 * @param  {[type]} arr [description]
 * @param  {[type]} id  [description]
 * @return {[type]}     [description]
 */
function showTable(arr,id) {
	$('#'+id).html('');
	var html = '';
	for (var i = 0;i < arr.length;i++) {
		html += '<tr>'+
					'<td>'+(i+1)+'</td>'+
					'<td>'+arr[i][0]+'</td>'+
					'<td>'+arr[i][1]+'</td>'+
					'<td>'+arr[i][2]+'</td>'+
				'</tr>';
	}
	$('#'+id).append($(html));
}

function showJobTable(job_arr) {
	$('#job_table_tbody').html('');
	var html = '';
	for (var i = 0;i < job_arr.length;i++) {
		html += '<tr>'+
					'<td>'+(i+1)+'</td>'+
					'<td>'+job_arr[i][0]+'</td>'+
					'<td>'+job_arr[i][1]+'</td>'+
					'<td>'+job_arr[i][2]+'</td>'+
					'<td>'+job_arr[i][3]+'</td>'+
				'</tr>';
	}
	$('#job_table_tbody').append($(html));
}

/**
 * 为作业分配内存
 * @param  {[type]} job_arr          [description]
 * @param  {[type]} memory_block_arr [description]
 * @param  {[type]} size             [description]
 * @return {[type]}                  [description]
 */
function jobSetMemory(job_arr,memory_block_arr,size) {
	for (var i = 0;i < job_arr.length;i++) {
		if (job_arr[i][1] === '未分配') {
			for (var j = 0;j < memory_block_arr.length;j++) {
				if (job_arr[i][0] <= memory_block_arr[j][0]) {

					job_arr[i][1] = '已分配';//修改作业状态为已分配
					job_arr[i][2] = memory_block_arr[j][1];//作业在内存中的起始地址

					if (memory_block_arr[j][0] - job_arr[i][0] <= size) {
						job_arr[i][3] = memory_block_arr[j][0];//作业得到比自己需求大的分区！！
						memory_block_arr.splice(j,1);//将已分配出去的内存块从空闲分区表中去除
					} else {
						job_arr[i][3] = job_arr[i][0];
						memory_block_arr[j][0] -= job_arr[i][0];//修改内存块大小
						memory_block_arr[j][1] += job_arr[i][0];//修改首指
					}
					break;//内存块符合作业要求，无需检查下一个内存块
				} else {
					continue;//当前内存块大小不合适，检查下一个内存块
				}
			}
			continue;
		} else {
			continue;//当前作业已分配，继续检查下一个作业
		}
	}
	//更新空闲分区表、作业情况表
	showTable(memory_block_arr,'memory_block_table_tbody');
	showJobTable(job_arr);
}

/**
 * attr=0,按分区大小从小到大排序
 * attr=1,按分区首地址从小到大排序
 * @param  {[type]} memory_block_arr [description]
 * @return {[type]}                  [description]
 */
function memorySort(memory_block_arr,attr) {
	var length = memory_block_arr.length;
	for (var i = length - 1; i >= 0; i--) {
		for (var j = 0;j < i;j++) {
			if (memory_block_arr[j][attr] > memory_block_arr[i][attr]) {
				memory_block_arr.splice(i,0,memory_block_arr[j]);
				memory_block_arr.splice(j,1,memory_block_arr[i+1]);
				memory_block_arr.splice(i+1,1);
			}
		}
	}
}