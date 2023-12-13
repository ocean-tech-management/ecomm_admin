<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="order_sn">
            <el-input v-model="queryForm.order_sn" placeholder="请输入设备订单号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker
              name="createDate"
              v-model="queryForm.createDate"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              :clearable="false" 
              :editable="false"
            ></el-date-picker>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">设备订单分润列表</div>
        <div class="table-ctrl">
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="订单号" width="180" prop="order_sn"></el-table-column>
        <el-table-column label="设备编码" width="100" prop="device_sn">
        </el-table-column>
        <el-table-column label="设备信息" width="200">
          <template slot-scope="scope">
            <div>
              {{scope.row.device_name}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分润用户" width="100" prop="link_user_name"></el-table-column>
        <el-table-column label="手机号码" width="110" prop="link_user_phone"></el-table-column>
        <el-table-column label="订单总额" width="80" prop="total_price"></el-table-column>
        <el-table-column label="实际分润" width="100" prop="real_divide_price">
        </el-table-column>
        <el-table-column label="分润类型" width="140" prop="device_divide_type" align="center">
          <template slot-scope="scope">
            {{divideTypeTexts[scope.row.device_divide_type]}}
          </template>
        </el-table-column>
        <el-table-column label="创建日期" width="150" prop="create_time"></el-table-column>
        
        <el-table-column label="状态" width="140" prop="status" align="center">
          <template slot-scope="scope">
            <div :class="statusColors[scope.row.status]">{{statusTexts[scope.row.status]}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
          </template>
        </el-table-column>
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

import moment from 'moment';

import {nTimePickerConfig} from '@/config';
export default {
  name: 'deviceDivides',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        order_sn: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      },
      filter: {
        order_sn: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      },
      ...nTimePickerConfig,

        // '分润金额到账状态 1为到账 2为冻结中 3为退款取消分润 -1为整单被删除',
        statusTexts: {
          [1]: '到账',
          [2]: '冻结中',
          [3]: '退款取消分润',
          [-1]: '整单被删除'
        },
        divideTypeTexts: {
          [1]: '设备上级分润',
          [2]: '设备区代分润',
        },
        statusColors: {
          [1]: 'warning-color',
          [5]: 'error-color',
          [6]: 'warning-color',
          [-1]: 'tips-color'
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
        order_sn: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        order_sn: this.queryForm.order_sn,
        createDate: this.queryForm.createDate
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        order_sn: this.filter.order_sn
      };
      if(this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }
      this.$get('/admin/device/divide', queryVal, res => {
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
