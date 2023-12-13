<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            
            <el-form-item label="审核状态" prop="check_status">
              <el-select placeholder="不限" name="check_status" v-model="queryForm.check_status">
                <el-option label="不限" value></el-option>
                <el-option label="待审核" :value="3"></el-option>
                <el-option label="已过审" :value="1"></el-option>
                <el-option label="未过审" :value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="指定商品">
              <div v-if="(selectGoodsInfo.searGoodsSpuSn && selectGoodsInfo.searGoodsSpuSn.length > 0) || 
                        (selectGoodsInfo.searGoodsSkuSn && selectGoodsInfo.searGoodsSkuSn.length > 0)">
                <span class="sku-select-trigger" @click="showSelectGoods">
                  <template v-if="selectGoodsInfo.type == 1">
                    已选择<span class="warning-color">{{selectGoodsInfo.searGoodsSpuSn.length || 0}}</span>款商品
                  </template>
                  <template v-if="selectGoodsInfo.type == 2">
                    已选择<span class="warning-color">{{selectGoodsInfo.searGoodsSpuSn.length || 0}}</span>款商品，
                    <span class="warning-color">{{selectGoodsInfo.searGoodsSkuSn.length || 0}}</span>个规格
                  </template>
                </span>
                <span class="sku-select-trigge-clear" @click="resetSelectGoods">取消指定</span>
              </div>
              <div v-else class="sku-select-trigger" @click="showSelectGoods">未指定商品</div>
            </el-form-item>
            <el-form-item label="创建时间" prop="createDate">
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
            </el-form-item>

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
          <div class="table-title">口碑评论列表</div>
          <div class="table-ctrl">
            <el-button type="primary" @click="$router.push('/reputators')">口碑官列表</el-button>
            <template v-if="$auths.includes('reputation/create')">
              <el-button type="primary" @click="showBindAdd">指定用户新增</el-button>
            </template>
            <template v-if="$auths.includes('reputation/create')">
              <el-button type="primary" @click="showAdd">新增</el-button>
            </template>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <!-- <el-table-column label="名称" width="160" prop="title"></el-table-column> -->
          <el-table-column label="商品名称" width="290">
            <template slot-scope="scope">
              {{scope.row.goods ? scope.row.goods.title : ''}}
            </template>
          </el-table-column>
          <el-table-column label="关联人" width="120" prop="user_name"></el-table-column>
          <el-table-column label="用户标签" width="140" prop="user_tag"></el-table-column>
          <el-table-column label="口碑内容" width="360" prop="content"></el-table-column>
          <!-- <el-table-column label="置顶" width="60" prop="is_top">
            <template slot-scope="scope">
              <span v-if="scope.row.is_top == 1">是</span>
            </template>
          </el-table-column>
          <el-table-column label="精选" width="60" prop="is_featured">
            <template slot-scope="scope">
              <span v-if="scope.row.is_featured == 1">是</span>
            </template>
          </el-table-column> -->
          <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
          <el-table-column label="状态" width="100">
            <template slot-scope="scope">
              <div v-if="scope.row.check_status != 1" :class="{'warning-color': scope.row.status == 3}">
                {{checkStatusTexts[scope.row.check_status]}}
              </div>
              <div v-else :class="{'error-color': scope.row.status == 2, 'success-color': scope.row.status == 1}">
                {{statusTexts[scope.row.status]}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <!-- 过审 -->
              <template v-if="scope.row.check_status == 1">
                <template v-if="$auths.includes('reputation/update')">
                  <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
                </template>
                <template v-if="$auths.includes('reputation/status')">
                  <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">
                    {{scope.row.status == 1 ? '禁用' : '启用'}}
                  </el-button>
                </template>
                <!-- <template v-if="$auths.includes('reputation/top')">
                  <el-button :class="{'warning-color': scope.row.is_top == 1, 'success-color': scope.row.is_top == 2}" type="text" size="small" @click="toggleItemTop(scope.row)">
                    {{scope.row.is_top == 1 ? '取消置顶' : '置顶'}}
                  </el-button>
                </template>
                <template v-if="$auths.includes('reputation/featured')">
                  <el-button :class="{'warning-color': scope.row.is_featured == 1, 'success-color': scope.row.is_featured == 2}" type="text" size="small" @click="toggleItemFeatured(scope.row)">
                    {{scope.row.is_featured == 1 ? '取消精选' : '精选'}}
                  </el-button>
                </template> -->
              </template>
              <template v-else>
                <template v-if="$auths.includes('reputation/check')">
                  <el-button v-if="scope.row.check_status == 3" type="text" size="small" @click="showCheck(scope.row)">审核</el-button>
                </template>
              </template>
              <template v-if="$auths.includes('reputation/delete')">
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

    
    <el-dialog title="筛选商品" width="1200px" :close-on-click-modal="false" :visible.sync="selectGoodsVisible">
      <SelectSpus ref="selectGoods"></SelectSpus>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectGoodsVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelectGoods">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增用户口碑评论" width="800px" :close-on-click-modal="false" :visible.sync="bindAddVisible">
      <BindAdd ref="bindAdd" :formData="formData"></BindAdd>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bindAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增口碑评论" width="800px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑口碑评论" width="800px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="审核口碑评价" width="800px" :close-on-click-modal="false" :visible.sync="checkVisible">
      <Check ref="edit" :formData="checkData"></Check>
      <div slot="footer" class="dialog-footer">
        <el-button @click="checkVisible = false">取 消</el-button>
        <el-button type="primary" @click="checkItem">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import moment from 'moment';

import SelectSpus from '@/partialviews/common/SelectSpus';
import Add from '@/partialviews/commedity/reputation/Add';
import BindAdd from '@/partialviews/commedity/reputation/BindAdd';
import Edit from '@/partialviews/commedity/reputation/Edit';
import Check from '@/partialviews/commedity/reputation/Check';

import {nTimePickerConfig} from '@/config';

export default {
  name: 'reputations',
  components: {
    SelectSpus,
    Add,
    BindAdd,
    Edit,
    Check
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      
      queryForm: {
        keyword: '',
        check_status: ''
      },
      filter: {
        keyword: '',
        check_status: '',
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },

      categories: [],
      checkStatusTexts: {
        [1]: '已通过',
        [2]: '审核被拒',
        [3]: '待审核'
      },
      statusTexts: {
        [1]: '正常',
        [2]: '已禁用',
        [-1]: '已被删除'
      },
      dataList: [],
      formData: {},
      checkData: {},
      selection: [],

      selectGoodsInfo: {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: '',
        searGoodsSkuSn: '',
        title: ''
      },
      createDate: [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,
      
      addVisible: false,
      bindAddVisible: false,
      editVisible: false,
      checkVisible: false,
      selectGoodsVisible: false,

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
        check_status: '',
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
        keyword: this.queryForm.keyword,
        check_status: this.queryForm.check_status
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
        check_status: this.filter.check_status,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };


      if(this.selectGoodsInfo.searGoodsSpuSn) queryVal.goods_sn = this.selectGoodsInfo.searGoodsSpuSn;

      this.$get('/admin/reputation/list', queryVal, res => {
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

    
    showSelectGoods() {
      this.selectGoodsVisible = true;
    },

    confirmSelectGoods() {
      let selectGoodsInfo = this.$refs.selectGoods.confirmSelectResult();
      if(
        (!selectGoodsInfo.searGoodsSkuSn || selectGoodsInfo.searGoodsSkuSn.length == 0) && 
        (!selectGoodsInfo.searGoodsSpuSn || selectGoodsInfo.searGoodsSpuSn.length == 0)) {
        return this.$message.error('请选择至少一项spu');
      }
      this.selectGoodsInfo = selectGoodsInfo;
      this.selectGoodsVisible = false;
    },
    resetSelectGoods() {
      this.selectGoodsInfo = {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: [],
        searGoodsSkuSn: [],
        selectResults: []
      }
      this.$refs.selectGoods.resetSpuList();
    },

    showBindAdd() {
      this.formData = {
        link_user: '',
        user_name: '',
        user_avatarUrl: '',
        user_tag: '',
        link_product: '',
        content: '',
        is_top: 2,
        is_featured: 2,
        sort: '999',
        images: [],
        link_type: 1  //1商品
      }
      this.bindAddVisible = true;
    },
    showAdd() {
      let reputationStorage = JSON.parse(localStorage.getItem('reputation')) || {};
      this.formData = {
        user_name: reputationStorage.user_name || '',
        user_avatarUrl: reputationStorage.user_avatarUrl || '',
        user_tag: reputationStorage.user_tag || '',
        link_product: '',
        content: '',
        is_top: 2,
        is_featured: 2,
        sort: '999',
        images: [],
        link_type: 1  //1商品
      }
      this.addVisible = true;
    },
    addItem() {
      let params = {
        user_name: this.formData.user_name,
        user_avatarUrl: this.formData.user_avatarUrl,
        user_tag: this.formData.user_tag,
        goods_sn: this.formData.link_product,
        content: this.formData.content,
        is_top: this.formData.is_top,
        is_featured: this.formData.is_featured,
        sort: this.formData.sort,
        images: [],
        link_type: this.formData.link_type
      };
      for(let i = 0; i < this.formData.images.length; i++) {
        params.images.push({
          image_url: this.formData.images[i].image_url,
          sort: i
        })
      }

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写/勾选完所有信息，并上传口碑图片哦');
        }
      }
      if(params.images.length == 0) {
        return this.$message.error('请至少上传一张口碑图片哦');
      }
      if(this.addVisible) {
        // 只有非指定才记录填写的用户信息
        localStorage.setItem('reputation', JSON.stringify(params));
      }

      this.$post('/admin/reputation/create', params, res => {
        this.$message.success('新增口碑评论成功');
        this.reloadPage();
        if(this.addVisible) {
          this.addVisible = false;
        } else {
          this.bindAddVisible = false;
        }
      });
    },

    showEdit(row) {
      let formData = {
        id: row.id,
        user_name: row.user_name,
        user_avatarUrl: row.user_avatarUrl,
        user_tag: row.user_tag,
        link_product: null,
        link_product_origin: row.goods_sn,
        content: row.content,
        is_top: row.is_top,
        is_featured: row.is_featured,
        sort: row.sort,
        images: row.images,
        link_type: row.link_type
      }
      if(row.goods && row.goods.title) {
        formData.link_product_origin_title = row.goods.title;
      }
      this.formData = formData;
      this.editVisible = true;
      
    },

    editItem() {
      let params = {
        id: this.formData.id,
        user_name: this.formData.user_name,
        user_avatarUrl: this.formData.user_avatarUrl,
        user_tag: this.formData.user_tag,
        goods_sn: this.formData.link_product,
        content: this.formData.content,
        is_top: this.formData.is_top,
        is_featured: this.formData.is_featured,
        sort: this.formData.sort,
        images: [],
        link_type: this.formData.link_type
      };
      for(let i = 0; i < this.formData.images.length; i++) {
        params.images.push({
          reputation_id: this.formData.images[i].reputation_id || null,
          id: this.formData.images[i].id || null,
          image_url: this.formData.images[i].image_url,
          sort: i
        })
      }

      if(!this.formData.link_product) {
        params.goods_sn = this.formData.link_product_origin;
      }

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写/勾选完所有信息，并上传口碑图片哦');
        }
      }
      if(params.images.length == 0) {
        return this.$message.error('请至少上传一张口碑图片哦');
      }

      this.$post('/admin/reputation/update', params, res => {
        this.$message.success('编辑口碑评论成功');
        this.reloadPage();
        this.editVisible = false;
      });
    },

    showCheck(row) {
      this.checkData = {
        id: row.id,
        check_status: 1,
        check_remark: ''
      }
      this.checkVisible = true;
    },
    checkItem() {
      let params = {
        id: this.checkData.id,
        check_status: this.checkData.check_status
      }
      if(params.check_status == 2) {
        params.check_remark = this.checkData.check_remark.trim();
      }
      if(params.check_status == 2 && (params.check_remark == undefined || params.check_remark == null || params.check_remark === '')) {
        return this.$message.error('拒绝通过该口碑的话请填写拒绝理由哦，不能全为空格哦');
      }
      this.$post('/admin/reputation/check', params, res => {
        this.$message.success(`${params.check_status == 1 ? '通过' : '拒绝'}口碑评论成功`);
        this.reloadPage();
        this.checkVisible = false;
      });
    },

    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '禁用' : '启用'}${row.user_name}这条评论, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/reputation/status', {
          id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '禁用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    toggleItemTop(row) {
      this.$confirm(`您将${row.status == 1 ? '取消置顶' : '置顶'}${row.user_name}这条评论, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/reputation/top', {
          id: row.id,
          is_top: row.is_top
        }, res => {
          this.$message.success(`${row.is_top == 1 ? '取消置顶' : '置顶'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    toggleItemFeatured(row) {
      this.$confirm(`您将${row.is_featured == 1 ? '取消精选' : '精选'}${row.user_name}这条评论, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/reputation/featured', {
          id: row.id,
          is_featured: row.is_featured
        }, res => {
          this.$message.success(`${row.is_featured == 1 ? '取消精选' : '精选'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    deleteItem(row) {
      this.$confirm(`您将删除 ${row.user_name} 这条口碑评论, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/reputation/delete', {
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

.sku-select-trigger {
  color: #66b1ff;
  user-select: none;
  cursor: pointer;
}
.sku-select-trigge-clear {
  margin-left: 10px;
  color: #f00;
  user-select: none;
  cursor: pointer;
}


</style>