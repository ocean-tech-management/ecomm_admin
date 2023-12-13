<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form ref="queryForm" :inline="true" :model="queryForm" @submit.native.prevent>
            <el-form-item label="用户关键字" prop="user_keyword">
              <el-input v-model="queryForm.user_keyword" placeholder="请输入用户关键字"
                @keyup.enter.native="requestQuery"></el-input>
            </el-form-item>
            <el-form-item label="微信授权关键字" prop="auth_keyword">
              <el-input v-model="queryForm.auth_keyword" placeholder="请输入微信关键字"
                @keyup.enter.native="requestQuery"></el-input>
            </el-form-item>
            <el-form-item label="应用名称" prop="access_name">
              <el-input v-model="queryForm.access_name" placeholder="请输入应用名称"
                @keyup.enter.native="requestQuery"></el-input>
            </el-form-item>
            <el-form-item label="授权时间" prop="createDate">
              <el-date-picker v-model="queryForm.createDate" type="datetimerange" :picker-options="pickerOptions"
                range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" align="right"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="requestQuery">查询</el-button>
              <el-button @click="requestQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">
            授权列表
            <SloganTip type="danger"></SloganTip>
          </div>
        </div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="序号" width="90" type="index"></el-table-column>
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.avatarUrl" />
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="180" prop="name">
            <template slot-scope="scope">
              <div>{{ scope.row.name }}</div>
              <!--              <div style="font-size: 13px; color: #999">{{scope.row.access_name}}</div>-->
            </template>
          </el-table-column>
          <el-table-column label="联系电话" width="150" prop="phone"></el-table-column>
          <el-table-column label="授权姓名" width="180" prop="nickname"></el-table-column>
          <el-table-column label="授权头像" width="150" prop="headimgurl">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.headimgurl" />
            </template>
          </el-table-column>
          <el-table-column label="应用ACCESSKEY" width="150" prop="access_key"></el-table-column>
          <el-table-column label="应用APPID" width="220" prop="app_id"></el-table-column>
          <el-table-column label="应用名称" width="130" prop="access_name"></el-table-column>
          <el-table-column label="授权时间" width="150" prop="auth_time"></el-table-column>
          <el-table-column label="注册时间" width="150" prop="user_time"></el-table-column>
          <el-table-column label="操作" fixed="right" min-width="200">
            <template slot-scope="scope">
              <template v-if="$auths.includes('userAuthType/list')">
                <el-button type="text" size="small" @click="goToUserAuthData(scope.row)">授权详情</el-button>
              </template>
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
        新增禁售人员
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
import {nTimePickerConfig} from '@/config';
import moment from "moment/moment";
export default {
  name: "userStockList",
  data() {
    return {
      uid: null,
      userInfo: null,

      currentPage: 1,
      count: 1,
      queryForm: {
        createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD 23:59:59')],
      },
      ...nTimePickerConfig,

      dataList: [],
      detailVisible: false,
      formData: {},

      userAuthDataVisible: false
    };
  },
  components: { userAuthData, SloganTip },
  mounted() {
    this.getList();
  },
  methods: {
    // 请求
    requestQuery(refForm) {
      if (refForm && typeof refForm === 'string') {
        this.$refs[refForm] && this.$refs[refForm].resetFields();
        this.queryForm = {
          createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD 23:59:59')]
        }
        this.currentPage = 1;
      }
      this.getList();
    },
    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        user_keyword: this.queryForm['user_keyword'],
        auth_keyword: this.queryForm['auth_keyword'],
        access_name: this.queryForm['access_name'],
      };
      if (this.queryForm.createDate && this.queryForm.createDate.length == 2) {
        queryVal.start_time = this.queryForm.createDate[0];
        queryVal.end_time = this.queryForm.createDate[1];
      }
      this.$get("/admin/userAuthType/allList", queryVal, (res) => {
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
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    // 授权详情
    goToUserAuthData(row) {
      this.$router.push({
        path: '/userAuthType',
        query: {
          id: row.uid,
        }
      })
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
