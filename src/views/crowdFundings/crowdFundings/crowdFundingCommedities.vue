<template>
  <div class="subpage-content">
    <div class="default-container">

      <div class="table-ctrls">
        <div class="table-title">
          <span>福利期次商品列表 </span>
          <span class="success-color">{{ itemData.activity_title || '' }}(第{{ itemData.round_number }}轮
            第{{ itemData.period_number }}期)</span>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('crowdFunding/periodGoodsUpdate')">
            <el-button type="primary" @click="showAdd">新增商品</el-button>
          </template>

        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="缩略图" prop="id" width="100">
          <template slot-scope="scope">
            <img style="width: 70px" :src="scope.row.image" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="title"></el-table-column>
        <el-table-column label="商品码" width="150" prop="goods_sn"></el-table-column>
        <el-table-column label="创建时间" width="180" prop="create_time"></el-table-column>
        <el-table-column v-if="itemData.limit_type == 1" label="活动有效期" width="170">
          <template slot-scope="scope">
            {{ scope.row.start_time }} ~ {{ scope.row.end_time }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230">
          <template slot-scope="scope">
            <template v-if="itemData.result_status == 4">
              <template v-if="$auths.includes('crowdFunding/periodGoodsUpdate')">
                <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
              </template>
              <template v-if="$auths.includes('crowdFunding/periodGoodsDelete')">
                <el-button class="error-color" type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
              </template>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

    <el-dialog title="新增福利期次商品" width="1200px" :close-on-click-modal="false" :visible.sync="addVisible">
      <AddCommedities :formData="formData"></AddCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItems">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑福利期次商品" width="1200px" :close-on-click-modal="false" :visible.sync="editVisible">
      <EditCommedities :formData="formData"></EditCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import AddCommedities from '@/partialviews/crowdFunding/crowdFunding/AddCommedities';
import EditCommedities from '@/partialviews/crowdFunding/crowdFunding/EditCommedities';
import EditCommeditiesCover from '@/partialviews/crowdFunding/crowdFunding/EditCommeditiesCover';
import moment from 'moment';

export default {
  name: 'crowdFundingCommedities',
  components: {
    AddCommedities,
    EditCommedities,
    EditCommeditiesCover
  },
  data() {
    return {
      // 正则
      regExp: {
        REG_OVER_ZERO: /^(\d|[1-9]\d+)(\.\d+)?$/, // 正数
        REG_INTEGER: /^(0|[1-9][0-9]*)$/, // 正整数
      },
      code: null,
      rNum: null,
      pNum: null,

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
      itemData: {},

      formData: {},
      addVisible: false,
      editVisible: false,

      sortVisible: false,   //排序

      coverData: {},
      coverVisible: false
    };
  },
  mounted() {
    this.code = this.$route.query.code;
    this.rNum = this.$route.query.rNum;
    this.pNum = this.$route.query.pNum;
    if(!this.code || !this.rNum || !this.pNum) {
      this.$message.error('福利期次不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/crowdFundings');
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
        activity_code: this.code,
        round_number: this.rNum,
        period_number: this.pNum,
        page: this.currentPage
      };

      this.$get('/admin/crowdFunding/periodGoodsInfo', queryVal, res => {
        let dataList = res.data.list || []

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    getData() {
      if(!this.$auths.includes('crowdFunding/periodInfo')) {
        return;
      }
      let params = {
        activity_code: this.code,
        round_number: this.rNum,
        period_number: this.pNum
      };

      this.$get('/admin/crowdFunding/periodInfo', params, res => {
        let data = res.data;
        this.itemData = data;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAdd() {
      if(!this.$auths.includes('spu/list')) {
        return this.$message.warning('您缺少查看商品列表的权限，无法正常添加期次商品，请联系管理员为您添加');
      }
      let formData = {
        activity_code: this.code,
        round_number: this.rNum,
        period_number: this.pNum,
        goods: [],
        gift_type: this.itemData.gift_type, // 赠送礼物类型
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
          !(this.regExp.REG_OVER_ZERO.test(params.goods[i].activity_price)) ||
          parseFloat(params.goods[i].activity_price) <= 0
        ) {
          return this.$message.error(`第${i + 1}个活动商品的价格要为大于零的数哦，请检查下哈`)
        }
        if(
          parseFloat(params.goods[i].activity_price) > parseFloat(params.goods[i].sale_price) ||
          parseFloat(params.goods[i].activity_price) < parseFloat(params.goods[i].max_purchase_price)
        ) {
          return this.$message.error(`第${i + 1}个活动商品的价格需小于销售价且大于最高成本价哦，请检查下哈`)
        }
        if (
          params.gift_type > -1 && !(this.regExp.REG_OVER_ZERO.test(params.goods[i].gift_number))
        ) {
          return this.$message.error(`第${i + 1}个活动商品的${this.giftTypeDict[params.gift_type]}要为大于等于零的哦，请检查下哈`)
        }
        if (params.gift_type > -1) {
          params.goods[i].gift_type = params.gift_type;
          params.goods[i].gift_number = parseFloat(params.goods[i].gift_number).toFixed(3);
        }
      }
      delete params.gift_type;
      this.$post('/admin/crowdFunding/periodGoodsUpdate', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      if(!this.$auths.includes('crowdFunding/periodGoodsSkuInfo')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常修改福利期次商品，请联系管理员为您添加');
      }
      let params = {
        activity_code: this.code,
        round_number: this.rNum,
        period_number: this.pNum,
        goods_sn: row.goods_sn
      };

      this.$get('/admin/crowdFunding/periodGoodsSkuInfo', params, res => {
        let data = res.data;
        if(!data || data.length == 0) return this.$message.warning('该商品无有效内容，仅做展示。');
        let formData = {
          activity_code: data[0].activity_code,
          round_number: data[0].round_number,
          period_number: data[0].period_number,
          goods_sn: row.goods_sn,
          goods: [],
          gift_type: this.itemData.gift_type, // 赠送礼物类型
        }
        for(let i = 0; i < data.length; i++) {
          let item = {
            title: data[i].title,
            goods_sn: data[i].goods_sn,
            sku_sn: data[i].sku_sn,
            sale_price: data[i].sale_price,
            max_purchase_price: data[i].max_purchase_price,
            activity_price: data[i].activity_price,
            gift_number: data[i].gift_number && this.regExp.REG_OVER_ZERO.test(data[i].gift_number) ? Number(data[i].gift_number) : data[i].sale_price, // 默认同销售价格
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
      let params = {
        activity_code: this.formData.activity_code,
        round_number: this.formData.round_number,
        period_number: this.formData.period_number,
        goods_sn: this.formData.goods_sn,
        goods: this.formData.goods
      }

      for(let i = 0; i < params.goods.length; i++) {
        if(
          !(this.regExp.REG_OVER_ZERO.test(params.goods[i].activity_price)) ||
          parseFloat(params.goods[i].activity_price) <= 0
        ) {
          return this.$message.error(`第${i + 1}个活动商品的价格要为大于零的数哦，请检查下哈`)
        }
        if(
          parseFloat(params.goods[i].activity_price) > parseFloat(params.goods[i].sale_price) ||
          parseFloat(params.goods[i].activity_price) < parseFloat(params.goods[i].max_purchase_price)
        ) {
          return this.$message.error(`第${i + 1}个活动商品的价格需小于销售价且大于最高成本价哦，请检查下哈`)
        }
        if (
          this.formData.gift_type > -1 && !(this.regExp.REG_OVER_ZERO.test(params.goods[i].gift_number))
        ) {
          return this.$message.error(`第${i + 1}个活动商品的${this.giftTypeDict[params.gift_type]}要为大于等于零的哦，请检查下哈`)
        }
        if (this.formData.gift_type > -1) {
          params.goods[i].gift_type = this.formData.gift_type;
          params.goods[i].gift_number = parseFloat(params.goods[i].gift_number).toFixed(3);
        }
      }
      this.$post('/admin/crowdFunding/periodGoodsUpdate', params, res => {
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
        this.$post('/admin/crowdFunding/periodGoodsDelete', {
          activity_code: this.code,
          round_number: this.rNum,
          period_number: this.pNum,
          goods_sn: row.goods_sn
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },



  }
};
</script>
