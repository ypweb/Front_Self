/*admin_member:成员设置*/
(function($){
	'use strict';
	$(function(){
		/*初始化数据*/
		if(public_tool.initMap.isrender){
			/*菜单调用*/
			var logininfo=public_tool.initMap.loginMap;
			public_tool.loadSideMenu(public_vars.$mainmenu,public_vars.$main_menu_wrap,{
				url:'http://120.76.237.100:8082/mall-buzhubms-api/module/menu',
				async:false,
				type:'post',
				param:{
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				},
				datatype:'json'
			});


			/*权限调用*/
			var powermap=public_tool.getPower(),
				useradd_power=public_tool.getKeyPower('bzw-user-add',powermap),
				useredit_power=public_tool.getKeyPower('bzw-user-edit',powermap);



			/*dom引用和相关变量定义*/
			var module_id='bzw-user-add'/*模块id，主要用于本地存储传值*/,
				dia=dialog({
					zIndex:2000,
					title:'温馨提示',
					okValue:'确定',
					width:300,
					ok:function(){
						this.close();
						return false;
					},
					cancel:false
				})/*一般提示对象*/,
				admin_adduser_form=document.getElementById('admin_adduser_form'),
				$admin_adduser_form=$(admin_adduser_form),
				$admin_id=$('#admin_id'),
				$admin_telePhone=$('#admin_telePhone'),
				$admin_password=$('#admin_password'),
				$admin_nickName=$('#admin_nickName'),
				$admin_Name=$('#admin_Name'),
				$admin_sex=$('#admin_sex'),
				$admin_enabled=$('#admin_enabled'),
				$admin_logoImage=$('#admin_logoImage'),
				$admin_action=$('#admin_action'),
				resetform0=null;


			/*上传对象*/
			var logo_QN_Upload=new QiniuJsSDK(),
				ImageUpload_Token=getToken()||null,
				upload_bars= [];


			/*重置表单*/
			admin_adduser_form.reset();


			/*绑定logo上传*/
			if(ImageUpload_Token!==null){
				logo_QN_Upload.uploader({
					runtimes: 'html5,html4,flash,silverlight',
					browse_button: 'admin_logoImage_file',
					uptoken :ImageUpload_Token.qiniuToken,// uptoken是上传凭证，由其他程序生成
					multi_selection:false,
					get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
					unique_names:false,// 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
					save_key:false,//默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
					domain:ImageUpload_Token.qiniuDomain,//bucket域名，下载资源时用到，必需
					flash_swf_url: '../../js/plugins/plupload/Moxie.swf',//引入flash，相对路径
					silverlight_xap_url : '../../js/plugins/plupload/Moxie.xap',
					max_retries: 3,// 上传失败最大重试次数
					dragdrop:false,
					chunk_size: '2mb',
					auto_start:true,
					max_file_size : '500kb',
					filters:{
						mime_types: [
							{
								title : "Image files",
								extensions : "jpg,gif,png,jpeg"
							}
						]
					},
					init: {
						'PostInit': function() {},
						'FilesAdded': function(up, file) {
							var temp_bars=this.files.length,
								j=0;
							upload_bars.length=0;
							for(j;j<temp_bars;j++){
								upload_bars.push(this.files[j]['id']);
							}
						},
						'BeforeUpload': function(up, file) {
							show_loading_bar(30);
						},
						'UploadProgress': function(up, file) {},
						'FileUploaded': function(up, file, info) {
							/*获取上传成功后的文件的Url*/

							var domain=up.getOption('domain'),
								name=JSON.parse(info);

							$admin_logoImage.attr({
								'data-image':domain+'/'+name.key}).html('<img src="'+domain+'/'+name.key+"?imageView2/1/w/160/h/160"+'" alt="图像">');
						},
						'Error': function(up, err, errTip) {
							dia.content('<span class="g-c-bs-warning g-btips-warn">'+errTip+'</span>').show();
							setTimeout(function(){
								dia.close();
							},3000);
							console.log(errTip);
						},
						'UploadComplete': function(up, file) {
							dia.content('<span class="g-c-bs-success g-btips-succ">上传成功</span>').show();
							upload_bars.length=0;
							setTimeout(function(){
								dia.close();
							},2000);
						},
						'Key': function(up, file) {
							/*调用滚动条*/
							uploadShowBars(file['id']);
							var str="pic_"+moment().format("YYYYMMDDHHmmSSSS");
							return str;
						}
					}
				});
			}



			/*获取编辑缓存*/
			(function () {
				var edit_cache=public_tool.getParams('bzw-user-add');
				if(edit_cache){
					if(useredit_power){
						$admin_action.removeClass('g-d-hidei').html('编辑');
						/*查询数据*/
						if(typeof edit_cache==='object'){
							setUserData(edit_cache['id']);
						}else{
							setUserData(edit_cache);
						}
					}else{
						$admin_action.addClass('g-d-hidei');
					}
				}else{
					if(useradd_power){
						$admin_action.removeClass('g-d-hidei').html('添加');
					}else{
						$admin_action.addClass('g-d-hidei');
					}
				}
			}());


			/*绑定添加地址*/
			/*表单验证*/
			if($.isFunction($.fn.validate)) {
				/*配置信息*/
				var form_opt0={},
					formcache=public_tool.cache,
					basedata={
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					};


				if(formcache.form_opt_0){
					$.each([formcache.form_opt_0],function(index){
						var formtype,
						config={
							dataType:'JSON',
							method:'post'
						};
						if(index===0){
							formtype='useradd';
						}
						$.extend(true,(function () {
							if(formtype==='useradd'){
								return form_opt0;
							}
						}()),(function () {
							if(formtype==='useradd'){
								return formcache.form_opt_0;
							}
						}()),{
							submitHandler: function(form){
								var setdata={},
									id=$admin_id.val(),
									tempimg=$admin_logoImage.attr('data-image');



								$.extend(true,setdata,basedata);

								if(formtype==='useradd'){

									/*同步编辑器*/
									$.extend(true,setdata,{
										phone:public_tool.trims($admin_telePhone.html()),
										nickName:$admin_nickName.html(),
										name:$admin_Name.html(),
										password:$admin_password.val(),
										gender:$admin_sex.find(':checked').val(),
										isEnabled:parseInt($admin_enabled.find(':checked').val(),10)===1?true:false,
										icon:tempimg
									});

									if(id!==''){
										setdata['id']=id;
									}

									config['url']="http://120.76.237.100:8082/mall-buzhubms-api/user/update";
									config['data']=setdata;
								}


								$.ajax(config).done(function(resp){
									var code,formkey='';
									if(formtype==='useradd'){
										if(id!==''){
											formkey='修改';
										}else{
											formkey='添加';
										}
										code=parseInt(resp.code,10);
										if(code!==0){
											dia.content('<span class="g-c-bs-warning g-btips-warn">'+formkey+'用户失败</span>').show();
											return false;
										}else{
											dia.content('<span class="g-c-bs-success g-btips-succ">'+formkey+'用户成功</span>').show();
										}
									}

									setTimeout(function () {
										dia.close();
									},2000);
								}).fail(function(resp){
									console.log('error');
								});

								return false;
							}
						});
					});

				}


				/*提交验证*/
				if(resetform0===null){
					resetform0=$admin_adduser_form.validate(form_opt0);
				}
			}



		}

		/*修改时设置值*/
		function setUserData(id) {
			if(!id){
				return false;
			}


			$.ajax({
					url:"http://120.76.237.100:8082/mall-buzhubms-api/user/detail",
					dataType:'JSON',
					method:'post',
					data:{
						id:id,
						roleId:decodeURIComponent(logininfo.param.roleId),
						adminId:decodeURIComponent(logininfo.param.adminId),
						grade:decodeURIComponent(logininfo.param.grade),
						token:decodeURIComponent(logininfo.param.token)
					}
				})
				.done(function(resp){
					var code=parseInt(resp.code,10);
					if(code!==0){
						console.log(resp.message);
						if(code===999){
							public_tool.loginTips(function () {
								public_tool.clear();
								public_tool.clearCacheData();
							});
						}
						return false;
					}
					/*是否是正确的返回数据*/
					var list=resp.result;

					if(!list){
						return false;
					}


					if(!$.isEmptyObject(list)){
						$admin_id.val(id);
						for(var m in list){
							switch(m){
								case 'phone':
									$admin_telePhone.html(public_tool.phoneFormat(list[m]));
									break;
								case 'password':
									$admin_password.val(list[m]);
									break;
								case 'nickName':
									$admin_nickName.html(list[m]);
									break;
								case 'name':
									$admin_Name.html(list[m]);
									break;
								case 'gender':
									$admin_sex.find('input').each(function(){
										var $this=$(this),
											text=parseInt($this.val(),10),
											curtext=parseInt(list[m],10);

										if(text===curtext){
											$this.prop({
												'checked':true
											});
											return false;
										}
									});
									break;
								case 'isEnabled':
									$admin_enabled.find('input').each(function(){
										var $this=$(this),
											text=parseInt($this.val(),10),
											curtext=list[m]?1:0;

										if(text===curtext){
											$this.prop({
												'checked':true
											});
											return false;
										}
									});
									break;
								case 'icon':
									$('<img src="'+list[m]+"?imageView2/1/w/160/h/160"+'" alt="图像">').appendTo($admin_logoImage.attr({
										'data-image':list[m]
									}).html(''));
									break;
							}
						}
					}
				})
				.fail(function(resp){
					console.log(resp.message);
				});

		}


		/*获取七牛token*/
		function getToken(){
			var result=null;
			$.ajax({
				url:'http://112.74.207.132:8088/yttx-public-api/qiniu/token/get',
				async:false,
				type:'post',
				datatype:'json',
				data:{
					bizType:2,
					roleId:decodeURIComponent(logininfo.param.roleId),
					adminId:decodeURIComponent(logininfo.param.adminId),
					grade:decodeURIComponent(logininfo.param.grade),
					token:decodeURIComponent(logininfo.param.token)
				}
			}).done(function(resp){
				var code=parseInt(resp.code,10);
				if(code!==0){
					console.log(resp.message);
					return false;
				}
				result=resp.result;
			}).fail(function(resp){
				console.log(resp.message);
			});
			return result;
		}


		/*上传进度条*/
		function uploadShowBars(id){
			var len=upload_bars.length;
			if(len>0){
				var j= 0;
				for(j;j<len;j++){
					if(upload_bars[j]===id){
						var bars=parseInt(((j+1)/len) * 100,10);
						setTimeout(function(){
							show_loading_bar(bars);
						},0);
						break;
					}
				}
			}
		}



	});



})(jQuery);