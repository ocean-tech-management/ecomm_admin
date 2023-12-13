<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="供应商" label-width="100px" prop="supplier_code">
              <el-select placeholder="请输入供应商名筛选" name="supplier_code" filterable remote :loading="supplierLoading" v-model="queryForm.supplier_code" :remote-method="updateSupplierFilter">
                <el-option label="不限" value></el-option>
                <el-option v-for="item in suppliers" :label="item.name" :value="item.supplier_code" :key="item.supplier_code"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="指定商品">
              <div v-if="(selectGoodsInfo.searGoodsSpuSn && selectGoodsInfo.searGoodsSpuSn.length > 0) || 
                        (selectGoodsInfo.searGoodsSkuSn && selectGoodsInfo.searGoodsSkuSn.length > 0)">
                <span class="sku-select-trigger" @click="showSelectGoods">
                  <template v-if="selectGoodsInfo.type == 1">
                    已选择<span class="warning-color">{{selectGoodsInfo.searGoodsSpuSn.length || 0}}</span>款商品
                  </template>
                  <template v-if="selectGoodsInfo.type == 2">
                    已选择<span class="warning-color">{{selectGoodsInfo.searGoodsSpuSn.length || 0}}</span>款商品，
                    <span class="warning-color">{{selectGoodsInfo.searGoodsSkuSn.length || 0}}</span>个规格
                  </template>
                </span>
                <span class="sku-select-trigge-clear" @click="resetSelectGoods">取消指定</span>
              </div>
              <div v-else class="sku-select-trigger" @click="showSelectGoods">未指定商品</div>
            </el-form-item>
            <el-form-item label="统计时间" prop="createDate">
              <el-date-picker
                v-model="createDate"
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
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">销售情况列表</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('summary/goodsSale')">
              <el-button type="primary" @click="tryExport">导出</el-button>
            </template>
          </div>
        </div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="商品名" prop="title">
          </el-table-column>
          <el-table-column label="总销售量" width="100" prop="total_sku_sell_order_number">
          </el-table-column>
          <el-table-column label="总订单数" width="100" prop="total_sell_order_number">
          </el-table-column>
          <el-table-column label="正常订单数" width="100" prop="normal_order_number">
          </el-table-column>
          <el-table-column label="总金额" width="100" prop="total_price">
          </el-table-column>
          <el-table-column label="售后中数量" width="100" prop="all_order_after_sale_ing_number">
          </el-table-column>
          <el-table-column label="售后中金额" width="100" prop="all_after_sale_ing_price">
          </el-table-column>
          <el-table-column label="已售后订单" width="100" prop="all_order_after_sale_number">
          </el-table-column>
          <el-table-column label="已退款订单" width="100" prop="all_order_refund_number">
          </el-table-column>
          <el-table-column label="已退款金额"	width="100" prop="all_order_refund_price" >
          </el-table-column>
          <el-table-column label="操作" width="60">
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

      <el-dialog title="筛选商品" width="1200px" :close-on-click-modal="false" :visible.sync="selectGoodsVisible">
        <SelectSpus ref="selectGoods"></SelectSpus>
        <div slot="footer" class="dialog-footer">
          <el-button @click="selectGoodsVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmSelectGoods">确 定</el-button>
        </div>
      </el-dialog>


    </div>
  </div>
</template>

<script>
import moment from "moment";
import XLSX from 'xlsx';

import SelectSpus from '@/partialviews/common/SelectSpus';

import {nTimePickerConfig} from '@/config';

export default {
  name: "goodsSale",
  components: {
    SelectSpus
  },
  data() {
    return {
      supplierLoading: false,

      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        supplier_code: '',
        supplier_pay_status: '',
        exportPageNum: 1,
        exportNum: 1000
      },
      filter: {
        keyword: '',
        supplier_code: '',
        supplier_pay_status: '',
        exportPageNum: 1,
        exportNum: 1000,
        start_time: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },

      dataList: [],
      formData: {},
      suppliers: [],
      
      selectGoodsInfo: {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: '',
        searGoodsSkuSn: '',
        title: ''
      },

      afterSaleTexts: {
        [1]: '正常',
        [2]: '申请售后中',
        [3]: '售后中',
        [4]: '售后成功',
        [5]: '售后被拒',
        [-1]: '正常'
      },
      
      supplierPayStatusTexts: {
        [1]: '已对账',
        [2]: ''
      },
      payStatusTexts: {
        [1]: '未支付',
        [2]: '已支付',
        [3]: '未成功支付'
      },
      
      createDate: [moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,

      selectGoodsVisible: false

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
        supplier_code: '',
        exportPageNum: 1,
        exportNum: 1000,
        start_time: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      this.createDate = [moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];

      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum
      };
      if(this.createDate && this.createDate.length == 2) {
        this.filter.start_time = this.createDate[0];
        this.filter.end_time = this.createDate[1];
      }

      this.getList();
    },
    
    getSuppliers(keyword = '') {
      if(!this.$auths.includes('supplier/list')) return;
      let params = {
        keyword: keyword
      }
      
      this.supplierLoading = true;
      this.$sget('/admin/supplier/list', params, res => {
        let data = res.data;
        this.suppliers = data;
        this.supplierLoading = false;
      }, err => {
        this.supplierLoading = false;
      });
    },
    //获取列表
    getList() {
      this.selection = [];

      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        supplier_code: this.filter.supplier_code,
        supplier_pay_status: this.filter.supplier_pay_status,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };


      if(this.selectGoodsInfo.searGoodsSpuSn) queryVal.goods_sn = this.selectGoodsInfo.searGoodsSpuSn;

      this.$post("/admin/summary/goodsSale", queryVal, (res) => {
        let dataList = res.data.list || [];

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].normal_order_number = Math.ceil(dataList[i].total_sell_order_number) - Math.ceil(dataList[i].all_order_after_sale_ing_number) - Math.ceil(dataList[i].all_order_after_sale_number);
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

    updateSelection(e){
      this.selection = e;
    },
    showSelectGoods() {
      this.selectGoodsVisible = true;
    },

    confirmSelectGoods() {
      let selectGoodsInfo = this.$refs.selectGoods.confirmSelectResult();
      if(
        (!selectGoodsInfo.searGoodsSkuSn || selectGoodsInfo.searGoodsSkuSn.length == 0) && 
        (!selectGoodsInfo.searGoodsSpuSn || selectGoodsInfo.searGoodsSpuSn.length == 0)) {
        return this.$message.error('请选择至少一项spu');
      }
      this.selectGoodsInfo = selectGoodsInfo;
      this.selectGoodsVisible = false;
    },
    resetSelectGoods() {
      this.selectGoodsInfo = {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: [],
        searGoodsSkuSn: [],
        selectResults: []
      }
      this.$refs.selectGoods.resetSpuList();
    },

    updateSupplierFilter(keyword) {
      this.getSuppliers(keyword);
    },

    
    tryExport() {
      let params = {
        keyword: this.filter.keyword,
        supplier_code: this.filter.supplier_code,
        supplier_pay_status: this.filter.supplier_pay_status,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time,

        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      
      if (!params.start_time || !params.end_time) {
        return this.$message.error(
          "请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大"
        );
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      if(this.selectGoodsInfo.searGoodsSpuSn) params.goods_sn = this.selectGoodsInfo.searGoodsSpuSn;

      this.$post('/admin/summary/goodsSale', params, res => {
        let dataList = res.data.list || [];
        if(dataList.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(dataList.length > 100000) {
          return this.$message.warning('数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].normal_order_number = Math.ceil(dataList[i].total_sell_order_number) - Math.ceil(dataList[i].all_order_after_sale_ing_number) - Math.ceil(dataList[i].all_order_after_sale_number);
        }

        this.exportExcel(dataList);

      }, err => {
        console.log(err);
      });
    },
    // 导出excel表格
    exportExcel(data) {
      let excelData = [];
      excelData.push([
        "商品名",
        "总销量",
        "总订单数",
        "正常订单数",
        "总金额",
        "售后中数量",
        "售后中金额",
        "已售后订单",
        "已退款订单",
        "已退款金额",
        "筛选时间段"
      ]);
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        excelData.push([
          item.title,
          item.total_sku_sell_order_number,
          item.total_sell_order_number,
          item.normal_order_number,
          item.total_price,
          item.all_order_after_sale_ing_number,
          item.all_after_sale_ing_price,
          item.all_order_after_sale_number,
          item.all_order_refund_number,
          item.all_order_refund_price,
          `${this.filter.start_time} ~ ${this.filter.end_time}`,
        ]);
      };

      // 导出excel
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws["!cols"] = [
        { wpx: 400 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 240 }
      ];
      const wb = XLSX.utils.book_new();
      let range = XLSX.utils.decode_range(ws["!ref"]);
      for (let i = range.s.r + 1; i <= range.e.r; i++) {
        let c1 = XLSX.utils.encode_cell({ r: i, c: 1 });
        ws[c1].t = "n";
        let c2 = XLSX.utils.encode_cell({ r: i, c: 2 });
        ws[c2].t = "n";
        let c3 = XLSX.utils.encode_cell({ r: i, c: 3 });
        ws[c3].t = "n";
        let c4 = XLSX.utils.encode_cell({ r: i, c: 4 });
        ws[c4].t = "n";
        let c5 = XLSX.utils.encode_cell({ r: i, c: 5 });
        ws[c5].t = "n";
        let c6 = XLSX.utils.encode_cell({ r: i, c: 6 });
        ws[c6].t = "n";
        let c7 = XLSX.utils.encode_cell({ r: i, c: 7 });
        ws[c7].t = "n";
        let c8 = XLSX.utils.encode_cell({ r: i, c: 8 });
        ws[c8].t = "n";
        let c9 = XLSX.utils.encode_cell({ r: i, c: 9 });
        ws[c9].t = "n";
      }
      ws["!ref"] = XLSX.utils.encode_range(range);


      XLSX.utils.book_append_sheet(wb, ws, "商品销量列表");

      let time = moment().format("YYYYMMDDHHmm");
      /* generate file and send to client */
      XLSX.writeFile(wb, `商品销量列表${time}.xlsx`);


    }

  },
};
</script>

<style lang="less" scoped>
.order-profit-overviews {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}
.order-profit-overview {
  width: 120px;
  min-width: 120px;
  height: 80px;
  padding: 5px 10px;
  margin-right: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 5px 1px rgba(0,0,0,.1);
}
.order-profit-overview-title {
  margin-top: 10px;
  font-size: 18px;
}
.order-profit-overview-val {
  margin-top: 10px;
  font-size: 16px;
  white-space: nowrap;
}

.sku-select-trigger {
  color: #66b1ff;
  user-select: none;
  cursor: pointer;
}
.sku-select-trigge-clear {
  margin-left: 10px;
  color: #f00;
  user-select: none;
  cursor: pointer;
}


</style>