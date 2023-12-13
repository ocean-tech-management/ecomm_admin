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
          <el-select class="standard-select" placeholder="需要操作的用户" v-model="userIndex" @change="updateSelectUser">
            <el-option v-for="(user, userIndex) in dataList" :label="user.name + (user.phone ? ('(' + user.phone + ')') : '')" :value="userIndex" :key="userIndex"></el-option>
          </el-select>
          <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
          <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定用户的选择器里进行精确指定</div>
        </el-form-item>
        <el-form-item label="额外提现额度">
          <el-input style="width: 250px" auto-complete="off" placeholder="请填写" type="number" v-model="formData.price"></el-input>
        </el-form-item>
        <el-form-item label="生效类型">
          <el-select placeholder="请选择" name="valid_type" v-model="formData.valid_type">
            <el-option label="永久生效" :value="1"></el-option>
            <el-option label="有限期生效" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.valid_type == 2" label="有效期" prop="createDate">
          <el-date-picker
            v-model="createDate"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            :clearable="false"
            align="right"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input style="width: 450px" auto-complete="off" placeholder="请填写" v-model="formData.remark"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import {nTimePickerConfig} from '@/config';
export default {
  name: "UserExtraWithdrawLimit",
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

      userIndex: '',
      createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {
    resetData() {
      this.userIndex = '';
      this.createDate = [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.formData.uid = '';
      this.formData.phone = '';
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
        if(this.dataList.length > 0) {
          this.userIndex = 0;
          this.formData.uid = this.dataList[this.userIndex].uid;
          this.formData.phone = this.dataList[this.userIndex].phone;
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

    updateSelectUser(val) {
      this.formData.uid = this.dataList[val].uid;
      this.formData.phone = this.dataList[val].phone;
    },

    confirmInfos() {
      let data = {
        ...this.formData,
        valid_start_time: '',
        valid_end_time: ''
      }
      if(this.createDate) {
        data.valid_start_time = this.createDate[0];
        data.valid_end_time = this.createDate[1];
      }
      return data;
    }


  }
};
</script>