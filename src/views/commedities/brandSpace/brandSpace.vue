<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入品牌名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="searType">
            <el-select placeholder="不限" name="searType" v-model="queryForm.searType">
              <el-option label="不限" :value="1"></el-option>
              <el-option label="上架中" :value="2"></el-option>
              <el-option label="下架" :value="3"></el-option>
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
          <template v-if="$auths.includes('brandSpace/goodsUpdate')">
            <el-button type="primary" @click="showAdd">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" prop="id" width="60"></el-table-column>
        <el-table-column label="品牌名称" prop="title" width="150"></el-table-column>
        <el-table-column label="描述" prop="desc" width="250"></el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('brandSpace/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '下架' : '上架'}}</el-button>
            </template>
            <template v-if="$auths.includes('brandSpace/update')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('brandSpace/goodsInfo')">
              <el-button type="text" size="small" @click="toRelations(scope.row)">查看关联商品</el-button>
            </template>
              
              
              
            <template v-if="$auths.includes('brandSpace/delete')">
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

    <el-dialog title="新增品牌" width="640px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑品牌" width="640px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { publishDate } from '@/config.js';

import Add from '@/partialviews/commedity/brandSpace/Add';
import Edit from '@/partialviews/commedity/brandSpace/Edit';

export default {
  name: 'brandSpace',
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
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      positionText: {
        [1]: '首页',
        [2]: '全部品牌列表中'
      },


      dataList: [],

      formData: {},
      editVisible: false,
      addVisible: false,
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
        category_code: '',
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
        show_position: [1, 2],   //1首页品牌，2全部品牌列表， 3N宫格
        searType: this.filter.searType
      };

      this.$get('/admin/brandSpace/list', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '下架' : '上架'}${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/brandSpace/status', {
          activity_id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    showAdd() {
      this.formData = {
        title: '',
        desc: '',
        background_image: '',
        poster: '',
        // 下面的填充默认数据
        show_position: 2,
        limit_type: 2,
        attach_type: -1,
        type: 1,
        sort: 999
      };
      if(this.$refs.add && this.$refs.add.$refs.poster) this.$refs.add.$refs.poster.clearFiles();
      this.addVisible = true;
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      params.background_image = params.poster;

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }
      
      if(!/^(0|[1-9][0-9]*)$/.test(params.sort)) {
        return this.$message.error('排序要为1，2，3，4这种正整数哦');
      }

      this.$post('/admin/brandSpace/create', params, res => {
        this.addVisible = false;
        this.$message.success('新增成功');
        this.reloadPage();
      });
    },

    showEdit(row) {
      if(!this.$auths.includes('brandSpace/info')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常修改品牌信息，请联系管理员为您添加'); 
      }
      let params = {
        aId: row.id
      };

      this.$get('/admin/brandSpace/info', params, res => {
        let data = res.data;
        this.formData = {
          aId: data.id,
          title: data.title,
          desc: data.desc,
          background_image: data.background_image,
          poster: data.poster,

          show_position: data.show_position,
          limit_type: data.limit_type,
          attach_type: data.attach_type,
          type: data.type,
          sort: data.sort
        };
        if(this.$refs.edit && this.$refs.edit.$refs.poster) this.$refs.edit.$refs.poster.clearFiles();
        this.editVisible = true;
      });
    },
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      params.background_image = params.poster;
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }
      
      if(!/^(0|[1-9][0-9]*)$/.test(params.sort)) {
        return this.$message.error('排序要为1，2，3，4这种正整数哦');
      }
      this.$post('/admin/brandSpace/update', params, res => {
        this.editVisible = false;
        this.$message.success('编辑成功');
        this.reloadPage();
      });
    },

    toRelations(row) {
      this.$router.push('/brandSpaceCommedities?aId=' + row.id);
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/brandSpace/delete', {
          activity_id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
