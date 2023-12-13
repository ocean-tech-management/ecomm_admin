<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入活动名称" @keyup.enter.native="queryInfo"></el-input>
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
        <div class="table-title">拼团活动列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('ppyl/create')">
            <el-button type="primary" @click="showAdd">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <!-- <el-table-column label="序号" prop="activity_code" width="120"></el-table-column> -->
        <el-table-column label="海报" width="60" align="center">
          <template slot-scope="scope">
            <img style="width: 50px;" :src="scope.row.activity_cover"/>
          </template>
        </el-table-column>
        <el-table-column label="拼团名称" prop="activity_title" width="150"></el-table-column>
        
        <el-table-column label="描述" prop="activity_desc"></el-table-column>
        <el-table-column label="参团身份" width="150">
          <template slot-scope="scope">
            开团：{{userTypeTexts[scope.row.start_user_type]}} <br/>
            参团：{{userTypeTexts[scope.row.join_user_type]}} 
          </template>
        </el-table-column>
        <el-table-column label="成团人数" width="80" prop="group_number" align="center"></el-table-column>
        <el-table-column label="位置" width="60">
          <template slot-scope="scope">
            {{positionText[scope.row.show_position]}}
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="170">
          <template slot-scope="scope">
            {{scope.row.start_time}} ~ {{scope.row.end_time}}
          </template>
        </el-table-column>
        <!-- <el-table-column label="创建时间" width="160" prop="create_time"></el-table-column> -->
        
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
         <template slot-scope="scope">
           <template v-if="$auths.includes('ppyl/status')">
            <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '下架' : '上架'}}</el-button>
          </template>
          <template v-if="$auths.includes('ppyl/update')">
            <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
          </template>
          <template v-if="$auths.includes('ppyl/goodsInfo')">
            <el-button type="text" size="small" @click="toRelations(scope.row)">查看关联专区</el-button>
          </template>
          <template v-if="$auths.includes('ppyl/delete')">
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

    <el-dialog title="新建拼团活动" width="800px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData" :userTypes="userTypes"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="更新拼团活动" width="800px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData" :userTypes="userTypes"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import moment from 'moment';

import Add from '@/partialviews/ppyl/activity/Add';
import Edit from '@/partialviews/ppyl/activity/Edit';

export default {
  name: 'collages',
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
        [2]: '全部活动列表中'
      },
      userTypeTexts: {
        [1]: '全部用户',
        [2]: '新用户',
        [3]: '老用户'
      },
      expireTypeText: {
        [1]: '小时',
        [2]: '分钟',
        [3]: '秒'
      },


      dataList: [],
      userTypes: [],
      formData: {},

      addVisible: false,
      editVisible: false
    };
  },
  mounted() {
    this.getList();
    this.getUserTypes();
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
        searType: this.filter.searType,
        commedity_type: 1 //正常活动
      };

      this.$get('/admin/ppyl/list', queryVal, res => {
        let dataList = res.data.list || [];
        if(dataList.length > 0) {
          for(let i = 0; i < dataList.length; i++) {
            if(parseInt(dataList[i].expire_time) % 3600 === 0) {
              // 正小时数
              dataList[i].expire_time_val = parseInt(dataList[i].expire_time) / 3600;
              dataList[i].expire_time_type = 1;  //1小时，2分钟，3秒
            } else if(parseInt(dataList[i].expire_time) % 60 === 0) {
              // 正分钟
              dataList[i].expire_time_val = parseInt(dataList[i].expire_time) / 60;
              dataList[i].expire_time_type = 2;  //1小时，2分钟，3秒
            } else {
              dataList[i].expire_time_val = parseInt(dataList[i].expire_time);
              dataList[i].expire_time_type = 3;  //1小时，2分钟，3秒
            }
          }
        }
        
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    getUserTypes() {
      let params = {
        searType: 2
      };

      this.$get('/admin/coupon/userType', params, res => {
        let userTypes =  res.data;
        let userTypeTexts = {};
        for(let i = 0; i < userTypes.length; i++) {
          userTypeTexts[userTypes[i].u_type] = userTypes[i].u_name;
        }
        this.userTypes = userTypes;
        this.userTypeTexts = userTypeTexts;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '下架' : '上架'}${row.activity_title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/ppyl/status', {
          activity_code: row.activity_code,
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
        activity_title: '',
        activity_desc: '',
        type: 1,
        style_type: 1,  //1轮播风格，2列表风格
        background_image: '',
        // start_user_type: this.userTypes[0].u_type || 1,
        start_user_type: 10,  //当前锁死10，只有cvip才能开团
        join_user_type: this.userTypes[0].u_type || 1,
        expire_time: '3600',
        expire_time_val: '1',
        expire_time_type: 1,
        group_number: '',
        share_title: '',
        share_desc: '',
        share_cover: '',
        sort: '',
        show_position: 1,
        activity_cover: '',
        validDate: [moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).add(7, 'days').format('YYYY-MM-DD HH:mm:ss')]
      };
      if(this.$refs.add && this.$refs.add.$refs.thumb) {
        this.$refs.add.$refs.thumb.clearFiles();
        this.$refs.add.$refs.shareCover.clearFiles();
        this.$refs.add.$refs.bg.clearFiles();
      }

      this.addVisible = true;
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      params.start_time = params.validDate[0];
      params.end_time = params.validDate[1];
      delete params.validDate;

      if(params.expire_time_type === 1) {
        params.expire_time = parseInt(params.expire_time_val) * 3600;
      } else if(params.expire_time_type === 2) {
        params.expire_time = parseInt(params.expire_time_val) * 60;
      } else {
        params.expire_time = parseInt(params.expire_time_val);
      }
      delete params.expire_time_val;
      delete params.expire_time_type;
      
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写完所有信息，并上传封面、背景图和分享图哦');
        }
      }

      if(
        !(/^[1-9]\d*$/.test(params.expire_time)) ||
        !(/^[1-9]\d*$/.test(params.group_number)) ||
        !(/^[1-9]\d*$/.test(params.sort))
        ) {
        return this.$message.error(`拼团有效时间、成团人数要求、排序都要为1，2，3，4这种正整数哦`)
      }

      this.$post('/admin/ppyl/create', params, res => {
        this.$message.success('添加拼团成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      let params = {
        activity_code: row.activity_code
      }
      this.$get('/admin/ppyl/info', params, res => {
        let data = res.data;
        if(parseInt(data.expire_time) % 3600 === 0) {
          // 正小时数
          data.expire_time_val = parseInt(data.expire_time) / 3600;
          data.expire_time_type = 1;  //1小时，2分钟，3秒
        } else if(parseInt(data.expire_time) % 60 === 0) {
          // 正分钟
          data.expire_time_val = parseInt(data.expire_time) / 60;
          data.expire_time_type = 2;  //1小时，2分钟，3秒
        } else {
          data.expire_time_val = parseInt(data.expire_time);
          data.expire_time_type = 3;  //1小时，2分钟，3秒
        }
        this.formData = {
          activity_code: data.activity_code,
          activity_title: data.activity_title,
          activity_desc: data.activity_desc,
          type: data.type,
          style_type: data.style_type,  //1轮播风格，2列表风格
          background_image: data.background_image,
          start_user_type: data.start_user_type,
          join_user_type: data.join_user_type,
          expire_time: data.expire_time,
          expire_time_type: data.expire_time_type,
          expire_time_val: data.expire_time_val,
          group_number: data.group_number,
          share_title: data.share_title,
          share_desc: data.share_desc,
          share_cover: data.share_cover,
          sort: data.sort,
          show_position: data.show_position,
          activity_cover: data.activity_cover,
          validDate: [data.start_time, data.end_time],
          existOrder: data.existOrder,    //存在订单
          existGoods: data.existGoods    //存在商品
        };
        
        if(this.$refs.edit && this.$refs.edit.$refs.thumb) {
          this.$refs.edit.$refs.thumb.clearFiles();
          this.$refs.edit.$refs.shareCover.clearFiles();
          this.$refs.edit.$refs.bg.clearFiles();
        }
        this.editVisible = true;
      });
    },
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      params.start_time = params.validDate[0];
      params.end_time = params.validDate[1];
      delete params.validDate;

      if(params.expire_time_type === 1) {
        params.expire_time = parseInt(params.expire_time_val) * 3600;
      } else if(params.expire_time_type === 2) {
        params.expire_time = parseInt(params.expire_time_val) * 60;
      } else {
        params.expire_time = parseInt(params.expire_time_val);
      }
      delete params.expire_time_val;
      delete params.expire_time_type;

      if(params.existGoods || params.existOrder) delete params.group_number;
      delete params.existGoods;
      delete params.existOrder;

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写完所有信息，并上传封面和分享图哦');
        }
      }

      if(
        !(/^[1-9]\d*$/.test(params.expire_time)) ||
        !(/^[1-9]\d*$/.test(params.sort))
        ) {
        return this.$message.error(`拼团有效时间、排序都要为1，2，3，4这种正整数哦`)
      }
      if(params.group_number && !(/^[1-9]\d*$/.test(params.group_number))) {
        return this.$message.error(`成团人数要求要为1，2，3，4这种正整数哦`)
      }

      this.$post('/admin/ppyl/update', params, res => {
        this.$message.success('更新拼团信息成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },



    deleteItem(row) {
      this.$confirm(`您将删除${row.activity_title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/ppyl/delete', {
          activity_code: row.activity_code
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
    
    toRelations(row) {
      this.$router.push('/ppylActivityAreas?aCode=' + row.activity_code);
    },
  }
};
</script>
