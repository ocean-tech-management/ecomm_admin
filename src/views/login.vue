<template>
  <div class="login-page">
    <el-form class="login" :model="loginInfo">
      <el-form-item>
        <el-input type="text" placeholder="请输入账号" v-model="loginInfo.account"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input type="password" placeholder="请输入密码" v-model="loginInfo.pwd"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="primary btn-block" type="primary" @click="login">去到首页</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginInfo: {
        account: "",
        pwd: ""
      }
    };
  },
  created(){
    this.keyupSubmit();
  },
  mounted() {},
  methods: {
    keyupSubmit(){
      document.onkeydown=e=>{
        let _key=window.event.keyCode;
        if(_key===13){
          this.login();
        }
      }
    },
    login() {
      this.$post("/admin/login/login", this.loginInfo, res => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem('lastUpdateTime', new Date().getTime());
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        this.getPermissions();
      });
    },
    getPermissions() {

      this.$get("/admin/manager/userRule", null, res => {
        let data = res.data;
        let auths = [], pagesIndex = {};
        for (let i = 0; i < data.length; i++) {

          let auth = data[i];
          auths.push(auth.name);

          if(!auth.pages || auth.pages.length == 0) continue;
          pagesIndex[auth.name] = auth.pages[0].name;
          for (let j = 0; j < auth.pages.length; j++) {
            let page = auth.pages[j];
            auths.push(page.name);

            if(!page.permission || page.permission.length == 0) continue;
            for (let k = 0; k < page.permission.length; k++) {
              let permission = page.permission[k];
              auths.push(permission.name);
            }
          }
        }
        localStorage.setItem("auths", auths);
        localStorage.setItem("pagesIndex", JSON.stringify(pagesIndex));
        window.location.replace('/');
      });

    }
  }
};
</script>
