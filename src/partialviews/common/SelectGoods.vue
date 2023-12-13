<template>
  <div>
    <div class="category-ctrl">
      <el-form :inline="true">
        <el-form-item label="指定精度">
          <el-select placeholder="指定spu" name="type" v-model="type" @change="resetSpuList">
            <el-option label="指定spu" :value="1"></el-option>
            <el-option label="指定sku" :value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="category-ctrl">
      <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect" class="demo-form-inline">
        <el-form-item label="商品名称" prop="keyword">
          <el-input v-model="queryForm.keyword" placeholder="请输入商品名称" @keyup.enter.native="requestQuery"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category_code">
          <el-select placeholder="不限" name="category_code" v-model="queryForm.category_code">
            <el-option label="不限" value></el-option>
            <el-option v-for="item in categories" :label="item.name" :value="item.code" :key="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="requestQuery">筛选</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="category-commodities">
      <el-form label-width="40px">
        <el-form-item label="选择">
          <div class="discount-commodity-select">
            <div class="commodity-select-wrapper commodity-spus">
              <div v-for="(item, index) in spu" :class="{ 'commodity-select-item': true, 'active': spuIndex == index }"
                :key="item.goods_sn" @click="selectSpu(index)" @dblclick="shouldSelectAllSku">{{ item.title }}</div>
            </div>
            <div v-show="type == 2" class="commodity-select-wrapper commodity-skus">
              <div v-for="(item, index)  in sku" :class="{ 'commodity-select-item': true, 'active': skuIndex == index }"
                :key="item.sku_sn" @click="selectSku(index)" @dblclick="confirmSelect">
                {{ item.is_all === 1 ? '全部商品' : item.attrs }}
              </div>
            </div>
            <el-button type="primary" :disabled="spu.length == 0" @click="confirmSelect">确认</el-button>
            <div class="commodity-select-wrapper commodity-result">
              <div v-for="(item, index) in selectResults" class="commodity-select-item"
                :title="item.title + ' (' + item.attrs + ')'" :key="index">
                <!-- <div class="select-item-flex" >{{item.title}} {{item.attrs ? (' (' + item.attrs + ')') : ''}}</div> -->
                <div class="select-item-flex">{{ item.title }} {{ item.attrs ? (' (' + item.attrs + ')') : '' }}</div>
                <div class="select-item-delete" @click="deleteCommedity(index)">×</div>
              </div>
            </div>
          </div>
          <el-pagination v-if="count > 1" :current-page="currentPage" :page-count="count" layout="prev, next"
            prev-text="上一页" next-text="下一页" style="padding: 10px 0 0 80px;" @current-change="handleCurrentChange">
          </el-pagination>
        </el-form-item>
        <el-form-item label="">
          <div class="form-tips" style="margin: 0 15px">
            <span>选择商品项，点击确认。</span>
            <span v-if="type == 1">最多只能选择10款商品哦</span>
            <span v-if="type == 2">只能选择同一款商品下的不同规格哦</span>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div>
      <el-form :inline="true" label-width="100px">
        <el-form-item label="当前筛选">
          <div class="form-content-static">
            <template v-if="selectInfos.length > 0">
              <div v-for="(item, index) in selectInfos" :key="index">
                {{ item }}
              </div>
            </template>
            <template v-if="selectInfos.length == 0">
              未选中任何商品
            </template>
          </div>
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<script>
export default {
  name: 'SelectGoods',
  data() {
    return {
      type: 1,  //1按spu，2按sku
      spu: [],
      sku: [],
      currentPage: 1, // spu分页
      count: 1, // spu总页数
      spuIndex: 0,
      skuIndex: 0,
      queryForm: {
        keyword: '',
        category_code: ''
      },
      categories: [],
      selectInfos: [],
      selectResults: [],

      shouldSelectAllSkuTarget: false
    };
  },
  props: {

  },
  mounted() {
    this.getCategories();
  },
  methods: {
      resetSpuList() {
        this.spu = [];
        this.sku = [];
        this.spuIndex = 0;
        this.spuIndex = 0;
        this.selectInfos = [];
        this.selectResults = [];
      },
      getCategories() {
        if(!this.$auths.includes('category/list')) {
          return;
        }
        let params = {
          keyword: '',
          type: 2 // 1 父子 2父级
        };

        this.$get('/admin/category/list', params, res => {
          this.categories =  res.data;
        });
      },
      /**
       * 筛选请求
       */
      requestQuery() {
        this.currentPage = 1;
        this.queryInfo();
      },
      queryInfo() {
        if (!this.queryForm.keyword && !this.queryForm.category_code) return this.$message.error('请输入名称或选择分类再进行筛选');
        let params = {
          page: this.currentPage || 1,
          keyword: this.queryForm.keyword,
          category_code: this.queryForm.category_code,
          searType: 2
        };

        this.$get('/admin/order/spuList', params, res => {
          this.spu =  res.data.list || [];
          this.count = res.data.pageTotal;
          this.spuIndex = 0;
          if(this.type == 2) this.selectResults = [];
          if(this.spu && this.spu.length > 0) {
            this.getSku();
          } else {
            this.sku = [];
            this.skuIndex = 0;
          }
        });
      },
      /**
       * spu分页
       * @param {*} value
       */
      handleCurrentChange(value) {
        this.currentPage = value;
        this.queryInfo();
      },
      getSku() {
        let params = {
          goods_sn: this.spu[this.spuIndex].goods_sn,
          searType: 2
        };

        this.$get('/admin/order/skuList', params, res => {
          let sku = res.data.list || [];
          for(let i = 0; i < sku.length; i++) {
            let specs = JSON.parse(sku[i].specs);
            sku[i].attrs = Object.values(specs).join('、');
          }
          this.sku = sku;
          this.skuIndex = 0;
          console.log(this.shouldSelectAllSkuTarget);
          if(this.shouldSelectAllSkuTarget) {
            this.confirmSelect();
            this.shouldSelectAllSkuTarget = false;
          }
        });
      },
      selectSpu(index) {
        this.spuIndex = index;
        setTimeout(() => {
          this.getSku();
          if(this.type == 2) this.selectResults = [];  //如果是筛选sku，切换spu时清除旧有选择。 如移除此代码，支持多spu多sku筛选
        }, 200)

      },
      selectSku(index) {
        this.skuIndex = index;
      },
      shouldSelectAllSku() {
        this.shouldSelectAllSkuTarget = true;
      },

      deleteCommedity(index) {
        this.selectResults.splice(index, 1);
      },
      confirmSelect() {
        if(this.type == 1) {
          if(this.selectResults.length >= 10) return this.$message.warning('最多只能选择10款商品哦');
          let result = {};
          for(let i = 0; i < this.selectResults.length; i++) {
            // 如果是已经被选中了，不再走后面的逻辑
            if(this.selectResults[i].searGoodsSpuSn == this.spu[this.spuIndex].goods_sn) return;
          }
          result.searGoodsSpuSn = this.spu[this.spuIndex].goods_sn;
          result.searGoodsSkuSn = [];
          for(let i = 0; i < this.sku.length; i++) {
            result.searGoodsSkuSn.push(this.sku[i].sku_sn);
          }
          result.title = this.spu[this.spuIndex].title;

          this.selectResults.push(result); //加多一项
        } else {
          for(let i = 0; i < this.selectResults.length; i++) {
            // 如果是已经被选中了，不再走后面的逻辑
            if(this.selectResults[i].searGoodsSkuSn == this.sku[this.skuIndex].sku_sn) return;
          }
          // 不管是不是同一spu下的，都通通加一个数据
          let result = {};
          result.searGoodsSpuSn = this.spu[this.spuIndex].goods_sn;
          result.searGoodsSkuSn = [this.sku[this.skuIndex].sku_sn];
          result.title = `${this.sku[this.skuIndex].attrs}`;
          result.skuTitle = `${this.sku[this.skuIndex].title}`;
          this.selectResults.push(result); //加多一项
        }
      },
      confirmSelectResult() {
        let result = {
          type: this.type
        };
        let selectInfos = [];
        result.searGoodsSpuSn = [], result.searGoodsSkuSn = [];
        for(let i = 0; i < this.selectResults.length; i++) {
          if(!result.searGoodsSpuSn.includes(this.selectResults[i].searGoodsSpuSn)) result.searGoodsSpuSn.push(this.selectResults[i].searGoodsSpuSn);
          result.searGoodsSkuSn.push(...this.selectResults[i].searGoodsSkuSn);
          if(this.type == 1) {
            selectInfos.push(this.selectResults[i].title);
          } else if(this.type == 2) {
            selectInfos.push(`${this.selectResults[i].skuTitle}（${this.selectResults[i].title}）`);
          }
        }
        this.selectInfos = selectInfos;
        return result;
      }
  }
};
</script>

<style lang="less" scoped>
.discount-commodity-select {
  display: flex;
  align-items: center;
}

.commodity-select-wrapper {
  width: 300px;
  height: 400px;
  margin: 0 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}

.commodity-select-item {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
}

.commodity-select-item:hover {
  background-color: #f2f3f3;
}

.commodity-select-item.active {
  color: #fff;
  background-color: #618df5;
}

.select-item-flex {
  flex: 1;
  width: 80px;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
}

.select-item-delete {
  padding: 0 10px;
  margin-right: -15px;
  font-size: 24px;
  font-weight: 500;
}

.select-item-delete:hover {
  color: #618df5;
}
</style>