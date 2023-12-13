<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="关键词" prop="userKeyword">
            <el-input v-model="queryForm.userKeyword" placeholder="请输入手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item label="操作时间" prop="createDate">
            <el-date-picker v-model="createDate" type="datetimerange" :picker-options="pickerOptions" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" align="right"></el-date-picker>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">
          额外提现额度操作列表
          <SloganTip type="danger"></SloganTip>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('userExtra/create')">
            <el-button type="primary" @click="showAssign">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="用户名" width="120" prop="user_name"></el-table-column>
        <el-table-column label="手机号码" width="140" prop="user_phone"></el-table-column>
        <el-table-column label="额外提现额度" width="120" prop="price"></el-table-column>
        <el-table-column label="有效期" width="170">
          <template slot-scope="scope">
            <template v-if="scope.row.valid_type != 2">永久额度</template>
            <template v-else>{{ scope.row.valid_start_time }} ~ {{ scope.row.valid_end_time }}</template>
          </template>
        </el-table-column>
        <el-table-column label="备注" width="350" prop="remark"></el-table-column>
        <el-table-column label="状态" width="100" prop="status" align="center">
          <template slot-scope="scope">
            <span :class="{ 'error-color': scope.row.status != 1 }">{{ statusTexts[scope.row.status] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="160" prop="create_time"></el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('userExtra/update')">
              <el-button type="text" size="default" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('userExtra/delete')">
              <el-button class="error-color" type="text" size="default" @click="deleteItem(scope.row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>


    <el-dialog width="800px" :close-on-click-modal="false" :visible.sync="assignVisible">
      <div slot="title" class="el-dialog__title">
        新增额外额度
        <SloganTip type="danger"></SloganTip>
      </div>
      <Assign ref="assign" :formData="formData"></Assign>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAssign">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog width="800px" :close-on-click-modal="false" :visible.sync="editVisible">
      <div slot="title" class="el-dialog__title">
        编辑额外额度
        <SloganTip type="danger"></SloganTip>
      </div>
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import moment from "moment";
import {nTimePickerConfig} from '@/config';

import Assign from '@/partialviews/user/userExtraWithdrawLimit/Assign';
import Edit from '@/partialviews/user/userExtraWithdrawLimit/Edit';
import SloganTip from '@/components/SloganTip';
export default {
  name: 'crowdFundingRecharges',
  components: {
    Assign,
    Edit,
    SloganTip
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        userKeyword: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      filter: {
        userKeyword: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      dataList: [],
      formData: {},

      statusTexts: {
        [1]: '正常',
        [2]: '禁用',
        [3]: '充值待支付',
        [-1]: '删除'
      },
      payTypeTexts: {
        [1]: '余额支付',
        [2]: '微信支付',  //现金支付
        [4]: '拼拼支付',
        [5]: '集品券支付',
        [6]: '协议支付'
      },


      createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,


      assignVisible: false,
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
      this.createDate = [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
      this.filter = {
        userKeyword: '',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      if(!this.createDate || this.createDate.length != 2) {
        return this.$message.error('请选择有效操作时间');
      }
      this.filter = {
        userKeyword: this.queryForm.userKeyword,
        start_time: this.createDate[0],
        end_time: this.createDate[1]
      };
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        userKeyword: this.filter.userKeyword,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };


      this.$get('/admin/userExtra/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAssign() {
      this.formData = {
        uid: '',
        phone: '',
        price: '',
        valid_type: 1,
        remark: ''
      }
      this.assignVisible = true;
    },
    confirmAssign() {
      let result = this.$refs.assign.confirmInfos();
      if(result.valid_type != 2) {
        delete result.valid_start_time;
        delete result.valid_end_time;
      }
      let paramValues = Object.values(result);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写/勾选完所有信息，指定要操作的用户必须是授权了手机号码的用户');
        }
      }
      if(
        !(/^-?(\d|[1-9]\d+)(\.\d+)?$/.test(result.price)) ||
        parseFloat(result.price) == 0
      ) {
        return this.$message.error(`指定的额外提现额度要为不等于零的数，请检查`)
      }

      let params = {
        userList: [result]
      }

      this.$post('/admin/userExtra/create', params, res => {
        this.assignVisible = false;
        this.$message.success('操作成功');

        // 重置时间筛选条件
        this.createDate = [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
        this.filter.start_time = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
        this.filter.end_time = oment().format('YYYY-MM-DD HH:mm:ss');
        this.currentPage = 1;
        this.reloadPage();
      });
    },

    showEdit(row) {
      let formData = {
        id: row.id,
        uid: row.uid,
        user_name: row.user_name,
        price: row.price,
        valid_type: row.valid_type,
        remark: row.remark
      }
      if(formData.valid_type == 2) {
        formData.valid_start_time = row.valid_start_time;
        formData.valid_end_time = row.valid_end_time;
      }
      if(this.$refs.edit) this.$refs.edit.resetData(formData);
      this.formData = formData;
      this.editVisible = true;
    },
    editItem() {
      let result = this.$refs.edit.confirmInfos();
      delete result.user_name;
      if(result.valid_type != 2) {
        delete result.valid_start_time;
        delete result.valid_end_time;
      }
      let paramValues = Object.values(result);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写/勾选完所有信息，指定要操作的用户必须是授权了手机号码的用户');
        }
      }
      if(
        !(/^-?(\d|[1-9]\d+)(\.\d+)?$/.test(result.price)) ||
        parseFloat(result.price) == 0
      ) {
        return this.$message.error(`指定的额外提现额度要为不等于零的数，请检查`)
      }

      let params = {
        ...result
      }

      this.$post('/admin/userExtra/update', params, res => {
        this.editVisible = false;
        this.$message.success('操作成功');
        this.reloadPage();
      });

    },


    deleteItem(row) {
      this.$confirm(`您将删除 ${row.user_name} 的额外提现额度, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/userExtra/delete', {
          id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }




  }
};
</script>
<style lang="less" scoped>
.excel-uploader {
  display: inline-block;
  margin: 0 15px;
}
</style>

