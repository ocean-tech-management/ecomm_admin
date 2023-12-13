import Vue from 'vue'
import axios from 'axios';
import store from '../store/index';
import {
  axiosConfig,
  expireTime,
  noTokenReqs
} from '../config.js';

// 请求接口封装
// -------
//获取vue实例
let app = Vue.prototype;
// 请求队列长度，出入栈后队列长度为0时隐藏loading
let questQuery = 0;

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
  app.$loading();
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




const get = (url, data, handler, errorHandler) => {
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

const post = (url, data, handler, errorHandler) => {
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
  } else if (res.error_code == 300 || res.error_code == 1000101 || res.error_code == 1000102 || res.error_code == 1000103) {
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
    post('/admin/token/refresh', null, res => {
      respondHandler(res, () => {
        localStorage.setItem('token', res.data);
        store.commit('updateToken', res.data)
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

// -------
// 请求接口到此结束

// **-------------------**//

// 拓展静默请求接口
// -------开始
const selientInstance = axios.create(axiosConfig);


// 请求前的拦截，处理各种验证，显示loading
selientInstance.interceptors.request.use(config => {
  // 在这里传token
  let token = localStorage.getItem('token');
  if (!noTokenReqs.includes(config.url)) {
    if (token) {
      let current = new Date().getTime();
      let last = localStorage.getItem('lastUpdateTime');
      if (current - last > expireTime || !last) {
        // token已过期，要重新获取token
        // 设置promise，正确返回config
        let backoff = new Promise(function(resolve) {
            setTimeout(function() {
              updateToken(() => {
                resolve();
              });
            }, 1);
        });
        return backoff.then(()=>{
          config.headers.token = localStorage.getItem('token');
          return selientSendRequest(config);
        })
        
      } else {
        config.headers.token = token;
        return selientSendRequest(config);
      }
    } else {
      window.location.replace('/#/login');
      return Promise.reject('未登陆');
    }
  } else {
    config.headers.token = localStorage.getItem('token') || '';
    return selientSendRequest(config);
  }
}, error => {
  app.$message.error('未能通过服务器验证');
  return Promise.reject(error);
})

// 验证通过，正式发送请求
const selientSendRequest = config => {
  config.data = JSON.stringify(config.data);
  return config;
}

// 请求后的拦截，隐藏loading
selientInstance.interceptors.response.use(res => {
  return res;
}, error => {
  app.$message.error('请求出错');
  // return异常信息,为下面的方法能catch到错误信息
  return Promise.reject(error);
})

const sget = (url, data, handler, errorHandler) => {
  selientInstance.get(url, {
    params: data
  }).then(respond => {
    let res = respond.data;
    respondHandler(res, handler, errorHandler);
  }).catch(err => {
    if (errorHandler && typeof errorHandler == 'function') errorHandler(err);
  })
}

const spost = (url, data, handler, errorHandler) => {
  selientInstance.post(url, data).then(respond => {
    let res = respond.data;
    respondHandler(res, handler, errorHandler);
  }).catch(err => {
    if (errorHandler && typeof errorHandler == 'function') errorHandler(err);
  })
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
  get,
  post,
  sget,
  spost,
  questQuery,
  respondHandler,
  updateToken,
  alertMsg
}
