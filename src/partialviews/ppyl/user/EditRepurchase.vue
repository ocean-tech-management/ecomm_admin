<template>
  <div>
    <el-form :model="formData">
      <el-form-item label="订单号" label-width="100px">
        <el-input style="max-width: 250px" auto-complete="off" placeholder="请输入订单号" v-model="formData.order_sn"></el-input>
      </el-form-item>
      <el-form-item label="调整次数" label-width="100px">
        <el-input style="max-width: 250px" auto-complete="off" placeholder="填写要修改的次数" v-model="formData.number" type="number"></el-input>
        <div class="form-tips">
          调整次数值为
          <span class="warning-color">正数</span>
          时为
          <span class="success-color">增加次数</span>
          ，为 <span class="warning-color">负数</span>
          时则为
          <span class="error-color">减少次数</span>
          。
          减少次数大于当前次数值时会减少到0</div>
      </el-form-item>
      
          

    </el-form>
  </div>
</template>

<script>
export default {
  name: "EditRepurchase",
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