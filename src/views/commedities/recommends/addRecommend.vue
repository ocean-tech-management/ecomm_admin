<template>
  <el-form :model="formData">
    <div class="subpage-content">
      <div class="default-container">
        <el-form-item v-if="hasDraft" label="点此重置" label-width="100px">
          <el-button type="warning" @click="clearDraft">清除草稿缓存并刷新</el-button>
        </el-form-item>
        <el-form-item label="文章名称" label-width="100px">
          <el-input auto-complete="off" placeholder="填一下新文章的名称呗" v-model="formData.title"></el-input>
        </el-form-item>
        <el-form-item label="文章简介" label-width="100px">
          <el-input auto-complete="off" placeholder="填一下新文章的简介呗" v-model="formData.sub_title"></el-input>
        </el-form-item>
        <el-form-item label="封面主图" label-width="100px">
          <el-upload
            id="thumbnail-uploader"
            class="thumbnail-uploader"
            accept="image/png, image/jpeg"
            action="/admin/file/upload"
            ref="thumb"
            :data="thumbData"
            :headers="token"
            :show-file-list="false"
            :before-upload="thumbWatcher"
            :on-success="thumbnailSuccess"
            :on-error="uploadError"
            auto-upload 
          >
            <el-input v-show="false" v-model="formData.main_image" placeholder="缩略图"></el-input>
            <img v-if="formData.main_image" :src="formData.main_image" class="thumbnail" />
            <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
            
          </el-upload>
          <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传尺寸为750*280px的图片，不超过2M</div>
        </el-form-item>
        <el-form-item label="关联人" label-width="100px">
        </el-form-item>


      </div>
    </div>


    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">文章描述</div>
        </div>
        <el-form-item label="详细描述" prop="desc" label-width="100px">
          <el-col :span="22">
            <quill-editor class="multiple-content" v-model="formData.desc" :options="editorOption" ref="myQuillEditor"></quill-editor>
          </el-col>
          <div>
            <el-upload
              id="img-uploader"
              class="thumbnail-uploader"
              accept="image/png, image/jpeg"
              action="/admin/file/upload"
              ref="upload"
              :data="thumbData"
              :headers="token"
              :show-file-list="false"
              :before-upload="uploadWatcher"
              :on-success="uploadSuccess"
              :on-error="uploadError"
              auto-upload 
            ></el-upload>
          </div>
        </el-form-item>


        <el-form-item label label-width="300px">
          <el-button type="primary" @click="addItem">保存</el-button>
        </el-form-item>
      </div>
    </div>


  </el-form>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.bubble.css";
import { toolbarOptions } from "@/config";


import moment from 'moment';
import uploadCtrl from '@/util/uploadCtrl';

export default {
  name: 'addRecommend',
  components: {
  },
  data() {
    return {
      formData: {
        title: '',
        sub_title: '',
        main_image: '',
        desc: '',
      },

      thumbData: {},
      token: {
        token: localStorage.getItem('token') || ''
      },
      editorOption: {
        placeholder: "在此编辑你的详情描述",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function(value) {
                document.querySelector("#img-uploader input").click();
                this.quill.format("image", false);
              }
            }
          }
        }
      },

      hasDraft: false,
      draftInterval: null
    };
  },
  beforeDestroy() {
    if(this.draftInterval) clearInterval(this.draftInterval);
  },
  mounted() {


    let lastDraft = localStorage.getItem('recommendsDraft');
    if(lastDraft && lastDraft != '') {
      let recommendsDraft = JSON.parse(lastDraft);
      // 草稿缓存有效期： 1小时
      if(moment(new Date()).diff(moment(recommendsDraft.createTime), 'hours') < 1) {
        this.hasDraft = true;
        this.formData = recommendsDraft.formData;
      } else {
        localStorage.removeItem('recommendsDraft');
      }
      
    }

    // 开启草稿定时器
    this.draftInterval = setInterval(() => {
      let recommendsDraft = {
        formData: this.formData
      }
      if(recommendsDraft.formData) localStorage.setItem('recommendsDraft', JSON.stringify(recommendsDraft));
    }, 10000)
    
  },
  methods: {

    clearDraft() {
      // 清空草稿并刷新
      this.$confirm('是否放弃当前的草稿缓存，并刷新页面重置整个页面？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('recommendsDraft');
        window.location.reload();
      }).catch(() => {});
    },

    
    thumbWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.thumb.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.thumb.clearFiles();
        this.$message.error('上传封面图片大小不能超过 2MB');
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
              this.formData.main_image = url;
              this.$refs.thumb.clearFiles();
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
    thumbnailSuccess(res, file) {
      this.formData.main_image = res.data;
      this.$refs.thumb.clearFiles();
      this.$forceUpdate();
    },


    
    uploadWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.upload.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.upload.clearFiles();
        this.$message.error("上传图片大小不能超过 2MB!");
        return;
      }
      return new Promise((resolve, reject) => {
        uploadCtrl.getFileMD5(file, md5 => {
          this.thumbData = {
            md5: md5
          };
          uploadCtrl.validMD5(
            md5,
            url => {
              let quill = this.$refs.myQuillEditor.quill;
              let length = quill.getSelection().index;
              quill.insertEmbed(length, "image", url);
              quill.setSelection(length + 1);
              this.$refs.upload.clearFiles();
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
    uploadSuccess(res, file) {
      let quill = this.$refs.myQuillEditor.quill;
      let length = quill.getSelection().index;
      quill.insertEmbed(length, "image", res.data);
      quill.setSelection(length + 1);
      this.$refs.upload.clearFiles();
    },

    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
    
    deleteSkuItem(scope) {
      this.skuList.splice(scope.$index, 1);
    },

    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      
      this.$post('/admin/goods/create', params, res => {
        this.$message.success('添加文章成功，正在返回列表');
        setTimeout(() => {
          localStorage.removeItem('recommendDraft');
          if(this.draftInterval) clearInterval(this.draftInterval);
          this.$router.replace('recommends');
        }, 1500)
      });
    }
  }
};
</script>

<style scoped>

  .multiple-content {
    width: 375px;
  }
</style>
