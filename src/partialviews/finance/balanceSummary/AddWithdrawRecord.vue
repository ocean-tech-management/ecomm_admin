<template>
  <div>
    <el-form :model="formData" @submit.native.prevent label-width="100px">
      <el-form-item label="发生时间" prop="time">
        <el-date-picker
          v-model="formData.time"
          type="datetime"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :clearable="false"
          align="right"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="金额">
        <el-input style="width: 200px" auto-complete="off" placeholder="填一下" v-model="formData.price" type="number"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'AddWithdrawRecord',
  data() {
    return {
    }
  },
  props: {
    formData: Object
  }
}
</script>