<template>
  <div class="subpage-content">
    <div class="default-container">
      <!-- <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
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
      </div> -->

      <div class="table-ctrls">
        <div class="table-title">福利专区列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('crowdFunding/activityCreate')">
            <el-button type="primary" @click="showAdd">新增福利</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="福利活动名称" prop="title" width="200"></el-table-column>
        <el-table-column label="福利头图" width="120">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.background_image" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{ statusTexts[scope.row.status] }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('crowdFunding/activityStatus')">
              <el-button :class="{ 'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2 }"
                type="text" size="small" @click="toggleItem(scope.row)">{{ scope.row.status == 1 ? '下架' :
                  '上架' }}</el-button>
            </template>
            <template v-if="$auths.includes('crowdFunding/activityUpdate')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('crowdFunding/periodList')">
              <el-button type="text" size="small" @click="toRelations(scope.row)">查看关联期次</el-button>
            </template>

            <!-- <template v-if="$auths.includes('crowdFunding/delete')">
              <el-button class="error-color" type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
            </template> -->
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

    <el-dialog title="新增福利" width="600px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑福利" width="600px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData" :defaultGiftType="formData.defaultGiftType"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import Add from '@/partialviews/crowdFunding/crowdFunding/Add';
import Edit from '@/partialviews/crowdFunding/crowdFunding/Edit';
import { REG_INTEGER, REG_INTEGER_NO_EQUAL_ZERO } from '@/util/regExp';
export default {
  name: 'crowdFundings',
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
      // 赠送数量字典
      giftTypeDict: {
        [-1]: '不赠送',
        [1]: '赠送集品豆',
        [2]: '赠送健康豆',
        [3]: '赠送集品券'
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
        searType: this.filter.searType
      };

      this.$get('/admin/crowdFunding/activityList', queryVal, res => {
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
        this.$post('/admin/crowdFunding/activityStatus', {
          activity_code: [row.activity_code],
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
        sort: 9999,
        background_image: '',
        reopen_time_interval: 2,
        rise_period_number: 1,
        rise_scale: '25',
        gift_type: -1, // 默认不赠送
        user_advance_limit: 0, // 用户参与预售次数限制-0表示不限制
        auto_create_advance_limit: 0, // 预售自动新增期数限制-0表示不限制
      };
      if(this.$refs.add && this.$refs.add.$refs.background_image) this.$refs.add.$refs.background_image.clearFiles();
      this.addVisible = true;
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }

      if(!REG_INTEGER.test(params.sort)) {
        return this.$message.error(`排序要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }

      if(!REG_INTEGER_NO_EQUAL_ZERO.test(params.reopen_time_interval)) {
        return this.$message.error(`重开时间间隔要为1,2,3这种大于0的正整数哦，请检查下哈`)
      }

      if(!REG_INTEGER_NO_EQUAL_ZERO.test(params.rise_period_number)) {
        return this.$message.error(`涨幅间隔期数要为1,2,3这种大于0的正整数哦，请检查下哈`)
      }
      if(!REG_INTEGER_NO_EQUAL_ZERO.test(params.rise_scale) || params.rise_scale < 25 || params.rise_scale > 100) {
        return this.$message.error(`每期涨幅要为大于25%和小于100%的正整数哦，请检查下哈`)
      }
      if(!REG_INTEGER.test(params.user_advance_limit)) {
        return this.$message.error(`用户参与预售次数限制要为0,1,2,3这种大于等于0的整数哦，请检查下哈`)
      }
      if(!REG_INTEGER.test(params.auto_create_advance_limit)) {
        return this.$message.error(`预售自动新增期数限制要为0,1,2,3这种大于等于0的整数哦，请检查下哈`)
      }
      // 将天数转换成秒数
      params.reopen_time_interval = params.reopen_time_interval ? params.reopen_time_interval * 24 * 60 * 60 : params.reopen_time_interval;
      // 每期涨幅要精确后两位传参
      params.rise_scale = params.rise_scale / 100;
      this.$post('/admin/crowdFunding/activityCreate', params, res => {
        this.addVisible = false;
        this.$message.success('新增成功');
        this.reloadPage();
      });
    },

    showEdit(row) {
      const giftType = row.gift_type == null || row.gift_type == undefined ? -1 : row.gift_type; // 默认不赠送
      this.formData = {
        activity_code: row.activity_code,
        title: row.title,
        desc: row.desc,
        sort: row.sort,
        rise_period_number: row.rise_period_number || 1,
        background_image: row.background_image,
        template: row.template,
        gift_type: giftType,
        user_advance_limit: row.user_advance_limit || 0, // 用户参与预售次数限制-0表示不限制
        auto_create_advance_limit: row.auto_create_advance_limit || 0, // 预售自动新增期数限制-0表示不限制
      }
      // 将秒数转换成天数
      if (row.reopen_time_interval) this.formData.reopen_time_interval = row.reopen_time_interval / 24 / 60 / 60;
      // 每期涨幅
      if (row.rise_scale) this.formData.rise_scale = row.rise_scale * 100;
      if(this.$refs.edit && this.$refs.edit.$refs.background_image) this.$refs.edit.$refs.background_image.clearFiles();
      this.formData['defaultGiftType'] = giftType;
      this.$refs.edit && this.$refs.edit.reset();
      this.editVisible = true;
    },
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      delete params.reopen_time_interval;
      delete params.rise_period_number;
      delete params.rise_scale;
      delete params.defaultGiftType;
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }

      if(!REG_INTEGER.test(params.sort)) {
        return this.$message.error(`排序要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      if(!REG_INTEGER.test(params.user_advance_limit)) {
        return this.$message.error(`用户参与预售次数限制要为0,1,2,3这种大于等于0的整数哦，请检查下哈`)
      }
      if(!REG_INTEGER.test(params.auto_create_advance_limit)) {
        return this.$message.error(`预售自动新增期数限制要为0,1,2,3这种大于等于0的整数哦，请检查下哈`)
      }

      this.$post('/admin/crowdFunding/activityUpdate', params, res => {
        this.editVisible = false;
        this.$message.success('编辑成功');
        this.reloadPage();
      });
    },

    toRelations(row) {
      this.$router.push('/crowdFundingStages?code=' + row.activity_code);
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/crowdFunding/activityDelete', {
          activity_code: [row.activity_code]
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
