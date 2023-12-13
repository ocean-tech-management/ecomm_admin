<template>
  <div>
    
    <el-form label-width="160px">
      <el-form-item label="操作类型">
        <!-- 拥有多种操作权限 -->
        <el-select v-if="$auths.includes('supplier/payGoods') && $auths.includes('supplier/afterPayRefund')" style="width: 220px" placeholder="选择类型" name="type" v-model="formData.ctrlType" @change="changeCtrlType">
          <el-option label="对账操作" :value="1"></el-option>
          <el-option label="对账后退款结算操作" :value="2"></el-option>
        </el-select>
        <!-- 仅有对账或退款记录权限 -->
        <div v-else :class="ctrlTypeClass[formData.ctrlType]">{{ctrlTypeTexts[formData.ctrlType]}}</div>
      </el-form-item>
    </el-form>
    <el-form :model="formData" label-width="160px">
      <template v-if="formData.ctrlType == 1">
        <el-form-item label="支付流水号" prop="supplier_pay_no" >
          <el-input style="width: 300px" auto-complete="off" placeholder="填一下" v-model="formData.supplier_pay_no"></el-input>
        </el-form-item>
        <el-form-item label="对账备注" prop="supplier_pay_remark" >
          <el-input style="width: 300px" auto-complete="off" placeholder="填一下" v-model="formData.supplier_pay_remark"></el-input>
        </el-form-item>
      </template>
      <template v-if="formData.ctrlType == 2">
        <el-form-item label="对账后退款结算金额" prop="supplier_refund_after_pay_price" >
          <el-input style="width: 300px" auto-complete="off" placeholder="填一下" v-model="formData.supplier_refund_after_pay_price"></el-input>
        </el-form-item>
        <el-form-item label="对账后退款结算流水号" prop="supplier_refund_after_pay_no" >
          <el-input style="width: 300px" auto-complete="off" placeholder="填一下" v-model="formData.supplier_refund_after_pay_no"></el-input>
        </el-form-item>
        <el-form-item label="对账后退款结算备注" prop="supplier_refund_after_pay_remark" >
          <el-input style="width: 300px" auto-complete="off" placeholder="填一下" v-model="formData.supplier_refund_after_pay_remark"></el-input>
        </el-form-item>
      </template>

      
      <el-form-item label="订单筛选" >
        <el-radio-group v-model="supplier_pay_status" @change="updateStatusFilter">
          <el-radio label>不限</el-radio>
          <el-radio :label="1">已对账</el-radio>
          <el-radio :label="2">未对账</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="" label-width="0" >
        <el-table ref="relationsTable" style="width: 100%" :data="dataList"  @selection-change="updateSelection">
          <el-table-column type="selection" label="序号" width="60" prop="id"></el-table-column>

          <el-table-column label="订单号" prop="order_sn" width="180">
          </el-table-column>
          <el-table-column label="商品名称" prop="title" width="180">
          </el-table-column>
          <el-table-column label="规格" prop="attrs" width="150">
          </el-table-column>
          <el-table-column label="总数" width="60" prop="count">
          </el-table-column>
          <el-table-column label="总成本" width="80" prop="total_cost_price">
          </el-table-column>
          <el-table-column label="运费" width="60" prop="total_fare_price">
          </el-table-column>
          <el-table-column label="商品总价" width="80" prop="total_price">
          </el-table-column>
          <el-table-column label="退售后中金额" width="110" prop="after_sale_ing_price">
          </el-table-column>
          <el-table-column label="已退金额" width="80" prop="refund_price">
          </el-table-column>
          <el-table-column label="对账状态" width="90" align="center">
            <template slot-scope="scope">
              <div>{{supplierPayStatusTexts[scope.row.supplier_pay_status]}}</div>
              <div v-if="scope.row.supplier_refund_after_pay_no" class="warning-color">退款结算</div>
              
            </template>
          </el-table-column>
          
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button v-if="scope.row.supplier_pay_status == 1" type="text" size="default" @click="openPayInfo(scope.row)">查看对账信息</el-button>
              
              <template v-if="$auths.includes('order/correctionCreate')">
                <el-button type="text" size="default" @click="showCorrectInfo(scope.row)">调整金额</el-button>
              </template>
              <template v-if="$auths.includes('order/correctionCreate')">
                <el-button type="text" size="default" @click="showCorrectHistorys(scope.row)">查看调整记录</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div v-show="dataList && dataList.length > 0" class="pagination">
          <el-pagination
            :total="totalCount"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :pager-count="7"
            @size-change="handleSizeChange"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="pageCount"
            layout="total, sizes, prev, pager, next"
            :page-count="count"
          ></el-pagination>
        </div>
      </el-form-item>

    </el-form>
    
    <div class="table-bottom-ctrls">
      <template v-if="$auths.includes('supplier/payGoods') && formData.ctrlType == 1">
        <el-button type="primary" :disabled="selection.length == 0" @click="quicklyFillRecord">批量对账</el-button>
      </template>
      <template v-if="$auths.includes('supplier/afterPayRefund') && formData.ctrlType == 2">
        <el-button type="primary" :disabled="selection.length == 0" @click="quicklyFillRefundRecord">批量对账后退款结算</el-button>
      </template>
      <span v-if="selection.length > 0" style="margin-left: 10px; font-size: 12px; color: #999;">已选中<span class="success-color"> {{selection.length || 0}} </span>条记录</span>
    </div>

    
    <el-dialog title="对账信息" width="600px" append-to-body :visible.sync="payInfoVisible">
      <PayInfo :formData="payInfo"></PayInfo>
      <div slot="footer" class="dialog-footer">
        <el-button @click="payInfoVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    
    <el-dialog title="调整金额" width="800px" append-to-body :visible.sync="correctInfoVisible">
      <CorrectInfo :formData="correctInfo"></CorrectInfo>
      <div slot="footer" class="dialog-footer">
        <el-button @click="correctInfoVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCorrect">确 定</el-button>
      </div>
    </el-dialog>
    
    <el-dialog title="调整金额记录" width="800px" append-to-body :visible.sync="correctHistorysVisible">
      <CorrectHistorys ref="correctHistorys" :formData="correctHistorys"></CorrectHistorys>
      <div slot="footer" class="dialog-footer">
        <el-button @click="correctHistorysVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import PayInfo from './PayInfo';
import CorrectInfo from './CorrectInfo';
import CorrectHistorys from './CorrectHistorys';
export default {
  name: 'fillPayRecord',
  components: {
    PayInfo,
    CorrectInfo,
    CorrectHistorys
  },
  data() {
    return {
      ctrlTypeTexts: {
        [1]: '对账',
        [2]: '对账后退款结算'
      },
      ctrlTypeClass: {
        [1]: 'success-color',
        [2]: 'warning-color'
      },

      supplier_pay_status: '',

      pageCount: 20,
      currentPage: 1,
      count: 1,
      totalCount: 0,
      supplierPayStatusTexts: {
        [1]: '已对账',
        [2]: '未对账'
      },

      dataList: [],
      selection: [],

      payInfo: {},
      payInfoVisible: false,

      correctInfo: {},
      correctInfoVisible: false,

      correctHistorys: {},
      correctHistorysVisible: false,
      
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    // this.getOrders();
  },
  methods: {
    resetList(isForceUnpay = true) {
      if(isForceUnpay) this.supplier_pay_status = 2;
      this.selection = [];
      this.currentPage = 1;
      this.count = 1;
      this.totalCount = 0;
      this.dataList = [];
      this.getOrders();
    },
    changeCtrlType() {
      this.$set(this.formData, 'supplier_pay_no', '');
      this.$set(this.formData, 'supplier_pay_remark', '');
      this.$set(this.formData, 'supplier_refund_after_pay_price', '');
      this.$set(this.formData, 'supplier_refund_after_pay_no', '');
      this.$set(this.formData, 'supplier_refund_after_pay_remark', '');
      this.$forceUpdate();
    },
    updateStatusFilter() {
      this.currentPage = 1;
      this.selection = [];
      this.count = 1;
      this.totalCount = 0;
      this.dataList = [];
      this.getOrders();
    },
    handleSizeChange(value) {
      this.selection = [];
      this.pageCount = value;
      this.count = 1;
      this.totalCount = 0;
      this.currentPage = 1;
      this.dataList = [];
      this.getOrders();
    },
    getOrders() {
      let params = {
        page: this.currentPage,
        pageNumber: this.pageCount,
        keyword: this.formData.keyword,
        goods_sku: this.formData.skuSnList,
        supplier_pay_status: this.supplier_pay_status,
        
        start_time: this.formData.start_time,
        end_time: this.formData.end_time,
        delivery_start_time: this.formData.delivery_start_time,
        delivery_end_time: this.formData.delivery_end_time
      }
      this.$post('/admin/supplier/payList', params, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          let specs = JSON.parse(dataList[i].specs);
          let attr = Object.values(specs);
          let attrInfo = attr.join('、');
          let name = `${dataList[i].title}（${attrInfo}）`;
          dataList[i].name = name;
          dataList[i].attrs = attrInfo;
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
        this.totalCount = res.data.total;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getOrders();
    },

    
    updateSelection(e){
      this.selection = e;
    },
    returnOrdersArr() {
      return this.selection;
    },

    quicklyFillRecord() {
      if(!this.formData.supplier_pay_no || this.formData.supplier_pay_no === '') {
        return this.$message.error('还没填写对账流水号哦');
      } else if(!this.formData.supplier_pay_remark || this.formData.supplier_pay_remark === '') {
        return this.$message.error('还没填写对账备注哦');
      } else if(this.selection.length == 0) {
        this.$message.error('至少勾选一个订单哦')
      }
      let params = {
        supplier_pay_no: this.formData.supplier_pay_no, 
        supplier_pay_remark: this.formData.supplier_pay_remark,
      }
      this.opreateOrders(params, '/admin/supplier/payGoods');

    },
    quicklyFillRefundRecord() {
      
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
      
      // 批量对账
      let params = {
        type: 1,
        ...appendArgs,
        allOrder: []
      };
      for(let i = 0; i < this.selection.length; i++) {
        let item = this.selection[i];
        params.allOrder.push({
          order_sn: item.order_sn,
          goods_sn: item.goods_sn,
          sku_sn: item.sku_sn
        })
      }
      
      this.$confirm(`确定对这${ params.allOrder.length || 0}个订单进行${this.ctrlTypeTexts[this.formData.ctrlType]}操作吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post(url, params, res => {
          this.resetList(false);
          this.$message.success(`批量${this.ctrlTypeTexts[this.formData.ctrlType]}成功`);
        })
      }).catch(() => {})
    },


    openPayInfo(row) {
      this.payInfo = row;
      this.payInfoVisible = true;
    },

    showCorrectInfo(row) {
      this.correctInfo = {
        order_sn: row.order_sn,
        goods_sn: row.goods_sn,
        sku_sn: row.sku_sn,
        title: row.title,
        count: row.count,
        type: 1,
        price: 0,
        remark: ''
      }
      this.correctInfoVisible = true;
    },
    confirmCorrect() {
      let params = {
        order_sn: this.correctInfo.order_sn,
        goods_sn: this.correctInfo.goods_sn,
        sku_sn: this.correctInfo.sku_sn,
        type: this.correctInfo.type,
        price: this.correctInfo.price,
        remark: this.correctInfo.remark.trim(),
      }
      if(!params.price || params.price === '') {
        return this.$message.error('请填写调整金额');
      } else if(params.type != 3 && !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.price))) {
        return this.$message.error('除对账成本调整外，调整金额需要为大于0的数字格式');
      }
      if(!params.remark || params.remark === '') {
        return this.$message.error('请填写有效的操作说明');
      }
      this.$post("/admin/order/correctionCreate", [params], res => {
        this.$message.success('操作成功');
        this.correctInfoVisible = false;
      });

    },
    showCorrectHistorys(row) {
      this.correctHistorys = {
        order_sn: row.order_sn,
        sku_sn: row.sku_sn,
        title: row.title,
        count: row.count,
      }
      if(this.$refs.correctHistorys) {
        this.$nextTick(() => {
          this.$refs.correctHistorys.getHistorys();
        })
      }
      this.correctHistorysVisible = true;
    },


    returnStatusFilter() {
      return this.supplier_pay_status;
    }
  }
};
</script>
