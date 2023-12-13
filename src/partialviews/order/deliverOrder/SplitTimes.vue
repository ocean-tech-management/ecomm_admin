<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="时间区间" prop="splitCycle">
        <el-date-picker
          name="splitCycle"
          v-model="splitCycle"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :clearable="false" 
          :editable="false"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="最后一次同步">
        <div class="form-content-static">{{lastUpdateTimes.create_time}}</div>
        <div class="form-tips">提示： 结束时间须在最后一次同步时间之前</div>
      </el-form-item>


    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SplitTimes',
  data() {
    return {
      formData: {},
      splitCycle: []
    }
  },
  props: {
    splitInitTime: Array,
    lastUpdateTimes: Object
  },
  mounted() {
    this.initTime(this.splitInitTime);
  },
  methods: {
    initTime(times) {
      this.splitCycle = times.splice(0, 2);
    },
    returnTimeResult() {
      return {
        start_time: this.splitCycle[0],
        end_time: this.splitCycle[1]
      }
    }
    
  }
};
</script>
