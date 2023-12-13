<template>
  <div class="subpage-content">
    <el-form :inline="true" @submit.native.prevent>
     
      <el-form-item label="统计时间" prop="statisticsDate">
        <el-date-picker
          v-model="statisticsDate"
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

      <el-form-item>
        <el-button type="primary" @click="getData">查询</el-button>
      </el-form-item>
    </el-form>
    
    <div style="margin-top: 30px">
      <div class="data-rows">
        <div class="data-item">
          <div class="data-item-title">拼团收款</div>
          <div class="data-item-val success-color">{{summary.ppylShippingTotal || '0.00'}}</div>
        </div>
        <div class="data-item">
          <div class="data-item-title">客户本金</div>
          <div class="data-item-val warning-color">{{summary.CustomerPrincipal || '0.00'}}</div>
        </div>
        <div class="data-item">
          <div class="data-item-title">商场收款</div>
          <div class="data-item-val success-color">{{summary.orderTotal || '0.00'}}</div>
        </div>
      </div>
      <div class="data-rows">
        <div class="data-item">
          <div class="data-item-title">提现金额</div>
          <div class="data-item-val success-color">{{summary.withdrawTotal || '0.00'}}</div>
          <div class="data-item-ctrls">
            <template v-if="$auths.includes('finance/newFundsWithdraw')">
              <div class="data-item-ctrl warning-color" @click="showAddWithdrawRecord">新增记录</div>
            </template>
            <template v-if="$auths.includes('finance/fundsWithdrawList')">
              <div class="data-item-ctrl primary-color" @click="$router.push('/withdrawRecords')">查看记录</div>
            </template>
          </div>
        </div>
        <div class="data-item">
          <div class="data-item-title">资金余额</div>
          <div class="data-item-val success-color">{{summary.balanceTotal || '0.00'}}</div>
        </div>
      </div>
    </div>

    
    <el-dialog title="新增提现金额记录" width="800px" :close-on-click-modal="false" :visible.sync="addWithdrawRecordVisible">
      <AddWithdrawRecord :formData="formData"></AddWithdrawRecord>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addWithdrawRecordVisible = false">取 消</el-button>
        <el-button type="primary" @click="tryAddWithdrawRecord">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import moment from "moment";
import {nTimePickerConfig} from '@/config';

import AddWithdrawRecord from '@/partialviews/finance/balanceSummary/AddWithdrawRecord';

export default {
  name: 'balanceSummary',
  components: {
    AddWithdrawRecord
  },
  data() {
    return {
      summary: {},
      formData: {},

      statisticsDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,

      addWithdrawRecordVisible: false

    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      if(!this.statisticsDate || this.statisticsDate.length != 2){
        return this.$message.error('请选择有效的统计时间')
      }
      let params = {
        start_time: this.statisticsDate[0],
        end_time: this.statisticsDate[1]
      };
      this.$get("/admin/finance/balanceSummary", params, res => {
        this.summary = res.data || {};
      })
    },

    showAddWithdrawRecord() {
      this.formData = {
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        price: '',
        remark: ''
      }
      this.addWithdrawRecordVisible = true;
    },
    tryAddWithdrawRecord() {
      let params = {
        time: this.formData.time,
        price: this.formData.price,
        remark: this.formData.remark.trim(),
      }
      if(!params.time || params.time === '') {
        return this.$message.error('请选择有效时间的时间');
      }
      if(!params.price || params.price === '') {
        return this.$message.error('请填写调整金额');
      } else if(!(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.price))) {
        return this.$message.error('调整金额需要为大于0的数字格式');
      }
      if(!params.remark || params.remark === '') {
        return this.$message.error('请填写有效的备注');
      }
      this.$post("/admin/finance/newFundsWithdraw", [params], res => {
        this.$message.success('新增记录成功');
        this.addWithdrawRecordVisible = false;
        this.getData();
      });
    }
  }
}
</script>
<style lang="less" scoped>
.data-rows {
  display: flex;
  max-width: 1200px;
}
.data-item {
  flex: 1;
  margin: 5px;
  padding: 15px 20px;
  border-radius: 6px;
  background-color: #fff;
}
.data-item-title {
  font-size: 19px;
}
.data-item-val {
  margin: 20px 0;
  font-size: 50px;
  white-space: nowrap;
}
.data-item-ctrls {
  display: flex;
  justify-content: flex-end;
  height: 1.4em;
  font-size: 13px;
}
.data-item-ctrl {
  margin-left: 10px;
  padding: 0 5px;
  user-select: none;
  cursor: pointer;
}
</style>