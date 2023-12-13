<template>
  <div>
    <el-form :model="formData">
      <div class="logistic-item">
  
        <el-form-item label="物流信息" label-width="100px">
          <div class="leader-condition">
            <el-select name="company_code" v-model="formData.index" @change="updateLogisticsCompany($event)">
              <el-option v-for="(logistics, logisticsIndex) in logisticsCompanys" :label="logistics.company" :value="logisticsIndex" :key="logistics.company_code"></el-option>
            </el-select>
            <el-input style="width: 200px;" auto-complete="off" placeholder="物流编号" v-model="formData.shipping_code"></el-input>
          </div>
        </el-form-item>
      </div>

    </el-form>
  </div>
</template>

<script>
export default {
  name: "ReLogistics",
  data() {
    return {
    };
  },
  props: {
    formData: Object,
    logisticsCompanys: Array
  },
  mounted() {
  },
  methods: {
    updateLogisticsCompany(val) {
      let companyIndex = val;
      this.formData.company = this.logisticsCompanys[companyIndex].company;
      this.formData.company_code = this.logisticsCompanys[companyIndex].company_code;
      this.formData.index = companyIndex;
    },
  }
};
</script>

<style scoped>
  .leader-condition {
    margin-bottom: 10px;
  }
</style>