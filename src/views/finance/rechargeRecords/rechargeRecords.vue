<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item label="类型" prop="recharge_type">
            <el-select placeholder="不限" name="recharge_type" v-model="queryForm.recharge_type">
              <el-option label="不限" value></el-option>
              <el-option label="主平台自主充值" :value="1"></el-option>
              <el-option label="系统充值" :value="2"></el-option>
              <el-option label="其他平台自主充值" :value="3"></el-option>
              <el-option label="财务号转账" :value="4"></el-option>
              <el-option label="未知" :value="5"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关联上级" prop="link_user">
            <el-input v-model="queryForm.link_user" placeholder="上级手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker v-model="createDate" type="datetimerange" :picker-options="pickerOptions" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" align="right"></el-date-picker>
          </el-form-item>
          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number"
              @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="导出数量" prop="exportNum" title="仅针对导出订单">
            <el-select placeholder="500" name="exportNum" v-model="queryForm.exportNum">
              <el-option label="500" :value="500"></el-option>
              <el-option label="1000" :value="1000"></el-option>
              <el-option label="2000" :value="2000"></el-option>
              <el-option label="3000" :value="3000"></el-option>
              <el-option label="5000" :value="5000"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">系统充值记录列表</div>
        <div class="table-ctrl">
          <el-button type="primary" @click="exportExcel">导出数据</el-button>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="订单号" width="120" prop="order_sn"></el-table-column>
        <el-table-column label="用户名" width="120" prop="order_user_name"></el-table-column>
        <el-table-column label="手机号码" width="140" prop="order_user_phone"></el-table-column>
        <el-table-column label="金额" width="120" prop="price"></el-table-column>
        <el-table-column label="充值类型" width="160">
          <template slot-scope="scope">
            {{ rechargeTypeTexts[scope.row.recharge_type] }}
          </template>
        </el-table-column>
        <el-table-column label="关联上级" width="220">
          <template slot-scope="scope">
            <div v-if="scope.row.link_uid">
              {{ scope.row.link_user_name }}
              <template v-if="scope.row.link_user_phone">（{{ scope.row.link_user_phone }}）</template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" width="250" prop="remark"></el-table-column>

        <el-table-column label="创建时间" width="160" prop="create_time"></el-table-column>

        <el-table-column label="操作">
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
import XLSX from 'xlsx';
import moment from "moment";
import {nTimePickerConfig} from '@/config';

export default {
  name: 'crowdFundingRecharges',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        link_user: '',
        recharge_type: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),

        exportPageNum: 1,
        exportNum: 1000,
      },
      filter: {
        keyword: '',
        link_user: '',
        recharge_type: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),

        exportPageNum: 1,
        exportNum: 1000,
      },
      dataList: [],
      statusTexts: {
        [1]: '正常',
        [2]: '禁用',
        [3]: '充值待支付',
        [-1]: '删除'
      },
      rechargeTypeTexts: {
        [1]: '主平台自主充值',
        [2]: '系统充值',  //现金支付
        [3]: '其他平台自主充值',
        [4]: '财务号转账',
        [5]: '未知'
      },


      createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,


      token: {
        token: localStorage.getItem('token')
      },
      thumbData: {
        type: 6 //导入要充值集品券的人员
      },
      importData: [],
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
        link_user: '',
        recharge_type: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),

        exportPageNum: 1,
        exportNum: 1000,
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
        keyword: this.queryForm.keyword,
        link_user: this.queryForm.link_user,
        recharge_type: this.queryForm.recharge_type,
        start_time: this.createDate[0],
        end_time: this.createDate[1],

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum,
      };
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        link_user: this.filter.link_user,
        recharge_type: this.filter.recharge_type,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };


      this.$get('/admin/rechargeRecord/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        link_user: this.filter.link_user,
        recharge_type: this.filter.recharge_type,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time,

        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }


      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      this.$get('/admin/rechargeRecord/list', params, res => {
        let data = res.data.list || [];

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }


        let excelData = [];
        excelData.push([
          '订单号',
          '用户名',
          '手机号码',
          '金额',
          '充值类型',
          '关联上级',
          '关联上级手机号',
          '创建时间',
          '备注'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.order_sn,
            item.order_user_name,
            item.order_user_phone,
            item.price || 0,
            this.rechargeTypeTexts[item.recharge_type],
            item.link_user_name || '',
            item.link_user_phone || '',
            item.create_time,
            item.remark
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 120},
          {wpx: 120},
          {wpx: 120},
          {wpx: 80},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 140},
          {wpx: 200}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let col3 = XLSX.utils.encode_cell({r: i , c: 3});
          ws[col3].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "充值列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `充值列表${time}.xlsx`);
      });
    },

  }
};
</script>
<style lang="less" scoped>
.excel-uploader {
  display: inline-block;
  margin: 0 15px;
}
</style>

