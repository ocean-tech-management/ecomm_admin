<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form ref="queryForm" :inline="true" :model="queryForm" @submit.native.prevent class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入用户名" @keyup.enter.native="requestQuery"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="queryForm.phone" placeholder="请输入手机号" @keyup.enter.native="requestQuery"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="conver_status">
            <el-select v-model="queryForm.conver_status" placeholder="不限" name="conver_status">
              <el-option label="不限" value></el-option>
              <el-option label="成功" :value="1"></el-option>
              <el-option label="失败" :value="-1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="转入时间">
            <el-date-picker
              v-model="queryForm.time"
              type="datetimerange"
              :picker-options="formPickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number" @keyup.enter.native="queryInfo"></el-input>
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
            <el-button type="primary" @click="requestQuery">查询</el-button>
            <el-button @click="requestQuery(true)">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">健康豆转换列表</div>
        <div class="table-ctrl">
          <el-button style="margin-right: 15px;" type="primary" @click="exportExcel">
            导出
          </el-button>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="转出者名称" width="150" prop="transfer_from_name"></el-table-column>
        <el-table-column label="转出者手机号码" width="150" prop="transfer_from_user_phone"></el-table-column>
        <el-table-column label="转入者名称" width="150" prop="transfer_for_name"></el-table-column>
        <el-table-column label="转入者手机号码" width="150" prop="transfer_for_user_phone"></el-table-column>
        <el-table-column label="数额" width="150" prop="balance"></el-table-column>
        <el-table-column label="状态" width="100" prop="conver_status">
          <template slot-scope="{ row }">
            {{ statusText[row.conver_status] || '未知' }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="200" prop="create_time"></el-table-column>
        <el-table-column label="描述" min-width="200" prop="remark"></el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
                       layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { formNTimePickerConfig } from '@/config';
import {nTimePickerConfig} from "../../../config";
import XLSX from "xlsx";
import moment from "moment/moment";
export default {
  name: "HealthyBeanConvert",
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: "",
        phone: '',
        conver_status: '',
        exportPageNum: 1,
        exportNum: 1000,
      },
      ...formNTimePickerConfig,
      dataList: [],
      statusText: {
        [1]: '成功',
        [-1]: '失败'
      },
    }
  },
  mounted() {
    this.requestQuery();
  },
  methods: {
    // 请求
    requestQuery(isForceRefresh = false) {
      if (isForceRefresh === true) {
        this.currentPage = 1
        this.queryForm.keyword = ''
        this.queryForm.phone = ''
        this.queryForm.conver_status = ''
        this.queryForm.time = []
      }
      this.getList();
    },
    //获取数据
    getList() {
      const regPhone = new RegExp(/^1[3456789]\d{9}$/); // 手机号
      if (this.queryForm.phone && !regPhone.test(this.queryForm.phone)) return this.$message.error('转入者手机号码格式有误，请检查');
      let queryVal = {
        page: this.currentPage,
        keyword: this.queryForm.keyword,
        phone: this.queryForm.phone,
        conver_status: this.queryForm.conver_status,
      };
      if (this.queryForm.time && this.queryForm.time.length == 2) {
        queryVal.start_time = this.queryForm.time[0];
        queryVal.end_time = this.queryForm.time[1];
      }
      this.$get("/admin/healthy/hbConverList", queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.queryForm.keyword,
        phone: this.queryForm.phone,
        conver_status: this.queryForm.conver_status,

        page: this.queryForm.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.queryForm.exportNum,   //实际用参数名和变量名是不一致的哈
      }
      if (this.queryForm.time && this.queryForm.time.length == 2) {
        params.start_time = this.queryForm.time[0];
        params.end_time = this.queryForm.time[1];
      }
      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }


      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      this.$get('/admin/healthy/hbConverList', params, res => {
        let data = res.data.list || [];

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }


        let excelData = [];
        excelData.push([
          '子公司名',
          '转出者名称',
          '转出者手机号码',
          '转入者名称',
          '转入者手机号码',
          '数额',
          '状态',
          '时间',
          '描述'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.subco_name,
            item.transfer_from_name,
            item.transfer_from_user_phone,
            item.transfer_for_name,
            item.transfer_for_user_phone,
            item.balance,
            this.statusText[item.conver_status],
            item.create_time,
            item.remark
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
          {wpx: 100},
          {wpx: 80},
          {wpx: 150},
          {wpx: 250}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let col2 = XLSX.utils.encode_cell({r: i , c: 2});
          ws[col2].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "健康豆转换列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `健康豆转换列表${time}.xlsx`);
      });
    },
  }
};
</script>
<style lang="less" scoped>
</style>
