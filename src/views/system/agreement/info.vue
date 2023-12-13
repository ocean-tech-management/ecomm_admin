<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="table-ctrls">
        <div class="table-title"></div>
      </div>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="标题" prop="title" label-width="100px">
          <el-col :span="22">
            <el-input v-model="formData.title" :disabled="onlyRead" placeholder="请填入标题"></el-input>
          </el-col>
        </el-form-item>
        <template v-if="!onlyRead">
          <el-form-item label="阅读时间" prop="title" label-width="100px">
            <el-col :span="22">
              <el-input v-model="formData.browse_time" placeholder="请填入阅读时间" type="number">
                <template slot="append">秒</template>
              </el-input>
              <div style="color: #909399;">0为无需强制阅读时间</div>
            </el-col>
          </el-form-item>
          <el-form-item label="附带条件" prop="title" label-width="100px">
            <el-col :span="22">
              <el-select v-model="formData.attach_type" placeholder="请选择附带条件" name="attach_type">
                <el-option v-for="(value, key) in attachTypeTexts" :label="value" :value="key" :key="key"></el-option>
              </el-select>
            </el-col>
          </el-form-item>
        </template>
        <el-form-item label="协议内容" prop="content" label-width="100px">
          <el-col :span="22">
            <quill-editor class="multiple-content" v-model="formData.content" :options="editorOption" ref="userAgreement"
              key="userAgreement"></quill-editor>
          </el-col>
          <div>
            <el-upload id="img-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg, image/gif"
              action="/admin/file/upload" ref="upload" :data="thumbData" :headers="token" :show-file-list="true"
              :before-upload="uploadWatcher" :on-error="uploadError" :on-exceed="overLimit" :limit="5" auto-upload
              multiple></el-upload>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark" label-width="100px">
          <el-col :span="22">
            <el-input v-model="formData.remark" placeholder="请输入备注" :disabled="onlyRead" type="text" />
          </el-col>
        </el-form-item>
        <el-form-item label="" label-width="300px">
          <template v-if="!onlyRead">
            <el-button @click="goBack">取消</el-button>
            <el-button v-if="agSn" type="primary" @click="editInfo">修改</el-button>
            <el-button v-else type="primary" @click="addInfo">新增</el-button>
          </template>
          <template v-else>
            <el-button @click="goBackUser">返回</el-button>
          </template>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
import moment from 'moment';

import "quill/dist/quill.core.css";
import "quill/dist/quill.bubble.css";
import {toolbarOptions} from "@/config";
import QuillEditor from 'vue-quill-editor';

export default {
  data() {
    return {
      agSn: '', // 协议编码
      onlyRead: false,
      formData: {
        title: '',
        type: 1,
        content: '',
        remark: '',
        attach_type: '-1',
        browse_time: 0,
      },
      attachTypeTexts: {
        [-1]: '无需条件',
        // [1]: '需电子签名',
      },

      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      editorOption: {
        placeholder: "在此编辑你的协议内容",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function (value) {
                document.querySelector("#img-uploader input").click();
                this.quill.format("image", false);
              }
            }
          }
        }
      },
      fileList: []
    };
  },
  mounted() {
    if (this.$route.query.agSn) {
      this.agSn = this.$route.query.agSn;
      this.onlyRead = this.$route.query.onlyRead ? true : false;
      this.getData();
    }

    // 接管复制事件
    let Delta = QuillEditor.Quill.import('delta');  //只能从页面单独引入才可以用这方法，目前没有思路
    this.$refs.userAgreement.quill.clipboard.addMatcher('img', (node, delta) => {
      // 强行接管复制/黏贴事件
      if (node.src) {
        // 检查是不是base64
        if (node.src.startsWith('data:')) {
          // base64转成file类型，然后上传
          let arr = node.src.split(','), mime = arr[0].match(/:(.*?);/)[1], suffix = mime.split('/')[1] || 'jpg',
            bstr = atob(arr[1]), len = bstr.length, u8arr = new Uint8Array(len);
          while (len--) {
            u8arr[len] = bstr.charCodeAt(len);
          }
          // 转成一个新的文件，后缀和文件格式从原有的文件中拿
          let file = new File([u8arr], `copy_image_${moment().valueOf()}.${suffix}`, {type: mime || 'image/jpg'});
          this.uploadWatcher(file);
        } else {
          // 不是base64直接给插入
          return delta.compose(new Delta().retain(delta.length()));
        }
      }
      return new Delta(); //如果没有命中，即没有src地址，直接返回空，不执行插入操作
    });
  },
  methods: {
    getData() {
      this.$get('/admin/agreement/info', { ag_sn: this.agSn }, res => {
        this.formData = res.data;
        this.formData.attach_type = res.data.attach_type + '';
      })
    },

    uploadWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif') {
        this.$refs.upload.clearFiles();
        this.$message.error('只能上传jpg/png/gif图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.upload.clearFiles();
        this.$message.error("上传图片大小不能超过 2MB!");
        return false;
      }
      this.fileList.unshift(file);
      this.tryUpload(url => {
        let quill = this.$refs.userAgreement.quill;
        let length = quill.getSelection().index;
        quill.insertEmbed(length, "image", url);
        quill.setSelection(length + 1);
        this.$forceUpdate();
      }, res => {
        this.$refs.upload.clearFiles();
      });
      return false; //不让自动上传了，交给上传程序来把握进程
    },
    /**
     * @param handler 上传成功后要使用的函数。 因是一批同种性质的文件上传，一般都一样
     * @param completeHandler 当结束时要执行的函数
     */
    tryUpload(handler, completeHandler) {
      if (this.uploading) return;
      this.$loading({text: '上传图片中'});
      this.uploading = true;

      let file = this.fileList[this.fileList.length - 1];
      uploadCtrl.getFileMD5(file, md5 => {
        uploadCtrl.svalidMD5(
          md5,
          url => {
            this.uploading = false;
            if (handler && typeof handler == 'function') handler(url); //将处理方法作为参数引入

            // 如果文件列表还有没有上传的，上传下一张
            this.tryUploadNext(handler, completeHandler);
          }, err => {
            // 没有拿到md5对应的图片，直接走上传逻辑
            let params = new FormData();
            params.append('file', file, file.name);
            params.append('md5', md5);
            uploadCtrl.upload('/admin/file/upload', params, res => {
              this.uploading = false;

              let data = res.data;
              if (handler && typeof handler == 'function') handler(data); //将处理方法作为参数引入

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
      if (this.fileList.length > 0) {
        this.tryUpload(handler, completeHandler);
      } else {
        if (completeHandler && typeof completeHandler == 'function') completeHandler();
        this.$loading().close();
      }
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
    overLimit() {
      this.$message.error(`一次最多只能选择5张图片`);
    },
    /**
     * 返回
     */
    goBack() {
      this.$router.replace('agreement');
    },
    goBackUser() {
      this.$router.go(-1);
    },
    /**
     * 新增协议
     */
    addInfo() {
      let params = {
        title: this.formData.title,
        type: this.formData.type, // 默认1
        attach_type: this.formData.attach_type,
        browse_time: this.formData.browse_time,
        content: this.formData.content,
        remark: this.formData.remark,
      }
      this.$post('/admin/agreement/create', params, res => {
        this.$message.success('新增成功，正在返回列表');
        setTimeout(() => {
          localStorage.setItem('shouldRefresh', 'on');
          this.goBack();
        }, 1500)
      })
    },
    /**
     * 修改协议
     */
    editInfo() {
      let params = {
        ag_sn: this.agSn,
        title: this.formData.title,
        content: this.formData.content,
        type: this.formData.type, // 默认1
        attach_type: this.formData.attach_type,
        browse_time: this.formData.browse_time,
        remark: this.formData.remark,
      }
      this.$post('/admin/agreement/update', params, res => {
        this.$message.success('修改成功，正在返回列表');
        setTimeout(() => {
          localStorage.setItem('shouldRefresh', 'on');
          this.goBack();
        }, 1500)
      })
    },
  }

};
</script>

<style>
.multiple-content {
  max-width: 1020px;
}

.multiple-content .ql-editor {
  height: 600px;
}
</style>
