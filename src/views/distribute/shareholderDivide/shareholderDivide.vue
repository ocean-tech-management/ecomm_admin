<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入称号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">股东规则</div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="等级" prop="level" width="80"></el-table-column>
        <el-table-column label="称号" prop="name" width="100"></el-table-column>
        <el-table-column label="升级销售额" prop="sales_price" width="130"></el-table-column>
        <el-table-column label="降级门槛" prop="demotion_sales_price" width="130"></el-table-column>
        <!-- <el-table-column label="折扣" width="80" prop="discount">
          <template slot-scope="scope">
            {{scope.row.discountVal}}
          </template>
        </el-table-column>
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
            {{scope.row.vdc_genre == 1 ? '价差抽成' : '销售额抽成'}}
          </template>
        </el-table-column>
        
        <el-table-column label="提现手续费" width="110" prop="handing_scale">
          <template slot-scope="scope">
            {{scope.row.handing_scale && parseFloat(scope.row.handing_scale) != 0 ? ((parseFloat(scope.row.handing_scale) * 100).toFixed(1) + '%') : '——'}}
          </template>
        </el-table-column> -->
        <el-table-column label="操作">
         <template slot-scope="scope">
          <template v-if="$auths.includes('shareholderDivide/update')">
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
import Edit from '@/partialviews/distribute/shareholderDivideRule/EditRule';


export default {
  name: 'shareholderDivideRule',
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

      this.$get('/admin/shareholderDivide/list', queryVal, res => {
        let dataList = res.data;

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].discountVal = dataList[i].discount ? (parseFloat(dataList[i].discount) * 10 + '折') : '——';
          dataList[i].vdcOneVal = dataList[i].vdc_one && parseFloat(dataList[i].vdc_one) != 0 ? (parseInt(parseFloat(dataList[i].vdc_one) * 10000) / 100 + '%') : '——';
          dataList[i].vdcTwoVal = dataList[i].vdc_two && parseFloat(dataList[i].vdc_two) != 0 ? (parseInt(parseFloat(dataList[i].vdc_two) * 10000) / 100 + '%') : '——';
        }
        
        this.dataList = dataList;
      });
    },

    
    showAddLeaderRule() {
      this.formData = {
        level: '',
        name: '',
        recommend_level: [''],
        recommend_number: [0],
        train_level: [''],
        train_number: [0],
        // leader_conditions: [{
        //   user_lv: '',
        //   user_num: ''
        // }],
        // leader_inv_condition: '',
        team_number: '',
        reward_scale: '',
        freed_scale: '',
        freed_cycle: '',

        sales_price: 0,

        background: '',
        poster: '',

        remark: ''

      }
      setTimeout(() => {
        if(this.$refs.add) this.$refs.add.getLeaders();
        this.addVisible = true;
      }, 10)

    }, 
    

    showEditLeaderRule(row) {
      let params = {
        level: row.level
      }
      this.$get('/admin/shareholderDivide/info', params, res => {
        let data = res.data;
        // 注意，level为3的情况下，有几项不需要有真值
        this.formData = {
          id: data.id,
          level: data.level,
          name: data.name,
          // discount: data.discount,
          discount: 1, //该商城没有会员折扣
          // become_condition: data.become_condition,
          become_condition: 1,  //当前对门槛没有什么要求
          recommend_level: data.recommend_level || [''],
          recommend_number: data.recommend_number || [0],
          // train_level: data.train_level || [''],
          // train_number: data.train_number || [0],
          train_level: [],  //现在不需要团推要求
          train_number: [], //现在不需要团推要求
          // leader_conditions: [{
          //   user_lv: '',
          //   user_num: ''
          // }],
          // leader_inv_condition: data.leader_inv_condition,
          recommend_member_number: data.recommend_member_number,  //直推会员条件

          vdc_one: data.vdc_one,
          vdc_two: data.vdc_two,

          vdcOneVal: data.vdc_one * 100,
          vdcTwoVal: data.vdc_two * 100,
          
          vdc_type: data.vdc_type,
          handing_scale: data.handing_scale,
          sales_team_level: data.sales_team_level,
          // vdc_genre: data.vdc_genre,
          vdc_genre: data.vdc_genre,

          sales_price: data.sales_price,

          demotion_sales_price: data.demotion_sales_price,
          demotion_type: data.demotion_type,


          background: data.background,
          poster: data.poster
        }
        this.formData.vdcOneVal = this.formData.vdc_one && parseFloat(this.formData.vdc_one) != 0 ? (parseInt(parseFloat(this.formData.vdc_one) * 10000) / 100) : 0;
        this.formData.vdcTwoVal = this.formData.vdc_two && parseFloat(this.formData.vdc_two) != 0 ? (parseInt(parseFloat(this.formData.vdc_two) * 10000) / 100) : 0;

        
        setTimeout(() => {
          if(this.$refs.edit) this.$refs.edit.getLeaders();
          this.editVisible = true;
        }, 10)
        
      });
      
    },

    editLeaderRule() {
      let params = JSON.parse(JSON.stringify(this.formData));

      // 不需要海报和入口图
      delete params.background;
      delete params.poster;

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
      
      if(params.recommend_member_number === '' || !/^[1-9]\d*$/.test(params.recommend_member_number)) {
        return this.$message.error('直推会员人数要为1，2，3，4这种正整数');
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



      // 处理成三位小数,拉大一点取整避免因为小数四舍五入
      params.vdc_one = parseFloat(Math.floor(parseFloat(params.vdcOneVal) * 10) / 1000).toFixed(3);
      params.vdc_two = parseFloat(Math.floor(parseFloat(params.vdcTwoVal) * 10) / 1000).toFixed(3);
      
      params.sales_price = parseFloat(params.sales_price).toFixed(2);

      this.$post('/admin/shareholderDivide/update', params, res => {
        this.$message.success(`更新成功`);
        this.editVisible = false;
        this.reloadPage();
      });
    },

  }
};
</script>
