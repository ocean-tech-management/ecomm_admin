<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="table-ctrls">
        <div class="table-title">活动商品列表 <span class="success-color">{{ activeData.title || '' }}</span></div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('activity/goodsUpdate')">
            <el-button type="primary" @click="showAdd">新增</el-button>
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
        <el-table-column label="排序" prop="sort" width="80"></el-table-column>
        <el-table-column v-if="aId == 1" label="进度条" width="80">
          <template slot-scope="scope">
            {{ scope.row.salePercentage || 0 }}%
          </template>
        </el-table-column>
        <el-table-column v-if="aId == 1" label="虚拟销量" width="80" prop="sale_number">
        </el-table-column>
        <el-table-column label="创建时间" width="180" prop="create_time"></el-table-column>
        <el-table-column v-if="activeData.limit_type == 1" label="活动有效期" width="170">
          <template slot-scope="scope">
            {{ scope.row.start_time }} ~ {{ scope.row.end_time }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="70" prop="status">
          <template slot-scope="scope">
            {{ statusTexts[scope.row.status] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template slot-scope="scope">

            <template v-if="$auths.includes('activity/goodsSort')">
              <el-button type="text" size="default" @click="showSort(scope.row)">排序</el-button>
            </template>
            <template v-if="$auths.includes('activity/goodsUpdate')">
              <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('activity/goodsProgress')">
              <!-- 只有在秒杀才有，避免被误会 -->
              <el-button v-if="aId == 1" type="text" size="small" @click="showEditProgress(scope.row)">编辑进度条</el-button>
            </template>
            <template v-if="$auths.includes('activity/spuSaleNumber')">
              <!-- 只有在秒杀才有，避免被误会 -->
              <el-button v-if="aId == 1" type="text" size="small"
                @click="showEditVirtualSale(scope.row)">编辑虚拟销量</el-button>
            </template>
            <template v-if="$auths.includes('activity/goodsDelete')">
              <el-button class="error-color" type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

    <el-dialog title="新增活动商品" width="1200px" :close-on-click-modal="false" :visible.sync="addVisible">
      <AddCommedities :formData="formData"></AddCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItems">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑活动商品" width="1200px" :close-on-click-modal="false" :visible.sync="editVisible">
      <EditCommedities :formData="formData"></EditCommedities>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑活动进度" width="750px" :close-on-click-modal="false" :visible.sync="editProgressVisible">
      <EditProgress :formData="progressData"></EditProgress>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editProgressVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItemProgress">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑虚拟销量" width="750px" :close-on-click-modal="false" :visible.sync="editVirtualSaleVisible">
      <EditVirtualSale :formData="virtualData"></EditVirtualSale>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVirtualSaleVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItemVirtualSale">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 活动商品排序 -->
    <el-dialog title="活动商品排序" width="750px" :close-on-click-modal="false" :visible.sync="sortVisible">
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
import AddCommedities from '@/partialviews/commedity/active/commedity/AddCommedities';
import EditCommedities from '@/partialviews/commedity/active/commedity/EditCommedities';
import EditProgress from '@/partialviews/commedity/active/commedity/EditProgress';
import EditVirtualSale from '@/partialviews/commedity/active/commedity/EditVirtualSale';
import moment from 'moment';

export default {
  name: 'activeCommedities',
  components: {
    AddCommedities,
    EditCommedities,
    EditProgress,
    EditVirtualSale
  },
  data() {
    return {
      // 正则
      regExp: {
        REG_OVER_ZERO: /^(\d|[1-9]\d+)(\.\d+)?$/, // 正数
        REG_INTEGER: /^(0|[1-9][0-9]*)$/, // 正整数
      },
      aId: null,
      currentPage: 1,
      count: 1,

      categories: [],
      statusTexts: {
        [1]: '上架中',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      positionText: {
        [1]: '首页',
        [2]: '全部活动列表中'
      },
      // 赠送数量字典
      giftTypeDict: {
        [-1]: '不赠送',
        [1]: '赠送集品豆',
        [2]: '赠送健康豆',
        [3]: '赠送集品券'
      },

      dataList: [],
      activeData: {},
      progressData: {},
      virtualData: {},

      formData: {},

      addVisible: false,
      editVisible: false,
      sortVisible: false,   //排序
      editProgressVisible: false,
      editVirtualSaleVisible: false
    };
  },
  mounted() {
    this.aId = this.$route.query.aId;
    if(!this.aId) {
      this.$message.error('活动商品不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/actives');
      }, 2000)
      return;
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
      this.$get('/admin/activity/goodsInfo', queryVal, res => {
        let dataList = res.data.list || [];
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    // 编辑-显示
    getData() {
      if(!this.$auths.includes('activity/info')) {
        return;
      }
      let params = {
        aId: this.aId,
      };
      this.$get('/admin/activity/info', params, res => {
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
        this.$post('/admin/activity/status', {
          activity_id: row.id,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    // 新增商品-显示
    showAdd() {
      if(!this.$auths.includes('spu/list')) {
        return this.$message.warning('您缺少查看商品列表的权限，无法正常添加活动商品，请联系管理员为您添加');
      }
      let formData = {
        activity_id: this.aId,
        goods: [],
        limit_type: this.activeData.limit_type,
        allow_custom_growth: this.activeData.allow_custom_growth,
        limit_buy: this.activeData.limit_buy, // 是否限购
        gift_type: this.activeData.gift_type // 赠送礼物类型
      }
      if(this.activeData.limit_type == 1) {
        formData.time = [moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).add(7, 'days').format('YYYY-MM-DD HH:mm:ss')];
      }
      if(this.activeData.a_type == 2) {
        // 团长升级单
        formData.a_type = 2;
      }
      this.formData = formData;
      this.addVisible = true;
    },
    // 新增商品-保存
    addItems() {
      let params = JSON.parse(JSON.stringify(this.formData));
      if(this.activeData.limit_type == 1) {
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
        if(
          !(this.regExp.REG_INTEGER.test(params.goods[i].sale_number))
        ) {
          return this.$message.error(`第${i + 1}个品牌商品的起始销量要为0,1,2,3,4之类的整数哦，请检查下哈`)
        }
        if (
          params.limit_buy == 1 && !(this.regExp.REG_INTEGER.test(params.goods[i].limit_buy_number))
        ) {
          return this.$message.error(`第${i + 1}个活动商品的限购数量要为大于零的整数哦，请检查下哈`)
        }
        if (
          params.gift_type > -1 && !(this.regExp.REG_OVER_ZERO.test(params.goods[i].gift_number))
        ) {
          return this.$message.error(`第${i + 1}个活动商品的${this.giftTypeDict[params.gift_type]}要为大于等于零的哦，请检查下哈`)
        }
        params.goods[i].activity_price = parseFloat(params.goods[i].activity_price).toFixed(2);

        if (params.limit_buy == 1) {
          params.goods[i].limit_buy_number = parseFloat(params.goods[i].limit_buy_number);
          params.goods[i].limit_buy = params.limit_buy;
        }
        if (params.gift_type > -1) {
          params.goods[i].gift_type = params.gift_type;
          params.goods[i].gift_number = parseFloat(params.goods[i].gift_number).toFixed(3);
        }

        let saleNumberGoods = Object.keys(params.sale_number);
        if(!saleNumberGoods.includes(params.goods[i].goods_sn)) {
          params.sale_number[params.goods[i].goods_sn] = params.goods[i].sale_number;
        } else {
          if(params.goods[i].sale_number !== params.sale_number[params.goods[i].goods_sn]) return this.$message.error(`第${i + 1}个活动商品的在选中商品列表中有同款，请将两者的起始销量设为一致`)
        }

        if(params.a_type !== 2) {
          // 检查是否是自定义成长值
          if(this.formData.allow_custom_growth == 1) {
            if(params.goods[i].allow_custom_growth) {
              params.goods[i].custom_growth = 1;
              if(
                !(this.regExp.REG_OVER_ZERO.test(params.goods[i].growth_value)) ||
                parseFloat(params.goods[i].growth_value) <= 0
              ) {
                return this.$message.error(`第${i + 1}个活动商品开启了赠送成长值，其成长值要为大于零的数哦，请检查`)
              }
            } else {
              params.goods[i].custom_growth = 2;
              delete params.goods[i].growth_value;
            }
          }
        } else {
          // 大礼包
          if(
            !(this.regExp.REG_OVER_ZERO.test(params.goods[i].growth_value)) ||
            parseFloat(params.goods[i].growth_value) <= 0
          ) {
            return this.$message.error(`第${i + 1}个活动商品的成长值要为大于零的数哦，请检查下哈`)
          }
          params.goods[i].growth_value = parseFloat(params.goods[i].growth_value).toFixed(2);

          let vipLevelGoods = Object.keys(params.vip_level);
          if(!vipLevelGoods.includes(params.goods[i].goods_sn)) {
            params.vip_level[params.goods[i].goods_sn] = params.goods[i].vip_level;
          } else {
            if(params.goods[i].vip_level !== params.vip_level[params.goods[i].goods_sn]) this.$message.error(`第${i + 1}个活动商品的在选中商品列表中有同款，请将两者的最高可用等级设为一致`)
          }
        }
      }
      delete params.limit_buy;
      delete params.gift_type;
      this.$post('/admin/activity/goodsUpdate', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },
    // 编辑商品-显示
    showEdit(row) {
      if(!this.$auths.includes('activity/goodsSkuInfo')) {
        return this.$message.warning('您缺少查看详情的权限，无法正常修改活动商品，请联系管理员为您添加');
      }
      let params = {
        aId: this.aId,
        goods_sn: row.goods_sn
      };

      this.$get('/admin/activity/goodsSkuInfo', params, res => {
        let data = res.data;
        let formData = {
          activity_id: data[0].activity_id,
          goods: [],
          limit_type: this.activeData.limit_type,
          allow_custom_growth: this.activeData.allow_custom_growth,
          vip_level: data[0].vip_level,
          limit_buy: this.activeData.limit_buy, // 是否限购
          gift_type: this.activeData.gift_type, // 赠送礼物类型
          // sale_number: data[0].sale_number
        }
        for(let i = 0; i < data.length; i++) {
          let item = {
            title: data[i].title,
            goods_sn: data[i].goods_sn,
            sku_sn: data[i].sku_sn,
            activity_price: data[i].activity_price,
            sale_price: data[i].sale_price,
            max_purchase_price: data[i].max_purchase_price,
            sale_number: data[i].sale_number,
            limit_buy_number: data[i].limit_buy_number || data[i].limit_buy_number === 0 ? data[i].limit_buy_number : '',
            gift_number: data[i].gift_number && this.regExp.REG_OVER_ZERO.test(data[i].gift_number) ? Number(data[i].gift_number) : data[i].sale_price, // 默认同销售价格
          }
          item.allow_custom_growth = data[i].custom_growth && data[i].custom_growth == 1 ? true : false;
          if(this.activeData.a_type == 2) {
            // 团长升级单
            item.growth_value = data[i].growth_value;
            item.vip_level = data[i].vip_level;
          } else if(this.activeData.allow_custom_growth == 1) {
            item.growth_value = data[i].growth_value || 0;
          }
          let specs = JSON.parse(data[i].specs);
          item.attrs = Object.values(specs).join('、');
          formData.goods.push(item);
        }
        if(this.activeData.limit_type == 1) {
          formData.time = [row.start_time || '', row.end_time || ''];
        }

        if(this.activeData.a_type == 2) {
          // 团长升级单
          formData.a_type = 2;
        }
        this.formData = formData;
        this.editVisible = true;
      });
    },
    // 编辑商品-保存
    editItem() {
      if(this.formData.goods.length == 0) {
        this.reloadPage();
        return this.editVisible = false;
      }
      let params = JSON.parse(JSON.stringify(this.formData));
      if(this.activeData.limit_type == 1) {
        params.start_time = params.time[0];
        params.end_time = params.time[1];
        delete params.time;
      }
      delete params.limit_type;

      let paramValues = Object.values(params);
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
          return this.$message.error(`第${i + 1}个个活动商品的价格需小于销售价且大于最高成本价哦，请检查下哈`)
        }
        if(
          !(this.regExp.REG_INTEGER.test(params.goods[i].sale_number))
        ) {
          return this.$message.error(`第${i + 1}个品牌商品的起始销量要为0,1,2,3,4之类的整数哦，请检查下哈`)
        }
        if (
          params.limit_buy == 1 && !(this.regExp.REG_INTEGER.test(params.goods[i].limit_buy_number))
        ) {
          return this.$message.error(`第${i + 1}个活动商品的限购数量要为大于等于零的整数哦，请检查下哈`)
        }
        if (
          params.gift_type > -1 && !(this.regExp.REG_OVER_ZERO.test(params.goods[i].gift_number))
        ) {
          return this.$message.error(`第${i + 1}个活动商品的${this.giftTypeDict[params.gift_type]}要为大于等于零的哦，请检查下哈`)
        }
        params.goods[i].activity_price = parseFloat(params.goods[i].activity_price).toFixed(2);
        if (params.limit_buy == 1) {
          params.goods[i].limit_buy_number = parseFloat(params.goods[i].limit_buy_number);
          params.goods[i].limit_buy = params.limit_buy;
        }
        if (params.gift_type > -1) {
          params.goods[i].gift_type = params.gift_type;
          params.goods[i].gift_number = parseFloat(params.goods[i].gift_number).toFixed(3);
        }

        // 批量使用spu的规则
        params.goods[i].vip_level = params.vip_level;
        // params.goods[i].sale_number = params.sale_number;

        if(params.a_type !== 2) {
          // 检查是否是自定义成长值
          if(this.formData.allow_custom_growth == 1) {
            if(params.goods[i].allow_custom_growth) {
              params.goods[i].custom_growth = 1;
              if(
                !(this.regExp.REG_OVER_ZERO.test(params.goods[i].growth_value)) ||
                parseFloat(params.goods[i].growth_value) <= 0
              ) {
                return this.$message.error(`第${i + 1}个活动商品开启了赠送成长值，其成长值要为大于零的数哦，请检查`)
              }
            } else {
              params.goods[i].custom_growth = 2;
              delete params.goods[i].growth_value;
            }
          }
        } else {
          // 大礼包
          if(
            !(this.regExp.REG_OVER_ZERO.test(params.goods[i].growth_value)) ||
            parseFloat(params.goods[i].growth_value) <= 0
          ) {
            return this.$message.error(`第${i + 1}活动商品的成长值要为大于零的数哦，请检查下哈`)
          }
          params.goods[i].growth_value = parseFloat(params.goods[i].growth_value).toFixed(2);
        }
      }
      delete params.limit_buy;
      delete params.gift_type;
      delete params.vip_level;
      delete params.sale_number;
      params.vip_level = {
        [params.goods[0].goods_sn]: params.goods[0].vip_level
      }
      params.sale_number = {
        [params.goods[0].goods_sn]: params.goods[0].sale_number
      }

      this.$post('/admin/activity/goodsUpdate', params, res => {
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
        this.$post('/admin/activity/goodsDelete', {
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
      this.$post('/admin/activity/goodsSort', params, res => {
        this.$message.success('更新排序成功');
        this.sortVisible = false;
        this.reloadPage();
      });
    },

    // 显示编辑进度
    showEditProgress(row) {
      this.progressData = {
        activity_id: this.aId,
        scale: row.salePercentage,
        goods_sn: row.goods_sn,
        title: row.title
      }
      this.editProgressVisible = true;
    },
    editItemProgress() {
      let params = {
        activity_id: this.progressData.activity_id,
        scale: this.progressData.scale,
        goods_sn: this.progressData.goods_sn
      }

      if(!(this.regExp.REG_INTEGER.test(params.scale))) {
        return this.$message.error(`进度要为1，2，3，4这种正整数哦，请检查下哈`);
      } else if(parseInt(params.scale) < 1 || parseInt(params.scale) > 99) {
        return this.$message.error(`进度范围在1~99哦，请检查下哈`);
      }

      this.$post('/admin/activity/goodsProgress', params, res => {
        this.$message.success('更新进度成功');
        this.editProgressVisible = false;
        this.reloadPage();
      });

    },

    // 编辑虚拟销量
    showEditVirtualSale(row) {
      this.virtualData = {
        activity_id: this.aId,
        sale_number: row.sale_number || 0,
        origin_sale_number: row.real_sale_goods_sum || 0,
        goods_sn: row.goods_sn,
        title: row.title
      }
      this.editVirtualSaleVisible = true;
    },
    editItemVirtualSale() {
      let params = {
        activity_id: this.virtualData.activity_id,
        sale_number: this.virtualData.sale_number,
        goods_sn: this.virtualData.goods_sn
      }

      if(!(this.regExp.REG_INTEGER.test(params.sale_number))) {
        return this.$message.error(`虚拟销量要为0，1，2，3，4这种正整数哦，请检查下哈`);
      }
      this.$post('/admin/activity/spuSaleNumber', params, res => {
        this.$message.success('更新虚拟销量成功');
        this.editVirtualSaleVisible = false;
        this.reloadPage();
      });
    }
  },
};
</script>
