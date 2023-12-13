<template>
  <div class="subpage-content">
    <div class="default-container">
      
      <div class="table-ctrls">
        <div class="table-title">专场商品列表 <span class="success-color">{{activeData.title || ''}}</span></div>
        <div class="table-ctrl">
          <!-- <template v-if="$auths.includes('specialArea/goodsUpdate')"> -->
            <el-button type="primary" @click="showAdd">新增</el-button>
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
        <el-table-column label="操作" width="180">
         <template slot-scope="scope">
           
           <template v-if="$auths.includes('specialArea/goodsSort')">
            <el-button type="text" size="default" @click="showSort(scope.row)">排序</el-button>
           </template>
            <template v-if="$auths.includes('specialArea/goodsUpdate')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('specialArea/goodsDelete')">
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

    <el-dialog title="新增专场商品" width="1200px" :close-on-click-modal="false" :visible.sync="addVisible">
      <AddCommedities :formData="formData"></AddCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItems">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑专场商品" width="1200px" :close-on-click-modal="false" :visible.sync="editVisible">
      <EditCommedities :formData="formData"></EditCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 专场馆商品排序 -->
    <el-dialog title="专场馆商品排序" width="750px" :close-on-click-modal="false" :visible.sync="sortVisible">
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
import { publishDate } from '@/config.js';

import AddCommedities from '@/partialviews/commedity/specialArea/commedity/AddCommedities';
import EditCommedities from '@/partialviews/commedity/specialArea/commedity/EditCommedities';
import moment from 'moment';

export default {
  name: 'specialAreaCommedities',
  components: {
    AddCommedities,
    EditCommedities
  },
  data() {
    return {
      aId: null,
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
        [2]: '全部专场列表中'
      },


      dataList: [],
      activeData: {},

      formData: {},
      addVisible: false,
      editVisible: false,

      sortVisible: false,   //排序
    };
  },
  mounted() {
    this.aId = this.$route.query.aId;
    if(!this.aId) {
      this.$message.error('专场商品不存在或已失效，正在返回');
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
        aId: this.aId,
        page: this.currentPage
      };

      this.$get('/admin/specialArea/goodsInfo', queryVal, res => {
        let dataList = res.data.list || []

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    getData() {
      // if(!this.$auths.includes('specialArea/info')) {
      //   return; 
      // }
      let params = {
        aId: this.aId,
      };

      this.$get('/admin/specialArea/info', params, res => {
        let data = res.data;
        this.activeData = data;
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
        this.$post('/admin/specialArea/status', {
          activity_id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    showAdd() {
      if(!this.$auths.includes('spu/list')) {
        return this.$message.warning('您缺少查看商品列表的权限，无法正常添加专场商品，请联系管理员为您添加'); 
      }
      let formData = {
        activity_id: this.aId,
        goods: [],
        limit_type: this.activeData.limit_type
      }
      if(this.activeData.limit_type == 1) {
        this.formData.time = [moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).add(7, 'days').format('YYYY-MM-DD HH:mm:ss')];
      }
      if(this.activeData.a_type == 2) {
        // 团长升级单
        formData.a_type = 2;
      }
      this.formData = formData;
      this.addVisible = true;
    },
    addItems() {
      let params = JSON.parse(JSON.stringify(this.formData));
      if(this.activeData.limit_type == 1) {
        if(!params.time || params.time.length != 2) return this.$message.error(`有效时间必须，请选择`);
        params.start_time = params.time[0];
        params.end_time = params.time[1];
        delete params.time;
      }
      delete params.limit_type;
      params.sale_number = {};
      params.vip_level = {};

      let paramValues = Object.values(params);
      if(params.goods.length == 0) {
        return this.$message.error('请选择、添加商品');
      }
      for(let i = 0; i < params.goods.length; i++) {
        if(
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].activity_price)) ||
          parseFloat(params.goods[i].activity_price) <= 0
        ) {
          return this.$message.error(`第${i + 1}个专场商品的价格要为大于零的数哦，请检查下哈`)
        }
        if(
          parseFloat(params.goods[i].activity_price) > parseFloat(params.goods[i].sale_price) ||
          parseFloat(params.goods[i].activity_price) < parseFloat(params.goods[i].max_purchase_price)
        ) {
          return this.$message.error(`第${i + 1}个专场商品的价格需小于销售价且大于最高成本价哦，请检查下哈`)
        }
        if(
          !(/^(0|[1-9][0-9]*)$/.test(params.goods[i].sale_number)) 
        ) {
          return this.$message.error(`第${i + 1}个专场商品的起始销量要为0,1,2,3,4之类的整数哦，请检查下哈`)
        }
        params.goods[i].activity_price = parseFloat(params.goods[i].activity_price).toFixed(2);
        
        let saleNumberGoods = Object.keys(params.sale_number);
        if(!saleNumberGoods.includes(params.goods[i].goods_sn)) {
          params.sale_number[params.goods[i].goods_sn] = params.goods[i].sale_number;
        } else {
          if(params.goods[i].sale_number !== params.sale_number[params.goods[i].goods_sn]) return this.$message.error(`第${i + 1}个专场商品的在选中商品列表中有同款，请将两者的起始销量设为一致`)
        }

        if(params.a_type !== 2) continue;
        if(
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].growth_value)) ||
          parseFloat(params.goods[i].growth_value) <= 0
        ) {
          return this.$message.error(`第${i + 1}专场商品的成长值要为大于零的数哦，请检查下哈`)
        }
        params.goods[i].growth_value = parseFloat(params.goods[i].growth_value).toFixed(2);
        
        let vipLevelGoods = Object.keys(params.vip_level);
        if(!vipLevelGoods.includes(params.goods[i].goods_sn)) {
          params.vip_level[params.goods[i].goods_sn] = params.goods[i].vip_level;
        } else {
          if(params.goods[i].vip_level !== params.vip_level[params.goods[i].goods_sn]) this.$message.error(`第${i + 1}个专场商品的在选中商品列表中有同款，请将两者的最高可用等级设为一致`)
        }
      }
      
      this.$post('/admin/specialArea/goodsUpdate', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      // if(!this.$auths.includes('specialArea/goodsSkuInfo')) {
      //   return this.$message.warning('您缺少查看详情的权限，无法正常修改专场商品，请联系管理员为您添加'); 
      // }
      let params = {
        aId: this.aId,
        goods_sn: row.goods_sn
      };

      this.$get('/admin/specialArea/goodsSkuInfo', params, res => {
        let data = res.data; 
        let formData = {
          activity_id: data[0].activity_id,
          goods: [],
          limit_type: this.activeData.limit_type,
          vip_level: data[0].vip_level,
          sale_number: data[0].sale_number
        }
        for(let i = 0; i < data.length; i++) {
          let item = {
            title: data[i].title,
            goods_sn: data[i].goods_sn,
            sku_sn: data[i].sku_sn,
            activity_price: data[i].activity_price,
            sale_price: data[i].sale_price,
            max_purchase_price: data[i].max_purchase_price,
          }
          let specs = JSON.parse(data[i].specs);
          item.attrs = Object.values(specs).join('、');
          formData.goods.push(item);
        }
        if(this.activeData.limit_type == 1) {
          formData.time = [row.start_time, row.end_time];
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
      if(this.activeData.limit_type == 1) {
        if(!params.time || params.time.length != 2) return this.$message.error(`有效时间必须，请选择`);
        params.start_time = params.time[0];
        params.end_time = params.time[1];
        delete params.time;
      }
      delete params.limit_type;
      
      let paramValues = Object.values(params);
      if(
        !(/^(0|[1-9][0-9]*)$/.test(params.sale_number)) 
      ) {
        return this.$message.error(`专场商品的起始销量要为0,1,2,3,4之类的整数哦，请检查下哈`)
      }
      for(let i = 0; i < params.goods.length; i++) {
        if(
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].activity_price)) ||
          parseFloat(params.goods[i].activity_price) <= 0
        ) {
          return this.$message.error(`第${i + 1}专场商品的价格要为大于零的数哦，请检查下哈`)
        }
        
        if(
          parseFloat(params.goods[i].activity_price) > parseFloat(params.goods[i].sale_price) ||
          parseFloat(params.goods[i].activity_price) < parseFloat(params.goods[i].max_purchase_price)
        ) {
          return this.$message.error(`第${i + 1}个专场商品的价格需小于销售价且大于最高成本价哦，请检查下哈`)
        }
        params.goods[i].activity_price = parseFloat(params.goods[i].activity_price).toFixed(2);

        if(params.a_type !== 2) continue;
        if(
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.goods[i].growth_value)) ||
          parseFloat(params.goods[i].growth_value) <= 0
        ) {
          return this.$message.error(`第${i + 1}专场商品的成长值要为大于零的数哦，请检查下哈`)
        }
        params.goods[i].growth_value = parseFloat(params.goods[i].growth_value).toFixed(2);

        // 批量使用spu的规则
        params.goods[i].vip_level = params.vip_level;
        params.goods[i].sale_number = params.sale_number;
      }
      delete params.vip_level;
      delete params.sale_number;
      params.vip_level = {
        [params.goods[0].goods_sn]: params.goods[0].vip_level
      }
      params.sale_number = {
        [params.goods[0].goods_sn]: params.goods[0].sale_number
      }

      this.$post('/admin/specialArea/goodsUpdate', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
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
        this.$post('/admin/specialArea/goodsDelete', {
          id: row.id
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    
    showSort(row) {
      this.formData = {
        activity_id: this.activeData.id,
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
      this.$post('/admin/specialArea/goodsSort', params, res => {
        this.$message.success('更新排序成功');
        this.sortVisible = false;
        this.reloadPage();
      });
    }

  }
};
</script>
