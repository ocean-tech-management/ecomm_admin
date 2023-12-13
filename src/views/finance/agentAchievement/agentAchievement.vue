<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="会员名称" prop="username">
              <el-input v-model="queryForm.keyword" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="会员等级" prop="level">
              <el-select placeholder="不限" name="level" v-model="queryForm.level">
                <el-option label="lv3" :value="1"></el-option>
                <el-option label="lv2" :value="2"></el-option>
                <el-option label="lv1" :value="3"></el-option>
              </el-select>
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
            <el-form-item label="统计时间" prop="keyword">
              <el-date-picker
                v-model="times"
                type="datetimerange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :clearable="false"
                align="right"
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
          <div class="table-title">用户业绩列表</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('excel/performance')">
              <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
            </template>
          </div>
        </div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="用户昵称" width="120" prop="name"></el-table-column>
          <el-table-column label="用户等级" width="80" prop="vip_name"></el-table-column>
          <el-table-column label="推荐人" width="220" prop="link_user_name">
            <template slot-scope="scope">
              {{scope.row.link_user_name ? scope.row.link_user_name : '——'}}
              <span v-if="scope.row.link_user_level"> | {{scope.row.link_user_vip_name}}</span>
              <span v-if="scope.row.link_user_phone">({{scope.row.link_user_phone}})</span>
            </template>
          </el-table-column>
          <el-table-column label="顶级团队" width="180">
            <template slot-scope="scope">
              {{scope.row.topTeamUserInfo ? scope.row.topTeamUserInfo.name : '——'}}
              <span v-if="scope.row.topTeamUserInfo && scope.row.topTeamUserInfo.level"> | {{scope.row.topTeamUserInfo.vip_name}}</span>
              <span v-if="scope.row.topTeamUserInfo && scope.row.topTeamUserInfo.phone">({{scope.row.topTeamUserInfo.phone}})</span>
            </template>
          </el-table-column>
          <el-table-column label="分润上级" width="180">
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.divide_chain_info" :key="index">
                {{item.name ? item.name : '——'}}
                <span v-if="item.level"> | {{item.vip_name}}</span>
                <span v-if="item.phone">({{item.phone}})</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="个人营业总额" width="120" prop="direct_order_price"></el-table-column>
          <el-table-column label="个人进货总额" width="120" prop="direct_purchase_price"></el-table-column>
          <el-table-column label="销售订单数" width="100" prop="direct_pay_order_number"></el-table-column>
          <el-table-column label="销售利润" width="120" prop="direct_will_income_total"></el-table-column>
          <el-table-column label="团队营业总额" width="120" prop="indirect_order_price"></el-table-column>
          <el-table-column label="团队进货总额" width="120" prop="indirect_purchase_price"></el-table-column>
          <el-table-column label="团队订单数" width="100" prop="indirect_pay_order_number"></el-table-column>
          <el-table-column label="教育奖金" width="120" prop="indirect_will_income_total"></el-table-column>
          <el-table-column label="累计总收益" width="120" prop="all_will_income_total"></el-table-column>
          <el-table-column label="累计总提现" width="100" prop="all_total_withdraw_price"></el-table-column>
          <el-table-column label="未结算" width="120" prop="all_freeze_price"></el-table-column>
          <el-table-column label="可用余额" width="120" prop="all_total_balance"></el-table-column>
          <el-table-column label="操作">

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
  </div>
</template>

<script>
import moment from "moment";
import XLSX from "xlsx";

import {nTimePickerConfig} from '@/config';

export default {
  name: "agentAchievement",
  data() {
    return {
      vdc: [],

      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: "",
        level: 1,
        topUserPhone: '',
        topUserType: 1,
      },
      filter: {
        keyword: "",
        level: 1,
        topUserPhone: '',
        topUserType: 1,
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      dataList: [],
      detailVisible: false,
      formData: {},
      typeText: {
        [1]: "常规分润",
        [2]: "普通用户推荐首单返积分",
        [3]: "会员推荐首次分润",
        [4]: "会员订单分润",
      },

      times: [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,
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
        level: 1,
        topUserPhone: '',
        topUserType: 1,
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      this.times = [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        level: this.queryForm.level,
        topUserPhone: this.queryForm.topUserPhone,
        topUserType: this.queryForm.topUserType,
      };
      if(this.times && this.times.length == 2) {
        this.filter.start_time = this.times[0];
        this.filter.end_time = this.times[1];
      }
      this.getList();
    },
    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        level: this.filter.level,
        topUserPhone: this.filter.topUserPhone,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };
      if(queryVal.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(queryVal.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      } else {
        queryVal.topUserType = this.filter.topUserType;
      }

      this.$get("/admin/summary/performance", queryVal, (res) => {
        let dataList = res.data.list || [];

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].direct_order_price = dataList[i].direct.order_price || '0.00';
          dataList[i].direct_pay_order_number = dataList[i].direct.pay_order_number || 0;
          dataList[i].direct_purchase_price = dataList[i].direct.purchase_price || '0.00';
          dataList[i].direct_will_income_total = dataList[i].direct.will_income_total || '0.00';
          
          dataList[i].indirect_order_price = dataList[i].indirect.order_price || '0.00';
          dataList[i].indirect_pay_order_number = dataList[i].indirect.pay_order_number || 0;
          dataList[i].indirect_purchase_price = dataList[i].indirect.purchase_price || '0.00';
          dataList[i].indirect_will_income_total = dataList[i].indirect.will_income_total || '0.00';


          let allKeys = Object.keys(dataList[i].all);
          let allValues = Object.values(dataList[i].all);
          for(let j = 0; j < allKeys.length; j++) {
            dataList[i][`all_${allKeys[j]}`] = allValues[j];
          }
        }

        this.dataList = dataList;
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
        keyword: this.filter.keyword,
        level: this.filter.level,
        topUserPhone: this.filter.topUserPhone,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };
      if(params.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(params.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      } else {
        params.topUserType = this.filter.topUserType;
      }

      if (!params.start_time || !params.end_time) {
        return this.$message.error(
          "请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大"
        );
      }

      this.$get("/admin/excel/performance", params, (res) => {
        let data = res.data;
        if (data.length == 0) {
          return this.$message.warning("查无数据，请检查");
        }
        if (data.length > 100000) {
          return this.$message.warning(
            "数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理"
          );
        }

        for(let i = 0; i < data.length; i++) {
          data[i].direct_order_price = data[i].direct.order_price || '0.00';
          data[i].direct_pay_order_number = data[i].direct.pay_order_number || 0;
          data[i].direct_purchase_price = data[i].direct.purchase_price || '0.00';
          data[i].direct_will_income_total = data[i].direct.will_income_total || '0.00';
          
          data[i].indirect_order_price = data[i].indirect.order_price || '0.00';
          data[i].indirect_pay_order_number = data[i].indirect.pay_order_number || 0;
          data[i].indirect_purchase_price = data[i].indirect.purchase_price || '0.00';
          data[i].indirect_will_income_total = data[i].indirect.will_income_total || '0.00';

          
          let allKeys = Object.keys(data[i].all);
          let allValues = Object.values(data[i].all);
          for(let j = 0; j < allKeys.length; j++) {
            data[i][`all_${allKeys[j]}`] = allValues[j];
          }

        }


        let excelData = [];
        excelData.push([
          "用户昵称",
          "手机号码",
          "用户等级",
          "推荐人",
          "推荐人号码",
          "推荐人等级",
          "顶级信息",
          "分润上级信息",
          "个人营业总额",
          "个人进货总额",
          "销售订单数",
          "销售利润",
          "团队营业总额",
          "团队进货总额",
          "团队订单数",
          "教育奖金",
          "累计总收益",
          "累计总提现",
          "未结算",
          "可用余额",
          "统计时间段",
        ]);
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          
          let divideChain = [];
          for(let j = 0; j < item.divide_chain_info.length; j++) {
            divideChain.push(`${item.divide_chain_info[j].name} | ${item.divide_chain_info[j].vip_name}(${item.divide_chain_info[j].phone})`)
          }

          excelData.push([
            item.name,
            item.phone,
            item.vip_name,
            item.link_user_name,
            item.link_user_phone,
            item.link_user_vip_name,
            item.topTeamUserInfo && item.topTeamUserInfo.uid ? `${item.topTeamUserInfo.name} | ${item.topTeamUserInfo.vip_name}(${item.topTeamUserInfo.phone})` : '',
            divideChain.join('；'),
            item.direct_order_price || '0.00',
            item.direct_purchase_price || '0.00',
            item.direct_pay_order_number || '0',
            item.direct_will_income_total || '0.00',
            item.indirect_order_price || '0.00',
            item.indirect_purchase_price || '0.00',
            item.indirect_pay_order_number || '0',
            item.indirect_will_income_total || '0.00',
            item.all_will_income_total || '0.00',
            item.all_total_withdraw_price || '0.00',
            item.all_freeze_price || '0.00',
            item.all_total_balance || '0.00',
            `${params.start_time}~${[params.end_time]}`
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws["!cols"] = [
          { wpx: 100 },
          { wpx: 80 },
          { wpx: 60 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 120 },
          { wpx: 100 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 80 },
          { wpx: 300 }
        ];
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws["!ref"]);
        for (let i = range.s.r + 1; i <= range.e.r; i++) {
          let col8 = XLSX.utils.encode_cell({ r: i, c: 8 });
          ws[col8].t = "n";
          let col9 = XLSX.utils.encode_cell({ r: i, c: 9 });
          ws[col9].t = "n";
          let col10 = XLSX.utils.encode_cell({ r: i, c: 10 });
          ws[col10].t = "n";
          let col11 = XLSX.utils.encode_cell({ r: i, c: 11 });
          ws[col11].t = "n";
          let col12 = XLSX.utils.encode_cell({ r: i, c: 12 });
          ws[col12].t = "n";
          let col13 = XLSX.utils.encode_cell({ r: i, c: 13 });
          ws[col13].t = "n";
          let col14 = XLSX.utils.encode_cell({ r: i, c: 14 });
          ws[col14].t = "n";
          let col15 = XLSX.utils.encode_cell({ r: i, c: 15 });
          ws[col15].t = "n";
          let col16 = XLSX.utils.encode_cell({ r: i, c: 16 });
          ws[col16].t = "n";
          let col17 = XLSX.utils.encode_cell({ r: i, c: 17 });
          ws[col17].t = "n";
          let col18 = XLSX.utils.encode_cell({ r: i, c: 18 });
          ws[col18].t = "n";
          let col19 = XLSX.utils.encode_cell({ r: i, c: 19 });
          ws[col19].t = "n";
        }
        ws["!ref"] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "业绩列表");

        let time = moment().format("YYYYMMDDHHmm");
        /* generate file and send to client */
        XLSX.writeFile(wb, `用户业绩列表${time}.xlsx`);
      });
    },
  },
};
</script>
