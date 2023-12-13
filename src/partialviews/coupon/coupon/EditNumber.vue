<template>
  <div>
    <el-form :model="formData" @submit.native.prevent label-width="100px">
      <el-form-item label="当前余量">
        <div class="form-content-static">{{formData.current}}</div>
      </el-form-item>
      <el-form-item label="调整数量">
        <el-input style="width: 200px" auto-complete="off" placeholder="填一下" v-model="formData.number" type="number"></el-input>
        
        <div class="form-tips">
          调整数量为
          <span class="warning-color">正数</span>
          时为
          <span class="success-color">增加数量</span>
          ，为 <span class="warning-color">负数</span>
          时则为
          <span class="error-color">减少数量</span>
          。
          减少数量大于当前剩余量时会减少到0</div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
    }
  },
  props: {
    formData: Object
  }
}
</script>