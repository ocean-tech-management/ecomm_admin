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
        <el-table-column label="订单金额" width="120" prop="real_pay_price"></el-table-column>
        <el-table-column label="拼团时间" prop="create_time"></el-table-column>
        <el-table-column label="支付状态" width="120" prop="pay_status">
          <template slot-scope="scope">
            {{payStatusTexts[scope.row.pay_status]}}
          </template>
        </el-table-column>
        <el-table-column label="拼团状态" width="120" prop="pay_status">
          <template slot-scope="scope">
            {{collageStatuTexts[scope.row.activity_status]}}
          </template>
        </el-table-column>
      </el-table>

    </div>


  </div>
</template>

<script>

export default {
  name: 'CollageDetail',
  data() {
    return {
      collageStatuTexts: {
        [1]: '拼团中',
        [2]: '拼团成功',
        [3]: '超时失败',
        [-1]: '未支付',
        [-2]: '已退款'
      },
      payStatusTexts: {
        [1]: '未支付',
        [2]: '已支付',
        [-1]: '取消支付',
        [-2]: '已退款'
      },
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