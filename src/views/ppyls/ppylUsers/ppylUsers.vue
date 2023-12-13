<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="根据上级筛选">
            <el-input v-model="queryForm.topUserPhone" placeholder="请输入精准手机号码或置空" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">拼拼会员列表<span v-if="userCount">（{{userCount}}）</span></div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('ppyl/repurchase')">
            <el-button type="primary" @click="showEditRepurchase">调整寄售次数</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <!-- <el-table-column label="序号"  width="150" prop="uid">
        </el-table-column> -->
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.avatarUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="100" prop="name">
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
        <el-table-column label="余额" width="120" prop="total_balance"></el-table-column>
        <el-table-column label="等级" width="100" prop="vip_name"></el-table-column>
        <el-table-column label="上级" width="200">
          <template slot-scope="scope">
            {{scope.row.link_user_name ? scope.row.link_user_name : '——'}}
            <span v-if="scope.row.link_user_level"> | {{scope.row.link_user_vip_name}}</span>
            <span v-if="scope.row.link_user_phone">({{scope.row.link_user_phone}})</span>
          </template>
        </el-table-column>
        
        <el-table-column label="会员身份" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.c_vip_level == 1" class="success-color">会员</span>
            <span v-else>——</span>
          </template>
        </el-table-column>
        <el-table-column label="失效时间" prop="c_vip_time_out_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">

            <template v-if="$auths.includes('ppylCVIP/assign')">
              <el-button type="text" size="small" @click="showAssign(scope.row)">调整会员有效期</el-button>
            </template>
            <template v-if="$auths.includes('ppyl/userRepurchase')">
              <el-button type="text" size="small" @click="showRepurchaseInfos(scope.row)">寄售次数</el-button>
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
    <el-dialog title="调整会员有效期" width="800px" :close-on-click-modal="false" :visible.sync="assignVisible">
      <Assign :formData="formData"></Assign>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignUser">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="调整寄售次数" width="600px" :close-on-click-modal="false" :visible.sync="editRepurchaseVisible">
      <EditRepurchase :formData="repurchaseParams"></EditRepurchase>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editRepurchaseVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditRepurchase">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="用户寄售次数" width="900px" :close-on-click-modal="false" :visible.sync="repurchaseInfosVisible">
      <RepurchaseInfos ref="repurchseInfos" :userInfo="userParams"></RepurchaseInfos>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="repurchaseInfosVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Assign from '@/partialviews/ppyl/user/Assign';
import EditRepurchase from '@/partialviews/ppyl/user/EditRepurchase';
import RepurchaseInfos from '@/partialviews/ppyl/user/RepurchaseInfos';

export default {
  name: 'mhppUsers',
  components: {
    Assign,
    EditRepurchase,
    RepurchaseInfos
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        topUserPhone: ''
      },
      filter: {
        keyword: '',
        topUserPhone: ''
      },
      dataList: [],
      leaderData: [],
      userCount: 0,

      formData: {},
      assignVisible: false,

      repurchaseParams: {},
      editRepurchaseVisible: false,

      userParams: {},
      repurchaseInfosVisible: false,
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
        topUserPhone: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        topUserPhone: this.queryForm.topUserPhone
      };
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        topUserPhone: this.filter.topUserPhone
      };

      if(queryVal.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(queryVal.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      }

      this.$get('/admin/ppyl/userList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAssign(row) {
      this.formData = {
        uid: row.uid,
        name: row.name,
        time_val: 0,
        time_type: 1
      }
      this.assignVisible = true
    },
    assignUser() {
      if(!(/^-?\d+$/.test(this.formData.time_val))) {
        return this.$message.error(`调整的有效期要为0，1，2，3，4这种整数，请检查下哈`)
      }
      if(this.formData.time_val == 0) return this.assignVisible = false;
      let params = {
        uid: this.formData.uid
      }
      
      if(this.formData.time_type === 1) {
        params.time = parseInt(this.formData.time_val) * 3600 * 24;
      } else if(this.formData.time_type === 2) {
        params.time = parseInt(this.formData.time_val) * 3600;
      } else if(this.formData.time_type === 3) {
        params.time = parseInt(this.formData.time_val) * 60;
      } else {
        params.time = parseInt(this.formData.time_val);
      }
      this.$post('/admin/ppylCVIP/assign', params, res => {
        this.$message.success(`调整成功`);
        this.assignVisible = false;
        this.reloadPage();
      });

    },
    showEditRepurchase() {
      this.repurchaseParams = {
        order_sn: '',
        number: 0
      }
      this.editRepurchaseVisible = true;
    },
    confirmEditRepurchase() {
      let params = {
        order_sn: this.repurchaseParams.order_sn.trim(),
        number: this.repurchaseParams.number
      }
      if(!params.order_sn || params.order_sn === '') {
        return this.$message.error(`请填写作为调整依据的订单号`)
      } 
      if(!params.number || params.number === '') {
        return this.$message.error(`请填写调整次数`)
      } 
      if(!(/^-?\d+$/.test(params.number))) {
        return this.$message.error(`调整的有效期要为0，1，2，3，4这种整数，请检查下哈`)
      }
      this.$post('/admin/ppyl/repurchase', params, res => {
        this.$message.success(`调整成功`);
        this.editRepurchaseVisible = false;
        this.reloadPage();
      });

    },
    showRepurchaseInfos(row) {
      this.userParams = {
        uid: row.uid,
        name: row.name
      }
      if(this.$refs.repurchseInfos) this.$refs.repurchseInfos.reloadData();
      this.repurchaseInfosVisible = true;
    }


  }
};
</script>
