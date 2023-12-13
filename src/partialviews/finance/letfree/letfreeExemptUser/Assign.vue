<template>
  <div>
    <div style="margin-top: 60px;">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline" label-width="80px">
          <el-form-item label="筛选" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form :model="formData" label-width="80px">
        <el-form-item label="指定用户" prop="uid">
          <el-select class="standard-select" placeholder="请选择" v-model="formData.uid" @change="updateUser">
            <el-option label="请选择" value></el-option>
            <el-option v-for="user in dataList" :label="user.user_name + (user.user_phone ? ('(' + user.user_phone + ')') : '')" :value="user.uid" :key="user.uid"></el-option>
          </el-select>
          <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
          <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定上级的选择器里进行精确指定</div>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input style="width: 300px" auto-complete="off" placeholder="填一下" v-model="formData.realName"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>


<script>
export default {
  name: "Assign",
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
    formData: Object,
    // leaderData: Array
  },
  mounted() {},
  methods: {
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        keyword: this.filter.keyword
      };

      this.$get('/admin/member/list', queryVal, res => {
        let dataList = res.data;
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].uid == this.formData.uid) {
            // 剔除他自己本身
            dataList.splice(i, 1);
            break;
          }
        }
        this.dataList = dataList;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.getUsers();
    },

    updateUser(val) {
      for(let i = 0; i < this.dataList.length; i++) {
        if(this.dataList[i].uid == val) {
          this.formData.name = this.dataList[i].user_name;
          this.formData.userPhone = this.dataList[i].user_phone;
        }
      }
      this.$forceUpdate();
    }
  }
};
</script>