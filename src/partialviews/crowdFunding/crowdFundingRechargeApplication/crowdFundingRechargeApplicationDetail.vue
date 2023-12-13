<template>
  <div>
    <div orderinfo>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">编码：</div>
          <div class="order-value">{{ formData.recharge_sn }}</div>
        </div>
        <div class="order-item">
          <div class="order-label">用户名：</div>
          <div class="order-value">{{ formData.user_name }}</div>
        </div>
        <div class="order-item">
          <div class="order-label">到账时间：</div>
          <div class="order-value">{{ formData.arrival_time }}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">充值金额：</div>
          <div class="order-value">{{ formData.price }}</div>
        </div>
        <div class="order-item">
          <div class="order-label">充值流水号：</div>
          <div class="order-value">{{ formData.pay_no }}</div>
        </div>
        <div class="order-item">
          <div class="order-label">充值赠送类型：</div>
          <div class="order-value">{{ giftTypeText[formData.gift_type] }}</div>
        </div>

      </div>
      <div v-if="formData.gift_type == 2" class="order-row">
        <div class="order-item">
          <div class="order-label">赠送健康豆渠道：</div>
          <div class="order-value">{{ healthyChannelTypeText[formData.healthy_channel_type] || '-' }}</div>
        </div>
      </div>

      <div class="order-row">

        <div class="order-item">
          <div class="order-label">备注：</div>
          <div class="order-value">{{ formData.remark }}</div>
        </div>
      </div>


      <div class="order-row">

        <div class="order-item-lg">
          <div class="order-label">凭证图：</div>
          <div class="order-value">
            <img class="order-voucher-img" :src="formData.image" />
          </div>
        </div>
      </div>

      <div class="order-row">

        <div class="order-item">
          <div class="order-label">审核状态：</div>
          <div class="order-value">{{ checkStatusTexts[formData.check_status] }}</div>
        </div>
        <div v-if="formData.check_status == 1" class="order-item">
          <div class="order-label">到账状态：</div>
          <div class="order-value">
            {{ arrivalStatusTexts[formData.arrival_status] }}</div>
        </div>
        <div v-if="formData.check_status == 1 && formData.arrival_status != 3" class="order-item">
          <div class="order-label">到账类型：</div>
          <div class="order-value">
            {{ arrivalTypeTexts[formData.arrival_type] }}</div>
        </div>

      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">审核备注：</div>
          <div class="order-value">{{ formData.check_remark }}</div>
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
        giftTypeText: {
        [-1]: '不赠送',
        [1]: '集品豆',
        [2]: '健康豆'
      },
      healthyChannelTypeText: {
        [1]: '商城',
        [2]: '福利',
        [3]: '消费型股东',
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

.order-item-lg {
  flex: 1;
  display: flex;
}

.order-label {
  flex: none;
  width: 120px;
  text-align: right;
  color: #999;
}

.order-value {}

.order-voucher-img {
  width: 600px;
}

.error {
  color: #f00;
}
</style>
