<template>
    <div class="breadcrumb">
      <!-- 面包屑，当路由中存在meta.breadcrumb时渲染meta.breadcrumb，缺省则渲染路由title -->
      <el-breadcrumb v-if="$route.meta && $route.meta.breadcrumb" separator="/">
        <el-breadcrumb-item v-for="(item, index) in $route.meta.breadcrumb" :key="index">{{item}}</el-breadcrumb-item>
      </el-breadcrumb>
      <el-breadcrumb v-else-if="$route.meta && $route.meta.tabs" separator="/" style="height: 100%">
        <div class="tabs-list">
          <div v-for="(item, index) in metaTabsList" :key="index" :class="['tabs-item', $route.path.indexOf(item.path) !== -1 && 'active']" @click="goToTabsItem(item)">{{ item.meta.title }}</div>
        </div>
      </el-breadcrumb>
      <el-breadcrumb v-else separator="/">
        <el-breadcrumb-item>{{$route.meta.title || ''}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
</template>
<script>
export default {
  name: "Header",
  data() {
    return {
      metaTabsList: [],
      metaTabsIndex: 0
    }
  },
  props: {
    navs: Array
  },
  watch: {
    $route(val, oldVal) {
      if (val && val.meta && val.meta.tabs) {
        // 监听路由变动，实时更新Nav栏数据
        this.loadNav();
      }
    },
  },
  mounted() {
    if (this.$route.meta && this.$route.meta.tabs) {
      // 监听路由变动，实时更新Nav栏数据
      this.loadNav();
    }
  },
  methods: {
    upPage(){
      this.$router.go(-1)
    },
    downPage(){
      this.$router.go(+1)
    },
    handleCommand: function(command) {
      if (command == "signout") {
        localStorage.removeItem("token");
        window.location = "./#/login";
      }
    },
    // tabs子页面路由监听
    loadNav: function() {
      let routerConfig = this.$store.state.routerConfig[0].children;  //索引0需要由路由表里页面的顺序来决定
      let routePath = this.$route.path;
      const routeTabs = this.$route.meta.tabs;
      // 遍历所有的大类路由
      for (let i = 0; i < routerConfig.length; i++) {
        let item = routerConfig[i];
        if (
          item.path == routePath ||
          item.alias == routePath ||
          (item.meta.childPath && item.meta.childPath.includes(routePath))
        ) {
          // 过滤出当前相同的tabs的路由并且有权限
          this.metaTabsList = (item.children || []).filter(e => {
            const isInclude = routeTabs === (e.meta && e.meta ? e.meta.tabs : false);
            const isAuth = e.meta && e.meta.require ? this.$auths.includes(e.meta.require) : true;
            return isInclude && isAuth
          });
          if (this.metaTabsList.length === 0) {
            // 无子页面跳转到403
            this.$router.replace({
              path: '/403',
            })
          }
          break;
        }
      }
    },
    // tabs跳转
    goToTabsItem(data) {
      if (data.path === this.$route.path) return;
      const query = this.$route.query;
      this.$router.push({
        path: data.path,
        query
      })
    }
  }
};
</script>
<style lang="less" scoped>
.breadcrumb {
  position: relative;
}
.el-button-group {
  position: absolute;
  right: 30px;
}
.tabs-list {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
  .tabs-item {
    flex: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 24px;
    cursor: pointer;
    &.active {
      position: relative;
      color: #409EFF;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 1.2em;
        height: 4px;
        margin: 0 auto;
        background-color: #18a689;
      }
    }
  }
}
</style>
