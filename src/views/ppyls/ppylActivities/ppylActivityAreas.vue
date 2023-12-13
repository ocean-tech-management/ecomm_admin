<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入专区名称" @keyup.enter.native="queryInfo"></el-input>
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
        <div class="table-title">活动专区列表 <span class="success-color">{{aData.name || ''}}</span></div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('ppylArea/create')">
            <el-button type="primary" @click="showAdd">新增活动专区</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column label="活动专区名称" prop="name" width="150"></el-table-column>
        <el-table-column label="排序值" width="80" prop="sort"></el-table-column>
        <el-table-column label="规则" width="180">
          <template slot-scope="scope">
            {{joinLimitTimeTypeTexts[scope.row.join_limit_type]}}可参与 <span class="warning-color">{{scope.row.join_number || 0}}</span> 次<br/>
            {{winLimitTimeTypeTexts[scope.row.win_limit_type]}}可中 <span class="success-color">{{scope.row.win_number || 0}}</span> 次
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="170">
          <template slot-scope="scope">
            {{scope.row.start_time}} ~ {{scope.row.end_time}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        
        <el-table-column label="高亮" width="70" align="center" prop="highlight_status">
          <template slot-scope="scope">
            <div :class="{'warning-color': scope.row.highlight_status == 1}">
              {{highlightStatusTexts[scope.row.highlight_status]}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('ppylArea/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '下架' : '上架'}}</el-button>
            </template>
            <template v-if="$auths.includes('ppylArea/update')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('ppyl/goodsInfo')">
              <el-button type="text" size="small" @click="toRelations(scope.row)">查看关联商品</el-button>
            </template>
              
            <template v-if="$auths.includes('ppylArea/delete')">
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

    <el-dialog title="新增活动专区" width="640px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑活动专区" width="640px" :close-on-click-modal="false" :visible.sync="editVisible">
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

import Add from '@/partialviews/ppyl/activity/area/AddArea';
import Edit from '@/partialviews/ppyl/activity/area/EditArea';

export default {
  name: 'ppylActivityAreas',
  components: {
    Add,
    Edit
  },
  data() {
    return {
      aCode: '',
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
      highlightStatusTexts: {
        [1]: '高亮',
        [2]: '否'
      },
      joinLimitTimeTypeTexts: {
        [1]: '活动期间',
        [2]: '本日',
        [3]: '本周',
        [4]: '本月'
      },
      winLimitTimeTypeTexts: {
        [1]: '活动期间',
        [2]: '本日',
        [3]: '本周',
        [4]: '本月'
      },


      dataList: [],
      aData: {},

      formData: {},
      editVisible: false,
      addVisible: false,
    };
  },
  mounted() {
    this.aCode = this.$route.query.aCode;
    if(!this.aCode) {
      this.$message.error('活动不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/ppylActivities');
      }, 2000)
    }
    this.getList();
    this.getData();
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
        activity_code: this.aCode,
        searType: this.filter.searType
      };

      this.$get('/admin/ppylArea/list', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    
    getData() {
      // if(!this.$auths.includes('ppyl/info')) {
      //   return; 
      // }
      let params = {
        activity_code: this.aCode,
      };

      this.$get('/admin/ppyl/info', params, res => {
        let data = res.data;
        this.aData = data;
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
        this.$post('/admin/ppylArea/status', {
          area_code: row.area_code,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    showAdd() {
      this.formData = {
        activity_code: this.aCode,
        name: '',
        limit_type: 1,  //1有时间限制
        time: [moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).add(7, 'days').format('YYYY-MM-DD HH:mm:ss')],
        sort: 9999,
        background_image: '',
        join_number: '',
        join_limit_type: 1,
        win_number: '',
        win_limit_type: 1,
        shipping_unit: '',
        repurchase_increment: '',
        reward_scale: '',
        group_number: this.aData.group_number || 0,  //计算用，需要删除
        highlight_status: 2
      };
      if(this.$refs.add) {
        if(this.$refs.add.$refs.background_image) this.$refs.add.$refs.background_image.clearFiles();
      }
      this.addVisible = true;
      this.$nextTick(() => {
        this.$refs.add.updateAllRate();
      })
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      params.start_time = params.time[0];
      params.end_time = params.time[1];
      delete params.time;
      delete params.group_number;

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }
      
      if(
        !(/^[1-9]\d*$/.test(params.shipping_unit)) ||
        !(/^[1-9]\d*$/.test(params.repurchase_increment))
        ) {
        return this.$message.error(`单次发货数量、单次回购增量都要为1，2，3，4这种正整数哦`)
      }

      this.$post('/admin/ppylArea/create', params, res => {
        this.addVisible = false;
        this.$message.success('新增成功');
        this.reloadPage();
      });
    },

    showEdit(row) {
      if(!this.$auths.includes('ppylArea/info')) {
        return this.$message.error('需要拼拼专区详情权限，请联系管理员添加')
      }
      let params = {
        area_code: row.area_code
      }
      
      this.$get('/admin/ppylArea/info', params, res => {
        let data = res.data;
        this.formData = {
          area_code: data.area_code,
          name: data.name,
          limit_type: data.limit_type,  //1有时间限制
          time: [moment(new Date(data.start_time)).format('YYYY-MM-DD HH:mm:ss'), moment(new Date(data.end_time)).format('YYYY-MM-DD HH:mm:ss')],
          sort: data.sort,
          background_image: data.background_image,
          join_number: data.join_number,
          join_limit_type: data.join_limit_type,
          win_number: data.win_number,
          win_limit_type: data.win_limit_type,
          shipping_unit: data.shipping_unit,
          repurchase_increment: data.repurchase_increment,
          reward_scale: data.reward_scale,
          group_number: this.aData.group_number || 0,  //计算用，需要删除
          highlight_status: data.highlight_status
        }
        if(this.$refs.edit) {  
          this.$refs.edit.$refs.background_image.clearFiles();
        }
        
        this.editVisible = true;
        this.$nextTick(() => {
          this.$refs.edit.updateAllRate();
        })
      })
    },
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      params.start_time = params.time[0];
      params.end_time = params.time[1];
      delete params.time;
      delete params.group_number;

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }
      
      if(
        !(/^[1-9]\d*$/.test(params.shipping_unit)) ||
        !(/^[1-9]\d*$/.test(params.repurchase_increment))
        ) {
        return this.$message.error(`单次发货数量、单次回购增量都要为1，2，3，4这种正整数哦`)
      }

      this.$post('/admin/ppylArea/update', params, res => {
        this.editVisible = false;
        this.$message.success('编辑成功');
        this.reloadPage();
      });
    },

    toRelations(row) {
      this.$router.push(`/ppylActivityGoods?aaCode=${row.area_code}`);
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.name}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/ppylArea/delete', {
          area_code: row.area_code
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
