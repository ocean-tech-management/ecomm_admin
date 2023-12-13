<template>
  <el-form :model="formData">

    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">结算设置</div>
        </div>
        <el-form-item label="结算选项" label-width="300px">
          <el-radio-group v-model="formData.settlement_type">
            <el-radio :label="1">收入提现</el-radio>
            <el-radio :label="2">转换积分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="结算事件" label-width="300px">
          <el-radio-group v-model="formData.settlement_node">
            <el-radio :label="1">订单完成后</el-radio>
            <el-radio :label="2">订单支付后</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="提现天数" label-width="300px">
          <el-input
            auto-complete="off"
            placeholder="请填写"
            type="number"
            v-model="formData.withdraw_time"
          ></el-input>
        </el-form-item>
        <el-form-item label="提现起步数额" label-width="300px">
          <el-input auto-complete="off" placeholder="请填写" v-model="formData.withdraw_money"></el-input>
        </el-form-item>
        <el-form-item label="提现手续费" label-width="300px">
          <el-input
            class="rate-input"
            auto-complete="off"
            placeholder="请填写"
            v-model="formData.withdraw_formalities"
          ></el-input>
        </el-form-item>
        <el-form-item label="佣金计算方法-减少项目" label-width="300px">
          <el-checkbox-group v-model="formData.withdraw_reduce">
            <el-checkbox :label="1">运费</el-checkbox>
            <el-checkbox :label="2">成本</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="" label-width="300px">
          <el-button type="primary" @click="updateDistribute">确定</el-button>
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<script>
import { publishDate } from '@/config.js';

export default {
  name: 'distribute',
  data() {
    return {
      formData: {
        settlement_type: 1,
        settlement_node: 1,
        withdraw_time: '',
        withdraw_formalities: '',
        withdraw_reduce: [1]
      },
      token: {
        token: localStorage.getItem('token') || ''
      }
    };
  },
  mounted() {},
  methods: {
    updateDistributeType(val) {
      this.formData.state = val;
    },
    updateDistribute() {

    }
  }
};
</script>

<style lang="less" scoped>
.table-ctrl-static-tab {
  display: inline-block;
  margin-left: 15px;
  padding: 5px 25px;
  border: 1px solid #618df5;
  border-radius: 5px;
  color: #618df5;
  cursor: pointer;
  user-select: none;
}
.table-ctrl-tab-active {
  color: #fff;
  background-color: #618df5;
}
</style>