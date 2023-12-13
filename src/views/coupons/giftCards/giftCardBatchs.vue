<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="类型" prop="used_code">
            <!-- 使用场景 -->
            <el-select placeholder="不限" name="used_code" v-model="queryForm.used_code">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in use_types" :label="item.u_name" :value="item.u_type" :key="item.u_type"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="卡券类型" prop="type_code">
            <!-- 使用类型 -->
            <el-select placeholder="不限" name="type_code" v-model="queryForm.type_code">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in types" :label="item.t_name" :value="item.t_type" :key="item.t_type"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="valid_status">
            <el-select placeholder="不限" name="valid_status" v-model="queryForm.valid_status">
              <el-option label="不限" value></el-option>
              <el-option label="可领取" :value="1"></el-option>
              <el-option label="不可领取" :value="2"></el-option>
              <el-option label="已结束" :value="-1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">礼品卡批次总览</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('coupon/create')">
            <el-button type="primary" @click="openAdd">新增批次</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="170" prop="batch_sn"></el-table-column>
        <el-table-column label="批次名" prop="title" width="150"></el-table-column>
        <el-table-column label="批次内容" width="280">
          <template slot-scope="scope">
            <div v-for="(item, index) in scope.row.batchGoods" :key="index">
              {{item.name}} ×{{item.total_number}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="已领取/已发行" width="120" align="center">
         <template slot-scope="scope">
            {{scope.row.take_number || 0}}/{{scope.row.all_number || 0}}
          </template>
        </el-table-column>
        <el-table-column label="卡券有效期" width="160">
          <template slot-scope="scope">
            {{scope.row.start_time}}~{{scope.row.end_time}}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150">
          <template slot-scope="scope">
            <div>{{generateStatuTexts[scope.row.generate_status]}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('coupon/operation')">
              <el-button 
                v-if="scope.row.valid_status == 1"
                type="text"
                size="default"
                @click="toggleStatus(scope.row)"
              >停用</el-button>
              <el-button
                v-if="scope.row.valid_status == 2"
                type="text"
                size="default"
                @click="toggleStatus(scope.row)"
              >启用</el-button>
            </template>
            <template v-if="$auths.includes('coupon/list')">
              <el-button
                type="text"
                size="default"
                @click="toCards(scope.row)"
              >卡券列表</el-button>
            </template>
            <template>
              <el-button
                type="text"
                size="default"
                @click="openEdit(scope.row)"
              >编辑</el-button>
            </template>
            <template v-if="$auths.includes('coupon/operation')">
              <el-button type="text" size="default" @click="deleteItem(scope.row)">销毁</el-button>
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

    <el-dialog title="新增卡片批次" width="1000px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑卡片批次" width="1000px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import moment from 'moment';
import Add from '@/partialviews/coupon/giftCard/AddBatch';
import Edit from '@/partialviews/coupon/giftCard/EditBatch';

export default {
  name: 'giftCardBatchs',
  components: {
    Add,
    Edit
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        type_code: '',
        used_code: '',
        valid_status: ''
      },
      filter: {
        type_code: '',
        used_code: '',
        valid_status: ''
      },
      dataList: [],
      types: [],  //类型
      use_types: [],
      generateStatuTexts: {
        [1]: '商品已全部生成卡券',
        [2]: '可继续生成',
        [-1]: '已被删除'
      },
      formData: {},

      addVisible: false,
      editVisible: false
    };
  },
  mounted() {
    if(localStorage.getItem('shouldRefresh')) localStorage.removeItem('shouldRefresh');
    this.getList();
    this.getTypes();
    this.getUsed();
  },
  activated() {
    if(localStorage.getItem('shouldRefresh')) {
      this.getList();
      if(document && document.querySelector('#page')) {
        document.querySelector('#page').scrollTop = 0;
      }
      localStorage.removeItem('shouldRefresh');
    }
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        type_code: '',
        used_code: '',
        valid_status: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        type_code: this.queryForm.type_code,
        used_code: this.queryForm.used_code,
        valid_status: this.queryForm.valid_status
      };
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        type_code: this.filter.type_code,
        used_code: this.filter.used_code,
        valid_status: this.filter.valid_status
      };

      this.$get('/admin/gift/batchList', queryVal, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          let item = dataList[i];
          for(let j = 0; j < item.batchGoods.length; j++) {
            let specs = JSON.parse(item.batchGoods[j].specs);
            let attr = Object.values(specs);
            let attrInfo = attr.join('、');
            let name = `${item.batchGoods[j].title}（${attrInfo}）`;
            dataList[i].batchGoods[j].name = name;
          }
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    getTypes() {
      this.$get('/admin/coupon/type', null, res => {
        this.types = res.data;
      });
    },
    getUsed() {
      this.$get('/admin/coupon/used', null, res => {
        this.use_types = res.data;
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
        limit_type: 1,  //1有时效， -1无时效
        time: [moment().format('YYYY-MM-DD HH:mm:ss'), moment().add(14, 'days').format('YYYY-MM-DD HH:mm:ss')],
        goods: [],
        take_limit: 1,
        remark: '',
        type: 1 //1后台自定义生成, 2后台选择订单生成, 3	C端用户自己选择生成
      };
      this.addVisible = true;
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      delete params.remark; //备注不需要被验证，在下面补回去就可以了

      let goods = [], originGoodsInfo = [];
      for(let i = 0; i < params.goods.length; i++) {
        goods.push({
          goods_sn: params.goods[i].goods_sn,
          sku_sn: params.goods[i].sku_sn,
          number: params.goods[i].number
        })
      }
      originGoodsInfo.push(...params.goods)
      params.goods = goods;

      if(params.limit_type == 1) {
        params.start_time = params.time[0];
        params.end_time = params.time[1];
      }
      delete params.time; 

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写完所有信息，选择这批卡券包含的商品及其数量哦');
        }
      }
      for(let i = 0; i < params.goods.length; i++) {
        if(!/^([1-9][0-9]*)$/.test(params.goods[i].number)) {
          return this.$message.error(`第${i + 1}个商品数量要为大于0的1，2，3，4这种正整数哦`);
        } else if(parseInt(params.goods[i].number) > originGoodsInfo[i].stock) {
          return this.$message.error(`第${i + 1}个商品数量超过了其库存，请检查`);
        }
      }
      if(!/^([1-9][0-9]*)$/.test(params.take_limit)) {
        return this.$message.error(`每人可领数量要为大于0的1，2，3，4这种正整数哦`);
      } 

      params.remark = this.formData.remark;

      this.$post('/admin/gift/batchCreate', params, res => {
        this.$message.success('添加礼品卡批次成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    openEdit(row) {
      let params = {
        batch_sn: row.batch_sn
      };
      this.$get('/admin/gift/batchInfo', params, res => {
        let data = res.data.batchInfo;
        for(let i = 0; i < data.batchGoods.length; i++) {
          let specs = JSON.parse(data.batchGoods[i].specs);
          let attr = Object.values(specs);
          let attrInfo = attr.join('、');
          data.batchGoods[i].attrs = attrInfo;
          
          data.batchGoods[i].current_stock = (data.batchGoods[i].total_number || 0) - (data.batchGoods[i].generate_number || 0);
          data.batchGoods[i].current_untake = (data.batchGoods[i].generate_number || 0) - (data.batchGoods[i].take_number || 0);
          data.batchGoods[i].current_unused = (data.batchGoods[i].take_number || 0) - (data.batchGoods[i].used_number || 0);
          
        }
        
        this.formData = {
          batch_sn: data.batch_sn,
          title: data.title,
          limit_type: data.limit_type,  //1有时效， -1无时效
          time: [moment(data.start_time).format('YYYY-MM-DD HH:mm:ss'), moment(data.end_time).format('YYYY-MM-DD HH:mm:ss')],
          goods: data.batchGoods,
          take_limit: data.take_limit,
          remark: data.remark,
          type: data.type
        };
        this.editVisible = true;
      });

    },
    editItem() {
      let params = {
        batch_sn: this.formData.batch_sn,
        title: this.formData.title,
        limit_type: this.formData.limit_type,  //1有时效， -1无时效
        take_limit: this.formData.take_limit
      }
      
      if(params.limit_type == 1) {
        params.start_time = this.formData.time[0];
        params.end_time = this.formData.time[1];
      }
      delete params.time; 

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写完所有信息哦');
        }
      }
      
      if(!/^([1-9][0-9]*)$/.test(params.take_limit)) {
        return this.$message.error(`每人可领数量要为大于0的1，2，3，4这种正整数哦`);
      } 

      params.remark = this.formData.remark;

      this.$post('/admin/gift/batchUpdate', params, res => {
        this.$message.success('编辑礼品卡批次成功');
        this.editVisible = false;
        this.reloadPage();
      });

    },


    toggleStatus(row) {
      let ctrlType = row.valid_status == 1 ? '停用' : '启用';
      let params = {
        code: row.code,
        valid_status: row.valid_status
      }
      this.$post('/admin/coupon/operation', params, res => {
        this.$message.success(`${ctrlType}成功`);
        this.reloadPage();
      });
      
    },
    deleteItem(row) {
      let that = this;
      that
        .$confirm('你确定删除该批次？', '警告', {
          $confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          let params = {
            batch_sn: row.batch_sn
          }
          this.$post('/admin/gift/batchDelete', params, res => {
            this.$message.success(`删除成功`);
            this.reloadPage();
          });
        })
        .catch(() => {});
    },
    
    toCards(row) {
      console.log(row);
      this.$router.push('/giftCards?sn=' + row.batch_sn);
    },
  }
};
</script>

<style scoped>
  .coupon-used {
    display: inline-block;
    padding: .2em 10px;
    border-radius: .9em;
    font-size: 12px;
    line-height: 1.4;
    color: #fff;
    background-color: #618df5;
  }
</style>