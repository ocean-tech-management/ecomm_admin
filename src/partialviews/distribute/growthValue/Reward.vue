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
          <el-select class="standard-select" placeholder="需要指定要奖励的用户" v-model="formData.uid" @change="updateSelectUser">
            <el-option v-for="user in dataList" :label="user.name" :value="user.uid" :key="user.uid"></el-option>
          </el-select>
          <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
          <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定上级的选择器里进行精确指定</div>
        </el-form-item>
        <el-form-item label="奖励成长值" prop="growth_value">
          <el-input style="width: 450px" type="number" placeholder="请填入1，2，3之类的正整数" v-model="formData.growth_value"/>
        </el-form-item>
        <el-form-item label="备注" prop="growth_value">
          <el-input style="width: 500px" placeholder="请填入" v-model="formData.remark"/>
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
      this.formData.uid = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        page: 1,
        keyword: this.filter.keyword,
        needAllLevel: true
      };

      this.$get('/admin/growthValue/user', queryVal, res => {
        let dataList = res.data.list || [];
        this.dataList = dataList;
        if(dataList.length > 0) {
          this.formData.uid = dataList[0].uid;
          this.formData.phone = dataList[0].phone;
        } else {
          this.formData.uid = null;
          this.formData.phone = null;
        }
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
    },
    updateSelectUser(uid) {
      if(!uid) return;
      for(let i = 0; i < this.dataList.length; i++) {
        if(this.dataList[i].uid === uid) {
          this.formData.phone = this.dataList[i].phone;
          break;
        }
      }
    }
  }
};
</script>