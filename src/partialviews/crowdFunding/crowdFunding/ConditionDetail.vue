<template>
  <div>
    <el-descriptions class="margin-top" title="" :column="1" border>
      <el-descriptions-item>
      <template slot="label">
        区编码：
      </template>
      {{ formData.activity_code }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template slot="label">
        轮数：
      </template>
      第 {{ formData.round_number }} 轮
    </el-descriptions-item>
    <el-descriptions-item>
      <template slot="label">
        期数：
      </template>
      第 {{ formData.period_number }} 期
    </el-descriptions-item>
    <el-descriptions-item>
      <template slot="label">
        参与条件：
      </template>
      {{ joinConditionTypes[formData.join_condition_type] }}
    </el-descriptions-item>
    <el-descriptions-item v-if="formData.join_condition_type!=-1">
      <template slot="label">
        门槛计算类型：
      </template>
      {{ priceComputeTypes[formData.price_compute_type] }}
    </el-descriptions-item>
    <el-descriptions-item v-if="formData.join_condition_type!=-1">
      <template slot="label">
        门槛计算时间类型：
      </template>
      {{ priceComputeTimeType[formData.price_compute_time_type] }}
    </el-descriptions-item>
    <el-descriptions-item v-if="formData.join_condition_type!=-1&&formData.price_compute_time_type==2">
      <template slot="label">
        开始时间：
      </template>
      {{ formData.condition_price_start_time }}
    </el-descriptions-item>
    <el-descriptions-item v-if="formData.join_condition_type!=-1&&formData.price_compute_time_type==2">
      <template slot="label">
        结束时间：
      </template>
      {{ formData.condition_price_end_time }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template slot="label">
        门槛金额
      </template>
      {{formData.condition_price }}
    </el-descriptions-item>
  </el-descriptions>
  </div>
</template>
<script>
/*
 *@Date: 2023-06-16 11:51:48
 *@Description: 模块描述
*/
export default {
  name: '',
  props:{
    formData:{
      type:Object,
      default:()=>{
        return {}
      }
    }
  },
  data () {
    return {
      priceComputeTypes:{
        [1]:'累计全部',
        [2]:'指定金额内',
        [3]:'指定金额以外',
      },
      joinConditionTypes:{
        [1]:"全区的累计参与额度",
        [2]:'本区的累计参与额度',
        [-1]:'无门槛'
      },
      priceComputeTimeType:{
        [1]:'不限时间范围',
        [2]:'指定时间内'
      }
    }
  },
  created () {},
  mounted () {},
  methods: {},
}
</script>

<style lang="less" scoped>
/deep/ .el-descriptions-item__label{
  width: 150px;
}
</style>
