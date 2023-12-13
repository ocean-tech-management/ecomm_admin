<template>
  <div>
    <template v-for="(item, index) in list">
      <div v-if="item && item.length > 0" :key="index" class="withdrawals-flex">
        <div v-for="(e, i) in item" :key="i" class="withdrawals-flex-box">
          <div class="flex-box-title">{{ e.title }}</div>
          <div class="flex-box-val">{{ e.value }}</div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: 'WithdrawalsData',
  data() {
    return {
      list: []
    }
  },
  methods: {
    getList(uid) {
      console.log('getList', uid)
      const params = {
        uid
      }
      this.$get('/admin/user/withdrawDataPanel', params, res => {
        const data = res.data
        this.list =  [
          [
            {title: '今日新增业绩(元)', value: data.historyLinkRecharge},
            {title: '可提现额度(元)', value: data.canWithdrawPrice},
            {title: '冻结余额(元)', value: data.freezePrice},
          ],
          [
            {title: '累计提现', value: data.historyWithdraw},
            {title: '累计充值', value: data.historyRecharge},
          ]
        ];
      })
    }
  }
}
</script>
<style lang="less" scoped>
.withdrawals-flex {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  &:not(:first-child) {
    margin-top: 20px;
  }
  .withdrawals-flex-box {
    width: 160px;
    min-width: 140px;
    max-width: 160px;
    height: 80px;
    padding: 5px 10px;
    margin-right: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 0 5px 1px rgba(0,0,0,.1);
    & > * {
      margin-top: 10px;
      font-size: 18px;
      white-space: nowrap;
    }
    .flex-box-val {
      font-size: 16px;
    }
  }
}
</style>
