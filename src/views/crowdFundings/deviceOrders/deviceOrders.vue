<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入设备订单名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker name="createDate" v-model="queryForm.createDate" type="datetimerange"
              :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :clearable="false"
              :editable="false"></el-date-picker>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">设备订单列表</div>
        <div class="table-ctrl">
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="订单号" width="180" prop="order_sn"></el-table-column>
        <el-table-column label="设备编码" width="100" prop="device_sn">
        </el-table-column>
        <el-table-column label="设备信息" width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.device">
              {{ scope.row.device.device_name }}【{{ scope.row.device.device_show_sn }}】
            </div>
          </template>
        </el-table-column>
        <el-table-column label="套餐信息" width="140">
          <template slot-scope="scope">
            <div v-if="scope.row.combo">
              {{ scope.row.combo.combo_title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户昵称" width="100" prop="user_name"></el-table-column>
        <el-table-column label="手机号码" width="110" prop="user_phone"></el-table-column>
        <el-table-column label="总费用" width="80" prop="total_price"></el-table-column>
        <el-table-column label="实际支付" width="100" prop="real_pay_price" align="center">
        </el-table-column>
        <el-table-column label="下单日期" width="150" prop="create_time"></el-table-column>
        <el-table-column label="支付类型" width="100" align="center">
          <template slot-scope="scope">
            {{ payTypeTexts[scope.row.pay_type] }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="140" prop="status" align="center">
          <template slot-scope="scope">
            <div :class="statusColors[scope.row.order_status]">{{ statusTexts[scope.row.order_status] }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('device/complete')">
              <el-button v-if="scope.row.order_status == 2" type="text" size="default"
                @click="completeOrder(scope.row)">完成订单</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

  </div>
</template>

<script>

import moment from 'moment';
import {nTimePickerConfig} from '@/config';
export default {
  name: 'deviceOrders',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      },
      filter: {
        keyword: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      },
      ...nTimePickerConfig,

      statusTexts: {
        [1]: '未支付',
        [2]: '支付成功，体验中',
        [3]: '已发货',
        [4]: '已签收',
        [5]: '售后申请',
        [6]: '售后中',
        [7]: '售后成功',
        [8]: '已完成',
        [-1]: '已取消',
        [-2]: '超时自动关闭',
        [-3]: '已关闭',
        [-4]: '未成功拼团'
      },
      statusColors: {
        [1]: 'warning-color',
        [5]: 'error-color',
        [6]: 'warning-color',
        [-1]: 'tips-color'
      },
      payTypeTexts: {
        [1]: '余额支付',
        [2]: '微信支付',  //现金支付
        [4]: '拼拼支付',
        [5]: '集品券支付',
        [6]: '协议支付',
        [7]: '健康豆支付'
      },

      dataList: [],
      formData: {},
      addVisible: false,
      editVisible: false
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        createDate: this.queryForm.createDate
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };
      if(this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }
      this.$get('/admin/device/orderList', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },


    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    completeOrder(row) {
      this.$confirm(`您将对该订单进行完成订单操作, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/device/complete', {
        device_sn: row.device_sn,
        order_sn: row.order_sn
        }, res => {
          this.$message.success('操作成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }

  }
};
</script>
