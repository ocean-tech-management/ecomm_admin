<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item label="审核状态" prop="check_status">
            <el-select placeholder="不限" name="check_status" v-model="queryForm.check_status">
              <el-option label="不限" value></el-option>
              <el-option label="通过" :value="1"></el-option>
              <el-option label="拒绝" :value="2"></el-option>
              <el-option label="待审核" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker v-model="createDate" type="datetimerange" :picker-options="pickerOptions" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" align="right"></el-date-picker>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">集品券充值申请记录列表</div>
        <div class="table-ctrl">

        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="订单编号" width="220" prop="recharge_sn">
        </el-table-column>
        <el-table-column label="充值用户名" width="120" prop="user_name"></el-table-column>
        <el-table-column label="充值手机号码" width="140" prop="user_phone"></el-table-column>
        <el-table-column label="金额" width="100" prop="price"></el-table-column>
        <el-table-column label="备注" width="250" prop="remark"></el-table-column>
        <el-table-column label="审核状态" width="100" prop="status" align="center">
          <template slot-scope="scope">
            <span :class="checkStatusClasses[scope.row.check_status]">{{ checkStatusTexts[scope.row.check_status]
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="到账状态" width="80" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.check_status == 1">
              <div>{{ arrivalStatusTexts[scope.row.arrival_status] }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="到账方式" width="140" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.check_status == 1 && scope.row.arrival_status != 3">
              <div>{{ arrivalTypeTexts[scope.row.arrival_type] }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="审核时间" width="150" prop="check_time"></el-table-column>
        <el-table-column label="到账时间" width="150" prop="payment_time"></el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="scope.row.check_status == 3">
              <template v-if="$auths.includes('offlineRecharge/check')">
                <el-button type="text" size="default" @click="openDetail(scope.row)">操作</el-button>
              </template>
            </template>
            <template v-else-if="scope.row.check_status == 1 && scope.row.arrival_status == 3">
              <template v-if="$auths.includes('offlineRecharge/grant')">
                <el-button type="text" size="default" @click="openDetail(scope.row)">发放操作</el-button>
              </template>
            </template>
            <template v-else>
              <el-button type="text" size="default" @click="openDetail(scope.row)">详情</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

    <el-dialog title="线下充值详情" width="1000px" :close-on-click-modal="false" :visible.sync="detailVisible">
      <detail :formData="formData"></detail>
      <div slot="footer" class="dialog-footer">
        <template v-if="$auths.includes('offlineRecharge/check')">
          <template v-if="formData.check_status == 3">
            <el-button type="warning" size="default" @click="confirmItem">同意申请</el-button>
            <el-button type="danger" size="default" @click="showRejectItem">拒绝申请</el-button>
          </template>
        </template>
        <template v-if="$auths.includes('offlineRecharge/grant')">
          <template v-if="formData.check_status == 1 && formData.arrival_status == 3">

            <el-button type="warning" size="default" plain @click="confirmWithOtherPlatform">已用其他方式发放</el-button>
            <el-button type="primary" size="default" @click="confirmWithPlatform">确认发放</el-button>
          </template>
        </template>
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="拒绝理由" width="800px" :close-on-click-modal="false" :visible.sync="remarkVisible">
      <div>
        <el-form>
          <el-form-item label="拒绝理由" label-width="100px">
            <el-input style="width: 450px;" auto-complete="off" placeholder="请填写拒绝理由哦" v-model="remark"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="remarkVisible = false">取 消</el-button>
        <el-button type="primary" @click="rejectItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="同意并选择是否需要赠送东西" width="430px" :close-on-click-modal="false" :visible.sync="agreeVisible">
      <div>
        <el-form label-width="125px">
          <el-form-item label="充值赠送东西类型">
            <el-select v-model="giftType" placeholder="请选择充值赠送东西类型" name="gift_type" style="width: 249px;">
              <el-option v-for="(item, key) in giftTypeText" :label="item" :value="key" :key="key"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="giftType == 2">
            <el-form-item label="赠送健康豆渠道">
              <el-select v-model="healthyChannelType" placeholder="请选择赠送健康豆渠道" name="healthy_channel_type"
                style="width: 249px;">
                <el-option v-for="(item, key) in healthyChannelTypeText" :label="item" :value="key"
                  :key="key"></el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="agreeVisible = false">取 消</el-button>
        <el-button type="primary" @click="agreeItem">同 意</el-button>
      </div>
    </el-dialog>



  </div>
</template>

<script>
import moment from "moment";
import {nTimePickerConfig} from '@/config';

import detail from "@/partialviews/crowdFunding/crowdFundingRechargeApplication/crowdFundingRechargeApplicationDetail";

export default {
  name: 'crowdFundingRechargeApplications',
  components: {
    detail
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        check_status: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      filter: {
        keyword: '',
        check_status: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      dataList: [],
      arrivalTypeTexts: {
        [1]: '系统发放',
        [2]: '通过其他渠道发放',
      },
      arrivalStatusTexts: {
        [1]: '已发放',
        [2]: '发放失败',
        [3]: '待发放'
      },
      checkStatusTexts: {
        [1]: '通过',
        [2]: '不通过',
        [3]: '待审核'
      },
      checkStatusClasses: {
        [1]: '',
        [2]: 'error-color',
        [3]: 'warning-color'
      },

      createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,

      detailVisible: false,
      formData: {},

      remark: false,
      remarkVisible: false,

      agreeVisible: false,
      giftType: '', // 充值赠送东西类型
      giftTypeText: {
        [-1]: '不赠送',
        [1]: '集品豆',
        [2]: '健康豆'
      },
      healthyChannelType: '',
      healthyChannelTypeText: {
        [1]: '商城',
        [2]: '福利',
        [3]: '消费型股东',
      },
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
        check_status: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
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
        check_status: this.queryForm.check_status,
        start_time: this.createDate[0],
        end_time: this.createDate[1]
      };
      this.getList();
    },


    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        check_status: this.filter.check_status,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };


      this.$get('/admin/offlineRecharge/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },


    openDetail(row) {
      this.formData = row;
      this.detailVisible = true;
    },
    confirmItem() {
      this.agreeVisible = true;
      this.giftType = '';
      this.healthyChannelType = '';
    },
    // 同意
    agreeItem() {
      if (!this.giftType) return this.$message.error("请选择充值赠送东西类型哦");
      if (this.giftType == 2 && !this.healthyChannelType) return this.$message.error("请选择赠送健康豆渠道哦");
      this.$confirm("您将通过该线下充值申请，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let params = {
            recharge_sn: this.formData.recharge_sn,
            check_status: 1,
            gift_type: Number(this.giftType),
          };
          if (this.giftType == 2) params['healthy_channel_type'] = Number(this.healthyChannelType);
          this.$post("/admin/offlineRecharge/check", params, (res) => {
            this.$message.success("通过申请成功");
            this.detailVisible = false;
            this.agreeVisible = false;
            this.reloadPage();
          });
        })
        .catch(() => {});
    },
    showRejectItem() {
      this.remark = "";
      this.remarkVisible = true;
    },
    rejectItem() {
      this.$confirm("您将拒绝该线下充值申请，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (this.remark === "") {
            return this.$message.error("请填写拒绝原因");
          }
          let params = {
            recharge_sn: this.formData.recharge_sn,
            check_status: 2,
            check_remark: this.remark,
          };
          this.$post("/admin/offlineRecharge/check", params, (res) => {
            this.$message.success("拒绝申请成功");
            this.remarkVisible = false;
            this.detailVisible = false;
            this.reloadPage();
          });
        })
        .catch(() => {});
    },


    confirmWithOtherPlatform() {
      this.$confirm("是否确定已通过其他方式给用户充值？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let params = {
            recharge_sn: this.formData.recharge_sn,
            type: 2
          };
          this.$post("/admin/offlineRecharge/grant", params, (res) => {
            this.$message.success("操作成功");
            this.detailVisible = false;
            this.reloadPage();
          });
        })
        .catch(() => {});
    },
    confirmWithPlatform() {
      this.$confirm("是否确定给用户充值？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let params = {
            recharge_sn: this.formData.recharge_sn,
            type: 1
          };
          this.$post("/admin/offlineRecharge/grant", params, (res) => {
            this.$message.success("操作成功");
            this.detailVisible = false;
            this.reloadPage();
          });
        })
        .catch(() => {});
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

