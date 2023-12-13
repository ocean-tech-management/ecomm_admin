<template>
  <div>
    <div orderinfo>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">用户名：</div>
          <div class="order-value">{{formData.user_name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">手机号码：</div>
          <div class="order-value">{{formData.user_phone}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">用户级别：</div>
          <div class="order-value">{{formData.vip_name}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">团队会员等级：</div>
          <div class="order-value">{{formData.team_vip_name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">累计提现金额：</div>
          <div class="order-value">{{formData.historyWithdraw}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">累计充值金额：</div>
          <div class="order-value">{{formData.historyRecharge}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">申请金额：</div>
          <div class="order-value">{{formData.total_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">手续费：</div>
          <div class="order-value">{{formData.handing_fee}}</div>
        </div>

        <div class="order-item">
          <div class="order-label">提现金额：</div>
          <div class="order-value">{{formData.price}}</div>
        </div>
      </div>

      <div class="order-row">
        <div v-if="formData.withdraw_type == 2 || formData.withdraw_type == 3" class="order-item">
          <div class="order-label">商城奖金：</div>
          <div class="order-value">{{formData.divide_price || '0.00'}}</div>
        </div>
        <div v-if="formData.withdraw_type == 2 || formData.withdraw_type == 4" class="order-item">
          <div class="order-label">拼团奖金：</div>
          <div class="order-value">{{formData.ppyl_price || '0.00'}}</div>
        </div>
      </div>

      <div class="order-row">
        <div class="order-item">
          <div class="order-label">提现编码：</div>
          <div class="order-value">{{formData.order_sn}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">身份证号：</div>
          <div class="order-value">{{formData.user_no}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">复用信息：</div>
          <div class="order-value">
            <span v-if="formData.related_user" class="error-color">是</span>
            <span v-else>否</span>
          </div>
        </div>
        <div v-if="formData.related_user" class="order-item">
          <div class="order-label">被复用账号：</div>
          <div class="order-value">
            <span>{{formData.relatedUserInfo.name || ''}}</span>
            <span v-if="formData.relatedUserInfo.phone">（{{formData.relatedUserInfo.phone}}）</span>
          </div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">签约乐小活：</div>
          <div class="order-value">
            <div v-if="formData.contract_exempt_letfree">免签约</div>
            <div v-else-if="formData.contract_letfree">已签约</div>
            <div v-else class="warning-color">未签约</div>
          </div>
        </div>
      </div>

      <div class="order-row">

        <div class="order-item">
          <div class="order-label">开户行用户名：</div>
          <div class="order-value">{{formData.user_real_name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">开户行账号：</div>
          <div class="order-value">{{formData.bank_account}}</div>
        </div>

        <div class="order-item">
          <div class="order-label">备注：</div>
          <div class="order-value">{{formData.remark}}</div>
        </div>
      </div>


      <div class="order-row">

        <div class="order-item">
          <div class="order-label">状态：</div>
          <div class="order-value">{{statusTexts[formData.check_status]}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">到账状态：</div>
          <div class="order-value" :class="{'error-color': formData.payment_status == -1}">
            {{payStatusText[formData.payment_status]}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">到账备注：</div>
          <div class="order-value" :class="{'error-color': formData.payment_status == -1}">{{formData.payment_remark}}
          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: 'WithdrawDetail',
  data() {
    return {
      statusTexts: {
        [1]: '已同意申请',
        [2]: '已拒绝申请',
        [3]: '待审核',
        [-1]: '超时未审核',
      },
      payStatusText: {
        [1]: '已到账',
        [2]: '',
        [-1]: '失败'
      },
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {}
};

</script>

<style lang="less" scoped>
.order-row {
  display: flex;
  margin-bottom: 15px;
}

.order-item {
  display: flex;
  width: 33.33%;
}

.order-label {
  width: 100px;
  text-align: right;
  color: #999;
}

.order-value {}

.error {
  color: #f00;
}

</style>
