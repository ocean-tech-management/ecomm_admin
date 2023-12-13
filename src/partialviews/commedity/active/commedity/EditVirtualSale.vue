<template>
  <el-form label-width="120px">
    <el-form-item label="商品名">
      <div class="form-content-static">{{formData.title}}</div>
    </el-form-item>
    <el-form-item label="虚拟销量" prop="sale_number">
      <el-input style="width: 200px" type="number" v-model="formData.sale_number" placeholder="虚拟销量，正整数">
        <template slot="append">件</template>
      </el-input>
    </el-form-item>
    <el-form-item label="真实销售">
      <div class="form-content-static">
        <span class="success-color">{{formData.origin_sale_number || 0}}</span> 件
      </div>
    </el-form-item>
  </el-form>
</template>
<script>

export default {
  name: 'EditVirtualSale',
  props: {
    formData: Object
  },
  methods: {
    
  }
}
</script>
