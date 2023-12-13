<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入手机号或昵称" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="根据上级筛选">
              <el-select placeholder="不限" name="topUserType" v-model="queryForm.topUserType">
                <el-option label="查找该上级的直属下级" :value="1"></el-option>
                <el-option label="查找该上级的团队所有下级" :value="2"></el-option>
                <el-option label="查找该上级的分润下级" :value="3"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model="queryForm.topUserPhone" placeholder="请输入精准手机号码或置空" maxlength="11"
                @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>

            <el-form-item label="加入时间" prop="createDate">
              <el-date-picker name="createDate" v-model="queryForm.createDate" type="datetimerange"
                :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :clearable="true"
                :editable="false"></el-date-picker>
            </el-form-item>
            <el-form-item label="升级时间" prop="upgradeDate">
              <el-date-picker name="upgradeDate" v-model="queryForm.upgradeDate" type="datetimerange"
                :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :clearable="true"
                :editable="false"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryInfo">查询</el-button>
              <el-button @click="resetQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="subpage-content">

      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">代理人管理</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('member/importConfusion')">
              <el-upload id="excel-uploader" class="excel-uploader" style="margin-right: 10px"
                accept=".xls,.xlsx,application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                action="/admin/member/importConfusion" ref="importConfusions" :data="thumbData" :headers="token"
                :show-file-list="false" :before-upload="excelWatcher" :on-success="excelSuccess" :on-error="uploadError"
                auto-upload>
                <el-button type="plain" title="请确保团队结构完整">导入团队结构</el-button>
              </el-upload>
            </template>
            <template v-if="$auths.includes('member/list')">
              <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
            </template>

            <!-- <el-button type="primary" @click="openAddTeamLeader">添加指定团队长</el-button> -->
          </div>
        </div>

        <div class="quickly-filters">
          <div class="quickly-select">
            <div v-for="item in leaderData" class="quickly-option" :class="{ 'selected': selectLevel == item.level }"
              :key="item.level" @click="changeLevel(item.level)">{{ item.name }}({{ item.number || 0 }})</div>
          </div>
        </div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.avatarUrl" />
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="100" prop="name">
            <template slot-scope="scope">
              <div>{{ scope.row.user_name }}</div>
              <!--              <div style="font-size: 13px; color: #999">{{authTypeTexts[scope.row.auth_channel]}}</div>-->
            </template>
          </el-table-column>
          <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>
          <el-table-column label="商城余额" width="100" prop="shop_balance"></el-table-column>
          <el-table-column label="集品券余额" width="100" prop="crowd_balance"></el-table-column>
          <el-table-column label="H5余额" width="100" prop="h5_balance"></el-table-column>
          <el-table-column label="成长值" width="90" prop="growth_value"></el-table-column>
          <el-table-column label="历史降级门槛" width="120" prop="demotion_growth_value"></el-table-column>
          <el-table-column label="身份" width="100">
            <template slot-scope="scope">
              {{ leaderTexts[scope.row.level] || '——' }}
            </template>
          </el-table-column>
          <el-table-column label="集品券转赠" width="100" prop="ban_crowd_transfer" align="center">
            <template slot-scope="scope">
              <div :class="banCrowdTransferClasses[scope.row.ban_crowd_transfer]">
                {{ banCrowdTransferTexts[scope.row.ban_crowd_transfer] }}</div>
            </template>
          </el-table-column>
          <el-table-column label="直属上级" width="180">
            <template slot-scope="scope">
              {{ scope.row.link_user_name ? scope.row.link_user_name : '——' }}
              <span v-if="scope.row.link_user_level"> | {{ leaderTexts[scope.row.link_user_level] }}</span>
              <span v-if="scope.row.link_user_phone">({{ scope.row.link_user_phone }})</span>
            </template>
          </el-table-column>
          <el-table-column label="顶级团队" width="180">
            <template slot-scope="scope">
              {{ scope.row.topTeamUserInfo ? scope.row.topTeamUserInfo.name : '——' }}
              <span v-if="scope.row.topTeamUserInfo && scope.row.topTeamUserInfo.level"> |
                {{ leaderTexts[scope.row.topTeamUserInfo.level] }}</span>
              <span
                v-if="scope.row.topTeamUserInfo && scope.row.topTeamUserInfo.phone">({{ scope.row.topTeamUserInfo.phone }})</span>
            </template>
          </el-table-column>
          <el-table-column label="分润上级" width="180">
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.divide_chain_info" :key="index">
                {{ item.name ? item.name : '——' }}
                <span v-if="item.level"> | {{ leaderTexts[item.level] }}</span>
                <span v-if="item.phone">({{ item.phone }})</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="升级时间" prop="upgrade_time" width="150"></el-table-column>
          <el-table-column label="用户ID" width="140" prop="share_id"></el-table-column>
          <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
          <el-table-column label="操作" fixed="right" min-width="270">
            <template slot-scope="scope">
              <!-- <el-button type="text" size="small" @click="toggoleUser(scope.row)">停用</el-button> -->
              <template v-if="$auths.includes('member/info')">
                <el-button type="text" size="small" @click="showAgentDetail(scope.row)">详情</el-button>
              </template>
              <el-button type="text" size="small" @click="goToUserDetailRecord(scope.row)">余额明细</el-button>
              <!--              <template v-if="$auths.includes('user/balance')">-->
              <!--                <el-button type="text" size="small" @click="goToUserBalanceList(scope.row)">余额明细</el-button>-->
              <!--              </template>-->
              <!--              <template v-if="$auths.includes('crowdFunding/balance')">-->
              <!--                <el-button type="text" size="small" @click="goToUserCrowdBalances(scope.row)">集品券明细</el-button>-->
              <!--              </template>-->
              <!--              <template v-if="$auths.includes('divide/stocksList')">-->
              <!--                <el-button type="text" size="small" @click="goToUserStockList(scope.row)">股票明细</el-button>-->
              <!--              </template>-->
              <template v-if="$auths.includes('rechargeRecord/rate')">
                <el-button type="text" size="small" @click="showRechargeAchievement(scope.row)">充值业绩</el-button>
              </template>
              <template v-if="$auths.includes('user/behavior')">
                <el-button type="text" size="small" @click="showSteps(scope.row)">查看足迹</el-button>
              </template>
              <template v-if="$auths.includes('member/assign')">
                <el-button type="text" size="small" @click="showVipAssignPopup(scope.row)">更改身份/上级</el-button>
              </template>
              <template v-if="$auths.includes('member/revoke')">
                <el-button type="text" size="small" @click="showCancelVipPopup(scope.row)">取消身份</el-button>
              </template>
              <template v-if="$auths.includes('teamMember/assign')">
                <el-button type="text" size="small" @click="showTeamDivideAssign(scope.row)">指定团队代理身份</el-button>
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
    </div>

    <el-dialog title="指定身份/上级" width="800px" :close-on-click-modal="false" :visible.sync="vipAssignVisible">
      <Assign :formData="formData" :leaderData="popupLeaderData"></Assign>
      <div slot="footer" class="dialog-footer">
        <el-button @click="vipAssignVisible = false">取 消</el-button>
        <el-button type="primary" @click="vipAssign">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="代理人详情" width="800px" :visible.sync="detailVisible">
      <Detail :formData="formData" :leaderTexts="leaderTexts"></Detail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="取消会员身份" width="900px" :close-on-click-modal="false" :visible.sync="cancelVipVisible">
      <CancelVip :formData="formData" :leaderData="leaderData"></CancelVip>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelVipVisible = false">取 消</el-button>
        <el-button type="primary" @click="cancelVip">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="指定团队代理身份" width="800px" :close-on-click-modal="false" :visible.sync="teamDivideAssignVisible">
      <AssignTeamDivide :formData="formData"></AssignTeamDivide>
      <div slot="footer" class="dialog-footer">
        <el-button @click="teamDivideAssignVisible = false">取 消</el-button>
        <el-button type="primary" @click="teamDivideAssign">确 定</el-button>
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


    <el-dialog title="导入会员结果" width="800px" :close-on-click-modal="false" :visible.sync="importResultVisible">
      <div>
        <div class="import-result">
          本次导入会员数据共计 <span class="tips-color">{{ importResult.allNumber || 0 }}</span> 条，
          其中成功导入 <span class="success-color">{{ importResult.successNum || 0 }}</span> 条，
          失败 <span class="error-color">{{ importResult.errorNum || 0 }}</span> 条
        </div>
        <div v-if="importResult.errorNum && importResult.errorNum > 0" class="import-result">
          <span>点击右侧按钮下载导入失败的名单</span>
          <el-button type="text" size="small" @click="exportImportFail">下载名单</el-button>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeExportImportFail">确 定</el-button>
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
import moment from "moment";
import XLSX from "xlsx";

import Assign from '@/partialviews/user/Assign';
import UpdatePhone from '@/partialviews/user/UpdatePhone';
import AssignTeamDivide from '@/partialviews/user/teamDivideUser/Assign';
import Detail from '@/partialviews/user/AgentDetail';
import RechargeAchievement from '@/partialviews/user/RechargeAchievement';
import Steps from '@/partialviews/user/Steps';
import CancelVip from '@/partialviews/user/agent/CancelVip';
import WithdrawalsData from '@/partialviews/user/WithdrawalsData';

import {nTimePickerConfig} from '@/config';

export default {
  name: 'agents',
  components: {
    Assign,
    AssignTeamDivide,
    Detail,
    RechargeAchievement,
    Steps,
    UpdatePhone,
    CancelVip,
    WithdrawalsData
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        topUserPhone: '',
        topUserType: 1,
        createDate: [],
        upgradeDate: []
      },
      filter: {
        keyword: '',
        topUserPhone: '',
        topUserType: 1,
        createDate: [],
        upgradeDate: []
      },
      dataList: [],
      leaderData: [],
      popupLeaderData: [],
      leaderTexts: {},

      selectLevel: 'all',

      formData: {},
      stepsData: {},
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
      detailVisible: false,
      cancelVipVisible: false,
      rechargeAchievementVisible: false,
      stepVisible: false,
      teamDivideAssignVisible: false,
      updatePhoneVisible: false,

      ...nTimePickerConfig,

      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,
      importResult: {},
      importResultVisible: false,

      withdrawalsDataVisible: false, // 业绩数据
    };
  },
  mounted() {
    this.getVdc();
    this.getMemberTotal();
    this.getList();
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
        topUserPhone: '',
        topUserType: 1,
        createDate: [],
        upgradeDate: []
      };
      this.currentPage = 1;
      this.getList();
      this.getMemberTotal();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        topUserPhone: this.queryForm.topUserPhone,
        topUserType: this.queryForm.topUserType,
        createDate: this.queryForm.createDate,
        upgradeDate: this.queryForm.upgradeDate
      };
      this.getList();
      this.getMemberTotal();
    },

    //获取列表
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
      } else {
        queryVal.topUserType = this.filter.topUserType;
      }

      if(this.selectLevel && this.selectLevel != 'all') queryVal.level = this.selectLevel;

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }

      if(this.filter.upgradeDate && this.filter.upgradeDate.length == 2) {
        queryVal.upgrade_start_time = this.filter.upgradeDate[0];
        queryVal.upgrade_end_time = this.filter.upgradeDate[1];
      }

      this.$get('/admin/member/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    getVdc() {
      this.$get('/admin/vdc/list', null, res => {
        let leaderData = res.data;

        let popupLeaderData = [];
        for(let i = res.data.length - 1; i >= 0; i--) {
          popupLeaderData.push(res.data[i]);
        }
        this.popupLeaderData = popupLeaderData;

        let leaderTexts = {};
        for(let i = 0; i < leaderData.length; i++) {
          leaderTexts[leaderData[i].level] = leaderData[i].name;
        }
        this.leaderTexts = leaderTexts;
      });
    },
    getMemberTotal() {
      let params = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        topUserPhone: this.filter.topUserPhone
      };
      if(params.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(params.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      } else {
        params.topUserType = this.filter.topUserType;
      }

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        params.start_time = this.filter.createDate[0];
        params.end_time = this.filter.createDate[1];
      }

      if(this.filter.upgradeDate && this.filter.upgradeDate.length == 2) {
        params.upgrade_start_time = this.filter.upgradeDate[0];
        params.upgrade_end_time = this.filter.upgradeDate[1];
      }

      this.$get('/admin/member/level', params, res => {
        this.leaderData = res.data;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    showVipAssignPopup(row) {
      this.formData = {
        name: row.user_name,
        uid: row.uid,
        link_user: null,
        link_superior_user: row.link_superior_user, //如果该键值存在，用户有上级，默认显示上级名。选空不解除上级绑定
        link_user_name: row.link_user_name
      }
      this.formData.level = row.level;
      this.vipAssignVisible = true;
    },
    vipAssign() {
      // 指定升级
      let params = {
        uid: this.formData.uid,
        level: this.formData.level
      }
      if(this.formData.link_user) {
        params.link_user = this.formData.link_user;
      }
      this.$confirm('注意，请慎重使用该功能，随意指定人员可能会对分润模块造成毁灭性的损坏，指定前请确保指定层级正确及上下级结构合理。该高风险功能正式上线时可能会被移除。您是否检查过相关信息并确认继续将该用户升级为所选中等级的会员', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/member/assign', params, res => {
          this.$message.success('指定升级成功');
          this.vipAssignVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },


    showTeamDivideAssign(row) {
      this.formData = {
        uid: row.uid,
        name: row.user_name,
        level: row.team_vip_level
      }
      this.teamDivideAssignVisible = true;
    },
    teamDivideAssign() {
      // 指定调整团队代理身份
      let params = {
        uid: this.formData.uid,
        level: this.formData.level
      }

      this.$confirm('注意，调整团队代理身份可能会对分润结构造成一定影响，是否确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/teamMember/assign', params, res => {
          this.$message.success('调整团队代理身份成功');
          this.teamDivideAssignVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },

    changeLevel(level) {
      this.selectLevel = level;
      this.currentPage = 1;
      this.reloadPage();
    },

    showAgentDetail(row) {
      let params = {
        uid: row.uid
      }
      this.$get('/admin/member/info', params, res => {
        let dataList = res.data;
        if(dataList.aims) {
          for(let i = 0; i < dataList.aims.length; i++) {
            dataList.aims[i].distance = parseFloat(dataList.aims[i].aimsNumber) - parseFloat(dataList.aims[i].nowNumber);
            dataList.aims[i].progress = parseFloat(dataList.aims[i].nowNumber) / parseFloat(dataList.aims[i].aimsNumber) * 100;
            if(dataList.aims[i].progress > 100) dataList.aims[i].progress = 100;
          }
        }
        if(dataList.teamAims) {
          for(let i = 0; i < dataList.teamAims.length; i++) {
            dataList.teamAims[i].distance = parseFloat(dataList.teamAims[i].aimsNumber) - parseFloat(dataList.teamAims[i].nowNumber);
            dataList.teamAims[i].progress = parseFloat(dataList.teamAims[i].nowNumber) / parseFloat(dataList.teamAims[i].aimsNumber) * 100;
            if(dataList.teamAims[i].progress > 100) dataList.teamAims[i].progress = 100;
          }
        }
        this.formData = JSON.parse(JSON.stringify(dataList));
        this.detailVisible = true;
      });
    },

    toggleBanCrowdTransfer(row) {
      this.$confirm(`注意，即将对 ${row.user_name} 进行 ${row.ban_crowd_transfer == 1 ? '开放' : '禁用'}集品券转赠 功能，是否继续？`, '提示', {
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

    showRechargeAchievement(row) {
      this.formData = {
        uid: row.uid,
        name: row.user_name,
        phone: row.user_phone
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
            stepsData[i].content = '进入了首页';
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
          name: row.user_name
        };
        this.stepVisible = true;
      });
    },

    showCancelVipPopup(row) {
      this.formData = {
        name: row.user_name,
        uid: row.uid,
        link_user: null,
        link_superior_user: row.link_superior_user, //如果该键值存在，用户有上级，不让更改上级
        link_user_name: row.link_user_name
      }
      this.cancelVipVisible = true;
    },
    cancelVip() {
      // 指定升级
      let params = {
        uid: this.formData.uid,
        parent_uid: this.formData.link_user
      }
      if(!this.formData.link_superior_user && !params.parent_uid) {
        return this.$message.error('用户无上级，需要指定一个接管人来接管其下团队成员哦')
      }
      this.$confirm('注意，请慎重使用该功能，取消用户会员身份会对分润系统造成影响。该高风险功能正式上线时可能会被移除。您是否确认取消用户的代理人身份', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/member/revoke', params, res => {
          this.$message.success('取消身份成功');
          this.cancelVipVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },


    showUpdatePhone(row) {
      this.updatePhoneData = {
        uid: row.uid,
        name: row.user_name,
        original_phone: row.user_phone,
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


    // 上传excel文件，新增会员
    excelWatcher(file) {
      if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type != 'application/vnd.ms-excel') {
        this.$refs.importConfusions.clearFiles();
        this.$message.error('只能上传标准的.xlsx或者.xls文件哦');
        return false;
      }

      this.$loading('正在导入会员数据，请不要进行其他任何操作');
      return;
    },
    excelSuccess(res, file) {
      this.$loading().close();
      // 因为是复用了http请求，所以要有状态值判断
      if(res && res.error_code == 0) {
        this.importResult = res.data;
        this.importResult.successNum = this.importResult.accessUser.length || 0;
        this.importResult.errorNum = (this.importResult.existUser.length || 0) + (this.importResult.notFoundTopUser.length || 0);
        this.importResult.allNumber = this.importResult.successNum + this.importResult.errorNum;
        this.$refs.importConfusions.clearFiles();
        this.importResultVisible = true;
        // this.$message.success('上传文件成功');
      } else {
        this.$message.error(res.msg || '上传文件失败，请检查');
        this.$refs.importConfusions.clearFiles();
      }
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$loading().close();
      this.$message.error('您未能正确上传excel文件，请选择符合 模板要求 的标准excel文件上传或检查您的网络哦。 请留意会员等级文案是否正确无误');
    },

    goToUserBalanceList(row) {
      this.$router.push({
        path: '/userBalanceList',
        query: {
          id: row.uid,
          name: row.user_name,
          phone: row.user_phone
        }
      })
    },
    // 余额明细跳转到子页面
    goToUserDetailRecord(row) {
      // 默认跳集品券明细
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
          name: row.user_name,
          phone: row.user_phone
        }
      })
    },
    goToUserStockList(row) {
      this.$router.push({
        path: '/userStockList',
        query: {
          id: row.uid,
          name: row.user_name,
          phone: row.user_phone
        }
      })
    },

    exportImportFail() {
      let excelData = [];
      excelData.push([
        "用户昵称(必填)",
        "用户手机号码(必填)",
        "用户等级(必填)",
        "上级用户昵称",
        "上级用户手机号码",
        "上级身份",
        "错误类别",
        "错误备注"
      ]);
      for (let i = 0; i < this.importResult.existUser.length; i++) {
        let item = this.importResult.existUser[i].rawData;
        excelData.push([
          item.userName || '',
          item.userPhone || '',
          item.shenfen || '',
          item.topUserName || '',
          item.topUserPhone || '',
          item.topShenfen || '',
          '用户已存在',
          ''
        ]);
      }

      for (let i = 0; i < this.importResult.notFoundTopUser.length; i++) {
        let item = this.importResult.notFoundTopUser[i];  //和上面不一样，就是源数据
        excelData.push([
          item.userName || '',
          item.userPhone || '',
          item.shenfen || '',
          item.topUserName || '',
          item.topUserPhone || '',
          item.topShenfen || '',
          '用户上级异常,查询无果',
          ''
        ]);
      }

      // 导出excel
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws["!cols"] = [
        { wpx: 100 },
        { wpx: 120 },
        { wpx: 110 },
        { wpx: 100 },
        { wpx: 140 },
        { wpx: 110 },
        { wpx: 140 },
        { wpx: 160 }
      ];
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, "导入有误名单");

      let time = moment().format("YYYYMMDDHHmm");
      /* generate file and send to client */
      XLSX.writeFile(wb, `导入有误名单${time}.xlsx`);
    },
    closeExportImportFail() {
      this.importResultVisible = false;
      this.reloadPage();
    },



    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        topUserPhone: this.filter.topUserPhone
      };

      if(this.selectLevel && this.selectLevel != 'all') params.level = this.selectLevel;

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        params.start_time = this.filter.createDate[0];
        params.end_time = this.filter.createDate[1];
      }

      if(this.filter.upgradeDate && this.filter.upgradeDate.length == 2) {
        params.upgrade_start_time = this.filter.upgradeDate[0];
        params.upgrade_end_time = this.filter.upgradeDate[1];
      }

      if(
        (params.topUserPhone === '' || !/^1[3456789]\d{9}$/.test(params.topUserPhone)) &&
        (!params.start_time && !params.end_time) &&
        (!params.upgrade_start_time && !params.upgrade_end_time)
      ) {
        return this.$message.warning(
          "筛选功能需要提供 精准的上级手机号码/加入时间/升级时间(三选一)，并点击查询后再点击导出按钮"
        );
      } else if(params.topUserPhone && params.topUserPhone !== '') {
        params.topUserType = this.filter.topUserType;
      }



      this.$get("/admin/member/list", params, (res) => {
        let data = res.data;
        if (data.length == 0) {
          return this.$message.warning("查无数据，请检查");
        }
        if (data.length > 100000) {
          return this.$message.warning(
            "数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请提供更精准的上级手机号码，并点击查询后再点击导出按钮"
          );
        }

        let excelData = [];
        excelData.push([
          "昵称",
          "用户手机",
          "身份",
          "加入时间",
          "升级时间",
          "上级昵称",
          "上级手机",
          "上级身份",
          "顶级信息",
          "分润上级信息"
        ]);
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          let divideChain = [];
          for(let j = 0; j < item.divide_chain_info.length; j++) {
            divideChain.push(`${item.divide_chain_info[j].name} | ${this.leaderTexts[item.divide_chain_info[j].level]}(${item.divide_chain_info[j].phone})`)
          }

          excelData.push([
            item.user_name,
            item.user_phone,
            this.leaderTexts[item.level],
            item.create_time,
            item.upgrade_time,
            item.link_user_name,
            item.link_user_phone,
            this.leaderTexts[item.link_user_level],
            item.topTeamUserInfo && item.topTeamUserInfo.uid ? `${item.topTeamUserInfo.name} | ${this.leaderTexts[item.topTeamUserInfo.level]}(${item.topTeamUserInfo.phone})` : '',
            divideChain.join('；')
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws["!cols"] = [
          { wpx: 140 },
          { wpx: 100 },
          { wpx: 120 },
          { wpx: 140 },
          { wpx: 140 },
          { wpx: 140 },
          { wpx: 120 },
          { wpx: 100 },
          // { wpx: 240 },
          // { wpx: 450 },
        ];
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "代理人列表");

        let time = moment().format("YYYYMMDDHHmm");
        /* generate file and send to client */
        XLSX.writeFile(wb, `代理人列表${time}.xlsx`);
      });
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

<style lang="less" scoped>
.table-ctrls {
  margin-bottom: 30px;
}

.quickly-select {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.quickly-option {
  position: relative;
  margin-right: 20px;
  padding: 10px 0;
  font-size: 18px;
  user-select: none;
  cursor: pointer;
}

.quickly-option.selected,
.quickly-option:hover {
  color: #618df5;
}

.quickly-option.selected:after,
.quickly-option:hover:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80%;
  height: 3px;
  background-color: #618df5;
}

.excel-uploader {
  display: inline-block;
}
</style>
