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
        <div class="table-title">岗位列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('auth/groupCreate')">
            <el-button type="primary" @click="openAdd">增加岗位</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" prop="id">
        </el-table-column>
        <el-table-column label="岗位名称" width="250" prop="title"></el-table-column>
        <el-table-column label="状态" width="120" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <template v-if="$auths.includes('auth/groupUpdate')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('auth/groupDelete')">
              <el-button class="error-color" type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
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

    <el-dialog v-if="trueStatus" title="新增岗位" width="750px" :close-on-click-modal="false" :visible.sync="addVisible" @close="resetPopup">
      <Add ref="add" :formData="addData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog v-if="trueStatus" title="编辑岗位" width="750px" :close-on-click-modal="false" :visible.sync="editVisible" @close="resetPopup">
      <Edit ref="edit" :formData="editData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

    <!-- <el-dialog title="编辑品牌" width="750px" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editBrand">确 定</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>

import Add from '@/partialviews/permission/adminGroup/Add';
import Edit from '@/partialviews/permission/adminGroup/Edit';


export default {
  name: 'adminGroups',
  components: {
    Add,
    Edit
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
      statusTexts: {
        [1]: '启用中',
        [2]: '已被禁用',
        [-1]: '已被删除'
      },

      dataList: [],
      addData: {},
      editData: {},


      addVisible: false,
      editVisible: false,

      trueStatus: true
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

      this.$get('/admin/auth/groupList', queryVal, res => {

        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
        this.$forceUpdate();
      });
    },

    openAdd() {
      this.addData = {
        title: '',
        modules: this.addData.modules || [],
        pages: this.addData.pages || {},
        permissions: this.addData.permissions || {}
      };
      this.addVisible = true;
    },
    addItem() {
      let rules = [];
      // 模块加入
      rules.push(...this.addData.modules);

      // 页面加入
      let pages = Object.values(this.addData.pages);
      for(let i = 0; i < pages.length; i++) {
        if(pages[i].length > 0) {
          rules.push(...pages[i]);
        }
      }

      // 权限加入
      let permissions = Object.values(this.addData.permissions);
      for(let i = 0; i < permissions.length; i++) {
        if(permissions[i].length > 0) {
          rules.push(...permissions[i]);
        }
      }

      let params = {
        title: this.addData.title,
        rules: rules
      }
      if(!params.title || params.title === '') {
        return this.$message.error('请填写岗位名称哦')
      }
      this.$post('/admin/auth/groupCreate', params, res => {
        this.$message.success('新增岗位成功');
        this.addVisible = false;
        this.reloadPage();
        this.trueStatus = false;
        setTimeout(() => {
          this.trueStatus = true;
        }, 50)
      });
    },

    showEdit(row) {
      if(!this.$auths.includes('auth/groupInfo')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常进行编辑操作，请联系管理员为您添加'); 
      }
      let params = {
        id: row.id
      }
      this.$get('/admin/auth/groupInfo', params, res => {
        let data = res.data;
        let auths = data.rules;
        let modules = [],
          pages = {},
          permissions = {};
        for (let i = 0; i < auths.length; i++) {
          let auth = auths[i];
          modules.push(auth.id);  //加入选中的模块id

          pages[auth.id] = [];
          if(!auth.pages || auth.pages.length == 0) continue;
            
          for (let j = 0; j < auth.pages.length; j++) {
            let page = auth.pages[j];
            pages[auth.id].push(page.id);  //以模块为键，填充默认选中的页面项。

            permissions[page.id] = [];
            if(!page.permission || page.permission.length == 0) continue;
            for (let k = 0; k < page.permission.length; k++) {
              let permission = page.permission[k];
              permissions[page.id].push(permission.id); //以页面id为键，填充默认选中的权限项。
            }
          }
        }
        this.editData  = {
          id: row.id,
          title: data.title,
          initModules: modules,
          initPages: pages,
          initPermissions: permissions,
          modules: this.editData.modules || [],
          pages: this.editData.pages || {},
          permissions: this.editData.permissions || {}
        };
        // if(this.$refs.edit) this.$refs.edit.resetParams();
        this.editVisible = true;
      });
      
    },
    editItem() {
      let rules = [];
      // 模块加入
      rules.push(...this.editData.modules);

      // 页面加入
      let pages = Object.values(this.editData.pages);
      for(let i = 0; i < pages.length; i++) {
        if(pages[i].length > 0) {
          rules.push(...pages[i]);
        }
      }

      // 权限加入
      let permissions = Object.values(this.editData.permissions);
      for(let i = 0; i < permissions.length; i++) {
        if(permissions[i].length > 0) {
          rules.push(...permissions[i]);
        }
      }

      let params = {
        id: this.editData.id,
        title: this.editData.title,
        rules: rules
      }
      if(!params.title || params.title === '') {
        return this.$message.error('请填写岗位名称哦')
      }
      this.$post('/admin/auth/groupUpdate', params, res => {
        this.$message.success('编辑岗位成功');
        this.editVisible = false;
        this.reloadPage();
        this.trueStatus = false;
        setTimeout(() => {
          this.trueStatus = true;
        }, 50)
      });
    },

    
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}，属于该岗位的管理员将受到影响，是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/auth/groupDelete', {
          id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    resetPopup() {
      this.trueStatus = false;
      setTimeout(() => {
        this.trueStatus = true;
      }, 50)
    },



    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    }
  }
};
</script>
