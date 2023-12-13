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
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <template v-if="$auths.includes('afterSale/initiateAfterSale')">
              <el-button
                v-if="
                  ((formData.order_status == 2 && (formData.order_type != 2 || formData.pt.activity_status == 2)) || formData.order_status == 3 || formData.order_status == 4) &&
                  (scope.row.after_status == 1 || scope.row.after_status == -1) &&
                  formData.order_type != 6
                "
                type="text" size="default" @click="showInitiateAfterSales(scope.$index)"
              >退换</el-button>
            </template>
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

    <el-dialog title="帮助用户提起售后" width="700px" :close-on-click-modal="false" :append-to-body="true" :visible.sync="initiateAfterSalesVisible">
      <InitiateAfterSales ref="initiateAfterSales" :formData="afterSaleData"></InitiateAfterSales>
      <div slot="footer" class="dialog-footer">
        <el-button @click="initiateAfterSalesVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmInitiate">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import InitiateAfterSales from './InitiateAfterSales.vue';
export default {
  name: 'OrderDetail',
  components: {
    InitiateAfterSales
  },
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
      afterSaleData: {},
      initiateAfterSalesVisible: false,
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {
    regetInfos() {
      let params = {
        order_sn: this.formData.order_sn
      };

      this.$get('/admin/order/info', params, res => {
        let formData = res.data;
        let goods = [];
        for(let i = 0; i < formData.goods.length; i++) {
          let attrs = JSON.parse(formData.goods[i].specs);
          formData.goods[i].attrs = Object.values(attrs).join(',');
          goods.push(formData.goods[i]);
        }
        this.formData.goods = goods;
        this.$forceUpdate();
      });
    },
    showInitiateAfterSales(index) {
      let afterSaleData = {
        uid: this.formData.uid,
        order_sn: this.formData.order_sn,
        type: 1,  //默认退款
        order_status: this.formData.order_status,
        goods: JSON.parse(JSON.stringify(this.formData.goods[index])),
        shipping_status: this.formData.goods[index].shipping_status,

        reasonIndex: 0,
        apply_reason: '',

        logisticsIndex: 0,
        relations: [],
        relationSelects: [],
        images: []
      };
      // 针对要退的商品进行可退金额的计算和处理
      let real_pay_price_origin = afterSaleData.goods.real_pay_price;
      let real_pay_price = afterSaleData.goods.real_pay_price;
      if(afterSaleData.goods.shipping_status != 1 && afterSaleData.goods.shipping_status != 2) {
        // 已经发货的话默认去掉运费
        real_pay_price = (parseFloat(afterSaleData.goods.real_pay_price) - parseFloat(afterSaleData.goods.total_fare_price)).toFixed(2);
      }

      afterSaleData.goods.real_pay_price_origin = real_pay_price_origin;
      afterSaleData.goods.real_pay_price = real_pay_price;

      for(let i = 0; i < this.formData.goods.length; i++) {
        // 存实际支付，一起退的时候会用上
        let relation = JSON.parse(JSON.stringify(this.formData.goods[i]));
        relation.real_pay_price_origin = relation.real_pay_price;
        if(relation.after_status == 1 || relation.after_status == -1) {
          if(index != i) afterSaleData.relations.push(relation);
        }
      }
      this.afterSaleData = afterSaleData;
      this.initiateAfterSalesVisible = true;
    },
    confirmInitiate() {
      let params = this.$refs.initiateAfterSales.confirmResult();
      if(!params) return;

      this.$post('/admin/afterSale/initiateAfterSale', params, res => {
        this.$message.success('发起退售后成功');
        this.initiateAfterSalesVisible = false;
        this.regetInfos();
      });

    }
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