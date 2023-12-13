<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <!-- <el-form-item label="用户账号" prop="account">
            <el-input v-model="queryForm.account" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="上级推荐人" prop="referrer">
            <el-input v-model="queryForm.referrer" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="等级" prop="level">
            <el-select placeholder="不限" name="level" v-model="queryForm.level">
              <el-option label="不限" value></el-option>
              <el-option label="团队长" :value="1"></el-option>
              <el-option label="一级会员" :value="2"></el-option>
              <el-option label="普通会员" :value="3"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker
              name="createDate"
              v-model="queryForm.createDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :editable="false"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">会员列表</div>
        <div class="table-ctrl">
          <!-- <el-button type="primary" @click="openAddTeamLeader">添加指定团队长</el-button> -->
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <!-- <el-table-column type="selection" width="60" prop="id">
        </el-table-column> -->
        <el-table-column label="会员卡号" width="100" prop="member_card"></el-table-column>
        <el-table-column label="姓名" width="100" prop="user_name"></el-table-column>
        <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>
        <el-table-column label="等级" width="60" prop="level"></el-table-column>
        <el-table-column label="上级推荐人" width="100" prop="link_user_name"></el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <!-- <template slot-scope="scope">
            <el-button type="text" size="small" @click="deleteUser(scope.row)">删除</el-button>
            <el-button type="text" size="small" @click="toggoleUser(scope.row)">停用</el-button>
            <el-button type="text" size="small" @click="checkService(scope.row)">推广列表</el-button>
          </template> -->
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
</template>

<script>
import { publishDate } from '@/config.js';
import moment from 'moment';

export default {
  name: 'vips',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        // account: '',
        // referrer: '',
        // level: '',
        // createDate: [moment(publishDate).format('YYYY-MM-dd'), moment().format('YYYY-MM-dd')]
      },
      filter: {
        keyword: '',
        // account: '',
        // referrer: '',
        // level: '',
        // createDate: [moment(publishDate).format('YYYY-MM-dd'), moment().format('YYYY-MM-dd')]
      },
      dataList: []
    };
  },
  mounted() {
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
        // account: '',
        // referrer: '',
        // level: '',
        // createDate: [moment(publishDate).format('YYYY-MM-dd'), moment().format('YYYY-MM-dd')]
      };
      this.currentPage = 1;
      // this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        // account: this.queryForm.account,
        // referrer: this.queryForm.referrer,
        // level: this.queryForm.level,
        // createDate: this.queryForm.createDate
      };
      // this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        // account: this.filter.account,
        // referrer: this.filter.referrer,
        // level: this.filter.level,
        // createDate: this.filter.createDate
      };

      this.$get('/admin/member/list', queryVal, res => {

        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },

    openAddTeamLeader() {

    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    }
  }
};
</script>
