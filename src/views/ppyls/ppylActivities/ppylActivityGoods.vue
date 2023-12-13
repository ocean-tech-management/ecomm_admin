<template>
  <div class="subpage-content">
    <div class="default-container">
      
      <div class="table-ctrls">
        <div class="table-title">专区商品列表 <span class="success-color">{{aaData.name || ''}}</span></div>
        <div class="table-ctrl">
          <!-- <template v-if="$auths.includes('ppyl/goodsCreate')"> -->
            <el-button type="primary" @click="showAdd">新增商品</el-button>
          <!-- </template> -->
          
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="缩略图" prop="id" width="100">
          <template slot-scope="scope">
            <img style="width: 70px" :src="scope.row.image"/>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="title"></el-table-column>
        <el-table-column label="商品码" width="150" prop="goods_sn"></el-table-column>
        <el-table-column label="排序" prop="sort" width="80"></el-table-column>
        <el-table-column label="创建时间" width="180" prop="create_time"></el-table-column>        
        <el-table-column v-if="aaData.limit_type == 1" label="活动有效期" width="170">
          <template slot-scope="scope">
            {{scope.row.start_time}} ~ {{scope.row.end_time}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230">
          <template slot-scope="scope"> 
            <template v-if="$auths.includes('ppyl/goodsSort')">
              <el-button type="text" size="default" @click="showSort(scope.row)">排序</el-button>
            </template>
            <template v-if="$auths.includes('ppyl/goodsUpdate')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
              <!-- <el-button type="text" size="small" @click="showEditCover(scope.row)">更改缩略图</el-button> -->
            </template>
            
            <template v-if="$auths.includes('ppyl/saleInfo')">
              <el-button type="text" size="small" @click="showEditStocks(scope.row)">销量/库存</el-button>
            </template>
            <template v-if="$auths.includes('ppyl/goodsDelete')">
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

    <el-dialog title="新增专区商品" width="1200px" :close-on-click-modal="false" :visible.sync="addVisible">
      <AddCommedities ref="add" :formData="formData"></AddCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItems">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑专区商品" width="1200px" :close-on-click-modal="false" :visible.sync="editVisible">
      <EditCommedities ref="edit" :formData="formData"></EditCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 专区馆商品排序 -->
    <el-dialog title="商品排序" width="750px" :close-on-click-modal="false" :visible.sync="sortVisible">
      <el-form label-width="120px">
        <el-form-item label="排序" prop="keyword">
          <el-input style="width: 300px" type="number" v-model="formData.sort" placeholder="排序，正整数"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="sortVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSortInfo">确 定</el-button>
      </div>
    </el-dialog>

    
    <el-dialog title="查看销量/更新商品库存" width="1200px" :close-on-click-modal="false" :visible.sync="editStocksVisible">
      <EditStocks ref="editStock" :formData="formData"></EditStocks>
      <div slot="footer" class="dialog-footer">
        <template v-if="$auths.includes('ppyl/updateStock')">
          <el-button @click="editStocksVisible = false">取 消</el-button>
          <el-button type="primary" @click="tryEditStocks">修改库存</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="editStocksVisible = false">确 定</el-button>
        </template>
      </div>
    </el-dialog>
    
    
    <el-dialog title="更改缩略图" width="1000px" :visible.sync="coverVisible">
      <EditCommeditiesCover ref="cover" :formData="coverData"></EditCommeditiesCover>
      <div slot="footer" class="dialog-footer">
        <el-button @click="coverVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCover">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import AddCommedities from '@/partialviews/ppyl/activity/commedity/AddCommedities';
import EditCommedities from '@/partialviews/ppyl/activity/commedity/EditCommedities';
import EditCommeditiesCover from '@/partialviews/ppyl/activity/commedity/EditCommeditiesCover';
import EditStocks from '@/partialviews/ppyl/activity/commedity/EditStocks';

import moment from 'moment';

export default {
  name: 'ppylActivityGoods',
  components: {
    AddCommedities,
    EditCommedities,
    EditCommeditiesCover,
    EditStocks
  },
  data() {
    return {
      aCode: null,
      aaCode: null,
      currentPage: 1,
      count: 1,

      categories: [],
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      positionText: {
        [1]: '首页',
        [2]: '全部专区列表中'
      },


      dataList: [],
      aaData: {},

      formData: {},
      addVisible: false,
      editVisible: false,

      sortVisible: false,   //排序

      coverData: {},
      coverVisible: false,

      editStocksVisible: false
    };
  },
  mounted() {
    this.aaCode = this.$route.query.aaCode;
    if(!this.aaCode) {
      this.$message.error('拼拼专区不存在或已失效，正在返回');
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

      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;

      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        area_code: this.aaCode,
        page: this.currentPage
      };

      this.$get('/admin/ppyl/goodsInfo', queryVal, res => {
        let dataList = res.data.list || []

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    getData() {
      // if(!this.$auths.includes('ppylArea/info')) {
      //   return; 
      // }
      let params = {
        area_code: this.aaCode,
      };

      this.$get('/admin/ppylArea/info', params, res => {
        let data = res.data;
        this.aaData = data;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAdd() {
      if(!this.$auths.includes('spu/list')) {
        return this.$message.warning('您缺少查看商品列表的权限，无法正常添加专区商品，请联系管理员为您添加'); 
      }
      let formData = {
        area_code: this.aaCode,
        goods: [],
        // limit_type: this.aaData.limit_type,
        limit_type: 1,  //当前要求商品必须有时间限制
        reward_scale: this.aaData.reward_scale
      }
      if(this.aaData.limit_type == 1) {
        formData.time = [moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).add(7, 'days').format('YYYY-MM-DD HH:mm:ss')];
      }
 
      this.formData = formData;
      this.addVisible = true;
    },
    addItems() {
      let params = JSON.parse(JSON.stringify(this.formData));
      if(this.aaData.limit_type == 1) {
        if(!params.time) {
          return this.$message.error('限制时间必选，请检查')
        }
        params.start_time = params.time[0];
        params.end_time = params.time[1];
        delete params.time;
      }
      delete params.limit_type;

      if(params.goods.length == 0) {
        return this.$message.error('请选择、添加商品');
      }
      for(let i = 0; i < params.goods.length; i++) {
        if(
          !(/^(0|[1-9][0-9]*)$/.test(params.goods[i].stock)) 
        ) {
          return this.$message.error(`第${i + 1}个专区商品的活动量要为0,1,2,3,4之类的整数，请检查`)
        }
        if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].activity_price)) {
          return this.$message.error(`第${i + 1}个专区商品的活动价要为最多两位小数的正数，请检查`)
        }
        if(
          parseFloat(params.goods[i].activity_price) > parseFloat(params.goods[i].sale_price)
        ) {
          return this.$message.error(`第${i + 1}个专区商品的活动价需小于销售价，请检查`)
        }
      }
      
      this.$post('/admin/ppyl/goodsUpdate', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      if(!this.$auths.includes('ppyl/goodsSkuInfo')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常修改专区商品，请联系管理员为您添加'); 
      }
      let params = {
        area_code: this.aaCode,
        goods_sn: row.goods_sn
      };

      this.$get('/admin/ppyl/goodsSkuInfo', params, res => {
        let data = res.data; 
        if(!data || data.length == 0) return this.$message.warning('该商品无有效内容，仅做展示。');
        let formData = {
          area_code: data[0].area_code,
          goods_sn: row.goods_sn,
          goods: [],
          sale_number: row.sale_number,
          // limit_type: row.limit_type,
          limit_type: 1,  //当前要求商品必须有时间限制
          reward_scale: row.reward_scale
        }
        for(let i = 0; i < data.length; i++) {
          let item = {
            title: data[i].title,
            goods_sn: data[i].goods_sn,
            sku_sn: data[i].sku_sn,
            sale_price: data[i].sale_price,
            activity_price: data[i].activity_price,
            reward_scale: data[i].reward_scale,
            rewardVal: 0
          }
          let specs = JSON.parse(data[i].specs);
          item.attrs = Object.values(specs).join('、');
          formData.goods.push(item);
        }
        if(this.aaData.limit_type == 1) {
          formData.time = [row.start_time, row.end_time];
        }
        
        this.formData = formData;
        this.editVisible = true;
        this.$nextTick(() => {
          this.$refs.edit.updateRewardVals();
        })
      });
      
    },
    editItem() {
      if(this.formData.goods.length == 0) {
        this.reloadPage();
        return this.editVisible = false;
      }
      let params = {
        area_code: this.aaData.area_code,
        goods_sn: this.formData.goods_sn,
        goods: this.formData.goods
      }

      if(this.aaData.limit_type == 1) {
        if(!this.formData.time) {
          return this.$message.error('限制时间必选，请检查')
        }
        params.start_time = this.formData.time[0];
        params.end_time = this.formData.time[1];
      }
      
      for(let i = 0; i < params.goods.length; i++) {
        if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].activity_price)) {
          return this.$message.error(`第${i + 1}个专区商品的活动价要为最多两位小数的正数，请检查`)
        }
        if(
          parseFloat(params.goods[i].activity_price) > parseFloat(params.goods[i].sale_price)
        ) {
          return this.$message.error(`第${i + 1}个专区商品的活动价需小于销售价，请检查`)
        }
      }
      
      this.$post('/admin/ppyl/goodsUpdate', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },
    
    showEditStocks(row) {
      this.formData = {
        area_code: row.area_code,
        goods_sn: row.goods_sn
      }
      if(this.$refs.editStock) this.$refs.editStock.getSaleInfos(row.goods_sn);
      this.editStocksVisible = true;
    },
    tryEditStocks() {
      let goods = this.$refs.editStock.returnStockResult();
      for(let i = 0; i < goods.length; i++) {
        if(!(/^-?\d+$/.test(goods[i].stock_number))) {
          return this.$message.error(`第${i + 1}个sku调整的库存值要为0，1，2，3，4这种正整数哦，如不增减库存请填0，请检查下哈`)
        }
        if(parseInt(goods[i].stock_number) + goods[i].current_activity_stock > goods[i].origin_stock) {
          return this.$message.error(`第${i + 1}个sku调整的库存值加上团品库存超过了商品剩余库存了哦，请检查下哈`)
        }
      }
      for(let i = goods.length - 1; i >= 0; i--) {
        if(goods[i].stock_number == 0) goods.splice(i, 1);
      }
      if(goods.length == 0) return this.editStocksVisible = false;
      this.$post('/admin/ppyl/updateStock', {
        goods: goods
      }, res => {
        this.$message.success('更新成功'); 
        this.editStocksVisible = false;
        this.reloadPage();
      });
      
    },

    toRelations(row) {
      this.$router.push(row.id);
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/ppyl/goodsDelete', {
          id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    
    showSort(row) {
      this.formData = {
        area_code: this.aaData.area_code,
        goods_sn: row.goods_sn,
        sort: row.sort
      }
      this.sortVisible = true;
    },
    confirmSortInfo() {
      if(!(/^(0|[1-9][0-9]*)$/.test(this.formData.sort))) {
        return this.$message.error(`排序要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      let params = {
        data: [this.formData]
      }
      this.$post('/admin/ppyl/goodsSort', params, res => {
        this.$message.success('更新排序成功');
        this.sortVisible = false;
        this.reloadPage();
      });
    },

    
    showEditCover(row) {
      this.coverData = {
        area_code: this.aaData.area_code,
        goods_sn: row.goods_sn,
        image: '',
        originImage: row.image,
        title: row.title,
        template: this.aaData.template
      }
      if(this.$refs.cover && this.$refs.cover.$refs.thumb) this.$refs.cover.$refs.thumb.clearFiles();
      this.coverVisible = true;
    },
    editCover() {
      let params = {
        area_code: this.coverData.area_code,
        goods_sn: this.coverData.goods_sn,
        image: this.coverData.image
      }
      if(!params.image || params.image === '') {
        return this.$message.error(`未检查到展示图改动，请检查`)
      }
      
      this.$post('/admin/ppyl/goodsUpdate', params, res => {
        this.$message.success('更改展示图成功');
        this.coverVisible = false;
        this.reloadPage();
      });
    },

  }
};
</script>
