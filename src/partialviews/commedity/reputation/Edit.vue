<template>
  <div>
    <el-form :model="formData" label-width="100px">
      
      <el-form-item label="用户头像">
        <el-upload 
          id="image-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="avatarUrl"
          :data="thumbData"
          :headers="token" 
          :show-file-list="false"
          :before-upload="avatarUrlWatcher"
          :on-success="avatarSuccess"
          :on-error="uploadError"
          auto-upload
        >
          <img v-if="formData.user_avatarUrl" :src="formData.user_avatarUrl" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传尺寸为250px*250px的图片，不超过2M</div>
      </el-form-item>
      <el-form-item label="用户昵称">
        <el-input style="max-width: 300px" auto-complete="off" placeholder="填一下用户的昵称呗" v-model="formData.user_name"></el-input>
      </el-form-item>
      <el-form-item label="用户标签">
        <el-input style="max-width: 350px" auto-complete="off" placeholder="填一下用户的相关标签呗" v-model="formData.user_tag"></el-input>
      </el-form-item>

      <el-form-item label="关联产品" prop="link_product">
        <el-select 
          name="link_product"
          style="width: 400px" 
          :placeholder="formData.link_product_origin ? formData.link_product_origin_title : '请输入关键词'" 
          v-model="formData.link_product"
          filterable 
          remote 
          :loading="productLoading" 
          :remote-method="updateProductKeyword"
        >
          <el-option :label="formData.link_product_origin ? formData.link_product_origin_title : '请输入关键词'" value></el-option>
          <el-option v-for="product in products" :label="product.title" :value="product.goods_sn" :key="product.goods_sn">
            {{product.title}}
          </el-option>
        </el-select>
        <span style="margin-left: 15px;">共 {{products.length}} 个模糊选项</span>
      </el-form-item>
      <el-form-item label="描述文字">
        <el-input
          style="max-width: 600px"
          auto-complete="off"
          type="textarea"
          placeholder="请输入口碑评论的文字阐述部分哦"
          v-model="formData.content"
        ></el-input>
      </el-form-item>

      <el-form-item label="口碑图片">
        <div class="reputation-images">
          <div v-for="(item, index) in formData.images" class="reputation-image" :key="item.code">
            <div class="reputation-image-delete" @click="deleteImage(index)">×</div>
            <img :src="item.image_url" class="images"/>
          </div>
        </div>
        <el-upload 
          v-if="formData.images.length < 9"
          id="image-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="images"
          :data="thumbData"
          :headers="token" 
          :show-file-list="false"
          :before-upload="imageWatcher"
          :on-error="uploadError"
          :on-exceed="overLimit"
          :limit="9 - (formData.images.length || 0)"
          auto-upload
          multiple  
        >
          <el-button type="primary" style="padding: 20px 50px;">+添加banner</el-button>
          <span style="margin-left: 10px">还可以上传<span class="warning-color">{{9 - (formData.images.length || 0)}}</span>张</span>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传尺寸为350px*350px的图片，不超过2M</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';

import Sortable from 'sortablejs';

export default {
  name: 'EditReputation',
  data() {
    return {
      queryForm: {
        userKeyword: '',
        productKeyword: ''
      },
      filter: {
        userKeyword: '',
        productKeyword: ''
      },

      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,
      fileList: [],
      uploading: false,

      users: [],
      userLoading: false,

      products: [],
      productLoading: false
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    let imagesEl = document.querySelectorAll('.reputation-images')[0];
    const imagesSortable = Sortable.create(imagesEl, {
        onEnd: e => { // 监听拖动结束事件
          if(this.formData.images.length == 0) return;
          setTimeout(() => {
            let images = JSON.parse(JSON.stringify(this.formData.images[e.oldDraggableIndex]));  //缓存选中项
            
            // 判断old>new，true为往前插入，false为往后插入
            // 进行数据操作，确保数据与视图为一致表现
            if(e.oldDraggableIndex > e.newDraggableIndex) {
                this.formData.images.splice(e.oldDraggableIndex, 1);
                this.formData.images.splice(e.newDraggableIndex, 0, images);
            } else {
              this.formData.images.splice(e.newDraggableIndex + 1, 0, images); //往后插入时，必须+1. 保证插入到选中项后面
              this.formData.images.splice(e.oldDraggableIndex, 1);
            }
            this.$forceUpdate();
          }, 10)
        }
    })
  },
  methods: {
    //查询
    updateUserKeyword(keyword) {
      this.filter.userKeyword = keyword;
      this.formData.link_uid = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      this.userLoading = true;
      let params = {
        page: 1,
        keyword: this.filter.userKeyword
      };

      this.$get('/admin/member/list', params, res => {
        let users = res.data.list || [];
        this.users = users;
        this.userLoading = false;
      }, err => {
        this.userLoading = false;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        userKeyword: '',
        productKeyword: ''
      };
      this.formData.link_uid = null;
      this.getUsers();
    },

    updateProductKeyword(keyword) {
      this.filter.productKeyword = keyword;
      this.getProducts();
    },
    updateLinkUser(e) {
      let uid = e;
      for(let i = 0; i < this.users.length; i++) {
        if(uid == this.users[i].uid) {
          this.formData.user_name = this.users[i].user_name;
          this.formData.user_avatarUrl = this.users[i].avatarUrl;
        }
      }

    },

    //获取列表
    getProducts() {
      this.productLoading = true;
      let params = {
        page: 1,
        keyword: this.filter.productKeyword
      };

      this.$get('/admin/spu/list', params, res => {
        let products = res.data.list || [];
        this.products = products;
        this.productLoading = false;
      }, err => {
        this.productLoading = false;
      });
    },
    
    
    avatarUrlWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.avatarUrl.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.avatarUrl.clearFiles();
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
              this.formData.user_avatarUrl = url;
              this.$refs.avatarUrl.clearFiles();
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
    
    imageWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.images.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.images.clearFiles();
        this.$message.error('上传封面图片大小不能超过 2MB');
        return false;
      }
      
      this.fileList.unshift(file);

      this.tryUpload(url => {
        this.formData.images.push({
          code: new Date().getTime(),
          image_url: url
        });
        if(this.formData.images.length < 9) this.$refs.images.clearFiles();
        this.$forceUpdate();
      }, res => {
        if(this.formData.images.length < 9) this.$refs.images.clearFiles();
      });
      return false; //不让自动上传了，交给上传程序来把握进程
    },
    
    avatarSuccess(res) {
      this.formData.user_avatarUrl = res.data;
      this.$refs.avatarUrl.clearFiles();
      this.$forceUpdate();
    },

    
    /**
     * @param handler 上传成功后要使用的函数。 因是一批同种性质的文件上传，一般都一样
     * @param completeHandler 当结束时要执行的函数
     */
    tryUpload(handler, completeHandler) {
      if(this.formData.images.length >= 9) {
        this.fileList = [];
        this.uploading = false;
        this.$loading().close();
        this.$message.warning('超过允许上传限制，已终止后续图片的上传');
        return false;
      }
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

    overLimit(len) {
      this.$message.error('超过允许上传限制，口碑图片最多只能有9张，请检查');
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },

    deleteImage(index) {
      if(this.formData.images[index].id) {
        this.$confirm('已存在的图片删除后无法恢复哦，你是否决定执行该删除操作', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params = {
            id: this.formData.images[index].id
          };
          this.$post('/admin/reputation/imagesDelete', params, res => {
            this.formData.images.splice(index, 1);
          });
        }).catch(() => {});
      } else {
        this.formData.images.splice(index, 1);
      }
    },


    
  }
};
</script>

<style lang="less" scoped>
  .user-avatar {
    width: 1.4em;
    height: 1.4em;
    vertical-align: middle;
  }

  
  .reputation-images {
    display: flex;
    flex-wrap: wrap;
  }
  .reputation-image {
    position: relative;
    width: 180px;
    height: 180px;
    margin-right: 20px;
    margin-bottom: 10px;
    overflow: hidden;
  }
  .reputation-image-delete {
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
  }
  .reputation-image-delete:hover {
    background-color: #ef0000;
  }
  .images {
    display: block;
    width: 180px;
    margin-bottom: 10px;
  }
</style>