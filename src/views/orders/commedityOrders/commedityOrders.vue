<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">

        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="创建时间" prop="createDate">
              <el-date-picker name="createDate" v-model="queryForm.createDate" type="datetimerange"
                :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :clearable="false"
                :editable="false"></el-date-picker>
            </el-form-item>
            <el-form-item label="收货时间" prop="deliveryDate">
              <el-date-picker name="deliveryDate" v-model="queryForm.deliveryDate" type="datetimerange"
                :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :clearable="false"
                :editable="false"></el-date-picker>
            </el-form-item>
            <el-form-item label="状态" prop="searType">
              <el-select placeholder="不限" name="searType" v-model="queryForm.searType">
                <el-option label="不限" value=""></el-option>
                <el-option v-for="item in Object.keys(statusTexts)" :label="statusTexts[item]" :value="item"
                  :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="订单类型" prop="order_type">
              <el-select placeholder="不限" name="order_type" v-model="queryForm.order_type">
                <el-option label="不限" value></el-option>
                <el-option label="普通订单" :value="1"></el-option>
                <el-option label="拼团" :value="2"></el-option>
                <el-option label="套餐订单" :value="3"></el-option>
                <!-- <el-option label="拼拼订单" :value="4"></el-option> -->
                <el-option label="转售订单" :value="5"></el-option>
                <!--                <el-option label="福利订单" :value="6"></el-option>-->
                <el-option label="集品豆订单" :value="7"></el-option>
                <el-option label="礼品券订单" :value="8"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="支付方式" prop="pay_type">
              <el-select placeholder="不限" name="pay_type" v-model="queryForm.pay_type">
                <el-option label="不限" value></el-option>
                <el-option label="微信支付" :value="2"></el-option>
                <el-option label="集品券支付" :value="5"></el-option>
                <el-option label="协议支付" :value="6"></el-option>
                <el-option label="集品豆支付" :value="7"></el-option>
                <el-option label="礼品券支付" :value="8"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="queryForm.pay_type == 2 || queryForm.pay_type == 6" label="支付商类型" prop="pay_channel">
              <el-select placeholder="不限" name="pay_channel" v-model="queryForm.pay_channel">
                <el-option label="不限" value></el-option>
                <el-option v-for="(item, key) in payChannelTexts" :label="item" :value="key" :key="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="订单号" prop="searOrderSn">
              <el-input v-model="queryForm.searOrderSn" placeholder="请填入完整订单号" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="快速标志" prop="order_sign">
              <el-checkbox-group v-model="queryForm.order_sign">
                <el-checkbox :label="1">
                  <i class="el-icon-s-flag red"></i>
                </el-checkbox>
                <el-checkbox :label="2">
                  <i class="el-icon-s-flag yellow"></i>
                </el-checkbox>
                <el-checkbox :label="3">
                  <i class="el-icon-s-flag green"></i>
                </el-checkbox>
                <el-checkbox :label="4">
                  <i class="el-icon-s-flag blue"></i>
                </el-checkbox>
                <el-checkbox :label="5">
                  <i class="el-icon-s-flag purple"></i>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="根据上级筛选">
              <el-select placeholder="不限" name="topUserType" v-model="queryForm.topUserType">
                <!-- <el-option label="查找该上级的直属下级的订单" :value="1"></el-option> -->
                <el-option label="查找某个团队的历史订单" :value="2"></el-option>
                <el-option label="查找该上级的分润下级的历史订单" :value="3"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model="queryForm.topUserPhone" placeholder="请输入精准手机号码或置空" maxlength="11"
                @keyup.enter.native="queryInfo"></el-input>
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

            <el-form-item v-if="!showExtendFilter">
              <el-button type="primary" @click="queryInfo">查询</el-button>
              <el-button @click="resetQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-if="showExtendFilter" class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
            <el-form-item label="指定商品">
              <div v-if="(selectGoodsInfo.searGoodsSpuSn && selectGoodsInfo.searGoodsSpuSn.length > 0) ||
                (selectGoodsInfo.searGoodsSkuSn && selectGoodsInfo.searGoodsSkuSn.length > 0)">
                <span class="sku-select-trigger" @click="showSelectGoods">
                  <template v-if="selectGoodsInfo.type == 1">
                    已选择<span class="warning-color">{{ selectGoodsInfo.searGoodsSpuSn.length || 0 }}</span>款商品
                  </template>
                  <template v-if="selectGoodsInfo.type == 2">
                    已选择<span class="warning-color">{{ selectGoodsInfo.searGoodsSpuSn.length || 0 }}</span>款商品，
                    <span class="warning-color">{{ selectGoodsInfo.searGoodsSkuSn.length || 0 }}</span>个规格
                  </template>
                </span>
                <span class="sku-select-trigge-clear" @click="resetSelectGoods">取消指定</span>
              </div>
              <div v-else class="sku-select-trigger" @click="showSelectGoods">未指定商品</div>
            </el-form-item>
            <el-form-item label="用户昵称" prop="searUserName">
              <el-input v-model="queryForm.searUserName" placeholder="请完整填入" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="用户手机" prop="searUserPhone">
              <el-input v-model="queryForm.searUserPhone" placeholder="请完整填入" @keyup.enter.native="queryInfo"
                maxlength="11"></el-input>
            </el-form-item>
            <div>
              <el-form-item label="收件人姓名" prop="searShippingName">
                <el-input v-model="queryForm.searShippingName" placeholder="请完整填入"
                  @keyup.enter.native="queryInfo"></el-input>
              </el-form-item>
              <el-form-item label="收件人手机" prop="searShippingPhone">
                <el-input v-model="queryForm.searShippingPhone" placeholder="请完整填入" @keyup.enter.native="queryInfo"
                  maxlength="11"></el-input>
              </el-form-item>

              <el-form-item label="物流编码" prop="searShippingCode">
                <el-input v-model="queryForm.searShippingCode" placeholder="请完整填入"
                  @keyup.enter.native="queryInfo"></el-input>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="queryInfo">查询</el-button>
                <el-button @click="resetQuery('queryForm')">重置</el-button>
              </el-form-item>
            </div>
          </el-form>
        </div>
        <div class="filter-extend-trigger-box">
          <div class="filter-extend-trigger" @click="extendFilter">{{ showExtendFilter ? '∧折叠' : '∨展开' }}高级搜索</div>
        </div>
      </div>
    </div>

    <div class="subpage-content">
      <div v-loading="dataLoading" class="default-container">
        <div class="table-ctrls">
          <div class="table-title">订单列表</div>
          <div class="table-ctrl">
            <el-button style="margin-right: 15px;" @click="sgetList">
              <i class="el-icon el-icon-refresh"></i>
            </el-button>
            <template v-if="$auths.includes('excel/order')">
              <el-button type="primary" @click="exportDataExcel">导出数据</el-button>
            </template>
            <template v-if="$auths.includes('excel/order')">
              <el-button type="primary" @click="exportExcel">导出Excel表格</el-button>
            </template>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="订单号" width="180" prop="order_sn">
            <template slot-scope="scope">
              <div>{{ scope.row.order_sn }}</div>
              <div v-if="scope.row.order_type == 6 & scope.row.advance_buy == 1" class="warning-color">[提前购]</div>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="all_goods_title" width="150">
          </el-table-column>
          <el-table-column label="用户昵称" width="100" prop="user_name"></el-table-column>
          <el-table-column label="总价" width="80" prop="total_price"></el-table-column>
          <el-table-column label="实际支付" width="100" prop="real_pay_price" align="center">
            <template slot-scope="scope">
              <div>
                {{ scope.row.real_pay_price }}
                <div v-if="scope.row.all_refund_price && scope.row.all_refund_price != '0.00'">
                  退<span class="error-color">{{ scope.row.all_refund_price }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="下单日期" width="150" prop="create_time"></el-table-column>
          <!-- <el-table-column label="收货日期" width="150" prop="delivery_time"></el-table-column> -->
          <el-table-column label="订单类别" width="230" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.order_type == 2" class="pt-type-ctrl" @click="showCollageDetail(scope.row)">
                <span class="warning-color">[拼团]</span><br />
                <span
                  v-if="scope.row.order_type == 2 && scope.row.pt_success_number != scope.row.pt_group_number && (scope.row.order_status == 1 || scope.row.order_status == 2)"
                  class="error-color">
                  {{ scope.row.pt_group_number }}人团，已拼{{ scope.row.pt_success_number }}
                </span>
              </div>
              <div v-else-if="scope.row.order_type == 3">套餐订单</div>
              <div v-else-if="scope.row.order_type == 4">拼拼订单</div>
              <div v-else-if="scope.row.order_type == 5">转售订单</div>
              <div v-else-if="scope.row.order_type == 6">
                <div>福利订单</div>
                <div>
                  {{ scope.row.crowd_activity_title }}
                  {{ scope.row.crowd_round_number }}轮
                  {{ scope.row.crowd_period_number }}期
                </div>
                <div v-if="scope.row.crowd_fuse_status == 1" class="error-color">已熔断</div>

              </div>
            </template>
          </el-table-column>
          <el-table-column label="支付类型" width="100" align="center">
            <template slot-scope="scope">
              {{ payTypeTexts[scope.row.pay_type] }}
              <div v-if="scope.row.pay_type == 2 || scope.row.pay_type == 6" class="warning-color">
                {{ payChannelTexts[scope.row.pay_channel] }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120" prop="status">
            <template slot-scope="scope">
              <template v-if="scope.row.order_status == 2">{{ shippingStatusText[scope.row.shipping_status] }}</template>
              <template v-else>
                <div :class="statusColors[scope.row.order_status]">{{ statusTexts[scope.row.order_status] }}</div>
              </template>
              <div v-if="scope.row.shipping_type == 2" class="success-color">(免物流)</div>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="140" prop="total_price">
            <template slot-scope="scope">
              <div>
                <i v-if="scope.row.order_sign" class="el-icon-s-flag" :class="flagColor[scope.row.order_sign]"></i>
                <span>{{ scope.row.seller_remark }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="顶级分润" width="180" prop="divideTopUser">
            <template slot-scope="scope">
              <template v-if="scope.row.divideTopUser && scope.row.divideTopUser.link_user_name">
                {{ scope.row.divideTopUser.link_user_name }}({{ scope.row.divideTopUser.link_user_phone }}) <br />
                分润￥<span class="error-color">{{ scope.row.divideTopUser.real_divide_price || '0.00' }}</span>
              </template>
              <template v-if="!scope.row.divideTopUser || scope.row.divideTopUser.length == 0">
                ——
              </template>
            </template>
          </el-table-column>
          <el-table-column label="顶级团队" width="180">
            <template slot-scope="scope">
              {{ scope.row.team_top_user_info ? scope.row.team_top_user_info.name : '——' }}
              <span v-if="scope.row.team_top_user_info && scope.row.team_top_user_info.vip_level"> |
                {{ scope.row.team_top_user_info.vip_name }}</span>
              <span v-if="scope.row.team_top_user_info && scope.row.team_top_user_info.phone">({{
                scope.row.team_top_user_info.phone }})</span>
            </template>
          </el-table-column>
          <el-table-column label="分润上级" width="180">
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.divide_chain_user_info" :key="index">
                {{ item.name ? item.name : '——' }}
                <span v-if="item.vip_level"> | {{ item.vip_name }}</span>
                <span v-if="item.phone">({{ item.phone }})</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <template v-if="$auths.includes('order/remark')">
                <el-button type="text" size="default" @click="showRemark(scope.row)">备注</el-button>
              </template>

              <!-- 无需鉴权 -->
              <el-button v-if="scope.row.shipping_code" type="text" size="default"
                @click="checkLogistics(scope.row)">查看物流</el-button>

              <template v-if="$auths.includes('order/info')">
                <el-button type="text" size="default" @click="openDetail(scope.row)">详情</el-button>
              </template>
              <template v-if="scope.row.is_attach_order && scope.row.attach">
                <el-button style="margin-left: 15px; padding: 0;" type="text" @click="showAttachInfos(scope.row)">
                  <i class="el-icon-info"></i>查看附加信息
                </el-button>
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



    <el-dialog title="备忘" width="600px" :close-on-click-modal="false" :visible.sync="remarkVisible">
      <Remark :formData="formData"></Remark>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="remarkVisible = false">取 消</el-button>
        <el-button type="primary" @click="remarkOrder">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="订单详情" width="1200px" :visible.sync="detailVisible">
      <OrderDetail :formData="formData"></OrderDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="拼团详情" width="1000px" :visible.sync="collageDetailVisible">
      <CollageDetail :formData="formData"></CollageDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="collageDetailVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <!-- <el-dialog title="填写单号" width="750px" :visible.sync="updateLogisticsVisible">
      <PerfectLogistics :formData="formData" :logisticsCompanys="logisticsCompanys"></PerfectLogistics>

      <div slot="footer" class="dialog-footer">
        <el-button @click="updateLogisticsVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateLogistics">确 定</el-button>
      </div>
    </el-dialog> -->

    <el-dialog title="物流信息" width="750px" :visible.sync="logisticsVisible">
      <LogisticsDetail :formData="logisticsData"></LogisticsDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="logisticsVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="筛选商品" width="1200px" :close-on-click-modal="false" :visible.sync="selectGoodsVisible">
      <SelectGoods ref="selectGoods"></SelectGoods>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectGoodsVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelectGoods">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="海外购/特殊商品补充信息" width="600px" :visible.sync="attachInfosVisible">
      <OrderAttachInfos :formData="formData"></OrderAttachInfos>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="attachInfosVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment';
import AddressParse from '@/plugins/address-parse/parse';
import XLSX from 'xlsx';

import Remark from '@/partialviews/order/order/Remark';
import OrderDetail from '@/partialviews/order/order/Detail';
import PerfectLogistics from '@/partialviews/order/PerfectLogistics';
import LogisticsDetail from '@/partialviews/order/LogisticsDetail';

import CollageDetail from '@/partialviews/order/order/CollageDetail';

import SelectGoods from '@/partialviews/common/SelectGoods';

import OrderAttachInfos from '@/partialviews/order/OrderAttachInfos';

import {nTimePickerConfig} from '@/config';

export default {
  name: 'orders',
  components: {
    Remark,
    OrderDetail,
    PerfectLogistics,
    LogisticsDetail,
    SelectGoods,
    OrderAttachInfos,
    CollageDetail
  },
  data() {
    return {
      currentPage: 1,
      count: 1,

      showExtendFilter: false,  //是否显示高级筛选项（商品筛选、物流信息筛选）
      queryForm: {
        searOrderSn: '',
        order_sign: [],
        searType: null,
        order_type: null,
        pay_type: null,
        pay_channel: null,
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        deliveryDate: [],

        topUserPhone: '',
        topUserType: 2,

        exportPageNum: 1,
        exportNum: 1000,

        searUserName: '',
        searUserPhone: '',
        searShippingName: '',
        searShippingPhone: '',
        searShippingCode: '',
      },
      filter: {
        searOrderSn: '',
        order_sign: [],
        searType: null,
        order_type: null,
        pay_type: null,
        pay_channel: null,
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        deliveryDate: [],
        topUserPhone: '',
        topUserType: 2,

        exportPageNum: 1,
        exportNum: 1000,

        searUserName: '',
        searUserPhone: '',
        searShippingName: '',
        searShippingPhone: '',
        searShippingCode: '',
      },
      categories: [],
      statusTexts: {
        [1]: '未支付',
        [2]: '支付成功',
        [3]: '已发货',
        [4]: '已签收',
        [5]: '售后申请',
        [6]: '售后中',
        [7]: '售后成功',
        [8]: '已完成',
        [-1]: '已取消',
        [-2]: '超时自动关闭',
        [-3]: '已关闭',
        [-4]: '未成功拼团'
      },
      statusColors: {
        [1]: 'warning-color',
        [5]: 'error-color',
        [6]: 'warning-color',
        [-1]: 'tips-color'
      },
      // 支付商通道
      payChannelTexts: {
        [1]: '微信支付',
        [2]: '汇聚支付',
        [3]: '杉德支付',
        [4]: '银盛支付',
        [88]: '其他'
      },
      payTypeTexts: {
        [1]: '余额支付',
        [2]: '微信支付',  //现金支付
        [4]: '拼拼支付',
        [5]: '集品券支付',
        [6]: '协议支付',
        [7]: '集品豆支付'
      },
      shippingStatusText: {
        [1]: '支付成功',
        [2]: '备货中',
        [3]: '已发货'
      },
      shippingTypeTexts: {
        [1]: '——', //常规
        [2]: '免物流'
      },
      flagColor: {
        [1]: 'red',
        [2]: 'yellow',
        [3]: 'green',
        [4]: 'blue',
        [5]: 'purple'
      },
      ...nTimePickerConfig,

      dataList: [],

      formData: {},
      logisticsData: [],
      logistics: {},
      logisticsCompanys: [],

      selectGoodsInfo: {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: '',
        searGoodsSkuSn: '',
        title: ''
      },

      thumbData: {
        type: 1
      },
      token: localStorage.getItem('token').token,
      validDatas: [],
      validVisible: false,

      detailVisible: false,
      updateLogisticsVisible: false,
      logisticsVisible: false,
      remarkVisible: false,
      selectGoodsVisible: false,      //指定商品筛选
      attachInfosVisible: false,      //海外购补充信息
      collageDetailVisible: false,

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
        searOrderSn: '',
        order_sign: [],
        searType: null,
        order_type: null,
        pay_type: null,
        pay_channel: null,
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        deliveryDate: [],

        topUserPhone: '',
        topUserType: 2,

        exportPageNum: 1,
        exportNum: 1000,

        searUserName: '',
        searUserPhone: '',
        searShippingName: '',
        searShippingPhone: '',
        searShippingCode: '',
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        searOrderSn:  this.queryForm.searOrderSn,
        order_sign: this.queryForm.order_sign,
        searType: this.queryForm.searType,
        order_type: this.queryForm.order_type,
        pay_type: this.queryForm.pay_type,
        pay_channel: this.queryForm.pay_channel,
        createDate: this.queryForm.createDate,
        deliveryDate: this.queryForm.deliveryDate,

        topUserPhone: this.queryForm.topUserPhone,
        topUserType: this.queryForm.topUserType,

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum,

        searUserName: this.queryForm.searUserName,
        searUserPhone: this.queryForm.searUserPhone,
        searShippingName: this.queryForm.searShippingName,
        searShippingPhone: this.queryForm.searShippingPhone,
        searShippingCode: this.queryForm.searShippingCode
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        searOrderSn:  this.filter.searOrderSn,
        order_sign: this.filter.order_sign,
        searType: this.filter.searType,
        order_type: this.filter.order_type,
        pay_type: this.filter.pay_type,
        pay_channel: this.filter.pay_channel,
        order_belong: 1,

        topUserPhone: this.filter.topUserPhone
      };


      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        queryVal.searUserName = this.filter.searUserName;
        queryVal.searUserPhone = this.filter.searUserPhone;
        queryVal.searShippingName = this.filter.searShippingName;
        queryVal.searShippingPhone = this.filter.searShippingPhone;
        queryVal.searShippingCode = this.filter.searShippingCode;

        if(this.selectGoodsInfo.searGoodsSpuSn) queryVal.searGoodsSpuSn = this.selectGoodsInfo.searGoodsSpuSn;
        if(this.selectGoodsInfo.searGoodsSkuSn) queryVal.searGoodsSkuSn = this.selectGoodsInfo.searGoodsSkuSn;

        if(queryVal.searUserPhone && !/^1[3456789]\d{9}$/.test(queryVal.searUserPhone)) {
          return this.$message.error('筛选 用户手机号码 格式有误，请检查或留空');
        }
        if(queryVal.searShippingPhone && !/^1[3456789]\d{9}$/.test(queryVal.searShippingPhone)) {
          return this.$message.error('筛选 收件人手机号码 格式有误，请检查或留空');
        }
      }


      if(this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }
      if(this.filter.deliveryDate.length == 2) {
        queryVal.delivery_start_time = this.filter.deliveryDate[0];
        queryVal.delivery_end_time = this.filter.deliveryDate[1];
      }

      if(!queryVal.start_time || !queryVal.end_time) {
        return this.$message.error('请选择开始时间和结束时间，再进行查询操作。建议时间跨度不要过大');
      }

      if(queryVal.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(queryVal.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      } else {
        queryVal.topUserType = this.filter.topUserType;
      }

      this.dataLoading = true;
      this.$post('/admin/order/list', queryVal, res => {
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
        searOrderSn:  this.filter.searOrderSn,
        order_sign: this.filter.order_sign,
        searType: this.filter.searType,
        order_type: this.filter.order_type,
        pay_type: this.filter.pay_type,
        pay_channel: this.filter.pay_channel,
        order_belong: 1
      };


      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        queryVal.searUserName = this.filter.searUserName;
        queryVal.searUserPhone = this.filter.searUserPhone;
        queryVal.searShippingName = this.filter.searShippingName;
        queryVal.searShippingPhone = this.filter.searShippingPhone;
        queryVal.searShippingCode = this.filter.searShippingCode;

        if(this.selectGoodsInfo.searGoodsSpuSn) queryVal.searGoodsSpuSn = this.selectGoodsInfo.searGoodsSpuSn;
        if(this.selectGoodsInfo.searGoodsSkuSn) queryVal.searGoodsSkuSn = this.selectGoodsInfo.searGoodsSkuSn;

        if(queryVal.searUserPhone && !/^1[3456789]\d{9}$/.test(queryVal.searUserPhone)) {
          return this.$message.error('筛选 用户手机号码 格式有误，请检查或留空');
        }
        if(queryVal.searShippingPhone && !/^1[3456789]\d{9}$/.test(queryVal.searShippingPhone)) {
          return this.$message.error('筛选 收件人手机号码 格式有误，请检查或留空');
        }
      }


      if(this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }
      if(this.filter.deliveryDate.length == 2) {
        queryVal.delivery_start_time = this.filter.deliveryDate[0];
        queryVal.delivery_end_time = this.filter.deliveryDate[1];
      }

      if(!queryVal.start_time || !queryVal.end_time) {
        return this.$message.error('请选择开始时间和结束时间，再进行查询操作。建议时间跨度不要过大');
      }

      this.dataLoading = true;
      this.$spost('/admin/order/list', queryVal, res => {
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


    extendFilter() {
      this.showExtendFilter = !this.showExtendFilter;
    },
    showSelectGoods() {
      this.selectGoodsVisible = true;
    },
    confirmSelectGoods() {
      let selectGoodsInfo = this.$refs.selectGoods.confirmSelectResult();
      if(
        (!selectGoodsInfo.searGoodsSkuSn || selectGoodsInfo.searGoodsSkuSn.length == 0) &&
        (!selectGoodsInfo.searGoodsSpuSn || selectGoodsInfo.searGoodsSpuSn.length == 0)) {
        return this.$message.error('请选择至少一项spu或者sku');
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

    openDetail(row) {
      let params = {
        order_sn: row.order_sn
      };

      this.$get('/admin/order/info', params, res => {
        this.formData = res.data;
        for(let i = 0; i < this.formData.goods.length; i++) {
          let attrs = JSON.parse(this.formData.goods[i].specs);
          this.formData.goods[i].attrs = Object.values(attrs).join(',');
        }
        this.detailVisible = true;
      });
    },

    showCollageDetail(row) {
      if(!row.pt_group || row.pt_group.length == 0) return this.$message.warning('该拼团订单无效');
      let formData = {
        pt_name: row.pt_group[0].activity_title,
        group_number: row.pt_group[0].group_number,
        start_time: row.pt_group[0].start_time,
        end_time: row.pt_group[0].end_time
      }
      formData.users = [];
      for(let i = 0; i < row.pt_group.length; i++) {
        let user = {
          avatarUrl: row.pt_group[i].user.avatarUrl,
          name: row.pt_group[i].user.name,
          phone: row.pt_group[i].user.phone,
          create_time: row.pt_group[i].create_time,
          pay_status: row.pt_group[i].pay_status,
          real_pay_price: row.pt_group[i].real_pay_price,
          activity_status: row.pt_group[i].activity_status
        }
        formData.users.push(user);
      }
      this.formData = formData;
      this.collageDetailVisible = true;
    },



    checkLogistics(row) {
      let params = {
        shipping_code: row.shipping_code
      };

      this.$get('/admin/ship/info', params, res => {
        let logisticsInfo = res.data;
        let keys = Object.keys(logisticsInfo);
        let values = Object.values(logisticsInfo);
        let logisticsData = [];
        for(let i = 0; i < keys.length; i++) {
          logisticsData.push({
            shipping_code: keys[i],
            company_name: values[i][0] ? values[i][0].company_name : '未知名物流',
            logistics: values[i]
          })
        }
        this.logisticsData = logisticsData;
        this.logisticsVisible = true;
      });
    },

    showRemark(row) {
      this.formData = {
        order_sn: row.order_sn,
        order_remark: row.order_remark,
        order_sign: row.order_sign || null,
        seller_remark: row.seller_remark || ''
      }
      this.remarkVisible = true;
    },
    remarkOrder() {
      let params = {
        order_sn: this.formData.order_sn,
        order_sign: this.formData.order_sign || [],
        seller_remark: this.formData.seller_remark
      }
      this.$post('/admin/order/remark', params, res => {
        this.$message.success('备注成功');
        this.reloadPage();
        this.remarkVisible = false;
      });
    },

    showAttachInfos(order) {
      let attach = order.attach;
      this.formData = attach;
      this.attachInfosVisible = true;
    },

    // 导出excel表格
    exportExcel() {
      let params = {
        searOrderSn:  this.filter.searOrderSn,
        order_sign: this.filter.order_sign,
        searType: this.filter.searType,
        order_type: this.filter.order_type,
        not_order_type: 6, // 普通订单导出
        pay_type: this.filter.pay_type,
        pay_channel: this.filter.pay_channel,
        order_belong: 1,

        topUserPhone: this.filter.topUserPhone,

        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        params.searUserName = this.filter.searUserName;
        params.searUserPhone = this.filter.searUserPhone;
        params.searShippingName = this.filter.searShippingName;
        params.searShippingPhone = this.filter.searShippingPhone;
        params.searShippingCode = this.filter.searShippingCode;

        if(this.selectGoodsInfo.searGoodsSpuSn) params.searGoodsSpuSn = this.selectGoodsInfo.searGoodsSpuSn;
        if(this.selectGoodsInfo.searGoodsSkuSn) params.searGoodsSkuSn = this.selectGoodsInfo.searGoodsSkuSn;

        if(params.searUserPhone && !/^1[3456789]\d{9}$/.test(params.searUserPhone)) {
          return this.$message.error('筛选 用户手机号码 格式有误，请检查或留空');
        }
        if(params.searShippingPhone && !/^1[3456789]\d{9}$/.test(params.searShippingPhone)) {
          return this.$message.error('筛选 收件人手机号码 格式有误，请检查或留空');
        }
      }

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        params.start_time = this.filter.createDate[0];
        params.end_time = this.filter.createDate[1];
      }
      if(this.filter.deliveryDate && this.filter.deliveryDate.length == 2) {
        params.delivery_start_time = this.filter.deliveryDate[0];
        params.delivery_end_time = this.filter.deliveryDate[1];
      }
      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      if(params.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(params.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      } else {
        params.topUserType = this.filter.topUserType;
      }

      this.$post('/admin/excel/order', params, res => {
        let data = res.data.list || [];

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('订单数超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        for(let i = 0; i < data.length; i++) {
          let shipping_address = data[i].shipping_address;
          let discernResults = AddressParse.parse(shipping_address);
          if(!discernResults || discernResults.length === 0) continue;  //没有任何结果，不做任何数据填充
          let address = discernResults[0];
          if(!address.area || address.area === '') continue;  //数据可信任度比较低，不做数据填充。对东莞和中山做额外判断

          data[i].province = address.province;
          data[i].city = address.city;
          data[i].area = address.area;
          data[i].detailAddress = address.details;
        }

        let excelData = [];
        excelData.push([
          '订单号',
          '买家昵称',
          '省',
          '市',
          '区',
          '商品名',
          '用户备注',
          '卖家备注',
          '订单总价',
          '实际支付',
          '下单时间',
          '收货时间',
          '订单状态',
          '支付方式',
          '支付商类型']);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          let attachInfo = item.is_attach_order && item.attach ? `${item.attach.real_name} ${item.attach.id_card}` : '';
          let idCardFront = item.is_attach_order && item.attach ? item.attach.id_card_front : '';
          let idCardBack = item.is_attach_order && item.attach ? item.attach.id_card_back : '';

          excelData.push([
            item.order_sn,
            item.user_name,
            item.province || '',  //省
            item.city || '',  //市
            item.area || '',  //区
            item.all_goods_title,
            item.order_remark,
            item.seller_remark,
            item.total_price,
            item.real_pay_price,
            item.create_time,
            item.delivery_time,
            this.statusTexts[item.order_status],
            this.payTypeTexts[item.pay_type],
            item.pay_type == 2 || item.pay_type == 6 ? this.payChannelTexts[item.pay_channel] : '',
            attachInfo,
            idCardFront,
            idCardBack
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 120},
          {wpx: 80},
          {wpx: 80},
          {wpx: 80},
          {wpx: 150},
          {wpx: 200},
          {wpx: 160},
          {wpx: 100},
          {wpx: 100},
          {wpx: 150},
          {wpx: 150},
          {wpx: 80},
          {wpx: 80},
          {wpx: 140},
          {wpx: 100},
          {wpx: 100}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let totalPriceRange = XLSX.utils.encode_cell({r: i , c: 8});
          ws[totalPriceRange].t = 'n';
          let realPayRange = XLSX.utils.encode_cell({r: i , c: 9});
          ws[realPayRange].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "订单列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `订单列表${time}.xlsx`);
      });
    },

    exportDataExcel() {
      let params = {
        searOrderSn:  this.filter.searOrderSn,
        order_sign: this.filter.order_sign,
        searType: this.filter.searType,
        order_type: this.filter.order_type,
        pay_type: this.filter.pay_type,
        pay_channel: this.filter.pay_channel,
        not_order_type: 6, // 普通订单导出
        order_belong: 1,

        topUserPhone: this.filter.topUserPhone,

        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        params.searUserName = this.filter.searUserName;
        params.searUserPhone = this.filter.searUserPhone;
        params.searShippingName = this.filter.searShippingName;
        params.searShippingPhone = this.filter.searShippingPhone;
        params.searShippingCode = this.filter.searShippingCode;

        if(this.selectGoodsInfo.searGoodsSpuSn) params.searGoodsSpuSn = this.selectGoodsInfo.searGoodsSpuSn;
        if(this.selectGoodsInfo.searGoodsSkuSn) params.searGoodsSkuSn = this.selectGoodsInfo.searGoodsSkuSn;

        if(params.searUserPhone && !/^1[3456789]\d{9}$/.test(params.searUserPhone)) {
          return this.$message.error('筛选 用户手机号码 格式有误，请检查或留空');
        }
        if(params.searShippingPhone && !/^1[3456789]\d{9}$/.test(params.searShippingPhone)) {
          return this.$message.error('筛选 收件人手机号码 格式有误，请检查或留空');
        }
      }

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        params.start_time = this.filter.createDate[0];
        params.end_time = this.filter.createDate[1];
      }
      if(this.filter.deliveryDate && this.filter.deliveryDate.length == 2) {
        params.delivery_start_time = this.filter.deliveryDate[0];
        params.delivery_end_time = this.filter.deliveryDate[1];
      }
      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      if(params.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(params.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      } else {
        params.topUserType = this.filter.topUserType;
      }

      this.$post('/admin/excel/order', params, res => {
        let list = res.data.list || [];
        let data = [];
        for(let i = 0; i < list.length; i++) {
          for(let j = 0; j < list[i].goods.length; j++) {
            let item = {
              ...list[i]
            };
            delete item.goods;
            item.goods = list[i].goods[j] || {};
            let specs = JSON.parse(item.goods.specs) || {};
            let attrs = Object.values(specs);
            item.goods.attr = attrs.join(' × ');
            data.push(item);
          }
        }

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('拆分出来的订单数据量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        let excelData = [];
        excelData.push([
          '订单编号',
          '支付时间',
          '收货时间',
          '运单编号',
          '订单状态',
          '支付方式',
          '支付商类型',
          '商品ID',
          '商品名称',
          '规格',
          '数量',
          '收货人',
          '收货人电话',
          '收货人地址',
          '产品成本',
          '零售价',
          '实付金额',
          '买家ID',
          '买家昵称',
          '买家会员身份',
          '推荐人昵称',
          '推荐人手机号',
          '推荐人等级',
          '直属卖家',
          '卖家手机号',
          '卖家等级',
          '归属上级lv3',
          'lv3电话',
          '归属大团队',
          '团队手机号']);

        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          let linker = {
            name: '',
            phone: '',
            vip_name: ''
          }
          let directSeller = {
            name: '',
            phone: '',
            vip_name: ''
          };
          let directlv3 = {
            name: '',
            phone: ''
          };
          let teamLeader = {
            name: '',
            phone: ''
          }
          if(item.link_user_info && item.link_user_info.uid) {
            linker = {
              name: item.link_user_info.name,
              phone: item.link_user_info.phone,
              vip_name: item.link_user_info.vip_name
            }
          }
          if(item.divide_chain_user_info && item.divide_chain_user_info.length > 0) {
            directSeller = {
              name: item.divide_chain_user_info[0].name,
              phone: item.divide_chain_user_info[0].phone,
              vip_name: item.divide_chain_user_info[0].vip_name
            }
            for(let i = 0; i < item.divide_chain_user_info.length; i++) {
              if(item.divide_chain_user_info[i].vip_level == 1) {
                directlv3 = {
                  name: item.divide_chain_user_info[i].name,
                  phone: item.divide_chain_user_info[i].phone
                }
                break;
              }
            }
          }
          if(item.team_top_user_info && item.team_top_user_info.uid) {
            teamLeader = {
              name: item.team_top_user_info.name,
              phone: item.team_top_user_info.phone
            }
          }

          excelData.push([
            item.order_sn,
            item.create_time,
            item.delivery_time,
            item.shipping_code || '',
            item.order_status == 2 ? this.shippingStatusText[item.shipping_status] : this.statusTexts[item.order_status],
            this.payTypeTexts[item.pay_type],
            item.pay_type == 2 || item.pay_type == 6 ? this.payChannelTexts[item.pay_channel] : '',
            item.goods.goods_code || '',
            item.goods.title || '',
            item.goods.attr || '',
            item.goods.count || 0,
            item.shipping_name || '',
            item.shipping_phone || '',
            item.shipping_address || '',
            item.goods.cost_price || 0,
            item.goods.sale_price || 0,
            item.goods.real_pay_price || 0,
            item.user_phone || '',
            item.user_name || '',
            item.user_level_name || '游客',
            linker.name,
            linker.phone,
            linker.vip_name,
            directSeller.name,
            directSeller.phone,
            directSeller.vip_name,
            directlv3.name,
            directlv3.phone,
            teamLeader.name,
            teamLeader.phone
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 140},
          {wpx: 140},
          {wpx: 140},
          {wpx: 80},
          {wpx: 80},
          {wpx: 90},
          {wpx: 250},
          {wpx: 150},
          {wpx: 80},
          {wpx: 100},
          {wpx: 100},
          {wpx: 280},
          {wpx: 80},
          {wpx: 80},
          {wpx: 80},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 180},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100}
        ]

        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let col9 = XLSX.utils.encode_cell({r: i , c: 9});
          ws[col9].t = 'n';
          let col13 = XLSX.utils.encode_cell({r: i , c: 13});
          ws[col13].t = 'n';
          let col14 = XLSX.utils.encode_cell({r: i , c: 14});
          ws[col14].t = 'n';
          let col15 = XLSX.utils.encode_cell({r: i , c: 15});
          ws[col15].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "订单数据列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `订单数据列表${time}.xlsx`);

      })
    }





  }
};
</script>

<style lang="less" scoped>
.order-uploader {
  display: inline-block;
}

// 高级搜索
.filter-extend-trigger-box {
  display: flex;
  justify-content: flex-end;
  font-size: 14px;
}

.filter-extend-trigger {
  color: #66b1ff;
  user-select: none;
  cursor: pointer;
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

.pt-type-ctrl {
  user-select: none;
  cursor: pointer;
}
</style>
