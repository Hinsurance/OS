$(function() {
	//初始化请求进程的选择框
	initProcess();
	//初始化请求资源输入框
	initResourcesInput();
	//初始化资源分配表
	$('#initial_table').append(initInitialTable());

	var btn = $('#submit_btn');

	btn.on('click',function() {
		var options = $('.option-item');//进程的可选项
		var cur_process;//当前选择的进程序号
		var request_arr = [];//请求的资源数组

		//请求资源的进程
		for (var i = 0;i < options.length;i++) {
			if ($(options[i]).is(':selected')) {
				cur_process = $(options[i]).val();
			}
		}

		//请求的资源数量
		var inputs = $('.resources-item');
		for (var i = 0;i < inputs.length;i++) {
			var request = parseInt($(inputs[i]).val());
			if (request || request === 0) {
				request_arr.push(request);
			}
		}
		
		//若request_arr.length < inputs.length,说明有必填项没填
		if (request_arr.length >= inputs.length) {
			if(compareAll(request_arr,Need[cur_process],Avaliable.length)) {
				if (compareAll(request_arr,Avaliable,Avaliable.length)) {
					//系统假定可为进程分配资源，并修改Avaliable,Allocation和Need
					// Avaliable[0] -= request_arr[0];
					// Avaliable[1] -= request_arr[1];
					// Avaliable[2] -= request_arr[2];
					for (var i = 0;i < Avaliable.length;i++) {
						Avaliable[i] -= request_arr[i];
					}

					// Allocation[cur_process][0] += request_arr[0];
					// Allocation[cur_process][1] += request_arr[1];
					// Allocation[cur_process][2] += request_arr[2];
					for (var i = 0;i < Avaliable.length;i++) {
						Allocation[cur_process][i] += request_arr[i];
					}

					// Need[cur_process][0] -= request_arr[0];
					// Need[cur_process][1] -= request_arr[1];
					// Need[cur_process][2] -= request_arr[2];
					for (var i = 0;i < Avaliable.length;i++) {
						Need[cur_process][i] -= request_arr[i];
					}

					//此处不能直接 Work = Avaliable,否则两者操作的是同一数组，会影响到Avaliable
					var Work = [];
					for (var i = 0;i < Avaliable.length;i++) {
						Work[i] = Avaliable[i];
					}

					var Finish = [];
					for (var i = 0;i < Max.length;i++) {
						Finish.push(false);
					}

					var safe_arr = [];

					//利用安全性算法检查当前状态是否安全
					checkSafe();
					function checkSafe() {
						for (var i = 0;i < Max.length;i++) {
							if (Finish[i] === false) {
								//if (Need[i][0] <= Work[0] && Need[i][1] <= Work[1] && Need[i][2] <= Work[2]) {
								if (compareAll(Need[i],Work,Avaliable.length)) {
									// Work[0] += Allocation[i][0];
									// Work[1] += Allocation[i][1];
									// Work[2] += Allocation[i][2];
									for (var j = 0;j < Avaliable.length;j++) {
										Work[j] += Allocation[i][j];
									}
									Finish[i] = true;
									safe_arr.push(i);
									checkSafe();
								} else {
									continue;
								}
							} else {
								continue;
							}
						}
					}
					//if (Finish[0] && Finish[1] && Finish[2] && Finish[3] && Finish[4]) {
					if (allTrue(Finish)) {
						//layer.msg('分配成功',{icon: 6,time:3000, shift: 6,function() {}});
						var result = $('<blockquote class="layui-elem-quote quote-item">安全序列：P'+safe_arr[0]+',P'+safe_arr[1]+',P'+safe_arr[2]+',P'+safe_arr[3]+',P'+safe_arr[4]+'</blockquote>'+
					'当前资源分配表：'+initInitialTable());
					$('#success_result').append(result);
					} else {
						//该请求使得系统进入不安全状态，系统回收假定可分配时分配的资源
						// Avaliable[0] += request_arr[0];
						// Avaliable[1] += request_arr[1];
						// Avaliable[2] += request_arr[2];
						for (var i = 0;i < Avaliable.length;i++) {
							Avaliable[i] += request_arr[i];
						}
						// Allocation[cur_process][0] -= request_arr[0];
						// Allocation[cur_process][1] -= request_arr[1];
						// Allocation[cur_process][2] -= request_arr[2];
						for (var i = 0;i < Avaliable.length;i++) {
							Allocation[cur_process][i] -= request_arr[i];
						}
						// Need[cur_process][0] += request_arr[0];
						// Need[cur_process][1] += request_arr[1];
						// Need[cur_process][2] += request_arr[2];
						for (var i = 0;i < Avaliable.length;i++) {
							Need[cur_process][i] += request_arr[i];
						}

						for (var i = 0;i < Avaliable.length;i++) {
							Work[i] = Avaliable[i];
						}

						layer.msg('该状态不安全,系统不分配资源',{icon: 2,time:3000, shift: 6,function() {}});
						return false;				
					}
				} else {
					layer.msg('当前可用资源不足',{icon: 0,time:3000, shift: 6,function() {}});
					return false;
				}
			} else {
				layer.msg('请求资源超过进程的最大需求量',{icon: 5,time:3000, shift: 6,function() {}});
				return false;
			}
		}
	})
})

/**
 * 初始化请求的进程选择框
 * @return {[type]} [description]
 */
function initProcess() {
	
	var process_num = Max.length;
	var p_inner_html = '<option value="" class="option-item"></option>';
	for (var i = 0;i < process_num;i++) {
		p_inner_html += '<option value="'+i+'" class="option-item">P'+i+'</option>';
	}
	$('#process').append($(p_inner_html));
}

/**
 * 初始化请求的资源输入框
 * @return {[type]} [description]
 */
function initResourcesInput() {
	var resources_num = Avaliable.length;
	var r_inner_html = '';
	var alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	for (var i = 0;i < resources_num;i++) {
		r_inner_html += '<input type="text" name="'+alphabet[i]+'" required  lay-verify="required" placeholder="请求'+alphabet[i]+'类资源数量" autocomplete="off" class="layui-input resources-item" id="resource_'+alphabet[i]+'">';
	}
	$('#request_resources_input').append($(r_inner_html));
}

/**
 * 创建资源分配表
 * @return {[type]} [description]
 */
function initInitialTable() {
	var n = Max.length,//进程数
		m = Avaliable.length;//资源数
	
	var thead = '';
	thead = '<thead>'+
				'<tr>'+
					'<td>进程</td>'+
					'<td>'+
						'Max'+
						'<p>'+
							createTHeadResource(m)+
						'</p>'+
					'</td>'+
					'<td>'+
						'Allocation'+
						'<p>'+
							createTHeadResource(m)+
						'</p>'+
					'</td>'+
					'<td>'+
						'Need'+
						'<p>'+
							createTHeadResource(m)+
						'</p>'+
					'</td>'+
					'<td>'+
						'Avaliable'+
						'<p>'+
							createTHeadResource(m)+
						'</p>'+
					'</td>'+
				'</tr>'+
			'</thead>';
	
	var tbody = $('<tbody id="initial_table_tbody"></tbody>');
	for (var i = 0;i < n;i++) {
		var tr = '<tr>'+
					'<td>P'+i+'</td>'+
					'<td>'+
						createMANA(i,m,Max)+
					'</td>'+
					'<td>'+
						createMANA(i,m,Allocation)+
					'</td>'+
					'<td>'+
						createMANA(i,m,Need)+
					'</td>'+
					'<td>'+
						createAvaliable(i,m)+
					'</td>'+
				'</tr>';
		tbody.append(tr);
	}

	var table = '<table class="layui-field-box layui-table method-result">'+
						'<colgroup>'+
							'<col>'+
							'<col width="120">'+
							'<col width="120">'+
							'<col width="120">'+
							'<col width="120">'+
						'</colgroup>'+
						thead+
						tbody.html()+
					'</table>';
	return table;
	//$('#'+table_id).append(table);
}

/**
 * 创建表头
 * @param  {[type]} m [description]
 * @return {[type]}   [description]
 */
function createTHeadResource(m) {
	var html = '';
	var alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	for (var i = 0;i < m;i++) {
		html += '<span class="resource-span">'+alphabet[i]+'</span>';
	}
	return html;
}

/**
 * 创建表格中的Max Allocation Need
 * @param  {[type]} n   第几个进程
 * @param  {[type]} m   资源种类数
 * @param  {[type]} MAN M:Max  A:Allocation  N:Need
 * @return {[type]}     html
 */
function createMANA(n,m,MAN) {
	var html = '';
	for (var i = 0;i < m;i++) {
		html += '<span class="resource-span">'+MAN[n][i]+'</span>';
	}
	return html;
}

/**
 * 创建表格中的Max信息
 * @param  {[type]} n [description]
 * @param  {[type]} m [description]
 * @return {[type]}   [description]
 */
// function createMax(n,m) {
// 	var html = '';
// 	for (var i = 0;i < m;i++) {
// 		html += '<span class="resource-span">'+Max[n][i]+'</span>';
// 	}
// 	return html;
// }

/**
 * 创建表格中的Allocation信息
 * @param  {[type]} n [description]
 * @param  {[type]} m [description]
 * @return {[type]}   [description]
 */
// function createAllocation(n,m) {
// 	var html = '';
// 	for (var i = 0;i < m;i++) {
// 		html += '<span class="resource-span">'+Allocation[n][i]+'</span>';
// 	}
// 	return html;
// }

/**
 * 创建表格中的Need信息
 * @param  {[type]} n [description]
 * @param  {[type]} m [description]
 * @return {[type]}   [description]
 */
// function createNeed(n,m) {
// 	var html = '';
// 	for (var i = 0;i < m;i++) {
// 		html += '<span class="resource-span">'+Need[n][i]+'</span>';
// 	}
// 	return html;
// }

/**
 * 创建表格中的Avaliable信息
 * @param  {[type]} n [description]
 * @param  {[type]} m [description]
 * @return {[type]}   [description]
 */
function createAvaliable(n,m) {
	if (n === 0) {
		var html = '';
		for (var i = 0;i < m;i++) {
			html += '<span class="resource-span">'+Avaliable[i]+'</span>';
		}
		return html;
	}
	else {
		return '';
	}
}

/**
 * 比较请求资源数量是否超过最大需求量
 * 比较请求资源数量是否少于当前可分配资源数量
 * @param  {Array} a 请求资源数量Request
 * @param  {Array} b Need或Avaliable
 * @param  {Number} m 资源种类数目
 * @return {Boolean}   true表示满足要求,false表示不满足
 */
function compareAll(a,b,m) {
	//var count = 0;
	for (var i = 0;i < m;i++) {
		if (a[i] <= b[i]) {
			continue;
		} else {
			return false;
		}
	}
	return true;
}

/**
 * 判断是否所有进程finish均为true，是则存在安全序列
 * @param  {[type]} finish [description]
 * @return {[type]}        [description]
 */
function allTrue(finish) {
	for (var i = 0;i < finish.length;i++) {
		if (finish[i]) {
			continue;
		} else {
			return false;
		}
	}
	return true;
}
