<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="table-ctrls">
        <div class="table-title">区域代理人奖励规则</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('areaMember/list')">
            <el-button type="primary" @click="$router.push('areaAgents')">查看区代列表</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="等级" prop="level" width="80"></el-table-column>
        <el-table-column label="规则名" prop="name" width="150"></el-table-column>
       <el-table-column label="分润等级" width="80" prop="vdc_type"></el-table-column>
        <el-table-column label="一级分润收益" width="110" prop="vdc_one">
          <template slot-scope="scope">
            {{scope.row.vdcOneVal}}
          </template>
        </el-table-column>
        <el-table-column label="二级分润收益" width="110" prop="vdc_two">
          <template slot-scope="scope">
            {{scope.row.vdcTwoVal}}
          </template>
        </el-table-column>
        <el-table-column label="分润类型" width="110" prop="vdc_genre">
          <template slot-scope="scope">
            <!-- 合伙人（level1）是销售额抽成 -->
            {{scope.row.vdc_genre == 1 ? '价差抽成' : '销售额抽成'}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('areaDivide/update')">
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
import Edit from '@/partialviews/distribute/areaAgentRewardRule/EditRule';

export default {
  name: 'areaAgentRewardRules',
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

      this.$get('/admin/areaDivide/list', queryVal, res => {
        let dataList = res.data;

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].discountVal = dataList[i].discount ? (parseFloat(dataList[i].discount) * 10 + '折') : '——';
          dataList[i].vdcOneVal = dataList[i].vdc_one && parseFloat(dataList[i].vdc_one) != 0 ? (parseInt(parseFloat(dataList[i].vdc_one) * 10000) / 100 + '%') : '——';
          dataList[i].vdcTwoVal = dataList[i].vdc_two && parseFloat(dataList[i].vdc_two) != 0 ? (parseInt(parseFloat(dataList[i].vdc_two) * 10000) / 100 + '%') : '——';
        }
        
        this.dataList = dataList;
      });
    },

    

    showEditLeaderRule(row) {
      if(!this.$auths.includes('areaDivide/info')) {
        this.$message.warning('您缺少查看区代规则详情的权限，请联系管理员为您添加');
        return;
      }
      let params = {
        level: row.level
      }
      this.$get('/admin/areaDivide/info', params, res => {
        let data = res.data;
        let formData = {
          level: data.level,
          name: data.name,
          discount: data.discount,
          become_condition: data.become_condition,
          recommend_level: data.recommend_level || [''],
          recommend_number: data.recommend_number || [0],
          train_level: data.train_level || [''],
          train_number: data.train_number || [0],
          vdc_type: data.vdc_type,
          vdc_one: data.vdc_one,
          vdc_two: data.vdc_two,
          handing_scale: data.handing_scale,
          
          sales_team_level: data.sales_team_level,
          sales_price: data.sales_price,
          demotion_sales_price: data.demotion_sales_price,
          
          vdc_genre: data.vdc_genre,
          change_all: data.change_all,
        }
        formData.vdcOneVal = formData.vdc_one && parseFloat(formData.vdc_one) != 0 ? (parseInt(parseFloat(formData.vdc_one) * 10000) / 100) : 0;
        formData.vdcTwoVal = formData.vdc_two && parseFloat(formData.vdc_two) != 0 ? (parseInt(parseFloat(formData.vdc_two) * 10000) / 100) : 0;
        this.formData = formData;

        this.editVisible = true;
        
      });
      
    },

    editLeaderRule() {
      let params = JSON.parse(JSON.stringify(this.formData));
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写、勾选完所有信息哦');
        }
      }
      
      if(
        !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.vdcOneVal) || 
        !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.vdcTwoVal) || 
        parseFloat(params.vdcOneVal) >= 100 ||
        parseFloat(params.vdcTwoVal) >= 100
      ) {
        return this.$message.error('直推比例、间推比例都要为小于100的正数');
      }
      
      if(
        !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.handing_scale) ||
        parseFloat(params.handing_scale) >= 1 
      ) {
        return this.$message.error('提现手续费要为小于1的正数');
      }



      // 不是普通会员，晋升有要求
      for(let i = params.recommend_level.length - 1; i >= 0; i--) {
        if(!params.recommend_level[i] || params.recommend_level[i] === '') {
          params.recommend_level.splice(i, 1);
          params.recommend_number.splice(i, 1);
        } else if(i !== params.recommend_level.indexOf(params.recommend_level[i])) {
          return this.$message.error('直推要求有重复项，请检查');
        } else if(params.recommend_number[i] === '' || !/^[1-9]\d*$/.test(params.recommend_number[i])) {
          return this.$message.error('有选到直推要求的直推人数要为1，2，3，4这种正整数哦。可以点击删除要求按钮删除不必要的项');
        }
      }

      for(let i = params.train_level.length - 1; i >= 0; i--) {
        if(!params.train_level[i] || params.train_level[i] === '') {
          params.train_level.splice(i, 1);
          params.train_number.splice(i, 1);
        } else if(i !== params.train_level.indexOf(params.train_level[i])) {
          return this.$message.error('团队培养条件有重复项，请检查');
        } else if(params.train_number[i] === '' || !/^[1-9]\d*$/.test(params.train_number[i])) {
          return this.$message.error('有选到团队培养条件的培养人数要为1，2，3，4这种正整数哦。可以点击删除条件按钮删除不必要的项');
        }
      }
      

      if(
          !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.sales_price)||
          parseFloat(params.sales_price) <= 0
        ) {
        return this.$message.error('销售额要为大于0的正数哦');
      }
      if(
          !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.demotion_sales_price)||
          parseFloat(params.demotion_sales_price) <= 0
        ) {
        return this.$message.error('降级门槛要为大于0的正数哦');
      }
      if(parseFloat(params.demotion_sales_price) > parseFloat(params.sales_price)) {
        return this.$message.error('降级门槛超过了升级销售额要求，请检查');
      }
      
      params.recommend_level = JSON.stringify(params.recommend_level);
      params.recommend_number = JSON.stringify(params.recommend_number);
      params.train_level = JSON.stringify(params.train_level);
      params.train_number = JSON.stringify(params.train_number);

      // 处理成三位小数
      params.vdc_one = parseFloat(Math.floor(parseFloat(params.vdcOneVal) * 10) / 1000).toFixed(3);
      params.vdc_two = parseFloat(Math.floor(parseFloat(params.vdcTwoVal) * 10) / 1000).toFixed(3);

      this.$post('/admin/areaDivide/update', params, res => {
        this.$message.success(`更新成功`);
        this.editVisible = false;
        this.reloadPage();
      });
    },

  }
};
</script>

