<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="分类名称" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="级别" prop="type">
            <el-select placeholder="不限" name="type" v-model="queryForm.type">
              <el-option label="不限" :value="1"></el-option>
              <el-option label="一级" :value="2"></el-option>
              <el-option label="二级" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">分类列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('category/create')">
            <el-button type="primary" @click="openAdd">新增</el-button>
          </template>
          
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="80" prop="code"></el-table-column>
        <el-table-column label="分类名称" width="120" prop="name"></el-table-column>
        <el-table-column label="分类副标" width="120" prop="desc"></el-table-column>
        <el-table-column label="级别" width="60" prop="level">
          <template slot-scope="scope">
            {{scope.row.p_code ? '二级' : '一级'}}
          </template>
        </el-table-column>
        <el-table-column label="上级分类" width="120">
          <template slot-scope="scope">
            {{scope.row.p_code && scope.row.parent ? scope.row.parent.name : '——'}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="排序" width="70" prop="sort"></el-table-column>
        <el-table-column label="状态" width="70" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            
            <template v-if="$auths.includes('spu/list')">
              <el-button type="text" size="small" @click="openRelations(scope.row)">查看关联商品</el-button>
            </template>
            <template v-if="$auths.includes('category/status')">
              <el-button 
                :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}"
                type="text"
                size="small"
                @click="toggleItem(scope.row)"
              >{{scope.row.status == 1 ? '下架':'上架'}}</el-button>
            </template>
            <template v-if="$auths.includes('category/update')">
              <el-button type="text" size="small" @click="openEdit(scope.row)">修改</el-button>
            </template>
            <template v-if="$auths.includes('category/delete')">
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

    <el-dialog title="新建商品分类" width="640px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑商品分类" width="640px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="关联商品" width="900px" :visible.sync="relationVisible">
      <CommedityRelations ref="commedityRelations" :categoryCode="categoryCode"></CommedityRelations>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="relationVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Add from '@/partialviews/commedity/category/Add';
import Edit from '@/partialviews/commedity/category/Edit';
import CommedityRelations from '@/partialviews/commedity/category/CommedityRelations';

export default {
  name: 'commedityCategories',
  components: {
    Add,
    Edit,
    CommedityRelations
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        type: 1
      },
      filter: {
        keyword: '',
        type: 1
      },
      dataList: [],
      formData: {},
      
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },

      addVisible: false,
      editVisible: false,
      categoryCode: 1,
      relationVisible: false
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
        type: 1
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        type: this.queryForm.type
      };
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        type: this.filter.type // 1 父子 2父级 3子级
      };

      this.$get('/admin/category/list', queryVal, res => {
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

    openAdd() {
      this.formData = {
        name: '',
        desc: '',
        p_code: null,
        sort: 9999,
        icon: null
      };
      this.addVisible = true;
    },
    addItem() {
      if(!this.formData.name || this.formData.name === '') {
        return this.$message.error('请填写分类名称哦');
      }
      if(!this.formData.desc || this.formData.desc === '') {
        return this.$message.error('请填写分类副标哦，建议4个字内');
      }
      if(this.formData.p_code && !this.formData.icon) {
        return this.$message.error('子级分类请上传分类展示图哦');
      }
      if(!/^(0|[1-9][0-9]*)$/.test(this.formData.sort)) {
        return this.$message.error('排序要为1，2，3，4这种正整数哦');
      }
      let params = {
        name: this.formData.name,
        p_code: this.formData.p_code,
        desc: this.formData.desc,
        sort: this.formData.sort
      }
      if(this.formData.p_code) params.icon = this.formData.icon;
      this.$post('/admin/category/create', params, res => {
        this.$message.success('添加成功');
        this.addVisible = false;
        this.reloadPage();
        
        //如果是一级的话，刷新categories列表
        if(!params.p_code) this.$refs.add.getCategories();
      });
      
    },
    openEdit(row) {
      this.formData = {
        code: row.code,
        name: row.name,
        p_code: row.p_code,
        sort: row.sort,
        icon: row.icon,
        desc: row.desc
      };
      this.editVisible = true;
    },
    editItem() {
      if(!this.formData.name || this.formData.name === '') {
        return this.$message.error('请填写分类名称哦');
      }
      if(!this.formData.desc || this.formData.desc === '') {
        return this.$message.error('请填写分类副标哦，建议4个字内');
      }
      if(this.formData.p_code && !this.formData.icon) {
        return this.$message.error('子级分类请上传分类展示图哦');
      }
      if(!/^(0|[1-9][0-9]*)$/.test(this.formData.sort)) {
        return this.$message.error('排序要为1，2，3，4这种正整数哦');
      }
      let params = {
        code: this.formData.code,
        name: this.formData.name,
        desc: this.formData.desc,
        sort: this.formData.sort
      }
      if(this.formData.p_code) params.icon = this.formData.icon;
      this.$post('/admin/category/update', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },
    openRelations(row) {
      this.categoryCode = row.code;
      if(this.$refs['commedityRelations'] && this.$refs['commedityRelations'].$refs['relationsTable']) this.$refs['commedityRelations'].reloadData();
      this.relationVisible = true;
    },
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '下架' : '上架'}${row.name}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/category/status', {
          code: row.code,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    deleteItem(row) {
      let that = this;
      that
        .$confirm('你确定删除该分类？', '警告', {
          $confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          let params = {
            code: row.code
          }
          this.$get('/admin/category/delete', params, res => {
            this.$message.success('删除成功');
            this.reloadPage();
          });

        })
        .catch(() => {});
    }
  }
};
</script>
