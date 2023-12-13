<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <!-- <el-form-item label="创建时间" prop="createDate">
              <el-date-picker
                v-model="createDate"
                type="datetimerange"
                :picker-options="pickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :clearable="false"
                align="right"
              ></el-date-picker>
            </el-form-item> -->

            <el-form-item>
              <el-button type="primary" @click="queryInfo">查询</el-button>
              <el-button @click="resetQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="subpage-content">
      <div class="default-container">
        
        <div class="table-ctrls">
          <div class="table-title">口碑评价官列表</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('reputation/userCreate')">
              <el-button type="primary" @click="showAdd">新增</el-button>
            </template>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.user_avatarUrl"/>
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="100" prop="user_name">
          </el-table-column>
          <el-table-column label="用户标签" width="360" prop="user_tag"></el-table-column>

          <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
          <el-table-column label="状态" width="70">
            <template slot-scope="scope">
              <div :class="{'warning-color': scope.row.status == 2, 'success-color': scope.row.status == 1}">
                {{statusTexts[scope.row.status]}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <template v-if="$auths.includes('reputation/userUpdate')">
                <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
              </template>
              <template v-if="$auths.includes('reputation/userStatus')">
                <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">
                  {{scope.row.status == 1 ? '禁用' : '启用'}}
                </el-button>
              </template>
              <template v-if="$auths.includes('reputation/userDelete')">
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
    </div>


    <el-dialog title="新增口碑评价官" width="800px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑口碑评价官信息" width="800px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import moment from 'moment';

import Add from '@/partialviews/commedity/reputation/reputator/AddReputator';
import Edit from '@/partialviews/commedity/reputation/reputator/EditReputator';

import {nTimePickerConfig} from '@/config';

export default {
  name: 'reputations',
  components: {
    Add,
    Edit,
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: '',
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },

      categories: [],
      statusTexts: {
        [1]: '正常',
        [2]: '已禁用',
        [-1]: '已被删除'
      },
      dataList: [],
      formData: {},
      selection: [],

      createDate: [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,
      
      addVisible: false,
      bindAddVisible: false,
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
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      this.createDate = [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];

      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      if(this.createDate && this.createDate.length == 2) {
        this.filter.start_time = this.createDate[0];
        this.filter.end_time = this.createDate[1];
      }

      this.getList();
    },
    

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,

        // start_time: this.filter.start_time,
        // end_time: this.filter.end_time
      };


      this.$get('/admin/reputation/userList', queryVal, res => {
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

    showAdd() {
      this.formData = {
        uid: '',
        user_name: '',
        user_avatarUrl: '',
        user_tag: '',
        user_desc: '',
        user_level: 1   //当前默认1
      }
      this.addVisible = true;
    },
    addItem() {
      let params = {
        uid: this.formData.uid,
        user_name: this.formData.user_name,
        user_avatarUrl: this.formData.user_avatarUrl,
        user_tag: this.formData.user_tag,
        user_level: this.formData.user_level
      };


      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写/勾选完所有信息哦');
        }
      }
      params.user_desc = this.formData.user_desc.trim();

      this.$post('/admin/reputation/userCreate', params, res => {
        this.$message.success('新增口碑评价官成功');
        this.reloadPage();
        this.addVisible = false;
      });
    },

    showEdit(row) {
      let formData = {
        user_code: row.user_code,
        uid: null,
        link_user_origin: row.uid,
        link_user_name: row.user_name,
        link_user_avatarUrl: row.user_avatarUrl,
        user_name: row.user_name,
        user_avatarUrl: row.user_avatarUrl,
        user_tag: row.user_tag,
        user_desc: row.user_desc,
        user_level: row.user_level
      }
      this.formData = formData;
      this.editVisible = true;
      console.log(this.formData);
      this.$forceUpdate();
      
    },

    editItem() {
      
      let params = {
        user_code: this.formData.user_code,
        uid: this.formData.uid,
        user_name: this.formData.user_name,
        user_avatarUrl: this.formData.user_avatarUrl,
        user_tag: this.formData.user_tag,
        user_level: this.formData.user_level
      };
      
      if(!params.uid || params.uid == this.formData.link_user_origin) {
        params.uid = this.formData.link_user_origin;
        params.user_name = this.formData.link_user_name;
        params.user_avatarUrl = this.formData.link_user_avatarUrl;
      }

 
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写/勾选完所有信息哦');
        }
      }
      params.user_desc = this.formData.user_desc.trim();

      this.$post('/admin/reputation/userUpdate', params, res => {
        this.$message.success('编辑口碑评价官信息成功');
        this.reloadPage();
        this.editVisible = false;
      });
    },

    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '禁用' : '启用'}${row.user_name}这位评价官, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/reputation/userStatus', {
          user_code: row.user_code,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '禁用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    
    deleteItem(row) {
      this.$confirm(`您将删除 ${row.user_name} 这条评价官, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/reputation/userDelete', {
          user_code: row.user_code
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
.order-profit-overviews {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}
.order-profit-overview {
  width: 120px;
  min-width: 120px;
  height: 80px;
  padding: 5px 10px;
  margin-right: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 5px 1px rgba(0,0,0,.1);
}
.order-profit-overview-title {
  margin-top: 10px;
  font-size: 18px;
}
.order-profit-overview-val {
  margin-top: 10px;
  font-size: 16px;
  white-space: nowrap;
}


</style>