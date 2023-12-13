// 该文件用于上传文件的md5检测与上传
import SparkMD5 from "spark-md5";
import Vue from 'vue';
import axios from 'axios';
import {
  expireTime
} from '../config';

let app = Vue.prototype;


let updateTokenPromise = null;

// 请求前的拦截，处理各种验证，显示loading
const beforeRequest = () => {
  // 在这里传token
  return new Promise(function(resolve, reject) {
    let token = localStorage.getItem('token');
    if (token) {
      let current = new Date().getTime();
      let last = localStorage.getItem('lastUpdateTime');
      if (current - last > expireTime || !last) {
        // token已过期，要重新获取token
        // 设置promise，正确返回config
        if(!updateTokenPromise) updateTokenPromise = new Promise(function(updateResolve) {
          setTimeout(function() {
            app.$updateToken(() => {
              updateResolve();
            });
          }, 1);
        });
        return updateTokenPromise.then(()=>{
          sendRequest();
          resolve();
        })
        
      } else {
        sendRequest();
        resolve();
      }
    } else {
      window.location.replace('/#/login');
      return reject('未登陆');
    }
  })
}

// 验证通过，正式发送请求
const sendRequest = () => {
  app.$questQuery += 1;
  // app.$loading();
}

const upload = (url, data, handler, errorHandler) => {
  beforeRequest().then(() => {
    // formdata上传图片只能用纯净的axios。 设置axios拦截器会导致返回的data数据从 FormData → Object
    axios.post(url, data, {
      headers: {
        'Content-type': 'multipart/form-data',
        'token': localStorage.getItem('token') 
      },
      timeout: 60000
    }).then(respond => {
      app.$questQuery -= 1;
      // 队列长度为0，所有请求执行完毕，隐藏loading
      // if (app.$questQuery == 0) app.$loading().close();

      let res = respond.data;
      app.$respondHandler(res, handler, errorHandler);
    }).catch(err => {
      app.$questQuery -= 1;
      // 队列长度为0，所有请求执行完毕，隐藏loading
      // if (app.$questQuery == 0) app.$loading().close();
      app.$message.error('请求出错');

      if (errorHandler && typeof errorHandler == 'function') errorHandler(err);
      console.log('err', err)
    })
  })
}



const getFileMD5 = function(file, callback, errHandler) {
  try {
    //声明必要的变量
    var fileReader = new FileReader(), //文件每块分割2M，计算分割详情
    chunkSize = 2097152,
    chunks = Math.ceil(file.size / chunkSize),
    currentChunk = 0,
    //创建md5对象（基于SparkMD5）
    spark = new SparkMD5(); //每块文件读取完毕之后的处理
    fileReader.onload = function (e) {
      //每块交由sparkMD5进行计算
      spark.appendBinary(e.target.result);
      currentChunk++;
      //如果文件处理完成计算MD5，如果还有分片继续处理
      if (currentChunk < chunks) {
        loadNext();
      } else {
        callback(spark.end());
      }
    };
    loadNext();
  } catch(err) {
    if(errHandler && typeof errHandler == 'function') errHandler();
  }
  
  //处理单片文件的上传
  function loadNext() {
    var start = currentChunk * chunkSize,
      end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    fileReader.readAsBinaryString(file.slice(start, end));
  }
}

const svalidMD5 = function(md5, handler, errHandler) {
  app.$sget(
    "/admin/file/read",
    { md5: md5 },
    res => {
      let data = res.data;
      if (data && data.url) {
        if(handler && typeof handler == 'function') handler(data.url);
      } else {
        if(errHandler && typeof errHandler == 'function') errHandler(res);
      }
    },
    err => {
      console.log('err', err);
      if(errHandler && typeof errHandler == 'function') errHandler(err);
    }
  );
}

const validMD5 = function(md5, handler, errHandler) {
  app.$get(
    "/admin/file/read",
    { md5: md5 },
    res => {
      let data = res.data;
      if (data && data.url) {
        if(handler && typeof handler == 'function') handler(data.url);
      } else {
        if(errHandler && typeof errHandler == 'function') errHandler(res);
      }
    },
    err => {
      console.log('err', err);
      if(errHandler && typeof errHandler == 'function') errHandler(err);
    }
  );
}

const postMD5 = function(data, handler, errHandler) {
  if(!data || !data.url || !data.md5) return;
  app.$post(
    "/admin/file/create",
    data,
    res => {
      if(handler && typeof handler == 'function') handler(res);
    }, 
    err => {
      if(errHandler && typeof errHandler == 'function') errHandler(err);
    }
  );
}

const spostMD5 = function(data, handler, errHandler) {
  if(!data || !data.url || !data.md5) return;
  app.$spost(
    "/admin/file/create",
    data,
    res => {
      if(handler && typeof handler == 'function') handler(res);
    }, 
    err => {
      console.log(err);
      if(errHandler && typeof errHandler == 'function') errHandler(err);
    }
  );
}




export default {
  upload,
  getFileMD5,
  svalidMD5,
  validMD5,
  postMD5,
  spostMD5
}