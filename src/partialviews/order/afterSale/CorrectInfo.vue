<template>
  <div>
    <el-form :model="formData" @submit.native.prevent label-width="100px">
      <el-form-item label="订单编号">
        <div class="form-content-static">{{formData.order_sn}}</div>
      </el-form-item>
      <el-form-item label="商品名称">
        <div class="form-content-static">{{formData.title}}</div>
      </el-form-item>
      <el-form-item label="退售后用户">
        <div class="form-content-static">{{formData.user_name}}</div>
      </el-form-item>
      <el-form-item label="售后扣除金额">
        <el-input style="width: 200px" auto-complete="off" placeholder="填一下" v-model="formData.price" type="number"></el-input>
      </el-form-item>
      <el-form-item label="操作说明" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入操作说明"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'CorrectInfo',
  data() {
    return {
    }
  },
  props: {
    formData: Object
  }
}
</script>