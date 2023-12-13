<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="table-ctrls">
        <div class="table-title">系统设置</div>

        <template v-if="$auths.includes('system/clearCache')">
          <el-button type="primary" @click="tryClearSystemCache(1)">清除首页活动缓存</el-button>
          <el-button type="primary" @click="tryClearSystemCache(2)">清除首页素材缓存</el-button>
        </template>
      </div>
      <el-form :model="formData" label-width="100px">

        <!-- <el-form-item label="品牌馆入口">
          <el-upload
            id="thumbnail-uploader"
            class="thumbnail-uploader"
            accept="image/png, image/jpeg"
            action="/admin/file/upload"
            ref="background"
            :data="thumbData"
            :headers="token"
            :show-file-list="false"
            :before-upload="backgroundWatcher"
            :on-success="backgroundSuccess"
            :on-error="uploadError"
            auto-upload
          >
            <el-input v-show="false" v-model="formData.brand_space_background" placeholder="品牌馆入口图"></el-input>
            <img v-if="formData.brand_space_background" :src="formData.brand_space_background" class="thumbnail" />
            <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
          </el-upload>
          <div
                style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
              >请上传尺寸为690px*200px的图片，不超过2M</div>
        </el-form-item> -->

        <el-form-item label="客服二维码">
          <el-upload id="servicer-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
            action="/admin/file/upload" ref="servicer" :data="thumbData" :headers="token" :show-file-list="false"
            :before-upload="servicerWatcher" :on-success="servicerSuccess" :on-error="uploadError" auto-upload>
            <el-input v-show="false" v-model="formData.servicer_background" placeholder="客服二维码图"></el-input>
            <img v-if="formData.servicer_background" :src="formData.servicer_background" class="thumbnail" />
            <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
          </el-upload>
          <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传宽度为750px的图片，不超过2M
          </div>
        </el-form-item>


        <el-form-item label="用户协议" prop="user_agreement" label-width="100px">
          <el-col :span="22">
            <quill-editor class="multiple-content" v-model="formData.user_agreement" :options="editorOption"
              ref="userAgreement" key="userAgreement"></quill-editor>
          </el-col>
          <div>
            <el-upload id="img-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg, image/gif"
              action="/admin/file/upload" ref="upload" :data="thumbData" :headers="token" :show-file-list="true"
              :before-upload="uploadWatcher" :on-error="uploadError" :on-exceed="overLimit" :limit="5" auto-upload
              multiple></el-upload>
          </div>
        </el-form-item>

        <el-form-item label="银行卡快捷支付用户协议" prop="agreement_protocol" label-width="100px">
          <el-col :span="22">
            <quill-editor class="multiple-content" v-model="formData.agreement_protocol"
              :options="agreementProtocolEditorOption" ref="agreementProtocol" key="agreementProtocol"></quill-editor>
          </el-col>
          <div>
            <el-upload id="agreement-protocol-uploader" class="thumbnail-uploader"
              accept="image/png, image/jpeg, image/gif" action="/admin/file/upload" ref="upload" :data="thumbData"
              :headers="token" :show-file-list="true" :before-upload="agreementProtocolUploadWatcher"
              :on-error="uploadError" :on-exceed="overLimit" :limit="5" auto-upload multiple></el-upload>
          </div>
        </el-form-item>
        <el-form-item label="中数科支付用户协议" prop="agreement_protocol" label-width="100px">
          <el-col :span="22">
            <quill-editor class="multiple-content" v-model="formData.agreement_zsk"
              :options="agreementProtocolEditorOption" ref="agreementZsk" key="agreementProtocol"></quill-editor>
          </el-col>
          <div>
            <el-upload id="agreement-protocol-uploader" class="thumbnail-uploader"
              accept="image/png, image/jpeg, image/gif" action="/admin/file/upload" ref="upload" :data="thumbData"
              :headers="token" :show-file-list="true" :before-upload="agreementProtocolUploadWatcher"
              :on-error="uploadError" :on-exceed="overLimit" :limit="5" auto-upload multiple></el-upload>
          </div>
        </el-form-item>
        <el-form-item label="系统安全员手机号码" prop="safe_phone" label-width="100px">
          <el-col :span="22">
            <el-input placeholder="请输入大陆的手机号" v-model="formData.safe_phone" />
          </el-col>
        </el-form-item>
        <el-form-item label="操作密码" prop="safe_file_pwd" label-width="100px">
          <el-col :span="22">
            <el-input placeholder="请输入你的密码" v-model="formData.safe_file_pwd" type="password" />
          </el-col>
        </el-form-item>
        <el-form-item label="" label-width="300px">
          <el-button type="primary" @click="editInfo">修改</el-button>
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
      formData: {
        brand_space_background: '',
        servicer_background: '',
        user_agreement: '',
        agreement_protocol: '',
        agreement_zsk:"",
        safe_file_pwd: '',
        safe_phone: '',
      },

      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      editorOption: {
        placeholder: "在此编辑你的用户协议",
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

      agreementProtocolEditorOption: {
        placeholder: "在此编辑你的银行卡快捷支付用户协议",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function (value) {
                document.querySelector("#agreement-protocol-uploader input").click();
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
    this.getData();

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

    // 接管复制事件
    this.$refs.agreementProtocol.quill.clipboard.addMatcher('img', (node, delta) => {
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
          this.agreementProtocolUploadWatcher(file);
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
      this.$get('/admin/system/info', undefined, res => {
        this.formData = res.data;
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

    agreementProtocolUploadWatcher(file) {
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
        let quill = this.$refs.agreementProtocol.quill;
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

    backgroundWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.background.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.background.clearFiles();
        this.$message.error('上传大礼包入口图片大小不能超过 2MB');
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
              this.formData.brand_space_background = url;
              this.$refs.background.clearFiles();
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
    backgroundSuccess(res, file) {
      this.formData.brand_space_background = res.data;
      this.$refs.background.clearFiles();
      this.$forceUpdate();
    },


    servicerWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.servicer_background.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.servicer.clearFiles();
        this.$message.error('上传大礼包入口图片大小不能超过 2MB');
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
              this.formData.servicer_background = url;
              this.$refs.servicer.clearFiles();
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
    servicerSuccess(res, file) {
      this.formData.servicer_background = res.data;
      this.$refs.servicer.clearFiles();
      this.$forceUpdate();
    },


    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
    overLimit() {
      this.$message.error(`一次最多只能选择5张图片`);
    },


    editInfo() {
      let params = {
        // brand_space_background: this.formData.brand_space_background,
        servicer_background: this.formData.servicer_background,
        user_agreement: this.formData.user_agreement,
        agreement_protocol: this.formData.agreement_protocol,
        agreement_zsk:this.formData.agreement_zsk,
        safe_phone: this.formData.safe_phone,
        safe_file_pwd: this.formData.safe_file_pwd,
      }
      // if(!params.brand_space_background || params.brand_space_background === '') {
      //   return this.$message.error('请上传品牌馆入口图片哦');
      // }
      if (!/^1[3456789]\d{9}$/.test(params.safe_phone)) {
        return this.$message.error("你的手机有误")
      }
      this.$post('/admin/system/update', params, res => {
        this.$message.success('修改成功');
        this.getData();
      })
    },

    tryClearSystemCache(type) {
      let params = {
        type: type || 1
      }
      this.$get('/admin/system/clearCache', params, res => {
        this.$message.success('清除缓存成功');
      })
    }
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
