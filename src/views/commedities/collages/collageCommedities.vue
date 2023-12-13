<template>
  <div class="subpage-content">
    <div class="default-container">
      
      <div class="table-ctrls">
        <div class="table-title">
          <span>拼团商品列表</span>
          <span v-if="activeData.group_number" class="warning-color">[{{activeData.group_number}}人团]</span>
          <span class="success-color">{{activeData.activity_title || ''}}</span>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('pt/goodsUpdate')">
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
        <el-table-column label="创建时间" width="180" prop="create_time"></el-table-column>
        <el-table-column label="活动有效期" width="170">
          <template slot-scope="scope">
            {{scope.row.start_time}} ~ {{scope.row.end_time}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
         <template slot-scope="scope">
            <template v-if="$auths.includes('pt/saleInfo')">
              <el-button type="text" size="small" @click="showEditStocks(scope.row)">销量/库存</el-button>
            </template>
            <template v-if="$auths.includes('pt/goodsUpdate')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('pt/goodsDelete')">
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

    <el-dialog title="新增拼团商品" width="1100px" :close-on-click-modal="false" :visible.sync="addVisible">
      <AddCommedities :formData="formData"></AddCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItems">确 定</el-button>
      </div>
    </el-dialog>
    
    <el-dialog title="查看销量/更新商品库存" width="1200px" :close-on-click-modal="false" :visible.sync="editStocksVisible">
      <EditStocks ref="editStock" :formData="formData"></EditStocks>
      <div slot="footer" class="dialog-footer">
        <template v-if="$auths.includes('pt/updateStock')">
          <el-button @click="editStocksVisible = false">取 消</el-button>
          <el-button type="primary" @click="tryEditStocks">修改库存</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="editStocksVisible = false">确 定</el-button>
        </template>
      </div>
    </el-dialog>

    <el-dialog title="编辑拼团商品" width="1100px" :close-on-click-modal="false" :visible.sync="editVisible">
      <EditCommedities :formData="formData"></EditCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { publishDate } from '@/config.js';

import AddCommedities from '@/partialviews/commedity/collage/commedity/AddCommedities';
import EditCommedities from '@/partialviews/commedity/collage/commedity/EditCommedities';

import EditStocks from '@/partialviews/commedity/collage/commedity/EditStocks';

import moment from 'moment';

export default {
  name: 'collageCommedities',
  components: {
    AddCommedities,
    EditCommedities,
    EditStocks
  },
  data() {
    return {
      aCode: null,
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
        [2]: '全部活动列表中'
      },


      dataList: [],
      activeData: {},

      formData: {},
      addVisible: false,
      editVisible: false,

      editStocksVisible: false
    };
  },
  mounted() {
    this.aCode = this.$route.query.aCode;
    if(!this.aCode) {
      this.$message.error('拼团商品不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/actives');
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
        activity_code: this.aCode,
        page: this.currentPage
      };

      this.$get('/admin/pt/goodsInfo', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    getData() {
      if(!this.$auths.includes('pt/info')) {
        return; 
      }
      let params = {
        activity_code: this.aCode,
      };

      this.$get('/admin/pt/info', params, res => {
        let data = res.data;
        this.activeData = data;
      });
    },
    

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAdd() {
      if(!this.$auths.includes('spu/list')) {
        return this.$message.warning('您缺少查看商品列表的权限，无法正常添加拼团商品，请联系管理员为您添加'); 
      }
      let formData = {
        activity_code: this.aCode,
        goods: [],
        time: [moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).add(7, 'days').format('YYYY-MM-DD HH:mm:ss')]
      }
      this.formData = formData;
      
      this.addVisible = true;
    },
    addItems() {
      let params = JSON.parse(JSON.stringify(this.formData));

      if(!params.time) return this.$message.error('限制时间必选，请检查');
      params.start_time = params.time[0];
      params.end_time = params.time[1];
      delete params.time;
      
      let paramValues = Object.values(params);
      if(params.goods.length == 0) {
        return this.$message.error('请选择、添加商品');
      }
      for(let i = 0; i < params.goods.length; i++) {
        if(
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].activity_price)) ||
          parseFloat(params.goods[i].activity_price) <= 0
        ) {
          return this.$message.error(`第${i + 1}个拼团商品的价格要为大于零的数哦，请检查下哈`)
        }
        if(!(/^[1-9]\d*$/.test(params.goods[i].stock))) {
          return this.$message.error(`第${i + 1}个拼团商品的活动数量要为1，2，3，4这种正整数哦，请检查下哈`)
        }
        if(parseInt(params.goods[i].stock) > parseInt(params.goods[i].origin_stock)) {
          return this.$message.error(`第${i + 1}个拼团商品的活动数量超过库存了哦，请检查下哈`)
        }
        if(parseInt(params.goods[i].stock) % this.activeData.group_number != 0) {
          return this.$message.error(`第${i + 1}个拼团商品的活动数量要为成团人数的整数倍哦，请检查下哈`)
        }
        
        // if(
        //   parseFloat(params.goods[i].activity_price) > parseFloat(params.goods[i].sale_price) ||
        //   parseFloat(params.goods[i].activity_price) < parseFloat(params.goods[i].max_purchase_price)
        // ) {
        //   return this.$message.error(`第${i + 1}个拼团商品的价格需小于销售价且大于最高成本价哦，请检查下哈`)
        // }

        params.goods[i].activity_price = parseFloat(params.goods[i].activity_price).toFixed(2);
      }
      
      this.$post('/admin/pt/goodsUpdate', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      let params = {
        activity_code: this.aCode,
        goods_sn: row.goods_sn
      };

      this.$get('/admin/pt/goodsSkuInfo', params, res => {
        let data = res.data; //是数组，因为要兼容多sku。不过目前我们只用一个
        let formData = {
          activity_code: data[0].activity_code,
          goods: []
        }
        for(let i = 0; i < data.length; i++) {
        
          let item = {
            title: data[i].title,
            goods_sn: data[i].goods_sn,
            sku_sn: data[i].sku_sn,
            activity_price: data[i].activity_price,
            sale_price: data[i].sale_price,
            market_price: data[i].market_price,
            max_purchase_price: data[i].max_purchase_price
          }
          
          let specs = JSON.parse(data[i].specs);
          item.attrs = Object.values(specs).join('、');
          
          formData.goods.push(item);
        }
        formData.time = [moment(row.start_time).format('YYYY-MM-DD HH:mm:ss'), moment(row.end_time).format('YYYY-MM-DD HH:mm:ss')];
        this.formData = formData;
        this.$forceUpdate();
        this.editVisible = true;
      });
    },
    editItem() {
      if(this.formData.goods.length == 0) {
        this.reloadPage();
        return this.editVisible = false;
      }
      let params = JSON.parse(JSON.stringify(this.formData));
      params.start_time = params.time[0];
      params.end_time = params.time[1];
      delete params.time;
      
      let paramValues = Object.values(params);
      for(let i = 0; i < params.goods.length; i++) {
        if(
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].activity_price)) ||
          parseFloat(params.goods[i].activity_price) <= 0
        ) {
          return this.$message.error(`第${i + 1}个拼团商品的价格要为大于零的数哦，请检查下哈`)
        }
        
        // if(
        //   parseFloat(params.goods[i].activity_price) > parseFloat(params.goods[i].sale_price) ||
        //   parseFloat(params.goods[i].activity_price) < parseFloat(params.goods[i].max_purchase_price)
        // ) {
        //   return this.$message.error(`第${i + 1}个拼团商品的价格需小于销售价且大于最高成本价哦，请检查下哈`)
        // }
        params.goods[i].activity_price = parseFloat(params.goods[i].activity_price).toFixed(2);
      }
      
      this.$post('/admin/pt/goodsUpdate', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },
    
    showEditStocks(row) {
      this.formData = {
        activity_code: row.activity_code,
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
        if(parseInt(goods[i].stock_number) % this.activeData.group_number != 0) {
          return this.$message.error(`第${i + 1}个sku调整的库存值要为成团人数的整数倍哦，请检查下哈`)
        }
        if(parseInt(goods[i].stock_number) + goods[i].current_activity_stock > goods[i].origin_stock) {
          return this.$message.error(`第${i + 1}个sku调整的库存值加上团品库存超过了商品剩余库存了哦，请检查下哈`)
        }
      }
      for(let i = goods.length - 1; i >= 0; i--) {
        if(goods[i].stock_number == 0) goods.splice(i, 1);
      }
      if(goods.length == 0) return this.editStocksVisible = false;
      this.$post('/admin/pt/updateStock', {
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
        this.$post('/admin/pt/goodsDelete', {
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
