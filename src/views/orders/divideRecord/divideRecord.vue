<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">

        </div>
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="订单编号" prop="order_sn">
              <el-input v-model="queryForm.order_sn" placeholder="请输入订单编号" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="销售代理" prop="username">
              <el-input v-model="queryForm.username" placeholder="请输入销售代理昵称" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select placeholder="不限" name="status" v-model="queryForm.status">
                <el-option label="不限" value=""></el-option>
                <el-option v-for="item in Object.keys(statusTexts)" :label="statusTexts[item]" :value="item"
                  :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="createDate">
              <el-date-picker 
                name="createDate" 
                v-model="queryForm.createDate" 
                :picker-options="pickerOptions"
                type="datetimerange" 
                range-separator="至"
                start-placeholder="开始日期" 
                end-placeholder="结束日期" 
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss" 
                :editable="false"
              ></el-date-picker>
            </el-form-item>
            
            <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
              <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="导出数量" prop="exportNum" title="仅针对导出订单">
              <el-select placeholder="500" name="exportNum" v-model="queryForm.exportNum">
                <el-option label="10" :value="10"></el-option>
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
      </div>
    </div>

    <div class="subpage-content">
      <div v-loading="dataLoading" class="default-container">
        <div class="table-ctrls">
          <div class="table-title">订单分润记录</div>
          <div class="table-ctrl">
            <el-button style="margin-right: 15px;" @click="sgetList">
              <i class="el-icon el-icon-refresh"></i>
            </el-button>
            <template v-if="$auths.includes('excel/divide')">
              <el-button type="primary" @click="exportExcel">导出Excel表格</el-button>
            </template>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="订单编号" width="180" prop="order_sn">
          </el-table-column>
          <el-table-column label="订单金额" prop="total_price" width="80">

          </el-table-column>
          <!-- <el-table-column label="用户账号" width="120" prop="account"></el-table-column> -->
          <el-table-column label="支出奖金" width="80" prop="divide_price"></el-table-column>
          <!-- <el-table-column label="联系方式" width="120" prop="phone"></el-table-column> -->
          <el-table-column label="级别" width="80" prop="level"></el-table-column>
          <el-table-column label="销售代理" width="150" prop="username"></el-table-column>
          <el-table-column label="顶级分润" width="180" prop="divideTopUser">
            <template slot-scope="scope">
              <template v-if="scope.row.divideTopUser && scope.row.divideTopUser.link_user_name">
                {{scope.row.divideTopUser.link_user_name}}({{scope.row.divideTopUser.link_user_phone}}) <br />
                分润￥<span class="error-color">{{scope.row.divideTopUser.real_divide_price || '0.00'}}</span>
              </template>
              <template v-if="!scope.row.divideTopUser || scope.row.divideTopUser.length == 0">
                ——
              </template>
            </template>
          </el-table-column>
          <el-table-column label="分润类型" width="100" prop="type"></el-table-column>
          <el-table-column label="创建时间" width="160" prop="create_time"></el-table-column>
          <el-table-column label="状态" width="80" prop="arrival_status"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <template v-if="$auths.includes('divide/divideRecordDetail')">
                <el-button type="text" size="small" @click="openDetail(scope.row)">详情</el-button>
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

    <el-dialog title="订单详情" width="1200px" :visible.sync="detailVisible">
      <DivideDetail :formData="formData"></DivideDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
  import moment from 'moment';
  import XLSX from 'xlsx';

  import DivideDetail from '@/partialviews/order/divideRecord/DivideDetail';

  import {nTimePickerConfig} from '@/config';

  export default {
    name: 'orders',
    components: {
      DivideDetail
    },
    data() {
      return {
        currentPage: 1,
        count: 1,
        queryForm: {
          order_sn: '',
          username: '',
          status: null,
          createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
          exportPageNum: 1,
          exportNum: 1000
        },
        filter: {
          order_sn: '',
          username: '',
          status: null,
          createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
          exportPageNum: 1,
          exportNum: 1000
        },
        categories: [],
        // '分润金额到账状态 1为到账 2为冻结中 3为退款取消分润 -1为整单被删除',
        statusTexts: {
          [1]: '到账',
          [2]: '冻结中',
          [3]: '退款取消分润',
          [-1]: '整单被删除'
        },
        statusColors: {
          [1]: 'warning-color',
          [5]: 'error-color',
          [6]: 'warning-color',
          [-1]: 'tips-color'
        },
        dataList: [],

        formData: {},
        logisticsData: [],
        logistics: {},
        logisticsCompanys: [],

        detailVisible: false,

        dataLoading: false,
        
        ...nTimePickerConfig
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
          order_sn: '',
          username: '',
          status: null,
          createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

          exportPageNum: 1,
          exportNum: 1000
        };
        this.currentPage = 1;
        this.getList();
      },
      //查询
      queryInfo() {
        this.currentPage = 1;
        this.filter = {
          order_sn: this.queryForm.order_sn,
          username: this.queryForm.username,
          status: this.queryForm.status,
          createDate: this.queryForm.createDate,

          exportPageNum: this.queryForm.exportPageNum,
          exportNum: this.queryForm.exportNum
        }
        this.getList();
      },

      //获取列表
      getList() {
        let queryVal = {
          page: this.currentPage,
          order_sn: this.filter.order_sn,
          username: this.filter.username,
          status: this.filter.status,
          order_belong: 1
        };
        if (this.filter.createDate.length == 2) {
          queryVal.start_time = this.filter.createDate[0];
          queryVal.end_time = this.filter.createDate[1];
        }
        
        this.dataLoading = true;
        this.$get('/admin/divide/divideRecordList', queryVal, res => {
          let dataList = res.data.list || [];

          this.dataList = dataList;
          this.count = res.data.pageTotal;
          this.dataLoading = false;
        }, err => {
          this.dataLoading = false;
        });
      },

      //获取列表
      sgetList() {
        let queryVal = {
          page: this.currentPage,
          order_sn: this.filter.order_sn,
          username: this.filter.username,
          status: this.filter.status,
          order_belong: 1
        };
        if (this.filter.createDate.length == 2) {
          queryVal.start_time = this.filter.createDate[0];
          queryVal.end_time = this.filter.createDate[1];
        }
        
        this.dataLoading = true;
        this.$sget('/admin/divide/divideRecordList', queryVal, res => {
          let dataList = res.data.list || [];

          this.dataList = dataList;
          this.count = res.data.pageTotal;
          this.dataLoading = false;
        }, err => {
          this.dataLoading = false;
        });
      },

      // 分页
      handleCurrentChange(value) {
        this.currentPage = value;
        this.getList();
      },
      openDetail(row) {
        let params = {
          order_sn: row.order_sn
        };

        this.$get('/admin/divide/divideRecordDetail', params, res => {
          this.formData = res.data;
          this.detailVisible = true;
        });
      },

      // 导出excel表格
      exportExcel() {
        let params = {
          order_sn: this.filter.order_sn,
          username: this.filter.username,
          status: this.filter.status,
          order_belong: 1,

          page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
          pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
        }
        if (this.filter.createDate.length == 2) {
          params.start_time = this.filter.createDate[0];
          params.end_time = this.filter.createDate[1];
        }
        if (!params.start_time || !params.end_time) {
          return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
        }

        this.$get('/admin/excel/divide', params, res => {
          let data = res.data.list || '';
          if (data.length == 0) {
            return this.$message.warning('查无数据，请检查');
          }
          if (data.length > 100000) {
            return this.$message.warning('数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
          }

          let excelData = [];
          excelData.push([
            '订单编号', 
            '商品名称', 
            '创建时间', 
            '订单金额', 
            "用户昵称", 
            ...this.chainNodesTitle(),
            '总支出奖金', 
            '状态'
          ]);
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let goodsTitle = [];
            for(let j = 0; j < item.orderAllGoods.length; j++) {
              let attr = Object.values(JSON.parse(item.orderAllGoods[j].specs || '{}')).join('、');
              goodsTitle.push(`${item.orderAllGoods[j].title}(${attr}) ×${item.orderAllGoods[j].count || 0}`);
            }
            excelData.push([
              item.order_sn, 
              goodsTitle.join('； '), 
              item.create_time, 
              item.total_price || '0.00', 
              `${item.order_user_name || ''}(${item.order_user_phone || ''})`, 
              ...this.chainNodesValue(item.divide || []),
              item.divide_price || '0.00', 
              item.arrival_status
            ]);
          }

          // 导出excel
          const ws = XLSX.utils.aoa_to_sheet(excelData);
          ws['!cols'] = [
            {wpx: 140},
            {wpx: 180},
            {wpx: 150},
            {wpx: 80},
            {wpx: 180},
            ...this.chainNodesConfig(),
            {wpx: 100},
            {wpx: 80}
          ]
          const wb = XLSX.utils.book_new();
          let range = XLSX.utils.decode_range(ws['!ref']);
          for (let i = range.s.r + 1; i <= range.e.r; i++) {
            let totalPriceRange = XLSX.utils.encode_cell({
              r: i,
              c: 3
            });
            ws[totalPriceRange].t = 'n';
            
            let dividePriceRange = XLSX.utils.encode_cell({
              r: i,
              c: 32
            });
            ws[dividePriceRange].t = 'n';

            for(let j = 0; j < 9; j++) {
              if(
                !excelData[i][4 + (j + 1) * 3] ||
                excelData[i][4 + (j + 1) * 3] === ''
              ) {
                continue;
              }
              let row = XLSX.utils.encode_cell({
                r: i,
                c: 4 + (j + 1) * 3  //从索引4开始，每第三个空，就是金额
              });
              ws[row].t = 'n';
            }
          }

          ws['!ref'] = XLSX.utils.encode_range(range);

          XLSX.utils.book_append_sheet(wb, ws, "订单分润列表");

          let time = moment().format('YYYYMMDDHHmm');
          /* generate file and send to client */
          XLSX.writeFile(wb, `订单分润列表${time}.xlsx`);
        });
      },

      chainNodesTitle() {
        const arr = [
          ...['第1个Lv1', '分润类型', '支出奖金'],
          ...['第2个Lv1', '分润类型', '支出奖金'],
          ...['第3个Lv1', '分润类型', '支出奖金'],
          ...['第1个Lv2', '分润类型', '支出奖金'],
          ...['第2个Lv2', '分润类型', '支出奖金'],
          ...['第3个Lv2', '分润类型', '支出奖金'],
          ...['第1个Lv3', '分润类型', '支出奖金'],
          ...['第2个Lv3', '分润类型', '支出奖金'],
          ...['第3个Lv3', '分润类型', '支出奖金']
        ];
        return arr;
      },
      chainNodesValue(data) {
        if(data.length == 0) return [
          ...['', '', ''],
          ...['', '', ''],
          ...['', '', ''],
          ...['', '', ''],
          ...['', '', ''],
          ...['', '', ''],
          ...['', '', ''],
          ...['', '', ''],
          ...['', '', '']
        ];
        const arr = [];
        for(let i = 3; i > 0; i--) {
          let info = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
          ];  //每个级别有三人可分润或者获得教育奖金
          for(let j = 0; j < data.length; j++) {
            if(data[j].level == i) {
              info[data[j].level_sort - 1] = [
                `${data[j].link_user_name || ''}(${data[j].link_user_phone || ''})`, 
                data[j].divide_type == 1 ? '销售佣金' : '教育基金', 
                data[j].summary_all_price || '0.00'
              ];
            }
          }
          for(let item of info) {
            arr.push(...item);
          }
        }
        return arr;
      },
      chainNodesConfig() {
        const arr = [];
        for(let i = 0; i < 9; i++) {
          arr.push(
            ...[
              {wpx: 180},
              {wpx: 100},
              {wpx: 80}
            ]
          )
        }
        return arr;
      }


    }
  };

</script>
