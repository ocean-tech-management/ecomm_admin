<template>
  <div>
    <div class="userinfo">
      <span>用户昵称：</span>
      <span class="success-color">{{userInfo.name}}</span>
    </div>
    <el-table ref="repurchaseInfos" style="width: 100%; margin-top: 45px" :data="dataList">
      <el-table-column label="归属活动" prop="activity_title"></el-table-column>
      <el-table-column label="归属专区" width="350" prop="area_title"></el-table-column>
      <el-table-column label="可寄售次数" width="150" prop="repurchase_capacity"></el-table-column>
    </el-table>
    <div v-show="dataList && dataList.length > 0" class="pagination">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :pager-count="7"
        layout="total, prev, pager, next"
        :page-count="count"
      ></el-pagination>
    </div>
  </div>
</template>

<script>

export default {
  name: 'RepurchaseNumber',
  data() {
    return {
      dataList: [],

      currentPage: 1,
      count: 1
    };
  },
  props: {
    userInfo: Object
  },
  mounted() {
    this.getList();
  },
  methods: {
    reloadData() {
      this.currentPage = 1;
      this.count = 1;
      this.dataList = [];
      setTimeout(() => {
        this.getList();
      }, 20)
    },
    //获取列表
    getList() {
      let queryVal = {
        uid: this.userInfo.uid,
        page: this.currentPage
      };

      this.$get('/admin/ppyl/userRepurchase', queryVal, res => {
        let data = res.data.list || [];

        this.dataList = data;
        this.count = res.data.pageTotal;
      });
    },
    
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
  }
};
</script>
<style lang="less">
  .userinfo {
    font-size: 16px;
  }
</style>
