<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">

        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="关键字" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请填入关键字" @keyup.enter.native="requestQuery()"></el-input>
            </el-form-item>
            <el-form-item label="创建时间" prop="createDate">
              <el-date-picker name="createDate" v-model="queryForm.createDate" type="datetimerange"
                :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :clearable="false"
                :editable="false"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="requestQuery()">查询</el-button>
              <el-button @click="requestQuery(true)">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">协议列表</div>
          <div class="table-ctrl">
            <el-button type="primary" @click="addAgreement">新增</el-button>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="协议编号" width="200" prop="ag_sn"></el-table-column>
          <el-table-column label="协议标题" width="120" prop="title"></el-table-column>
          <el-table-column label="协议备注" width="180" prop="remark">
            <template slot-scope="{row}">
              <div class="ellipsis-2">{{ row.remark }}</div>
            </template>
          </el-table-column>
          <el-table-column label="签署条件" width="120" prop="attach_type">
            <template slot-scope="{row}">
              {{ attachTypeTexts[row.attach_type] }}
            </template>
          </el-table-column>
          <el-table-column label="签署阅读时间" width="150" prop="browse_time">
            <template slot-scope="{row}">
              {{ !row.browse_time ? '不限制' : `${row.browse_time}秒` }}
            </template>
          </el-table-column>
          <el-table-column label="签署协议总人数" width="150" prop="agreement_sign_total"></el-table-column>
          <el-table-column label="签署协议同意人数" width="150" prop="agreement_agree">
            <template slot-scope="{row}">
              <span class="success-color">{{ row.agreement_agree }}</span>
            </template>
          </el-table-column>
          <el-table-column label="签署协议拒绝人数" width="150" prop="agreement_refuse">
            <template slot-scope="{row}">
              <span class="error-color">{{ row.agreement_refuse }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" prop="status">
            <template slot-scope="{row}">
              <span :class="statusColors[row.status]">{{ statusTexts[row.status] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="220" prop="create_time"></el-table-column>
          <el-table-column label="操作" min-width="200">
            <template slot-scope="{row}">
              <template v-if="$auths.includes('userAgreement/list')">
                <el-button type="text" size="small" @click="goToDetail(row)">签约列表</el-button>
              </template>
              <template v-if="$auths.includes('agreement/update')">
                <el-button type="text" size="small" @click="editAgreement(row)">编辑</el-button>
              </template>
              <template v-if="$auths.includes('agreement/status')">
                <el-button :class="{ 'warning-color': row.status == 1, 'success-color': row.status == 2 }" type="text"
                  size="small" @click="toggleItem(row)">{{ row.status == 1 ? '下架' :
                    '上架' }}</el-button>
              </template>
              <template v-if="$auths.includes('agreement/delete')">
                <el-button type="text" class="error-color" size="small" @click="showCancel(row)">删除</el-button>
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
  </div>
</template>

<script>
import moment from 'moment';

import {nTimePickerConfig} from '@/config';

export default {
  name: 'consumeApplyList',
  components: {},
  data() {
    return {
      currentPage: 1,
      count: 1,

      queryForm: {
        keyword: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

        exportPageNum: 1,
        exportNum: 1000,

      },
      categories: [],
      attachTypeTexts: {
        [-1]: '无需条件',
        [1]: '需电子签名',
      },
      statusTexts: {
        [1]: '上架',
        [2]: '下架',
      },
      statusColors: {
        [1]: 'success-color',
        [2]: 'warning-color',
      },
      ...nTimePickerConfig,

      dataList: [],

    };
  },
  mounted() {
    if(localStorage.getItem('shouldRefresh')) localStorage.removeItem('shouldRefresh');
    this.getList();
  },
  activated() {
    if(localStorage.getItem('shouldRefresh')) {
      this.getList();
      localStorage.removeItem('shouldRefresh');
    }
  },
  methods: {
    //重置查询条件
    requestQuery(isReset = false) {
      if (isReset) {
        this.queryForm = {
          keyword: '',
          createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

          exportPageNum: 1,
          exportNum: 1000,
        };
      }
      this.currentPage = 1;
      this.getList();
    },

    //获取列表
    getList() {
      let params = {
        page: this.currentPage,
        keyword: this.queryForm.keyword,
      };
      if(this.queryForm.createDate && this.queryForm.createDate.length == 2) {
        params.start_time = this.queryForm.createDate[0];
        params.end_time = this.queryForm.createDate[1];
      }

      this.$get('/admin/agreement/list', params, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    /**
     * 详情
     * @param {*} row
     */
    goToDetail(row) {
      this.$router.push({
        path: '/userAgreement',
        query: {
          agSn: row.ag_sn
        }
      })
    },
    /**
     * 新增协议
     */
    addAgreement() {
      this.$router.push({
        path: '/agreementInfo',
      })
    },
    /**
     * 编辑协议
     */
    editAgreement(row) {
      this.$router.push({
        path: '/agreementInfo',
        query: {
          agSn: row.ag_sn
        }
      })
    },
    /**
     * 切换上下架
     * @param {*} row
     */
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '下架' : '上架'}${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/agreement/status', {
          ag_sn: row.ag_sn,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.getList();
        });
      }).catch(() => {});
    },
    /**
     * 删除协议
     * @param {*} row
     */
    showCancel(row) {
      this.$confirm('注意，删除改协议，将会对所有已签署改协议的用户产生影响，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/agreement/delete', { ag_sn: row.ag_sn }, res => {
          this.$message.success('删除成功');
          this.getList();
        });
      }).catch(() => {});
    },
  }
};
</script>

<style lang="less" scoped>
.ellipsis-2 {
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  word-break: break-all;
  /* autoprefixer: ignore next */
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
