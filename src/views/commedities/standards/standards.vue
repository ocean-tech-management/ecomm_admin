<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入规格名称" @keyup.enter.native="queryInfo"></el-input>
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
        <div class="table-title">规格列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('attr/create')">
            <el-button type="primary" @click="showAddStandard">新增规格</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" prop="attribute_code" width="100">
        </el-table-column>
        <el-table-column label="规格名称" prop="attribute_name" width="120"></el-table-column>
        <el-table-column label="规格标志" prop="attr_sn" width="120"></el-table-column>
        <el-table-column label="归属分类" width="180">
          <template slot-scope="scope">
            {{scope.row.p_category_name}} > {{scope.row.category_name}}
          </template>
        </el-table-column>
        <el-table-column label="规格数据" width="300" prop="items"></el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="操作">
         <template slot-scope="scope">
            <template v-if="$auths.includes('attr/keyUpdate')">
              <el-button type="text" size="default" @click="showEditStandard(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('attr/valueUpdate')">
              <el-button type="text" size="default" @click="showEditStandardData(scope.row)">编辑数据</el-button>
            </template>
            <template v-if="$auths.includes('attr/keyDelete')">
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

    <el-dialog title="新增规格" width="900px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addStandard">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑规格基本信息" width="900px" :close-on-click-modal="false" :visible.sync="editStandardVisible">
      <EditStandard ref="editstandard" :formData="formData"></EditStandard>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editStandardVisible = false">取 消</el-button>
        <el-button type="primary" @click="editStandard">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑规格数据" width="900px" :close-on-click-modal="false" :visible.sync="editStandardDataVisible" @close="editStandardData">
      <EditStandardData ref="editstandarddata" :formData="formData"></EditStandardData>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editStandardDataVisible = false">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { publishDate } from '@/config.js';
import Add from '@/partialviews/commedity/standard/AddStandard';
import EditStandard from '@/partialviews/commedity/standard/EditStandard';
import EditStandardData from '@/partialviews/commedity/standard/EditStandardData';

export default {
  name: 'standards',
  components: {
    Add,
    EditStandard,
    EditStandardData
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        p_code: '',
        category_code: ''
      },
      filter: {
        keyword: '',
        p_code: '',
        category_code: ''
      },
      dataList: [],
      
      categories: [],
      subCategories: [],
      
      formData: {},   //新增规格的数据
      addVisible: false, //新增规格的显示与否的控制字段
      editStandardVisible: false,
      editStandardDataVisible: false
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
        p_code: this.queryForm.p_code,
        category_code: this.queryForm.category_code
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        p_code: this.filter.p_code,
        category_code: this.filter.category_code,
        keyword: this.filter.keyword
      };

      this.$get('/admin/goods/attrKey', queryVal, res => {
        let dataList = res.data.list || [];
        if(!dataList || dataList.length == 0) return this.dataList = [];
        for(let i = 0; i < dataList.length; i++) {
          if(!dataList[i].values) return dataList[i].items = '';
          let items = [];
          for(let j = 0; j < dataList[i].values.length; j++) {
            items.push(`【${dataList[i].values[j].attribute_value}】`);
          }
          dataList[i].items = items.toString();
        }
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

    
    showAddStandard() {
      if(!this.$auths.includes('category/list')) {
        return this.$message.warning('您缺少查看分类列表的权限，无法正常添加规格，请联系管理员为您添加');
      }
      this.formData = {
        attribute_name: '',
        attr_sn: '',
        desc: '',
        category_code: '',
        attributeValues: [
          {
            attribute_value: '属性1',
            remark: ''
          }
        ]
      }
      if(this.$refs.add) this.$refs.add.initContent();
      this.addVisible = true;

    }, 
    
    addStandard() {
      
      let params = JSON.parse(JSON.stringify(this.formData));
      if(params.attribute_name == '' || params.attr_sn == '' ||  params.category_code == '' || params.desc == '') {
        return this.$message.error('请填写规格名称、规格标志、规格说明以及选择归属分类');
      }
      for(let i = params.attributeValues.length; i--; i > 0) {
         if(params.attributeValues[i].attribute_value == '') {
           params.attributeValues.splice(i, 1);
         }
      }
      if(params.attributeValues.length == 0) {
        return this.$message.error('请确保至少有一个规格项有值哦');
      }
      for(let i = 0; i < params.attributeValues.length; i++) {
        params.attributeValues[i].sort = i;
      }

      this.$post('/admin/attr/create', params, res => {
        this.$message.success(`新增成功`);
        this.addVisible = false;
        this.reloadPage();
      });

    },

    showEditStandard(row) {
      this.formData = {
        attribute_code: row.attribute_code,
        attribute_name: row.attribute_name,
        attr_sn: row.attr_sn,
        desc: row.desc,
        category_code: row.category_code,
        category_name: row.category_name
      }
      if(this.$refs.editstandard) this.$refs.editstandard.initContent();
      this.editStandardVisible = true;
    },

    editStandard() {
      let params = JSON.parse(JSON.stringify(this.formData));
      if(params.attribute_name == '' || params.category_code == '' || params.desc == '') {
        return this.$message.error('请填写规格名称、规格说明以及选择归属分类')
      }
      this.$post('/admin/attr/keyUpdate', params, res => {
        this.$message.success(`编辑规格基本信息成功`);
        this.editStandardVisible = false;
        this.reloadPage();
      });

    },

    showEditStandardData(row) {
      this.formData = {
        attr_sn: row.attr_sn,
        attribute_code: row.attribute_code,
        attribute_name: row.attribute_name,
        category_code: row.category_code,
        attributeValues: []
      }
      for(let i = 0; i < row.values.length; i++) {
        let item = {
          id: row.values[i].id,
          attribute_code: row.values[i].attribute_code,
          attribute_value: row.values[i].attribute_value
        }
        this.formData.attributeValues.push(item);
      }
      this.editStandardDataVisible = true;
    },
    editStandardData() {
      this.reloadPage();
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '下架' : '上架'}${row.name}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/property/status', {
          id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.attribute_name}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/attr/keyDelete', {
          attribute_code: row.attribute_code
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
  }
};
</script>
