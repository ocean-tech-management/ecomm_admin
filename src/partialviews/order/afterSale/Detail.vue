<template>
  <div>
    <el-table style="width: 100%; margin-top: 0;" :data="[formData.goods]">
      <el-table-column label="图片" width="60">
        <template slot-scope="scope">
          <img style="width: 40px;" :src="scope.row.images"/>
        </template>
      </el-table-column>
      <el-table-column label="商品名" prop="title">
      </el-table-column>
      <el-table-column label="数量" width="60" prop="count">
      </el-table-column>
      <el-table-column label="总价" width="100" prop="total_price"></el-table-column>
      <el-table-column label="运费" width="80" prop="total_fare_price"></el-table-column>
      <el-table-column label="折扣" width="100" prop="all_dis"></el-table-column>
      <el-table-column label="实际支付" width="100" prop="real_pay_price"></el-table-column>
      <el-table-column label="对账状态" width="80">
        <template slot-scope="scope">
          <div :class="scope.row.supplier_pay_status == 1 ? 'error-color' : ''">
            {{scope.row.supplier_pay_status == 1 ? '已对账' : '未对账'}}
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-form style="margin-top: 20px;" :model="formData" label-width="100px">
      <el-form-item label="售后类型">
        <div class="form-content-static">
          {{typeText[formData.type]}}
        </div>
      </el-form-item>
      <el-form-item label="当前状态">
        <div class="form-content-static">
          {{statusTexts[formData.after_status]}}
        </div>
      </el-form-item>
      
      <el-form-item label="退货说明">
        <div class="form-content-static">
          {{formData.apply_reason}}
        </div>
      </el-form-item>
      <div class="after-sale-boxs">
        <div style="padding-left: 40px; margin-bottom: 10px; font-size: 16px;">
          历史记录
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in formData.detail"
            :key="index"
            :timestamp="item.create_time">
            <div>{{item.content}}</div>
            <div v-if="item.images && item.images.length > 0" class="after-sale-imgs">
              <div v-for="(img, imgIndex) in item.images" class="after-sale-img-box" title="点击查看大图" :key="imgIndex" @click="showLgImgs(index, imgIndex)">
                <img class="after-sale-img" :src="img"/>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <!-- verify_status: 1退款 2退货退款 3换货 -->
      <el-form-item v-if="formData.after_status == 6 && formData.verify_status == 3" label="换货物流">
        <el-form-item label="物流信息" label-width="100px">
          <div class="leader-condition">
            <el-select name="company_code" v-model="formData.shipping_code_index" @change="updateLogisticsCompany(index, $event)">
              <el-option v-for="(logistics, logisticsIndex) in logisticsCompanys" :label="logistics.company" :value="logisticsIndex" :key="logistics.company_code"></el-option>
            </el-select>
            <el-input style="width: 200px;" auto-complete="off" placeholder="物流编号" v-model="formData.shipping_code"></el-input>
          </div>
        </el-form-item>
      </el-form-item>
      <el-form-item v-if="formData.after_status == 1 || (formData.after_status == 6 && formData.verify_status == 3)" label="操作说明">
        <el-input style="width: 500px" type="textarea" rows="3" auto-complete="off" placeholder="请输入" v-model="formData.verify_reason"></el-input>
        <div class="form-tips">友情提示： 如拒绝申请/拒绝收货，请填写此项</div>
      </el-form-item>





    </el-form>

    <el-dialog title="节点图片" width="760px" :visible.sync="lgImgsVisible" :append-to-body="true">
      <div v-if="imgSeries.length > 0">
        <el-carousel ref="afterSaleImgLgWrapper" :autoplay="false" arrow="always" height="700px" :initial-index="initScaleIndex">
          <el-carousel-item v-for="item in imgSeries" :key="item">
            <div class="after-sale-img-lg-box">
              <img class="after-sale-img-lg" :src="item"/>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="lgImgsVisible = false">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'AfterSaleDetail',
  data() {
    return {
      statusTexts: {
        [1]: '申请中',
        [2]: '已同意',
        [3]: '不同意',
        [4]: '待用户发货',
        [5]: '待收货',
        [6]: '已收货',
        [7]: '退款中',
        [8]: '待用户收货',
        [9]: '用户已收货',
        [10]: '售后完成',
        [-1]: '已取消',
        [-2]: '拒绝收货',
        [-3]: '拒绝退款'
      },
      typeText: {
        [1]: '仅退款',
        [2]: '退货退款',
        [3]: '换货'
      },


      initScaleIndex: 0,
      imgSeries: [],
      lgImgsVisible: false
    }
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {  
    showLgImgs(index, imgIndex) {
      let imgSeries = this.formData.detail[index].images;
      this.imgSeries = imgSeries;
      if(this.$refs.afterSaleImgLgWrapper) {
        this.$refs.afterSaleImgLgWrapper.setActiveItem(imgIndex);
        this.lgImgsVisible = true;
      } else {
        this.initScaleIndex = imgIndex;
        this.lgImgsVisible = true;
      }
    },
    
    updateLogisticsCompany(index, val) {
      let companyIndex = val;
      this.formData.shipping_company = this.logisticsCompanys[companyIndex].company;
      this.formData.shipping_company_code = this.logisticsCompanys[companyIndex].company_code;
      this.formData.shipping_code_index = companyIndex;
    },
  }
};
</script>

<style lang="less" scoped>
  .after-sale-boxs {
    max-height: 400px; 
    margin: 10px 0 30px 0;
    border: 1px solid #eee; 
    padding: 10px 0;
    background-color: #fafbfb;
    overflow-y: auto;
  }


  .after-scale-event {
    margin-bottom: 10px;
  }

  .after-sale-imgs {
    display: flex;
    flex-wrap: wrap;
  }
  .after-sale-img-box {
    width: 150px;
    height: 220px;
    margin-right: 15px;
    margin-bottom: 10px;
    background-color: #f2f3f3;
    overflow: hidden;
    cursor: pointer;
  }
  .after-sale-img {
    width: 150px;
  }

  .after-sale-img-lg-box {
    height: 700px;
    margin: 0 auto;
    text-align: center;
    background-color: #fff;
    overflow: hidden;
  }
  .after-sale-img-lg {
    width: 500px;
  }
</style>