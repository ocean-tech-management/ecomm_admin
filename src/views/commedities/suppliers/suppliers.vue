<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入供应商名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">供货商列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('supplier/create')">
            <el-button type="primary" @click="showAdd">新增供应商</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="供应商编码" prop="supplier_code" width="120">
        </el-table-column>
        <el-table-column label="供应商名称" prop="name" width="120"></el-table-column>
        <el-table-column label="联系人" prop="concat_user" width="120"></el-table-column>
        <el-table-column label="联系方式" prop="concat_phone" width="120"></el-table-column>
        <el-table-column label="联系地址" prop="address" width="180"></el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('supplier/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '禁用' : '启用'}}</el-button>
            </template>
            <template v-if="$auths.includes('supplier/update')">
              <el-button type="text" size="default" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('supplier/delete')">
              <el-button class="error-color" type="text" size="default" @click="deleteItem(scope.row)">删除</el-button>
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

    <el-dialog title="新增供应商" width="650px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addBrand">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑供应商" width="750px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editBrand">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { publishDate } from '@/config.js';
import Add from '@/partialviews/commedity/supplier/Add';
import Edit from '@/partialviews/commedity/supplier/Edit';

export default {
  name: 'suppliers',
  components: {
    Add,
    Edit
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
      subCategories: [],
      statusTexts: {
        [1]: '启用中',
        [2]: '禁用中',
        [-1]: '已被删除'
      },
      dataList: [],
      formData: {},
      addVisible: false,
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
        keyword: '',
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

      this.$get('/admin/supplier/list', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    getSubCategories() {
      let params = {
        keyword: '',
        p_code: this.queryForm.p_code,
        type: 3 // 1 父子 2父级 //子级
      };

      this.$sget('/admin/category/list', params, res => {
        this.subCategories =  res.data;
        this.queryForm.category_code = this.subCategories[0].code || '';
      });
    },

    updateParentCategory(val) {
      if(!val || val === '') {
        this.subCategories = [];
        this.queryForm.category_code = '';
      } else {
        this.getSubCategories(val);
      }
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAdd() {
      this.formData = {
        name: '',
        concat_user: '',
        concat_phone: '',
        address: '',
        level: 1  //1普通供货商，2高级供应商，3特级供应商
      };
      this.addVisible = true;
    },
    addBrand() {
      let params = {
        name: this.formData.name,
        address: this.formData.address,
        level: this.formData.level
      }
      params.name = params.name.trim();
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息哦');
        }
      }
      if(this.formData.concat_user && this.formData.concat_user !== '') params.concat_user = this.formData.concat_user.trim();
      if(this.formData.concat_phone && this.formData.concat_phone !== '') params.concat_phone = this.formData.concat_phone.trim();
      if(params.concat_phone && params.concat_phone !== '') {
        if(!/^1[3456789]\d{9}$/.test(params.concat_phone)) {
          return this.$message.error('供应商联系人手机号码 格式有误，请检查或留空');
        }
      }
      this.$post('/admin/supplier/create', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      this.formData = {
        supplier_code: row.supplier_code,
        name: row.name,
        concat_user: row.concat_user,
        concat_phone: row.concat_phone,
        address: row.address,
        level: row.level
      };
      this.editVisible = true;
    },

    editBrand() {
      let params = {
        supplier_code: this.formData.supplier_code,
        name: this.formData.name,
        address: this.formData.address,
        level: this.formData.level
      }
      params.name = params.name.trim();
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息哦');
        }
      }
      if(this.formData.concat_user && this.formData.concat_user !== '') params.concat_user = this.formData.concat_user.trim();
      if(this.formData.concat_phone && this.formData.concat_phone !== '') params.concat_phone = this.formData.concat_phone.trim();
      if(params.concat_phone && params.concat_phone !== '') {
        if(!/^1[3456789]\d{9}$/.test(params.concat_phone)) {
          return this.$message.error('供应商联系人手机号码 格式有误，请检查或留空');
        }
      }
      this.$post('/admin/supplier/update', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });

    },

    
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '禁用' : '启用'} ${row.name} 这个供应商, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/supplier/status', {
          supplier_code: row.supplier_code,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '禁用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    deleteItem(row) {
      this.$confirm(`您将删除 ${row.name} 这个供应商, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/supplier/delete', {
          supplier_code: row.supplier_code
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
