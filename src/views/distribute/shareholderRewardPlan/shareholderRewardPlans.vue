<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入编号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">股东奖计划</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('shareholderRewardPlan/create')">
            <el-button type="primary" @click="$router.push('shareholders')">查看股东列表</el-button>
          </template>
          <template v-if="$auths.includes('shareholderRewardPlan/create')">
            <el-button type="primary" @click="openAdd">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="编号" prop="plan_sn" width="120"></el-table-column>
        <el-table-column label="计划名" prop="plan_name" width="150"></el-table-column>
        <el-table-column label="开始类型" width="120" align="center">
          <template slot-scope="scope">
            {{startTypeTexts[scope.row.start_type]}}
          </template>
        </el-table-column>
        <el-table-column label="发放类型" width="120" align="center">
          <template slot-scope="scope">
            {{planTypeTexts[scope.row.plan_type]}}
          </template>
        </el-table-column>
        <el-table-column label="奖池总金额" prop="total_reward_price" width="100"></el-table-column>
        <el-table-column label="备注" prop="remark" width="140"></el-table-column>
        <el-table-column label="发放结果" width="120" align="center">
          <template slot-scope="scope">
            {{grantResTexts[scope.row.grant_res]}}
          </template>
        </el-table-column>
        <el-table-column label="发放时间" width="150" prop="grant_time"></el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>

        <el-table-column label="操作">
         <template slot-scope="scope">
          <el-button v-if="scope.row.grant_res == 2" class="error-color" type="text" size="default" @click="showErrorMsg(scope.row)">查看错误信息</el-button>
          <template v-if="$auths.includes('shareholderReward/rewardList')">
            <el-button v-if="scope.row.grant_res == 1" type="text" size="default" @click="goToGrantInfo(scope.row)">发放明细</el-button>
          </template>
          <template v-if="$auths.includes('shareholderRewardPlan/update')">
            <el-button v-if="scope.row.grant_res == 4"  type="text" size="default" @click="showEditItem(scope.row)">编辑</el-button>
          </template>
          <template v-if="$auths.includes('shareholderReward/grant')">
            <el-button v-if="scope.row.grant_res == 4 && scope.row.plan_type == 1" type="text" size="default" @click="tryGrant(scope.row)">发放</el-button>
          </template>
          <template v-if="$auths.includes('shareholderReward/grant')">
            <el-button v-if="scope.row.grant_res == 4 && scope.row.plan_type == 2" type="text" size="default" @click="toAppointGrant(scope.row)">指定发放</el-button>
          </template>
          <template v-if="$auths.includes('shareholderRewardPlan/delete')">
            <el-button v-if="scope.row.grant_res == 4" type="text" size="default" @click="deleteItem(scope.row)">删除</el-button>
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

    <el-dialog title="新增计划" width="900px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑规则" width="900px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="EditItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="派发前信息预览" width="900px" :close-on-click-modal="false" :visible.sync="grantPreviewVisible">
      <GrantPreview :users="users" :grantData="grantData"></GrantPreview>
      <div slot="footer" class="dialog-footer">
        <el-button @click="grantPreviewVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmGrant">确 定 发 放</el-button>
      </div>
    </el-dialog>



  </div>
</template>

<script>
import Add from '@/partialviews/distribute/shareholderRewardPlan/Add';
import Edit from '@/partialviews/distribute/shareholderRewardPlan/Edit';
import GrantPreview from '@/partialviews/distribute/shareholderRewardPlan/GrantPreview';

export default {
  name: 'shareholderRewardRules',
  components: {
    Add,
    Edit,
    GrantPreview
  },
  data() {
    return {
      currentPage: 1,
      count: 1,

      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],
      selection: [],
      formData: {},   //新增的数据
      users: {},  //派发时的用户各种情况
      grantData: {},  //派发数据

      planTypeTexts: {
        [1]: '按系统机制发放',
        [2]: '指定用户发放'
      },
      startTypeTexts: {
        [1]: '立马发放',
        [2]: '定时发放'
      },
      grantResTexts: {
        [1]: '发放成功',
        [2]: '发放失败',
        [3]: '发放中',
        [4]: '待发放',
        [-1]: '取消计划',
      },
      statusTexts: {
        [1]: '启用中',
        [2]: '已禁用',
        [-1]: '已被删除'
      },


      addVisible: false, //新增规则的显示与否的控制字段
      editVisible: false,
      grantPreviewVisible: false
    };
  },
  mounted() {
    this.getList();
  },
  activated() {
    if(localStorage.getItem('shouldRefresh')) {
      this.getList();
      if(document && document.querySelector('#page')) {
        document.querySelector('#page').scrollTop = 0;
      }
      localStorage.removeItem('shouldRefresh');
    }
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
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.filter = {
        keyword: this.queryForm.keyword
      }
      this.currentPage = 1;
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };

      this.$get('/admin/shareholderRewardPlan/list', queryVal, res => {
        this.dataList = res.data.list || [];
        
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    openAdd() {
      let formData = {
        plan_name: '',
        start_type: 1,  //当前强制1
        total_reward_price: 0,
        plan_type: 1,
        remark: ''
      }
      this.formData = formData;
      this.addVisible = true;
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写、勾选完所有信息，金额不能为0');
        }
      }
      if((!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.total_reward_price) || 
        parseFloat(params.total_reward_price) <= 0
      )) {
        return this.$message.error('奖池总金额要为大于0的正数');
      }
      this.$post('/admin/shareholderRewardPlan/create', params, res => {
        this.$message.success('新增计划成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    

    showEditItem(row) {
      
      if(!this.$auths.includes('shareholderRewardPlan/info')) {
        return this.$message.warning('无查看详情权限，请联系管理员添加相关权限');
      }
      let params = {
        plan_sn: row.plan_sn
      }
      this.$get('/admin/shareholderRewardPlan/info', params, res => {
        let data = res.data;
        
        this.formData = {
          plan_sn: data.plan_sn,
          plan_name: data.plan_name,
          start_type: data.start_type,  //当前强制1
          total_reward_price: data.total_reward_price,
          plan_type: data.plan_type,
          remark: data.remark
        }
        this.editVisible = true;
        
      });
      
    },

    EditItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写、勾选完所有信息');
        }
      }
      
      if((!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.total_reward_price) || 
        parseFloat(params.total_reward_price) <= 0
      )) {
        return this.$message.error('奖池总金额要为大于0的正数');
      }

      this.$post('/admin/shareholderRewardPlan/update', params, res => {
        this.$message.success(`更新成功`);
        this.editVisible = false;
        this.reloadPage();
      });
    },

    tryGrant(row) {
      if(!this.$auths.includes('shareholderReward/userList')) {
        return this.$message.warning('无查看 查看股东奖计划可发放总人数 权限，请联系管理员添加相关权限');
      }

      let params = {
        plan_sn: row.plan_sn
      };

      this.$get('/admin/shareholderReward/userList', params, res => {
        if(!res.data) return this.$message.error('无符合条件的人');
        let users = res.data;
        
        this.users = users;
        this.grantData = {
          plan_sn: row.plan_sn,
          plan_name: row.plan_name
        }
        this.grantPreviewVisible = true;
      });
    },
    confirmGrant() {
      this.$confirm(`您将准备对${this.grantData.plan_name}执行发放操作, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/shareholderReward/grant', {
          plan_sn: this.grantData.plan_sn
        }, res => {
          this.$message.success('发放成功');
          this.grantPreviewVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.plan_name}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/shareholderRewardPlan/delete', {
          plan_sn: row.plan_sn
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    showErrorMsg(row) {
      this.$alert(row.error_remark, {
        title: '错误信息',
        type: 'error',
      }).catch(() => {})
    },


    toAppointGrant(row) {
      this.$router.push({path: 'shareholderRewardAppointGrant', query: {plan_sn: row.plan_sn}})
    },
    goToGrantInfo(row) {
      this.$router.push({path: 'shareholderRewardGrantInfo', query: {plan_sn: row.plan_sn}})
    }

  },
  
};
</script>

