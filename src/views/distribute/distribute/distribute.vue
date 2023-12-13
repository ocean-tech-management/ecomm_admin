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
        <div class="table-title">分润规则</div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="等级" prop="level" width="80"></el-table-column>
        <el-table-column label="称号" prop="name" width="100"></el-table-column>
        <el-table-column label="折扣" width="80" prop="discount">
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
        <el-table-column label="感恩奖一级分佣抽成" width="110" prop="vdc_one">
          <template slot-scope="scope">
            {{scope.row.gratefulVdcOneVal}}
          </template>
        </el-table-column>
        <el-table-column label="感恩奖二级分佣抽成" width="110" prop="vdc_two">
          <template slot-scope="scope">
            {{scope.row.gratefulVdcTwoVal}}
          </template>
        </el-table-column>


        <el-table-column label="分润类型" width="110" prop="vdc_genre">
          <template slot-scope="scope">
            <!-- 合伙人（level1）是销售额抽成 -->
            {{scope.row.vdc_genre == 1 ? '价差抽成' : '销售额抽成'}}
          </template>
        </el-table-column>
        
        <el-table-column label="提现手续费" width="110" prop="handing_scale">
          <template slot-scope="scope">
            {{scope.row.handing_scale && parseFloat(scope.row.handing_scale) != 0 ? ((parseFloat(scope.row.handing_scale) * 100).toFixed(1) + '%') : '——'}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
         <template slot-scope="scope">
          <template v-if="$auths.includes('divide/update')">
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
import { publishDate } from '@/config.js';
import Edit from '@/partialviews/distribute/distribute/EditRule';

export default {
  name: 'distribute',
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

      this.$get('/admin/divide/list', queryVal, res => {
        let dataList = res.data;

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].discountVal = dataList[i].discount ? (parseFloat(dataList[i].discount) * 10 + '折') : '——';
          dataList[i].vdcOneVal = dataList[i].vdc_one && parseFloat(dataList[i].vdc_one) != 0 ? (parseInt(parseFloat(dataList[i].vdc_one) * 10000) / 100 + '%') : '——';
          dataList[i].vdcTwoVal = dataList[i].vdc_two && parseFloat(dataList[i].vdc_two) != 0 ? (parseInt(parseFloat(dataList[i].vdc_two) * 10000) / 100 + '%') : '——';
          dataList[i].gratefulVdcOneVal = dataList[i].grateful_vdc_one && parseFloat(dataList[i].grateful_vdc_one) != 0 ? (parseInt(parseFloat(dataList[i].grateful_vdc_one) * 10000) / 100 + '%') : '——';
          dataList[i].gratefulVdcTwoVal = dataList[i].grateful_vdc_two && parseFloat(dataList[i].grateful_vdc_two) != 0 ? (parseInt(parseFloat(dataList[i].grateful_vdc_two) * 10000) / 100 + '%') : '——';
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

        growth_value: 0,

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
      this.$get('/admin/divide/info', params, res => {
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
          recommend_level: data.level != 3 ? data.recommend_level : [''],
          recommend_number: data.level != 3 ? data.recommend_number : [0],
          train_level: data.level != 3 ? data.train_level : [''],
          train_number: data.level != 3 ? data.train_number : [0],
          // leader_conditions: [{
          //   user_lv: '',
          //   user_num: ''
          // }],
          // leader_inv_condition: data.leader_inv_condition,
          vdc_one: data.vdc_one,
          vdc_two: data.vdc_two,

          grateful_vdc_one: data.grateful_vdc_one,
          grateful_vdc_two: data.grateful_vdc_two,

          vdcOneVal: data.vdc_one * 100,
          vdcTwoVal: data.vdc_two * 100,
          
          gratefulVdcOneVal: data.grateful_vdc_one * 100,
          gratefulVdcTwoVal: data.grateful_vdc_two * 100,

          vdc_type: data.vdc_type,
          handing_scale: data.handing_scale,
          sales_team_level: data.level != 3 ? data.sales_team_level : 0,
          sales_price:  data.level != 3 ? data.sales_price : 0,
          // vdc_genre: data.vdc_genre,
          vdc_genre: data.level == 1 ? 2 : 1,   //当前等级1合伙人是销售额抽成，其他是只与链条价差相关

          growth_value: data.growth_value,

          demotion_growth_value: data.demotion_growth_value,
          demotion_type: data.demotion_type,

          background: data.background,
          poster: data.poster
        }
        this.formData.vdcOneVal = this.formData.vdc_one && parseFloat(this.formData.vdc_one) != 0 ? (parseInt(parseFloat(this.formData.vdc_one) * 10000) / 100) : 0;
        this.formData.vdcTwoVal = this.formData.vdc_two && parseFloat(this.formData.vdc_two) != 0 ? (parseInt(parseFloat(this.formData.vdc_two) * 10000) / 100) : 0;

        this.formData.gratefulVdcOneVal = this.formData.grateful_vdc_one && parseFloat(this.formData.grateful_vdc_one) != 0 ? (parseInt(parseFloat(this.formData.grateful_vdc_one) * 10000) / 100) : 0;
        this.formData.gratefulVdcTwoVal = this.formData.grateful_vdc_two && parseFloat(this.formData.grateful_vdc_two) != 0 ? (parseInt(parseFloat(this.formData.grateful_vdc_two) * 10000) / 100) : 0;

        setTimeout(() => {
          if(this.$refs.edit) this.$refs.edit.getLeaders();
          this.editVisible = true;
        }, 10)
        
      });
      
    },

    editLeaderRule() {
      let params = JSON.parse(JSON.stringify(this.formData));
      if(params.level === 1) {
        delete params.background;
        delete params.poster;
      }
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
        !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.gratefulVdcOneVal) || 
        !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.gratefulVdcTwoVal) || 
        parseFloat(params.gratefulVdcOneVal) >= 100 ||
        parseFloat(params.gratefulVdcTwoVal) >= 100
      ) {
        return this.$message.error('感恩奖一级分佣抽成比例、感恩奖二级分佣抽成比例都要为小于100的正数');
      }
      
      if(
        !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.handing_scale) ||
        parseFloat(params.handing_scale) >= 1 
      ) {
        return this.$message.error('提现手续费要为小于1的正数');
      }

      if(params.level != 3) {
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
            !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.growth_value)||
            parseFloat(params.growth_value) <= 0
          ) {
          return this.$message.error('非普通vip会员成长值要为大于0的正数哦');
        }
        if(
            !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.demotion_growth_value)||
            parseFloat(params.demotion_growth_value) <= 0
          ) {
          return this.$message.error('非普通vip会员的降级门槛要为大于0的正数哦');
        }
        if(parseFloat(params.demotion_growth_value) > parseFloat(params.growth_value)) {
          return this.$message.error('降级门槛超过了升级成长值要求，请检查');
        }

        params.recommend_level = JSON.stringify(params.recommend_level);
        params.recommend_number = JSON.stringify(params.recommend_number);
        params.train_level = JSON.stringify(params.train_level);
        params.train_number = JSON.stringify(params.train_number);

      } else {
        if(
            !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.growth_value)||
            parseFloat(params.growth_value) < 0
          ) {
          return this.$message.error('普通vip会员成长值要为大于等于0的数哦');
        }

        delete params.recommend_level;
        delete params.recommend_number;
        delete params.train_level;
        delete params.train_number;
      }


      // 处理成三位小数,拉大一点取整避免因为小数四舍五入
      params.vdc_one = parseFloat(Math.floor(parseFloat(params.vdcOneVal) * 10) / 1000).toFixed(3);
      params.vdc_two = parseFloat(Math.floor(parseFloat(params.vdcTwoVal) * 10) / 1000).toFixed(3);

      params.grateful_vdc_one = parseFloat(Math.floor(parseFloat(params.gratefulVdcOneVal) * 10) / 1000).toFixed(3);
      params.grateful_vdc_two = parseFloat(Math.floor(parseFloat(params.gratefulVdcTwoVal) * 10) / 1000).toFixed(3);
      
      params.growth_value = parseFloat(params.growth_value).toFixed(2);

      this.$post('/admin/divide/update', params, res => {
        this.$message.success(`更新成功`);
        this.editVisible = false;
        this.reloadPage();
      });
    },

  }
};
</script>
