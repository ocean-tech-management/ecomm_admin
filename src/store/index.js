import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router/index'

Vue.use(Vuex)

const routerConfig = router.options.routes;
export default new Vuex.Store({
  state: {
    routerConfig: routerConfig,
    token: localStorage.getItem('token')  //设置token初始值。防二次强行篡改token
  },
  mutations: {
    updateToken: (state, newToken)=> {
      localStorage.setItem('token', newToken);  //覆盖token
      state.token = newToken;
    }
  },
  actions: {

  },
})
