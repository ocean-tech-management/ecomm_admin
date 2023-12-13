<template>
  <div>
    <div orderinfo>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">订单编号：</div>
          <div class="order-value">{{formData.order_sn}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">发生日期：</div>
          <div class="order-value">{{formData.create_time}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">到账情况：</div>
          <div class="order-value">{{formData.arrival_status}}</div>
        </div>
      </div>
      <div v-if="formData.user" class="order-row">
        <div class="order-item">
          <div class="order-label">用户：</div>
          <div class="order-value">{{formData.username}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">用户号码：</div>
          <div class="order-value">{{formData.user.phone}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">用户身份：</div>
          <div class="order-value">{{formData.level}}</div>
        </div>
      </div>

      <div class="order-row">
        <div class="order-item">
          <div class="order-label">商品总额：</div>
          <div class="order-value">{{formData.total_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">优惠金额：</div>
          <div class="order-value">{{formData.discount}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">配送费用：</div>
          <div class="order-value">{{formData.fare_price}}</div>
        </div>
      </div>
      
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">订单成本：</div>
          <div class="order-value">{{formData.cost_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">奖金支出：</div>
          <div class="order-value">{{formData.divide_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">服务费支出：</div>
          <div class="order-value">{{formData.server_price}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">销售佣金：</div>
          <div class="order-value">{{formData.direct_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">教育奖金：</div>
          <div class="order-value">{{formData.indirect_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">退售后：</div>
          <div class="order-value error">{{formData.refund_price}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">实际总金额：</div>
          <div class="order-value">{{formData.real_total_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">实际收益：</div>
          <div class="order-value warning-color">{{formData.profit}}</div>
        </div>
      </div>
    </div>

    <el-table style="width: 100%; margin-bottom: 20px;" :data="formData.goods">
      <el-table-column label="产品" prop="title"></el-table-column>
      <el-table-column label="规格" width="150" prop="attrs"></el-table-column>
      <el-table-column label="数量" width="70" prop="count" align="center"></el-table-column>
      <el-table-column label="单价" width="80" prop="price"></el-table-column>
      <el-table-column label="运费(独立计算)" width="80" prop="fare_price"></el-table-column>
      <el-table-column label="总价" width="80">
        <template slot-scope="scope"> 
          <div v-if="scope.row.shipping_status < 3 && scope.row.refund_price && scope.row.refund_price !== '0.00'">
            <el-tooltip :content="'未备货时申请了退售后，该商品总价补上了对应邮费 ' + scope.row.fare_price + ' 元'" placement="bottom">
              <span class="error-color">{{scope.row.total_price}}</span>
            </el-tooltip>
          </div>
          <div v-else>
            {{scope.row.total_price}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="优惠券" width="80" prop="coupon_dis"></el-table-column>
      <el-table-column label="成本总计" width="100" align="center">
        <template slot-scope="scope"> 
          <div :class="{'warning-color': scope.row.cost_price != scope.row.original_cost_price}">
            {{scope.row.cost_price}}
          </div>
          <div v-if="scope.row.cost_price != scope.row.original_cost_price" class="origin-cost">
            <el-tooltip content="自动退售后的未备货商品的原成本" placement="bottom">
              <span>({{scope.row.original_cost_price}})</span>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="销售佣金" width="80" prop="direct_price"></el-table-column>
      <el-table-column label="教育奖金" width="80" prop="indirect_price"></el-table-column>
      <el-table-column label="支出奖金" width="80" prop="divide_price"></el-table-column>
      <el-table-column label="服务费" width="80" prop="server_price"></el-table-column>
      <el-table-column label="退售后" width="80" prop="refund_price">
        <template slot-scope="scope">
          <div v-if="scope.row.refund_price && scope.row.refund_price != 0">
            -<span class="error-color">{{scope.row.refund_price}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="利润" width="80" prop="profit"></el-table-column>
    </el-table>


  </div>
</template>

<script>

export default {
  name: 'OrderProfitDetail',
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
}
.error {
  color: #f00;
}

.origin-cost {
  color: #999;
  cursor: help;
}

</style>