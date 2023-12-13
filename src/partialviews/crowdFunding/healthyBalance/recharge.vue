<template>
  <div>
    <el-form :model="formData" label-width="150px">
      
      <el-form-item label="充值健康豆数">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          type="number"
          v-model="formData.healthy_price"
        ></el-input>
      </el-form-item>

      <div style="margin-top: 60px;">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline" label-width="150px">
            <el-form-item label="筛选" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryInfo">查询</el-button>
              <el-button @click="resetQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <el-form :model="formData" label-width="150px">
          <el-form-item label="关联用户" prop="uid">
            <el-select class="standard-select" placeholder="请选择" v-model="formData.uid" @change="$forceUpdate()">
              <el-option label="请选择" value></el-option>
              <el-option v-for="user in dataList" :label="user.name + (user.phone ? ('(' + user.phone + ')') : '')" :value="user.uid" :key="user.uid"></el-option>
            </el-select>
            <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
            <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定上级的选择器里进行精确指定</div>
          </el-form-item>
        </el-form>
      </div>
      
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'healthyBalanceRecharge',
  data() {
    return {
 
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
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
      this.formData.uid = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        keyword: this.filter.keyword
      };

      this.$get('/admin/device/deviceUser', queryVal, res => {
        let dataList = res.data;
        this.dataList = dataList;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.formData.uid = null;
      this.getUsers();
    },
  }
};
</script>
