<template>
  <div>
    <div class="propaganda-user-overviews-title">总奖励人群</div>
    <div class="propaganda-user-overviews">
      <div v-for="(item, index) in users.allRewardUserCount" class="propaganda-user-overview trigger" :key="'uc' + index" @click="showUsers(item)">
        <div class="propaganda-user-overview-title">{{item.level_name}}</div>
        <div class="propaganda-user-overview-val">{{item.data}}</div>
      </div>
    </div>
    <div class="propaganda-user-overviews-title">每个人群对应的奖励总金额</div>
    <div class="propaganda-user-overviews">
      <div v-for="(item, index) in users.rewardScalePrice" class="propaganda-user-overview" :key="'sp' + index">
        <div class="propaganda-user-overview-title">{{item.level_name}}</div>
        <div class="propaganda-user-overview-val">{{item.data}}</div>
      </div>
    </div>
    <div class="propaganda-user-overviews-title">每个人群对应的每人奖励金额</div>
    <div class="propaganda-user-overviews">
      <div v-for="(item, index) in users.onceRewardPrice" class="propaganda-user-overview" :key="'rp' + index">
        <div class="propaganda-user-overview-title">{{item.level_name}}</div>
        <div class="propaganda-user-overview-val">{{item.data}}</div>
      </div>
    </div>

    <el-dialog title="分红股东预览" width="700px" append-to-body :close-on-click-modal="false" :visible.sync="userPreviewVisible">
      <GrantUserPreview :dataList="userList"></GrantUserPreview>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userPreviewVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import GrantUserPreview from './GrantUserPreview';
export default {
  components: {
    GrantUserPreview
  },
  data() {
    return {
      userList: [],
      userPreviewVisible: false
    }
  },
  props: {
    users: Object,
    grantData: Object
  },
  methods: {
    showUsers(item) {
      console.log(item);
      let userList = item.list || [];
      this.userList = userList;
      this.userPreviewVisible = true;
    }
  }
}
</script>
<style lang="less" scope>
.propaganda-user-overviews-title {
  margin-bottom: 10px;
  font-size: 20px;
}
.propaganda-user-overviews {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}
.propaganda-user-overview {
  width: 120px;
  min-width: 120px;
  height: 80px;
  padding: 5px 10px;
  margin-right: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 5px 1px rgba(0,0,0,.1);
  &.trigger {
    cursor: pointer;
  }
}
.propaganda-user-overview-title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}
.propaganda-user-overview-val {
  margin-top: 10px;
  font-size: 16px;
  color: #999;
  white-space: nowrap;
}



</style>
