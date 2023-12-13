<template>
  <div class="subpage-content">
    <div class="default-container">
      <!-- <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入专区名称" @keyup.enter.native="queryInfo"></el-input>
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
      </div> -->
      
      <div class="table-ctrls">
        <div class="table-title">福利抽奖列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('crowdFundingLottery/create')">
            <el-button type="primary" @click="showStage">新增抽奖活动</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="60" align="center">
        </el-table-column>
        <el-table-column label="抽奖活动名称" prop="title" width="200"></el-table-column>
        <el-table-column label="关联福利专区" width="200">
          <template slot-scope="scope">
            {{scope.row.activity_title}}
            {{scope.row.round_number}}轮
            {{scope.row.period_number}}期
          </template>
        </el-table-column>
        <el-table-column label="专区金额" prop="crowd_price" width="120"></el-table-column>
        <el-table-column label="总奖池金额" prop="lottery_price" width="120"></el-table-column>
        <el-table-column label="1等奖" width="120">
          <template slot-scope="scope">
            {{scope.row.firstly_prize.win_number}}份【共<span class="success-color">{{scope.row.firstly_prize.win_scale_val}}</span>%】
          </template>
        </el-table-column>
        <el-table-column label="2等奖" width="120">
          <template slot-scope="scope">
            {{scope.row.secondly_prize.win_number}}份【共<span class="success-color">{{scope.row.secondly_prize.win_scale_val}}</span>%】
          </template>
        </el-table-column>
        <el-table-column label="3等奖" width="120">
          <template slot-scope="scope">
            {{scope.row.thirdly_prize.win_number}}份【共<span class="success-color">{{scope.row.thirdly_prize.win_scale_val}}</span>%】
          </template>
        </el-table-column>        
        <el-table-column label="抽奖状态" width="100" prop="status" align="center">
          <template slot-scope="scope">
            {{lotteryStatusTexts[scope.row.lottery_status]}}
          </template>
        </el-table-column>


        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="showDetail(scope.row)">详情</el-button>
            <template v-if="$auths.includes('crowdFundingLottery/update')">
              <el-button v-if="scope.row.lottery_status == 3" type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('crowdFundingLottery/winInfo')">
              <el-button v-if="scope.row.lottery_status == 1" type="text" size="small" @click="toWinners(scope.row)">查看中奖者</el-button>
            </template> 
              
            <template v-if="$auths.includes('crowdFundingLottery/delete')">
              <el-button v-if="scope.row.lottery_status == 3" class="error-color" type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
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

    <el-dialog title="选择关联期次" width="900px" :close-on-click-modal="false" :visible.sync="selectStageVisible">
      <SelectStage ref="selectStage" :formData="formData" @confirmStage="confirmStage"></SelectStage>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectStageVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新增抽奖活动" width="960px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑抽奖活动" width="960px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
    
    <el-dialog title="抽奖活动详情" width="960px" :close-on-click-modal="false" :visible.sync="detailVisible">
      <Detail ref="detail" :formData="formData"></Detail>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import SelectStage from '@/partialviews/crowdFunding/crowdFundingLottery/SelectStage';
import Add from '@/partialviews/crowdFunding/crowdFundingLottery/Add';
import Edit from '@/partialviews/crowdFunding/crowdFundingLottery/Edit';
import Detail from '@/partialviews/crowdFunding/crowdFundingLottery/Detail';

import moment from 'moment';

export default {
  name: 'crowdFundingLotterys',
  components: {
    SelectStage,
    Add,
    Edit,
    Detail
  },
  data() {
    return {
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
      lotteryStatusTexts: {
        [1]: '已开奖',
        [2]: '待开奖',
        [3]: '报名中'
      },


      dataList: [],

      formData: {},
      selectStageVisible: false,
      addVisible: false,
      editVisible: false,

      detailVisible: false
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
        searType: this.filter.searType
      };

      this.$get('/admin/crowdFundingLottery/list', queryVal, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          let lotteryScope = JSON.parse(dataList[i].lottery_scope);
          dataList[i].firstly_prize = {}, dataList[i].secondly_prize = {}, dataList[i].thirdly_prize = {};
          for(let j = 0; j < lotteryScope.length; j++) {
            lotteryScope[j].win_scale_val = parseInt(lotteryScope[j].win_scale * 100);
            if(lotteryScope[j].win_level == 1) {
              dataList[i].firstly_prize = lotteryScope[j];
            } else if(lotteryScope[j].win_level == 2) {
              dataList[i].secondly_prize = lotteryScope[j];
            }  else if(lotteryScope[j].win_level == 3) {
              dataList[i].thirdly_prize = lotteryScope[j];
            } 
          }
          dataList[i].lottery_scope = lotteryScope;
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


    showStage() {
      if(!this.$auths.includes('crowdFunding/activityList') || !this.$auths.includes('crowdFunding/periodList')) {
        return this.$message.warning('无查看福利专区或查看福利期次的权限，请联系管理员为您添加'); 
      }
      this.formData = {
        title: '',
        activity_code: '',
        round_number: '',
        period_number: '',
        time: [
          moment().format('YYYY-MM-DD HH:mm:ss'),
          moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
        ],
        lottery_start_time: moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
        crowd_price: 0,
        lottery_scale_val: 0,
        lottery_price: 0,
        lottery_scope: [{
          win_level: 1,
          win_scale: 0,
          win_number: 0,
          win_scale_val: 0
        }, {
          win_level: 2,
          win_scale: 0,
          win_number: 0,
          win_scale_val: 0
        }, {
          win_level: 3,
          win_scale: 0,
          win_number: 0,
          win_scale_val: 0
        }]
      }
      this.selectStageVisible = true;
    },
    confirmStage(stage) {
      this.formData.activity_code = stage.activity_code;
      this.formData.round_number = stage.round_number;
      this.formData.period_number = stage.period_number;
      this.formData.crowd_price = stage.sales_price;
      this.formData.stageInfo = `${stage.title}${stage.round_number}轮${stage.period_number}期`;
      this.formData.lottery_scale_val = 0;
      this.formData.lottery_price = 0;

      this.addVisible = true;
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      params.apply_start_time = this.formData.time[0];
      params.apply_end_time = this.formData.time[1];
      delete params.time;

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息');
        }
      }

      if(moment(params.lottery_start_time).diff(params.apply_end_time) < 0) {
        return this.$message.error(`开奖时间需要在报名结束时间之后`);
      }
      
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.lottery_scale_val)) || 
        parseFloat(params.lottery_scale_val) > 100
      ) {
        return this.$message.error(`奖池金额占比要为大于0且小于等于100的正数，请检查`);
      }
      params.lottery_scale = (params.lottery_scale_val / 100).toFixed(6);

      let allWinScale = 0;
      for(let i = 0; i < params.lottery_scope.length; i++) {
        if(
          !/^([1-9][0-9]*)$/.test(params.lottery_scope[i].win_number)
        ) {
          return this.$message.error(`${i + 1}等奖总人数要为正整数，请检查`);
        }
        if(
          !/^(0|[1-9][0-9]*)$/.test(params.lottery_scope[i].win_scale_val) || 
          parseFloat(params.lottery_scope[i].win_scale_val) > 100
        ) {
          return this.$message.error(`${i + 1}等奖平分奖金占比要为小于等于100的正整数，请检查`);
        }
        params.lottery_scope[i].win_scale = (params.lottery_scope[i].win_scale_val / 100).toFixed(2);
        allWinScale += parseInt(params.lottery_scope[i].win_scale_val); //汇总比例，因jsonstringify，需要转一下格式
      }
      if(allWinScale != 100) {
        return this.$message.error(`3个奖项总占比和要等于100，请检查`);
      }
      

      this.$post('/admin/crowdFundingLottery/create', params, res => {
        this.addVisible = false;
        this.selectStageVisible = false;
        this.$message.success('新增成功');
        this.reloadPage();
      });
    },

    showDetail(row) {
      let formData = {
        plan_sn: row.plan_sn,
        title: row.title,
        activity_code: row.activity_code,
        round_number: row.round_number,
        period_number: row.period_number,
        stageInfo: `${row.activity_title}${row.round_number}轮${row.period_number}期`,
        time: [
          moment(row.apply_start_time).format('YYYY-MM-DD HH:mm:ss'),
          moment(row.apply_end_time).format('YYYY-MM-DD HH:mm:ss'),
        ],
        lottery_start_time: moment(row.lottery_start_time).format('YYYY-MM-DD HH:mm:ss'),
        crowd_price: row.crowd_price,
        lottery_scale_val: (row.lottery_scale * 100).toFixed(4),
        lottery_price: row.lottery_price,
        lottery_scope: row.lottery_scope
      };
      this.formData = formData;
      this.$forceUpdate();
      this.detailVisible = true;

    },
    showEdit(row) {
      let formData = {
        plan_sn: row.plan_sn,
        title: row.title,
        activity_code: row.activity_code,
        round_number: row.round_number,
        period_number: row.period_number,
        stageInfo: `${row.activity_title}${row.round_number}轮${row.period_number}期`,
        time: [
          moment(row.apply_start_time).format('YYYY-MM-DD HH:mm:ss'),
          moment(row.apply_end_time).format('YYYY-MM-DD HH:mm:ss'),
        ],
        lottery_start_time: moment(row.lottery_start_time).format('YYYY-MM-DD HH:mm:ss'),
        crowd_price: row.crowd_price,
        lottery_scale_val: (row.lottery_scale * 100).toFixed(4),
        lottery_price: row.lottery_price,
        lottery_scope: row.lottery_scope
      };
      this.formData = formData;
      this.$forceUpdate();
      this.editVisible = true;
    },
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      params.apply_start_time = this.formData.time[0];
      params.apply_end_time = this.formData.time[1];
      delete params.time;

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息');
        }
      }

      if(moment(params.lottery_start_time).diff(params.apply_end_time) < 0) {
        return this.$message.error(`开奖时间需要在报名结束时间之后`);
      }
      
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.lottery_scale_val)) || 
        parseFloat(params.lottery_scale_val) > 100
      ) {
        return this.$message.error(`奖池金额占比要为大于0且小于等于100的正数，请检查`);
      }
      params.lottery_scale = (params.lottery_scale_val / 100).toFixed(6);

      let allWinScale = 0;
      for(let i = 0; i < params.lottery_scope.length; i++) {
        if(
          !/^([1-9][0-9]*)$/.test(params.lottery_scope[i].win_number)
        ) {
          return this.$message.error(`${i + 1}等奖总人数要为正整数，请检查`);
        }
        if(
          !/^(0|[1-9][0-9]*)$/.test(params.lottery_scope[i].win_scale_val) || 
          parseFloat(params.lottery_scope[i].win_scale_val) > 100
        ) {
          return this.$message.error(`${i + 1}等奖平分奖金占比要为小于等于100的正整数，请检查`);
        }
        params.lottery_scope[i].win_scale = (params.lottery_scope[i].win_scale_val / 100).toFixed(2);
        allWinScale += parseInt(params.lottery_scope[i].win_scale_val); //汇总比例，因jsonstringify，需要转一下格式
      }
      if(allWinScale != 100) {
        return this.$message.error(`3个奖项总占比和要等于100，请检查`);
      }
      
      this.$post('/admin/crowdFundingLottery/update', params, res => {
        this.editVisible = false;
        this.$message.success('编辑成功');
        this.reloadPage();
      });
    },

    toWinners(row) {
      this.$router.push('/crowdFundingLotteryWinners?sn=' + row.plan_sn);
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/crowdFundingLottery/delete', {
          plan_sn: row.plan_sn
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
