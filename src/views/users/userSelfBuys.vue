<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="上级手机号码" prop="topUserPhone">
            <el-input v-model="queryForm.topUserPhone" placeholder="请输入精准手机号码或置空" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="排序方式" prop="sortType">
            <!-- 使用场景 -->
            <el-select placeholder="不限" name="sortType" v-model="queryForm.sortType">
              <el-option label="按用户创建时间倒序" :value="1"></el-option>
              <el-option label="按订单实付总金额倒序" :value="2"></el-option>
              <el-option label="按订单总数倒序" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker name="createDate" v-model="queryForm.createDate" 
                :picker-options="pickerOptions" type="datetimerange" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss" :editable="false"></el-date-picker>
          </el-form-item>
          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number" @keyup.enter.native="queryInfo"></el-input>
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
        <div class="table-title">用户自购业绩列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('excel/userSelfBuyOrder')">
            <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.avatarUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="100" prop="name">
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
        <el-table-column label="身份" width="100" prop="vip_name"></el-table-column>
        <el-table-column label="上级" width="180">
          <template slot-scope="scope">
            {{scope.row.link_user_name ? scope.row.link_user_name : '——'}}
            <span v-if="scope.row.link_user_level"> | {{scope.row.link_user_vip_name}}</span>
            <span v-if="scope.row.link_user_phone">({{scope.row.link_user_phone}})</span>
          </template>
        </el-table-column>
        <el-table-column label="自购订单金额" width="110" prop="order_summary_sum"></el-table-column>
        <el-table-column label="自购订单数" width="100" prop="order_summary_count"></el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 25, 50]"
          :page-size="pageCount"
          :pager-count="7"
          layout="sizes, prev, pager, next"
          :page-count="count"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import XLSX from 'xlsx';

import {nTimePickerConfig} from '@/config';

export default {
  name: 'userSelfBuys',
  data() {
    return {
      currentPage: 1,
      pageCount: 10,
      count: 1,
      queryForm: {
        keyword: '',
        topUserPhone: '',
        createDate: [],
        sortType: 1,
        
        exportPageNum: 1,
        exportNum: 1000,
      },
      filter: {
        keyword: '',
        topUserPhone: '',
        createDate: [],
        sortType: 1,
        
        exportPageNum: 1,
        exportNum: 1000,
      },
      dataList: [],
      leaderData: [],
      userCount: 0,

      formData: {},
      stepsData: [],

      ...nTimePickerConfig
    }
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
        topUserPhone: '',
        createDate: [],
        sortType: 1,
        
        exportPageNum: 1,
        exportNum: 1000,
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        topUserPhone: this.queryForm.topUserPhone,
        createDate: this.queryForm.createDate,
        sortType: this.queryForm.sortType,
        
        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum,
      };
      this.getList();
    },

    getList() {
      let queryVal = {
        page: this.currentPage,
        pageNumber: this.pageCount,
        keyword: this.filter.keyword,
        topUserPhone: this.filter.topUserPhone,
        sortType: this.filter.sortType
      };
      if(this.filter.createDate && this.filter.createDate.length == 2) {
        queryVal.order_start_time = this.filter.createDate[0];
        queryVal.order_end_time = this.filter.createDate[1];
      }
      if(queryVal.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(queryVal.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      }

      this.$get('/admin/user/orderList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    handleSizeChange(value) {
      this.pageCount = value;
      this.currentPage = 1;
      this.getList();
    },

    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        topUserPhone: this.filter.topUserPhone,
        sortType: this.filter.sortType,
        
        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }
      
      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        params.order_start_time = this.filter.createDate[0];
        params.order_end_time = this.filter.createDate[1];
      }
      if(!params.order_start_time || !params.order_end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      this.$get('/admin/excel/userSelfBuyOrder', params, res => {
        let data = res.data.list || [];
        
        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数剧超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        let excelData = [];
        excelData.push([
          '姓名', 
          '手机号码', 
          '身份', 
          '上级',
          '自购订单金额',  
          '自购订单数'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.name, 
            item.phone, 
            item.vip_name, 
            item.link_superior_user ? `${item.link_user_name} | ${item.link_user_vip_name}(${item.link_user_phone})` : '', 
            item.order_summary_sum || 0, 
            item.order_summary_count || 0
          ]);
        }
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 120},
          {wpx: 80},
          {wpx: 320},
          {wpx: 100},
          {wpx: 100}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let totalPriceRange = XLSX.utils.encode_cell({r: i , c: 4});
          ws[totalPriceRange].t = 'n';
          let realPayRange = XLSX.utils.encode_cell({r: i , c: 5});
          ws[realPayRange].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "自购业绩列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `自购业绩列表${time}.xlsx`);
      });
    }




  }
};
</script>
