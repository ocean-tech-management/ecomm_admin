<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">

        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="关键字" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请填入关键字" @keyup.enter.native="requestQuery()"></el-input>
            </el-form-item>
            <el-form-item label="用户搜索关键词" prop="userKeyword">
              <el-input v-model="queryForm.userKeyword" placeholder="请填入用户关键词"
                @keyup.enter.native="requestQuery()"></el-input>
            </el-form-item>
            <el-form-item label="协议编号" prop="ag_sn">
              <el-input v-model="queryForm.ag_sn" placeholder="请填入协议编号" @keyup.enter.native="requestQuery()"></el-input>
            </el-form-item>
            <el-form-item label="签约状态" prop="sign_status">
              <el-select v-model="queryForm.sign_status" placeholder="请选择签约状态" name="sign_status">
                <el-option label="不限" value=""></el-option>
                <el-option v-for="(value, key) in signStatusTexts" :label="value" :value="key" :key="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="签约时间" prop="createDate">
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
          <div class="table-title">用户协议签约列表</div>
          <div class="table-ctrl">
            <el-button type="primary" @click="exportExcel">导出Excel表格</el-button>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="签约协议编号" width="220" prop="uag_sn"></el-table-column>
          <el-table-column label="协议编号" width="220" prop="ag_sn"></el-table-column>
          <el-table-column label="协议名称" width="180" prop="title"></el-table-column>
          <el-table-column label="用户昵称" width="160" prop="user_name">
            <template slot-scope="{row}">
              <div>{{ row.user_name }}{{ row.user_phone ? `（${row.user_phone}）` : '' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="协议内容" width="200" prop="content">
            <template slot-scope="{row}">
              <div class="ellipsis-2">{{ row.content }}</div>
            </template>
          </el-table-column>
          <el-table-column label="协议备注说明" width="200" prop="remark">
            <template slot-scope="{row}">
              <div class="ellipsis-2">{{ row.remark }}</div>
            </template>
          </el-table-column>
          <el-table-column label="协议其他快照, 如电子签名等" width="220" prop="snapshot"></el-table-column>
          <el-table-column label="签约状态" width="80" prop="sign_status">
            <template slot-scope="{row}">
              <span :class="statusColors[row.sign_status]">{{ signStatusTexts[row.sign_status] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="签约时间" width="150" prop="create_time"></el-table-column>
          <el-table-column label="操作" min-width="120">
            <template slot-scope="{row}">
              <template v-if="$auths.includes('agreement/info')">
                <el-button type="text" size="default" @click="showDetail(row)">协议详情</el-button>
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
import XLSX from 'xlsx';

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
        userKeyword: '',
        ag_sn: '',
        sign_status: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

        exportPageNum: 1,
        exportNum: 1000,

      },
      categories: [],
      signStatusTexts: {
        [1]: '同意',
        [2]: '拒绝'
      },
      statusColors: {
        [1]: 'success-color',
        [2]: 'error-color',
      },
      ...nTimePickerConfig,

      dataList: [],

      formData: {},

      visible: false,
      auditVisible: false,
      detailVisible: false,
    };
  },
  mounted() {
    if (this.$route.query.agSn) {
      this.queryForm.ag_sn = this.$route.query.agSn;
    }
    this.getList();
  },
  methods: {
    //重置查询条件
    requestQuery(isReset = false) {
      if (isReset) {
        this.queryForm = {
          keyword: '',
          ag_sn: '',
          userKeyword: '',
          sign_status: '',
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
        userKeyword: this.queryForm.userKeyword,
        sign_status: this.queryForm.sign_status,
        ag_sn: this.queryForm.ag_sn,
      };
      if(this.queryForm.createDate && this.queryForm.createDate.length == 2) {
        params.start_time = this.queryForm.createDate[0];
        params.end_time = this.queryForm.createDate[1];
      }
      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，再进行查询操作。建议时间跨度不要过大');
      }

      this.$get('/admin/userAgreement/list', params, res => {
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
     * 显示详情
     * @param {*} row
     */
    showDetail(row) {
      this.$router.push({
        path: '/agreementInfo',
        query: {
          agSn: row.ag_sn,
          onlyRead: 1
        }
      })
    },
    /**
     * 导出excel表格
     */
    exportExcel() {
      let params = {
        keyword: this.queryForm.keyword,
        userKeyword: this.queryForm.userKeyword,
        ag_sn: this.queryForm.ag_sn,
        sign_status: this.queryForm.sign_status,

        page: this.queryForm.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.queryForm.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      this.$get('/admin/userAgreement/list', params, res => {
        let data = res.data.list || [];

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        let excelData = [];
        excelData.push([
          '签约协议编号',
          '协议编号',
          '协议名称',
          '用户昵称',
          '手机号',
          '协议内容',
          '协议备注说明',
          '协议其他快照, 如电子签名等',
          '签约状态',
          '签约时间'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.uag_sn,
            item.ag_sn,
            item.title,
            item.user_name,
            item.user_phone,
            item.content || '',
            item.remark,
            item.snapshot,
            this.signStatusTexts[item.sign_status] || '',
            item.create_time,
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 120},
          {wpx: 120},
          {wpx: 120},
          {wpx: 120},
          {wpx: 120},
          {wpx: 200},
          {wpx: 200},
          {wpx: 120},
          {wpx: 120},
          {wpx: 120},
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        // for(let i = range.s.r + 1; i <= range.e.r; i++) {
        //   let col2 = XLSX.utils.encode_cell({r: i , c: 2});
        //   ws[col2].t = 'n';
        // }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "用户协议签约列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `用户协议签约列表${time}.xlsx`);
      });
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
