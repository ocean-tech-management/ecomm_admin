<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <div class="logistic-item">
        <el-form-item label="发货情况">
          <el-radio-group name="offline_type" v-model="formData.offline_type" @change="$forceUpdate()">
            <el-radio :label="1">有物流信息</el-radio>
            <el-radio :label="2">无物流信息</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.offline_type == 1" label="物流信息">
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
  name: "OfflineDelivery",
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
      this.formData.shipping_company = this.logisticsCompanys[companyIndex].company;
      this.formData.shipping_company_code = this.logisticsCompanys[companyIndex].company_code;
      this.formData.index = companyIndex;
    }
  }
};
</script>

<style scoped>
  .leader-condition {
    margin-bottom: 10px;
  }
</style>