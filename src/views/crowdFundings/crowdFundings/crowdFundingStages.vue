<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入期次名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="searType">
            <el-select placeholder="不限" name="searType" v-model="queryForm.searType">
              <el-option label="不限" :value="1"></el-option>
              <el-option label="上架中" :value="2"></el-option>
              <el-option label="下架" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">福利期次列表 <span class="success-color">{{ aData.title || '' }}</span></div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('crowdFunding/periodCreate')">
            <el-button type="primary" @click="showAdd">新增福利期次</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="福利期次名称" prop="title" width="150"></el-table-column>
        <el-table-column label="轮数" prop="round_number" width="80" align="center"></el-table-column>
        <el-table-column label="期数" prop="period_number" width="80" align="center"></el-table-column>
        <el-table-column label="目标销售额" prop="sales_price" width="120" align="center"></el-table-column>
        <el-table-column label="待认购销售额" prop="last_sales_price" width="120" align="center"></el-table-column>
        <el-table-column label="认购状态" width="100" align="center">
          <template slot-scope="scope">
            {{ buyStatus[scope.row.buy_status] }}
          </template>
        </el-table-column>
        <el-table-column label="结果" width="100" align="center">
          <template slot-scope="scope">
            {{ resultStatus[scope.row.result_status] }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{ statusTexts[scope.row.status] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="400">
          <template slot-scope="scope">
            <template v-if="$auths.includes('crowdFunding/periodStatus')">
              <el-button v-if="scope.row.result_status == 4"
                :class="{ 'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2 }" type="text"
                size="small" @click="toggleItem(scope.row)">{{ scope.row.status == 1 ? '下架' : '上架' }}</el-button>
            </template>
            <template v-if="$auths.includes('crowdFunding/periodUpdate')">
              <el-button v-if="scope.row.result_status == 4" type="text" size="small"
                @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <!-- v-if="$auths.includes('crowdfunding/updateCondition')" -->
            <template>
              <el-button v-if="scope.row.result_status != 4" type="text" size="small"
                @click="showDetail(scope.row)">详情</el-button>
            </template>
            <template v-if="$auths.includes('crowdFunding/updateSalesPrice')">
              <el-button v-if="scope.row.result_status == 4" type="text" size="small"
                @click="showEditPrice(scope.row)">编辑销售额</el-button>
            </template>
            <template v-if="$auths.includes('crowdFunding/periodGoodsInfo')">
              <el-button type="text" size="small" @click="toRelations(scope.row)">查看关联商品</el-button>
            </template>
            <template v-if="$auths.includes('crowdFunding/durationList')">
              <el-button type="text" size="small" @click="toDurations(scope.row)">查看开放时间段</el-button>
            </template>
            <template v-if="$auths.includes('crowdfunding/updateCondition')">
              <el-button v-if="scope.row.result_status == 4" type="text" size="small"
                @click="showCondition(scope.row)">参与门槛</el-button>
            </template>
            <template>
              <el-button v-if="scope.row.result_status != 4" type="text" size="small"
                @click="showConditionDetail(scope.row)">参与门槛详情</el-button>
            </template>
            <template v-if="$auths.includes('crowdFunding/completeByOrder')">
              <el-button v-if="scope.row.result_status == 4 && scope.row.couldComplete" type="text" size="small"
                @click="tryCompleteByOrder(scope.row)">判断期是否成功</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

    <el-dialog title="新增福利期次" width="720px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑福利期次" width="720px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="福利期次详情" width="700px" :close-on-click-modal="false" :visible.sync="detailVisible">
      <Detail ref="edit" :formData="formData"></Detail>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="参与门槛详情" width="900px" :close-on-click-modal="false" :visible.sync="detailConditionVisible">
      <ConditionDetail ref="edit" :formData="formData"></ConditionDetail>
      <template #title>
        <div class="title">
          <span>参与门槛详情</span>
          <span style="color:#6cc460 ;">{{ aData.title }}</span>
        </div>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailConditionVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="调整福利期次的销售额" width="640px" :close-on-click-modal="false" :visible.sync="editPriceVisible">
      <EditPrice ref="editPrice" :formData="formData"></EditPrice>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editPriceVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItemPrice">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="设置参与门槛" width="640px" :close-on-click-modal="false" :visible.sync="conditionVisible">
      <setCondition ref="setCondition" :formData="formData"></setCondition>
      <template #title>
        <div class="title">
          <span>设置参与门槛</span>
          <span style="color:#6cc460 ;">{{ aData.title }}</span>
        </div>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button @click="conditionVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCondition">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import Add from '@/partialviews/crowdFunding/crowdFunding/AddStage';
import Edit from '@/partialviews/crowdFunding/crowdFunding/EditStage';
import Detail from '@/partialviews/crowdFunding/crowdFunding/StageDetail';
import ConditionDetail from '@/partialviews/crowdFunding/crowdFunding/ConditionDetail';
import EditPrice from '@/partialviews/crowdFunding/crowdFunding/EditPrice';
import setCondition from '@/partialviews/crowdFunding/crowdFunding/setCondition';
import moment from 'moment';
import { REG_INTEGER } from '@/util/regExp';

export default {
  name: 'crowdFundingStage',
  components: {
    Add,
    Edit,
    Detail,
    EditPrice,
    setCondition,
    ConditionDetail
  },
  data() {
    return {
      code: '',
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        searType: 1
      },
      filter: {
        keyword: '',
        searType: 1
      },
      categories: [],
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      positionText: {
        [1]: '首页',
        [2]: '全部期次列表中'
      },

      buyStatus: {
        [1]: '已满',
        [2]: '未满'
      },
      resultStatus: {
        [1]: '已完成',
        [2]: '寄售中',  //待成功
        [3]: '已失效',
        [4]: '消费单',  //等待结果，抢购中
        [5]: '福利重启',
      },


      dataList: [],
      aData: {},

      formData: {},
      editVisible: false,
      addVisible: false,
      editPriceVisible: false,
      detailVisible: false,
      conditionVisible:false,
      detailConditionVisible:false
    };
  },
  mounted() {
    this.code = this.$route.query.code;
    if(!this.code) {
      this.$message.error('橱窗不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/crowdFundings');
      }, 2000)
    }
    this.getList();
    this.getData();
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
        category_code: '',
        searType: 1
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        searType: this.queryForm.searType
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        activity_code: this.code,
        searType: this.filter.searType
      };

      this.$get('/admin/crowdFunding/periodList', queryVal, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          if(
            parseFloat(dataList[i].last_sales_price) === 0 ||
            !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(dataList[i].last_sales_price))
          ) {
            this.$set(dataList[i], 'couldComplete', true);
          }
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    getData() {
      if(!this.$auths.includes('crowdFunding/activityInfo')) {
        return;
      }
      let params = {
        activity_code: this.code,
      };

      this.$get('/admin/crowdFunding/activityInfo', params, res => {
        let data = res.data;
        this.aData = data;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '下架' : '上架'}${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/crowdFunding/periodStatus', {
          activity_code: row.activity_code,
          round_number: row.round_number,
          period_number: row.period_number,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    showAdd() {
      this.formData = {
        activity_code: this.code,
        title: '',
        desc: '',
        limit_type: 1,
        time: [moment().format('YYYY-MM-DD 00:00:00'), moment().add(30, 'days').format('YYYY-MM-DD 23:59:59')],
        sort: 9999,
        background_image: '',

        round_number: 1, //轮数
        period_number: 1,  //期数
        sales_price: '',  //销售额
        join_limit_number: '',  //每人参与次数上限
        join_limit_amount: '',  //每人参与认购额上限
        join_limit_amount_show: '',  //每人参与认购额上限【展示用】
        reward_scale: '', //本期熔断返集品豆比例【方案一】
        fail_return_scale: '',  //失败后返本比例
        fail_reward_scale: '',  //本期成功后返集品券比例
        fuse_return_scale: '',  //熔断返本比例
        advance_buy_scale: '', // 提前购比例
        fuse_second_return_scale: '', // 本期熔断返本金比例【方案二】
        fuse_second_rising_scale: '', // 本期熔断分期返总本金上浮倍数【方案二】
        fuse_second_once_return_scale: '', // 每期返回订单总额比例【方案二】
        advance_buy_reward_send_time: '', // 预售发放奖励时间
      };
      if(this.$refs.add && this.$refs.add.$refs.background_image) this.$refs.add.$refs.background_image.clearFiles();
      this.addVisible = true;
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      delete params.advance_buy_reward_send_time;
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }
      if(this.formData.limit_type == 1) {
        if(!this.formData.time || this.formData.time.length != 2) {
          return this.$message.error(`请选择有效时间段`)
        }
        params.start_time = params.time[0];
        params.end_time = params.time[1];
      }
      if(params.time) delete params.time;

      if(!(/^(0|[1-9][0-9]*)$/.test(params.sort))) {
        return this.$message.error(`排序要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      if(!(/^(0|[1-9][0-9]*)$/.test(params.period_number))) {
        return this.$message.error(`期数要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      if(
        !(/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(params.sales_price)) ||
        parseFloat(params.sales_price) <= 0
      ) {
        return this.$message.error(`销售额要为大于零的数哦，请检查下哈`)
      }
      if(!(/^(0|[1-9][0-9]*)$/.test(params.join_limit_number))) {
        return this.$message.error(`每人参与次数上限要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      if(!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(params.join_limit_amount) || parseFloat(params.join_limit_amount) <= 0) {
        return this.$message.error(`每人参与认购额度上限要为大于零的数哦，请检查下哈`)
      }
      if(!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(params.join_limit_amount_show) || parseFloat(params.join_limit_amount_show) <= 0) {
        return this.$message.error(`每人参与认购额度上限【展示用】要为大于零的数哦，请检查下哈`)
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.reward_scale) ||
        parseFloat(params.reward_scale) > 100
      ) {
        return this.$message.error(`本期成功后返集品券比例要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fail_return_scale) ||
        parseFloat(params.fail_return_scale) > 100
      ) {
        return this.$message.error(`失败后返本比例要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fail_reward_scale) ||
        parseFloat(params.fail_reward_scale) > 100
      ) {
        return this.$message.error(`本期熔断返集品豆比例【方案一】要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fuse_return_scale) ||
        parseFloat(params.fuse_return_scale) > 100
      ) {
        return this.$message.error(`本期熔断返本金比例【方案一】要为小于等于100的正整数哦，请检查下哈`);
      }

      if(
        !/^(0|[1-9][0-9]*)$/.test(params.advance_buy_scale) ||
        parseFloat(params.advance_buy_scale) > 100
      ) {
        return this.$message.error(`提前购比例要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fuse_second_return_scale) ||
        parseFloat(params.fuse_second_return_scale) > 100
      ) {
        return this.$message.error(`本期熔断返本金比例【方案二】要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^[1-9]\d*(\.\d*)?$/.test(params.fuse_second_rising_scale)
      ) {
        return this.$message.error(`本期熔断分期返总本金上浮倍数【方案二】要为大于等于1哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fuse_second_once_return_scale) ||
        parseFloat(params.fuse_second_once_return_scale) > 100
      ) {
        return this.$message.error(`每期返回订单总额比例【方案二】要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        params.advance_buy_scale >= 100 && !REG_INTEGER.test(this.formData.advance_buy_reward_send_time)
      ) {
        return this.$message.error(`预售发放奖励时间要为0，1，2，3，4这种正整数哦，请检查下哈`);
      }

      params.reward_scale = (params.reward_scale / 100).toFixed(2);
      params.fail_return_scale = (params.fail_return_scale / 100).toFixed(2);
      params.fail_reward_scale = (params.fail_reward_scale / 100).toFixed(2);
      params.fuse_return_scale = (params.fuse_return_scale / 100).toFixed(2);

      params.advance_buy_scale = (params.advance_buy_scale / 100).toFixed(2);
      params.fuse_second_return_scale = (params.fuse_second_return_scale / 100).toFixed(2);
      params.fuse_second_rising_scale = Number(params.fuse_second_rising_scale).toFixed(2);
      params.fuse_second_once_return_scale = (params.fuse_second_once_return_scale / 100).toFixed(2);

      // 将天数转换成秒数
      if (this.formData.advance_buy_scale >= 100) {
        params.advance_buy_reward_send_time = this.formData.advance_buy_reward_send_time ? this.formData.advance_buy_reward_send_time * 24 * 60 * 60 : this.formData.advance_buy_reward_send_time;
      } else {
        params.advance_buy_reward_send_time = 0
      }
      if (this.formData.advance_buy_scale >= 100 && !params.advance_buy_reward_send_time) {
        this.$confirm('预售发放奖励时间为0，代表不限制发放时间，请确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/crowdFunding/periodCreate', params, res => {
          this.addVisible = false;
          this.$message.success('新增成功');
          this.reloadPage();
        });
      }).catch(() => {});
      } else {
        this.$post('/admin/crowdFunding/periodCreate', params, res => {
          this.addVisible = false;
          this.$message.success('新增成功');
          this.reloadPage();
        });
      }
    },

    showEdit(row) {
      let formData = {
        activity_code: row.activity_code,
        title: row.title,
        desc: row.desc,
        sort: row.sort,
        limit_type: row.limit_type,
        background_image: row.background_image,

        round_number: row.round_number, //轮数
        period_number: row.period_number,  //期数
        sales_price: row.sales_price,  //销售额
        join_limit_number: row.join_limit_number,  //每人参与次数上限
        join_limit_amount: row.join_limit_amount,  //每人参与认购额上限
        join_limit_amount_show: row.join_limit_amount_show,  //每人参与认购额上限【展示用】
      }
      // 将秒数转换成天数
      if (row.advance_buy_reward_send_time) {
        formData.advance_buy_reward_send_time = row.advance_buy_reward_send_time / 24 / 60 / 60;
      } else {
        formData.advance_buy_reward_send_time = 0
      }

      if(formData.limit_type == 1) formData.time = [moment(row.start_time).format('YYYY-MM-DD HH:mm:ss'), moment(row.end_time).format('YYYY-MM-DD HH:mm:ss')];

      formData.reward_scale = parseInt(parseFloat(row.reward_scale) * 100);
      formData.fail_return_scale = parseInt(parseFloat(row.fail_return_scale) * 100);
      formData.fail_reward_scale = parseInt(parseFloat(row.fail_reward_scale) * 100);
      formData.fuse_return_scale = parseInt(parseFloat(row.fuse_return_scale) * 100);

      formData.advance_buy_scale = parseInt(parseFloat(row.advance_buy_scale) * 100);
      formData.fuse_second_return_scale = parseInt(parseFloat(row.fuse_second_return_scale) * 100);
      formData.fuse_second_rising_scale = parseFloat(row.fuse_second_rising_scale);
      formData.fuse_second_once_return_scale = parseInt(parseFloat(row.fuse_second_once_return_scale) * 100);

      this.formData = formData;
      if(this.$refs.edit && this.$refs.edit.$refs.background_image) this.$refs.edit.$refs.background_image.clearFiles();
      this.editVisible = true;
    },
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }

      if(this.formData.limit_type == 1) {
        if(!this.formData.time || this.formData.time.length != 2) {
          return this.$message.error(`请选择有效时间段`)
        }
        params.start_time = params.time[0];
        params.end_time = params.time[1];
      }
      if(params.time) delete params.time;

      if(!(/^(0|[1-9][0-9]*)$/.test(params.sort))) {
        return this.$message.error(`排序要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      if(!(/^(0|[1-9][0-9]*)$/.test(params.period_number))) {
        return this.$message.error(`期数要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      if(
        !(/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(params.sales_price)) ||
        parseFloat(params.sales_price) <= 0
      ) {
        return this.$message.error(`销售额要为大于零的数哦，请检查下哈`)
      }
      if(!(/^(0|[1-9][0-9]*)$/.test(params.join_limit_number))) {
        return this.$message.error(`每人参与次数上限要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      if(!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(params.join_limit_amount) || parseFloat(params.join_limit_amount) <= 0) {
        return this.$message.error(`每人参与认购额度上限要为大于零的数哦，请检查下哈`)
      }
      if(!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(params.join_limit_amount_show) || parseFloat(params.join_limit_amount_show) <= 0) {
        return this.$message.error(`每人参与认购额度上限【展示用】要为大于零的数哦，请检查下哈`)
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.reward_scale) ||
        parseFloat(params.reward_scale) > 100
      ) {
        return this.$message.error(`本期成功后返集品券比例要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fail_return_scale) ||
        parseFloat(params.fail_return_scale) > 100
      ) {
        return this.$message.error(`失败后返本比例要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fail_reward_scale) ||
        parseFloat(params.fail_reward_scale) > 100
      ) {
        return this.$message.error(`本期熔断返集品豆比例【方案一】要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fuse_return_scale) ||
        parseFloat(params.fuse_return_scale) > 100
      ) {
        return this.$message.error(`本期熔断返本金比例【方案一】要为小于等于100的正整数哦，请检查下哈`);
      }

      if(
        !/^(0|[1-9][0-9]*)$/.test(params.advance_buy_scale) ||
        parseFloat(params.advance_buy_scale) > 100
      ) {
        return this.$message.error(`提前购比例要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fuse_second_return_scale) ||
        parseFloat(params.fuse_second_return_scale) > 100
      ) {
        return this.$message.error(`本期熔断返本金比例【方案二】要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        !/^[1-9]\d*(\.\d*)?$/.test(params.fuse_second_rising_scale)
      ) {
        return this.$message.error(`本期熔断分期返总本金上浮倍数【方案二】要为大于等于1哦，请检查下哈`);
      }
      if(
        !/^(0|[1-9][0-9]*)$/.test(params.fuse_second_once_return_scale) ||
        parseFloat(params.fuse_second_once_return_scale) > 100
      ) {
        return this.$message.error(`每期返回订单总额比例【方案二】要为小于等于100的正整数哦，请检查下哈`);
      }
      if(
        params.advance_buy_scale >= 100 && !REG_INTEGER.test(params.advance_buy_reward_send_time)
      ) {
        return this.$message.error(`预售发放奖励时间要为0，1，2，3，4这种正整数哦，请检查下哈`);
      }

      // 将天数转换成秒数
      if (params.advance_buy_scale >= 100) {
        params.advance_buy_reward_send_time = params.advance_buy_reward_send_time ? params.advance_buy_reward_send_time * 24 * 60 * 60 : params.advance_buy_reward_send_time;
      } else {
        params.advance_buy_reward_send_time = 0
      }

      params.reward_scale = (params.reward_scale / 100).toFixed(2);
      params.fail_return_scale = (params.fail_return_scale / 100).toFixed(2);
      params.fail_reward_scale = (params.fail_reward_scale / 100).toFixed(2);

      params.advance_buy_scale = (params.advance_buy_scale / 100).toFixed(2);
      params.fuse_second_return_scale = (params.fuse_second_return_scale / 100).toFixed(2);
      params.fuse_second_rising_scale = Number(params.fuse_second_rising_scale).toFixed(2);
      params.fuse_second_once_return_scale = (params.fuse_second_once_return_scale / 100).toFixed(2);

      if (this.formData.advance_buy_scale >= 100 && !params.advance_buy_reward_send_time) {
        this.$confirm('预售发放奖励时间为0，代表不限制发放时间，请确认', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$post('/admin/crowdFunding/periodUpdate', params, res => {
            this.editVisible = false;
            this.$message.success('编辑成功');
            this.reloadPage();
          });
        })
      } else {
        this.$post('/admin/crowdFunding/periodUpdate', params, res => {
          this.editVisible = false;
          this.$message.success('编辑成功');
          this.reloadPage();
        });
      }
    },
    tryCompleteByOrder(row) {
      let params = {
        activity_code: row.activity_code,
        round_number: row.round_number, //轮数
        period_number: row.period_number,  //期数
      }
      this.$confirm(`是否确定手动完成该期？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/crowdFunding/completeByOrder', params, res => {
          this.$message.success('操作成功');
          this.reloadPage();
        });
      }).catch(() => {})
    },
    // 参与门槛
    showCondition(row){
        this.formData={
          condition_price:row.condition_price,
          price_compute_time_type:row.price_compute_time_type,
          price_compute_type:row.price_compute_type,
          condition_price_start_time:row.condition_price_start_time,
          condition_price_end_time:row.condition_price_end_time,
          join_condition_type:row.join_condition_type,
          activity_code:row.activity_code,
          round_number:row.round_number,
          period_number:row.period_number,
          title:row.title,
          createDate:[],
        }
        // 对时间进行特殊处理来回显
        if(this.formData.condition_price_end_time&&this.formData.condition_price_start_time){
          this.formData.condition_price_end_time=moment.unix(this.formData.condition_price_end_time).format('YYYY-MM-DD HH:mm:ss');
          this.formData.condition_price_start_time=moment.unix(this.formData.condition_price_start_time).format('YYYY-MM-DD HH:mm:ss');
          this.formData.createDate=[this.formData.condition_price_start_time,this.formData.condition_price_end_time]
        }else{
          this.formData.createDate=["",""]
        }
        if(!this.formData.price_compute_time_type){
          this.formData.price_compute_time_type=1
        }
        if(!this.formData.price_compute_type){
          this.formData.price_compute_type=1
        }
        this.conditionVisible=true;

    },
    editCondition(){
      let params = JSON.parse(JSON.stringify(this.formData));
      if(params.price_compute_time_type==2&&params.createDate.length==2){
        if(isNaN(new Date(params.createDate[0]).getTime()/1000)||isNaN(new Date(params.createDate[1]).getTime()/1000)){
          return this.$message.error("请选择时间哦！");
        }else{
          params.condition_price_start_time=Math.floor(new Date(params.createDate[0]).getTime()/1000);
          params.condition_price_end_time=Math.floor(new Date(params.createDate[1]).getTime()/1000);
          delete params.createDate;
        }
      }
      let paramValues = Object.values(params);
      console.log(paramValues,650)
      if(params.join_condition_type!=-1){
        for(let i = 0; i < paramValues.length; i++) {
          if(params.price_compute_time_type==1&&!params[i]){
              continue;
          }
          if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
            return this.$message.error('请填写完所有信息');
          }
        };
        if(params.price_compute_type!=2){
          if(!/^(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,3})))$/.test(params.condition_price)){
            return this.$message.error("门槛金额应为保留俩位小数的数字，且大于零")
          };
        }else{
          if(!/^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,3})))$/.test(params.condition_price)){
            return this.$message.error("门槛金额应为保留俩位小数的数字，且大于零")
          };
        }
      }
      delete params.title
      if(params.price_compute_time_type==1){
        params.condition_price_start_time="";
        params.condition_price_end_time="";
      }
      if(params.join_condition_type==-1){
        params.condition_price="";
        params.price_compute_time_type="";
        params.price_compute_type="";
        params.condition_price_start_time="";
        params.condition_price_end_time="";
      }
      this.$post("/admin/crowdfunding/updateCondition",params,res=>{
        this.$message.success("更新参与门槛成功!");
        this.formData={};
        this.conditionVisible=false;
        this.getList()
      })
    },

    showDetail(row) {
      let formData = {
        activity_code: row.activity_code,
        title: row.title,
        desc: row.desc,
        sort: row.sort,
        limit_type: row.limit_type,
        background_image: row.background_image,

        round_number: row.round_number, //轮数
        period_number: row.period_number,  //期数
        sales_price: row.sales_price,  //销售额
        join_limit_number: row.join_limit_number,  //每人参与次数上限
        join_limit_amount: row.join_limit_amount,  //每人参与认购额上限
        join_limit_amount_show: row.join_limit_amount_show,  //每人参与认购额上限【展示用】
      }
      if(formData.limit_type == 1) formData.time = [moment(row.start_time).format('YYYY-MM-DD HH:mm:ss'), moment(row.end_time).format('YYYY-MM-DD HH:mm:ss')];

      formData.reward_scale = parseInt(parseFloat(row.reward_scale) * 100);
      formData.fail_return_scale = parseInt(parseFloat(row.fail_return_scale) * 100);
      formData.fail_reward_scale = parseInt(parseFloat(row.fail_reward_scale) * 100);
      formData.fuse_return_scale = parseInt(parseFloat(row.fuse_return_scale) * 100);

      formData.advance_buy_scale = parseInt(parseFloat(row.advance_buy_scale) * 100);
      formData.fuse_second_return_scale = parseInt(parseFloat(row.fuse_second_return_scale) * 100);
      formData.fuse_second_rising_scale = parseFloat(row.fuse_second_rising_scale);
      formData.fuse_second_once_return_scale = parseInt(parseFloat(row.fuse_second_once_return_scale) * 100);
      // 将秒数转换成天数
      if (row.advance_buy_reward_send_time) {
        formData.advance_buy_reward_send_time = row.advance_buy_reward_send_time / 24 / 60 / 60;
      } else if (row.advance_buy_reward_send_time !== '' && Number(row.advance_buy_reward_send_time) === 0) {
        formData.advance_buy_reward_send_time = 0;
      }

      this.formData = formData;

      this.detailVisible = true;
    },
    showConditionDetail(row){
      this.formData={
          condition_price:row.condition_price,
          price_compute_time_type:row.price_compute_time_type,
          price_compute_type:row.price_compute_type,
          condition_price_start_time:row.condition_price_start_time,
          condition_price_end_time:row.condition_price_end_time,
          join_condition_type:row.join_condition_type,
          activity_code:row.activity_code,
          round_number:row.round_number,
          period_number:row.period_number,
          title:row.title,
          createDate:[],
        }
        // 对时间进行特殊处理来回显
        if(this.formData.condition_price_end_time&&this.formData.condition_price_start_time){
          this.formData.condition_price_end_time=moment.unix(this.formData.condition_price_end_time).format('YYYY-MM-DD HH:mm:ss');
          this.formData.condition_price_start_time=moment.unix(this.formData.condition_price_start_time).format('YYYY-MM-DD HH:mm:ss');
          this.formData.createDate=[this.formData.condition_price_start_time,this.formData.condition_price_end_time]
        }else{
          this.formData.createDate=["",""]
        }
        if(!this.formData.price_compute_time_type){
          this.formData.price_compute_time_type=1
        }
        if(!this.formData.price_compute_type){
          this.formData.price_compute_type=1
        }
        this.detailConditionVisible=true;
    },

    showEditPrice(row) {
      let formData = {
        activity_code: row.activity_code,
        round_number: row.round_number, //轮数
        period_number: row.period_number,  //期数
        sales_price: 0,  //要调整的销售额
      }
      this.formData = formData;
      this.editPriceVisible = true;
    },
    editItemPrice() {
      let params = {
        activity_code: this.formData.activity_code,
        round_number: this.formData.round_number, //轮数
        period_number: this.formData.period_number,  //期数
        sales_price: this.formData.sales_price,  //要调整的销售额
      }
      if(
        !(/^[+-]{0,1}(\d+)$|^[+-]{0,1}(\d+\.\d+)$/.test(params.sales_price))
      ) {
        return this.$message.error(`销售额是数字格式，请检查下哈`)
      } else if(parseFloat(params.sales_price) == 0) {
        return this.$message.error(`调整销售额不能为0，请检查`)
      }
      params.sales_price = (parseFloat(params.sales_price)).toFixed(2);
      this.$post('/admin/crowdFunding/updateSalesPrice', params, res => {
        this.editPriceVisible = false;
        this.$message.success('调整销售额成功');
        this.reloadPage();
      });

    },

    toRelations(row) {
      this.$router.push(`/crowdFundingCommedities?code=${row.activity_code}&rNum=${row.round_number}&pNum=${row.period_number}`);
    },
    toDurations(row) {
      this.$router.push(`/crowdFundingDurations?code=${row.activity_code}&rNum=${row.round_number}&pNum=${row.period_number}`);
    }
  }
};
</script>
