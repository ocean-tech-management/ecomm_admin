<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">

        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
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
            <el-form-item label="状态" prop="searType">
              <el-select placeholder="不限" name="searType" v-model="queryForm.searType">
                <el-option label="不限" value=""></el-option>
                <el-option v-for="item in Object.keys(statusTexts)" :label="statusTexts[item]" :value="item" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="拼拼订单号" prop="searOrderSn">
              <el-input v-model="queryForm.searOrderSn" placeholder="请填入完整拼拼订单号" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="支付流水号" prop="searPayNo">
              <el-input v-model="queryForm.searPayNo" placeholder="请填入完整支付流水号" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="参与类型" prop="user_role">
              <el-select placeholder="不限" name="user_role" v-model="queryForm.user_role">
                <el-option label="不限" value=""></el-option>
                <el-option label="开团" :value="1"></el-option>
                <el-option label="参团" :value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="发货寄售" prop="shipping_status">
              <el-select placeholder="不限" name="shipping_status" v-model="queryForm.shipping_status">
                <el-option label="不限" value=""></el-option>
                <el-option label="已发货" :value="1"></el-option>
                <el-option label="已寄售" :value="2"></el-option>
                <el-option label="待操作" :value="3"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="资金情况" prop="pay_status">
              <el-select placeholder="不限" name="pay_status" v-model="queryForm.pay_status">
                <el-option label="不限" value=""></el-option>
                <el-option label="未付款" :value="1"></el-option>
                <el-option label="已付款" :value="2"></el-option>
                <el-option label="取消付款" :value="-1"></el-option>
                <el-option label="已退款" :value="-2"></el-option>
              </el-select>
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
            <el-form-item label="用户昵称" prop="searUserName">
              <el-input v-model="queryForm.searUserName" placeholder="请完整填入" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="用户手机" prop="searUserPhone">
              <el-input v-model="queryForm.searUserPhone" placeholder="请完整填入" @keyup.enter.native="queryInfo" maxlength="11"></el-input>
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
      <div v-loading="dataLoading" class="default-container">
        <div class="table-ctrls">
          <div class="table-title">拼拼订单列表</div>
          <div class="table-ctrl">
            <el-button style="margin-right: 15px;" @click="sgetList">
              <i class="el-icon el-icon-refresh"></i>
            </el-button>
            <template v-if="$auths.includes('excel/ppylOrder')">
              <el-button type="primary" @click="exportExcel">导出Excel表格</el-button>
            </template>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="拼拼订单号" width="180" prop="order_sn"></el-table-column>
          <el-table-column label="用户昵称" width="100" prop="user_name"></el-table-column>
          <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>
          <el-table-column label="商品" prop="goods_info" width="150">
          </el-table-column>
          <el-table-column label="归属活动" prop="activity_title" width="100">
          </el-table-column>
          <el-table-column label="归属专区" prop="area_title" width="100">
          </el-table-column>
          <el-table-column label="实际支付" width="100" prop="real_pay_price" align="center">
          </el-table-column>
          <el-table-column label="支付流水号" width="170" prop="pay_no"></el-table-column>

          <el-table-column label="下单日期" width="150" prop="create_time"></el-table-column>
          <el-table-column label="成团信息" width="130" prop="shipping_type" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.pay_status != -1" class="pt-type-ctrl" @click="showCollageDetail(scope.row)">
                <span v-if="scope.row.group_number != scope.row.group.length" class="error-color">
                  {{scope.row.group_number}}人团，已拼{{scope.row.group.length}}
                </span>
                <span v-else>人数已满</span>
              </div>
              <div v-else></div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" prop="status">
            <template slot-scope="scope">
              <div v-if="scope.row.pay_status == 2" :class="statusColors[scope.row.activity_status]">
                <!-- 成团 -->
                <template v-if="scope.row.activity_status == 2">
                  <!-- 成团结果 -->
                  {{winStatusTexts[scope.row.win_status]}}
                </template>
                <!-- 还没成团 -->
                <template v-else>
                  {{statusTexts[scope.row.activity_status]}}
                </template>
              </div>
              <div v-else-if="scope.row.pay_status == -2">
                <!-- 退款 -->
                <template v-if="scope.row.activity_status == -3">未拼中退款</template>
                <template v-else>已退款</template>
              </div>
              <div v-else-if="scope.row.pay_status" class="error-color">
                <!-- 其他支付状态 -->
                {{payStatusTexts[scope.row.pay_status]}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button v-if="scope.row.pay_status != -1" type="text" size="default" @click="openDetail(scope.row)">详情</el-button>
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

    </div>
    
    <el-dialog title="拼拼订单详情" width="1200px" :visible.sync="detailVisible">
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

    <el-dialog title="筛选商品" width="1200px" :close-on-click-modal="false" :visible.sync="selectGoodsVisible">
      <SelectGoods ref="selectGoods"></SelectGoods>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectGoodsVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelectGoods">确 定</el-button>
      </div>
    </el-dialog>
  </div>
  
</template>

<script>
import moment from 'moment';
import XLSX from 'xlsx';

import OrderDetail from '@/partialviews/ppyl/order/Detail';

import CollageDetail from '@/partialviews/ppyl/order/CollageDetail';

import SelectGoods from '@/partialviews/common/SelectGoods';

import {nTimePickerConfig} from '@/config';


export default {
  name: 'orders',
  components: {
    OrderDetail,
    SelectGoods,
    CollageDetail
  },
  data() {
    return {
      currentPage: 1,
      count: 1,

      showExtendFilter: false,  //是否显示高级筛选项（商品筛选、物流信息筛选）
      queryForm: {
        searOrderSn: '',
        searPayNo: '',
        searType: null,
        user_role: '',
        shipping_status: '',
        pay_status: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

        exportPageNum: 1,
        exportNum: 1000,

        searUserName: '',
        searUserPhone: '',
      },
      filter: {
        searOrderSn: '',
        searPayNo: '',
        searType: null,
        user_role: '',
        shipping_status: '',
        pay_status: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

        exportPageNum: 1,
        exportNum: 1000,

        searUserName: '',
        searUserPhone: ''
      },
      categories: [],
      statusTexts: {
        [1]: '拼团中',
        [2]: '拼团完成',
        [3]: '超时未完成',
        [-1]: '已取消',
        [-3]: '未拼中'
      },
      winStatusTexts: {
        [1]: '已拼中',
        [2]: '未拼中',
        [3]: '等待开奖'
      },
      payStatusTexts: {
        [1]: '未付款',
        [2]: '已支付',
        [3]: '退款中',
        [-1]: '取消付款',
        [-2]: '已退款'
      },
      shippingStatusTexts: {
        [1]: '已发货',
        [2]: '已寄售',
        [3]: '' //等待操作
      },
      statusColors: {
        [1]: 'warning-color',
        [3]: 'error-color',
        [-1]: 'error-color',
        [-2]: 'warning-color'
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
      selectGoodsVisible: false,      //指定商品筛选
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
        searPayNo: '',
        searType: null,
        user_role: '',
        shipping_status: '',
        pay_status: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],

        exportPageNum: 1,
        exportNum: 1000,

        searUserName: '',
        searUserPhone: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        searOrderSn:  this.queryForm.searOrderSn,
        searPayNo: this.queryForm.searPayNo,
        searType: this.queryForm.searType,
        user_role: this.queryForm.user_role,
        order_type: this.queryForm.order_type,
        shipping_status: this.queryForm.shipping_status,
        pay_status: this.queryForm.pay_status,
        createDate: this.queryForm.createDate,

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum,

        searUserName: this.queryForm.searUserName,
        searUserPhone: this.queryForm.searUserPhone
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        searOrderSn:  this.filter.searOrderSn,
        searPayNo: this.filter.searPayNo,
        searType: this.filter.searType,
        user_role: this.filter.user_role,
        shipping_status: this.filter.shipping_status,
        pay_status: this.filter.pay_status,
        order_type: this.filter.order_type,

        topUserPhone: this.filter.topUserPhone
      };

      
      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        queryVal.searUserName = this.filter.searUserName;
        queryVal.searUserPhone = this.filter.searUserPhone;

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
      
      if(!queryVal.start_time || !queryVal.end_time) {
        return this.$message.error('请选择开始时间和结束时间，再进行查询操作。建议时间跨度不要过大');
      }

      this.dataLoading = true;
      this.$post('/admin/ppyl/order', queryVal, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].goods_info = '';
          if(!dataList[i].goods) continue;
          let specs = JSON.parse(dataList[i].goods.specs), attrs = [];
          if(specs) attrs = Object.values(specs).join('、');
          dataList[i].goods_info = `${dataList[i].goods.title}(${attrs})`;

          dataList[i].activity_title = dataList[i].activity.activity_title;
          dataList[i].area_title = dataList[i].area.name;
          dataList[i].user_name = dataList[i].user ? dataList[i].user.name : '未知用户';
          dataList[i].user_phone = dataList[i].user ? dataList[i].user.phone : '未知手机';
        }


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
        searPayNo: this.filter.searPayNo,
        searType: this.filter.searType,
        user_role: this.filter.user_role,
        shipping_status: this.filter.shipping_status,
        pay_status: this.filter.pay_status,
        order_type: this.filter.order_type
      };

      
      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        queryVal.searUserName = this.filter.searUserName;
        queryVal.searUserPhone = this.filter.searUserPhone;

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
      
      if(!queryVal.start_time || !queryVal.end_time) {
        return this.$message.error('请选择开始时间和结束时间，再进行查询操作。建议时间跨度不要过大');
      }

      this.dataLoading = true;
      this.$sget('/admin/ppyl/order', queryVal, res => {
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
      let formData = JSON.parse(JSON.stringify(row));
      let attrs = JSON.parse(formData.goods.specs);
      formData.goods.attrs = Object.values(attrs).join(',');

      this.formData = formData;
      this.detailVisible = true;
    },

    showCollageDetail(row) {
      let formData = {
        pt_name: row.activity_title,
        group_number: row.group_number,
        start_time: row.start_time,
        end_time: row.end_time,
        activity_status: row.activity_status
      }
      formData.users = [];
      for(let i = 0; i < row.group.length; i++) {
        let user = {
          avatarUrl: row.group[i].avatarUrl,
          name: row.group[i].userName,
          phone: row.group[i].userPhone,
          create_time: row.group[i].create_time,
          pay_status: row.group[i].pay_status,
          reward_price: row.group[i].reward_price,
          activity_status: row.group[i].activity_status
        }
        formData.users.push(user);
      }
      this.formData = formData;
      this.collageDetailVisible = true;
    },

    // 导出excel表格
    exportExcel() {
      let params = {
        searOrderSn:  this.filter.searOrderSn,
        searPayNo: this.filter.searPayNo,
        searType: this.filter.searType,
        user_role: this.filter.user_role,
        shipping_status: this.filter.shipping_status,
        pay_status: this.filter.pay_status,
        order_type: this.filter.order_type,

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
      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }

      this.$post('/admin/excel/ppylOrder', params, res => {
        let data = res.data.list || [];
        
        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('拼拼订单数超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        for(let i = 0; i < data.length; i++) {
          data[i].goods_info = '';
          if(!data[i].goods) continue;
          let specs = JSON.parse(data[i].goods.specs), attrs = [];
          if(specs) attrs = Object.values(specs).join('、');
          data[i].goods_info = `${data[i].goods.title}(${attrs})`;
          data[i].goods_cost = data[i].goods.cost_price || '';

          data[i].activity_title = data[i].activity.activity_title;
          data[i].area_title = data[i].area.name;
          data[i].user_name = data[i].user.name;
          data[i].user_phone = data[i].user.phone;
        }

        let excelData = [];
        excelData.push([
          '拼拼订单号', 
          '买家昵称',  
          '买家手机号',  
          '商品信息',
          '归属活动', 
          '归属专区', 
          '成本', 
          '收款金额',
          '汇聚流水号',
          '下单时间', 
          '拼拼订单状态',
          '寄售/发货',
          '退款与否'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.order_sn, 
            item.user_name, 
            item.user_phone, 
            item.goods_info, 
            item.activity_title, 
            item.area_title, 
            item.goods_cost, 
            item.real_pay_price || '0.00', 
            item.pay_no || '', 
            item.create_time, 
            this.statusTexts[item.activity_status] || '',
            this.shippingStatusTexts[item.shipping_status] || '',
            item.pay_status == -2 ? '已退款' : ''
          ]);
        }
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 120},
          {wpx: 110},
          {wpx: 280},
          {wpx: 200},
          {wpx: 160},
          {wpx: 100},
          {wpx: 100},
          {wpx: 160},
          {wpx: 160},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          if(excelData[i][6] && excelData[i][6] !== '') {
            let row6 = XLSX.utils.encode_cell({r: i , c: 6});
            ws[row6].t = 'n';
          }
          
          let realPayRange = XLSX.utils.encode_cell({r: i , c: 7});
          ws[realPayRange].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "拼拼订单列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `拼拼订单列表${time}.xlsx`);
      });
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