<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="resetQuery"></el-input>
          </el-form-item>
          <el-form-item label="类型">
            <el-select placeholder="不限" v-model="queryForm.type">
              <el-option label="不限" value></el-option>
              <el-option v-for="(item, key) in typeTexts" :label="item" :value="key" :key="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="变动类型">
            <el-select placeholder="不限" v-model="queryForm.change_type">
              <el-option label="不限" value></el-option>
              <el-option v-for="(item, key) in changeTypeTexts" :label="item" :value="key" :key="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker v-model="queryForm.createDate" type="datetimerange" :picker-options="pickerOptions"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" align="right"></el-date-picker>
          </el-form-item>
          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number"
              @keyup.enter.native="resetQuery"></el-input>
          </el-form-item>
          <el-form-item label="导出数量" prop="exportNum" title="仅针对导出订单">
            <el-select placeholder="500" name="exportNum" v-model="queryForm.exportNum">
              <el-option label="500" :value="500"></el-option>
              <el-option label="1000" :value="1000"></el-option>
              <el-option label="2000" :value="2000"></el-option>
              <el-option label="3000" :value="3000"></el-option>
              <el-option label="5000" :value="5000"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="resetQuery">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">集品豆(积分)充值明细列表</div>
        <div class="table-ctrl">
          <el-button type="primary" @click="exportExcel">导出数据</el-button>
          <template v-if="$auths.includes('integral/recharge')">
            <excel-upload ref="import" :validCol="excelUploadCol" @success="onUploadSuccess">
              <el-button type="primary">导入用户列表</el-button>
            </excel-upload>
            <a href="/static/docs/集品豆充值模版.xlsx" target="blank">
              <el-button type="primary" plain>下载充值模板</el-button>
            </a>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="用户名" width="120" prop="user_name"></el-table-column>
        <el-table-column label="手机号码" width="140" prop="user_phone"></el-table-column>
        <el-table-column label="订单号" width="220" prop="order_sn"></el-table-column>
        <el-table-column label="金额" width="120" prop="price"></el-table-column>
        <el-table-column label="类型" width="100" align="center">
          <template slot-scope="scope">
            {{ typeTexts[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column label="变更类型" width="160" align="center">
          <template slot-scope="scope">
            {{ changeTypeTexts[scope.row.change_type] }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="300" prop="remark"></el-table-column>
        <el-table-column label="状态" width="100" prop="status" align="center">
          <template slot-scope="scope">
            <span :class="{ 'error-color': scope.row.status != 1 }">{{
              statusTexts[scope.row.status]
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160" prop="create_time"></el-table-column>
        <!--        <el-table-column label="操作">-->
        <!--        </el-table-column>-->
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import XLSX from 'xlsx';
import moment from "moment";
import ExcelUpload from '@/components/ExcelUpload/index'
import {nTimePickerConfig} from '@/config';

export default {
  name: 'IntegralRechargeList',
  components: { ExcelUpload },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        change_type: '',
        type: '',
        createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

        exportPageNum: 1,
        exportNum: 1000,
      },
      dataList: [],
      typeTexts: {
        [1]: '新增',
        [2]: '减少',
      },
      changeTypeTexts: {
        [7]: '后台充值集品券赠送',
        [8]: '后台系统操作',
      },
      statusTexts: {
        [1]: "正常",
        [2]: "禁用",
        [3]: "充值待支付",
        [-1]: "删除"
      },

      ...nTimePickerConfig,

      excelUploadCol: [{ key: 'user_phone', text: '用户手机号码', require: true },{ key: 'price', text: '本次操作金额', require: true },{ key: 'remark', text: '操作备注' }],
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    //重置查询条件
    resetQuery(queryForm) {
      if (typeof queryForm === 'string') {
        this.$refs[queryForm].resetFields();
        this.queryForm = {
          keyword: '',
          change_type: '',
          type: '',
          createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

          exportPageNum: 1,
          exportNum: 1000,
        }
        this.currentPage = 1;
      }
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.queryForm.keyword,
        change_type: this.queryForm.change_type,
        type: this.queryForm.type,
      };
      if (this.queryForm.createDate && this.queryForm.createDate.length === 2) {
        queryVal['start_time'] = this.queryForm.createDate[0]
        queryVal['end_time'] = this.queryForm.createDate[1]
      }

      this.$get('/admin/integral/rechargeList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    // 导入成功回调
    onUploadSuccess({ selectResult }) {
      this.$confirm(`导入成功，您将对导入的${selectResult.length}条记录进行充值操作, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/integral/recharge', {
          all_user: selectResult
        }, () => {
          this.$message.success('充值成功');
          this.queryForm.createDate = [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD 23:59:59')];
          this.getList();
          this.$refs.import && this.$refs.import.resetFiles();
        });
      }).catch(() => {
        this.$refs.import && this.$refs.import.resetFiles();
      });
    },

    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.queryForm.keyword,
        change_type: this.queryForm.change_type,
        type: this.queryForm.type,

        page: this.queryForm.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.queryForm.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }


      if(!this.queryForm.createDate) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }
      params['start_time'] = this.queryForm.createDate[0];
      params['end_time'] = this.queryForm.createDate[1];
      this.$get('/admin/integral/rechargeList', params, res => {
        let data = res.data.list || [];

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }


        let excelData = [];
        excelData.push([
          '用户名',
          '手机号码',
          '金额',
          '类型',
          '变更类型',
          '状态',
          '创建时间',
          '备注'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.user_name,
            item.user_phone,
            item.price || 0,
            this.typeTexts[item.type],
            this.changeTypeTexts[item.change_type],
            this.statusTexts[item.status],
            item.create_time,
            item.remark
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 120},
          {wpx: 120},
          {wpx: 80},
          {wpx: 100},
          {wpx: 160},
          {wpx: 100},
          {wpx: 140},
          {wpx: 200}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let col2 = XLSX.utils.encode_cell({r: i , c: 2});
          ws[col2].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "集品豆充值列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `集品豆充值列表${time}.xlsx`);
      });
    },

  }
};
</script>
<style lang="less" scoped>
.excel-uploader {
  display: inline-block;
  margin: 0 15px;
}
</style>

