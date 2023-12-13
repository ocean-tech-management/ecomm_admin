<template>
  <el-header>
    <div class="app-info">
      <img src="../assets/imgs/logo.png" class="avator" />
      <div class="app-name">
        <!-- <div>美丽会</div> -->
        <div style="font-size: 18px;">{{ $systemName }}</div>
      </div>
    </div>
    <div class="header-contain">
      <div class="header-navs">
        <!-- 改顶部nav栏改这里 -->
        <router-link class="header-nav" :class="{ 'active': highLight == 'index' }"
          :to="{ path: '/index' }">控制台</router-link>
        <div v-if="$auths.includes('user')" class="header-nav" :class="{ 'active': highLight == 'user' }"
          @click="changePath('user')">用户</div>
        <div v-if="$auths.includes('coupon')" class="header-nav" :class="{ 'active': highLight == 'coupon' }"
          @click="changePath('coupon')">卡券</div>
        <div v-if="$auths.includes('goods')" class="header-nav" :class="{ 'active': highLight == 'goods' }"
          @click="changePath('goods')">产品商城</div>
        <div v-if="$auths.includes('ppyl')" class="header-nav" :class="{ 'active': highLight == 'ppyl' }"
          @click="changePath('ppyl')">拼拼</div>
        <div v-if="$auths.includes('crowd')" class="header-nav" :class="{ 'active': highLight == 'crowd' }"
          @click="changePath('crowd')">福利</div>
        <div v-if="$auths.includes('order')" class="header-nav" :class="{ 'active': highLight == 'order' }"
          @click="changePath('order')">订单</div>
        <div v-if="$auths.includes('vdc')" class="header-nav" :class="{ 'active': highLight == 'vdc' }"
          @click="changePath('vdc')">营销设置</div>
        <div v-if="$auths.includes('auth')" class="header-nav" :class="{ 'active': highLight == 'auth' }"
          @click="changePath('auth')">权限</div>
        <div v-if="$auths.includes('finance')" class="header-nav" :class="{ 'active': highLight == 'finance' }"
          @click="changePath('finance')">财务</div>
        <div v-if="$auths.includes('system')" class="header-nav" :class="{ 'active': highLight == 'system' }"
          @click="changePath('system')">系统</div>
        <!-- <router-link class="header-nav" :to="{ path: '/settings' }">设置</router-link> -->
      </div>
    </div>

    <el-dropdown @command="handleCommand" menu-align="start" placement="top-start">
      <div class="login-user-info">
        <div class="login-user-ctrl">
          <img src="../assets/imgs/default_avator.jpg" class="avator" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="resetPwd">修改密码</el-dropdown-item>
            <el-dropdown-item command="signout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </div>

        <div class="user-name">{{ userInfo.name || '管理员' }}</div>
      </div>
    </el-dropdown>

    <el-dialog title="修改您的密码" width="750px" :close-on-click-modal="false" :visible.sync="resetPwdVisible">
      <div class="reset-box">
        <el-form ref="resetForm" :model="pwdInfo" label-width="100px">
          <el-form-item label="旧密码" prop="oldPwd">
            <el-input style="width: 450px" v-model="pwdInfo.oldPwd" type="password" maxlength="18"
              placeholder="请输入该账号的旧密码哦"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="pwd">
            <el-input style="width: 450px" v-model="pwdInfo.pwd" type="password" maxlength="18"
              placeholder="请输入6~18位密码哦"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="rePwd">
            <el-input style="width: 450px" v-model="pwdInfo.rePwd" type="password" maxlength="18"
              placeholder="请再次输入6~18位密码哦"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPwdVisible = false">取 消</el-button>
        <el-button type="primary" @click="resetPwd">确 定</el-button>
      </div>
    </el-dialog>
  </el-header>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      pagesIndex: JSON.parse(localStorage.getItem('pagesIndex')) || '',
      highLight: '',
      userInfo: {
      },

      pwdInfo: {
        oldPwd: '',
        pwd: '',
        rePwd: ''
      },
      resetPwdVisible: false
    };
  },
  props: {
    navs: Array
  },
  mounted() {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.getHighLight();
  },
  watch: {
    $route(val, oldVal) {
      // 监听路由变动，实时更新Nav栏数据
      this.getHighLight();
    }
  },
  methods: {
    handleCommand: function(command) {
      if (command == "signout") {
        localStorage.clear();
        window.location = "./#/login";
      } else if(command == 'resetPwd') {
        this.pwdInfo = {
          id: this.userInfo.id,
          oldPwd: '',
          pwd: '',
          rePwd: ''
        }
        this.resetPwdVisible = true;
      }
    },
    changePath(auth) {
      let path = this.getPath(auth);
      if(this.$route.path == path) return;
      this.$router.replace(path);
    },
    getPath: function(auth) {
      let pathRequire = this.pagesIndex[auth];  //模块首个页面要求的权限
      let routerConfig = this.$store.state.routerConfig[0].children;  //索引0需要由路由表里页面的顺序来决定
      for (let i = 0; i < routerConfig.length; i++) {
        let item = routerConfig[i];
        // 检查对应哪个模块
        if (item.meta.moduleName == auth) {
          let pages = item.children;
          for(let i = 0; i < pages.length; i++) {
            // 轮询,看目标是对应哪个页面路由要求的权限
            if(pages[i].meta && pages[i].meta.require == pathRequire) return pages[i].path;
          }
          return pages[0].path;
        }
      }
    },
    getHighLight() {
      // 检查顶部哪个项应该被高亮
      let routerConfig = this.$store.state.routerConfig[0].children;  //索引0需要由路由表里页面的顺序来决定
      let routePath = this.$route.path;
      if(routePath == '/404' || routePath == '/403') return;  //493和404不用理会
      for (let i = 0; i < routerConfig.length; i++) {
        let item = routerConfig[i];
        if (
          item.path == routePath ||
          item.alias == routePath ||
          (item.meta.childPath && item.meta.childPath.includes(routePath))
        ) {
          this.highLight = item.meta.moduleName;
          if(item.meta.childPath.includes('/')) this.highLight = 'index';
          break;
        }
      }
    },
    resetPwd() {
      let params = JSON.parse(JSON.stringify(this.pwdInfo));
      let formValues = Object.values(params);
      for (let i = 0; i < formValues.length; i++) {
        if (formValues[i] === '') return this.$message.error('请填写完所有内容哦');
      }
      if (params.oldPwd == params.pwd) {
        return this.$message.error('你填写的新旧密码一致，请检查');
      }
      if (params.pwd != params.rePwd) {
        return this.$message.error('新密码与确认密码不一致，请重新填写确认');
      }
      if (params.pwd.length < 6 || params.pwd.length > 18) {
        return this.$message.error('密码最短6位，最长18位，请您检查下哈');
      }
      this.$post('/admin/manager/updateMyPwd', params, res => {
        this.$message.success('修改密码成功，请重新登录');
        this.resetPwdVisible = false;
        localStorage.clear();
        window.location = "./#/login";
      });
    }
  }
};
</script>
