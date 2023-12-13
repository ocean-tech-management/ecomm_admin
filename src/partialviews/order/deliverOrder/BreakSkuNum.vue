<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="商品名称">
        <div class="form-content-static">
          {{formData.title}}
        </div>
      </el-form-item>
      <el-form-item label="总件数">
        <div class="form-content-static">
          {{formData.count}}
        </div>
      </el-form-item>
      <el-form-item label="拆多少件">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="请输入" v-model="formData.number"></el-input><span style="margin-left: 10px;">件</span>
        <div class="form-tips">友情提示： 数量不能超过总件数，且要为1，2，3，4这种正整数哦</div>
      </el-form-item>


    </el-form>
  </div>
</template>

<script>
export default {
  name: 'BreakSkuNum',
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
