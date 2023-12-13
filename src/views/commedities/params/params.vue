<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入参数模板名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">参数模板列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('goodsParams/create')">
            <el-button type="primary" @click="showAdd">新增参数模板</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column label="参数模板名称" prop="title" width="120"></el-table-column>
        <el-table-column label="参数模板内容" prop="templateContent" width="360"></el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('goodsParams/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '禁用' : '启用'}}</el-button>
            </template>
            <template v-if="$auths.includes('goodsParams/update')">
              <el-button type="text" size="default" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('goodsParams/delete')">
              <el-button class="error-color" type="text" size="default" @click="deleteItem(scope.row)">删除</el-button>
            </template>  
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 25, 50]"
          :page-size="pageCount"
          :pager-count="7"
          layout="sizes, prev, pager, next"
          :page-count="count"
        ></el-pagination>
      </div>
    </div>

    <el-dialog title="新增参数模板" width="950px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑参数模板" width="950px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import Add from '@/partialviews/commedity/param/Add';
import Edit from '@/partialviews/commedity/param/Edit';

export default {
  name: 'params',
  components: {
    Add,
    Edit
  },
  data() {
    return {
      currentPage: 1,
      pageCount: 10,
      count: 1,
      queryForm: {
        keyword: '',
        searType: 1
      },
      filter: {
        keyword: '',
        searType: 1
      },
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
        pageNumber: this.pageCount,
        keyword: this.filter.keyword,
        searType: this.filter.searType
      };

      this.$get('/admin/goodsParams/list', queryVal, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          let templateContent = [];
          let item = JSON.parse(dataList[i].content);
          for(let j = 0; j < item.length; j++) {
            let names = [];
            for(let k = 0; k < item[j].subgroups.length; k++) {
              if(item[j].subgroups[k].name && item[j].subgroups[k].name !== '') names.push(item[j].subgroups[k].name);
            }
            let content = `${item[j].title}`;
            if(names && names.length > 0) content += `(${names.join('、')})`;
            templateContent.push(content);
          }
          dataList[i].templateContent = templateContent.join('；');
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    handleSizeChange(value) {
      this.pageCount = value;
      this.currentPage = 1;
      this.getList();
    },

    showAdd() {
      this.formData = {
        title: '',
        content: [{
          title: '',
          subgroups: [{
            name: '',
            info: ''
          }]
        }],
      };
      this.addVisible = true;
    },
    addItem() {
      let params = {
        title: this.formData.title,
        content: this.formData.content
      }
      params.title = params.title.trim();
      for(let i = 0; i < params.content.length; i++) {
        params.content[i].title = params.content[i].title.trim();
        for(let j = 0; j < params.content[i].subgroups.length; j++) {
          params.content[i].subgroups[j].name = params.content[i].subgroups[j].name.trim();
        }
      }
      if(!params.title || params.title === '') {
        return this.$message.error('请填写参数模板名称哦');
      }
      this.$post('/admin/goodsParams/create', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      this.formData = {
        param_code: row.param_code,
        title: row.title,
        content: JSON.parse(row.content) || []
      };
      this.editVisible = true;
    },

    editItem() {
      let params = {
        param_code: this.formData.param_code,
        title: this.formData.title,
        content: this.formData.content
      }
      params.title = params.title.trim();
      for(let i = 0; i < params.content.length; i++) {
        params.content[i].title = params.content[i].title.trim();
        for(let j = 0; j < params.content[i].subgroups.length; j++) {
          params.content[i].subgroups[j].name = params.content[i].subgroups[j].name.trim();
        }
      }
      if(!params.title || params.title === '') {
        return this.$message.error('请填写参数模板名称哦');
      }
      this.$post('/admin/goodsParams/update', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });

    },

    
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '禁用' : '启用'} ${row.title} 这个参数模板, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/goodsParams/status', {
          param_code: row.param_code,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '禁用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    deleteItem(row) {
      this.$confirm(`您将删除 ${row.title} 这个参数模板, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/goodsParams/delete', {
          param_code: row.param_code
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
