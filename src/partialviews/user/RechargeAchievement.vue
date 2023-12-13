<template>
  <div>
    <div class="order-info">
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">姓名：</div>
          <div class="order-value">{{formData.name}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">手机号码：</div>
          <div class="order-value">{{formData.phone}}</div>
        </div>
      </div>
      <div class="order-row">
        <div class="order-item">
          <div class="order-label">今日新增业绩：</div>
          <div class="order-value">{{today.rechargeAmount || 0}}</div>
        </div>
        <div class="order-item">
          <div class="order-label">可提现额度：</div>
          <div v-if="today.withdrawLimit" class="order-value">{{today.totalCanWithdrawAmount || 0}}</div>
          <div v-else class="order-value success-color">不限制</div>
        </div>
      </div>

    </div>

    <hr/>
    <div style="height: 200px">
      <template v-if="!monthLoading">
        <template v-if="monthReqSuccess">
          <div class="progress-wrapper">
            <div class="progress-item">
              <div class="progress-item-title">本月目标额度：{{month.aimRechargeAmount || 0}}元</div>
              <div class="progress-bar-box">
                <div class="progress-bar">
                  <div class="progress-bar-percent" :style="'width: ' + month.aimCompleteRate + '%'"></div>
                </div>
                <div class="progress-bar-info">已完成：{{month.rechargeAmount || 0}}元</div>
              </div>
            </div>
          </div>
        </template>
        
        <template v-else>
          <div class="request-error-trigger" @click="getMonthData">本月业绩请求失败，点击此处重试</div>
        </template>
      </template>
      
      <template v-else>
        <div style="color: #999" @click="getMonthData">加载中...</div>
      </template>
    </div>


  </div>
</template>

<script>

export default {
  name: 'RechargeAchievement',
  data() {
    return {
      uid: null,

      today: {},
      month: {},
      monthLoading: true,
      monthReqSuccess: false
    };
  },
  props: {
    formData: Object,
    leaderTexts: Object
  },
  mounted() {
    this.reGetData(this.formData)
  },
  methods: {
    reGetData(data) {

      this.uid = data.uid;
      this.getTodayData(() => {
        this.getMonthData();
      });
    },
    getTodayData(handler) {
      let params = {
        uid: this.uid,
        time_type: 1 //1当天2本月
      }
      this.$get('/admin/rechargeRecord/rate', params, res => {
        this.today = res.data;
        if(handler && typeof handler == 'function') handler();
      }, err => {
        this.monthLoading = false;
      })
    },
    
    getMonthData() {
      let params = {
        uid: this.uid,
        time_type: 2 //1当天2本月
      }
      this.monthLoading = true;
      this.$sget('/admin/rechargeRecord/rate', params, res => {
        let data = res.data;
        if(!data.aimRechargeAmount || parseFloat(data.aimRechargeAmount) == 0) {
          data.aimCompleteRate = 100;
        } else {
          let aimRechargeAmount = parseFloat(data.aimRechargeAmount);
          let rechargeAmount = parseFloat(data.rechargeAmount);
          let aimCompleteRate = Math.floor(rechargeAmount / aimRechargeAmount * 100);
          if(aimCompleteRate > 100) aimCompleteRate = 100;
          data.aimCompleteRate = aimCompleteRate;
        }
        this.month = data;
        this.monthReqSuccess = true;
        this.monthLoading = false;
      }, err => {
        this.monthLoading = false;
      })
    }
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

.request-error-trigger {
  cursor: pointer;
  user-select: none;
}

</style>