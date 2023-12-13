<template>
  <div>
    <div v-if="formData.memberInfo" class="order-info">
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">姓名：</div>
          <div class="order-value">{{formData.memberInfo.user_name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">手机号码：</div>
          <div class="order-value">{{formData.memberInfo.user_phone}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">角色：</div>
          <div class="order-value">{{formData.memberInfo.vip_name}}</div>
        </div>
      </div>
      <!-- <div class="order-row">
        <div class="order-item">
          <div class="order-label">院士推荐人：</div>
          <div class="order-value">{{formData.user_name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">推荐人手机：</div>
          <div class="order-value">{{formData.user_name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">创建时间：</div>
          <div class="order-value">{{formData.create_time}}</div>
        </div>
      </div> -->

      <div v-if="formData.memberInfo.pUser" class="order-row">
        <div class="order-item">
          <div class="order-label">TA的上级：</div>
          <div class="order-value">{{formData.memberInfo.pUser.name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">手机号码：</div>
          <div class="order-value">{{formData.memberInfo.pUser.phone}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">团队规模：</div>
          <div class="order-value">{{formData.memberInfo.allTeamNumber}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">进货总额：</div>
          <div class="order-value">{{formData.memberInfo.allTeamOrderPrice}}</div>
        </div>
      </div>

    </div>

    <hr/>
    <div v-if="formData.aims" class="progress-wrapper">
      <div class="progress-title">
        商城会员晋级进度
      </div>
      <div v-for="(item, index) in formData.aims" class="progress-item" :key="index">
        <div class="progress-item-title">{{item.title}}（{{item.aimsNumber}}）</div>
        <div class="progress-bar-box">
          <div class="progress-bar">
            <div class="progress-bar-percent" :style="'width: ' + item.progress + '%'"></div>
          </div>
          <div v-if="item.distance <= 0" class="progress-bar-info success-color">已满足</div>
          <div v-if="item.distance > 0" class="progress-bar-info">还差{{item.distance}}</div>
        </div>
      </div>
    </div>
    <hr/>
    <div v-if="formData.teamAims" class="progress-wrapper" style="margin-top: 20px">
      <div class="progress-title">
        团队业绩代理人晋级进度
      </div>
      <div v-for="(item, index) in formData.teamAims" class="progress-item" :key="index">
        <div class="progress-item-title">{{item.title}}（{{item.aimsNumber}}）</div>
        <div class="progress-bar-box">
          <div class="progress-bar">
            <div class="progress-bar-percent" :style="'width: ' + item.progress + '%'"></div>
          </div>
          <div v-if="item.distance <= 0" class="progress-bar-info success-color">已满足</div>
          <div v-if="item.distance > 0" class="progress-bar-info">还差{{item.distance}}</div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>

export default {
  name: 'AgentDetail',
  data() {
    return {
    };
  },
  props: {
    formData: Object,
    leaderTexts: Object
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
.order-label {
  width: 100px;
  text-align: right;
  color: #999;
}
.order-value {
}
.error {
  color: #f00;
}

.progress-title {
  font-size: 18px;
}
.progress-item {
  margin-top: 15px;
}
.progress-bar-box {
  display: flex;
  align-items: center;
}
.progress-item-title {
  color: #999;
}
.progress-bar {
  position: relative;
  width: 200px;
  height: 10px;
  border: 1px solid #999;
  border-radius: 5px;
}
.progress-bar-percent {
  position: absolute;
  top: 0;
  left: 0;
  height: 10px;
  border-left: 1px solid #618df5;
  border-right: 1px solid #618df5;
  border-radius: 5px;
  background-color: #618df5;
}
.progress-bar-info {
  margin-left: 15px;
}

</style>