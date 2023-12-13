<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="table-ctrls">
        <div class="table-title">海报设置</div>
      </div>
      <el-form label-width="140px">
        <el-form-item label="海报设计指引">
          <el-image style="width: 180px; height: 300px;margin-left: 40px;"
            :src="require('../../../assets/imgs/poster_guide.jpg')"
            :preview-src-list="[require('../../../assets/imgs/poster_guide.jpg')]"></el-image>
        </el-form-item>
        <el-form-item v-for="(item, index) in dataList" :key="index" :label="item.name">
          <div class="item-list">
            <div class="item-upload">
              <div class="item-upload__header">海报图</div>
              <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
                action="/admin/file/upload" :ref="item.access_key + 'poster_image'" :data="thumbData" :headers="token"
                :show-file-list="false" :before-upload="imageWatcher(item.access_key, 'poster_image')"
                :on-success="imageSuccess(item.access_key, 'poster_image')" :on-error="uploadError" auto-upload>
                <el-input v-show="false" v-model="item.poster_image" placeholder="缩略图"></el-input>
                <img v-if="item.poster_image" :src="item.poster_image" class="thumbnail" alt="" />
                <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
              </el-upload>
              <div>请上传尺寸为2130px*3600px的图片</div>
            </div>
            <div v-if="item.isNeedShareImage" class="item-upload">
              <div class="item-upload__header">分享图</div>
              <div class="share-list">
                <div v-if="item.isNeedShareTitle" class="share-item">
                  <el-form-item>
                    <el-input v-model="item.share_title" placeholder="请输入分享标题" style="width: 178px;"
                      @input="$forceUpdate()" />
                  </el-form-item>
                </div>
                <div v-if="item.isNeedShareDesc" class="share-item">
                  <el-form-item>
                    <el-input v-model="item.share_desc" placeholder="请输入分享描述" style="width: 178px;"
                      @input="$forceUpdate()" />
                  </el-form-item>
                </div>
                <div class="share-item">
                  <!-- <div class="item-upload__header">分享图</div> -->
                  <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
                    action="/admin/file/upload" :ref="item.access_key + 'share_image'" :data="thumbData" :headers="token"
                    :show-file-list="false" :before-upload="imageWatcher(item.access_key, 'share_image')"
                    :on-success="imageSuccess(item.access_key, 'share_image')" :on-error="uploadError" auto-upload>
                    <el-input v-show="false" v-model="item.share_image" placeholder="缩略图"></el-input>
                    <img v-if="item.share_image" :src="item.share_image" class="thumbnail" alt="" />
                    <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
                  </el-upload>
                  <div>请上传尺寸为650px*528px的图片</div>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item v-if="dataList.length > 0" label="" label-width="300px">
          <el-button type="primary" @click="confirm">修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: "userStockList",
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,
      queryForm: {},

      dataList: [],
      visible: false,
      formData: {
        poster_image: '',
        share_image: '',
        share_title: '',
        share_desc: '',
        access_key: '',
        isNeedShareImage: false
      },

    };
  },
  components: {  },
  mounted() {
    this.getList();
  },
  methods: {
    //获取列表
    getList() {
      this.$get("/admin/system/clientBackground", {}, (res) => {
        this.dataList = res.data.map(e => {
          const systemInfo = e.system_info && Object.keys(e.system_info).length > 0 ? e.system_info : {};
          return {
            ...e,
            isNeedShareImage: e.access_key ? e.access_key.indexOf('m') > -1 || e.access_key.indexOf('d') > -1 || e.access_key.indexOf('p') > -1 : false,
            isNeedShareTitle: e.access_key ? e.access_key.indexOf('m') > -1 || e.access_key.indexOf('d') > -1 || e.access_key.indexOf('p') > -1 : false,
            isNeedShareDesc: e.access_key ? e.access_key.indexOf('d') > -1 || e.access_key.indexOf('p') > -1 : false,
            poster_image: systemInfo.poster_image,
            share_image: systemInfo.share_image,
            share_title: systemInfo.share_title,
            share_desc: systemInfo.share_desc,
          }
        });
      });
    },
    /**
     * 弹窗 - 修改海报图
     */
    confirm() {
      const client_background = []
      for (const item of this.dataList) {
        if (item.isNeedShareImage && !item.share_image) return this.$message.error(`请上传${item.name}小程序分享图`);
        if (!item.poster_image) return this.$message.error(`请上传${item.name}海报图`);
        client_background.push({
          access_key: item.access_key,
          poster_image: item.poster_image,
          share_image: item.share_image,
          share_title: item.share_title,
          share_desc: item.share_desc,
        })
      }
      console.log(client_background)

      const params = {
        client_background: JSON.stringify(client_background),
      }
      this.$post('/admin/system/update', params, () => {
        this.$message.success('修改成功');
      })
    },
    imageWatcher(accessKey, key) {
      return (file) => {
        const refs = accessKey + key
        if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
          if (this.$refs[refs]) {
            Array.isArray(this.$refs[refs]) ? this.$refs[refs][0].clearFiles() : this.$refs[refs].clearFiles();
          }
          this.$message.error('只能上传jpg或者png图片哦');
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
                this.dataList.forEach(e => {
                  if (e.access_key === accessKey) {
                    e[key] = url
                  }
                })
                if (this.$refs[refs]) {
                  Array.isArray(this.$refs[refs]) ? this.$refs[refs][0].clearFiles() : this.$refs[refs].clearFiles();
                }
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
      }
    },
    imageSuccess(accessKey, key) {
      return (res) => {
        this.dataList.forEach(e => {
          if (e.access_key === accessKey) {
            e[key] = res.data
          }
        })
        const refs = accessKey + key
        if (this.$refs[refs]) {
          Array.isArray(this.$refs[refs]) ? this.$refs[refs][0].clearFiles() : this.$refs[refs].clearFiles();
        }
        this.$forceUpdate();
      }
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  },
};
</script>


<style lang="less" scoped>
.item-list {
  display: flex;

  .item-upload {
    margin-left: 40px;

    .item-upload__header {
      width: 180px;
      text-align: center;
    }
  }

  .share-list {
    display: flex;
    flex-direction: column;

    .share-item+.share-item {
      margin-top: 38px;
    }
  }
}
</style>
