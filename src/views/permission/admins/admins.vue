<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">管理员列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('manager/create')">
            <el-button type="primary" @click="openAdd">增加管理员</el-button>
          </template>
          
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" prop="id">
        </el-table-column>
        <el-table-column label="账号" width="150" prop="account"></el-table-column>
        <el-table-column label="昵称" width="150" prop="name"></el-table-column>
        <el-table-column label="所属用户组" width="120" prop="group_title"></el-table-column>
        <el-table-column label="管理员类别" width="150" prop="type">
          <template slot-scope="scope">
            {{typeTexts[scope.row.type]}}
          </template>
        </el-table-column>
        <el-table-column label="最后一次登录ip" width="120" prop="login_ip"></el-table-column>
        <el-table-column label="最后一次登录时间" width="160" prop="login_time"></el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('manager/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '禁用' : '启用'}}</el-button>
            </template>
            <template v-if="$auths.includes('manager/update')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('manager/updatePwd')">
              <el-button type="text" size="small" @click="showResetPwd(scope.row)">重置密码</el-button>
            </template>
            <template v-if="$auths.includes('manager/delete')">
              <el-button type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
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

    <el-dialog title="新增管理员" width="750px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑管理员" width="750px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="重置密码" width="750px" :close-on-click-modal="false" :visible.sync="resetPwdVisible">
      <ResetPwd ref="resetPwd" :formData="formData"></ResetPwd>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPwdVisible = false">取 消</el-button>
        <el-button type="primary" @click="resetPwd">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>

import Add from '@/partialviews/permission/admin/Add';
import Edit from '@/partialviews/permission/admin/Edit';
import ResetPwd from '@/partialviews/permission/admin/ResetPwd';


export default {
  name: 'admins',
  components: {
    Add,
    Edit,
    ResetPwd
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      typeTexts: {
        [1]: '普通管理员',
        [2]: '商户移动端管理员',
        [3]: '供应商管理员',
        [88]: '超级管理员'
      },
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },

      dataList: [],
      formData: {},

      addVisible: false,
      editVisible:false,
      resetPwdVisible: false
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
      this.currentPage = 1;
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };

      this.$get('/admin/manager/list', queryVal, res => {

        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },

    openAdd() {
      this.formData = {
        name: '',
        account: '',
        group_id: null,
        pwd: '',
        rePwd: '',
        email: '',
        type: 1,
        supplier_code: ''
      },
      this.addVisible = true;
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      delete params.email;
      if(params.type !== 3) delete params.supplier_code;
      let formValues = Object.values(params);
      for (let i = 0; i < formValues.length; i++) {
        if (formValues[i] === '') return this.$message.error('请填写/勾选完所有内容，并勾选所属用户组哦');
      }
      if(!/^[a-zA-Z0-9]*$/.test(params.account)) {
        return this.$message.error("账号格式有误，必须是大小写字母或数字");
      }
      if (this.formData.pwd != this.formData.rePwd) {
        return this.$message.error('两次密码不一致，请重新填写确认');
      }
      if (this.formData.pwd.length < 6 || this.formData.pwd.length > 18) {
        return this.$message.error('密码最短6位，最长18位，请您检查下哈');
      }
      if(this.formData.email && this.formData.email !== '') {
        if(!/^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/.test(this.formData.email)) {
          return this.$message.error('邮箱格式有误，请检查');
        }
        params.email = this.formData.email;
      }

      this.$post('/admin/manager/create', params, res => {
        this.$message.success('添加管理员成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },
    
    showEdit(row) {
      this.formData = {
        id: row.id,
        name: row.name,
        account: row.account,
        group_id: row.group_id,
        email: row.email,
        type: row.type,
        supplier_code: row.supplier_code || ''
      }
      this.editVisible = true;
    },
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      delete params.email;
      if(params.type !== 3) delete params.supplier_code;
      let formValues = Object.values(params);
      for (let i = 0; i < formValues.length; i++) {
        if (formValues[i] === '') return this.$message.error('请填写完所有内容，并勾选所属用户组哦');
      }
      if(!/^[a-zA-Z0-9]*$/.test(params.account)) {
        return this.$message.error("账号格式有误，必须是大小写字母或数字");
      }
      if(this.formData.email && this.formData.email !== '') {
        if(!/^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/.test(this.formData.email)) {
          return this.$message.error('邮箱格式有误，请检查');
        }
        params.email = this.formData.email;
      }

      this.$post('/admin/manager/update', params, res => {
        this.$message.success('编辑管理员成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },

    showResetPwd(row) {
      this.$confirm(`重置密码操作会影响管理员使用旧密码登录, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.formData = {
          id: row.id,
          account: row.account,
          pwd: '',
          rePwd: ''
        }
        this.resetPwdVisible = true;
      }).catch(() => {});
    },
    resetPwd() {
      let params = JSON.parse(JSON.stringify(this.formData));
      let formValues = Object.values(params);
      for (let i = 0; i < formValues.length; i++) {
        if (formValues[i] === '') return this.$message.error('请填写完所有内容哦');
      }
      if (this.formData.pwd != this.formData.rePwd) {
        return this.$message.error('两次密码不一致，请重新填写确认');
      }
      if (this.formData.pwd.length < 6 || this.formData.pwd.length > 18) {
        return this.$message.error('密码最短6位，最长18位，请您检查下哈');
      }
      this.$post('/admin/manager/updatePwd', params, res => {
        this.$message.success('重置密码成功');
        this.resetPwdVisible = false;
        this.reloadPage();
      });
    },

    toggleItem(row) {
      this.$confirm(`您将 ${row.status == 1 ? '禁用' : '启用'} ${row.name} 这一管理员, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/manager/status', {
          id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '禁用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    deleteItem(row) {
      this.$confirm(`您将删除${row.name}，是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/manager/delete', {
          id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    }
  }
};
</script>
