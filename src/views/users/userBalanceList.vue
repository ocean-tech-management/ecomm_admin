<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
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
                <el-option label="订单分润" :value="1"></el-option>
                <el-option label="会员分润" :value="2"></el-option>
                <el-option label="消费" :value="3"></el-option>
                <!-- <el-option label="用户提现" :value="4"></el-option> -->
                <el-option label="退款" :value="5"></el-option>
                <el-option label="取消分润" :value="6"></el-option>
                <el-option label="教育奖金发放" :value="7"></el-option>
                <el-option label="拼拼退款" :value="8"></el-option>
                <el-option label="拼拼排队超时退款" :value="9"></el-option>
                <el-option label="拼拼钱包转入" :value="10"></el-option>
                <el-option label="拼拼分佣提现" :value="11"></el-option>
                <el-option label="广宣奖" :value="12"></el-option>
                <el-option label="感恩奖" :value="13"></el-option>
                <el-option label="取消感恩奖" :value="14"></el-option>
                <el-option label="感恩奖提现" :value="15"></el-option>
                <el-option label="团队业绩奖励" :value="16"></el-option>
                <el-option label="团队业绩奖励提现" :value="17"></el-option>
                <el-option label="股东奖奖励" :value="18"></el-option>
                <el-option label="股东奖提现" :value="19"></el-option>
                <el-option label="区代奖励" :value="20"></el-option>
                <el-option label="区代奖励提现" :value="21"></el-option>
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
            用户余额列表
            <span v-if="userInfo" class="success-color">{{ userInfo.name || '' }} <template
                v-if="userInfo.phone && userInfo.phone !== ''">({{ userInfo.phone }})</template></span>
          </div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('excel/userBalance')">
              <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
            </template>
          </div>
        </div>

        <div class="order-profit-overviews">
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">可用余额</div>
            <div class="order-profit-overview-val">{{ summary.total_price }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">商城分佣可用余额</div>
            <div class="order-profit-overview-val">{{ summary.divide_balance }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">商城分佣冻结余额</div>
            <div class="order-profit-overview-val">{{ summary.divide_fronzen_balance }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">商城分佣提现余额</div>
            <div class="order-profit-overview-val">{{ summary.divide_withdraw_total }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">拼拼可用余额</div>
            <div class="order-profit-overview-val">{{ summary.ppyl_balance }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">拼拼冻结余额</div>
            <div class="order-profit-overview-val">{{ summary.ppyl_fronzen_balance }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">拼拼提现余额</div>
            <div class="order-profit-overview-val">{{ summary.ppyl_withdraw_total }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">广宣奖可用余额</div>
            <div class="order-profit-overview-val">{{ summary.ad_balance }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">广宣奖冻结余额</div>
            <div class="order-profit-overview-val">{{ summary.ad_fronzen_balance }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">广宣奖提现余额</div>
            <div class="order-profit-overview-val">{{ summary.ad_withdraw_total }}</div>
          </div>

        </div>

        <div style="height: 20px"></div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="序号" width="90" type="index"></el-table-column>
          <el-table-column label="编号" width="220" prop="order_sn"></el-table-column>
          <el-table-column label="类别" width="200">
            <template slot-scope="scope">
              {{ changeTypeText[scope.row.change_type] }}
            </template>
          </el-table-column>
          <el-table-column label="收支类型" width="200">
            <template slot-scope="scope">
              {{ typeText[scope.row.type] }}
            </template>
          </el-table-column>
          <el-table-column label="发生金额" width="150">
            <template slot-scope="scope">
              <span :class="{ 'error-color': scope.row.type == 2 }">{{ scope.row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="220" prop="remark"></el-table-column>
          <el-table-column label="发生时间" width="150" prop="create_time"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
            </template>
          </el-table-column>
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
  name: "userBalanceList",
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
      formData: {
      },
      summary: {},

      typeText: {
        [1]: '收入',
        [2]: '支出'
      },
      changeTypeText: {
        [1]: '订单分润',
        [2]: '会员分润',
        [3]: '消费',
        [4]: '用户提现',
        [5]: '退款',
        [6]: '取消分润',
        [7]: '教育奖金发放',
        [8]: '拼拼退款',
        [9]: '拼拼排队超时退款',
        [10]: '拼拼钱包转入',
        [11]: '拼拼分佣提现',
        [12]: '广宣奖',
        [13]: '商品感恩奖',
        [14]: '取消商品感恩奖',
        [15]: '广宣奖提现',
        [16]: '团队业绩奖励',
        [17]: '团队业绩奖励提现',
        [18]: '股东奖奖励',
        [19]: '股东奖提现',
        [20]: '区代奖励',
        [21]: '区代奖励奖励',
        [22]: '集品券转入',
        [23]: '分润转入',
        [24]: '分润转出',
        [25]: '拼拼转入',
        [26]: '拼拼转出',
        [27]: '广宣奖转入',
        [28]: '广宣奖转出',
        [29]: '团队业绩奖转入',
        [30]: '团队业绩奖转出',
        [31]: '股东奖转入',
        [32]: '股东奖转出',
        [33]: '区代奖转入',
        [34]: '区代奖转出'
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

      this.$get("/admin/user/balance", queryVal, (res) => {
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
    getSummary() {
      if (!this.$auths.includes('user/balanceSummary')) return;
      let params = {
        uid: this.uid
      };


      this.$sget("/admin/user/balanceSummary", params, (res) => {
        let data = res.data;
        this.summary = data;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    openDetail(row) {
      let queryVal = {
        order_sn: row.order_sn,
      };

      this.$get("/admin/finance/withdrawDetail", queryVal, (res) => {
        this.formData = res.data;
        this.detailVisible = true;
      });
    },
    confirmItem() {
      this.$confirm("您将通过该提现申请，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let params = {
            id: this.formData.id,
            check_status: 1,
          };
          this.$post("/admin/finance/checkWithdraw", params, (res) => {
            this.$message.success("通过申请成功");
            this.detailVisible = false;
            this.reloadPage();
          });
        })
        .catch(() => {});
    },
    confirmWithOtherPlatform() {
      this.$confirm("是否确定已通过其他平台对该笔申请打款？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let params = {
            id: this.formData.id,
            check_status: 3
          };
          this.$post("/admin/finance/checkWithdraw", params, (res) => {
            this.$message.success("操作成功");
            this.detailVisible = false;
            this.reloadPage();
          });
        })
        .catch(() => {});
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

      this.$get('/admin/excel/userBalance', params, res => {
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
          '发生时间'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.order_sn,
            `${this.userInfo.name}(${this.userInfo.phone})`,
            this.changeTypeText[item.change_type],
            this.typeText[item.type],
            item.price || 0,
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
          {wpx: 140},
          {wpx: 300}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let priceRange = XLSX.utils.encode_cell({r: i , c: 4});
          ws[priceRange].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "用户余额列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `用户余额列表${time}.xlsx`);
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