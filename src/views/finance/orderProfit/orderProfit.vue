<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="订单号" prop="order_sn">
              <el-input v-model="queryForm.order_sn" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="团队长" prop="username">
              <el-input v-model="queryForm.username" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="下单时间" prop="keyword">
              <el-date-picker
                v-model="createDate"
                type="datetimerange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="timestamp"
                :clearable="false"
                align="right"
              ></el-date-picker>
            </el-form-item>
            
            <el-form-item label="状态" prop="searType">
              <el-select placeholder="不限" name="searType" v-model="queryForm.searType">
                <el-option label="不限" value=""></el-option>
                <el-option v-for="item in Object.keys(statusTexts)" :label="statusTexts[item]" :value="item" :key="item"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="归属活动" prop="order_type">
              <el-select placeholder="活动类型" name="order_type" v-model="queryForm.order_type" @change="handleOrderTypeChange">
                <el-option label="不限" value></el-option>
                <el-option label="普通活动" :value="1"></el-option>
                <el-option label="拼团活动" :value="2"></el-option>
                <el-option label="团长大礼包" :value="3"></el-option>
                <el-option label="拼拼活动" :value="4"></el-option>
              </el-select>
              <el-select v-if="queryForm.order_type && queryForm.order_type !== ''" placeholder="请选择" name="activity_sign" v-model="queryForm.activity_sign">
                <el-option v-for="item in activities" :label="item.name" :value="item.activity_sign" :key="item.activity_sign"></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="导出类型" prop="needFormatList" title="仅针对导出订单">
              <el-select placeholder="按订单" name="needFormatList" v-model="queryForm.needFormatList">
                <el-option label="按订单" :value="1"></el-option>
                <el-option label="按订单分商品" :value="2"></el-option>
              </el-select>
            </el-form-item> -->
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

            <el-form-item>
              <el-button type="primary" @click="queryInfo">查询</el-button>
              <el-button @click="resetQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        
        <div class="filter-extend-trigger-box">
          <div class="filter-extend-trigger" @click="extendFilter">{{showExtendFilter ? '∧折叠' : '∨展开'}}高级搜索</div>
        </div>

      </div>
    </div>

    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">收益列表</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('divide/console')">
              <el-button @click="getConsole(true)">刷新面板缓存</el-button>
            </template>
            <template v-if="$auths.includes('excel/incomeList')">
              <el-button type="primary" @click="exportExcel">导出excel表格</el-button>
            </template>
          </div>
        </div>
        <div v-loading="consoleLoading" class="order-profit-overviews">
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">总金额</div>
            <div class="order-profit-overview-val">{{consoleInfo.total_price}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">实际总金额</div>
            <div class="order-profit-overview-val">{{consoleInfo.real_total_price}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">成本</div>
            <div class="order-profit-overview-val">{{consoleInfo.total_cost}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">销售佣金</div>
            <div class="order-profit-overview-val">{{consoleInfo.total_direct_price}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">教育奖金</div>
            <div class="order-profit-overview-val">{{consoleInfo.total_indirect_price}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">金融服务费</div>
            <div class="order-profit-overview-val">{{consoleInfo.total_server_price}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">退款总金额</div>
            <div class="order-profit-overview-val">{{consoleInfo.total_refund}}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">利润</div>
            <div class="order-profit-overview-val">{{consoleInfo.total_profit}}</div>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <!-- <el-table-column label="序号" width="80" prop="id"></el-table-column> -->
          <el-table-column label="订单号" width="190">
            <template slot-scope="scope">
              <div :class="{'warning-color': scope.row.coder_remark}">
                <div v-if="scope.row.coder_remark" class="origin-cost">
                  <el-tooltip content="该订单应运营要求，有特殊调整。如对账有问题的话请和运维人员联系" placement="top">
                    <span class="warning-color">
                      <i class="el-icon el-icon-warning"></i>
                      {{scope.row.order_sn}}
                    </span>
                  </el-tooltip>
                </div>
                <div v-else>
                  {{scope.row.order_sn}}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品名">
            <template slot-scope="scope">
              <template v-for="(item, index) in scope.row.goods">
                <div :key="index">
                  {{item.name}} ×{{item.count || 0}}
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="总金额" width="80">
            <template slot-scope="scope"> 
              <div v-if="scope.row.exist_before_shipping_after_sale" class="origin-cost">
                <el-tooltip :content="'有商品在未备货时申请了退售后，统计时总价在这里补上了对应邮费 ' + scope.row.supplement_fare_price + ' 元'" placement="bottom">
                  <span class="error-color">{{scope.row.total_price}}</span>
                </el-tooltip>
              </div>
              <div v-else>
                {{scope.row.total_price}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="退售后"	width="80" prop="refund_price" >
            <template slot-scope="scope">
              <template v-if="scope.row.refund_price && scope.row.refund_price != 0">
                <span class="warning-color">
                  {{scope.row.refund_price}}
                </span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="总优惠券" width="80" prop="coupon_dis"></el-table-column>
          <el-table-column label="运费(独立计算)" width="80" prop="fare_price"></el-table-column>
          <el-table-column label="成本总计" width="100" prop="cost_price" align="center">
            <template slot-scope="scope"> 
              <div :class="{'warning-color': scope.row.cost_price != scope.row.original_cost_price}">
                {{scope.row.cost_price}}
              </div>
              <div v-if="scope.row.cost_price != scope.row.original_cost_price" class="origin-cost">
                <el-tooltip content="订单原成本，有商品在未备货时申请了退售后" placement="bottom">
                  <span>({{scope.row.original_cost_price}})</span>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="顶级分润" width="180" prop="divideTopUser">
            <template slot-scope="scope">
              <template v-if="scope.row.divideTopUser && scope.row.divideTopUser.link_user_name">
                {{scope.row.divideTopUser.link_user_name}}({{scope.row.divideTopUser.link_user_phone}})
                <br />分润￥
                <span class="error-color">{{scope.row.divideTopUser.real_divide_price || '0.00'}}</span>
              </template>
              <template v-if="!scope.row.divideTopUser || scope.row.divideTopUser.length == 0">——</template>
            </template>
          </el-table-column>
          <el-table-column label="实际总金额" width="100" prop="real_total_price"></el-table-column>
          <el-table-column label="支出奖金" width="80" prop="divide_price"></el-table-column>
          <el-table-column label="服务费" width="80" prop="server_price"></el-table-column>
          <el-table-column label="利润" width="80" prop="profit"></el-table-column>
          <el-table-column label="下单时间" width="160" prop="create_time"></el-table-column>

          <el-table-column label="操作" width="100" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="openDetail(scope.row)">详情</el-button>
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

      <el-dialog title="收益详情" width="1300px" :visible.sync="detailVisible">
        <OrderProfitDetail :formData="formData"></OrderProfitDetail>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="detailVisible = false">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="筛选商品" width="1200px" :close-on-click-modal="false" :visible.sync="selectGoodsVisible">
        <SelectGoods ref="selectGoods"></SelectGoods>
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
import XLSX from "xlsx";

import SelectGoods from '@/partialviews/common/SelectGoods';

import OrderProfitDetail from "@/partialviews/finance/orderProfit/OrderProfitDetail";

export default {
  name: "orderProfit",
  components: {
    OrderProfitDetail,
    SelectGoods,
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      showExtendFilter: false,
      queryForm: {
        username: "",
        order_sn: "",
        searType: null,
        needFormatList: 2,
        order_type: '',
        activity_sign: '',

        exportPageNum: 1,
        exportNum: 1000
      },
      filter: {
        username: "",
        order_sn: "",
        searType: null,
        needFormatList: 2,
        order_type: '',
        activity_sign: '',

        exportPageNum: 1,
        exportNum: 1000,
        
        start_time: moment().subtract(14, 'days').valueOf(),
        end_time: moment().valueOf()
      },

      dataList: [],
      activities: [],
      formData: {},

      consoleInfo: {
        total_price: "——",
        real_total_price: "——",
        total_cost: "——",
        total_profit: "——",
        total_direct_price: "——",
        total_indirect_price: "——",
        total_server_price: "——",
      },
      consoleLoading: false,
      
      selectGoodsInfo: {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: '',
        searGoodsSkuSn: '',
        title: ''
      },

      typeText: {
        [1]: "常规分润",
        [2]: "普通用户推荐首单返积分",
        [3]: "会员推荐首次分润",
        [4]: "会员订单分润",
      },
      statusTexts: {
        [1]: '未支付',
        [2]: '支付成功',
        [3]: '已发货',
        // [4]: '已签收',
        [5]: '售后申请',
        [6]: '售后中',
        [7]: '售后成功',
        [8]: '已完成',
        [-1]: '已取消',
        [-2]: '超时自动关闭',
        [-3]: '已关闭',
        // [-4]: '未成功拼团'
      },
      afterSaleTexts: {
        [1]: '正常',
        [2]: '申请售后中',
        [3]: '售后中',
        [4]: '售后成功',
        [5]: '售后被拒',
        [-1]: '用户取消售后'
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "今日",
            onClick(picker) {
              let start =  moment(moment().format('YYYY-MM-DD 00:00:00')).valueOf();
              let end = moment(moment().format('YYYY-MM-DD 23:59:59')).valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "本周",
            onClick(picker) {
              let weekOfday = parseInt(moment().format('d')) // 计算今天是这周第几天  周日为一周中的第一天
              let start = moment(moment().subtract(weekOfday, 'days').format('YYYY-MM-DD 00:00:00')).valueOf();
              let end = moment(moment().add(7 - weekOfday - 1, 'days').format('YYYY-MM-DD 23:59:59')).valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "本月",
            onClick(picker) {
              let start = moment(moment(moment().format('YYYY-MM') + '-01').format('YYYY-MM-DD 00:00:00')).valueOf();
              let end = moment(moment(start).add('month', 1).add('days', -1).format('YYYY-MM-DD 23:59:59')).valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一周",
            onClick(picker) {
              let start = moment().subtract(7, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              let start = moment().subtract(30, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              let start = moment().subtract(90, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      createDate: [moment().subtract(14, 'days').valueOf(), moment().valueOf()],

      detailVisible: false,
      selectGoodsVisible: false

    };
  },
  mounted() {
    this.getList();
    this.getConsole();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        username: "",
        order_sn: "",
        searType: null,
        needFormatList: 2,
        order_type: '',
        activity_sign: '',

        exportPageNum: 1,
        exportNum: 1000,
        
        start_time: moment().subtract(14, 'days').valueOf(),
        end_time: moment().valueOf()
      };
      this.createDate = [moment().subtract(14, 'days').valueOf(), moment().valueOf()];
      this.currentPage = 1;
      this.getList();
      this.getConsole();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        username: this.queryForm.username,
        order_sn: this.queryForm.order_sn,
        searType: this.queryForm.searType,
        needFormatList: this.queryForm.needFormatList,
        order_type: this.queryForm.order_type,
        activity_sign: this.queryForm.activity_sign,

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum
      };
      if(this.createDate && this.createDate.length == 2) {
        this.filter.start_time = this.createDate[0];
        this.filter.end_time = this.createDate[1];
      }

      this.getList();
      this.getConsole();
    },
    getConsole(clearCache = false) {
      if(this.consoleLoading) return;
      if (!this.$auths.includes("divide/console")) return;
      let params = {
        page: this.currentPage,
        order_sn: this.filter.order_sn,
        username: this.filter.username,
        searType: this.filter.searType,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };
      
      if(this.filter.order_type && this.filter.order_type !== '') {
        params.order_type = this.filter.order_type;
        if(!this.filter.activity_sign || this.filter.activity_sign == '') {
          return;
        }
        params.activity_sign = [this.filter.activity_sign];
      }
      if(clearCache) params.clearCache = true;
      if(this.showExtendFilter) {
        if(this.selectGoodsInfo.searGoodsSkuSn) params.goods_sku = this.selectGoodsInfo.searGoodsSkuSn;
      }
      this.consoleLoading = true;
      this.$spost("/admin/divide/console", params, (res) => {
        let data = res.data;
        this.consoleInfo = data;
        this.consoleLoading = false;
      }, err => {
        this.consoleLoading = false;
      });
    },
    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        order_sn: this.filter.order_sn,
        username: this.filter.username,
        searType: this.filter.searType,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };
      
      if(this.filter.order_type && this.filter.order_type !== '') {
        queryVal.order_type = this.filter.order_type;
        if(!this.filter.activity_sign || this.filter.activity_sign == '') {
          return this.$message.error('请选择归属活动')
        }
        queryVal.activity_sign = [this.filter.activity_sign];
      }

      if(this.showExtendFilter) {
        if(this.selectGoodsInfo.searGoodsSkuSn) queryVal.goods_sku = this.selectGoodsInfo.searGoodsSkuSn;
      }

      this.$post("/admin/divide/divideList", queryVal, (res) => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          for(let j = 0; j < dataList[i].goods.length; j++) {
            let specs = JSON.parse(dataList[i].goods[j].specs);
            let attr = Object.values(specs);
            let attrInfo = attr.join('、');
            let name = `${dataList[i].goods[j].title}（${attrInfo}）`;
            dataList[i].goods[j].name = name;
            dataList[i].goods[j].attrs = attrInfo;
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

    getActivities() {
      let params = {
        type: this.queryForm.order_type
      };

      this.$get('/admin/activity/all', params, res => {
        this.activities =  res.data || [];
        this.queryForm.activity_sign = this.activities[0].activity_sign || '';
      });
    },
    handleOrderTypeChange() {
      this.queryForm.activity_sign = '';
      if(this.queryForm.order_type && this.queryForm.order_type !== '') this.getActivities();
    },


    openDetail(row) {
      this.formData = JSON.parse(JSON.stringify(row));
      this.formData.discount = (
        parseFloat(row.total_price || 0) - parseFloat(row.real_pay_price || 0)
      ).toFixed(2);
      this.detailVisible = true;
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


    exportExcel() {
      let params = {
        order_sn: this.filter.order_sn,
        username: this.filter.username,
        searType: this.filter.searType,
        order_belong: 1,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time,

        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      };

      if(this.filter.order_type && this.filter.order_type !== '') {
        params.order_type = this.filter.order_type;
        if(!this.filter.activity_sign || this.filter.activity_sign == '') {
          return this.$message.error('请选择归属活动')
        }
        params.activity_sign = [this.filter.activity_sign];
      }

      
      if (!params.start_time || !params.end_time) {
        return this.$message.error(
          "请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大"
        );
      }
      
      if(this.showExtendFilter) {
        if(this.selectGoodsInfo.searGoodsSkuSn) params.goods_sku = this.selectGoodsInfo.searGoodsSkuSn;
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }
      
      if (!params.start_time || !params.end_time) {
        return this.$message.error(
          "请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大"
        );
      }

      this.$post("/admin/excel/incomeList", params, (res) => {
        let data = res.data.list;
        let summary = res.data.summary;
        if (data.length == 0) {
          return this.$message.warning("查无数据，请检查");
        }
        if (data.length > 100000) {
          return this.$message.warning(
            "数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理"
          );
        }

        if(this.filter.needFormatList == 1) {
          this.tryExportOrdersExcel(data, summary);
        } else {
          this.tryExportGoodsExcel(data);
        }

      });
    },
    // 按订单导出
    /**
     * @param data 源数据
     * @param summary 汇总信息
     */
    tryExportOrdersExcel(data, summary) {
      let excelData = [];
      excelData.push([
        "订单号",
        "商品名",
        "订单用户",
        "推荐用户",
        "归属活动",
        "供应商",
        "下单时间",
        "订单状态",
        "确认收货时间",
        "成交金额",
        "收取运费",
        "优惠券金额",
        "退售金额",
        "商品成本",
        "支付运费",
        "售后应扣供应商金额",
        "对账成本调整",
        "商城销售佣金",
        "商城教育奖金",
        "佣金服务费",
        "金融服务费",
        "增值税",
        "财务收入",
        "利润（税后）"
      ]);
      
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let goodsTitle = [], supplierNames = [];
        if(item.goods) {
          for(let j = 0; j < item.goods.length; j++) {
            let specs = JSON.parse(item.goods[j].specs);
            let attr = Object.values(specs);
            let attrInfo = attr.join('、');
            let name = `${item.goods[j].title}（${attrInfo}） ×${item.goods[j].count || 0}`;
            goodsTitle.push(name);
            supplierNames.push(item.goods[j].supplier_name);
          } //商品标题、供应商
        }
        let user = item.userInfo || {};
        let directUser = item.order_user_top_info || {};

        let row = [
          item.order_sn,
          goodsTitle.join('；'),
          item.goods_sn || '',
          item.sku_sn || '',
          user.name ? `${user.name}(${user.phone || ''})` : '',
          directUser.name ?  `${directUser.name}(${directUser.phone || ''})` : '',
          item.activity_name ? item.activity_name.join('；') : '',
          supplierNames.join('；'),
          item.order_create_time,
          this.statusTexts[item.order_status],
          item.end_time || '',
          item.total_price || '0.00',
          item.fare_price || '0.00',
          item.coupon_dis || '0.00',
          item.refund_price || '0.00',
          item.cost_price || '0.00',
          item.correction_fare || '0.00',
          item.correction_supplier || '0.00',
          item.correction_cost || '0.00',
          item.direct_price || '0.00',
          item.indirect_price || '0.00',
          item.ks_server_price || '0.00',
          item.server_price || '0.00',
          item.VAT || '0.00',
          item.financial_income || '0.00',
          item.profit || '0.00',
        ]
      
        if(item.coder_remark) {
          row.push('该订单应运营要求已做特殊处理，如需对账请联系运维');
        } else {
          row.push('');
        }
        
        excelData.push(row);
      }


      // 导出excel
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws["!cols"] = [
        { wpx: 140 },
        { wpx: 300 },
        { wpx: 180 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 180 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 120 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 400 }
      ];
      const wb = XLSX.utils.book_new();
      let range = XLSX.utils.decode_range(ws["!ref"]);
      for (let i = range.s.r + 1; i <= range.e.r; i++) {
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
        let c18 = XLSX.utils.encode_cell({ r: i, c: 18 });
        ws[c18].t = "n";
        let c19 = XLSX.utils.encode_cell({ r: i, c: 19 });
        ws[c19].t = "n";
         let c20 = XLSX.utils.encode_cell({ r: i, c: 20 });
        ws[c20].t = "n";
        let c21 = XLSX.utils.encode_cell({ r: i, c: 21 });
        ws[c21].t = "n";
        let c22 = XLSX.utils.encode_cell({ r: i, c: 22 });
        ws[c22].t = "n";
        let c23 = XLSX.utils.encode_cell({ r: i, c: 23 });
        ws[c23].t = "n";
        let c24 = XLSX.utils.encode_cell({ r: i, c: 24 });
        ws[c24].t = "n";
      }
      ws["!ref"] = XLSX.utils.encode_range(range);

      // let totalInfo = [
      //   [], //空开一行
      //   [
      //     '总计',
      //     '',
      //     summary.total_price,
      //     summary.total_cost,
      //     summary.total_coupon_dis,
      //     summary.total_fare_price,
      //     summary.total_direct_price,
      //     summary.total_indirect_price,
      //     summary.total_server_price,
      //     '',
      //     summary.total_refund,
      //     summary.total_profit
      //   ],
      // ]
      // XLSX.utils.sheet_add_aoa(ws, totalInfo, {origin:-1}); //往最后面加数据

      XLSX.utils.book_append_sheet(wb, ws, "订单收益列表");

      let time = moment().format("YYYYMMDDHHmm");
      /* generate file and send to client */
      XLSX.writeFile(wb, `订单收益列表${time}.xlsx`);
    },
    // 按商品导出
    /**
     * @param data 源数据
     */
    tryExportGoodsExcel(data) {
      let goods = [];

      for(let i = 0; i < data.length; i++) {
        let item = data[i];
        for(let j = 0; j < item.goods.length; j++) {
          let rows = JSON.parse(JSON.stringify(item.goods[j]));
          let baseInfo = JSON.parse(JSON.stringify(item));
          delete baseInfo.goods;

          let specs = JSON.parse(rows.specs);
          let attr = Object.values(specs);
          let attrInfo = attr.join('、');
          let name = `${rows.title}（${attrInfo}）`;
          rows.name = name;
          rows.attrs = attrInfo;

          let keys = Object.keys(baseInfo);
          let vals = Object.values(baseInfo);
          for(let k = 0; k < keys.length; k++) {
            rows[`base_${keys[k]}`] = vals[k];
          }
          goods.push(rows);
        }
      }

      let excelData = [];
      excelData.push([
        "订单号",
        // "商品名",
        "商品名称",
        "属性",
        "产品编码",
        "商品编码",
        "数量",
        "订单用户",
        "推荐用户",
        "归属活动",
        "供应商",
        "下单时间",
        "订单状态",
        "确认收货时间",
        "成交金额",
        "收取运费",
        "优惠券金额",
        "退售金额",
        "商品成本",
        "支付运费",
        "售后应扣供应商金额",
        "对账成本调整",
        "商城销售佣金",
        "商城教育奖金",
        "佣金服务费",
        "金融服务费",
        "增值税",
        "财务收入",
        "利润（税后）"
      ]);
      for (let i = 0; i < goods.length; i++) {
        let item = goods[i];
        let user = item.base_userInfo || {};
        let directUser = item.base_order_user_top_info || {};

        let row = [
          item.base_order_sn,
          // item.name,
          item.title || '',
          item.attrs || '',
          item.goods_sn || '',
          item.sku_sn || '',
          item.count || '',
          user.name ? `${user.name}(${user.phone || ''})` : '',
          directUser.name ?  `${directUser.name}(${directUser.phone || ''})` : '',
          item.base_activity_name ? item.base_activity_name.join('；') : '',
          item.supplier_name || '',
          item.base_order_create_time,
          item.after_status != 1 && item.after_status != -1 ? this.afterSaleTexts[item.after_status] : this.statusTexts[item.base_order_status],
          item.base_end_time || '',
          item.total_price || '0.00',
          item.fare_price || '0.00',
          item.coupon_dis || '0.00',
          item.refund_price || '0.00',
          item.cost_price || '0.00',
          item.correction_fare || '0.00',
          item.correction_supplier || '0.00',
          item.correction_cost || '0.00',
          item.direct_price || '0.00',
          item.indirect_price || '0.00',
          item.ks_server_price || '0.00',
          item.server_price || '0.00',
          item.VAT || '0.00',
          item.financial_income || '0.00',
          item.profit || '0.00',
        ]
      
        if(item.coder_remark) {
          row.push('该订单应运营要求已做特殊处理，如需对账请联系运维');
        } else {
          row.push('');
        }
        
        excelData.push(row);
      }

      // 导出excel
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws["!cols"] = [
        { wpx: 140 },
        // { wpx: 300 },
        { wpx: 350 },
        { wpx: 200 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 180 },
        { wpx: 180 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 120 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 80 },
        { wpx: 400 }
      ];
      const wb = XLSX.utils.book_new();
      let range = XLSX.utils.decode_range(ws["!ref"]);
      for (let i = range.s.r + 1; i <= range.e.r; i++) {
        // let c9 = XLSX.utils.encode_cell({ r: i, c: 9 });
        // ws[c9].t = "n";
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
        let c18 = XLSX.utils.encode_cell({ r: i, c: 18 });
        ws[c18].t = "n";
        let c19 = XLSX.utils.encode_cell({ r: i, c: 19 });
        ws[c19].t = "n";
         let c20 = XLSX.utils.encode_cell({ r: i, c: 20 });
        ws[c20].t = "n";
        let c21 = XLSX.utils.encode_cell({ r: i, c: 21 });
        ws[c21].t = "n";
        let c22 = XLSX.utils.encode_cell({ r: i, c: 22 });
        ws[c22].t = "n";
        let c23 = XLSX.utils.encode_cell({ r: i, c: 23 });
        ws[c23].t = "n";
        let c24 = XLSX.utils.encode_cell({ r: i, c: 24 });
        ws[c24].t = "n";
        let c25 = XLSX.utils.encode_cell({ r: i, c: 25 });
        ws[c25].t = "n";
        let c26 = XLSX.utils.encode_cell({ r: i, c: 26 });
        ws[c26].t = "n";
        let c27 = XLSX.utils.encode_cell({ r: i, c: 27 });
        ws[c27].t = "n";
        let c28 = XLSX.utils.encode_cell({ r: i, c: 28 });
        ws[c28].t = "n";
      }
      ws["!ref"] = XLSX.utils.encode_range(range);

      XLSX.utils.book_append_sheet(wb, ws, "订单收益列表");

      let time = moment().format("YYYYMMDDHHmm");
      /* generate file and send to client */
      XLSX.writeFile(wb, `订单收益分商品列表${time}.xlsx`);
    }
  },
};
</script>

<style lang="less" scoped>
.order-profit-overviews {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 30px;
}
.order-profit-overview {
  width: 120px;
  min-width: 120px;
  height: 80px;
  padding: 5px 10px;
  margin-bottom: 10px;
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

.origin-cost {
  color: #999;
  cursor: help;
}
</style>