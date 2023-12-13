<template>
  <div>
    <el-form :model="formData" label-width="80px">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline" label-width="80px">
          <el-form-item label="筛选" prop="keyword">
            <el-input v-model="queryForm.keyword" style="width: 217px;" placeholder="请输入手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form-item label="选择用户" prop="uid">
        <el-select class="standard-select" placeholder="请选择用户" v-model="formData.uid" @change="$forceUpdate()">
          <el-option v-for="user in dataList" :label="user.user_name + (user.user_phone ? ('(' + user.user_phone + ')') : '')" :value="user.uid" :key="user.uid"></el-option>
        </el-select>
        <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
        <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从选择用户的选择器里进行精确指定</div>
      </el-form-item>
      <el-form-item label="金额" prop="price">
        <el-input
          v-model="formData.price"
          style="width: 217px;"
          type="number"
          auto-complete="off"
          placeholder="记得填写金额哦"
        ></el-input> 元
      </el-form-item>
      <el-form-item label="操作类型">
        <div class="form-tips">{{ priceType || '请输入金额' }}</div>
      </el-form-item>
      <el-form-item label="业绩类型">
        <el-select placeholder="请选择" name="type" v-model="formData.custom_type">
          <el-option label="本金业绩" :value="1"></el-option>
          <el-option label="直推奖励业绩" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remark" style="width: 465px" auto-complete="off" placeholder="请填写"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'AddCrowdFunding',
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
  computed: {
    priceType() {
      const price = this.formData.price
      if (price == null || price == undefined || price === '') return false
      return price >= 0 ? '新增' : '减少'
    }
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
      if (!this.filter.keyword) return
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
      this.dataList = [];
    },
  }
};
</script>
