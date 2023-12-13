<template>
  <el-container id="wrapper" class="wrapper-container">
    <el-container class="page-content" direction="vertical">
      <Header></Header>
      <el-main class="main">
        <Nav></Nav>
        <div id="page" class="page">
          <Breadcrumbs></Breadcrumbs>
          <keep-alive>
            <router-view v-if="!$route.meta.subpage"></router-view>
          </keep-alive>
          <router-view v-if="$route.meta.subpage"></router-view>
          <Footer></Footer>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Header from "@/layout/Header.vue";
import Nav from "@/layout/Nav.vue";
import Breadcrumbs from "@/layout/Breadcrumbs.vue";
import Footer from "@/layout/Footer.vue";

import {
  expireTime
} from '../config.js';

export default {
  name: "Main",
  components: {
    Header,
    Nav,
    Breadcrumbs,
    Footer
  },
  data() {
    return {}
  },
  created() {
    this.updateTokenTask();
    console.log(this.$route);
  },
  methods: {
    updateTokenTask() {
      if (localStorage.getItem('token')) {
        setTimeout(() => {
          this.updateTokenTask();
        }, 1000 * 60 * 20); //20分钟检查一下需不需要自动刷新一次token

        let current = new Date().getTime();
        let last = localStorage.getItem('lastUpdateTime');
        if (last && current - last < expireTime) return;
        this.$spost('/admin/token/refresh', null, res => {
          localStorage.setItem('token', res.data);
          this.$store.commit('updateToken', res.data)
          localStorage.setItem('lastUpdateTime', new Date().getTime());
        })
      }
    }
  }
};
</script>
