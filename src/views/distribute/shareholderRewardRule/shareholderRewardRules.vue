<template>
  <div class="subpage-content">
    <div class="default-container">
      <!-- <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入称号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div> -->
      
      <div class="table-ctrls">
        <div class="table-title">股东奖规则</div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="等级" prop="level" width="80"></el-table-column>
        <el-table-column label="规则名" prop="name" width="150"></el-table-column>
        <el-table-column label="需自购套餐数量" prop="combo_number" width="140"></el-table-column>
        <el-table-column label="奖池比例" width="80" prop="scale">
          <template slot-scope="scope">
            {{scope.row.scaleVal}}
          </template>
        </el-table-column>
        <el-table-column label="奖励上限" width="110" prop="upper_limit_scale">
          <template slot-scope="scope">
            {{scope.row.upper_limit_scale}}倍
          </template>
        </el-table-column>
        <!-- <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column> -->
        <el-table-column label="操作">
         <template slot-scope="scope">
          <template v-if="$auths.includes('shareholderRewardRule/info')">
            <el-button type="text" size="default" @click="showEditLeaderRule(scope.row)">编辑</el-button>
          </template>
            
            
          </template>
        </el-table-column>
      </el-table>

    </div>


    <el-dialog title="编辑规则" width="900px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editLeaderRule">确 定</el-button>
      </div>
    </el-dialog>



  </div>
</template>

<script>
import Edit from '@/partialviews/distribute/shareholderRewardRule/EditRule';

export default {
  name: 'shareholderRewardRules',
  components: {
    Edit
  },
  data() {
    return {
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],
      selection: [],
      formData: {},   //新增规则的数据

      
      statusTexts: {
        [1]: '启用中',
        [2]: '已禁用',
        [-1]: '已被删除'
      },


      addVisible: false, //新增规则的显示与否的控制字段
      editVisible: false
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
        keyword: ''
      };
      this.getList();
    },
    //查询
    queryInfo() {
      this.filter = {
        keyword: this.queryForm.keyword
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        keyword: this.filter.keyword
      };

      this.$get('/admin/shareholderRewardRule/list', queryVal, res => {
        let dataList = res.data;

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].scaleVal = dataList[i].scale && parseFloat(dataList[i].scale) != 0 ? (parseInt(parseFloat(dataList[i].scale) * 10000) / 100 + '%') : '——';
          dataList[i].upperLimitScaleVal = dataList[i].upper_limit_scale && parseFloat(dataList[i].upper_limit_scale) != 0 ? (parseInt(parseFloat(dataList[i].upper_limit_scale) * 10000) / 100 + '%') : '——';
        }
        
        this.dataList = dataList;
      });
    },

    

    showEditLeaderRule(row) {
      let params = {
        id: row.id
      }
      this.$get('/admin/shareholderRewardRule/info', params, res => {
        let data = res.data;
        this.formData = {
          id: data.id,
          level: data.level,
          name: data.name,
          scale: data.scale,
          upper_limit_scale: data.upper_limit_scale,
          combo_number: data.combo_number
        }
        this.editVisible = true;
        
      });
      
    },

    editLeaderRule() {
      let params = JSON.parse(JSON.stringify(this.formData));
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写、勾选完所有信息');
        }
      }
      if((!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.scale) || 
        parseFloat(params.scale) > 1
      )) {
        return this.$message.error('奖池比例要为小于等于1的正数');
      }
      if((!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.upper_limit_scale) || 
        parseFloat(params.upper_limit_scale) < 1
      )) {
        return this.$message.error('奖池比例要为大于等于1的正数');
      }
      if(params.combo_number === '' || !/^[1-9]\d*$/.test(params.combo_number)) {
          return this.$message.error('需自购套餐数要为1，2，3，4这种正整数');
      }

      // 处理成三位小数
      params.vdc_one = parseFloat(params.scale).toFixed(3);
      params.vdc_two = parseFloat(params.upper_limit_scale).toFixed(3);

      this.$post('/admin/shareholderRewardRule/update', params, res => {
        this.$message.success(`更新成功`);
        this.editVisible = false;
        this.reloadPage();
      });
    },

  }
};
</script>

