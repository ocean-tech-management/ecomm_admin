<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入称号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">拼拼会员套餐</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('ppylCVIP/create')">
            <el-button type="primary" @click="showAdd">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="编号" prop="combo_sn" width="150"></el-table-column>
        <el-table-column label="套餐名称" prop="name" width="250"></el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="有效时间" width="110">
          <template slot-scope="scope">
            {{scope.row.expire_time_val}} {{expireTimeTypeTexts[scope.row.expire_time_type]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
         <template slot-scope="scope">
          <template v-if="$auths.includes('ppylCVIP/status')">
            <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '下架' : '上架'}}</el-button>
          </template>

          <template v-if="$auths.includes('ppylCVIP/update')">
            <el-button type="text" size="default" @click="showEdit(scope.row)">编辑</el-button>
          </template>
          
          <template v-if="$auths.includes('ppylCVIP/delete')">
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


    <el-dialog title="新建套餐" width="800px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑套餐" width="800px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>



  </div>
</template>

<script>
import Add from '@/partialviews/ppyl/cvipCombo/AddCombo';
import Edit from '@/partialviews/ppyl/cvipCombo/EditCombo';
export default {
  name: 'cvipCombos',
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

      vdcGenreTexts: {
        [2]: '下级的红包总额'
      },
      expireTimeTypeTexts: {
        [1]: '天',
        [2]: '小时',
        [3]: '分钟',
        [4]: '秒'
      },
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },


      dataList: [],
      selection: [],
      formData: {},   //新增规则的数据

      addVisible: false, //新增规则的显示与否的控制字段
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
        keyword: ''
      };
      this.getList();
    },
    //查询
    queryInfo() {
      this.filter = {
        keyword: this.queryForm.keyword
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        keyword: this.filter.keyword
      };

      this.$get('/admin/ppylCVIP/list', queryVal, res => {
        let dataList = res.data;

        for(let i = 0; i < dataList.length; i++) {
          if(parseInt(dataList[i].expire_time) % 86400 === 0) {
            // 正天数
            dataList[i].expire_time_val = parseInt(dataList[i].expire_time) / 86400;
            dataList[i].expire_time_type = 1;  //1天，2小时，3分钟，4秒
          } else if(parseInt(dataList[i].expire_time) % 3600 === 0) {
            // 正小时
            dataList[i].expire_time_val = parseInt(dataList[i].expire_time) / 3600;
            dataList[i].expire_time_type = 2;  //1天，2小时，3分钟，4秒
          } else if(parseInt(dataList[i].expire_time) % 60 === 0) {
            dataList[i].expire_time_val = parseInt(dataList[i].expire_time) / 60;
            dataList[i].expire_time_type = 3;  //1天，2小时，3分钟，4秒
          } else {
            dataList[i].expire_time_val = parseInt(dataList[i].expire_time);
            dataList[i].expire_time_type = 4;  //1天，2小时，3分钟，4秒
          }
        }
        
        this.dataList = dataList;
      });
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
        this.$post('/admin/ppylCVIP/status', {
          combo_sn: row.combo_sn,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(err => {
        console.log(err);
      });
    },

    
    showAdd() {
      this.formData = {
        name: '',
        price: '',
        market_price: '',
        poster: '',
        desc: '',
        expire_time_val: '',
        expire_time_type: 1
      };
      if(this.$refs.add && this.$refs.add.$refs.poster) this.$refs.add.$refs.poster.clearFiles();
      this.addVisible = true;
    }, 
    addItem() {
      if(!this.formData.name || this.formData.name === '') {
        return this.$message.error('请填写套餐名称');
      }
      if(!this.formData.price || this.formData.price === '' || !/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.price)) {
        return this.$message.error('请填写套餐价格；要求大于0，最多两位小数');
      }
      if(!this.formData.market_price || this.formData.market_price === '' || !/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.market_price)) {
        return this.$message.error('请填写市场价；要求大于0，最多两位小数');
      }
      if(!this.formData.expire_time_val || this.formData.expire_time_val === '' || !/^[1-9]\d*$/.test(this.formData.expire_time_val)) {
        return this.$message.error('请填写有效时间；要求大于0，正整数');
      }
      let params = {
        name: this.formData.name,
        desc: this.formData.desc,
        poster: this.formData.poster,
        price: this.formData.price,
        market_price: this.formData.market_price
      }

      if(this.formData.expire_time_type === 1) {
        params.expire_time = parseInt(this.formData.expire_time_val) * 3600 * 24;
      } else if(this.formData.expire_time_type === 2) {
        params.expire_time = parseInt(this.formData.expire_time_val) * 3600;
      } else if(this.formData.expire_time_type === 3) {
        params.expire_time = parseInt(this.formData.expire_time_val) * 60;
      } else {
        params.expire_time = parseInt(this.formData.expire_time_val);
      }

      this.$post('/admin/ppylCVIP/create', params, res => {
        this.$message.success(`新增成功`);
        this.addVisible = false;
        this.reloadPage();
      });

    },
    

    showEdit(row) {
      this.formData = {
        combo_sn: row.combo_sn,
        name: row.name,
        price: row.price,
        market_price: row.market_price,
        poster: row.poster,
        desc: row.desc,
        expire_time_val: row.expire_time_val,
        expire_time_type: row.expire_time_type
      };
      if(this.$refs.edit && this.$refs.edit.$refs.poster) this.$refs.add.$refs.poster.clearFiles();
      this.editVisible = true;
      
    },

    editItem() {
      if(!this.formData.name || this.formData.name === '') {
        return this.$message.error('请填写套餐名称');
      }
      if(!this.formData.price || this.formData.price === '' || !/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.price)) {
        return this.$message.error('请填写套餐价格；要求大于0，最多两位小数');
      }
      if(!this.formData.market_price || this.formData.market_price === '' || !/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.market_price)) {
        return this.$message.error('请填写市场价；要求大于0，最多两位小数');
      }
      if(!this.formData.expire_time_val || this.formData.expire_time_val === '' || !/^[1-9]\d*$/.test(this.formData.expire_time_val)) {
        return this.$message.error('请填写有效时间；要求大于0，正整数');
      }
      let params = {
        combo_sn: this.formData.combo_sn,
        name: this.formData.name,
        desc: this.formData.desc,
        poster: this.formData.poster,
        price: this.formData.price,
        market_price: this.formData.market_price
      }

      if(this.formData.expire_time_type === 1) {
        params.expire_time = parseInt(this.formData.expire_time_val) * 3600 * 24;
      } else if(this.formData.expire_time_type === 2) {
        params.expire_time = parseInt(this.formData.expire_time_val) * 3600;
      } else if(this.formData.expire_time_type === 3) {
        params.expire_time = parseInt(this.formData.expire_time_val) * 60;
      } else {
        params.expire_time = parseInt(this.formData.expire_time_val);
      }

      this.$post('/admin/ppylCVIP/update', params, res => {
        this.$message.success(`编辑成功`);
        this.editVisible = false;
        this.reloadPage();
      });
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.name}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/ppylCVIP/delete', {
          combo_sn: row.combo_sn
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

  }
};
</script>
