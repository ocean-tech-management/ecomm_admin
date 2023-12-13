<template>
  <div>
    <div orderinfo>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">订单编号：</div>
          <div class="order-value">{{formData.order_sn}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">下单日期：</div>
          <div class="order-value">{{formData.create_time}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">状态：</div>
          <div v-if="formData.pay_status == 2 || formData.pay_status == -2" class="order-value">{{statusTexts[formData.activity_status]}}</div>
          <div v-else-if="formData.pay_status" class="order-value error-color">{{payStatusTexts[formData.pay_status]}}</div>
        </div>
      </div>
      <div v-if="formData.user" class="order-row">
        <div class="order-item">
          <div class="order-label">用户号码：</div>
          <div class="order-value">{{formData.user.phone}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">姓名：</div>
          <div class="order-value">{{formData.user.name}}</div>
        </div>
      </div>
      
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">商品信息：</div>
          <div class="order-value">{{formData.goods.title}}({{formData.goods.attrs}})</div>
        </div>
      </div>

      <div class="order-row">
        <div class="order-item">
          <div class="order-label">实际支付：</div>
          <div class="order-value error">{{formData.real_pay_price}}</div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>

export default {
  name: 'PpylOrderDetail',
  data() {
    return {
      
      statusTexts: {
        [1]: '拼团中',
        [2]: '拼团完成',
        [3]: '超时未完成',
        [-1]: '已取消',
        [-2]: '已退款',
        [-3]: '未中奖退款'
      },
      payStatusTexts: {
        [1]: '未付款',
        [2]: '已支付',
        [-1]: '取消付款',
        [-2]: '已退款'
      },
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {

  }
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
.order-item-row {
  display: flex;
}
.order-label {
  width: 100px;
  text-align: right;
  color: #999;
}
.order-value {
  flex: 1;
}
.error {
  color: #f00;
}
</style>