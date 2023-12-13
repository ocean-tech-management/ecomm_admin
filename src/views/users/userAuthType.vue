<template>
  <div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">
            授权详情列表
            <span v-if="userInfo" class="success-color">{{ userInfo.name || '' }} <template
                v-if="userInfo.phone && userInfo.phone !== ''">({{ userInfo.phone }})</template></span>
            <SloganTip type="danger"></SloganTip>
          </div>
        </div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="序号" width="90" type="index"></el-table-column>
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.headimgurl" />
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="180" prop="name">
            <template slot-scope="scope">
              <div>{{ scope.row.nickname }}</div>
              <!--              <div style="font-size: 13px; color: #999">{{scope.row.access_name}}</div>-->
            </template>
          </el-table-column>
          <el-table-column label="授权时间" width="150" prop="create_time"></el-table-column>
          <el-table-column label="应用ACCESSKEY" width="160" prop="access_key"></el-table-column>
          <el-table-column label="应用APPID" width="220" prop="app_id"></el-table-column>
          <el-table-column label="应用名称" width="160" prop="access_name"></el-table-column>
          <el-table-column label="操作" min-width="100">
            <template slot-scope="scope">
              <template v-if="$auths.includes('userAuthClear/create')">
                <el-button type="text" size="small" @click="showUserAuthData(scope.row)">清除授权</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div v-show="dataList && dataList.length > 0" class="pagination">
          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
            layout="total, prev, pager, next" :page-count="count"></el-pagination>
        </div>
      </div>
    </div>
    <el-dialog title="清除授权" width="680px" :close-on-click-modal="false" :visible.sync="userAuthDataVisible">
      <div slot="title" class="el-dialog__title">
        清除授权
        <SloganTip type="danger"></SloganTip>
      </div>
      <div v-if="formData['is_mp-weixin']" class="clean-tips">
        <strong>请注意：</strong>当前正在清除微信端用户授权信息，将一并清除该微信用户同一微信开放平台下面的所有授权信息（包含微信公众号、小程序及接入微信开放平台的网页和app等）
      </div>
      <user-auth-data :formData="formData" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="userAuthDataVisible = false">取 消</el-button>
        <el-button type="primary" @click="clearUserAuthData">清除授权</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import userAuthData from '@/partialviews/user/userAuthData';
import SloganTip from '@/components/SloganTip';
export default {
  name: "userStockList",
  data() {
    return {
      uid: null,
      userInfo: null,

      currentPage: 1,
      count: 1,
      queryForm: {},
      filter: {},

      dataList: [],
      detailVisible: false,
      formData: {},

      userAuthDataVisible: false
    };
  },
  components: { userAuthData, SloganTip },
  mounted() {
    this.uid = this.$route.query.id;
    if(!this.uid) {
      this.$message.error('用户无效，正在返回');
      setTimeout(() => {
        this.$router.go(-1);
      }, 2000);
      return;
    }
    this.getInfo();
    this.getList();
  },
  methods: {
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {};
      this.getList();
    },
    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        uid: this.uid,
      };

      this.$get("/admin/userAuthType/list", queryVal, (res) => {
        let dataList = res.data.list && res.data.list.length > 0 ? res.data.list.map(e => {
          let mapVo = e
          if (e.info) mapVo = {
            ...mapVo,
            ...e.info
          }
          return {
            ...mapVo,
          }
        }) : [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    getInfo() {
      if (!this.$auths.includes('user/info')) return;
      let params = {
        uid: this.uid
      }
      this.$sget("/admin/user/info", params, (res) => {
        let userInfo = res.data || {};

        this.userInfo = userInfo;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    showUserAuthData(row) {
      const MP_WEIXIN_LIST = ['p10011', 'm10011'];
      this.formData = {
        id: row.id,
        image_url: '',
        desc: '',
        nickname: row.nickname,
        access_name: row.access_name,
        'is_mp-weixin': row.access_key ? MP_WEIXIN_LIST.includes(row.access_key) : false
      };
      this.userAuthDataVisible = true
    },
    // 清除授权详情
    clearUserAuthData() {
      let params = JSON.parse(JSON.stringify(this.formData));
      delete params.nickname;
      delete params.access_name;
      delete params['is_mp-weixin'];
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传证明图片哦');
        }
      }
      params.adminId = JSON.parse(localStorage.getItem('userInfo')).id || '';
      this.$confirm(`清除授权后将无法恢复，且该账号无法发起用户退款，确认删除？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/userAuthClear/create', params, res => {
          this.$message.success('清除同步信息成功');
          this.userAuthDataVisible = false
          this.getList();
        });
      }).catch(() => {});
    }
  },
};
</script>


<style lang="less" scoped>
.order-profit-overviews {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
}

.order-profit-overview {
  width: 160px;
  min-width: 140px;
  max-width: 160px;
  height: 80px;
  padding: 5px 10px;
  margin-right: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 5px 1px rgba(0, 0, 0, .1);
}

.order-profit-overview-title {
  margin-top: 10px;
  font-size: 18px;
  white-space: nowrap;
}

.order-profit-overview-val {
  margin-top: 10px;
  font-size: 16px;
  white-space: nowrap;
}

.clean-tips {
  padding-bottom: 20px;
  color: #F56C6C;
}
</style>
