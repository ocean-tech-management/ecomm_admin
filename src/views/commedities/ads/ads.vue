<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="分类名称" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>


      <div class="table-ctrls">
        <div class="table-title">广告位列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('banner/create')">
            <el-button type="primary" @click="openAdd">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="80" prop="id" align="center"></el-table-column>
        <el-table-column label="图片展示" width="100">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.image" />
          </template>
        </el-table-column>
        <el-table-column label="广告位名称" prop="title" width="250"></el-table-column>
        <el-table-column label="展示位名称" width="150" prop="position_name">
          <template>
            首页Banner 
            <!-- 当前为hardcode -->
          </template>
        </el-table-column>
        <el-table-column label="排序" width="50" prop="sort"></el-table-column>
        <el-table-column label="跳转类型" width="100" prop="type">
          <template slot-scope="scope">
            {{contentTypeText[scope.row.type]}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="操作" >
          <template slot-scope="scope">
            <template v-if="$auths.includes('banner/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '停用' : '启用'}}</el-button>
            </template>
            <template v-if="$auths.includes('banner/update')">
              <el-button type="text" size="small" @click="openEdit(scope.row)">修改</el-button>
            </template>
            <template v-if="$auths.includes('banner/delete')">
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
    <el-dialog title="新建广告位" width="800px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑广告位" :close-on-click-modal="false" width="950px" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Add from '@/partialviews/commedity/ad/Add';
import Edit from '@/partialviews/commedity/ad/Edit';

export default {
  name: 'subjectAds',
  components: { Add, Edit },
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
      dataList: [],
      contentTypeText: {
        [-1]: '仅做展示，不跳转',
        [1]: '商品列表',
        [2]: '单商品',
        [3]: '优惠券列表',
        [4]: '单优惠券',
        // [5]: '全部活动列表',
        [6]: '活动商品列表',
        [7]: '大礼包列表',
        [8]: '品牌馆列表',
        [9]: '品牌馆详情',
        [10]: 'N宫格详情',
        [11]: '内页静态背景图',
        [12]: '直播间列表',
        [13]: '指定直播间',
        [19]: '指定拼拼活动',
        [22]: '指定限时专场',
        [709394001]: 'cvip会员中心',
      },
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
      };
      this.getList();
    },


    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };
      this.$get('/admin/banner/list', queryVal, res => {
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
        title: '',
        type: -1,
        image: '',
        content: '',
        sort: '',
        goods: {},
        activity: ''
      };
      if(this.$refs.add && this.$refs.add.$refs.thumb) this.$refs.add.$refs.thumb.clearFiles();
      this.addVisible = true;
    },
    addItem() {
      let params = {
        title: this.formData.title,
        type: this.formData.type,
        image: this.formData.image,
        sort: this.formData.sort
      };

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写完所有信息，并上传轮播图哦;');
        }
      }
      if(!/^(0|[1-9][0-9]*)$/.test(params.sort)) {
        return this.$message.error('排序要为1，2，3，4这种正整数哦');
      }
      
      // 在这里验证动态类型
      params.content = this.formData.content;
      if(params.type == 2 && params.content === '') {
        return this.$message.error('跳转单商品请选择关联商品');
      }
      if(params.type == 4 && params.content === '') {
        return this.$message.error('跳转单优惠券请选择关联优惠券');
      }
      if(params.type == 6 && params.content === '') {
        return this.$message.error('跳转活动商品列表请选择对应活动');
      }
      if(params.type == 9 && params.content === '') {
        return this.$message.error('跳转品牌馆详情请选择对应品牌馆');
      }
      if(params.type == 10 && params.content === '') {
        return this.$message.error('跳转N宫格请选择对应N宫格');
      }
      if(params.type == 13 && params.content === '') {
        return this.$message.error('跳转指定直播间请选择对应直播间');
      }
      if(params.type == 19 && params.content === '') {
        return this.$message.error('跳转指定拼拼活动请选择对应拼拼活动');
      }
      if(params.type == 22 && params.content === '') {
        return this.$message.error('跳转指定限时专场请选择对应限时专场');
      }

      this.$post('/admin/banner/create', params, res => {
        this.$message.success('添加轮播图成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },
    openEdit(row) {
      this.$get('/admin/banner/info', {
        id: row.id
      }, res => {
        let data = res.data;
        this.formData = {
          id: data.id,
          title: data.title,
          type: data.type,
          image: data.image,
          content: data.content,
          sort: data.sort,
          goods: {}
        };
        if(data.type == 2) {
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
              setTimeout(() => {
                if(this.$refs.edit) this.$refs.edit.init();
              }, 50)
              this.editVisible = true;
            }, err => {
              if(this.$refs.edit && this.$refs.edit.$refs.thumb) this.$refs.edit.$refs.thumb.clearFiles();
              setTimeout(() => {
                if(this.$refs.edit) this.$refs.edit.init();
              }, 50)
              this.editVisible = true;
            })
          } else {
            if(this.$refs.edit && this.$refs.edit.$refs.thumb) this.$refs.edit.$refs.thumb.clearFiles();
            setTimeout(() => {
              if(this.$refs.edit) this.$refs.edit.init();
            }, 50)
            this.editVisible = true;
          }
        } else {
          if(
            this.formData.type == 6 || 
            this.formData.type == 9 || 
            this.formData.type == 10 || 
            this.formData.type == 13 || 
            this.formData.type == 22
          ) {
            this.formData.content = parseInt(this.formData.content);
          }
          if(this.$refs.edit && this.$refs.edit.$refs.thumb) this.$refs.edit.$refs.thumb.clearFiles();
          setTimeout(() => {
            if(this.$refs.edit) this.$refs.edit.init();
          }, 50)
          this.editVisible = true;
        }
        
      });
      
    },
    editItem() {
      let params = {
        id: this.formData.id,
        title: this.formData.title,
        type: this.formData.type,
        image: this.formData.image,
        sort: this.formData.sort
      };

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写完所有信息，并上传轮播图哦');
        }
      }
      if(!/^(0|[1-9][0-9]*)$/.test(params.sort)) {
        return this.$message.error('排序要为1，2，3，4这种正整数哦');
      }
      
      // 在这里验证动态类型
      params.content = this.formData.content;
      if(params.type == 2 && params.content === '') {
        return this.$message.error('跳转单商品请选择关联商品');
      }
      if(params.type == 4 && params.content === '') {
        return this.$message.error('跳转单优惠券请选择关联优惠券');
      }
      if(params.type == 6 && params.content === '') {
        return this.$message.error('跳转活动商品列表请选择对应活动');
      }
      if(params.type == 9 && params.content === '') {
        return this.$message.error('跳转品牌馆详情请选择对应品牌馆');
      }
      if(params.type == 10 && params.content === '') {
        return this.$message.error('跳转N宫格请选择对应N宫格');
      }
      if(params.type == 13 && params.content === '') {
        return this.$message.error('跳转指定直播间请选择对应直播间');
      }
      if(params.type == 19 && params.content === '') {
        return this.$message.error('跳转指定拼拼活动请选择对应拼拼活动');
      }
      if(params.type == 22 && params.content === '') {
        return this.$message.error('跳转指定限时专场请选择对应限时专场');
      }

      this.$post('/admin/banner/update', params, res => {
        this.$message.success('编辑轮播图成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },

    
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '停用' : '启用'}${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/banner/status', {
          id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '停用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/banner/delete', {
          id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
  }
};
</script>
