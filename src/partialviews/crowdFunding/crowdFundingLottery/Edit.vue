<template>
  <div>

    <el-form :model="formData" label-width="100px">
      <el-form-item label="抽奖活动名称">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.title"
        ></el-input>
      </el-form-item>
      <el-form-item label="报名时间" label-width="100px">
        <el-date-picker
          v-model="formData.time"
          type="datetimerange"
          :picker-options="formPickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :editable="false"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="开奖时间" label-width="100px">
        <el-date-picker
          v-model="formData.lottery_start_time"
          type="datetime"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :clearable="false"
          align="right"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="关联期次" label-width="100px">
        {{formData.stageInfo || '——'}}
      </el-form-item>
      <el-form-item label="期总金额" label-width="100px">
        {{formData.crowd_price || '——'}}
      </el-form-item>
      <el-form-item label="奖池金额占比" label-width="100px">
        <el-input style="width: 200px" auto-complete="off" type="number" placeholder="最多4位小数" v-model="formData.lottery_scale_val" @change="updateLotteryPrice">
          <div slot="append">%</div>
        </el-input>
      </el-form-item>
      <el-form-item label="本期奖池金额" label-width="100px">
        {{formData.lottery_price || '——'}}
      </el-form-item>
      <el-form-item label="抽奖设置" label-width="100px">
        <div class="lottery-levels">
          <div v-for="(item, index) in formData.lottery_scope" class="lottery-level" :key="index">
            <span>{{item.win_level}}等奖</span>
            <el-input style="width: 130px" auto-complete="off" type="number" placeholder="正整数" v-model="formData.lottery_scope[index].win_number"></el-input>
            人，平分奖金占本期奖池金额
            <el-input style="width: 200px" auto-complete="off" type="number" placeholder="正整数" v-model="formData.lottery_scope[index].win_scale_val">
              <div slot="append">%</div>
            </el-input>
          </div>
        </div>
      </el-form-item>

      

    </el-form>
    

  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
export default {
  name: 'EditCrowdFundingLottery',
  data() {
    return {

      ...formNTimePickerConfig
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