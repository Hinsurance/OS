$(function() {
	var btn = $('#submit_btn');

	var Avaliable = [3,3,2],//当前可用资源
		//各进程对A B C 类资源的最大需求量
		Max = [
				[7,5,3],
				[3,2,2],
				[9,0,2],
				[2,2,2],
				[4,3,3]
			],
		//各进程现已分配的A B C 类资源数量
		Allocation = [
				[0,1,0],
				[2,0,0],
				[3,0,2],
				[2,1,1],
				[0,0,2]
			],
		//各进程仍需要的A B C 类资源数量
		Need = [
				[7,4,3],
				[1,2,2],
				[6,0,0],
				[0,1,1],
				[4,3,1]
			];

	btn.on('click',function() {
		var options = $('.option-item');//进程的可选项
		var cur_process;//当前选择的进程序号
		var request_a = 0,//请求资源A
			request_b = 0,//请求资源B
			request_c = 0,//请求资源C
			request_arr = [];//请求的资源数组

		//请求资源的进程
		for (var i = 0;i < options.length;i++) {
			if ($(options[i]).is(':selected')) {
				cur_process = $(options[i]).val();
			}
		}
		
		//请求的资源数量
		request_a = parseInt($('#resource_A').val());
		request_b = parseInt($('#resource_B').val());
		request_c = parseInt($('#resource_C').val());
		if (request_a || request_a === 0) {
			request_arr.push(request_a);
		}
		if (request_b || request_b === 0) {
			request_arr.push(request_b);
		}
		if (request_c || request_c === 0) {
			request_arr.push(request_c);
		}
		
		//console.log(request_arr);
		
		if (request_arr.length >= 3) {
			if (request_arr[0] <= Need[cur_process][0] && request_arr[1] <= Need[cur_process][1] && request_arr[2] <= Need[cur_process][2]) {
				if (request_arr[0] <= Avaliable[0] && request_arr[1] <= Avaliable[1] && request_arr[2] <= Avaliable[2]) {

					//系统假定可为进程分配资源，并修改Avaliable,Allocation和Need
					Avaliable[0] -= request_arr[0];
					Avaliable[1] -= request_arr[1];
					Avaliable[2] -= request_arr[2];
					Allocation[cur_process][0] += request_arr[0];
					Allocation[cur_process][1] += request_arr[1];
					Allocation[cur_process][2] += request_arr[2];
					Need[cur_process][0] -= request_arr[0];
					Need[cur_process][1] -= request_arr[1];
					Need[cur_process][2] -= request_arr[2];

					var Work = [];
					for (var i = 0;i < Avaliable.length;i++) {
						Work[i] = Avaliable[i];
					}

					var Finish = [false,false,false,false,false];
					var safe_arr = [];

					//利用安全性算法检查当前状态是否安全
					checkSafe();
					function checkSafe() {
						for (var i = 0;i < 5;i++) {
							if (Finish[i] === false) {
								if (Need[i][0] <= Work[0] && Need[i][1] <= Work[1] && Need[i][2] <= Work[2]) {
									Work[0] += Allocation[i][0];
									Work[1] += Allocation[i][1];
									Work[2] += Allocation[i][2];
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
					if (Finish[0] && Finish[1] && Finish[2] && Finish[3] && Finish[4]) {
						//layer.msg('分配成功',{icon: 6,time:3000, shift: 6,function() {}});
						var result = $('<blockquote class="layui-elem-quote quote-item">安全序列：P'+safe_arr[0]+',P'+safe_arr[1]+',P'+safe_arr[2]+',P'+safe_arr[3]+',P'+safe_arr[4]+'</blockquote>'+
					'当前资源分配表：'+
					'<table class="layui-field-box layui-table method-result">'+
						'<colgroup>'+
							'<col>'+
							'<col width="120">'+
							'<col width="120">'+
							'<col width="120">'+
							'<col width="120">'+
						'</colgroup>'+
						'<thead>'+
							'<tr>'+
								'<td>进程</td>'+
								'<td>'+
									'Max'+
									'<p>'+
										'<span class="resource-span">A</span>'+
										'<span class="resource-span">B</span>'+
										'<span class="resource-span">C</span>'+
									'</p>'+
								'</td>'+
								'<td>'+
									'Allocation'+
									'<p>'+
										'<span class="resource-span">A</span>'+
										'<span class="resource-span">B</span>'+
										'<span class="resource-span">C</span>'+
									'</p>'+
								'</td>'+
								'<td>'+
									'Need'+
									'<p>'+
										'<span class="resource-span">A</span>'+
										'<span class="resource-span">B</span>'+
										'<span class="resource-span">C</span>'+
									'</p>'+
								'</td>'+
								'<td>'+
									'Avaliable'+
									'<p>'+
										'<span class="resource-span">A</span>'+
										'<span class="resource-span">B</span>'+
										'<span class="resource-span">C</span>'+
									'</p>'+
								'</td>'+
							'</tr>'+
						'</thead>'+
						'<tbody>'+
							'<tr>'+
								'<td>P0</td>'+
								'<td>'+
									'<span class="resource-span">'+Max[0][0]+'</span>'+
									'<span class="resource-span">'+Max[0][1]+'</span>'+
									'<span class="resource-span">'+Max[0][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Allocation[0][0]+'</span>'+
									'<span class="resource-span">'+Allocation[0][1]+'</span>'+
									'<span class="resource-span">'+Allocation[0][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Need[0][0]+'</span>'+
									'<span class="resource-span">'+Need[0][1]+'</span>'+
									'<span class="resource-span">'+Need[0][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Avaliable[0]+'</span>'+
									'<span class="resource-span">'+Avaliable[1]+'</span>'+
									'<span class="resource-span">'+Avaliable[2]+'</span>'+
								'</td>'+
							'</tr>'+
							'<tr>'+
								'<td>P1</td>'+
								'<td>'+
									'<span class="resource-span">'+Max[1][0]+'</span>'+
									'<span class="resource-span">'+Max[1][1]+'</span>'+
									'<span class="resource-span">'+Max[1][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Allocation[1][0]+'</span>'+
									'<span class="resource-span">'+Allocation[1][1]+'</span>'+
									'<span class="resource-span">'+Allocation[1][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Need[1][0]+'</span>'+
									'<span class="resource-span">'+Need[1][1]+'</span>'+
									'<span class="resource-span">'+Need[1][2]+'</span>'+
								'</td>'+
								'<td></td>'+
							'</tr>'+
							'<tr>'+
								'<td>P2</td>'+
								'<td>'+
									'<span class="resource-span">'+Max[2][0]+'</span>'+
									'<span class="resource-span">'+Max[2][1]+'</span>'+
									'<span class="resource-span">'+Max[2][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Allocation[2][0]+'</span>'+
									'<span class="resource-span">'+Allocation[2][1]+'</span>'+
									'<span class="resource-span">'+Allocation[2][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Need[2][0]+'</span>'+
									'<span class="resource-span">'+Need[2][1]+'</span>'+
									'<span class="resource-span">'+Need[2][2]+'</span>'+
								'</td>'+
								'<td></td>'+
							'</tr>'+
							'<tr>'+
								'<td>P3</td>'+
								'<td>'+
									'<span class="resource-span">'+Max[3][0]+'</span>'+
									'<span class="resource-span">'+Max[3][1]+'</span>'+
									'<span class="resource-span">'+Max[3][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Allocation[3][0]+'</span>'+
									'<span class="resource-span">'+Allocation[3][1]+'</span>'+
									'<span class="resource-span">'+Allocation[3][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Need[3][0]+'</span>'+
									'<span class="resource-span">'+Need[3][1]+'</span>'+
									'<span class="resource-span">'+Need[3][2]+'</span>'+
								'</td>'+
								'<td></td>'+
							'</tr>'+
							'<tr>'+
								'<td>P4</td>'+
								'<td>'+
									'<span class="resource-span">'+Max[4][0]+'</span>'+
									'<span class="resource-span">'+Max[4][1]+'</span>'+
									'<span class="resource-span">'+Max[4][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Allocation[4][0]+'</span>'+
									'<span class="resource-span">'+Allocation[4][1]+'</span>'+
									'<span class="resource-span">'+Allocation[4][2]+'</span>'+
								'</td>'+
								'<td>'+
									'<span class="resource-span">'+Need[4][0]+'</span>'+
									'<span class="resource-span">'+Need[4][1]+'</span>'+
									'<span class="resource-span">'+Need[4][2]+'</span>'+
								'</td>'+
								'<td></td>'+
							'</tr>'+
						'</tbody>'+
					'</table>');
					$('#success_result').append(result);
					} else {
						//系统回收假定可分配时分配的资源
						Avaliable[0] += request_arr[0];
						Avaliable[1] += request_arr[1];
						Avaliable[2] += request_arr[2];
						Allocation[cur_process][0] -= request_arr[0];
						Allocation[cur_process][1] -= request_arr[1];
						Allocation[cur_process][2] -= request_arr[2];
						Need[cur_process][0] += request_arr[0];
						Need[cur_process][1] += request_arr[1];
						Need[cur_process][2] += request_arr[2];

						for (var i = 0;i < Avaliable.length;i++) {
							Work[i] = Avaliable[i];
						}

						layer.msg('当前状态不安全,系统不分配资源',{icon: 2,time:3000, shift: 6,function() {}});
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