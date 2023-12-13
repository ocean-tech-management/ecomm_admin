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
        <div class="table-title">活动列表</div>
        <!-- <div class="table-ctrl">
          <el-button type="primary" @click="$router.push('/addCommedity')">新增活动</el-button>
        </div> -->
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" prop="id" width="60"></el-table-column>
        <el-table-column label="活动名称" prop="title" width="150"></el-table-column>
        <el-table-column label="位置" width="150">
          <template slot-scope="scope">
            {{positionText[scope.row.show_position]}}
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="desc" width="250"></el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
         <template slot-scope="scope">
          <template v-if="$auths.includes('activity/status')">
            <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '下架' : '上架'}}</el-button>
          </template>
          <template v-if="$auths.includes('activity/update')">
            <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
          </template>
          <template v-if="$auths.includes('activity/goodsInfo')">
            <el-button type="text" size="small" @click="toRelations(scope.row)">查看关联商品</el-button>
          </template>



            <!-- <el-button class="error-color" type="text" size="small" @click="deleteItem(scope.row)">删除</el-button> -->
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

    <el-dialog title="编辑活动" width="640px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { publishDate } from '@/config.js';

import Edit from '@/partialviews/commedity/active/Edit';

export default {
  name: 'actives',
  components: {
    Edit
  },
  data() {
    return {
      routePath: '', // 路由地址
      routeRequest: {
        '/actives': '/admin/activity/list',
        '/specialPayList': '/admin/activity/specialPayList'
      },
      routeCommedities: {
        '/actives': '/activeCommedities',
        '/specialPayList': '/specialPayCommedities'
      },

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
        [2]: '全部活动列表中',
        [3]: '首页四宫格',
        [4]: '品牌馆',
        [5]: '限时专场',
        [6]: '福利专区',
      },


      dataList: [],

      formData: {},
      editVisible: false,
    };
  },
  watch: {
    $route: {
      handler(route) {
        this.routePath = route.path
        this.getList()
      },
      immediate: true
    }
  },
  mounted() {},
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
        show_position: [1, 2],   //1首页活动，2全部活动列表， 3N宫格
        searType: this.filter.searType
      };
      const url = this.routeRequest[this.routePath] || '/admin/activity/list'
      this.$get(url, queryVal, res => {
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
        this.$post('/admin/activity/status', {
          activity_id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    // 编辑-显示
    showEdit(row) {
      if(!this.$auths.includes('activity/info')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常修改活动信息，请联系管理员为您添加');
      }
      let params = {
        aId: row.id
      };
      this.$get('/admin/activity/info', params, res => {
        let data = res.data;
        this.formData = {
          aId: data.id,
          title: data.title,
          desc: data.desc,
          show_position: data.show_position,
          limit_type: data.limit_type,
          background_image: data.background_image,
          goods_show_form: data.goods_show_form || 1, //1普通样式，2特殊样式
          background_color: data.background_color || '#ffffff', //hex色值
          poster: data.poster,
          icon: data.icon,
          limit_buy: data.limit_buy == null || data.limit_buy == undefined ? 2 : data.limit_buy, // 默认不限购
          gift_type: data.gift_type == null || data.gift_type == undefined ? -1 : data.gift_type, // 默认不赠送
          allow_pay_type_name: data.allow_pay_type_name,
        };
        this.editVisible = true;
      });
    },
    // 编辑-保存
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      if(params.goods_show_form != 2) delete params.background_color;
      delete params.background_image;
      delete params.icon;
      delete params.allow_pay_type_name;
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传海报图哦');
        }
      }
      if(params.goods_show_form == 2 && !/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(params.background_color)) {
        return this.$message.error('请用正确的色值，格式如#ffaabb。建议使用chrome浏览器，有拾色器工具可使用');
      }
      params.background_image = this.formData.background_image || null;
      params.icon = this.formData.icon || null;
      this.$post('/admin/activity/update', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },
    // 查看关联商品
    toRelations(row) {
      const path = this.routeCommedities[this.routePath] || '/activeCommedities'
      this.$router.push(`${path}?aId=` + row.id);
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/goods/delete', {
          goods_sn: row.goods_sn
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
