<template>
  <div class="subpage-content">
    <div class="default-container">
      <template v-if="$auths.includes('index') && $auths.includes('summary/all')">
        <div class="info-rows">
          <template v-if="$auths.includes('summary/sale')">
            <div class="info nav-enter" v-loading="saleLoading" @click="navigateTo('leaderBoard')">
              <div class="overview-item">
                <div class="overview-icon-box">
                  <img
                    class="overview-icon"
                    src="../../assets/imgs/sale.png"
                    alt=""
                  />
                </div>
                <div class="overview-content">
                  <div class="overview-sign-val">
                    <div class="overview-sign">￥</div>
                    <div class="info-value">{{ sale.today }}</div>
                  </div>
                  <div class="info-content-title">今日销售总额</div>
                </div>
                <div class="overview-others">
                  <div class="overview-other">本月：￥{{ sale.month }}</div>
                  <div class="overview-other">汇总：￥{{ sale.total }}</div>
                </div>
              </div>
            </div>
          </template>
          <div class="info nav-enter" @click="navigateTo('commedityOrders')">
            <div class="overview-item">
              <div class="overview-icon-box">
                <img
                  class="overview-icon"
                  src="../../assets/imgs/order.png"
                  alt=""
                />
              </div>
              <div class="overview-content">
                <div class="overview-sign-val">
                  <div class="info-value">{{ order.today }}</div>
                </div>
                <div class="info-content-title">今日订单量</div>
              </div>
              <div class="overview-others">
                <div class="overview-other">本月：{{ order.month }}</div>
                <div class="overview-other">汇总：{{ order.total }}</div>
              </div>
            </div>
          </div>
          <template v-if="$auths.includes('summary/summaryHard')">
            <div class="info nav-enter" v-loading="profitLoading" @click="navigateTo('orderProfit')">
              <div class="overview-item">
                <div class="overview-icon-box">
                  <img
                    class="overview-icon"
                    src="../../assets/imgs/money.png"
                    alt=""
                  />
                </div>
                <div class="overview-content">
                  <div class="overview-sign-val">
                    <div class="overview-sign">￥</div>
                    <div class="info-value">{{ profit.today }}</div>
                  </div>
                  <div class="info-content-title">今日利润</div>
                </div>
                <div class="overview-others">
                  <div class="overview-other">本月：￥{{ profit.month }}</div>
                  <div class="overview-other">汇总：￥{{ profit.total }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="info-rows">
          <div class="info" v-loading="baseLoading">
            <div class="info-title pdl20">待办事项</div>
            <div class="event-list">
              <div
                class="event-item nav-enter"
                @click="navigateTo('deliveryOrders')"
              >
                <div class="info-value">{{ order.un_deliver }}</div>
                <div class="info-content-title">待发货订单</div>
              </div>
              <div
                class="event-item nav-enter"
                @click="navigateTo('commedityOrders')"
              >
                <div class="info-value">{{ order.un_pay }}</div>
                <div class="info-content-title">待付款订单</div>
              </div>
              <div
                class="event-item nav-enter"
                @click="navigateTo('afterSales')"
              >
                <div class="info-value">{{ order.un_refund }}</div>
                <div class="info-content-title">待处理退款</div>
              </div>
            </div>
          </div>
          <div class="info" v-loading="baseLoading">
            <div class="view-list">
              <div class="view-item">
                <div class="view-title">PV浏览量</div>
                <div class="info-value">{{ view.pv }}</div>
                <div class="info-content-title">
                  同比昨日{{ view.pv_growth_rate }}
                </div>
              </div>
              <div class="view-item">
                <div class="view-title">UV访客数</div>
                <div class="info-value">{{ view.uv }}</div>
                <div class="info-content-title">
                  同比昨日{{ view.uv_growth_rate }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <template v-if="$auths.includes('summary/sale')">
          <div class="info-rows">
            <div class="info" v-loading="saleLoading">
              <div class="info-title pdl20 info-bar-title">
                <div>销售额图表</div>
                <div class="info-bar-ctrls">
                  <template v-if="$auths.includes('summary/sale')">
                    <el-select placeholder="按年度" name="saleStep" v-model="saleStep" @change="updateSaleStep">
                      <el-option label="按年度" :value="1"></el-option>
                      <el-option label="按月度" :value="2"></el-option>
                    </el-select>
                  </template>
                </div>
              </div>
              <div class="chart-box">
                <div class="chart-content">
                  <div class="info-title pdl20">销售额趋势</div>
                  <ve-histogram
                    :data="saleInfo"
                    :settings="saleInfoSettings"
                  ></ve-histogram>
                </div>
                <div class="chart-leaderboard-box">
                  <div class="info-title">年度排名</div>
                  <div class="chart-leaderboards">
                    <div
                      class="chart-leaderboard"
                      v-for="(item, index) in yearTable"
                      :key="index"
                    >
                      <div class="chart-leaderboard-ranking front">
                        {{ index + 1 }}
                      </div>
                      <div class="chart-leaderboard-content">
                        {{ item.label }}
                      </div>
                      <div class="chart-leaderboard-value">
                        ￥{{ item.value }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="info-rows">
          <div class="info nav-enter" v-loading="baseLoading" @click="navigateTo('users')">
            <div class="baseinfo-total-item">
              <div class="info-content-title">注册用户汇总</div>
              <div class="baseinfo-total-value">
                <div class="info-value">{{ user.total }}</div>
              </div>
              <div class="baseinfo-total-extends">
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">今日</div>
                  <div class="baseinfo-extend-value">{{ user.today }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="info nav-enter" v-loading="baseLoading" @click="navigateTo('agents')">
            <div class="baseinfo-total-item">
              <div class="info-content-title">lv3汇总</div>
              <div class="baseinfo-total-value">
                <div class="info-value">{{ agent.partner.total }}</div>
              </div>
              <div class="baseinfo-total-extends">
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">昨日</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.partner.yesterday }}
                  </div>
                </div>
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">今日</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.partner.today }}
                  </div>
                </div>
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">本月</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.partner.month }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="info nav-enter" v-loading="baseLoading" @click="navigateTo('agents')">
            <div class="baseinfo-total-item">
              <div class="info-content-title">lv2汇总</div>
              <div class="baseinfo-total-value">
                <div class="info-value">{{ agent.seniorLeader.total }}</div>
              </div>
              <div class="baseinfo-total-extends">
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">昨日</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.seniorLeader.yesterday }}
                  </div>
                </div>
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">今日</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.seniorLeader.today }}
                  </div>
                </div>
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">本月</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.seniorLeader.month }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="info nav-enter" v-loading="baseLoading" @click="navigateTo('agents')">
            <div class="baseinfo-total-item">
              <div class="info-content-title">VIP汇总</div>
              <div class="baseinfo-total-value">
                <div class="info-value">{{ agent.leader.total }}</div>
              </div>
              <div class="baseinfo-total-extends">
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">昨日</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.leader.yesterday }}
                  </div>
                </div>
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">今日</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.leader.today }}
                  </div>
                </div>
                <div class="baseinfo-total-extend">
                  <div class="info-content-title">本月</div>
                  <div class="baseinfo-extend-value">
                    {{ agent.leader.month }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template>
          <div class="info-rows">
              <div class="info" v-loading="baseLoading">
                <div class="info-title pdl20 info-bar-title">
                  <div>用户增长曲线</div>
                </div>
                <div class="chart-box">
                  <div class="chart-content">
                    <ve-line
                      :data="vipGrowth"
                      :settings="vipGrowthSettings"
                    ></ve-line>
                  </div>
                </div>
              </div>
          </div>
        </template>
      </template>
      <template v-else>
        <div class="no-index-auth">欢迎您使用{{ $systemName }}产品端</div>
      </template>
    </div>
  </div>
</template>


<script>

export default {
  data() {
    this.vipGrowthSettings = {
      dimension: ["label"],
      metrics: ["partner", "seniorLeader", "leader", "normal"],

      labelMap: {
        partner: "lv3",
        seniorLeader: "lv2",
        leader: "lv1",
        normal: "注册用户"
      },
    };
    this.userGrowthSettings = {
      dimension: ["label"],
      metrics: ["value"],

      labelMap: {
        value: "会员数",
      },
    };
    this.saleInfoSettings = {
      dimension: ["label"],
      metrics: ["value"],
      legendName: {
        value: "销售额",
      },
      labelMap: {
        value: "销售额",
      },
    };
    return {
      baseLoading: true,
      profitLoading: true,
      saleLoading: true,

      sale: {
        total: 0,
        today: 0,
        month: 0,
      },
      order: {
        total: 0,
        today: 0,
        month: 0,
        un_deliver: 0,
        un_pay: 0,
        un_refund: 0,
      },
      profit: {
        total: 0,
        today: 0,
        month: 0,
      },
      view: {
        pv: "——",
        uv: "——",
        pv_growth_rate: "——",
        uv_growth_rate: "——",
      },
      user: {
        total: "——",
        today: "——",
      },
      agent: {
        partner: {
          month: "——",
          today: "——",
          total: "——",
        },
        seniorLeader: {
          month: "——",
          today: "——",
          total: "——",
        },
        leader: {
          month: "——",
          today: "——",
          total: "——",
        },
      },
      yearTable: [],
      saleInfo: {
        columns: ["label"],
        rows: [
          // { label: "1月", value: 0 },
          // { label: "2月", value: 0 },
          // { label: "3月", value: 0 },
          // { label: "4月", value: 0 },
          // { label: "5月", value: 0 },
          // { label: "6月", value: 0 },
          // { label: "7月", value: 0 },
          // { label: "8月", value: 0 },
          // { label: "9月", value: 0 },
          // { label: "10月", value: 0 },
          // { label: "11月", value: 0 },
          // { label: "12月", value: 0 },
        ],
      },
      vipGrowth: {
        columns: ["label"],
        rows: [
          { label: "1月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "2月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "3月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "4月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "5月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "6月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "7月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "8月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "9月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "10月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "11月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
          { label: "12月", partner: 0, seniorLeader: 0, leader: 0, normal: 0 },
        ],
      },
      saleStep: 2, //1或者默认：按年， 2： 按月
      userTimeType: 1 //1为按月 2为按年
    };
  },
  mounted() {
    if (!this.$auths || this.$auths.length == 0)
      window.location.replace("/#/login");
    if (this.$auths.includes("index") && this.$auths.includes('summary/all')) {
      this.getData();
      this.getProfitData();
      this.getSaleData();
    }
  },
  methods: {
    getData() {
      let queryVal = {
        keyword: "",
      };
      this.$sget("/admin/summary/all", queryVal, (res) => {
        this.order = res.data.order;
        this.view = res.data.view;
        this.user = res.data.user;
        this.agent = res.data.agent;
        for (let i = 0; i < res.data.agent.rows.length; i++) {
          res.data.agent.rows[i].label = res.data.agent.rows[i].month;
        }
        for (let i = 0; i < res.data.user.rows.length; i++) {
          res.data.user.rows[i].label = res.data.user.rows[i].month;
        }
        this.vipGrowth.rows = res.data.agent.rows;
        this.userGrowth.rows = res.data.user.rows;

        this.baseLoading = false;
      }, err => {
        this.baseLoading = false;
      });
    },
    getProfitData() {
      if(!this.$auths.includes("summary/summaryHard")) return;
      let queryVal = {
        keyword: "",
      };
      this.$sget("/admin/summary/summaryHard", queryVal, (res) => {
        this.profit = res.data.profit;
        this.profitLoading = false;
      }, err => {
        this.profitLoading = false;
      });
    },
    getSaleData() {
      if(!this.$auths.includes("summary/sale")) return;
      let queryVal = {
        keyword: "",
      };
      this.$sget("/admin/summary/sale", queryVal, (res) => {
        this.sale = res.data.sale;
        this.saleInfo.rows = [];
        let rows = res.data.sale.rows;
        for (let i = 0; i < rows.length; i++) {
          this.saleInfo.rows.push(rows[i]);
        }
        this.yearTable = res.data.ranking;
        this.saleLoading = false;
      }, err => {
        this.saleLoading = false;
      });
    },

    reGetSaleInfo() {
      let params = {
        keyword: "",
        saleRowsTimeType: this.saleStep || 2 //1年，2月
      };
      this.$get("/admin/summary/sale", params, res => {
        this.saleInfo.rows = [];
        let rows = res.data.rows;
        for (let i = 0; i < rows.length; i++) {
          this.saleInfo.rows.push(rows[i]);
        }
        this.$forceUpdate();
      })
    },
    updateSaleStep(val) {
      this.reGetSaleInfo();
    },

    navigateTo(target) {
      this.$router.push(target);
    },
  },
};
</script>

<style lang="less">
.chart-list {
  display: flex;
  margin-top: 40px;
}

.info-rows {
  display: flex;
  margin-bottom: 20px;
  font-size: 14px;
}

.info {
  flex: 1;
  position: relative;
  min-width: 200px;
  padding: 10px;
  margin-right: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 15px rgba(0, 0, 0, 0.1);
}

.info:last-child {
  margin-right: 0;
}

.info-value {
  font-size: 30px;
}

.info-title {
  font-size: 18px;
}

.pdl20 {
  padding: 0 20px;
}

.info-content-title {
  color: #999;
}

.info-bar-title {
  position: relative;
  display: flex;
  align-items: center;
  padding-bottom: 10px;
}

.info-bar-title:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: -15px;
  right: -15px;
  height: 1px;
  background-color: #eaeaea;
}

.info-bar-ctrls {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  width: 80rpx;
}

// 总览部分
.overview-item {
  display: flex;
  align-items: center;
}

.overview-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 15px;
  border-radius: 20px;
}

.overview-icon {
  width: 40px;
  height: 40px;
}

.overview-content {
  flex: 1;
  width: 150px;
}

.overview-sign-val {
  display: flex;
  align-items: baseline;
}

.overview-sign {
  margin-right: 5px;
}

.overview-others {
  min-width: 80px;
  margin-left: 15px;
  color: #999;
}

.overview-other:not(:last-child) {
  margin-bottom: 5px;
}

// 待办事件
.event-list {
  display: flex;
  align-items: center;
  text-align: center;
}

.event-item {
  flex: 1;
  position: relative;
  min-height: 60px;
  padding: 10px;
}

.event-item:not(:last-child):after {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  width: 1px;
  height: 60px;
  background-color: #eaeaea;
  transform: translateY(-50%);
}

// 访问量板块
.view-list {
  display: flex;
  align-items: center;
}

.view-item {
  flex: 1;
  position: relative;
  min-height: 60px;
  padding: 10px 10px 10px 30px;
}

.view-item:not(:last-child):after {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  width: 1px;
  height: 60px;
  background-color: #eaeaea;
  transform: translateY(-50%);
}

.view-title {
  font-size: 16px;
  color: #999;
}

// 销售额、图标
.chart-box {
  display: flex;
}

.chart-content {
  flex: 1;
  width: 400px;
  min-height: 300px;
  padding: 20px 30px;
}

.chart-leaderboard-box {
  width: 200px;
  margin-left: 20px;
  padding: 20px 10px;
}

.chart-leaderboards {
  margin-top: 20px;
}

.chart-leaderboard {
  display: flex;
  align-items: center;
}

.chart-leaderboard:not(:last-child) {
  margin-bottom: 15px;
}

.chart-leaderboard-ranking {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 10px;
  border-radius: 12px;
}

.chart-leaderboard-ranking.front {
  color: #fff;
  background-color: #618df5;
}

.chart-leaderboard-content {
  flex: 1;
  width: 80px;
}

// 小汇总项
.baseinfo-total-item {
  padding: 5px 10px;
}

.baseinfo-total-value {
  margin-top: 15px;
  height: 60px;
}

.baseinfo-total-extends {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.baseinfo-total-extend {
  flex: 1;
  display: flex;
  align-items: center;
  width: 80px;
}

.baseinfo-extend-value {
  margin-left: 10px;
}

.no-index-auth {
  padding: 30px;
  font-size: 28px;
  text-align: center;
}

.nav-enter {
  cursor: pointer;
}
</style>
