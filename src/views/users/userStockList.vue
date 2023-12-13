<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="订单编号" prop="order_sn">
              <el-input v-model="queryForm.order_sn" placeholder="请输入订单编号" @keyup.enter.native="queryInfo"></el-input>
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
      </div>
    </div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">
            用户股票余额列表 
            <span v-if="userInfo" class="success-color">{{userInfo.name || ''}} <template v-if="userInfo.phone && userInfo.phone !== ''">({{userInfo.phone}})</template></span>
          </div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('excel/userStocks')">
              <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
            </template>
          </div>
        </div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="序号" width="90" type="index"></el-table-column>
          <el-table-column label="订单编号" width="220" prop="order_sn"></el-table-column>
          <el-table-column label="订单用户" width="200">
            <template slot-scope="scope">
              {{scope.row.order_user_name}}<template v-if="scope.row.order_user_phone">({{scope.row.order_user_phone}})</template>
            </template>
          </el-table-column>
          <el-table-column label="分润金额" width="150">
            <template slot-scope="scope">
              <span>{{scope.row.real_divide_price}}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" prop="arrival_status" align="center">
          </el-table-column>
          <el-table-column label="备注/提醒" width="220" prop="remark"></el-table-column>
          <el-table-column label="发生时间" width="150" prop="create_time"></el-table-column>
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
  </div>
</template>

<script>
import moment from "moment";
import XLSX from 'xlsx';
import {nTimePickerConfig} from '@/config';


export default {
  name: "userStockList",
  data() {
    return {
      uid: null,
      userInfo: null,

      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        order_sn: '',
        
        exportPageNum: 1,
        exportNum: 1000,
      },
      filter: {
        keyword: '',
        order_sn: '',
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        
        exportPageNum: 1,
        exportNum: 1000,
      },

      dataList: [],
      detailVisible: false,
      formData: {
      },
      
      createDate: [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,
    };
  },
  mounted() {
    this.uid = this.$route.query.id;
    if(!this.uid) {
      this.$message.error('用户无效，正在返回');
      setTimeout(() => {
        this.$router.go(-1);
      }, 2000);
      return;
    }
    
    this.getInfo();
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
        order_sn: '',
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        
        exportPageNum: 1,
        exportNum: 1000,
      };
      this.createDate = [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        order_sn: this.queryForm.order_sn,
        
        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum,
      };
      if(this.createDate && this.createDate.length == 2) {
        this.filter.start_time = this.createDate[0];
        this.filter.end_time = this.createDate[1];
      }
      this.getList();
    },
    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        
        uid: this.uid,
        keyword: this.filter.keyword,
        order_sn: this.filter.order_sn,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };

      this.$get("/admin/divide/stocksList", queryVal, (res) => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    getInfo() {
      if (!this.$auths.includes('user/info')) return;
      let params = {
        uid: this.uid
      }
      this.$sget("/admin/user/info", params, (res) => {
        let userInfo = res.data || {};

        this.userInfo = userInfo;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    
    // 导出excel表格
    exportExcel() {
      if(!this.userInfo || !this.userInfo.uid) return this.$message.warning('无用户详情权限或网络问题导致用户信息异常，请刷新重试');
      let params = {
        uid: this.uid,
        keyword: this.filter.keyword,
        order_sn: this.filter.order_sn,
        
        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }
      
      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      if(this.filter.start_time && this.filter.end_time) {
        params.start_time = this.filter.start_time;
        params.end_time = this.filter.end_time;
      }
      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      this.$get('/admin/excel/userStocks', params, res => {
        let data = res.data.list || [];
        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数剧超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        let excelData = [];
        excelData.push([
          '订单编号', 
          '订单用户', 
          '分润金额', 
          '状态', 
          '备注/提醒',
          '发生时间'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];
          item.remark = `${item.remark}${item.pay_type ? `【${this.payTypeTexts[item.pay_type]}】` : ''}`;
          excelData.push([
            item.order_sn, 
            `${item.order_user_name}(${item.order_user_phone})`, 
            item.real_divide_price || 0, 
            item.arrival_status,
            item.remark,
            item.create_time
          ]);
        }
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 200},
          {wpx: 100},
          {wpx: 100},
          {wpx: 320},
          {wpx: 140},
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let priceRange = XLSX.utils.encode_cell({r: i , c: 2});
          ws[priceRange].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "用户股票余额列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `用户股票余额列表${time}.xlsx`);
      });
    }

  },
};
</script>


<style lang="less" scoped>
.order-profit-overviews {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
}
.order-profit-overview {
  width: 160px;
  min-width: 140px;
  max-width: 160px;
  height: 80px;
  padding: 5px 10px;
  margin-right: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 5px 1px rgba(0,0,0,.1);
}
.order-profit-overview-title {
  margin-top: 10px;
  font-size: 18px;
  white-space: nowrap;
}
.order-profit-overview-val {
  margin-top: 10px;
  font-size: 16px;
  white-space: nowrap;
}

</style>