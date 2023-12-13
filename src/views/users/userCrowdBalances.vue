<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="收支类型">
              <el-select placeholder="不限" name="type" v-model="queryForm.type">
                <el-option label="不限" value></el-option>
                <el-option label="收入" :value="1"></el-option>
                <el-option label="支出" :value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="类型">
              <el-select placeholder="不限" name="change_type" v-model="queryForm.change_type">
                <el-option label="不限" value></el-option>
                <el-option label="预购" :value="1"></el-option>
                <el-option label="消费" :value="2"></el-option>
                <el-option label="福利补贴" :value="3"></el-option>
                <el-option label="奖励" :value="4"></el-option>
                <el-option label="转商城余额" :value="5"></el-option>
                <el-option label="提现" :value="6"></el-option>
                <el-option label="转赠他人" :value="7"></el-option>
                <el-option label="转换到其他钱包" :value="8"></el-option>
                <el-option label="收到他人转赠" :value="9"></el-option>
                <el-option label="中奖" :value="10"></el-option>
                <el-option label="熔断分期返回" :value="11"></el-option>
                <el-option label="后台充值但不计入业绩" :value="12"></el-option>
                <el-option label="售后退款" :value="13"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="createDate">
              <el-date-picker v-model="createDate" type="datetimerange" :picker-options="pickerOptions"
                range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
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
      </div>
    </div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">
            用户集品券余额明细列表
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
              <div class="order-profit-overview-title">剩余总余额</div>
              <div class="order-profit-overview-val">{{ summary.total_balance }}</div>
            </div>
            <div v-if="summary.withdraw_balance || summary.withdraw_balance === 0" class="order-profit-overview">
              <div class="order-profit-overview-title">提现总金额</div>
              <div class="order-profit-overview-val">{{ summary.withdraw_balance }}</div>
            </div>
            <div v-if="summary.fronzen_balance || summary.fronzen_balance === 0" class="order-profit-overview">
              <div class="order-profit-overview-title">提现冻结中总金额</div>
              <div class="order-profit-overview-val">{{ summary.fronzen_balance }}</div>
            </div>
          </div>
          <div style="height: 20px"></div>
        </template>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="序号" width="90" type="index"></el-table-column>
          <el-table-column label="编号" width="220">
            <template slot-scope="{ row }">
              <div>{{ row.order_sn }}</div>
              <div v-if="row.delay_reward_status && row.delay_reward_status != -1 && row.delay_reward_status != -2"
                class="warning-color">[福利预售] {{ delayRewardStatusTexts[row.delay_reward_status] }}
              </div>
              <div v-else-if="row.order_type == 6" class="warning-color">[提前购]</div>
            </template>
          </el-table-column>
          <el-table-column label="类别" width="160">
            <template slot-scope="scope">
              {{ changeTypeTexts[scope.row.change_type] }}
            </template>
          </el-table-column>
          <el-table-column label="收支类型" width="120">
            <template slot-scope="scope">
              {{ typeTexts[scope.row.type] }}
            </template>
          </el-table-column>
          <el-table-column label="发生金额" width="150">
            <template slot-scope="scope">
              <span :class="{ 'error-color': scope.row.type == 2 }">{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" prop="status" align="center">
            <template slot-scope="scope">
              <span :class="{ 'error-color': scope.row.status != 1 }">{{ statusTexts[scope.row.status] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注/提醒" width="220" prop="remark"></el-table-column>
          <el-table-column label="发生时间" width="250" prop="create_time">
            <template slot-scope="{ row }">
              <div>{{ row.create_time }}</div>
              <template v-if="row.delay_reward_status && row.delay_reward_status != -1 && row.delay_reward_status != -2">
                <div v-if="row.delay_reward_status != 2 && row.delay_arrival_time" class="warning-color"
                  style="font-size: 12px;">
                  {{ row.delay_reward_status == 1 ? '奖励发放时间: ' : '预计发放时间: ' }}{{ row.delay_arrival_time }}
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="福利活动名称" width="220" prop="activity_name"></el-table-column>
          <el-table-column label="福利活动区编码" width="220" prop="crowd_code"></el-table-column>
          <el-table-column label="福利活动轮数" width="150" prop="crowd_round_number"></el-table-column>
          <el-table-column label="福利活动期数" width="150" prop="crowd_period_number"></el-table-column>
          <el-table-column label="预售订单状态" width="120" align="center">
            <template slot-scope="{row}">
              {{ delayRewardStatusTexts[row.delay_reward_status] }}
            </template>
          </el-table-column>
          <el-table-column label="预售发放奖励时间" min-width="150" prop="delay_arrival_time"></el-table-column>
          <!-- <el-table-column label="操作">
            <template slot-scope="scope">
            </template>
          </el-table-column> -->
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
        change_type: '',
        type: '',

        exportPageNum: 1,
        exportNum: 1000,
      },
      filter: {
        keyword: '',
        change_type: '',
        type: '',
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),

        exportPageNum: 1,
        exportNum: 1000,
      },

      dataList: [],
      detailVisible: false,
      formData: {},
      summary: {},

      statusTexts: {
        [1]: '正常',
        [2]: '禁用',
        [3]: '充值待支付',
        [-1]: '删除'
      },
      typeTexts: {
        [1]: '收入',
        [2]: '支出'
      },

      changeTypeTexts: {
        [1]: '预购',
        [2]: '消费',
        [3]: '福利补贴',  //退回本金
        [4]: '奖励',  //奖金
        [5]: '转商城余额',
        [6]: '提现',
        [7]: '转赠他人',
        [8]: '转换到其他钱包',
        [9]: '收到他人转赠',
        [10]: '中奖',
        [11]: '熔断分期返回',
        [12]: '后台充值但不计入业绩',
        [13]: '售后退款'
      },
      payTypeTexts: {
        [1]: '余额支付',
        [2]: '微信支付',  //现金支付
        [4]: '拼拼支付',
        [5]: '集品券支付',
        [6]: '协议支付',
        [77]: '系统赠送',
        [88]: '系统充值'
      },
      // 预售订单状态
      delayRewardStatusTexts: {
        [1]: '已发放',
        [2]: '发放失败',
        [3]: '待发放',
        [-1]: '非预售订单',
        [-2]: '非预售订单',
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
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: '',
        change_type: '',
        type: '',
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
        change_type: this.queryForm.change_type,
        type: this.queryForm.type,

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
        change_type: this.filter.change_type,
        type: this.filter.type,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };

      this.$get("/admin/crowdFunding/balance", queryVal, (res) => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].change_type == 1) {
            dataList[i].remark = `${dataList[i].remark}${dataList[i].pay_type ? `【${this.payTypeTexts[dataList[i].pay_type] || '未知类型'}】` : ''}`;
          }
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    // 统计
    getSummary() {
      if (!this.$auths.includes('user/otherBalanceSummary')) return;
      let params = {
        uid: this.uid,
        type: 1, // 1-集品券 2-集品豆 3-健康豆 4-礼品券
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
        keyword: this.filter.keyword,
        change_type: this.filter.change_type,
        type: this.filter.type,

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

      this.$get('/admin/excel/userCrowdFundBalance', params, res => {
        let data = res.data.list || [];

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数剧超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        let excelData = [];
        excelData.push([
          '编号',
          '用户',
          '类型',
          '收支类型',
          '发生金额',
          '状态',
          '发生时间',
          '备注/提醒'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];
          item.remark = `${item.remark}${item.pay_type ? `【${this.payTypeTexts[item.pay_type]}】` : ''}`;
          excelData.push([
            item.order_sn,
            `${this.userInfo.name}(${this.userInfo.phone})`,
            this.changeTypeTexts[item.change_type],
            this.typeTexts[item.type],
            item.price || 0,
            this.statusTexts[item.status],
            item.create_time,
            item.remark
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 160},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 140},
          {wpx: 320},
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let priceRange = XLSX.utils.encode_cell({r: i , c: 4});
          ws[priceRange].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "用户集品券余额明细列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `用户集品券余额明细列表${time}.xlsx`);
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
