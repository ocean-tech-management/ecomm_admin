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
                type="datetimerange" 
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期" 
                end-placeholder="结束日期" 
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss" 
                :editable="false"
              ></el-date-picker>
            </el-form-item>
             <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出拼拼订单">
              <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="导出数量" prop="exportNum" title="仅针对导出拼拼订单">
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
      </div>
    </div>

    <div class="subpage-content">
      <div v-loading="dataLoading" class="default-container">
        <div class="table-ctrls">
          <div class="table-title">拼拼收益记录</div>
          <div class="table-ctrl">
            <el-button style="margin-right: 15px;" @click="sgetList">
              <i class="el-icon el-icon-refresh"></i>
            </el-button>
            <template v-if="$auths.includes('excel/ppylReward')">
              <el-button type="primary" @click="exportExcel">导出Excel表格</el-button>
            </template>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="订单编号" width="180" prop="order_sn">
          </el-table-column>
          <el-table-column label="订单金额" prop="total_price" width="80">
          </el-table-column>
          <el-table-column label="受益用户" width="120" prop="orderUserName"></el-table-column>
          <el-table-column label="订单用户" width="120" prop="userName"></el-table-column>
          <el-table-column label="支出奖金" width="80" prop="reward_price"></el-table-column>
          <!-- <el-table-column label="联系方式" width="120" prop="phone"></el-table-column> -->
          <el-table-column label="级别" width="80" prop="level"></el-table-column>
         
          <el-table-column label="分润类型" width="100" prop="type"></el-table-column>
          <el-table-column label="创建时间" width="160" prop="create_time"></el-table-column>
          <el-table-column label="状态" width="80" prop="arrival_status"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <template v-if="$auths.includes('ppyl/rewardDetail')">
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

  import DivideDetail from '@/partialviews/ppyl/reward/RewardDetail';

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
          createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
          
          exportPageNum: 1,
          exportNum: 1000,
        },
        filter: {
          order_sn: '',
          username: '',
          status: null,
          createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
          
          exportPageNum: 1,
          exportNum: 1000,
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
          createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
          
          exportPageNum: 1,
          exportNum: 1000,
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
          exportNum: this.queryForm.exportNum,
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
        this.$get('/admin/ppyl/reward', queryVal, res => {
          let dataList = res.data.list || [];
          
          for(let i = 0; i < dataList.length; i++) {
            dataList[i].userName = dataList[i].user.name;
            dataList[i].orderUserName = dataList[i].orderUser.name;
          }

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

        this.$get('/admin/ppyl/rewardDetail', params, res => {
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
        
          page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
          pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈

          order_belong: 1
        }
        if (this.filter.createDate.length == 2) {
          params.start_time = this.filter.createDate[0];
          params.end_time = this.filter.createDate[1];
        }
        if (!params.start_time || !params.end_time) {
          return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
        }

        this.$get('/admin/excel/ppylReward', params, res => {
          let data = res.data.list || [];
          if (data.length == 0) {
            return this.$message.warning('查无数据，请检查');
          }
          if (data.length > 100000) {
            return this.$message.warning('数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
          }
          
          for(let i = 0; i < data.length; i++) {
            data[i].userName = `${data[i].user.name}(${data[i].user.phone})`;
          }

          let excelData = [];
          excelData.push([
            '订单编号', 
            '商品名称', 
            '创建时间',  
            '订单金额', 
            '订单用户', 
            '用户奖金', 
            '状态', 
            '直推上级', 
            '直推奖金', 
            '直推奖金状态', 
            '间推上级', 
            '间推奖金', 
            '间推奖金状态',
            '奖金合计',
          ]);
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            excelData.push([
              item.order_sn, 
              item.orderGoods ? item.orderGoods.title : '', 
              item.create_time, 
              item.total_price,
              item.userName,
              item.myself_reward_price || '0.00', 
              item.arrival_status,
              ...this.topUserReward(item.topUserOrder || []),
              item.reward_price || '0.00',
            ]);
          }

          // 导出excel
          const ws = XLSX.utils.aoa_to_sheet(excelData);
          ws['!cols'] = [
            {wpx: 140},
            {wpx: 180},
            {wpx: 140},
            {wpx: 80},
            {wpx: 130},
            {wpx: 80},
            {wpx: 80},
            {wpx: 130},
            {wpx: 80},
            {wpx: 80},
            {wpx: 130},
            {wpx: 80},
            {wpx: 80},
          ]
          const wb = XLSX.utils.book_new();
          let range = XLSX.utils.decode_range(ws['!ref']);
          for (let i = range.s.r + 1; i <= range.e.r; i++) {
            let row3 = XLSX.utils.encode_cell({
              r: i,
              c: 3
            });
            ws[row3].t = 'n';
            let row5 = XLSX.utils.encode_cell({
              r: i,
              c: 5
            });
            ws[row5].t = 'n';

            if(excelData[i][8] && excelData[i][8] !== '') {
              let row8 = XLSX.utils.encode_cell({
                r: i,
                c: 8
              });
              ws[row8].t = 'n';
            }
            if(excelData[i][11] && excelData[i][11] !== '') {
              let row11 = XLSX.utils.encode_cell({
                r: i,
                c: 11
              });
              ws[row11].t = 'n';
            }
            if(excelData[i][13] && excelData[i][13] !== '') {
              let row13 = XLSX.utils.encode_cell({
                r: i,
                c: 13
              });
              ws[row13].t = 'n';
            }

          }
          ws['!ref'] = XLSX.utils.encode_range(range);

          XLSX.utils.book_append_sheet(wb, ws, "拼拼收益列表");

          let time = moment().format('YYYYMMDDHHmm');
          /* generate file and send to client */
          XLSX.writeFile(wb, `拼拼收益列表${time}.xlsx`);
        });
      },
      topUserReward(data) {
        let arr = ['','','','','',''];
        if(!data || data.length == 0) return arr;
        for(let i = 0; i < data.length; i++) {
          if(data[i] && data[i].vdc_level == 1) {
            let item = [
              `${data[i].name || ''}(${data[i].phone})`,
              data[i].reward_price || '0.00',
              data[i].freed_status == -1 ? '已失效' : (data[i].arrival_status || '')
            ]
            arr.splice(0, 3, ...item);
            continue;
          }
          if(data[i] && data[i].vdc_level == 2) {
            let item = [
              `${data[i].name || ''}(${data[i].phone})`,
              data[i].reward_price || '0.00',
              data[i].freed_status == -1 ? '已失效' : (data[i].arrival_status || '')
            ]
            arr.splice(3, 3, ...item);
            continue;
          }
        }
        return arr;

      }



    }
  };

</script>
