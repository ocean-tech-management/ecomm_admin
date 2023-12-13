<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="用户ID" prop="share_id">
            <el-input v-model="queryForm.share_id" placeholder="请输入用户ID" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="应用ID" prop="app_id">
            <el-input v-model="queryForm.app_id" placeholder="请输入应用ID" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">授权清除记录</div>
        <div class="table-ctrl">
          <!-- <el-button type="primary" @click="openAddTeamLeader">添加指定团队长</el-button> -->
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <!-- <el-table-column label="序号"  width="150" prop="uid">
        </el-table-column> -->
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.headimgurl"/>
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="140" prop="name">
          <template slot-scope="scope">
            <div>{{scope.row.nickname}}</div>
<!--            <div style="font-size: 13px; color: #999">{{scope.row.access_name}}</div>-->
          </template>
        </el-table-column>
        <el-table-column label="用户ID" width="120" prop="share_id"></el-table-column>
        <el-table-column label="应用名称" width="140" prop="access_name"></el-table-column>
        <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
        <el-table-column label="操作人员" width="140" prop="admin_name"></el-table-column>
        <el-table-column label="操作人账号" width="140" prop="admin_account"></el-table-column>
        <el-table-column label="清除说明" min-width="220" prop="desc"></el-table-column>
        <el-table-column label="证明图片" width="100" prop="image_url">
          <template slot-scope="{ row }">
            <el-image
              style="width: 100px; height: 100px"
              :src="row.image_url"
              :preview-src-list="[row.image_url]">
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="应用ID" width="140" prop="app_id"></el-table-column>
        <el-table-column label="访问入口身份标识" width="140" prop="access_key"></el-table-column>
        <el-table-column label="清除时间" min-width="150" prop="create_time"></el-table-column>
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
  </div>
</template>
<script>
export default {
  name: 'authorizationClearRecord',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        share_id: '',
        app_id: '',
      },
      filter: {
        share_id: '',
        app_id: ''
      },
      dataList: [],
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        share_id: '',
        app_id: '',
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        share_id: this.queryForm.share_id,
        app_id: this.queryForm.app_id,
      };
      this.getList();
    },
    getList() {
      let queryVal = {
        page: this.currentPage,
        share_id: this.filter.share_id,
        app_id: this.filter.app_id,
      };

      this.$get('/admin/UserAuthClear/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
  }
}
</script>
<style lang="less" scoped></style>
