<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="requestQuery()"></el-input>
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
              <el-button type="primary" @click="requestQuery()">查询</el-button>
              <el-button @click="requestQuery(true)">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">
            福利余额汇总
            <span class="error-color" style="font-size: 14px;">列表展示数据的时效性为统计时间之前, 数据仅供参考; 数据统计有较长时间缓存, 请勿频繁调用</span>
          </div>
          <div class="table-ctrl">
            <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.user_avatarUrl" />
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="100" prop="user_name"></el-table-column>
          <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>
          <el-table-column label="参与中未返本金额" width="150" prop="crowd_ing_price"></el-table-column>
          <el-table-column label="提现冻结中金额" width="150" prop="crowd_fronzen_balance"></el-table-column>
          <el-table-column label="可用余额" width="150" prop="crowd_balance"></el-table-column>
          <el-table-column label="截止统计时间总持有余额" width="180" prop="total_price"></el-table-column>
          <el-table-column label="用户注册时间" width="180" prop="user_create_time"></el-table-column>
          <el-table-column label="本次记录统计时间" min-width="180" prop="summary_time"></el-table-column>
        </el-table>
        <div v-show="dataList && dataList.length > 0" class="pagination">
          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
            layout="total, prev, pager, next" :page-count="count"></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import XLSX from 'xlsx';
export default {
  name: "crowdBalanceSummary",
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        exportPageNum: 1,
        exportNum: 1000,
      },

      dataList: [],
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    /**
     * 请求
     * @param {*} isForceRefresh 是否重置
     */
    requestQuery(isForceRefresh = false) {
      if (isForceRefresh) {
        this.queryForm = {
          keyword: '',
          exportPageNum: 1,
          exportNum: 1000,
        }
      }
      this.currentPage = 1;
      this.getList();
    },
    //获取列表
    getList() {
      let params = {
        page: this.currentPage,
        keyword: this.queryForm.keyword,
      };

      this.$get("/admin/crowdFunding/crowdBalanceSummary", params, (res) => {
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


    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.queryForm.keyword,

        page: this.queryForm.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.queryForm.exportNum,   //实际用参数名和变量名是不一致的哈
      }
      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      this.$get('/admin/crowdFunding/crowdBalanceSummary', params, res => {
        let data = res.data.list || [];

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        let excelData = [];
        excelData.push([
          '姓名',
          '手机号码',
          '参与中未返本金额',
          '提现冻结中金额',
          '可用余额',
          '截止统计时间总持有余额',
          '用户注册时间',
          '本次记录统计时间',
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.user_name,
            item.user_phone,
            item.crowd_ing_price,
            item.crowd_fronzen_balance,
            item.crowd_balance,
            item.total_price,
            item.user_create_time,
            item.summary_time,
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 120},
          {wpx: 120},
          {wpx: 150, t: 'n'},
          {wpx: 150, t: 'n'},
          {wpx: 150, t: 'n'},
          {wpx: 150, t: 'n'},
          {wpx: 150},
          {wpx: 150},
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          Array.isArray(ws['!cols']) && ws['!cols'].forEach((v, index) => {
            if (v.t) {
              let col2 = XLSX.utils.encode_cell({r: i , c: index});
              ws[col2].t = v.t;
            }
          })
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "福利余额汇总");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `福利余额汇总${time}.xlsx`);
      });
    },

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
  box-shadow: 0 0 5px 1px rgba(0, 0, 0, .1);
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
