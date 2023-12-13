<template>
<div>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
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
              :clearable="false" 
              :editable="false"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="退款时间" prop="refundDate">
            <el-date-picker
              name="refundDate"
              v-model="queryForm.refundDate"
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
          <el-form-item label="类型" prop="type">
            <el-select placeholder="不限" name="type" v-model="queryForm.type">
              <el-option label="不限" value=""></el-option>
              <el-option label="仅退款" :value="1" ></el-option>
              <el-option label="退货退款" :value="2" ></el-option>
              <el-option label="换货" :value="3" ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="after_status">
            <el-select placeholder="不限" name="after_status" v-model="queryForm.after_status">
              <el-option label="不限" value></el-option>
              <el-option v-for="(item, index) in Object.values(statusTexts)" :label="item" :value="Object.keys(statusTexts)[index]" :key="index"></el-option>
            </el-select>
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
        <div class="table-title">退售后列表</div>
        <div class="table-ctrl">
          <el-button style="margin-right: 15px;" @click="sgetList">
            <i class="el-icon el-icon-refresh"></i>
          </el-button>
          <template v-if="$auths.includes('excel/afterSale')">
            <el-button style="margin-right: 15px;" type="primary" @click="exportExcel">
              导出
            </el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="订单号" width="180" prop="order_sn">
        </el-table-column>
        <el-table-column label="商品名称" width="250">
          <template slot-scope="scope">
            {{scope.row.goods_title}} ×{{scope.row.goods_count}}
          </template>
        </el-table-column>
        <el-table-column label="收货人" width="100" prop="user_name"></el-table-column>
        <el-table-column label="订单总额" width="80" prop="order_real_price"></el-table-column>
        <el-table-column label="申请金额" width="80" prop="apply_price"></el-table-column>
        <el-table-column label="备货状态" width="80" prop="status" align="center">
          <template slot-scope="scope">
            {{shippingStatusText[scope.row.shipping_status]}}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="150">
          <template slot-scope="scope">
            {{scope.row.orderInfo ? scope.row.orderInfo.create_time : '——'}}
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="150" prop="apply_time"></el-table-column>
        <el-table-column label="处理时间" width="150">
          <template slot-scope="scope">
            {{scope.row.verify_time ? scope.row.verify_time : '——'}}
          </template>
        </el-table-column>
        <el-table-column label="退款时间" width="150" prop="user_arrive_price_time"></el-table-column>
        <el-table-column label="类型" width="80" prop="status" align="center" fixed="right">
          <template slot-scope="scope">
            {{typeText[scope.row.type]}}
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="80" prop="status" align="center" fixed="right">
          <template slot-scope="scope">
            {{statusTexts[scope.row.after_status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
         <template slot-scope="scope">
            <template v-if="$auths.includes('afterSale/fillInShip')">
              <el-button v-if="scope.row.after_status == 6 && scope.row.type == 3" type="text" size="default" @click="showReLogisticsPopup(scope.row)">填写换货物流</el-button>
            </template>
            <el-button type="text" size="default" @click="openDetail(scope.row)">
              {{(scope.row.after_status != 3 && scope.row.after_status != 7 && scope.row.after_status != 10 && scope.row.after_status > 0) ? '操作' : '详情'}}
            </el-button>
            <template v-if="$auths.includes('order/info')">
              <el-button type="text" size="default" @click="openOrderDetail(scope.row)">订单详情</el-button>
            </template>

            <template v-if="$auths.includes('afterSale/correctionCreate')">
              <el-button type="text" size="default" @click="showCorrectInfo(scope.row)">扣款</el-button>
            </template>
            <template v-if="$auths.includes('afterSale/correctionList')">
              <el-button type="text" size="default" @click="showCorrectHistorys(scope.row)">扣款记录</el-button>
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

    <el-dialog title="售后信息" width="780px" :close-on-click-modal="false" :visible.sync="detailVisible">
      <AfterSaleDetail :formData="formData"></AfterSaleDetail>
      <div slot="footer" class="dialog-footer">
        <template v-if="$auths.includes('afterSale/msg')">
          <el-button v-if="formData.after_status != -1 && formData.after_status != -2 && formData.after_status != -3 && formData.after_status != 3" type="primary" @click="showSendMsg">
            留言
          </el-button>
        </template>
        <!-- 在<待审核、已同意退售后但未退款、待用户退货、待商家确认收货、商家已确认收货、等待用户确认换货>状态时可以取消退售后 -->
        <template v-if="$auths.includes('afterSale/cancel')">
          <el-button v-if="formData.after_status == 1 || formData.after_status == 2 || formData.after_status == 4 || formData.after_status == 5 || formData.after_status == 6 || formData.after_status == 8" type="warning" @click="cancelAfterSale">
            取消售后
          </el-button>
        </template>
        <!-- 即将处理 -->
        <template v-if="$auths.includes('afterSale/verify')">
          <el-button v-if="formData.after_status == 1" type="danger" @click="rejectAfterSale">拒绝申请</el-button>
        </template>
        <!-- 只有仅退款才直接同意申请 -->
        <template v-if="$auths.includes('afterSale/verify')">
          <el-button v-if="formData.after_status == 1 && formData.type == 1" type="primary" @click="confirmAfterSale">同意申请</el-button>
        </template>
        <!-- 其他类型需要填写退货的收货地址 -->
        <template v-if="$auths.includes('afterSale/verify')">
          <el-button v-if="formData.after_status == 1 && formData.type != 1" type="primary" @click="showSellerPopup">同意申请</el-button>
        </template>

        <!-- 拒绝申请后允许打开售后 -->
        <template v-if="$auths.includes('afterSale/open')">
          <el-button v-if="formData.after_status == 3 && formData.goods.after_status == 5" type="danger" @click="openAfterSale">打开售后</el-button>
        </template>

        <!-- 用户没填发货信息，替用户填写 -->
        <template v-if="$auths.includes('afterSale/userFillInShip')">
          <el-button v-if="formData.after_status == 4" type="primary" @click="showOfflineDelivery">填写用户发货信息</el-button>
        </template>
        <template v-if="$auths.includes('afterSale/refuse')">
          <el-button v-if="formData.after_status == 5" type="warning" @click="showRejectDeliveryPopup">拒绝收货</el-button>
        </template>
        <template v-if="$auths.includes('afterSale/confirm')">
          <el-button v-if="formData.after_status == 5" type="primary" @click="confirmGetDelivery">确认收货</el-button>
        </template>
        <!-- 帮用户确认收货 -->
        <template v-if="$auths.includes('afterSale/confirmReceiveChangeGoods')">
          <el-button v-if="formData.after_status == 8" type="primary" @click="confirmUserGetDelivery">确认用户收到换货</el-button>
        </template>
        <template v-if="$auths.includes('afterSale/refund')">
          <el-button v-if="(formData.after_status == 2 && formData.type == 1) || (formData.after_status == 6 && formData.type == 2)" type="primary" @click="confirmReturnMoney">确认退款</el-button>
        </template>

        <el-button type="plain" @click="detailVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="填写想与用户沟通的信息" width="700px" :close-on-click-modal="false" :visible.sync="sendMsgVisible">
      <SendMsg ref="sendMsg"></SendMsg>
      <div slot="footer" class="dialog-footer">
        <el-button type="plain" @click="sendMsgVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSendMsg">确认信息</el-button>
      </div>
    </el-dialog>

    <el-dialog title="同意非仅退款的申请需要填写退货相关的收货信息哦" width="700px" :close-on-click-modal="false" :visible.sync="sellerInfoVisible">
      <SellerInfo :formData="formData"></SellerInfo>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="formData.after_status == 1" type="primary" @click="confirmAfterSale">确认信息</el-button>
      </div>
    </el-dialog>

    <el-dialog title="线下收货需要填写收货相关的信息" width="600px" append-to-body :close-on-click-modal="false" :visible.sync="offlineDeliveryVisible">
      <OfflineDelivery :formData="offlineData" :logisticsCompanys="logisticsCompanys"></OfflineDelivery>
      <div slot="footer" class="dialog-footer">
        <el-button type="plain" @click="offlineDeliveryVisible = false">取 消</el-button>
        <template v-if="offlineData.offline_type == 1">
          <el-button type="primary" @click="confirmOfflineDelivery">确认线下收货</el-button>
        </template>
        <template v-if="offlineData.offline_type == 2">
          <el-button type="primary" @click="askOfflineDeliveryWithoutCode">确认无物流线下收货</el-button>
        </template>
      </div>
    </el-dialog>
    
    <el-dialog title="请填写拒绝收货的理由，上传相关凭据哦" width="760px" :close-on-click-modal="false" :visible.sync="rejectDeliveryVisible">
      <RejectDelivery ref="rejectDelivery" :formData="formData"></RejectDelivery>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectDeliveryVisible = false">取 消</el-button>
        <el-button type="primary" @click="rejectDelivery">确定拒收</el-button>
      </div>
    </el-dialog>

    <el-dialog title="已确认收货，现在需要给用户重新发货" width="760px" :close-on-click-modal="false" :visible.sync="reLogisticsVisible">
      <ReLogistics ref="ReLogistics" :formData="formData" :logisticsCompanys="logisticsCompanys"></ReLogistics>
      <div slot="footer" class="dialog-footer">
        <el-button @click="reLogisticsVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReLogistics">确认换货物流</el-button>
      </div>
    </el-dialog>
    
    <el-dialog title="订单详情" width="1200px" :visible.sync="orderDetailVisible">
      <OrderDetail :formData="orderData"></OrderDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="orderDetailVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="售后扣除供应商金额" width="800px" append-to-body :visible.sync="correctInfoVisible">
      <CorrectInfo :formData="correctInfo"></CorrectInfo>
      <div slot="footer" class="dialog-footer">
        <el-button @click="correctInfoVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCorrect">确 定</el-button>
      </div>
    </el-dialog>
    
    <el-dialog title="售后扣除供应商金额记录" width="800px" append-to-body :visible.sync="correctHistorysVisible">
      <CorrectHistorys ref="correctHistorys" :formData="correctHistorys"></CorrectHistorys>
      <div slot="footer" class="dialog-footer">
        <el-button @click="correctHistorysVisible = false">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</div>
</template>

<script>
import moment from 'moment';
import XLSX from 'xlsx';

import AfterSaleDetail from '@/partialviews/order/afterSale/Detail';
import SendMsg from '@/partialviews/order/afterSale/SendMsg';
import SellerInfo from '@/partialviews/order/afterSale/SellerInfo';
import RejectDelivery from '@/partialviews/order/afterSale/RejectDelivery';
import ReLogistics from '@/partialviews/order/afterSale/ReLogistics';
import OfflineDelivery from '@/partialviews/order/afterSale/OfflineDelivery';

import CorrectInfo from '@/partialviews/order/afterSale/CorrectInfo';
import CorrectHistorys from '@/partialviews/order/afterSale/CorrectHistorys';

import OrderDetail from '@/partialviews/order/order/Detail';

import {nTimePickerConfig} from '@/config';


export default {
  name: 'afterSales',
  components: {
    OrderDetail,
    AfterSaleDetail,
    SendMsg,
    SellerInfo,
    RejectDelivery,
    ReLogistics,
    OfflineDelivery,
    CorrectInfo,
    CorrectHistorys
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        after_status: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        refundDate: [],
        type: null,
        
        exportPageNum: 1,
        exportNum: 1000,
      },
      filter: {
        keyword: '',
        after_status: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        refundDate: [],
        type: null,
        
        exportPageNum: 1,
        exportNum: 1000,
      },
      categories: [],
      statusTexts: {
        [1]: '申请中',
        [2]: '已同意',
        [3]: '不同意',
        [4]: '待用户发货',
        [5]: '待收货',
        [6]: '已收货',
        [7]: '退款中',
        [8]: '待用户收货',
        [9]: '用户已收货',
        [10]: '售后完成',
        [-1]: '已取消',
        [-2]: '拒绝收货',
        [-3]: '拒绝退款'
      },
      typeText: {
        [1]: '仅退款',
        [2]: '退货退款',
        [3]: '换货'
      },
      shippingStatusText: {
        [1]: '未备货',
        [2]: '备货中',
        [3]: '已发货'
      },

      ...nTimePickerConfig,

      dataList: [],
      logisticsCompanys: [],
      formData: {},
      orderData: {},


      detailVisible: false,
      orderDetailVisible: false,
      sendMsgVisible: false,
      sellerInfoVisible: false,
      rejectDeliveryVisible: false,
      reLogisticsVisible: false,

      offlineData: {},
      offlineDeliveryVisible: false,

      correctInfo: {},
      correctInfoVisible: false,

      correctHistorys: {},
      correctHistorysVisible: false,

      dataLoading: false
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
        after_status: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        refundDate: [],
        type: null,
        
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
        keyword: this.queryForm.keyword,
        after_status: this.queryForm.after_status,
        createDate: this.queryForm.createDate,
        refundDate: this.queryForm.refundDate,
        type: this.queryForm.type,

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum,
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        after_status: this.filter.after_status,
        type: this.filter.type
      };
      
      if(this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }

      if(this.filter.refundDate && this.filter.refundDate.length == 2) {
        queryVal.refund_start_time = this.filter.refundDate[0];
        queryVal.refund_end_time = this.filter.refundDate[1];
      }
      
      this.dataLoading = true;
      this.$get('/admin/afterSale/list', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
        this.dataLoading = false;
      }, err => {
        this.dataLoading = false;
      });
    },

    sgetList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        after_status: this.filter.after_status,
        type: this.filter.type
      };
      
      if(this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }

      if(this.filter.refundDate.length == 2) {
        queryVal.refund_start_time = this.filter.refundDate[0];
        queryVal.refund_end_time = this.filter.refundDate[1];
      }
      
      this.dataLoading = true;
      this.$sget('/admin/afterSale/list', queryVal, res => {
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

    openOrderDetail(row) {
      let params = {
        order_sn: row.order_sn
      };

      this.$get('/admin/order/info', params, res => {
        this.orderData = res.data;
        if(!this.orderData.goods) this.orderData.goods = [];
        for(let i = 0; i < this.orderData.goods.length; i++) {
          let attrs = JSON.parse(this.orderData.goods[i].specs);
          this.orderData.goods[i].attrs = Object.values(attrs).join(',');
        }
        this.orderDetailVisible = true;
      }, err => {
        console.log(err);
      });
    },

    openDetail(row) {
      if(!this.$auths.includes('order/info')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常操作/查看该售后申请，请联系管理员为您添加'); 
      }
      let params = {
        after_sale_sn: row.after_sale_sn
      };

      this.$get('/admin/afterSale/info', params, res => {
        this.formData = res.data;
        this.detailVisible = true;
      });
    },

    showSendMsg() {
      // 给用户留言
      if(this.$refs.sendMsg) this.$refs.sendMsg.init();
      this.sendMsgVisible = true;
    },
    confirmSendMsg() {
      let result = this.$refs.sendMsg.confirmResult();
      if(!result.message || result.message.trim() === '') {
        return this.$message.error('请填写有效留言');
      }
      this.$confirm('即将给用户发送留言，是否确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
          
        let params = {
          after_sale_sn: this.formData.after_sale_sn,
          order_sn: this.formData.order_sn,
          message: result.message
        }
        this.$post('/admin/afterSale/msg', params, res => {
          this.$message.success('发送留言成功');
          this.sendMsgVisible = false;
          this.detailVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});

    },


    cancelAfterSale() {
      this.$confirm('是否确定取消该用户的退售后申请？取消后，用户可重新发起申请', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          after_sale_sn: this.formData.after_sale_sn
        }
        this.$post('/admin/afterSale/cancel', params, res => {
          this.$message.success('取消用户退售后申请成功');
          this.detailVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },
    rejectAfterSale() {
      let params = {
        after_sale_sn: this.formData.after_sale_sn,
        verify_status: 3, //2同意， 3拒绝
        verify_reason: this.formData.verify_reason,
      }

      // 拒绝售后申请， 需要有原因
      if(!this.formData.verify_reason || this.formData.verify_reason === '') {
        return this.$message.error('请填写审核原因以便后面校对、核销哦');
      }
      this.$confirm('是否确定拒绝该用户的退售后申请？拒绝申请后用户将不能再次发起申请', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {

        this.$post('/admin/afterSale/verify', params, res => {
          this.$message.success('拒绝申请成功');
          this.detailVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});

    },
    confirmAfterSale() {
      // 同意售后申请
      let params = {
        after_sale_sn: this.formData.after_sale_sn,
        verify_status: 2 //2同意， 3拒绝
      }
      console.log(this.formData);

      if(this.formData.verify_reason) params.verify_reason = this.formData.verify_reason;
      if(this.formData.type != 1) {
        // 非仅退款情况下需要传退货的收货信息，并验证
        // 仅支持 type: 2/3 的申请
        params.seller_shipping_name = this.formData.seller_shipping_name;
        params.seller_shipping_phone = this.formData.seller_shipping_phone;
        params.seller_shipping_address = this.formData.seller_shipping_address;
        params.seller_remark = this.formData.seller_remark;
        if(
          params.seller_shipping_name === '' ||
          params.seller_shipping_phone === '' ||
          params.seller_shipping_address === ''
        ) {
          return this.$message.error('请填写完退货的收货地址信息以便后面校对、核销哦');
        }
        if(params.seller_shipping_phone && 
          !/^1[3456789]\d{9}$/.test(params.seller_shipping_phone) &&
          !/^([0-9]{3,4}-)?[0-9]{7,8}$/.test(params.seller_shipping_phone)
        ) {
          return this.$message.error('商家收货联系方式格式有误，仅支持手机号码和座机，请检查');
        }
      }

      this.$confirm('已确认售后申请符合要求，即将同意该用户的申请？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/afterSale/verify', params, res => {
          this.$message.success('同意申请成功');
          this.detailVisible = false;
          if(this.sellerInfoVisible) this.sellerInfoVisible= false;
          this.reloadPage();
        });
      }).catch(() => {});
    },
    showSellerPopup() {
      this.formData.seller_shipping_name = '';
      this.formData.seller_shipping_phone = '';
      this.formData.seller_shipping_address = '';
      this.formData.seller_remark = '';
      this.sellerInfoVisible = true;
    },

    // 拒绝用户售后申请后，允许后台人员打开被拒的订单商品的退售后申请权限
    openAfterSale() {
      let params = {
        after_sale_sn: this.formData.after_sale_sn,
        order_sn: this.formData.order_sn
      }

      this.$confirm('是否确定打开该用户的退售后申请？拒绝后申请后用户将不能再次发起申请', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/afterSale/open', params, res => {
          this.$message.success('打开退售后成功');
          this.detailVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },

    showReLogisticsPopup(row) {
      // 弹修改联系方式弹窗
      
      if(this.logisticsCompanys[0]) {
        this.formData = {
          after_sale_sn: row.after_sale_sn,
          shipping_code: '',
          shipping_company: this.logisticsCompanys[0].company,
          shipping_company_code: this.logisticsCompanys[0].company_code,
          index: 0
        }
        this.reLogisticsVisible = true;
      } else {
        this.$get('/admin/ship/company', null, res => {
          this.logisticsCompanys = res.data;
          this.formData = {
            after_sale_sn: row.after_sale_sn,
            shipping_code: '',
            shipping_company: this.logisticsCompanys[0].company,
            shipping_company_code: this.logisticsCompanys[0].company_code,
            index: 0
          }
          this.reLogisticsVisible = true;
        });
      }
    },
    confirmReLogistics() {
      // 确认换货物流
      let params = JSON.parse(JSON.stringify(this.formData));
      if(params.shipping_code == undefined ||
        params.shipping_code == null ||
        params.shipping_code === "") {
          return this.$message.error("请填写物流编号哦");
        }
      if(!/^[a-zA-Z0-9]*$/.test(params.shipping_code)) {
        return this.$message.error("物流编号格式有误哦，必须是大小写字母或数字");
      }
      this.$post('/admin/afterSale/fillInShip', params, res => {
        this.$message.success('确认换货物流成功');
        this.reLogisticsVisible = false;
        this.reloadPage();
      });
      
    },
    
    // 帮用户直接越过填写物流那一步
    showOfflineDelivery() {
      if(this.logisticsCompanys[0]) {
        this.offlineData = {
          after_sale_sn: this.formData.after_sale_sn,
          shipping_code: '',
          shipping_company: '',
          shipping_company_code: '',
          offline_type: 1,
        }
        this.offlineDeliveryVisible = true;
      } else {
        this.$get('/admin/ship/company', null, res => {
          this.logisticsCompanys = res.data;
          
          this.offlineData = {
            after_sale_sn: this.formData.after_sale_sn,
            shipping_code: '',
            shipping_company: '',
            shipping_company_code: '',
            offline_type: 1,
          }
          this.offlineDeliveryVisible = true;
        });
      }
    },
    askOfflineDeliveryWithoutCode() {
      // 无物流信息情况下做一下询问
      this.$confirm('确定为无物流？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.confirmOfflineDelivery();
      }).catch(() => {});
    },
    confirmOfflineDelivery() {
      let params = {
        after_sale_sn: this.offlineData.after_sale_sn
      }
      if(this.offlineData.offline_type == 1) {
        params.shipping_code = this.offlineData.shipping_code;
        params.shipping_company = this.offlineData.shipping_company;
        params.shipping_company_code = this.offlineData.shipping_company_code;
      } else {
        params.shipping_code = '暂无物流编号';
        params.shipping_company = '暂无物流公司';
        params.shipping_company_code = '';
      }
      if(this.offlineData.offline_type == 1) {
        if(!this.offlineData.shipping_company_code || this.offlineData.shipping_company_code === '') {
          return this.$message.error('请选择物流公司');
        } else if(
          !this.offlineData.shipping_code || 
          this.offlineData.shipping_code.trim() === '' || 
          !/^[a-zA-Z0-9]*$/.test(this.offlineData.shipping_code)
        ) {
          return this.$message.error('请填写正确格式的快递单号，必须是大小写字母或数字');
        }
      }
      this.$post('/admin/afterSale/userFillInShip', params, res => {
        this.$message.success('填写用户发货信息成功');
        this.offlineDeliveryVisible = false;
        this.detailVisible = false;
        this.reloadPage();
      });
    },

    // 拒绝换货
    showRejectDeliveryPopup() {
      this.formData.images = [];
      this.formData.refuse_reason = '';

      if(this.$refs.rejectDelivery && this.$refs.rejectDelivery.$refs.upload) this.$refs.rejectDelivery.$refs.upload.clearFiles();
      this.rejectDeliveryVisible = true;
    },
    rejectDelivery() {
      // 拒绝收货
      let params = {
        after_sale_sn: this.formData.after_sale_sn,
        images: this.formData.images,
        refuse_reason: this.formData.refuse_reason
      }
      if(params.refuse_reason === '') {
        return this.$message.error('拒绝收货请填写理由哦');
      }
      this.$post('/admin/afterSale/refuse', params, res => {
        this.$message.success('拒收成功');
        this.rejectDeliveryVisible = false;
        this.detailVisible = false;
        this.reloadPage();
      });
    },
    confirmGetDelivery() {
      // 同意收货
      let params = {
        after_sale_sn: this.formData.after_sale_sn
      }
      this.$confirm('确定已收到相关货物？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/afterSale/confirm', params, res => {
          this.$message.success('收货成功');
          this.detailVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },

    confirmUserGetDelivery() {
      // 确认用户已收货
      let params = {
        after_sale_sn: this.formData.after_sale_sn
      }
      this.$confirm('确定用户已收到相关货物？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/afterSale/confirmReceiveChangeGoods', params, res => {
          this.$message.success('确认用户收到换货成功');
          this.detailVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },

    confirmReturnMoney() {
      // 同意退款
      let params = {
        after_sale_sn: this.formData.after_sale_sn
      }
      this.$confirm('即将给用户退款，是否确定', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/afterSale/refund', params, res => {
          this.$message.success('确定退款成功');
          this.detailVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },

    
    showCorrectInfo(row) {
      this.correctInfo = {
        order_sn: row.order_sn,
        goods_sn: row.goods_sn,
        sku_sn: row.sku_sn,
        title: row.goods_title,
        user_name: row.user_name,
        type: 2,
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
      } else if(!(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.price))) {
        return this.$message.error('调整金额需要为大于0的数字格式');
      }
      if(!params.remark || params.remark === '') {
        return this.$message.error('请填写有效的操作说明');
      }
      this.$post("/admin/afterSale/correctionCreate", [params], res => {
        this.$message.success('操作成功');
        this.correctInfoVisible = false;
      });

    },
    showCorrectHistorys(row) {
      this.correctHistorys = {
        order_sn: row.order_sn,
        sku_sn: row.sku_sn,
        title: row.goods_title,
        user_name: row.user_name,
      }
      if(this.$refs.correctHistorys) {
        this.$nextTick(() => {
          this.$refs.correctHistorys.getHistorys();
        })
      }
      this.correctHistorysVisible = true;
    },

    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        after_status: this.filter.after_status,
        type: this.filter.type,
        
        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      };
      
      if(this.filter.createDate.length == 2) {
        params.start_time = this.filter.createDate[0];
        params.end_time = this.filter.createDate[1];
      }

      if(this.filter.refundDate && this.filter.refundDate.length == 2) {
        params.refund_start_time = this.filter.refundDate[0];
        params.refund_end_time = this.filter.refundDate[1];
      }
      
      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }
      
      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      this.$get('/admin/excel/afterSale', params, res => {
        let data = res.data.list || [];
        
        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('订单数超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        let excelData = [];
        excelData.push([
          '订单号', 
          '商品名称',
          '供应商', 
          '收货人', 
          '订单总额', 
          '实收金额',
          '申请退款金额', 
          '实退金额', 
          '应扣供应商金额', 
          '申请类型', 
          '申请理由', 
          '备货状态', 
          '下单时间', 
          '申请时间', 
          '处理时间', 
          '退款时间', 
          '审核状态', 
          '系统备注']);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.order_sn, 
            `${item.goods_title} ×${item.goods_count || 0}`, 
            item.supplier_name || '',
            item.user_name, 
            item.total_price || '0.00', 
            item.order_real_price || '0.00', 
            item.apply_price || '0.00', 
            item.refund_price || '', 
            item.correction_supplier || '', 
            this.typeText[item.type],
            item.apply_reason, 
            this.shippingStatusText[item.shipping_status], 
            item.orderInfo ? item.orderInfo.create_time : '——', 
            item.apply_time, 
            item.verify_time ? item.verify_time : '——',
            item.user_arrive_price_time,
            this.statusTexts[item.after_status], 
            item.verify_reason
          ]);
        }
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 200},
          {wpx: 100},
          {wpx: 100},
          {wpx: 80},
          {wpx: 80},
          {wpx: 80},
          {wpx: 80},
          {wpx: 100},
          {wpx: 100},
          {wpx: 140},
          {wpx: 100},
          {wpx: 160},
          {wpx: 160},
          {wpx: 160},
          {wpx: 160},
          {wpx: 100},
          {wpx: 140}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let totalPrice = XLSX.utils.encode_cell({r: i , c: 4});
          ws[totalPrice].t = 'n';
          let realPrice = XLSX.utils.encode_cell({r: i , c: 5});
          ws[realPrice].t = 'n';
          let applyPrice = XLSX.utils.encode_cell({r: i , c: 6});
          ws[applyPrice].t = 'n';
          if(excelData[i][7] && excelData[i][7] !== '') {
            let refundPrice = XLSX.utils.encode_cell({r: i , c: 7});
            ws[refundPrice].t = 'n';
          }
          if(excelData[i][8] && excelData[i][8] !== '') {
            let correctPrice = XLSX.utils.encode_cell({r: i , c: 8});
            ws[correctPrice].t = 'n';
          }
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "退售后列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `退售后列表${time}.xlsx`);
      });
    }

  }
};
</script>