import Vue from 'vue'
import axios from 'axios';
import store from '../store/index';
import {
  expireTime,
  noTokenReqs
} from '../config.js';

// 请求接口封装
// -------
//获取vue实例
let app = Vue.prototype;
// 请求队列长度，出入栈后队列长度为0时隐藏loading
let questQuery = 0;

// 请求配置
const axiosConfig = {
  headers: {
      'Content-type': 'application/json'
  },
  timeout: 600000 //最长十分钟断开同步操作
}
const instance = axios.create(axiosConfig);

let updateTokenPromise = null;


// 请求前的拦截，处理各种验证，显示loading
instance.interceptors.request.use(config => {
  // 在这里传token
  let token = localStorage.getItem('token');
  if (!noTokenReqs.includes(config.url)) {
    if (token) {
      let current = new Date().getTime();
      let last = localStorage.getItem('lastUpdateTime');
      if (current - last > expireTime || !last) {
        // token已过期，要重新获取token
        // 设置promise，正确返回config
        if(!updateTokenPromise) updateTokenPromise = new Promise(function(resolve) {
          setTimeout(function() {
            updateToken(() => {
              resolve();
            });
          }, 1);
        });
        return updateTokenPromise.then(()=>{
          config.headers.token = localStorage.getItem('token');
          return sendRequest(config);
        })
        
      } else {
        config.headers.token = token;
        return sendRequest(config);
      }
    } else {
      window.location.replace('/#/login');
      return Promise.reject('未登陆');
    }
  } else {
    config.headers.token = localStorage.getItem('token') || '';
    return sendRequest(config);
  }
}, error => {
  app.$message.error('未能通过服务器验证');
  return Promise.reject(error);
})

// 验证通过，正式发送请求
const sendRequest = config => {
  config.data = JSON.stringify(config.data);
  questQuery += 1;
  return config;
}

// 请求后的拦截，隐藏loading
instance.interceptors.response.use(res => {
  questQuery -= 1;
  // 队列长度为0，所有请求执行完毕，隐藏loading
  if (questQuery == 0) app.$loading().close();

  // 需要return响应值回去，不然后面无法拿到值
  return res;
}, error => {
  questQuery -= 1;
  // 队列长度为0，所有请求执行完毕，隐藏loading
  if (questQuery == 0) app.$loading().close();
  app.$message.error('请求出错');
  // return异常信息,为下面的方法能catch到错误信息
  return Promise.reject(error);
})




const syncGet = (url, data, handler, errorHandler) => {
  instance.get(url, {
    params: data
  }).then(respond => {
    let res = respond.data;
    respondHandler(res, handler, errorHandler);
  }).catch(err => {
    if (errorHandler && typeof errorHandler == 'function') errorHandler(err);
    console.log('err', err)
  })
}

const syncPost = (url, data, handler, errorHandler) => {
  instance.post(url, data).then(respond => {
    let res = respond.data;
    respondHandler(res, handler, errorHandler);
  }).catch(err => {
    if (errorHandler && typeof errorHandler == 'function') errorHandler(err);
    // console.log('err', err)
  })
}

const respondHandler = (res, handler, errorHandler) => {
  if (res.error_code == 0) {
    if (handler && typeof handler == 'function') handler(res);
  } else if (res.error_code == 300 || res.error_code == 1000102) {
    expireHandler();
  } else {
    app.$message.error(res.msg);
    if (errorHandler && typeof errorHandler == 'function') errorHandler(res);
  }
}

// 缓存过期，更新缓存
const updateToken = handler => {


  let errorHandler = () => {
    app.$loading().close();
    app.$message.error('您的登录信息已失效');
    setTimeout(() => {
      expireHandler();
    }, 1000)
  }
  if (localStorage.getItem('token')) {
    syncGet('/admin/token/update', null, res => {
      respondHandler(res, () => {
        localStorage.setItem('token', res.data.token);
        store.commit('updateToken', res.data.token)
        localStorage.setItem('lastUpdateTime', new Date().getTime());
        handler();
      }, () => {
        errorHandler();
      });
    }, err => {
      errorHandler();
    })
      
  } else {
    errorHandler();
  }
}

// 令牌过期处理
const expireHandler = () => {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");
  localStorage.removeItem("lastUpdateTime");
  localStorage.removeItem("id");
  window.location.replace('/#/login');
}

// 拓展静默请求接口结束
// -------



const alertMsg = (res, handler, errorHandler) => {
  let type = res.error_code == 0 ? 'success' : 'error';
  app.$message({
    message: res.msg,
    type: type,
  });
  if (res.error_code == 0){
      if (handler && typeof handler == 'function') handler();
  }else{
      if (errorHandler && typeof errorHandler == 'function') errorHandler();
  }
    
}




export default {
  syncGet,
  syncPost
}
