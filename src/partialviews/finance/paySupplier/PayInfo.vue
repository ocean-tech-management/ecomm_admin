<template>
  <div>
    <el-form label-width="160px" :model="formData">
      <el-form-item label="订单号">
        <div class="form-content-static">{{formData.order_sn}}</div>
      </el-form-item>
      <el-form-item label="商品信息">
        <div class="form-content-static">{{formData.title}} {{formData.attrs}}</div>
      </el-form-item>
      <el-form-item label="商品数量">
        <div class="form-content-static">{{formData.count}}</div>
      </el-form-item>
      
      <el-form-item label="总成本">
        <div class="form-content-static">{{formData.total_cost_price}}</div>
      </el-form-item>
      
      <el-form-item label="运费">
        <div class="form-content-static">{{formData.total_fare_price}}</div>
      </el-form-item>
      
      <el-form-item label="商品总价">
        <div class="form-content-static">{{formData.total_price}}</div>
      </el-form-item>
      
      <el-form-item label="退售后中金额">
        <div class="form-content-static">{{formData.after_sale_ing_price}}</div>
      </el-form-item>
      <el-form-item label="已退金额">
        <div class="form-content-static">{{formData.refund_price}}</div>
      </el-form-item>

      <el-form-item label="运费调整">
        <div class="form-content-static">{{formData.correction_fare}}</div>
      </el-form-item>
      <el-form-item label="售后扣除供应商金额">
        <div class="form-content-static">{{formData.correction_supplier}}</div>
      </el-form-item>
      <el-form-item label="对账成本调整">
        <div class="form-content-static">{{formData.correction_cost}}</div>
      </el-form-item>
      
      <el-form-item label="供应商">
        <div class="form-content-static">{{formData.supplier_name}}</div>
      </el-form-item>
      <el-form-item label="结算流水号">
        <div class="form-content-static">{{formData.supplier_pay_no}}</div>
      </el-form-item>
      <el-form-item label="结算备注">
        <div class="form-content-static">{{formData.supplier_pay_remark}}</div>
      </el-form-item>
      <template v-if="formData.supplier_refund_after_pay_no">
        <el-form-item label="对账后退款结算金额">
          <div class="form-content-static">{{formData.supplier_refund_after_pay_price}}</div>
        </el-form-item>
        <el-form-item label="对账后退款结算流水号">
          <div class="form-content-static">{{formData.supplier_refund_after_pay_no}}</div>
        </el-form-item>
        <el-form-item label="对账后退款结算备注">
          <div class="form-content-static">{{formData.supplier_refund_after_pay_remark}}</div>
        </el-form-item>
      </template>

      
    </el-form>
  </div>
</template>

<script>
export default {
  name: "PayInfo",
  data() {
    return {};
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {}
};
</script>
<style lang="less" scoped>
  .id-card-img {
    width: 375px;
  }
</style>