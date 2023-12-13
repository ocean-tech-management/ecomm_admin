<template>
  <div>
    <el-form :model="formData" label-width="150px">
      <el-form-item label="退换类型">
        <el-select placeholder="请选择退换类型" name="type" v-model="formData.type">
          <el-option label="仅退款" :value="1"></el-option>
          <!-- 发了货才能退货退款 -->
          <el-option v-if="formData.shipping_status > 2" label="退货退款" :value="2"></el-option>
          <!-- 发了货才能换货 -->
          <el-option v-if="formData.shipping_status > 2" label="换货" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="物流状态">
        <el-select placeholder="请选择物流状态" name="logisticsIndex" v-model="formData.logisticsIndex">
          <el-option v-for="(item, index) in logistics" :label="item.text" :value="index" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="售后原因">
        <el-select placeholder="请选择售后原因" name="reasonIndex" v-model="formData.reasonIndex">
          <el-option v-for="(item, index) in reasons" :label="item.text" :value="index" :key="index"></el-option>
        </el-select>
      </el-form-item>
    
      <el-form-item v-if="formData.type != 3" label="退款金额">
        <template v-if="formData.goods.shipping_status != 1 && formData.goods.shipping_status != 2">
          <el-input style="width: 250px;" auto-complete="off" type="number" placeholder="填一下退款金额" v-model="formData.goods.real_pay_price"></el-input>
          <div class="form-content-static">最多可退￥{{formData.goods.real_pay_price_origin || '0.00'}}，含发货邮费￥{{formData.goods.total_fare_price || '0.00'}}</div>
        </template>
        <template v-else>
          <div class="error-color">￥{{formData.goods.real_pay_price || '0.00'}}</div>
          <div class="form-content-static">未发货，退款金额不可修改，最多￥{{formData.goods.real_pay_price_origin || '0.00'}}，含发货邮费￥{{formData.goods.total_fare_price || '0.00'}}</div>
        </template>
      </el-form-item>
      <el-form-item label="退款说明">
        <el-input
          style="width: 350px;"
          auto-complete="off"
          placeholder="请输入"
          maxlength="40"
          v-model="formData.apply_reason"
        ></el-input>
      </el-form-item>

      <el-form-item label="凭证图">
        <div class="return-pictures">
          <div v-for="(item, index) in formData.images" class="return-picture" :key="item.code">
            <div class="return-picture-delete" @click="deleteimage(index)">×</div>
            <img :src="item.url" class="images"/>
          </div>
        </div>
        <el-upload
          v-if="formData.images && formData.images.length < 3"
          id="image-uploader"
          class="image-uploader"
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="image"    
          :data="thumbData"
          :headers="token" 
          :show-file-list="false"
          :before-upload="imageWatcher"
          :on-error="uploadError"
          :on-exceed="overLimit"
          :limit="3 - (formData.images.length || 0)"
          auto-upload
          multiple 
        >
          <el-button type="primary">+添加凭证</el-button>
        </el-upload>
        <div
            style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
          >请上传凭证图片，不超过2M。最多3张</div>
      </el-form-item>

      <el-form-item v-if="formData.relations && formData.relations.length > 0" label="TA还想退">
        <el-checkbox-group v-model="formData.relationSelects">
          <el-checkbox v-for="(item, index) in formData.relations" :label="index" :key="index">
            <span style="white-space: pre-wrap">{{item.title}}【{{item.attrs}}】</span>
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
    </el-form>

  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'initiateAfterSales',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,
      fileList: [],
      
      reasons: [
        {
          id: 1,
          text: '误拍'
        },
        {
          id: 2,
          text: '质量问题'
        },
        {
          id: 3,
          text: '与实物不符'
        },
        {
          id: 4,
          text: '已与客服成功沟通退售后'
        },
        {
          id: 5,
          text: '不可抗力无法发货'
        },
        {
          id: 6,
          text: '其他'
        },
      ],
      logistics: [
        {
          id: 2,
          text: '未收到货'
        },
        {
          id: 1,
          text: '已收到货'
        },
      ]
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {
    
    imageWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.image.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.image.clearFiles();
        this.$message.error('上传封面图片大小不能超过 2MB');
        return false;
      }
      
      this.fileList.unshift(file);
      this.tryUpload(url => {
        this.formData.images.push({
          code: new Date().getTime(),
          url: url
        });
        this.$refs.image.clearFiles();
        this.$forceUpdate();
      }, res => {
        this.$refs.image.clearFiles();
      });
      return false; //不让自动上传了，交给上传程序来把握进程
      
    },
    deleteimage(index) {
      this.formData.images.splice(index, 1);
    },

    
    /**
     * @param handler 上传成功后要使用的函数。 因是一批同种性质的文件上传，一般都一样
     * @param completeHandler 当结束时要执行的函数
     */
    tryUpload(handler, completeHandler) {
      if(this.uploading) return;
      this.$loading({text: '上传图片中'});
      this.uploading = true;

      let file = this.fileList[this.fileList.length - 1];
      uploadCtrl.getFileMD5(file, md5 => {
        uploadCtrl.svalidMD5(
          md5,
          url => {
            this.uploading = false;
            if(handler && typeof handler == 'function') handler(url); //将处理方法作为参数引入
            
            // 如果文件列表还有没有上传的，上传下一张
            this.tryUploadNext(handler, completeHandler);
        }, err => {
          // 没有拿到md5对应的图片，直接走上传逻辑
          let params = new FormData();
          params.append('file',file, file.name);
          params.append('md5', md5);
          uploadCtrl.upload('/admin/file/upload', params, res => {
            this.uploading = false;

            let data = res.data;
            if(handler && typeof handler == 'function') handler(data); //将处理方法作为参数引入

            // 如果文件列表还有没有上传的，上传下一张
            this.tryUploadNext(handler, completeHandler);
          }, err => {
            this.uploading = false;
            this.tryUploadNext(handler, completeHandler);

            console.log(err);
          })
        })
      }, err => {
        this.uploading = false;
        this.tryUploadNext(handler, completeHandler);
      });
    },
    /**
     * @param handler 上传成功后要使用的函数。 因是一批同种性质的文件上传，一般都一样
     * @param completeHandler 当结束时要执行的函数
     */
    tryUploadNext(handler, completeHandler) {
      this.fileList.splice(this.fileList.length - 1, 1);
      if(this.fileList.length > 0) {
        this.tryUpload(handler, completeHandler);
      } else {
        if(completeHandler && typeof completeHandler == 'function') completeHandler();
        this.$loading().close();
      }
    },


    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
    overLimit() {
      this.$message.error(`超过允许上传限制，请检查`);
    },

    confirmResult() {
      
      let params = {
        uid: this.formData.uid,
        order_sn: this.formData.order_sn,
        goods: [],
        type: this.formData.type,
        received_goods_status: this.logistics[this.formData.logisticsIndex].id,
        apply_reason: `${this.reasons[this.formData.reasonIndex].text}，${this.formData.apply_reason}`,
        images: []
      }
      params.goods.push({
        sku_sn: this.formData.goods.sku_sn,
        apply_price: parseFloat(this.formData.goods.real_pay_price).toFixed(2)
      });
      for(let i = 0; i < this.formData.relationSelects.length; i++) {
        params.goods.push({
          sku_sn: this.formData.relations[this.formData.relationSelects[i]].sku_sn,
          apply_price: this.formData.relations[this.formData.relationSelects[i]].real_pay_price
        })
      }
      for(let i = 0; i < this.formData.images.length; i++) {
        params.images.push(this.formData.images[i].url)
      }

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '' || this.formData.apply_reason === '') {
          this.$message.error('请填写、勾选完所有信息');
          return false;
        }
      }
            
      if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.goods.real_pay_price)) {
        this.$message.error('退款金额要为最小0的数字哦，请检查填入值和格式');
        return false;
      } if(parseFloat(this.formData.goods.real_pay_price) > parseFloat(this.formData.goods.real_pay_price_origin)) {
        this.$message.error('退款金额超过可退金额，请检查');
        return false;
      } else if(parseFloat(this.formData.goods.real_pay_price) < 0) {
        this.$message.error('退款金额要大于0，请检查');
        return false;
      }
      // if(params.images.length == 0) {
      //   this.$message.error('请至少上传一张凭证图');
      //   return false;
      // }

      return params;
    }
  }
};
</script>

<style lang="less" scoped>
  
  .return-pictures {
    display: flex;
    flex-wrap: wrap;
  }
  .return-picture {
    position: relative;
    width: 120px;
    margin-right: 10px;
  }
  .return-picture-delete {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: #fff;
    cursor: pointer;
    background-color: rgba(0,0,0,.8);
    user-select: none;
    z-index: 2;
  }
  .return-picture-delete:hover {
    background-color: #ef0000;
  }
  .images {
    width: 100%;
  }
</style>