var baseUrl = 'http://119.3.22.179/'

// 测试环境
// var baseUrl = 'http://122.112.165.181:81/ksApp/' 



// 为main部分的图标添加颜色组
function getIconColored() {
  var icons = document.querySelectorAll('.aui-list-item i');
  var colors = colors1 = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
  if (colors.length < icons.length) {
    colors = [colors, ...colors1];
  }
  for (let i = 0; i < icons.length; i++) {
    var icon = icons[i]
    //如果调色板不够用 ，延长调色板

    icon.style.color = colors[i];
  }
}





// 页面跳转到登录页面时候，进行标记，名称

function gotoLogin() {
  api.openWin({
    name: 'get_in',
    url: './get_in.html',
    rect: {
      x: 0,
      y: 0,
      w: 'auto',
      h: 'auto'
    },
    pageParam: {
      name: api.frameName
    },
    bounces: false,
    vScrollBarEnabled: true,
    hScrollBarEnabled: true
  });
}



// 数据部分 ----------------------下拉刷新加载更多
// 下拉函数
function MgGetMore() {
  api.setRefreshHeaderInfo({
    visible: true,
    loadingImg: 'widget://image/refresh.png',
    bgColor: '#fff',
    textColor: '#020202',
    textDown: '下拉刷新...',
    textUp: '松开刷新...',
    showTime: true,
  }, function (ret, err) {
    console.log('下拉刷新操作');
    setTimeout(() => {
      api.refreshHeaderLoadDone();
    }, 500)
  });
}


// 对需要登录的地方进行判断跳转
function needLogin() {
  var Mg_uInfo = $api.getStorage('Mg_uInfo') || {};
  $api.setStorage('frameName', api.frameName);
  if (!Mg_uInfo.uname) {
    api.confirm({
      title: '您还没有登录',
      msg: '是否立即登录',
      buttons:['确定', '取消']
    },function(ret,err){
      if(ret.buttonIndex == 1){
        api.openFrame({
          name: 'get_in',
          url: 'get_in.html', 
          bounces: false,
          rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
          },
          reload:true,
          pageParam: {
            name: api.frameName
          }
        });
    
      } else {
        api.toast({
          msg: '好的，再看看~',
          duration: 2000,
          location: 'bottom'
        });
      }
    });
    return false;
  }
  return true
}


// 仅作判断，登录页面右上角显示用，即使未登录，也不要显示‘瞅瞅’页面只有第一次进入的时候，显示
function hasLoginOr() {
  var fm = $api.getStorage('frameName');;
  console.log(JSON.stringify(fm));

  if (fm == '') {
    return false;
  } else {
    return true;
  }
}

// 给所有分类模板zp信息，注册点击事件
function clickToDelZp() {
  // 事件委托
  console.log('点击进入详情');
  
  $('.Mg_tempList').on('click', '.Mg_temp_item', function () {
    var id = $(this).data('id');
  console.log(JSON.stringify(id));
      
    api.openFrame({
      name: 'Mg_zp_detail',
      url: 'Mg_zp_detail.html',
      rect:{
        x:0,
        y:0,
        w:'auto',
        h:'auto',
      },
      reload:true,
      bounces: false,
      pageParam: {
        id: id
      }
    });
  })
}

// 页面滚动到顶部回元
function winToTop() {
  console.log('置顶了');

  window.scrollBy(0, 0);
}

// 每次进入页面将页面名称存入本地
function putInFm() {
  console.log(JSON.stringify(api.frameName));

  $api.setStorage('frameName', api.frameName);
}

// 根据zpMap获取zp信息的方法
function zpMapToZpInfo(zpMap) {
  var page_size = 5;
  var promise = new Promise((resolve, reject) => {
    console.log(JSON.stringify(zpMap)+'---'+JSON.stringify(current_page));
    
    api.ajax({
      url: baseUrl + 'ks/ks/getZpInfo.ksrun',
      method: 'post',
      timeout: 30,
      dataType: 'json',
      returnAll: false,
      data: {
        body: {
          ks_data: {
            zpMap: zpMap,
            page_size:5,
            current_page:1
          }
        }
      }
    }, function (ret, err) {
      if (ret) {
        // TODO         
        resolve(ret)
      } else {
        reject(err)
      };
    });
  })
  return promise;
}

// 生成模板的方法
function Mg_temp(r) {
  console.log(JSON.stringify(api.frameName));
  if (api.frameName == 'Mg_main_all' || api.frameName == 'Mg_main_user') {
    $(".Mg_tempList").html('');
  }
  var tempText = doT.template($("#Mg_tempList").text());
  //这里处理一下数据，
  if(r.zpwork) {
    r.zpwork = initText(r.zpwork);
  }
  
  $(".Mg_tempList").append(tempText(r));
}


// 处理工作内容，时间，等文本内容的方法
function initText(txt) {
  var str = txt.replace(' ','<br>')
  return str;
}


// 封装根据zpMap获取数据，渲染模板 
function seriesToTemp(zpMap) {

  zpMapToZpInfo(zpMap).then(r => {
    console.log(JSON.stringify(r));
    if (r.ks_data && r.ks_data.records) {
      var Mg_tempData = r.ks_data.records;
      Mg_temp(Mg_tempData);
    }
  }).catch(err => {

    if (err.code) {
      api.alert({
        msg: ('错误码：' + err.code + '；错误信息：' + err.msg + '网络状态码：' + err.statusCode)
      });
    }
  })
}

// 根据id直接获取单条zp消息 获取所有数据前端筛选
function getAlleZp() {
  
  var promise = new Promise((resolve, reject) => {
    api.ajax({
      url: baseUrl + 'ks/ks/getZpInfo.ksrun',
      method: 'post',
      timeout: 30,
      dataType: 'json',
      returnAll: false,
      data: {
        body:{
          ks_data:{}
        }
      }
    }, function (ret, err) {
      if (ret) {
        // TODO 
        resolve(ret);
      } else {
        reject(err);
      };
    });
  })

  return promise;
}

function singleZpToTemp(id) {
  getSingleZp().then(r => {
    console.log(JSON.stringify(r));
    if (r.ks_data && r.ks_data.records) {
      var Mg_tempData = r.ks_data.records;
      Mg_temp(Mg_tempData);
    }

  }).catch(err => {

    if (err.code) {
      api.alert({
        msg: ('错误码：' + err.code + '；错误信息：' + err.msg + '网络状态码：' + err.statusCode)
      });
    }
  })
}


// 封装筛选单条数据的方法
function  chooseZpToTemp(id) {
  console.log('选择单条数据');
  var adminInfo = $api.getStorage('adminInfo');
  console.log(JSON.stringify(adminInfo) );
  
  getAlleZp().then(r => {

    console.log(JSON.stringify(r));
    if (r.ks_data && r.ks_data.records) {
      var Mg_tempData = r.ks_data.records;
      Mg_tempData = Mg_tempData.filter( item => item.id == id)[0];
      Mg_tempData.zpwork = initText(Mg_tempData.zpwork);
      Mg_tempData.zsstatus = adminInfo.zsstatus;
      Mg_tempData.adminlink = adminInfo.colink;
      Mg_tempData.adminlinktype = adminInfo.zstype;
      console.log(JSON.stringify(Mg_tempData));
      if(Mg_tempData.adminlinktype == '1') {
        Mg_tempData.adminlinktype ='fa-qq'
      }
      if(Mg_tempData.adminlinktype == '2') {
        Mg_tempData.adminlinktype ='fa-phone'
      }
      if(Mg_tempData.adminlinktype == '3') {
        Mg_tempData.adminlinktype ='fa-envelope-o'
      }
      if(Mg_tempData.adminlinktype == '4') {
        Mg_tempData.adminlinktype ='fa-weixin'
      }
      if(Mg_tempData.colinktype == '1') {
        Mg_tempData.colinktype ='fa-qq'
      }
      if(Mg_tempData.colinktype == '2') {
        Mg_tempData.colinktype ='fa-phone'
      }
      if(Mg_tempData.colinktype == '3') {
        Mg_tempData.colinktype ='fa-envelope-o'
      }
      if(Mg_tempData.colinktype == '4') {
        Mg_tempData.colinktype ='fa-weixin'
      }


      Mg_temp(Mg_tempData);
      
    }
    
  }).catch(err => {
    
    if (err.code) {
      api.alert({
        msg: ('错误码：' + err.code + '；错误信息：' + err.msg + '网络状态码：' + err.statusCode)
      });
    }
  })
}

// 查询用户是否已报名或者是收藏
function hasDoneOrNot(uZpstatus,uId,zpId) {
  var promise = new Promise((resolve,reject) => {
    api.ajax({
      url: baseUrl +'ks/ks/getOwnerZpInfoByStatus.ksrun',
      method: 'post',
      timeout: 30,
      dataType: 'json',
      returnAll:false,
      data:{
        body:{
          ks_data:{
            uId,
            uZpstatus
          }
        }
      }
    },function(ret,err){
      if (ret) {
        // TODO 
        api.hideProgress();
        console.log(JSON.stringify(ret));
        if(ret.ks_data && ret.ks_data.records.length > 0) {
          var data = ret.ks_data.records;
        var flag =  data.some(item => item.id == zpId);
        console.log(JSON.stringify(flag));
          resolve(flag);
        } else {
          resolve(false);
        }
      } else {
        api.hideProgress();

        reject(err);
      };
    });
  
  })
  return promise;
}

// 获取当前时间 复合规则的格式
function getTimeNow() {
  var date = new Date();
  var y  = date.getFullYear() +'';
  var m  = (date.getMonth() +1)+'';
  var d  = date.getDate() +'';
  m = m.padStart(2,'0');
  d = d.padStart(2,'0');
  console.log(JSON.stringify(y)+'--'+JSON.stringify(m)+'---'+JSON.stringify(d));
  return y+'-'+m+'-'+d;
}

function adminSet() {
  console.log('执行指令');
  let uId = ($api.getStorage('Mg_uInfo') || {} )['id'];
  console.log(JSON.stringify(uId));
  
  const body =  uId ? { ks_data:{ id:'1',uId } } : { ks_data: { id:'1' } };
  api.ajax({
    url: baseUrl + 'ks/ks/getAdminInfo.ksrun',
    method: 'post',
    timeout: 30,
    dataType: 'json',
    returnAll: false,
    data: {
      body
    }
  }, function (ret, err) {
    if (ret) {
      // TODO 
      console.log(JSON.stringify(ret) + '--- 管理员指令');
      if (ret.ks_data && ret.ks_data.records && ret.ks_data.records.length != 0) {
        $api.setStorage('adminInfo', ret.ks_data.records[0]);
      }
    } else {
        // api.toast({
        //   msg: api.appName + ': 网络无连接，请检查您的网络',
        //   duration: 2000,
        //   location: 'bottom'
        // });    
        api.alert({
      msg: ('错误码：' + err.code + '；错误信息：' + err.msg + '网络状态码：' + err.statusCode)
    });
    };
  });
}
