<template>
  <div>
    <el-form label-width="140px">
      <el-form-item label="区编码">
        <el-input disabled v-model="formData.activity_code" style="width:250px"/>
      </el-form-item>
      <el-form-item label="轮数" >
        <el-input disabled v-model="formData.round_number" style="width:250px"/>
      </el-form-item>
      <el-form-item label="期数">
        <el-input disabled v-model="formData.period_number" style="width:250px"/>
      </el-form-item>
      <el-form-item label="参与条件">
        <el-select
          placeholder="请选择"
          name="join_condition_type"
          v-model="formData.join_condition_type"
        >
          <el-option label="无门槛" :value="-1"></el-option>
          <el-option label="全区的累计参与额度" :value="1"></el-option>
          <el-option label="本区的累计参与额度" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="门槛计算类型" v-if="formData.join_condition_type!=-1">
        <el-select
          placeholder="请选择"
          name="price_compute_type"
          v-model="formData.price_compute_type"
        >
          <el-option label="累计全部" :value="1"></el-option>
          <el-option label="指定金额内" :value="2"></el-option>
          <el-option label="指定金额以外" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="门槛计算时间类型" v-if="formData.join_condition_type!=-1">
        <el-select
          placeholder="请选择"
          name="price_compute_time_type"
          v-model="formData.price_compute_time_type"
        >
          <el-option label="不限时间范围" :value="1"></el-option>
          <el-option label="指定时间内" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="门槛金额" v-if="formData.join_condition_type!=-1">
        <el-input class="price-input" v-model="formData.condition_price" type="number" placeholder="请输入门槛金额,建议俩位小数"/>
      </el-form-item>
      <el-form-item label="开始时间~结束时间" v-if="formData.price_compute_time_type==2&&formData.join_condition_type!=-1" >
        <el-date-picker
              name="createDate"
              v-model="formData.createDate"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              :clearable="false"
              :editable="false"
            ></el-date-picker>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import moment from 'moment';

/*
 *@Date: 2023-06-15 15:43:46
 *@Description: 模块描述
 */
export default {
  name: "setCondition",
  props: {
    formData: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      pickerOptions: {
    shortcuts: [{
        text: "今日",
        onClick(picker) {
          let start = moment().format('YYYY-MM-DD 00:00:00');
          let end = moment().format('YYYY-MM-DD 23:59:59');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "本周",
        onClick(picker) {
          let weekOfday = parseInt(moment().format('d')) // 计算今天是这周第几天  周日为一周中的第一天
          let start = moment().subtract(weekOfday, 'days').format('YYYY-MM-DD 00:00:00');
          let end = moment().add(7 - weekOfday - 1, 'days').format('YYYY-MM-DD 23:59:59');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "本月",
        onClick(picker) {
          let start = moment(moment().format('YYYY-MM') + '-01').format('YYYY-MM-DD 00:00:00');
          let end = moment(start).add('month', 1).add('days', -1).format('YYYY-MM-DD 23:59:59')
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近一周",
        onClick(picker) {
          let start = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
          let end = moment().format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近两周",
        onClick(picker) {
          let start = moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss');
          let end = moment().format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近一个月",
        onClick(picker) {
          let start = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
          let end = moment().format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近三个月",
        onClick(picker) {
          let start = moment().subtract(90, 'days').format('YYYY-MM-DD HH:mm:ss');
          let end = moment().format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
    ],
  },
      createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
    };
  },
  created() {
    console.log(this.formData);
  },
  mounted() {},
  methods: {}
};
</script>

<style lang="less" scoped>
.price-input{
  width: 300px;
}
</style>
