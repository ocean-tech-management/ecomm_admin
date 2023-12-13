<template>
  <div>
    <div orderinfo>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">订单编号：</div>
          <div class="order-value">{{formData.order_sn}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">订单金额：</div>
          <div class="order-value">{{formData.total_price}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">支出奖金：</div>
          <div class="order-value">{{formData.divide_price}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">销售代理：</div>
          <div class="order-value">{{formData.username}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">分润类型：</div>
          <div class="order-value">{{formData.type}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">状态：</div>
          <div class="order-value">{{formData.arrival_status}}</div>
        </div>
        </div>
      </div>
      <el-table style="width: 100%; margin-bottom: 20px;" :data="formData.records">
        <el-table-column label="级别" width="100" prop="level"></el-table-column>
        <el-table-column label="商品" width="420">
          <template slot-scope="scope">
            {{scope.row.orderGoods ? scope.row.orderGoods.title : ''}}
          </template>
        </el-table-column>
        <el-table-column label="分润类型" width="120" prop="type_name"></el-table-column>
        <el-table-column label="分润级别" width="80" prop="divide_type" align="center"></el-table-column>
        <el-table-column label="代理" width="150" prop="username"></el-table-column>
        <el-table-column label="金额" width="100" prop="divide_price" align="center">
          <template slot-scope="scope">
            <div>
              {{scope.row.divide_price}}
              <div v-if="scope.row.refund_reduce_price && scope.row.refund_reduce_price != '0.00'">
                已退<span class="error-color">{{scope.row.refund_reduce_price}}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark"></el-table-column>
      </el-table>
    </div>

</template>

<script>

export default {
  name: 'DivideDetail',
  data() {
    return {

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
</style>