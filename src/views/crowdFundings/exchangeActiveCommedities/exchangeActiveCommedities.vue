<template>
  <div class="subpage-content">
    <div class="default-container">
      
      <div class="table-ctrls">
        <div class="table-title">健康豆专区商品列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('exchange/goodsUpdate')">
            <el-button type="primary" @click="showAdd">新增</el-button>
          </template>
          
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
        <el-table-column label="状态" width="70" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
         <template slot-scope="scope">
          
            <template v-if="$auths.includes('exchange/goodsSort')">
              <el-button type="text" size="default" @click="showSort(scope.row)">排序</el-button>
            </template>
            <!-- <template v-if="$auths.includes('exchange/updateStock')">
              <el-button type="text" size="default" @click="showEditStocks(scope.row)">调整库存</el-button>
            </template> -->
            <template v-if="$auths.includes('exchange/goodsUpdate')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('exchange/goodsDelete')">
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

    <el-dialog title="新增健康豆专区商品" width="1200px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItems">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑健康豆专区商品" width="1200px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="调整健康豆专区商品的库存" width="800px" :close-on-click-modal="false" :visible.sync="editStocksVisible">
      <EditStocks ref="editStock" :formData="formData"></EditStocks>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editStocksVisible = false">取 消</el-button>
        <el-button type="primary" @click="tryEditStocks">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 活动商品排序 -->
    <el-dialog title="健康豆专区商品排序" width="750px" :close-on-click-modal="false" :visible.sync="sortVisible">
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
    
  </div>
</template>

<script>
import Add from '@/partialviews/crowdFunding/exchangeActiveCommedity/Add';
import Edit from '@/partialviews/crowdFunding/exchangeActiveCommedity/Edit';
import EditStocks from '@/partialviews/crowdFunding/exchangeActiveCommedity/EditStocks';

export default {
  name: 'healthyActiveCommedities',
  components: {
    Add,
    Edit,
    EditStocks
  },
  data() {
    return {
      currentPage: 1,
      count: 1,

      categories: [],
      statusTexts: {
        [1]: '上架中',
        [2]: '已下架',
        [-1]: '已被删除'
      },

      dataList: [],
      progressData: {},
      virtualData: {},

      formData: {},

      addVisible: false,
      editVisible: false,
      editStocksVisible: false,

      sortVisible: false
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
        page: this.currentPage
      };

      this.$get('/admin/exchange/goodsList', queryVal, res => {
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
      // if(!this.$auths.includes('spu/list')) {
      //   return this.$message.warning('您缺少查看商品列表的权限，无法正常添加健康豆专区商品，请联系管理员为您添加'); 
      // }
      let formData = {
        goods: [],
        type: 1 //先写死，1是健康豆2是积分
      }
      this.formData = formData;
      this.addVisible = true;
    },
    addItems() {
      let params = JSON.parse(JSON.stringify(this.formData));
      let paramValues = Object.values(params);
      if(params.goods.length == 0) {
        return this.$message.error('请选择、添加商品');
      }
      for(let i = 0; i < params.goods.length; i++) {
        
        if(
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].exchange_value)) ||
          parseFloat(params.goods[i].exchange_value) <= 0
        ) {
          return this.$message.error(`第${i + 1}个健康豆专区商品健康豆要为大于零的数哦，请检查`)
        }
        
        // if(
        //   !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].stock)) ||
        //   parseFloat(params.goods[i].stock) <= 0
        // ) {
        //   return this.$message.error(`第${i + 1}个健康豆专区商品的专区库存要为大于零的数哦，请检查`)
        // }
        // if(parseFloat(params.goods[i].stock) > parseFloat(params.goods[i].stock_number)) {
        //   return this.$message.error(`第${i + 1}个健康豆专区商品的专区库存超过了商品总库存，请检查`)
        // }
      }
      
      this.$post('/admin/exchange/goodsUpdate', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      if(!this.$auths.includes('exchange/goodsSkuInfo')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常修改健康豆专区商品，请联系管理员为您添加'); 
      }
      let params = {
        goods_sn: row.goods_sn,
        type: row.type
      };

      this.$get('/admin/exchange/goodsSkuInfo', params, res => {
        let data = res.data; 
        let formData = {
          goods: [],
          type: row.type
        }
        for(let i = 0; i < data.length; i++) {
          let item = {
            id: data[i].id,
            title: data[i].title,
            goods_sn: data[i].goods_sn,
            sku_sn: data[i].sku_sn,
            sale_price: data[i].sale_price,
            max_purchase_price: data[i].max_purchase_price,
            stock_number: data[i].sku.stock,
            type: data[i].type,
            exchange_value: data[i].exchange_value,
            // stock: data[i].stock,
            auto_complete: data[i].auto_complete,
            auto_ship: data[i].auto_ship
          }
         
          let specs = JSON.parse(data[i].specs);
          item.attrs = Object.values(specs).join('、');
          formData.goods.push(item);
        }
       
        this.formData = formData;
        this.editVisible = true;
      });
      
    },
    editItem() {
      if(this.formData.goods.length == 0) {
        this.reloadPage();
        return this.editVisible = false;
      }
      let params = JSON.parse(JSON.stringify(this.formData));
      
      let paramValues = Object.values(params);
      for(let i = 0; i < params.goods.length; i++) {if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].exchange_value)) ||
          parseFloat(params.goods[i].exchange_value) <= 0
        ) {
          return this.$message.error(`第${i + 1}个健康豆专区商品健康豆要为大于零的数哦，请检查`)
        }

      }

      this.$post('/admin/exchange/goodsUpdate', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },

    
    showSort(row) {
      this.formData = {
        type: row.type,
        goods_sn: row.goods_sn,
        sort: row.sort
      }
      this.sortVisible = true;
    },
    confirmSortInfo() {
      if(!(/^(0|[1-9][0-9]*)$/.test(this.formData.sort))) {
        return this.$message.error(`排序要为0，1，2，3，4这种正整数哦，请检查下哈`)
      }
      let params = [this.formData];
      this.$post('/admin/exchange/goodsSort', params, res => {
        this.$message.success('更新排序成功');
        this.sortVisible = false;
        this.reloadPage();
      });
    },

    
    showEditStocks(row) {
      if(!this.$auths.includes('exchange/goodsSkuInfo')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常修改健康豆专区商品库存，请联系管理员为您添加'); 
      }
      this.formData = {
        goods_sn: row.goods_sn,
        type: row.type
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
      }
      for(let i = goods.length - 1; i >= 0; i--) {
        if(goods[i].stock_number == 0) goods.splice(i, 1);
      }
      if(goods.length == 0) return this.editStocksVisible = false;
      this.$post('/admin/exchange/updateStock', {
        goods: goods,
        type: this.formData.type
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
        this.$post('/admin/exchange/goodsDelete', {
          id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
    
  },

};
</script>
