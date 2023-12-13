<template>
  <div>
    <el-form :model="formData" @submit.native.prevent label-width="100px">
      <el-form-item label="订单编号">
        <div class="form-content-static">{{formData.order_sn}}</div>
      </el-form-item>
      <el-form-item label="商品名称">
        <div class="form-content-static">{{formData.title}}</div>
      </el-form-item>
      <el-form-item label="购买数量">
        <div class="form-content-static">×{{formData.count || 0}}</div>
      </el-form-item>
      <el-form-item label="调整金额">
        <el-select style="width: 220px" placeholder="选择类型" name="type" v-model="formData.type">
          <el-option label="运费调整" :value="1"></el-option>
          <el-option label="售后扣除供应商金额" :value="2"></el-option>
          <el-option label="对账成本调整" :value="3"></el-option>
        </el-select>
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