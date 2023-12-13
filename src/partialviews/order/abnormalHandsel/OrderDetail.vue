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
          <div class="order-value">{{orderStatuTexts[formData.order_status]}}</div>
        </div>
      </div>
      <div v-if="formData.user" class="order-row">
        <div class="order-item">
          <div class="order-label">用户号码：</div>
          <div class="order-value">{{formData.user_phone}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">姓名：</div>
          <div class="order-value">{{formData.user.user_name}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">上级号码：</div>
          <div class="order-value">{{formData.link_user_phone || '——'}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">直属上级：</div>
          <div class="order-value">{{formData.link_user_name || '——'}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">上级身份：</div>
          <div class="order-value">{{formData.link_user_level_name || '——'}}</div>
        </div>
      </div>
      <div style="border: 1px solid #eee; padding: 20px 0;background-color: #fafbfb;">
        <div class="order-row">
          <div class="order-item">
            <div class="order-label">收货人：</div>
            <div class="order-value">{{formData.shipping_name}}</div>
          </div>
          <div class="order-item">
            <div class="order-label">收货人电话：</div>
            <div class="order-value">{{formData.shipping_phone}}</div>
          </div>
        </div>
        <div class="order-row">
          <div class="order-item-row">
            <div class="order-label">收货地址：</div>
            <div class="order-value">{{formData.shipping_address}}</div>
          </div>
        </div>
        <div class="order-row">
          <div class="order-item-row">
            <div class="order-label">订单备注：</div>
            <div class="order-value">{{formData.order_remark || '——'}}</div>
          </div>
        </div>
      </div>

      <el-table style="width: 100%; margin-bottom: 20px;" :data="formData.goods">
        <el-table-column label="产品" width="150" prop="title"></el-table-column>
        <el-table-column label="规格" width="150" prop="attrs"></el-table-column>
        <el-table-column label="单价" width="150" prop="price"></el-table-column>
        <el-table-column label="数量" prop="count"></el-table-column>
        <el-table-column label="小计" width="150" prop="total_price"></el-table-column>
        <el-table-column label="退售后" width="120" prop="refund_price">
          <template slot-scope="scope">
            <div v-if="scope.row.refund_price && scope.row.refund_price != '0.00'">
              -<span class="error-color">{{scope.row.refund_price}}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="order-row">
        <div class="order-item">
          <div class="order-label">商品总额：</div>
          <div class="order-value">{{formData.total_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">优惠金额：</div>
          <div class="order-value">{{formData.discount_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">配送费用：</div>
          <div class="order-value">{{formData.fare_price}}</div>
        </div>
      </div>
    
      <!-- <div class="order-row">
        <div class="order-item">
          <div class="order-label">付款日期：</div>
          <div class="order-value">{{formData.order_status == 1 ? '未支付' : formData.pay_time }}</div>
        </div>
      </div>

      <div class="order-row">
        <div class="order-item">
          <div class="order-label">付款编码：</div>
          <div class="order-value">{{formData.order_status == 1 ? 'N/A' : formData.pay_no }}</div>
        </div>
      </div> -->
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
  name: 'OrderDetail',
  data() {
    return {
      orderStatuTexts: {
        [1]: '未支付',
        [2]: '支付成功',
        [3]: '已发货',
        [4]: '已签收',
        [5]: '售后申请',
        [6]: '售后中',
        [7]: '售后成功',
        [8]: '已完成',
        [-1]: '已取消',
        [-2]: '超时自动关闭',
        [-3]: '已关闭',
        [-4]: '未成功拼团'
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