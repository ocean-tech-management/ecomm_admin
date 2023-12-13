<template>
  <div>
    
    <el-form :model="formData" label-width="100px">
      <el-form-item label="调整金额">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.sales_price"
        ></el-input>
        <div class="form-tips">
          调整金额值为
          <span class="warning-color">正数</span>
          时为
          <span class="success-color">拉高销售额</span>
          ，为 <span class="warning-color">负数</span>
          时则为
          <span class="error-color">降低销售额</span>
          。
          降低销售额大于当前销售额值时会减少到0</div>
      </el-form-item>
      
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'EditStocks',
  data() {
    return {
      dataList: []
    };
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
