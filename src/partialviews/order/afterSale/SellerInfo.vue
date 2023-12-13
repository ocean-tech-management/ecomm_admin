<template>
  <div>
    <el-form style="margin-top: 20px;" :model="formData" label-width="150px">
      <el-form-item label="商家收货联系人">
        <el-input style="width: 500px" auto-complete="off" placeholder="请输入" v-model="formData.seller_shipping_name"></el-input>
      </el-form-item>
      <el-form-item label="商家收货联系方式">
        <el-input style="width: 500px" auto-complete="off" placeholder="请输入" v-model="formData.seller_shipping_phone"></el-input>
      </el-form-item>
      <el-form-item label="商家收货地址">
        <el-input style="width: 500px" type="textarea" rows="3" auto-complete="off" placeholder="请输入" v-model="formData.seller_shipping_address"></el-input>
      </el-form-item>
      <el-form-item label="商家备注">
        <el-input style="width: 500px" auto-complete="off" placeholder="请输入" v-model="formData.seller_remark"></el-input>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'SellerInfo',
  data() {
    return {
    }
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {  

  }
};
</script>
