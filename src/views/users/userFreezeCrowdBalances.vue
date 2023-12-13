<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="resetQuery()"></el-input>
            </el-form-item>
            <el-form-item label="创建时间" prop="createDate">
              <el-date-picker v-model="createDate" type="datetimerange" :picker-options="pickerOptions"
                              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
                              value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" align="right"></el-date-picker>
            </el-form-item>

            <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
              <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number"
                        @keyup.enter.native="resetQuery()"></el-input>
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
              <el-button type="primary" @click="resetQuery()">查询</el-button>
              <el-button @click="resetQuery(true)">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">
            待释放集品券明细
            <span v-if="userInfo" class="success-color">{{ userInfo.name || '' }} <template
              v-if="userInfo.phone && userInfo.phone !== ''">({{ userInfo.phone }})</template></span>
          </div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('excel/userCrowdFundBalance')">
              <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
            </template>
          </div>
        </div>
        <template v-if="$auths.includes('user/otherBalanceSummary')">
          <div class="order-profit-overviews">
            <div v-if="summary.total_balance || summary.total_balance === 0" class="order-profit-overview">
              <div class="order-profit-overview-title">总待释放金额</div>
              <div class="order-profit-overview-val">{{ summary.total_balance }}</div>
            </div>
            <div v-if="summary.withdraw_balance || summary.withdraw_balance === 0" class="order-profit-overview">
              <div class="order-profit-overview-title">提现总金额</div>
              <div class="order-profit-overview-val">{{ summary.withdraw_balance }}</div>
            </div>
            <div v-if="summary.fronzen_balance || summary.fronzen_balance === 0" class="order-profit-overview">
              <div class="order-profit-overview-title">剩余待释放金额</div>
              <div class="order-profit-overview-val">{{ summary.fronzen_balance }}</div>
            </div>
          </div>
          <div style="height: 20px"></div>
        </template>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="订单编号" width="180" prop="order_sn"></el-table-column>
          <el-table-column label="原始金额" width="100" prop="original_price"></el-table-column>
          <el-table-column label="比例" width="100" prop="scale"></el-table-column>
          <el-table-column label="总金额" width="100" prop="total_price"></el-table-column>
          <el-table-column label="剩余待释放金额" width="130" prop="last_total_price"></el-table-column>
          <el-table-column label="发放状态" width="100" prop="grant_status">
            <template #default="{ row }">
              {{ grantStatusTexts[row.grant_status] || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="众筹活动区名称" width="220" prop="activity_name"></el-table-column>
          <el-table-column label="众筹活动期数" width="120" prop="crowd_round_number"></el-table-column>
          <el-table-column label="众筹活动轮数" width="120" prop="crowd_period_number"></el-table-column>
          <el-table-column label="创建时间" min-width="180" prop="create_time"></el-table-column>
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
import {nTimePickerConfig} from '@/config';


export default {
  name: "userCrowdBalances",
  data() {
    return {
      uid: null,
      userInfo: null,

      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',

        exportPageNum: 1,
        exportNum: 1000,
      },

      dataList: [],
      summary: {},

      grantStatusTexts: {
        [1]: '发放完成',
        [2]: '发放中',
        [3]: '待发放'
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
    this.getSummary();
  },
  methods: {
    //重置查询条件
    resetQuery(isReset = false) {
      if (isReset) {
        this.queryForm = {
          keyword: '',
          exportPageNum: 1,
          exportNum: 1000,
        }
        this.createDate = [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
      }
      this.currentPage = 1;
      this.getList();
    },
    //获取列表
    getList() {
      let params = {
        page: this.currentPage,

        uid: this.uid,
        keyword: this.queryForm.keyword,
      };
      if (this.createDate && this.createDate.length === 2) {
        params.start_time = this.createDate[0];
        params.end_time = this.createDate[1];
      }

      this.$get("/admin/crowdFuse/balance", params, (res) => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 统计
    getSummary() {
      if (!this.$auths.includes('user/otherBalanceSummary')) return;
      let params = {
        uid: this.uid,
        type: 6, // 1-集品券 2-集品豆 3-健康豆 4-礼品券 6-待释放集品券
      };
      this.$sget("/admin/user/otherBalanceSummary", params, (res) => {
        let data = res.data;
        this.summary = data;
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
        keyword: this.queryForm.keyword,

        page: this.queryForm.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.queryForm.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      if (this.createDate && this.createDate.length === 2) {
        params.start_time = this.createDate[0];
        params.end_time = this.createDate[1];
      }
      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      this.$get('/admin/crowdFuse/balance', params, res => {
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
          '原始金额',
          '比例',
          '总金额',
          '剩余待释放金额',
          '发放状态',
          '众筹活动区名称',
          '众筹活动期数',
          '众筹活动轮数',
          '创建时间',
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];
          excelData.push([
            item.order_sn,
            item.original_price,
            item.scale,
            item.total_price,
            item.last_total_price,
            this.grantStatusTexts[item.grant_status],
            item.activity_name,
            item.crowd_round_number,
            item.crowd_period_number,
            item.create_time,
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 180},
          {wpx: 180, t: 'n' },
          {wpx: 180, t: 'n' },
          {wpx: 180, t: 'n' },
          {wpx: 180, t: 'n' },
          {wpx: 180},
          {wpx: 180},
          {wpx: 180},
          {wpx: 180},
          {wpx: 180},
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

        XLSX.utils.book_append_sheet(wb, ws, "待释放集品券明细");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `待释放集品券明细${time}.xlsx`);
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
