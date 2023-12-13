<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="chart-list">
        <div class="chart-item">
          <ve-line :data="chartData" height="300px"></ve-line>
        </div>
        <div class="chart-item">
          <ve-histogram :data="chartData" height="300px"></ve-histogram>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import moment from 'moment';
import { formatDate } from '@/util/index.js';
import { axiosConfig, expireTime, noTokenReqs } from '@/config.js';

export default {
  data() {
    return {
      chartData: {
        columns: ['日期', '日PV', '日UV'],
        rows: [
          { 日期: '1月1日', 日PV: 3123, 日UV: 2123 },
          { 日期: '1月2日', 日PV: 1223, 日UV: 1423 },
          { 日期: '1月3日', 日PV: 723, 日UV: 523 },
          { 日期: '1月4日', 日PV: 4123, 日UV: 2623 },
          { 日期: '1月5日', 日PV: 3123, 日UV: 1723 },
          { 日期: '1月6日', 日PV: 7123, 日UV: 1823 }
        ]
      }
    };
  },
  mounted() {}
};
</script>

<style lang="less">
.chart-list {
  display: flex;
  margin-top: 40px;
}
.chart-item {
  width: 50%;
  padding: 0 15px;
  box-sizing: border-box;
}
</style>