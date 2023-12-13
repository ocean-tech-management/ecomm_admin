<template>
  <div>

    <el-form :model="formData" label-width="100px">
      <el-form-item label="抽奖活动名称">
        <div class="form-content-static">{{formData.title}}</div>
      </el-form-item>
      <el-form-item label="报名时间" label-width="100px">
        <div class="form-content-static">{{formData.time[0]}} ~ {{formData.time[1]}}</div>
      </el-form-item>
      <el-form-item label="开奖时间" label-width="100px">
        <div class="form-content-static">{{formData.lottery_start_time}}</div>
      </el-form-item>
      <el-form-item label="关联期次" label-width="100px">
        {{formData.stageInfo || '——'}}
      </el-form-item>
      <el-form-item label="期总金额" label-width="100px">
        {{formData.crowd_price || '——'}}
      </el-form-item>
      <el-form-item label="奖池金额占比" label-width="100px">
        <div class="form-content-static">{{formData.lottery_scale_val}}%</div>
      </el-form-item>
      <el-form-item label="本期奖池金额" label-width="100px">
        {{formData.lottery_price || '——'}}
      </el-form-item>
      <el-form-item label="抽奖设置" label-width="100px">
        <div class="lottery-levels">
          <div v-for="(item, index) in formData.lottery_scope" class="lottery-level" :key="index">
            <span>{{item.win_level}}等奖</span>
            <span class="warning-color"> {{formData.lottery_scope[index].win_number}} </span>
            人，平分奖金占本期奖池金额
            
            <span class="warning-color"> {{formData.lottery_scope[index].win_scale_val}} </span> %
          </div>
        </div>
      </el-form-item>

      

    </el-form>
    

  </div>
</template>

<script>
export default {
  name: 'EditCrowdFundingLottery',
  data() {
    return {
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {

    updateLotteryPrice() {
      let price = 0;
      if(this.formData.crowd_price && this.formData.lottery_scale_val) {
        price = this.formData.crowd_price * this.formData.lottery_scale_val / 100;  //因为是转百分比的
        price = price.toFixed(2);
      }
      this.formData.lottery_price = price;
    }
  }
};
</script>


<style lang="less" scoped>
.lottery-level {
  margin-bottom: 8px;
}
</style>