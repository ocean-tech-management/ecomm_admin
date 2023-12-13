import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router/index'
import Router from 'vue-router'
import store from './store/index'
import "babel-polyfill"
import util from './util/index'
import {systemName, sizeWhiteList} from './config'
import syncReq from './util/syncReq'  //同步请求的临时方案，后面需要移除
import moment from 'moment'
import VCharts from 'v-charts';

//  vue-quill-editor富文本
import VueQuillEditor from 'vue-quill-editor';
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import resetMessage from '../src/util/resetMessage'
Vue.prototype.$systemName = systemName; //系统名称


// 复制到剪切板
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)


Vue.config.productionTip = false;
// 使用ElementUI框架
Vue.use(ElementUI);

// 使用富文本框
let AlignStyle = VueQuillEditor.Quill.import('attributors/style/align');
let sizeStyle = VueQuillEditor.Quill.import('attributors/style/size');
sizeStyle.whitelist = sizeWhiteList;

VueQuillEditor.Quill.register(AlignStyle, true);
VueQuillEditor.Quill.register(sizeStyle, true);
Vue.use(VueQuillEditor, /* { default global options } */ );

Vue.use(VCharts);


Vue.prototype.$questQuery = util.questQuery;
Vue.prototype.$updateToken = util.updateToken;
Vue.prototype.$respondHandler = util.respondHandler;
// 重写Vue实例的$get和$post，用我们自己封装的get与post方法来替代
Vue.prototype.$get = util.get;
Vue.prototype.$alertMsg = util.alertMsg;
Vue.prototype.$post = util.post;
Vue.prototype.$sget = util.sget;
Vue.prototype.$spost = util.spost;
Vue.prototype.$moment = moment;


//确保每次只显示一个弹窗
Vue.prototype.$message = resetMessage;

Vue.prototype.$syncGet = syncReq.syncGet;
Vue.prototype.$syncPost = syncReq.syncPost;

Vue.prototype.$auths = localStorage.getItem('auths') ? localStorage.getItem('auths').split(',') : [];
// 路由全局前置守卫
// 判断当前页是不是login
// 非login页判断是否有token，如果没有token或者token被改写，清空localStorage信息重新退到login页
router.beforeEach((to, from, next) => {

    let target = to;
    if (target.name != 'login' && target.name != '403' && target.name != '404') {
        let token = localStorage.getItem('token');
        let auths = Vue.prototype.$auths;
        if (token && token == store.state.token) {
          if(target.path == '/' || target.path == '/index') {
            next(); //首页还是让看一下的
          } else {
            if(!target.meta.require || auths.includes(target.meta.require)) {
              next(); //有权限进入
            } else {
              next('/403')
            }
          }

        } else {
          //token有问题，直接清掉token重新登录
          localStorage.removeItem('token');
          next('./login');
        }
    } else {
        next();
    }

})

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
}


// moment过滤器
Vue.filter('moment', function(value, formatString) {
    formatString = formatString || 'YYYY-MM-DD';
    return moment(value).format(formatString);
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
