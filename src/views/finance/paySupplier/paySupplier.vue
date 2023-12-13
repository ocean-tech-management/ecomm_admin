<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
            <el-form-item label="订单号" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入订单号" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="供应商" label-width="100px" prop="supplier_code">
              <el-select placeholder="请输入供应商名筛选" name="supplier_code" filterable remote :loading="supplierLoading" v-model="queryForm.supplier_code" :remote-method="updateSupplierFilter">
                <el-option label="不限" value></el-option>
                <el-option v-for="item in suppliers" :label="item.name" :value="item.supplier_code" :key="item.supplier_code"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="对账状态" prop="supplier_pay_status">
              <el-select placeholder="不限" name="supplier_pay_status" v-model="queryForm.supplier_pay_status">
                <el-option label="不限" value></el-option>
                <el-option label="已结账" :value="1"></el-option>
                <el-option label="未结账" :value="2"></el-option>
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
            <el-form-item label="下单时间" prop="createDate">
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
            <el-form-item label="发货时间" prop="deliveryDate">
              <el-date-picker
                v-model="deliveryDate"
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
          <div class="table-title">对账列表</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('order/correctionCreate')">
              <el-button type="primary" @click="showImportCorrectOrders">批量调整金额</el-button>
            </template>
            <template v-if="$auths.includes('supplier/payGoods') || $auths.includes('supplier/afterPayRefund')">
              <el-button type="primary" @click="showImportOrders">导入操作订单</el-button>
            </template>
            <template v-if="$auths.includes('supplier/payList')">
              <el-button type="primary" :disabled="selection.length == 0" @click="tryQuicklyExport">导出选中的数据</el-button>
            </template>
            <template v-if="$auths.includes('supplier/payList')">
              <el-button type="primary" :disabled="dataList.length == 0" @click="exportExcel">一键导出所有数据</el-button>
            </template>
            <template v-if="$auths.includes('supplier/payList')">
              <el-button type="primary" :disabled="selection.length == 0" @click="tryQuicklyFill">批量操作</el-button>
            </template>
            <template v-if="$auths.includes('supplier/payList')">
              <el-button type="primary" :disabled="dataList.length == 0" @click="showFillRecord('all')">一键对所有数据操作</el-button>
            </template>
          </div>
        </div>

        
        <div class="order-profit-overviews">
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">总销售金额</div>
            <div class="order-profit-overview-val">{{summary.allSellPrice}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">总订单数</div>
            <div class="order-profit-overview-val">{{summary.allSellOrderNumber}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">退售后中订单</div>
            <div class="order-profit-overview-val">{{summary.allOrderAfterSaleIngNumber}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">已退售后订单</div>
            <div class="order-profit-overview-val">{{summary.allOrderAfterSaleNumber}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">已退金额</div>
            <div class="order-profit-overview-val">{{summary.allOrderRefundPrice}}</div>
          </div>
        </div>

        <el-table style="width: 100%" :data="dataList" @selection-change="updateSelection">
          <el-table-column type="selection" label="序号" width="80" prop="id"></el-table-column>
          <el-table-column label="商品名" prop="title">
          </el-table-column>
          <el-table-column label="总销售量" width="100" prop="total_sku_sell_order_number">
          </el-table-column>
          <el-table-column label="总订单数" width="100" prop="total_sell_order_number">
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
          <el-table-column label="操作" width="120" fixed="right">
            <template slot-scope="scope">
              <template v-if="$auths.includes('supplier/payList')">
                <el-button type="text" size="small" @click="showFillRecord('piece', scope.row)">操作</el-button>
              </template>
            </template>
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

      <el-dialog title="对账订单操作" width="1300px" :close-on-click-modal="false"  :visible.sync="fillRecordVisible">
        <fillPayRecord ref="fill" :formData="formData"></fillPayRecord>
        <div slot="footer" class="dialog-footer">
          <el-button @click="fillRecordVisible = false">取 消</el-button>
          
          <template v-if="$auths.includes('supplier/payGoods')">
            <el-button v-if="formData.ctrlType == 1" type="primary" @click="confirmFillAll">一键对所有数据对账</el-button>
          </template>
          <template v-if="$auths.includes('supplier/afterPayRefund')">
            <el-button v-if="formData.ctrlType == 2" type="primary" @click="confirmFillAllRefund">一键对所有数据退款结算</el-button>
          </template>
        </div>
      </el-dialog>

      <el-dialog title="筛选商品" width="1200px" :close-on-click-modal="false" :visible.sync="selectGoodsVisible">
        <SelectSpus ref="selectGoods"></SelectSpus>
        <div slot="footer" class="dialog-footer">
          <el-button @click="selectGoodsVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmSelectGoods">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="导入待操作订单" width="900px" :close-on-click-modal="false" :visible.sync="importOrdersVisible">
        <ImportOrders ref="importOrders"></ImportOrders>
        <div slot="footer" class="dialog-footer">
          <el-button @click="importOrdersVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmSelectImportOrders">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="导入待批量调整金额订单" width="900px" :close-on-click-modal="false" :visible.sync="importCorrectOrdersVisible">
        <ImportCorrectOrders ref="importCorrectOrders"></ImportCorrectOrders>
        <div slot="footer" class="dialog-footer">
          <el-button @click="importCorrectOrdersVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmSelectCorrectOrders">确 定</el-button>
        </div>
      </el-dialog>


    </div>
  </div>
</template>

<script>
import moment from "moment";
import XLSX from "xlsx";

import SelectSpus from '@/partialviews/common/SelectSpus';

import fillPayRecord from "@/partialviews/finance/paySupplier/fillPayRecord";

import ImportOrders from '@/partialviews/finance/paySupplier/ImportOrders';
import ImportCorrectOrders from '@/partialviews/finance/paySupplier/ImportCorrectOrders';

import {nTimePickerConfig} from '@/config';

export default {
  name: "orderProfit",
  components: {
    fillPayRecord,
    SelectSpus,
    ImportOrders,
    ImportCorrectOrders
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
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        delivery_start_time: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
        delivery_end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },

      dataList: [],
      summary: {
        allSellPrice: '——',
        allSellOrderNumber: '——',
        allOrderAfterSaleIngNumber: '——',
        allOrderAfterSaleNumber: '——',
        allOrderRefundPrice: '——'
      },
      selection: [],
      formData: {},
      suppliers: [],
      
      selectGoodsInfo: {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: '',
        searGoodsSkuSn: '',
        title: ''
      },

      supplierPayStatusTexts: {
        [1]: '已对账',
        [2]: '未对账'
      },
      afterSaleTexts: {
        [1]: '正常',
        [2]: '申请售后中',
        [3]: '售后中',
        [4]: '售后成功',
        [5]: '售后被拒',
        [-1]: '正常'
      },
      payStatusTexts: {
        [1]: '未支付',
        [2]: '已支付',
        [3]: '未成功支付'
      },
      shippingStatusText: {
        [1]: '未发货',
        [2]: '备货中',
        [3]: '已发货'
      },
      
      ctrlTypeTexts: {
        [1]: '对账',
        [2]: '对账后退款结算'
      },
      
      createDate: [moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      deliveryDate: [],
      ...nTimePickerConfig,

      fillRecordVisible: false,
      selectGoodsVisible: false,
      
      importOrdersVisible: false, //导入订单
      importCorrectOrdersVisible: false,  //导入需要批量调整金额

    };
  },
  mounted() {
    this.getList();
    this.getSummary();
  },
  methods: {
    reloadPage() {
      this.getList();
      this.getSummary();
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
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        delivery_start_time: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
        delivery_end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      this.createDate = [moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
      this.deliveryDate = [];

      this.currentPage = 1;
      this.getList();
      this.getSummary();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        supplier_code: this.queryForm.supplier_code,
        supplier_pay_status: this.queryForm.supplier_pay_status,
        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum
      };
      if(this.createDate && this.createDate.length == 2) {
        this.filter.start_time = this.createDate[0];
        this.filter.end_time = this.createDate[1];
      }
      if(this.deliveryDate && this.deliveryDate.length == 2) {
        this.filter.delivery_start_time = this.deliveryDate[0];
        this.filter.delivery_end_time = this.deliveryDate[1];
      }

      this.getList();
      this.getSummary();
    },
    
    getSuppliers(keyword = '') {
      if(!this.$auths.includes('supplier/list')) return;
      let params = {
        keyword: keyword
      }
      
      this.supplierLoading = true;
      this.$sget('/admin/supplier/list', params, res => {
        let data = res.data;
        // this.formData.supplier_code = data[0].supplier_code;
        this.suppliers = data;
        this.supplierLoading = false;
      }, err => {
        this.supplierLoading = false;
      });
    },
    getSummary() {
      if (!this.$auths.includes("goods/spuSaleSummary")) return;
      let params = {
        keyword: this.filter.keyword,
        supplier_code: this.queryForm.supplier_code,
        supplier_pay_status: this.filter.supplier_pay_status,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time,
        delivery_start_time: this.filter.delivery_start_time,
        delivery_end_time: this.filter.delivery_end_time
      };
      
      if(this.selectGoodsInfo.searGoodsSpuSn) params.goods_sn = this.selectGoodsInfo.searGoodsSpuSn;

      this.$spost("/admin/goods/spuSaleSummary", params, (res) => {
        let data = res.data;
        if(data && !data.allSellPrice) data = null;
        this.summary = data || {
          allSellPrice: '——',
          allSellOrderNumber: '——',
          allOrderAfterSaleIngNumber: '——',
          allOrderAfterSaleNumber: '——',
          allOrderRefundPrice: '——'
        };
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
        end_time: this.filter.end_time,
        delivery_start_time: this.filter.delivery_start_time,
        delivery_end_time: this.filter.delivery_end_time
      };


      if(this.selectGoodsInfo.searGoodsSpuSn) queryVal.goods_sn = this.selectGoodsInfo.searGoodsSpuSn;

      this.$post("/admin/goods/spuSaleList", queryVal, (res) => {
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

    tryQuicklyFill() {
      if(!this.selection.length || this.selection.length == 0) {
        return this.$message.error('还没选中任何项哦');
      }
      let row = {
        skuSnList: []
      }
      for(let i = 0; i < this.selection.length; i++) {
        row.skuSnList.push(...this.selection[i].skuSnList);
      }
      this.showFillRecord('piece', row)
    },

    showFillRecord(type = 'piece', row = {}) {
      
      let formData = {
        keyword: this.filter.keyword,
        
        supplier_pay_remark: '',
        supplier_pay_no: '',
        skuSnList: [],
        start_time: this.filter.start_time,
        end_time: this.filter.end_time,
        delivery_start_time: this.filter.delivery_start_time,
        delivery_end_time: this.filter.delivery_end_time
      }
      if(this.$auths.includes('supplier/payGoods')) {
        formData.ctrlType = 1;
      } else if(this.$auths.includes('supplier/afterPayRefund')) {
        ctrlType = 2;
      }

      this.formData = {};


      if(type == 'all') {
        if(this.dataList.length == 0) {
          return this.$message.error('筛选条件下无可操作性项');
        }
        this.getAllOrders(skuSnList => {
          formData.skuSnList = skuSnList;
          this.formData = formData;
          this.$forceUpdate();
          this.fillRecordVisible = true;
          this.$nextTick(() => {
            if(this.$refs.fill) this.$refs.fill.resetList();
          })
        })
      } else {
        formData.skuSnList = row.skuSnList;
        this.formData = formData;
        this.$forceUpdate();
        this.fillRecordVisible = true;
        this.$nextTick(() => {
          if(this.$refs.fill) this.$refs.fill.resetList();
        })
      }

    },
    getAllOrders(handler) {
      let params = {
        keyword: this.filter.keyword,
        supplier_code: this.filter.supplier_code,
        supplier_pay_status: this.filter.supplier_pay_status,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time,
        delivery_start_time: this.filter.delivery_start_time,
        delivery_end_time: this.filter.delivery_end_time
      };

      if(this.selectGoodsInfo.searGoodsSpuSn) params.goods_sn = this.selectGoodsInfo.searGoodsSpuSn;

      this.$post("/admin/goods/spuSaleList", params, res => {
        let dataList = res.data || [];
        let skuSnList = [];
        for(let i = 0; i < dataList.length; i++) {
          skuSnList.push(...dataList[i].skuSnList);
        }
        if(handler && typeof handler == 'function') handler(skuSnList);
      });
    },

    confirmFillAll() {
      
      if(!this.formData.supplier_pay_no || this.formData.supplier_pay_no === '') {
        return this.$message.error('还没填写对账流水号哦');
      } else if(!this.formData.supplier_pay_remark || this.formData.supplier_pay_remark === '') {
        return this.$message.error('还没填写对账备注哦');
      }
      let params = {
        supplier_pay_no: this.formData.supplier_pay_no, 
        supplier_pay_remark: this.formData.supplier_pay_remark
      };
      this.opreateOrders(params, '/admin/supplier/payGoods');
                
    },

    confirmFillAllRefund() {
      if(!this.formData.supplier_refund_after_pay_price || this.formData.supplier_refund_after_pay_price === '') {
        return this.$message.error('还没填写对账后退款结算金额');
      } else if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.supplier_refund_after_pay_price)) {
        return this.$message.error('对账后退款结算金额格式有误，请检查');
      } else if(!this.formData.supplier_refund_after_pay_no || this.formData.supplier_refund_after_pay_no === '') {
        return this.$message.error('还没填写对账后退款结算流水号');
      } else if(!this.formData.supplier_refund_after_pay_remark || this.formData.supplier_refund_after_pay_remark === '') {
        return this.$message.error('还没填写对账后退款结算备注');
      }
      let params = {
        supplier_refund_after_pay_price: this.formData.supplier_refund_after_pay_price, 
        supplier_refund_after_pay_no: this.formData.supplier_refund_after_pay_no, 
        supplier_refund_after_pay_remark: this.formData.supplier_refund_after_pay_remark
      };
      this.opreateOrders(params, '/admin/supplier/afterPayRefund');
    },

    opreateOrders(appendArgs, url) {
      let params = {
        keyword: this.filter.keyword,
        supplier_code: this.filter.supplier_code,
        supplier_pay_status: this.filter.supplier_pay_status,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time,
        delivery_start_time: this.filter.delivery_start_time,
        delivery_end_time: this.filter.delivery_end_time
      }
      if(this.selectGoodsInfo.searGoodsSkuSn || this.formData.skuSnList) params.goods_sku = this.formData.skuSnList;

      this.$post('/admin/supplier/payList', params, res => {
        let dataList = res.data || [];
        if(dataList.length == 0) {
          return this.$message.error('无可一键操作的项哦')
        }

        this.$confirm(`确定对这${dataList.length || 0}个订单进行${this.ctrlTypeTexts[this.formData.ctrlType]}操作吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let payParams = {
            type: 2,
            searOrder: {
              keyword: this.filter.keyword,
              supplier_code: this.filter.supplier_code,
              supplier_pay_status: this.filter.supplier_pay_status,
              goods_sku: this.formData.skuSnList
            },
            ...appendArgs,
            start_time: this.filter.start_time,
            end_time: this.filter.end_time,
            delivery_start_time: this.filter.delivery_start_time,
            delivery_end_time: this.filter.delivery_end_time
          };

          this.$post(url, payParams, res => {
            this.$message.success(`执行${this.ctrlTypeTexts[this.formData.ctrlType]}操作成功`);
            this.fillRecordVisible = false;
            this.reloadPage();
          });
        }).catch(() => {});
      }, err => {
        console.log(err);
      });
    },

    
    // 打开导入订单弹窗
    showImportOrders() {
      this.importOrdersVisible = true;
      this.$nextTick(() => {
        if(this.$refs.importOrders) this.$refs.importOrders.resetFiles();
      })
    },
    // 批量对账
    confirmSelectImportOrders() {
      let result = this.$refs.importOrders.getSelectResult();
      if(!result) return;
      let selectResult = result.selectResult;
      if(selectResult.length == 0) {
        return this.$message.error('未检查到任何导入数据')
      }

      this.$confirm(`确定对导入的这${selectResult.length || 0}个订单进行${result.ctrlType == 1 ? '对账' : '对账后退款结算'}操作吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let payParams = {
          type: 3,
          allOrder: [
            ...selectResult
          ]
        };
        let path = result.ctrlType == 1 ? '/admin/supplier/payGoods' : '/admin/supplier/afterPayRefund';  //1对账操作，2对账后退款结算操作

        this.$post(path, payParams, res => {
          this.$message.success(`对导入的订单执行${result.ctrlType == 1 ? '对账' : '对账后退款结算'}操作成功`);
          this.importOrdersVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },

    showImportCorrectOrders() {
      this.importCorrectOrdersVisible = true;
      this.$nextTick(() => {
        if(this.$refs.importCorrectOrders) this.$refs.importCorrectOrders.resetFiles();
      })
    },
    confirmSelectCorrectOrders() {
      let result = this.$refs.importCorrectOrders.getSelectResult();
      if(!result) return;
      let selectResult = result.selectResult;
      if(selectResult.length == 0) {
        return this.$message.error('未检查到任何导入数据')
      }
      
      this.$confirm(`确定对导入的这${result.len || 0}个订单（其中将产生${selectResult.length || 0}项调整记录）进行调整金额操作吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = selectResult.slice(0);

        this.$post('/admin/order/correctionCreate', params, res => {
          this.$message.success(`对导入的订单执行调整金额操作成功`);
          this.importCorrectOrdersVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },


    // 导出
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        supplier_pay_status: this.filter.supplier_pay_status,
        goods_sku: [],

        start_time: this.filter.start_time,
        end_time: this.filter.end_time,
        delivery_start_time: this.filter.delivery_start_time,
        delivery_end_time: this.filter.delivery_end_time,
        
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

      this.getAllOrders(skuSnList => {
        params.goods_sku = skuSnList;
        this.$post('/admin/supplier/payList', params, res => {
          let dataList = res.data.list || [];
          if(dataList.length == 0) {
            return this.$message.warning('查无数据，请检查');
          }
          if(dataList.length > 100000) {
            return this.$message.warning('数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
          }
          for(let i = 0; i < dataList.length; i++) {
            let specs = JSON.parse(dataList[i].specs);
            let attr = Object.values(specs);
            let attrInfo = attr.join('、');
            let name = `${dataList[i].title}（${attrInfo}）`;
            dataList[i].name = name;
            dataList[i].attrs = attrInfo;
          }
          this.tryExport(dataList);

        }, err => {
          console.log(err);
        });
      })
    },
    tryQuicklyExport() {
      let params = {
        keyword: this.filter.keyword,
        supplier_pay_status: this.filter.supplier_pay_status,
        goods_sku: [],
        
        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      if(this.createDate && this.createDate.length == 2) {
        params.start_time = this.createDate[0];
        params.end_time = this.createDate[1];
      }
      if(this.deliveryDate && this.deliveryDate.length == 2) {
        params.delivery_start_time = this.deliveryDate[0];
        params.delivery_start_time = this.deliveryDate[1];
      }
      
      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }
      for(let i = 0; i < this.selection.length; i++) {
        params.goods_sku.push(...this.selection[i].skuSnList);
      }
      this.$post('/admin/supplier/payList', params, res => {
        let dataList = res.data.list || [];
        if(dataList.length == 0) {
          return this.$message.error('筛选条件下无可导出的项');
        }
        for(let i = 0; i < dataList.length; i++) {
          let specs = JSON.parse(dataList[i].specs);
          let attr = Object.values(specs);
          let attrInfo = attr.join('、');
          let name = `${dataList[i].title}（${attrInfo}）`;
          dataList[i].name = name;
          dataList[i].attrs = attrInfo;
        }
        this.tryExport(dataList);

      }, err => {
        console.log(err);
      });
    },
    
    // 按订单导出
    /**
     * @param data 源数据
     */
    tryExport(data) {
      let excelData = [];
      excelData.push([
        "订单编号",
        "下单时间",
        "物流编号",
        "商品名称",
        "属性",
        "产品编号",
        "商品编号",
        "数量",
        "用户实付金额",
        "运费",
        "成本单价",
        "成本总计",
        "支付运费",
        "售后应扣供应商金额",
        "对账成本调整",
        "应付总计",
        "退售后中金额",
        "已退金额",
        "供应商名称",
        "订单状态",
        "售后提交时间",
        "货款结算状态",
        "结算时间",
        "结算流水号",
        "对账后退款结算金额",
        "对账后退款结算流水号",
        "结算备注",
        "对账后退款结算备注",
      ]);
      
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let row = [
          item.order_sn,
          item.create_time,
          item.shipping_code || '',
          item.title || '',
          item.attrs || '',
          item.goods_sn || '',
          item.sku_sn || '',
          item.count || '0',
          item.real_pay_price || '0.00',
          item.total_fare_price || '0.00',
          item.cost_price || '0.00',
          item.total_cost_price || '0.00',
          item.correction_fare || '0.00',
          item.correction_supplier || '0.00',
          item.correction_cost || '0.00',
          item.total_payable || '0.00',
          item.after_sale_ing_price || '0.00',
          item.refund_price || '0.00',
          item.supplier_name || '',
          this.getRowStatus(item),
          item.after_sale_create_time || '',
          this.supplierPayStatusTexts[item.supplier_pay_status],
          item.supplier_pay_time || '',
          item.supplier_pay_no || '',
          item.supplier_refund_after_pay_no && item.supplier_refund_after_pay_price ? item.supplier_refund_after_pay_price : '',
          item.supplier_refund_after_pay_no,
          item.supplier_pay_remark || '',
          item.supplier_refund_after_pay_remark || ''
        ]
        
        excelData.push(row);
      }


      // 导出excel
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws["!cols"] = [
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 120 },
        { wpx: 350 },
        { wpx: 200 },
        { wpx: 100 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 110 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 140 },
        { wpx: 100 },
        { wpx: 120 },
        { wpx: 120 },
        { wpx: 140 },
        { wpx: 120 },
        { wpx: 120 },
        { wpx: 130 },
        { wpx: 120 },
        { wpx: 120 }
      ];
      const wb = XLSX.utils.book_new();
      let range = XLSX.utils.decode_range(ws["!ref"]);
      for (let i = range.s.r + 1; i <= range.e.r; i++) {
        let c7 = XLSX.utils.encode_cell({ r: i, c: 7 });
        ws[c7].t = "n";
        let c8 = XLSX.utils.encode_cell({ r: i, c: 8 });
        ws[c8].t = "n";
        let c9 = XLSX.utils.encode_cell({ r: i, c: 9 });
        ws[c9].t = "n";
        let c10 = XLSX.utils.encode_cell({ r: i, c: 10 });
        ws[c10].t = "n";
        let c11 = XLSX.utils.encode_cell({ r: i, c: 11 });
        ws[c11].t = "n";
        let c12 = XLSX.utils.encode_cell({ r: i, c: 12 });
        ws[c12].t = "n";
        let c13 = XLSX.utils.encode_cell({ r: i, c: 13 });
        ws[c13].t = "n";
        let c14 = XLSX.utils.encode_cell({ r: i, c: 14 });
        ws[c14].t = "n";
        let c15 = XLSX.utils.encode_cell({ r: i, c: 15 });
        ws[c15].t = "n";
        let c16 = XLSX.utils.encode_cell({ r: i, c: 16 });
        ws[c16].t = "n";
        let c17 = XLSX.utils.encode_cell({ r: i, c: 17 });
        ws[c17].t = "n";
        if(excelData[i][24] && excelData[i][24] !== '') {
          let c24 = XLSX.utils.encode_cell({ r: i, c: 24 });
          ws[c24].t = "n";
        }
      }
      ws["!ref"] = XLSX.utils.encode_range(range);


      XLSX.utils.book_append_sheet(wb, ws, "订单对账列表");

      let time = moment().format("YYYYMMDDHHmm");
      /* generate file and send to client */
      XLSX.writeFile(wb, `订单对账列表${time}.xlsx`);
    },
    getRowStatus(item) {
      let status = '';
      if(item.pay_status == 2) {
        // 给了钱了
        if(item.after_status == 1) {
          // 正常订单
          status = this.shippingStatusText[item.shipping_status];
        } else {
          // 退售后订单
          status = this.afterSaleTexts[item.after_status];
        }
      } else {
        status = this.payStatusTexts[item.pay_status];
      }
      return status;
    }

  },
};
</script>

<style lang="less" scoped>
.table-ctrl {
  .el-button {
    margin-top: 5px;
  }
}

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