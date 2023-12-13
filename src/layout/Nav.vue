<template>
  <el-aside id="menu-aside" class="menu-aside" :class="isCollapse ? 'mini' : ''" width="200">
    <el-menu class="page-menu" :default-active="defaultActive" background-color="#fff" text-color="#333"
      active-text-color="#4877e8" :collapse-transition="true" :collapse="isCollapse" router>
      <!-- 该路由只有一个时渲染该板块 -->
      <el-menu-item
        v-if="currentNavs.meta && !currentNavs.children && (!currentNavs.meta.require || $auths.includes(currentNavs.meta.require))"
        :index="currentNavs.alias || currentNavs.path">
        <i :class="currentNavs.meta.icon || 'el-icon-menu'"></i>
        <span>{{ currentNavs.meta.title || '未命名' }}</span>
      </el-menu-item>
      <!-- 该路由不只只有一个时渲染该板块 -->
      <el-submenu v-if="currentNavs.meta && currentNavs.children" class="page-submenu" popper-class="submenu-popper"
        :index="currentNavs.alias || currentNavs.path">
        <template slot="title">
          <i :class="currentNavs.meta.icon || 'el-icon-menu'"></i>
          <span>{{ currentNavs.meta.title || '未命名' }}</span>
        </template>
        <template v-for="(item, index) in currentNavs.children">
          <!-- 检查require值，判断是否有权限要求按需渲染 -->
          <el-menu-item v-if="!item.meta.require || $auths.includes(item.meta.require)"
            :class="item.meta.parentPath ? 'hidden' : ''" :key="item.meta.title || ('l' + index)"
            :index="item.alias || item.path">{{ item.meta.title }}</el-menu-item>
        </template>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>


<script>
export default {
  name: 'Nav',
  data() {
    return {
      isCollapse: window && window.innerWidth > 1120 ? false : true,
      currentNavs: {}
    };
  },
  computed: {
    defaultActive: function() {
      let activeIndex = this.$route.path;
      if (this.$route.meta && this.$route.meta.subpage) {
        // 如果meta里带subpage参数，认为该path为隐藏的二级页面，高亮其parentPath对应path
        activeIndex = this.$route.meta.parentPath;
      }
      if (activeIndex == '/') activeIndex = '/index';

        this.$forceUpdate();
      return activeIndex;
    }
  },
  watch: {
    $route(val, oldVal) {
      // 监听路由变动，实时更新Nav栏数据
      this.loadNav();
    }
  },
  mounted: function() {
    this.loadNav();
  },
  methods: {
    loadNav: function() {
      let routerConfig = this.$store.state.routerConfig[0].children;  //索引0需要由路由表里页面的顺序来决定
      let routePath = this.$route.path;
      for (let i = 0; i < routerConfig.length; i++) {
        let item = routerConfig[i];
        if (
          item.path == routePath ||
          item.alias == routePath ||
          (item.meta.childPath && item.meta.childPath.includes(routePath))
        ) {
          this.currentNavs = item;
          break;
        }
      }
    },
    toggleCollapse: function() {
      this.isCollapse = !this.isCollapse;
    }
  }
};
</script>

<style lang="less" scope>
.el-menu {
  width: 200px;
}

.el-menu-item.hidden {
  display: none !important;
}

.el-menu--collapse {
  width: 64px;
  transition: width 0.3s linear;
}

@media screen and (max-width: 768px) {
  .el-menu--vertical.submenu-popper {
    top: 56px !important;
  }
}
</style>