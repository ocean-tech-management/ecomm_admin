<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form ref="queryForm" :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item label="订单用户" prop="order_user">
            <el-input v-model="queryForm.order_user" placeholder="请输入订单用户关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="关联用户" prop="link_user">
            <el-input v-model="queryForm.link_user" placeholder="请输入关联用户关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item label="创建时间" prop="createDate">
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
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">用户关联充值业绩</div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column label="订单号" width="200" prop="order_sn"></el-table-column>
        <el-table-column label="用户名" width="120" prop="user_name"></el-table-column>
        <el-table-column label="手机号码" width="140" prop="user_phone"></el-table-column>
        <el-table-column label="金额" width="120" prop="price"></el-table-column>
        <el-table-column label="比例" width="120" >
          <template slot-scope="{ row }">
            {{ row.record_scale && +row.record_scale > 0 ? `${ (+row.record_scale * 100) }%` : row.record_scale }}
          </template>
        </el-table-column>
        <el-table-column label="订单总金额" width="120" prop="total_price"></el-table-column>
        <el-table-column label="关联上级用户姓名" width="140" prop="link_user_name"></el-table-column>
        <el-table-column label="关联上级用户手机号码" width="160" prop="link_user_phone"></el-table-column>
        <el-table-column label="记录类型" width="100" align="center">
          <template slot-scope="scope">
            {{rechargeTypeTexts[scope.row.recharge_type]}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="auto" prop="create_time"></el-table-column>
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
import moment from "moment";
import {nTimePickerConfig} from '@/config';
export default {
  name: 'achievementWithdrawals',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        order_user: '',
        link_user: '',
        keyword: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      filter: {
        order_user: '',
        link_user: '',
        keyword: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,


      dataList: [],

      rechargeTypeTexts: {
        [1]: '主平台自主充值',
        [2]: '系统充值',  //现金支付
        [3]: '其他平台自主充值',
        [4]: '财务号转账',
        [5]: '未知'
      },
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
        order_user: '',
        link_user: '',
        keyword: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      if(!this.createDate || this.createDate.length != 2) {
        return this.$message.error('请选择有效创建时间');
      }
      this.filter = {
        order_user: this.queryForm.order_user,
        link_user: this.queryForm.link_user,
        keyword: this.queryForm.keyword,
        start_time: this.createDate[0],
        end_time: this.createDate[1],
      };
      this.getList();
    },
    // 获取提现列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        order_user: this.filter.order_user,
        link_user: this.filter.link_user,
        keyword: this.filter.keyword,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };
      this.$get('/admin/user/linkRechargeList', queryVal, res => {
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
