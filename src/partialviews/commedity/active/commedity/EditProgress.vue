<template>
  <el-form label-width="120px">
    <el-form-item label="商品名">
      <div class="form-content-static">{{formData.title}}</div>
    </el-form-item>
    <el-form-item label="进度" prop="scale">
      <el-input style="width: 200px" type="number" v-model="formData.scale" placeholder="进度，正整数">
        <template slot="append">%</template>
      </el-input>
      <div class="form-tips">进度请填写1~99范围内的整数（1，2，3，...）</div>
    </el-form-item>
  </el-form>
</template>
<script>

export default {
  name: 'EditProgress',
  props: {
    formData: Object
  },
  methods: {
    
  }
}
</script>
