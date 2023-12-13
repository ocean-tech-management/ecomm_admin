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
              <el-input v-model="queryForm.topUserPhone" placeholder="请输入精准手机号码或置空" maxlength="11" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>

            <el-form-item label="加入时间" prop="createDate">
              <el-date-picker
                name="createDate"
                v-model="queryForm.createDate"
                type="datetimerange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :clearable="true"
                :editable="false"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="升级时间" prop="upgradeDate">
              <el-date-picker
                name="upgradeDate"
                v-model="queryForm.upgradeDate"
                type="datetimerange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :clearable="true"
                :editable="false"
              ></el-date-picker>
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
          <div class="table-title">团队业绩代理人管理</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('teamMember/list')">
              <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
            </template>
          </div>
        </div>

        <div class="quickly-filters">
          <div class="quickly-select">
            <div v-for="item in leaderData" class="quickly-option" :class="{'selected': selectLevel == item.level}" :key="item.level" @click="changeLevel(item.level)">{{item.name}}({{item.number || 0}})</div>
          </div>
        </div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.avatarUrl"/>
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="100" prop="user_name">
          </el-table-column>
          <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>

          <el-table-column label="销售额" width="90" prop="team_sales_price"></el-table-column>
          <el-table-column label="销售额偏移量" width="110" prop="team_sales_price_offset"></el-table-column>
          <el-table-column label="历史降级门槛" width="120" prop="demotion_team_sales_price"></el-table-column>
          <el-table-column label="直属上级" width="180">
            <template slot-scope="scope">
              {{scope.row.link_user_name ? scope.row.link_user_name : '——'}}
              <span v-if="scope.row.link_user_level"> | {{leaderTexts[scope.row.link_user_level]}}</span>
              <span v-if="scope.row.link_user_phone">({{scope.row.link_user_phone}})</span>
            </template>
          </el-table-column>
          <el-table-column label="顶级团队" width="180">
            <template slot-scope="scope">
              {{scope.row.topTeamUserInfo ? scope.row.topTeamUserInfo.name : '——'}}
              <span v-if="scope.row.topTeamUserInfo && scope.row.topTeamUserInfo.level"> | {{leaderTexts[scope.row.topTeamUserInfo.level]}}</span>
              <span v-if="scope.row.topTeamUserInfo && scope.row.topTeamUserInfo.phone">({{scope.row.topTeamUserInfo.phone}})</span>
            </template>
          </el-table-column>
          <el-table-column label="升级时间" prop="upgrade_time" width="150"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">

              <template v-if="$auths.includes('teamMember/assign')">
                <el-button type="text" size="small" @click="showTeamDivideAssign(scope.row)">指定团队代理身份</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div v-show="dataList && dataList.length > 0" class="pagination">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :pager-count="7"
            layout="total, prev, pager, next"
            :page-count="count"
          ></el-pagination>
        </div>
      </div>
    </div>

    <el-dialog title="指定团队代理身份" width="800px" :close-on-click-modal="false" :visible.sync="teamDivideAssignVisible">
      <AssignTeamDivide :formData="formData"></AssignTeamDivide>
      <div slot="footer" class="dialog-footer">
        <el-button @click="teamDivideAssignVisible = false">取 消</el-button>
        <el-button type="primary" @click="teamDivideAssign">确 定</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
import AssignTeamDivide from '@/partialviews/user/teamDivideUser/Assign';

import {nTimePickerConfig} from '@/config';
import XLSX from 'xlsx';
import moment from 'moment';
export default {
  name: 'teamDivideUsers',
  components: {
    AssignTeamDivide
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

      teamDivideAssignVisible: false,

      ...nTimePickerConfig,

      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,
      importResult: {},
      importResultVisible: false
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

      this.$get('/admin/teamMember/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    getVdc() {
      this.$get('/admin/teamVdc/list', null, res => {
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

      this.$get('/admin/teamMember/level', params, res => {
        this.leaderData = res.data;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    showTeamDivideAssign(row) {
      this.formData = {
        uid: row.uid,
        name: row.user_name,
        level: row.level
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



      this.$get("/admin/teamMember/list", params, (res) => {
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
          "销售额",
          "销售额偏移量",
          "历史降级门槛",
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
          if(item.divide_chain_info&&item.divide_chain_info.length!=0){
            for(let j = 0; j < item.divide_chain_info.length; j++) {
              divideChain.push(`${item.divide_chain_info[j].name} | ${this.leaderTexts[item.divide_chain_info[j].level]}(${item.divide_chain_info[j].phone})`)
            }
          }else{
            divideChain.push(``)
          }

          excelData.push([
            item.user_name,
            item.user_phone,
            item.team_sales_price,
            item.team_sales_price_offset,
            item.demotion_team_sales_price,
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
          { wpx: 100 },
          { wpx: 100 },
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
        let range = XLSX.utils.decode_range(ws['!ref']);
        console.log(range)
        for (let i = range.s.r + 1; i <= range.e.r; i++) {
          let row3 = XLSX.utils.encode_cell({
            r: i,
            c: 2
          });
          ws[row3].t = 'n';
          let row4 = XLSX.utils.encode_cell({
            r: i,
            c: 3
          });
          ws[row4].t = 'n';
          let row5 = XLSX.utils.encode_cell({
            r: i,
            c: 4
          });
          ws[row5].t = 'n';

        }
        ws['!ref'] = XLSX.utils.encode_range(range);
        XLSX.utils.book_append_sheet(wb, ws, "团队代理人列表");

        let time = moment().format("YYYYMMDDHHmm");
        /* generate file and send to client */
        XLSX.writeFile(wb, `团队代理人列表${time}.xlsx`);
      });
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
