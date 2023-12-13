<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入品牌名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="分类" prop="p_code">
            <el-select placeholder="不限" name="p_code" v-model="queryForm.p_code" @change="updateParentCategory">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in categories" :label="item.name" :value="item.code" :key="item.code"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="category_code">
            <el-select placeholder="不限（前面的类别无效）" name="category_code" v-model="queryForm.category_code">
              <el-option v-if="!queryForm.p_code || queryForm.p_code === ''" label="不限" value></el-option>
              <el-option v-for="item in subCategories" :label="item.name" :value="item.code" :key="item.code"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">品牌列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('brand/create')">
            <el-button type="primary" @click="showAdd">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" prop="brand_code" width="70">
        </el-table-column>
        <el-table-column label="品牌名" prop="brand_name" width="180"></el-table-column>
        <el-table-column label="分类" width="180">
          <template slot-scope="scope">
            {{scope.row.p_category_name}} > {{scope.row.category_name}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('brand/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '禁用' : '启用'}}</el-button>
            </template>
            <template v-if="$auths.includes('brand/update')">
              <el-button type="text" size="default" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('brand/delete')">
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

    <el-dialog title="新增品牌" width="750px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addBrand">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑品牌" width="750px" :close-on-click-modal="false" :visible.sync="editVisible">
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
import Add from '@/partialviews/commedity/brand/Add';
import Edit from '@/partialviews/commedity/brand/Edit';

export default {
  name: 'brands',
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
        searType: 1,
        p_code: '',
        category_code: ''
      },
      filter: {
        keyword: '',
        searType: 1,
        p_code: '',
        category_code: ''
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
    this.getCategories();
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
        searType: 1,
        p_code: '',
        category_code: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        searType: this.queryForm.searType,
        category_code: this.queryForm.category_code
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        category_code: this.filter.category_code,
        searType: this.filter.searType,
        commedity_type: 1 //正常商品
      };

      this.$get('/admin/brand/list', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    getCategories() {
      if(!this.$auths.includes('category/list')) {
        return this.categories = [];
      }
      let params = {
        keyword: '',
        type: 2 // 1 父子 2父级
      };

      this.$get('/admin/category/list', params, res => {
        this.categories =  res.data;
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
      if(!this.$auths.includes('category/list')) {
        return this.$message.warning('您缺少查看分类列表的权限，无法正常添加品牌，请联系管理员为您添加');
      }
      this.formData = {
        brand_name: '',
        category_code: ''
      };
      if(this.$refs.add) this.$refs.add.queryInfo();
      this.addVisible = true;
    },
    addBrand() {
      let params = {
        brand_name: this.formData.brand_name,
        category_code: this.formData.category_code
      }
      if(!params.brand_name || params.brand_name == '') {
        return this.$message.error('请填写品牌名哦')
      }
      if(!params.category_code || params.category_code == '') {
        return this.$message.error('勾选一下二级分类哈')
      }
      this.$post('/admin/brand/create', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      this.formData = {
        brand_code: row.brand_code,
        brand_name: row.brand_name,
        category_code: row.category_code,
        category_name: row.category_name
      };
      if(this.$refs.edit) this.$refs.edit.initContent();
      this.editVisible = true;
    },

    editBrand() {
      let params = {
        brand_code: this.formData.brand_code,
        brand_name: this.formData.brand_name,
        category_code: this.formData.category_code
      }
      if(!params.brand_name || params.brand_name == '') {
        return this.$message.error('请填写品牌名哦')
      }
      if(!params.category_code || params.category_code == '') {
        return this.$message.error('勾选一下二级分类哈')
      }
      this.$post('/admin/brand/update', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });

    },

    
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '禁用' : '启用'} ${row.category_name} 类目下的 ${row.brand_name} 这个品牌, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/brand/status', {
          brand_code: row.brand_code,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '禁用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    deleteItem(row) {
      this.$confirm(`您将删除 ${row.category_name} 类目下的 ${row.brand_name} 这个品牌, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/brand/delete', {
          brand_code: row.brand_code
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
