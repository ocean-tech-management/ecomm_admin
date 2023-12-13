<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="订单号">
        <div class="form-content-static">{{formData.order_sn}}</div>
      </el-form-item>
      <el-form-item label="异常编号">
        <div class="form-content-static">{{formData.abnormal_sn}}</div>
      </el-form-item>
      <el-form-item label="订单商品数">
        <div class="form-content-static">{{formData.order_goods_number}}</div>
      </el-form-item>
      <el-form-item label="有效商品数">
        <el-input style="max-width: 250px" auto-complete="off" placeholder="填写要有效的商品数" v-model="formData.operate_number" type="number"></el-input>
        <div class="form-tips">本记录对应的订单中要算它多少件商品是有效的，该数量影响实际发放的套餐数。最多不能超过订单商品数</div>
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input style="width: 600px" auto-complete="off" placeholder="请填写" v-model="formData.remark"></el-input>
      </el-form-item>
          

    </el-form>
  </div>
</template>

<script>
export default {
  name: "AbnormalHandselOperate",
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