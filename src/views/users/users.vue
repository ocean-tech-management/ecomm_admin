<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="根据上级筛选">
            <el-input v-model="queryForm.topUserPhone" placeholder="请输入精准手机号码或置空"
              @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">会员列表<span v-if="userCount">（{{ userCount }}）</span></div>
        <div class="table-ctrl">
          <!-- <el-button type="primary" @click="openAddTeamLeader">添加指定团队长</el-button> -->
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <!-- <el-table-column label="序号"  width="150" prop="uid">
        </el-table-column> -->
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.avatarUrl" />
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="100" prop="name">
          <template slot-scope="scope">
            <div>{{ scope.row.name }}</div>
            <!--            <div style="font-size: 13px; color: #999">{{authTypeTexts[scope.row.auth_channel]}}</div>-->
          </template>
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
        <el-table-column label="商城余额" width="100" prop="shop_balance"></el-table-column>
        <el-table-column label="集品券余额" width="100" prop="crowd_balance"></el-table-column>
        <el-table-column label="H5余额" width="100" prop="h5_balance"></el-table-column>
        <el-table-column label="成长值" width="90" prop="growth_value"></el-table-column>
        <el-table-column label="身份" width="100" prop="vip_name"></el-table-column>
        <el-table-column label="集品券转赠" width="100" prop="ban_crowd_transfer" align="center">
          <template slot-scope="scope">
            <div :class="banCrowdTransferClasses[scope.row.ban_crowd_transfer]">
              {{ banCrowdTransferTexts[scope.row.ban_crowd_transfer] }}</div>
          </template>
        </el-table-column>
        <!--        <el-table-column label="同步信息" width="140">-->
        <!--          <template slot-scope="scope">-->
        <!--            {{scope.row.primary_name ? scope.row.primary_name : '——'}}-->
        <!--            <span v-if="scope.row.primary_phone">({{scope.row.primary_phone}})</span>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="上级">
          <template slot-scope="scope">
            {{ scope.row.link_user_name ? scope.row.link_user_name : '——' }}
            <span v-if="scope.row.link_user_level"> | {{ scope.row.link_user_vip_name }}</span>
            <span v-if="scope.row.link_user_phone">({{ scope.row.link_user_phone }})</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="地址" prop="address"></el-table-column> -->
        <!-- <el-table-column label="被冻结余额" width="100" prop="fronzen_balance"></el-table-column> -->
        <el-table-column label="用户ID" width="140" prop="share_id"></el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作" fixed="right" min-width="270">
          <template slot-scope="scope">
            <!-- <el-button type="text" size="small" @click="toggoleUser(scope.row)">停用</el-button> -->
            <el-button type="text" size="small" @click="goToUserDetailRecord(scope.row)">余额明细</el-button>
            <!--            <template v-if="$auths.includes('user/balance')">-->
            <!--              <el-button type="text" size="small" @click="goToUserBalanceList(scope.row)">余额明细</el-button>-->
            <!--            </template>-->
            <!--            <template v-if="$auths.includes('crowdFunding/balance')">-->
            <!--              <el-button type="text" size="small" @click="goToUserCrowdBalances(scope.row)">集品券明细</el-button>-->
            <!--            </template>-->
            <!--            <template v-if="$auths.includes('divide/stocksList')">-->
            <!--              <el-button type="text" size="small" @click="goToUserStockList(scope.row)">股票明细</el-button>-->
            <!--            </template>-->
            <template v-if="$auths.includes('rechargeRecord/rate')">
              <el-button type="text" size="small" @click="showRechargeAchievement(scope.row)">充值业绩</el-button>
            </template>
            <template v-if="$auths.includes('user/behavior')">
              <el-button type="text" size="small" @click="showSteps(scope.row)">查看足迹</el-button>
            </template>
            <template v-if="$auths.includes('user/assign')">
              <el-button v-if="!scope.row.vip_level" type="text" size="small"
                @click="showVipAssignPopup(scope.row)">指定身份/上级</el-button>
            </template>
            <template v-if="$auths.includes('user/banCrowdTransfer')">
              <el-button class="warning-color" type="text" size="small" @click="toggleBanCrowdTransfer(scope.row)">
                {{ scope.row.ban_crowd_transfer == 1 ? '开放' : '禁用' }}集品券转赠
              </el-button>
            </template>

            <template v-if="$auths.includes('user/updateUserPhone')">
              <el-button class="error-color" type="text" size="small"
                @click="showUpdatePhone(scope.row)">更改手机号码</el-button>
            </template>
            <template v-if="$auths.includes('user/removeThirdId')">
              <el-button type="text" size="small" @click="tryKuaishangUnbind(scope.row)">灵活用工解约</el-button>
            </template>
            <template v-if="$auths.includes('user/clearUserSync')">
              <el-button v-if="scope.row.primary_uid" type="text" size="small"
                @click="tryMainAccountUnbind(scope.row)">清除同步信息</el-button>
            </template>
            <template>
              <el-button type="text" size="small" @click="copyUid(scope.row)">复制三方id</el-button>
            </template>
            <template>
              <el-button type="text" size="small" @click="withdrawalsData(scope.row)">提现业绩数据</el-button>
            </template>
            <template v-if="$auths.includes('userAuthType/list')">
              <el-button type="text" size="small" @click="goToUserAuthData(scope.row)">授权详情</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>
    <el-dialog title="指定会员升级" width="800px" :close-on-click-modal="false" :visible.sync="vipAssignVisible">
      <Assign :formData="formData" :leaderData="leaderData"></Assign>
      <div slot="footer" class="dialog-footer">
        <el-button @click="vipAssignVisible = false">取 消</el-button>
        <el-button type="primary" @click="vipAssign">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="用户充值业绩" width="800px" :close-on-click-modal="false" :visible.sync="rechargeAchievementVisible">
      <RechargeAchievement ref="rechargeAchievement" :formData="formData"></RechargeAchievement>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rechargeAchievementVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="会员足迹" width="800px" :close-on-click-modal="false" :visible.sync="stepVisible">
      <Steps :formData="formData" :stepsData="stepsData"></Steps>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="stepVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="更换用户手机号码" width="500px" :close-on-click-modal="false" :visible.sync="updatePhoneVisible">
      <UpdatePhone :formData="updatePhoneData"></UpdatePhone>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updatePhoneVisible = false">取 消</el-button>
        <el-button type="primary" @click="tryUpdatePhone">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="提现业绩数据看板" width="640px" :close-on-click-modal="false" :visible.sync="withdrawalsDataVisible">
      <withdrawals-data ref="withdrawalsData" />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="withdrawalsDataVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Assign from '@/partialviews/user/Assign';
import UpdatePhone from '@/partialviews/user/UpdatePhone';
import RechargeAchievement from '@/partialviews/user/RechargeAchievement';
import Steps from '@/partialviews/user/Steps';
import WithdrawalsData from '@/partialviews/user/WithdrawalsData';
import moment from 'moment';

export default {
  name: 'users',
  components: {
    Assign,
    UpdatePhone,
    RechargeAchievement,
    Steps,
    WithdrawalsData
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        topUserPhone: ''
      },
      filter: {
        keyword: '',
        topUserPhone: ''
      },
      dataList: [],
      leaderData: [],
      userCount: 0,

      userInfo: {},

      formData: {},
      stepsData: [],
      userAuthData: [],

      updatePhoneData: {},

      banCrowdTransferTexts: {
        [1]: '禁用',
        [2]: '正常'
      },
      banCrowdTransferClasses: {
        [1]: 'error-color',
        [2]: ''
      },
      authTypeTexts: {
        [1]: '小程序授权',
        [2]: '公众号授权'
      },

      vipAssignVisible: false,
      rechargeAchievementVisible: false,
      stepVisible: false,
      updatePhoneVisible: false,

      withdrawalsDataVisible: false, // 业绩数据
    };
  },
  mounted() {
    this.getList();
    this.getUserCount();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: '',
        topUserPhone: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        topUserPhone: this.queryForm.topUserPhone
      };
      this.getList();
      this.getUserCount();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        topUserPhone: this.filter.topUserPhone
      };

      if(queryVal.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(queryVal.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      }

      this.$get('/admin/user/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    getUserCount() {
      if(!this.$auths.includes('user/summary')) return;
      let params = {
        topUserPhone: this.filter.topUserPhone
      }
      if(params.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(params.topUserPhone)) {
        return;
      }
      this.$get('/admin/user/summary', params, res => {
        this.userCount = res.data.allUserNumber || 0;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    showVipAssignPopup(row) {
      this.formData = {
        name: row.name,
        uid: row.uid,
        link_user: null,
        link_superior_user: row.link_superior_user, //如果该键值存在，用户有上级，默认显示上级名。选空不解除上级绑定
        link_user_name: row.link_user_name
      }
      if(this.leaderData[0]) {
        this.formData.level = this.leaderData[0].level;
        this.vipAssignVisible = true;
      } else {
        this.$get('/admin/vdc/list', null, res => {
          let leaderData = [];
          for(let i = res.data.length - 1; i >= 0; i--) {
            leaderData.push(res.data[i]);
          }
          this.leaderData = leaderData;
          this.formData.level = 0;
          this.vipAssignVisible = true;
        });
      }
    },
    vipAssign() {
      // 指定升级
      let params = {
        uid: this.formData.uid,
        level: this.formData.level
      }
      if(this.formData.link_user) params.link_user = this.formData.link_user;
        this.$confirm('注意，请慎重使用该功能，随意指定人员可能会对分润模块造成毁灭性的损坏，指定前请确保指定层级正确及上下级结构合理。该高风险功能正式上线时可能会被移除。您是否检查过相关信息并确认继续将该用户升级为所选中等级的会员', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

        this.$post('/admin/user/assign', params, res => {
          this.$message.success('指定升级成功');
          this.vipAssignVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },
    toggleBanCrowdTransfer(row) {
      this.$confirm(`注意，即将对 ${row.name} 进行 ${row.ban_crowd_transfer == 1 ? '开放' : '禁用'}集品券转赠 功能，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          uid: row.uid,
          ban_status: row.ban_crowd_transfer
        }
        this.$post('/admin/user/banCrowdTransfer', params, res => {
          this.$message.success('操作成功');
          this.reloadPage();
        });
      })
    },

    showUpdatePhone(row) {
      this.updatePhoneData = {
        uid: row.uid,
        name: row.name,
        original_phone: row.phone,
        phone: ''
      }
      this.updatePhoneVisible = true;
    },
    tryUpdatePhone() {
      let params = {
        uid: this.updatePhoneData.uid,
        phone: this.updatePhoneData.phone
      }
      if(params.phone !== '' && !/^1[3456789]\d{9}$/.test(params.phone)) {
        return this.$message.error("手机号码有误，请提供正确的手机号码");
      } else if(params.phone == this.updatePhoneData.original_phone) {
        return this.$message.error("新手机号码不能和旧号码相同");
      }
      this.$confirm('手机号码是用户唯一标识, 请勿频繁修改。修改后用户历史订单信息, 登录密码等不会同步修改，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/user/updateUserPhone', params, res => {
          this.$message.success('手机号码更改成功');
          this.updatePhoneVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },

    tryKuaishangUnbind(row) {
      let params = {
        uid: row.uid
      }
      this.$confirm('正在进行快商解约操作，操作成功后用户需要重新去快商处签约才能使用提现功能，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/user/removeThirdId', params, res => {
          this.$message.success('快商解约成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
    tryMainAccountUnbind(row) {
      let params = {
        uid: row.uid
      }
      this.$confirm('正在进行清除同步信息操作，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/user/clearUserSync', params, res => {
          this.$message.success('清除同步信息成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    showRechargeAchievement(row) {
      this.formData = {
        uid: row.uid,
        name: row.name,
        phone: row.phone
      }
      if(this.$refs.rechargeAchievement) this.$refs.rechargeAchievement.reGetData(this.formData);
      this.rechargeAchievementVisible = true;
    },

    showSteps(row) {
      let params = {
        uid: row.uid,
        start_time: moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
      this.$get('/admin/user/behavior', params, res => {
        let stepsData = res.data.list;
        for(let i = 0; i < stepsData.length; i++) {
          console.log(i, stepsData[i]);
          if(stepsData[i].type == 1) {
            stepsData[i].content = '进入了小程序';
          } else if(stepsData[i].type == 2) {
            stepsData[i].content = `查看了商品 `;
            stepsData[i].goods_title = stepsData[i].goods_info ? stepsData[i].goods_info.title : '未知商品';
          } else if(stepsData[i].type == 3) {
            stepsData[i].content = `加购商品 `;
            stepsData[i].goods_title =  stepsData[i].goods_info ? stepsData[i].goods_info.title : '未知商品';
          }
          if(stepsData[i].entranceUser && stepsData[i].entranceUser.name) {
            stepsData[i].linker_name = stepsData[i].entranceUser.name;
            stepsData[i].linker_phone = stepsData[i].entranceUser.phone;
          }
        }
        this.stepsData = stepsData;
        this.formData = {
          name: row.name
        };
        this.stepVisible = true;
      });
    },
    goToUserBalanceList(row) {
      this.$router.push({
        path: '/userBalanceList',
        query: {
          id: row.uid,
          name: row.name,
          phone: row.phone
        }
      })
    },
    // 跳到子页面(余额明细、股票明细、集品券明细、集品豆明细、礼品券明细等所有明细页面归属)
    goToUserDetailRecord(row) {
      let routerConfig = this.$store.state.routerConfig[0].children;  //索引0需要由路由表里页面的顺序来决定
      let routePath = this.$route.path;
      const routeTabs = 'usersDetailRecord'; // 明细的tabs，跟routerjs保持一致
      const metaTabsList = routerConfig.reduce((previous, cf) =>
          cf.path == routePath || cf.alias == routePath || (cf.meta.childPath && cf.meta.childPath.includes(routePath)) ?
            [
              ...previous,
              ...(cf.children || []).filter(e => {
                const isInclude = routeTabs === (e.meta && e.meta ? e.meta.tabs : false)
                const isAuth = e.meta && e.meta.require ? this.$auths.includes(e.meta.require) : true;
                return isInclude && isAuth
              })
            ] :
            previous
        , [])
      if (metaTabsList.length > 0) {
        // 存在子页面，获取第一个默认显示
        this.$router.push({
          path: metaTabsList[0].path,
          query: {
            id: row.uid,
            name: row.name,
            phone: row.phone
          }
        })
      } else {
        // 无子页面，无相关权限，跳403
        this.$router.push({
          path: '/403'
        })
      }
    },
    goToUserCrowdBalances(row) {
      this.$router.push({
        path: '/userCrowdBalances',
        query: {
          id: row.uid,
          name: row.name,
          phone: row.phone
        }
      })
    },
    goToUserStockList(row) {
      this.$router.push({
        path: '/userStockList',
        query: {
          id: row.uid,
          name: row.name,
          phone: row.phone
        }
      })
    },
    copyUid(row) {
      this.$copyText(row.uid).then(e => {
        this.$message.success('复制三方id成功');
      }, function (e) {
        this.$message.warning('复制失败，请刷新页面重试');
      })
    },
    // 提现业绩数据
    withdrawalsData(row) {
      this.withdrawalsDataVisible = true;
      this.$nextTick(() => {
        this.$refs.withdrawalsData && this.$refs.withdrawalsData.getList(row.uid);
      })
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
    // 授权详情
    goToUserAuthData(row) {
      this.$router.push({
        path: '/userAuthType',
        query: {
          id: row.uid,
        }
      })
    },
  }
};
</script>
