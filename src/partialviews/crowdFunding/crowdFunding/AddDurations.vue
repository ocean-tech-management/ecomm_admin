<template>
   <el-form :model="formData" label-width="100px">
      <el-form-item label="有效时间段">
        <div v-for="(item, index) in formData.times" class="duration-item" :key="index">
          <div>
            <el-date-picker 
              v-model="formData.times[index]" 
              type="datetimerange" 
              :picker-options="formPickerOptions"
              range-separator="至"
              start-placeholder="开始日期" 
              end-placeholder="结束日期" 
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss" 
              :editable="false"
            ></el-date-picker>
        
            <el-button type="primary" @click="addItem(index)">+</el-button>
            <el-button v-if="formData.times.length > 1" type="danger" @click="delItem(index)">-</el-button>
          </div>
          <div style="margin-top: 10px">
            <el-input style="width: 300px" auto-complete="off" type="number" placeholder="必须是正整数" v-model="formData.targetScales[index]">
              <div slot="prepend">销售百分比</div>
              <div slot="append">%</div>
            </el-input>
          </div>
        </div>

      </el-form-item>
   </el-form>
</template>
<script>
import {formNTimePickerConfig} from '@/config';
export default {
  name: 'AddCrowdFundingStageDurations',
  data() {
    return {

      ...formNTimePickerConfig
    }
  },
  props: {
    formData: Object
  },
  methods: {
    addItem(index) {
      this.formData.times.splice(index + 1, 0, []);
      this.formData.targetScales.splice(index + 1, 0, 0);
    },
    delItem(index) {
      this.formData.times.splice(index, 1);
      this.formData.targetScales.splice(index, 1);
    }
  }
}
</script>
<style lang="less" scoped>
.duration-item {
  margin-bottom: 10px;
}
</style>