<template>
  <div>
    <div style="margin-top: 60px;">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" label-width="100px">
          <el-form-item label="筛选关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入名称或手机号码" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="指定用户" prop="uid">
          <el-select class="standard-select" placeholder="请选择" v-model="formData.uid">
            <el-option v-for="user in dataList" :label="user.name" :value="user.uid" :key="user.uid"></el-option>
          </el-select>
          <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
          <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定用户的选择器里进行精确指定</div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "RewardGrowthValue",
  data() {
    return {
      queryForm: {
        keyword: '',
        phone: ''
      },
      filter: {
        keyword: '',
        phone: ''
      },
      dataList: [],
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.formData.uid = '';
      this.getUsers();
    },
    //获取列表
    getUsers() {
      if(!this.filter.keyword || this.filter.keyword.trim() === '') return this.$message.warning('请输入关键词，不要留空');
      let params = {
        keyword: this.filter.keyword,
        needAllLevel: 1, //查全部用户
        page: 1,
        pageNumber: 20
      };
      this.$get('/admin/user/list', params, res => {
        this.dataList = res.data.list || [];
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: '',
        phone: ''
      };
      this.formData.uid = null;
      this.getUsers();
    }
  }
};
</script>