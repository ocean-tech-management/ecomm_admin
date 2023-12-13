<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入入口名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">入口列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('entrance/create')">
            <el-button type="primary" @click="showAdd">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" prop="id" width="70">
        </el-table-column>
        <el-table-column label="入口名" prop="name" width="180"></el-table-column>
        <el-table-column label="入口图标" width="100">
          <template slot-scope="scope">
            <img style="width: 40px" :src="scope.row.icon"/>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('entrance/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '禁用' : '启用'}}</el-button>
            </template>
            <template v-if="$auths.includes('entrance/update')">
              <el-button type="text" size="default" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('entrance/delete')">
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

    <el-dialog title="新增入口" width="950px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addEntrance">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑入口" width="950px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editEntrance">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { publishDate } from '@/config.js';
import Add from '@/partialviews/commedity/entrance/Add';
import Edit from '@/partialviews/commedity/entrance/Edit';

export default {
  name: 'entrances',
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
      },
      filter: {
        keyword: '',
      },
      categories: [],
      subCategories: [],
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
        keyword: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        commedity_type: 1 //正常商品
      };

      this.$get('/admin/entrance/list', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
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

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAdd() {
      this.formData = {
        name: '',
        icon: '',
        url_type: '',
        content: '',
        sort: 99,
        background: '',
        goods: {}
      };
      if(this.$refs.add && this.$refs.add.$refs.thumb) this.$refs.add.$refs.thumb.clearFiles();
      if(this.$refs.add && this.$refs.add.$refs.bg) this.$refs.add.$refs.bg.clearFiles();
      this.addVisible = true;
    },
    addEntrance() {
      let params = {
        name: this.formData.name,
        icon: this.formData.icon,
        url_type: this.formData.url_type,
        sort: this.formData.sort
      }

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写、勾选完所有信息，并上传展示图哦');
        }
      }
      if(!/^[1-9]\d*$/.test(params.sort)) {
        return this.$message.error(`排序要为1，2，3，4这种正整数哦`)
      }

      // 在这里验证动态类型
      params.content = this.formData.content;
      if(params.url_type == 2 && params.content === '') {
        return this.$message.error('跳转单商品请选择关联商品');
      }
      if(params.url_type == 4 && params.content === '') {
        return this.$message.error('跳转单优惠券请选择关联优惠券');
      }
      if(params.url_type == 6 && params.content === '') {
        return this.$message.error('跳转活动商品列表请选择对应活动');
      }
      if(params.url_type == 9 && params.content === '') {
        return this.$message.error('跳转品牌馆详情请选择对应品牌馆');
      }
      if(params.url_type == 10 && params.content === '') {
        return this.$message.error('跳转N宫格请选择对应N宫格');
      }
      if(params.url_type == 13 && params.content === '') {
        return this.$message.error('跳转指定直播间请选择对应直播间');
      }
      if(params.url_type == 19 && params.content === '') {
        return this.$message.error('跳转指定拼拼活动请选择对应拼拼活动');
      }
      if(params.url_type == 22 && params.content === '') {
        return this.$message.error('跳转指定限时专场请选择对应限时专场');
      }
      
      if(params.url_type == 11) params.background = this.formData.background;
      if(params.url_type == 11 && params.background === '') {
        return this.$message.error('跳转到静态图片需要上传对应背景图哦');
      }
      this.$post('/admin/entrance/create', params, res => {
        this.addVisible = false;
        this.$message.success('新增成功');
        this.reloadPage();
      });
    },

    showEdit(row) {
      this.formData = {};
      this.$get('/admin/entrance/info', {
        id: row.id
      }, res => {
        let data = res.data;
        this.formData = {
          id: data.id,
          name: data.name,
          icon: data.icon,
          url_type: data.url_type,
          content: data.content,
          sort: data.sort || 99,
          background: data.background,
          goods: {}
        };
        if(data.url_type == 2) {
          // 广告存在内容，去找关联商品
          if(data.content && data.content !== '') {
            let params = {
              goods_sn: data.content
            }
            this.$get('/admin/goods/info', params, spu => {
              let goods = spu.data;
              this.formData.goods = {
                goods_sn: goods.goods_sn,
                title: goods.title
              }
              if(this.$refs.edit && this.$refs.edit.$refs.thumb) this.$refs.edit.$refs.thumb.clearFiles();
              if(this.$refs.edit && this.$refs.edit.$refs.bg) this.$refs.edit.$refs.bg.clearFiles();
              setTimeout(() => {
                if(this.$refs.edit) this.$refs.edit.init();
              }, 50)
              this.editVisible = true;
            }, err => {
              if(this.$refs.edit && this.$refs.edit.$refs.thumb) this.$refs.edit.$refs.thumb.clearFiles();
              if(this.$refs.edit && this.$refs.edit.$refs.bg) this.$refs.edit.$refs.bg.clearFiles();
              if(this.$refs.edit) this.$refs.edit.init();
              this.editVisible = true;
            })
          } else {
            if(this.$refs.edit && this.$refs.edit.$refs.thumb) this.$refs.edit.$refs.thumb.clearFiles();
            if(this.$refs.edit && this.$refs.edit.$refs.bg) this.$refs.edit.$refs.bg.clearFiles();
            setTimeout(() => {
              if(this.$refs.edit) this.$refs.edit.init();
            }, 50)
            this.editVisible = true;
          }
        } else {
          if(
            this.formData.url_type == 6 || 
            this.formData.url_type == 9 || 
            this.formData.url_type == 10 || 
            this.formData.url_type == 13 || 
            this.formData.url_type == 22
          ) {
            this.formData.content = parseInt(this.formData.content);
          }
          if(this.$refs.edit && this.$refs.edit.$refs.thumb) this.$refs.edit.$refs.thumb.clearFiles();
          if(this.$refs.edit && this.$refs.edit.$refs.bg) this.$refs.edit.$refs.bg.clearFiles();
          setTimeout(() => {
            if(this.$refs.edit) this.$refs.edit.init();
          }, 50)
          this.editVisible = true;
        }
        
      });
      
    },

    editEntrance() {
      let params = {
        id: this.formData.id,
        name: this.formData.name,
        icon: this.formData.icon,
        url_type: this.formData.url_type,
        sort: this.formData.sort
      }

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写、勾选完所有信息，并上传展示图哦');
        }
      }

      if(!/^[1-9]\d*$/.test(params.sort)) {
        return this.$message.error(`排序要为1，2，3，4这种正整数哦`)
      }
      // 在这里验证动态类型
      params.content = this.formData.content;
      if(params.url_type == 2 && params.content === '') {
        return this.$message.error('跳转单商品请选择关联商品');
      }
      if(params.url_type == 4 && params.content === '') {
        return this.$message.error('跳转单优惠券请选择关联优惠券');
      }
      if(params.url_type == 6 && params.content === '') {
        return this.$message.error('跳转活动商品列表请选择对应活动');
      }
      if(params.url_type == 9 && params.content === '') {
        return this.$message.error('跳转品牌馆详情请选择对应品牌馆');
      }
      if(params.url_type == 10 && params.content === '') {
        return this.$message.error('跳转N宫格请选择对应N宫格');
      }
      if(params.url_type == 13 && params.content === '') {
        return this.$message.error('跳转指定直播间请选择对应直播间');
      }
      if(params.url_type == 19 && params.content === '') {
        return this.$message.error('跳转指定拼拼活动请选择对应拼拼活动');
      }
      if(params.url_type == 22 && params.content === '') {
        return this.$message.error('跳转指定限时专场请选择对应限时专场');
      }
      
      if(params.url_type == 11) params.background = this.formData.background;
      if(params.url_type == 11 && params.background === '') {
        return this.$message.error('跳转到静态图片需要上传对应背景图哦');
      }
      this.$post('/admin/entrance/update', params, res => {
        this.editVisible = false;
        this.$message.success('编辑成功');
        this.reloadPage();
      });

    },

    
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '禁用' : '启用'} ${row.name} 这个入口, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/entrance/status', {
          id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '禁用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    deleteItem(row) {
      this.$confirm(`您将删除 ${row.name} 这个入口, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/entrance/delete', {
          id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
