<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item label="类型" prop="transfer_type">
            <el-select placeholder="不限" name="transfer_type" v-model="queryForm.transfer_type">
              <el-option label="不限" value></el-option>
              <el-option label="用户互转" :value="1"></el-option>
              <el-option label="充值" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker v-model="createDate" type="datetimerange" :picker-options="pickerOptions" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" align="right"></el-date-picker>
          </el-form-item>
          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number"
              @keyup.enter.native="queryInfo"></el-input>
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
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">系统集品券充值记录列表</div>
        <div class="table-ctrl">
          <el-button type="primary" @click="exportExcel">导出数据</el-button>
          <template v-if="$auths.includes('finance/rechargeCrowdBalance')">
            <!-- <el-upload
              id="excel-uploader"
              class="excel-uploader"
              accept=".xls,.xlsx,application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              action="/admin/file/importExcel"
              ref="importUsers"
              :data="thumbData"
              :headers="token"
              :show-file-list="false"
              :before-upload="excelWatcher"
              :on-success="excelSuccess"
              :on-error="uploadError"
              auto-upload
            >
              <el-button type="primary">导入用户列表</el-button>
            </el-upload>    -->
            <el-button class="excel-uploader" type="primary" @click="onClickImport">导入用户列表</el-button>

            <a href="/static/docs/集品券充值模版.xlsx" target="blank">
              <el-button type="primary" plain>下载充值模板</el-button>
            </a>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="订单编号" width="220" prop="order_sn">
        </el-table-column>
        <el-table-column label="用户名" width="120" prop="user_name"></el-table-column>
        <el-table-column label="手机号码" width="140" prop="user_phone"></el-table-column>
        <el-table-column label="金额" width="120" prop="price"></el-table-column>
        <el-table-column label="支付类型" width="100" align="center">
          <template slot-scope="scope">
            {{ payTypeTexts[scope.row.pay_type] }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="350" prop="remark"></el-table-column>
        <el-table-column label="状态" width="100" prop="status" align="center">
          <template slot-scope="scope">
            <span :class="{ 'error-color': scope.row.status != 1 }">{{
              statusTexts[scope.row.status]
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160" prop="create_time"></el-table-column>

        <el-table-column label="操作" min-label="100px">
          <template v-if="$auths.includes('crowdFunding/balance')" slot-scope="scope">
            <el-button type="text" size="small" @click="goToUserCrowdBalances(scope.row)">余额明细</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>
    <el-dialog title="导入用户列表" width="640px" :close-on-click-modal="false" :visible.sync="importVisible">
      <ImportUsers ref="import" @success="confirmImportSuccess"></ImportUsers>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmImport">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import XLSX from "xlsx";
import moment from "moment";
import { nTimePickerConfig } from "@/config";
import ImportUsers from "@/partialviews/crowdFunding/crowdFundingRecharges/ImportUsers";

export default {
  name: "crowdFundingRecharges",
  components: { ImportUsers },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: "",
        transfer_type: "",
        start_time: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss"),
        end_time: moment().format("YYYY-MM-DD HH:mm:ss"),

        exportPageNum: 1,
        exportNum: 1000
      },
      filter: {
        keyword: "",
        transfer_type: "",
        start_time: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss"),
        end_time: moment().format("YYYY-MM-DD HH:mm:ss"),

        exportPageNum: 1,
        exportNum: 1000
      },
      dataList: [],
      statusTexts: {
        [1]: "正常",
        [2]: "禁用",
        [3]: "充值待支付",
        [-1]: "删除"
      },
      payTypeTexts: {
        [1]: "余额支付",
        [2]: "微信支付", //现金支付
        [4]: "拼拼支付",
        [5]: "集品券支付",
        [6]: "协议支付",
        [77]: '系统赠送',
        [88]: '系统充值',
      },

      createDate: [
        moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss"),
        moment().format("YYYY-MM-DD HH:mm:ss")
      ],
      ...nTimePickerConfig,

      token: {
        token: localStorage.getItem("token")
      },
      thumbData: {
        type: 6 //导入要充值集品券的人员
      },
      importData: [],
      importVisible: false
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
        keyword: "",
        transfer_type: "",
        start_time: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss"),
        end_time: moment().format("YYYY-MM-DD HH:mm:ss"),

        exportPageNum: 1,
        exportNum: 1000
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      if (!this.createDate || this.createDate.length != 2) {
        return this.$message.error("请选择有效创建时间");
      }
      this.filter = {
        keyword: this.queryForm.keyword,
        transfer_type: this.queryForm.transfer_type,
        start_time: this.createDate[0],
        end_time: this.createDate[1],

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum
      };
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        transfer_type: this.filter.transfer_type,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };

      this.$get("/admin/finance/crowdBalanceList", queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    // 跳转到余额明细
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

    // 打开导入弹窗
    onClickImport() {
      this.$refs.import && this.$refs.import.clearFiles();
      this.importVisible = true;
    },
    // 确认导入
    async confirmImport() {
      if (this.$refs.import) {
        await this.$refs.import.confirmSelectCorrect();
        this.importVisible = false;
        this.currentPage = 1;
        this.getList();
      } else {
        this.$message.error("导入错误，请稍后重试");
      }
    },
    // 导入成功
    confirmImportSuccess() {
      this.createDate = [
        moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss"),
        moment().format("YYYY-MM-DD 23:59:59")
      ];
      this.filter = {
        start_time: this.createDate[0],
        end_time: this.createDate[1]
      };
      this.importVisible = false;
      this.reloadPage();
    },
    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        transfer_type: this.filter.transfer_type,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time,

        page: this.filter.exportPageNum, //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum //实际用参数名和变量名是不一致的哈
      };

      if (
        !params.pageNumber ||
        params.pageNumber == "" ||
        !/^([1-9][0-9]*)$/.test(params.pageNumber)
      ) {
        return this.$message.error(
          `导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`
        );
      }

      if (!params.start_time || !params.end_time) {
        return this.$message.error(
          "请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大"
        );
      }

      this.$get("/admin/finance/crowdBalanceList", params, res => {
        let data = res.data.list || [];

        if (data.length == 0) {
          return this.$message.warning("查无数据，请检查");
        }
        if (data.length > 100000) {
          return this.$message.warning(
            "数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理"
          );
        }

        let excelData = [];
        excelData.push([
          "用户名",
          "手机号码",
          "金额",
          "支付方式",
          "状态",
          "创建时间",
          "备注"
        ]);
        for (let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.user_name,
            item.user_phone,
            item.price || 0,
            this.payTypeTexts[item.pay_type],
            this.statusTexts[item.status],
            item.create_time,
            item.remark
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws["!cols"] = [
          { wpx: 120 },
          { wpx: 120 },
          { wpx: 80 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 140 },
          { wpx: 200 }
        ];
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws["!ref"]);
        for (let i = range.s.r + 1; i <= range.e.r; i++) {
          let col2 = XLSX.utils.encode_cell({ r: i, c: 2 });
          ws[col2].t = "n";
        }
        ws["!ref"] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "集品券充值列表");

        let time = moment().format("YYYYMMDDHHmm");
        /* generate file and send to client */
        XLSX.writeFile(wb, `集品券充值列表${time}.xlsx`);
      });
    }
  }
};
</script>
<style lang="less" scoped>
.excel-uploader {
  display: inline-block;
  margin: 0 15px;
}
</style>
