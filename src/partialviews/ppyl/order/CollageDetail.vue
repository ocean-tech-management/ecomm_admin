<template>
  <div>
    <div orderinfo>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">拼团名：</div>
          <div class="order-value">{{formData.pt_name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">成团要求：</div>
          <div class="order-value">{{formData.group_number}}人团</div>
        </div>
        <div class="order-item">
          <div class="order-label">成团状态：</div>
          <div class="order-value">{{statusTexts[formData.activity_status]}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item-long">
          <div class="order-label">拼团有效期：</div>
          <div class="order-value">{{formData.start_time}} ~ {{formData.end_time}}</div>
        </div>
      </div>
      <div style="margin-top: 30px;"></div>
      
      <el-table style="width: 100%; margin-bottom: 20px;" :data="formData.users">
       <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.avatarUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="100" prop="name">
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
        <el-table-column label="派发红包" width="120" prop="reward_price"></el-table-column>
        <el-table-column label="拼团时间" prop="create_time"></el-table-column>
        <el-table-column label="拼拼状态" width="120" prop="activity_status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.activity_status]}}
          </template>
        </el-table-column>
      </el-table>

    </div>


  </div>
</template>

<script>

export default {
  name: 'PpylCollageDetail',
  data() {
    return {
      statusTexts: {
        [1]: '拼团中',
        [2]: '拼团完成',
        [3]: '超时未完成',
        [-1]: '已取消',
        [-2]: '已退款',
        [-3]: '未中奖退款'
      }
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {

  }
};
</script>

<style lang="less" scoped>
.order-row {
  display: flex;
  margin-bottom: 15px;
}
.order-item {
  display: flex;
  width: 33.33%;
}
.order-item-long {
  display: flex;
  flex: 1;
}
.order-item-row {
  display: flex;
}
.order-label {
  width: 100px;
  text-align: right;
  color: #999;
}
.order-value {
  flex: 1;
}
.error {
  color: #f00;
}
</style>