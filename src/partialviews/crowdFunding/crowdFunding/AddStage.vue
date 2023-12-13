<template>
  <div>
    <el-form :model="formData" label-width="285px">
      <el-form-item label="期次名称">
        <el-input style="width: 300px;" auto-complete="off" placeholder="请输入" v-model="formData.title"></el-input>
      </el-form-item>
      <el-form-item label="期次简介">
        <el-input style="width: 300px;" auto-complete="off" placeholder="请简单描述一下期次" v-model="formData.desc"></el-input>
      </el-form-item>
      <el-form-item v-if="formData.limit_type == 1" label="有效时间段">
        <el-date-picker v-model="formData.time" type="datetimerange" :picker-options="formPickerOptions"
          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss" :editable="false"></el-date-picker>
      </el-form-item>

      <el-form-item label="排序">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="排序，必须是正整数"
          v-model="formData.sort"></el-input>
      </el-form-item>


      <el-form-item label="轮数">
        <!-- <el-input style="width: 300px" auto-complete="off" type="number" placeholder="轮数，必须是正整数" v-model="formData.round_number"></el-input> -->
        <div class="form-content-static">{{ formData.round_number }}</div>
      </el-form-item>
      <el-form-item label="期数">
        <!-- <el-input style="width: 300px" auto-complete="off" type="number" placeholder="期数，必须是正整数" v-model="formData.period_number"></el-input> -->
        <div class="form-content-static">{{ formData.period_number }}</div>
      </el-form-item>
      <el-form-item label="销售额">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="销售额，必须是正数"
          v-model="formData.sales_price"></el-input>
      </el-form-item>

      <el-form-item label="每人参与次数上限">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="每人参与次数上限，必须是正整数"
          v-model="formData.join_limit_number"></el-input>
      </el-form-item>
      <el-form-item label="每人认购额度上限">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="每人认购额度上限，必须是正整数"
          v-model="formData.join_limit_amount"></el-input>
      </el-form-item>
      <el-form-item label="每人认购额度上限【展示用】">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="每人认购额度上限【展示用】，必须是正整数"
          v-model="formData.join_limit_amount_show"></el-input>
      </el-form-item>
      <el-form-item label="本期成功后返集品券比例">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="必须是正整数"
          v-model="formData.reward_scale">
          <div slot="append">%</div>
        </el-input>
      </el-form-item>
      <el-form-item label="本期失败后返本金比例">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="必须是正整数"
          v-model="formData.fail_return_scale">
          <div slot="append">%</div>
        </el-input>
      </el-form-item>
      <el-form-item label="提前购比例">
        <el-input v-model="formData.advance_buy_scale" auto-complete="off" placeholder="大于等于0小于等于100" maxlength="9"
          style="width: 300px;">
          <div slot="append">%</div>
        </el-input>
      </el-form-item>
      <el-form-item label="本期熔断返本金比例【方案一】">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="必须是正整数"
          v-model="formData.fuse_return_scale">
          <div slot="append">%</div>
        </el-input>
      </el-form-item>
      <el-form-item label="本期熔断返集品豆比例【方案一】">
        <el-input style="width: 300px" auto-complete="off" type="number" placeholder="必须是正整数"
          v-model="formData.fail_reward_scale">
          <div slot="append">%</div>
        </el-input>
      </el-form-item>
      <el-form-item label="本期熔断返本金比例【方案二】">
        <el-input v-model="formData.fuse_second_return_scale" auto-complete="off" placeholder="大于等于0小于等于100" maxlength="9"
          style="width: 300px;">
          <div slot="append">%</div>
        </el-input>
      </el-form-item>
      <el-form-item label="本期熔断分期返总本金上浮倍数【方案二】">
        <el-input v-model="formData.fuse_second_rising_scale" auto-complete="off" placeholder="大于等于1" maxlength="9"
          style="width: 300px;">
        </el-input>
      </el-form-item>
      <el-form-item label="每期返回订单总额比例【方案二】">
        <el-input v-model="formData.fuse_second_once_return_scale" auto-complete="off" placeholder="大于等于0小于等于100"
          maxlength="9" style="width: 300px;">
          <div slot="append">%</div>
        </el-input>
      </el-form-item>
      <el-form-item v-if="formData.advance_buy_scale >= 100" label="预售发放奖励时间">
        <el-input v-model="formData.advance_buy_reward_send_time" auto-complete="off" placeholder="大于等于0的正整数"
          maxlength="9" style="width: 300px;">
          <div slot="append">天</div>
        </el-input>
      </el-form-item>

      <el-form-item label="展示图">
        <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
          action="/admin/file/upload" ref="background_image" :data="thumbData" :headers="token" :show-file-list="false"
          :before-upload="imageWatcher" :on-success="imageSuccess" :on-error="uploadError" auto-upload>
          <el-input v-show="false" v-model="formData.background_image" placeholder="缩略图"></el-input>
          <img v-if="formData.background_image" :src="formData.background_image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div>请上传尺寸为750px*386px的图片，不超过2M</div>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'AddCrowdFundingStage',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      ...formNTimePickerConfig,
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {

    imageWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.background_image.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.background_image.clearFiles();
        this.$message.error('上传展示图大小不能超过 2MB');
        return false;
      }
      return new Promise((resolve, reject) => {
        uploadCtrl.getFileMD5(file, md5 => {
          this.thumbData = {
            md5: md5
          };
          uploadCtrl.validMD5(
            md5,
            url => {
              this.formData.background_image = url;
              this.$refs.background_image.clearFiles();
              this.$forceUpdate();
              reject();
            },
            err => {
              setTimeout(() => {
                resolve();
              }, 10);
            }
          );
        });
      });
    },
    imageSuccess(res, file) {
      this.formData.background_image = res.data;
      this.$refs.background_image.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  }
};
</script>
