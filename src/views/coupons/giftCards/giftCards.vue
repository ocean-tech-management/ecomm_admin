<template>
  <div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入卡券码" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="queryInfo">查询</el-button>
              <el-button @click="resetQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <div class="gift-attr-box">
      <div class="gift-attr-list">
        <div 
          class="gift-attr-item" 
          :class="{ selected: !selectAttr || selectAttr === '' }"
          @click="changeAttr('')"
        >
          <div class="gift-attr-content">
            <div class="gift-attr-name">
              全部
            </div>
            <div class="gift-attr-createtime">
              <span v-if="attrList.length > 0">点击 其他项 切换礼品券分组</span>
              <span v-else>点击 新建礼品卡 来生成礼品卡哦</span>
            </div>
          </div>
          <div class="gift-attr-ctrls">
          </div>
        </div>
        <div 
          v-for="item in attrList" 
          class="gift-attr-item" 
          :class="{ selected: selectAttr == item.attr_sn }"
          :key="item.attr_sn" 
          @click="changeAttr(item.attr_sn)"
        >
          <div class="gift-attr-content">
            <div class="gift-attr-name">
              {{ item.title || '未命名' }}
            </div>
            <div class="gift-attr-createtime">{{item.create_time}}</div>
          </div>
          <div class="gift-attr-ctrls">
            <el-button class="gift-attr-ctrl" type="text" @click="showAttrDetail(item)">详情</el-button>
            <el-button class="gift-attr-ctrl warning-color" type="text" @click="deleteAttr(item)">销毁</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">
            卡券列表
            <span class="success-color">{{ batchData.title || "" }}</span>
          </div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('activity/goodsUpdate')">
              <el-button type="primary" @click="showAdd">新建礼品卡</el-button>
            </template>
          </div>
        </div>
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="卡券码" width="150" prop="card_sn"></el-table-column>
          <el-table-column label="卡券内容">
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.attr.allGoodsArray" :key="index">
                <span v-if="item.number && item.number != 0">{{ item.name }} ×{{ item.number || 0 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180" prop="create_time"></el-table-column>
          <el-table-column v-if="batchData.limit_type == 1" label="可领取时间段" width="170">
            <template slot-scope="scope">
              <span v-if="scope.row.take_limit_type == 1">
                {{ scope.row.take_start_time }} ~ {{ scope.row.take_end_time }}
              </span>
              <span v-if="scope.row.take_limit_type == -1">长期有效</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" prop="status">
            <template slot-scope="scope">
              {{ statusTexts[scope.row.status] }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button v-if="scope.row.status != -2" type="text" size="small"
                  @click="copyActiveInfo(scope.row)">复制激活信息</el-button>
              <template v-if="$auths.includes('activity/goodsDelete')">
                <el-button v-if="scope.row.status != -2" class="error-color" type="text" size="small"
                  @click="deleteItem(scope.row)">删除</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div v-show="dataList && dataList.length > 0" class="pagination">
          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
            layout="total, prev, pager, next" :page-count="count"></el-pagination>
        </div>
      </div>

      <el-dialog title="新增礼品卡" width="1200px" :close-on-click-modal="false" :visible.sync="addVisible">
        <Add :formData="formData"></Add>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addVisible = false">取 消</el-button>
          <el-button type="primary" @click="addItems">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="礼品卡规格信息" width="900px" :visible.sync="attrDetailVisible">
        <AttrDetail :formData="attrData"></AttrDetail>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="attrDetailVisible = false">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import Add from "@/partialviews/coupon/giftCard/Add";
  import AttrDetail from "@/partialviews/coupon/giftCard/AttrDetail";

  import moment from "moment";

  export default {
    name: "giftCards",
    components: {
      Add,
      AttrDetail
    },
    data() {
      return {
        sn: '',
        currentPage: 1,
        count: 1,

        queryForm: {
          keyword: ''
        },
        filter: {
          keyword: ''
        },
        selectAttr: '',
        
        attrCtrling: false,

        statusTexts: {
          [1]: "正常",
          [2]: "禁用",
          [-1]: "已被删除",
          [-2]: "已被销毁",
        },
        positionText: {
          [1]: "首页",
          [2]: "全部活动列表中",
        },


        dataList: [],
        attrList: [],
        batchData: {},

        formData: {},
        attrData: {},
        addVisible: false,
        attrDetailVisible: false
      };
    },
    mounted() {
      this.sn = this.$route.query.sn;
      if (!this.sn) {
        this.$message.error("卡券批次不存在或已失效，正在返回");
        setTimeout(() => {
          window.location.replace("/#/giftCardBatchs");
        }, 2000);
      }
      this.getList();
      this.getData();
    },
    methods: {
      reloadPage() {
        this.getData();
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
          batch_sn: this.sn,
          keyword: this.queryForm.keyword,
          attr_sn: this.selectAttr,
          page: this.currentPage,
        };

        this.$get("/admin/gift/cardList", queryVal, (res) => {
          let dataList = res.data.list || [];

          for (let i = 0; i < dataList.length; i++) {
            let item = dataList[i].attr;
            for (let j = 0; j < item.allGoodsArray.length; j++) {
              let specs = !item.allGoodsArray[j].specs || item.allGoodsArray[j].specs === "" ? {} : JSON.parse(item.allGoodsArray[j].specs);
              let attr = Object.values(specs);
              let attrInfo = attr.join("、");
              let name = `${item.allGoodsArray[j].title}（${attrInfo}）`;
              dataList[i].attr.allGoodsArray[j].name = name;
            }
          }
          this.dataList = dataList;
          this.count = res.data.pageTotal;
        });
      },

      getData() {
        if (!this.$auths.includes("activity/info")) {
          return;
        }
        let params = {
          batch_sn: this.sn,
        };

        this.$get("/admin/gift/batchInfo", params, (res) => {
          let data = res.data;
          let batchData = data.batchInfo;
          for (let i = 0; i < batchData.batchGoods.length; i++) {
            let specs = JSON.parse(batchData.batchGoods[i].specs);
            let attr = Object.values(specs);
            let attrInfo = attr.join("、");
            let name = `${batchData.batchGoods[i].title}（${attrInfo}）`;
            batchData.batchGoods[i].name = name;
            batchData.batchGoods[i].attrs = attrInfo;
            batchData.batchGoods[i].stock =
              batchData.batchGoods[i].total_number -
              batchData.batchGoods[i].generate_number;
          }
          this.batchData = batchData;
          this.attrList = data.attrInfo;
        });
      },

      // 分页
      handleCurrentChange(value) {
        this.currentPage = value;
        this.getList();
      },
      toggleItem(row) {
        this.$confirm(
            `您将${row.status == 1 ? "下架" : "上架"}${row.title}, 是否继续?`,
            "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
          .then(() => {
            this.$post(
              "/admin/activity/status", {
                activity_id: row.id,
                status: row.status,
              },
              (res) => {
                this.$message.success(`${row.status == 1 ? "下架" : "上架"}成功`);
                this.reloadPage();
              }
            );
          })
          .catch(() => {});
      },

      showAdd() {
        if (!this.$auths.includes("spu/list")) {
          return this.$message.warning(
            "您缺少查看商品列表的权限，无法正常添加活动商品，请联系管理员为您添加"
          );
        }
        let formData = {
          batch_sn: this.batchData.batch_sn,
          title: '',
          card_type: 1, //1商品卡  2充值卡
          convert_type: 2, //1专属卡 2普通卡
          goods: [],
          all_number: 0,
          take_limit: 1,
          take_limit_type: -1,
          take_time: [
            moment().format("YYYY-MM-DD HH:mm:ss"),
            moment().add(7, "days").format("YYYY-MM-DD HH:mm:ss"),
          ], //提交的时候要拆出来 take_start_time 和 take_end_time
          used_limit_type: 2,
          used_time: [
            moment().format("YYYY-MM-DD HH:mm:ss"),
            moment().add(7, "days").format("YYYY-MM-DD HH:mm:ss"),
          ], //提交的时候要拆出来 used_start_time 和 used_end_time
          valid_days: 7,
          pre_link_superior_user: null,
        };

        for (let i = 0; i < this.batchData.batchGoods.length; i++) {
          let item = {
            title: this.batchData.batchGoods[i].title,
            goods_sn: this.batchData.batchGoods[i].goods_sn,
            attrs: this.batchData.batchGoods[i].attrs,
            sku_sn: this.batchData.batchGoods[i].sku_sn,
            stock: this.batchData.batchGoods[i].stock,
            number: 0,
            valid: true,
            allNumber: 0,
          };
          formData.goods.push(item);
        }

        this.formData = formData;
        this.addVisible = true;
      },
      addItems() {
        let params = JSON.parse(JSON.stringify(this.formData));

        if (params.used_limit_type == 2) {
          delete params.used_time;
        } else {
          params.used_start_time = params.used_time[0];
          params.used_end_time = params.used_time[1];
          delete params.valid_days;
        }
        if (params.take_limit_type == 1) {
          params.take_start_time = params.take_time[0];
          params.take_end_time = params.take_time[1];
          delete params.take_time;
        } else {
          delete params.take_time;
        }

        if(!params.pre_link_superior_user || params.pre_link_superior_user === '') delete params.pre_link_superior_user;

        let paramValues = Object.values(params);
        for(let i = 0; i < paramValues.length; i++) {
          if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
            return this.$message.error('请填写完所有信息哦');
          }
        }

        if (params.goods.length == 0) {
          return this.$message.error("无有效商品");
        }

        if (!/^([1-9][0-9]*)$/.test(params.all_number)) {
          return this.$message.error(
            `卡券数量要为大于0的1，2，3，4之类的整数哦，请检查下哈`
          );
        }
        if (
          params.used_limit_type == 2 &&
          !/^(0|[1-9][0-9]*)$/.test(params.valid_days)
        ) {
          return this.$message.error(
            `使用时间时间段要填 0，1，2，3，4 之类的整数哦，请检查下哈`
          );
        } else if (
          params.used_limit_type == 1 &&
          (!params.used_start_time || !params.used_end_time)
        ) {
          return this.$message.error(
            `使用时间要勾选开始时间和结束时间哦，请检查下哈`
          );
        }
        for (let i = 0; i < params.goods.length; i++) {
          if (!/^(0|[1-9][0-9]*)$/.test(params.goods[i].number)) {
            return this.$message.error(
              `第${i + 1}个商品的数量要为 0，1，2，3，4 之类的整数哦，请检查下哈`
            );
          }

          if (params.goods[i].allNumber > params.goods[i].stock) {
            return this.$message.error(
              `第${i + 1}个商品的总下发数量要超过了可用数啦，请检查哈`
            );
          }
        }

        for (let i = params.goods.length - 1; i >= 0; i--) {
          // 如果规格填入的商品数为0，那么就滤掉这个不加入规格的商品
          if (!params.goods[i].number || params.goods[i].number == 0)
            params.goods.splice(i, 1);
        }

        this.$post("/admin/gift/attrCreate", params, (res) => {
          this.$message.success("新增成功");
          this.addVisible = false;
          this.reloadPage();
        });
      },

      copyActiveInfo(item) {
        this.$copyText(`兑换码：${item.convert_sn}\n密码：${item.convert_pwd}`).then(e => {
          this.$message.success('复制成功');
        }, function (e) {
          this.$message.warning('复制失败，请刷新页面重试');
          console.log(e)
        })
      },
      deleteItem(row) {
        this.$confirm(`您将删除${row.card_sn}, 是否继续?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          this.$post(
            "/admin/gift/destroyCard", {
              card_sn: [row.card_sn],
            },
            (res) => {
              this.$message.success("删除成功");
              this.reloadPage();
            }
          );
        })
        .catch(() => {});
      },

      showSort(row) {
        this.formData = {
          activity_id: this.batchData.id,
          goods_sn: row.goods_sn,
          sort: row.sort,
        };
        this.sortVisible = true;
      },
      confirmSortInfo() {
        if (!/^(0|[1-9][0-9]*)$/.test(this.formData.sort)) {
          return this.$message.error(
            `排序要为0，1，2，3，4这种正整数哦，请检查下哈`
          );
        }
        let params = [this.formData];
        this.$post("/admin/activity/goodsSort", params, (res) => {
          this.$message.success("更新排序成功");
          this.sortVisible = false;
          this.reloadPage();
        });
      },


      changeAttr(attr_sn) {
        if(this.attrCtrling) return this.attrCtrling = false;
        if(this.selectAttr != attr_sn) this.selectAttr = attr_sn || '';
        this.reloadPage();
      },
      showAttrDetail(item) {
        this.attrCtrling = true;
        item.goods = [];
        for(let i = 0; i < item.all_goods_info.length; i++) {
          let goods = {
            title: item.all_goods_info[i].title,
            number: item.all_goods_info[i].number
          }
          let specs = JSON.parse(item.all_goods_info[i].specs);
          let attr = Object.values(specs);
          let attrInfo = attr.join('、');
          goods.attrs = attrInfo;
          item.goods.push(goods);
        }
        item.current_number = (item.all_number || 0) - (item.take_number || 0);
        this.attrData = JSON.parse(JSON.stringify(item));
        this.attrDetailVisible = true;
      },
      deleteAttr(item) {
        this.attrCtrling = true;
        this.$confirm(`您将删除 ${item.title || '该规格'} 以及其下的所有礼品卡, 是否继续?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          this.$post(
            "/admin/gift/destroyCard", {
              card_sn: [item.card_sn],
            },
            (res) => {
              this.$message.success("删除成功");
              this.reloadPage();
            }
          );
        })
        .catch(() => {});
      }

    },
  };

</script>


<style lang="less" scoped>
  .table-ctrls {
    margin-bottom: 30px;
  }
  .gift-attr-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 25px;
  }
  .gift-attr-item {
    width: 250px;
    margin: 5px 10px 5px 0;
    border-radius: 5px;
    font-size: 14px;
    background-color: #fff;
    box-shadow: 0 0 5px 1px rgba(0,0,0,.1);
    cursor: pointer;
    &:hover,
    &.selected {
      box-shadow: 0 0 10px 1px rgba(97,141,245,1);
      color: #618df5;
    }
  }
  .gift-attr-content {
    padding: 20px;
    border-bottom: 1px dotted #f2f3f3;
  }
  .gift-attr-name {
    height: 1.4em;
    font-size: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .gift-attr-createtime {
    margin-top: 5px;
    font-size: 12px;
    color: #999;
  }
  .gift-attr-ctrls {
    display: flex;
    min-height: 25px;
    padding: 2px 20px;
  }
  .gift-attr-ctrl {
    padding: 10px 0;
  }
</style>