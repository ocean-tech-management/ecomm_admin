<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="广告名称">
        <el-input style="width: 450px" auto-complete="off" placeholder="填一下新首屏广告的名称呗" v-model="formData.title"></el-input>
      </el-form-item>
      <el-form-item label="生效时间" prop="validTime">
        <el-date-picker name="validTime" v-model="formData.validTime" type="datetimerange"
          :picker-options="formPickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :editable="false"></el-date-picker>
      </el-form-item>

      <el-form-item label="面向群体">
        <el-select placeholder="请选择面向群体" name="show_user_type" v-model="formData.show_user_type">
          <el-option v-for="item in userTypes" :label="item.u_name" :value="item.u_type" :key="item.u_type"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-select placeholder="请选择广告类型" name="type" v-model="formData.type">
          <el-option label="静态海报" :value="1"></el-option>
          <el-option label="动态海报" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="展示图">
        <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
          action="/admin/file/upload" ref="thumb" :data="thumbData" :headers="token" :show-file-list="false"
          :before-upload="thumbWatcher" :on-success="thumbnailSuccess" :on-error="uploadError" auto-upload>
          <el-input v-show="false" v-model="formData.image" placeholder="展示图"></el-input>
          <img v-if="formData.image" :src="formData.image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传尺寸为540px*800px的图片，不超过2M</div>
      </el-form-item>

      <template v-if="formData.type == 2">
        <el-form-item label="动态类型">
          <el-select placeholder="请选择动态类型" name="content_type" v-model="formData.content_type"
            @change="confirmType(false)">
            <el-option label="商品列表" :value="1"></el-option>
            <template v-if="$auths.includes('spu/list')">
              <el-option label="单商品" :value="2"></el-option>
            </template>
            <el-option label="优惠券列表" :value="3"></el-option>

            <template v-if="$auths.includes('coupon/list')">
              <el-option label="单优惠券" :value="4"></el-option>
            </template>
            <!-- <el-option label="全部活动列表" :value="5"></el-option> -->

            <template v-if="$auths.includes('activity/list')">
              <el-option label="活动商品列表" :value="6"></el-option>
            </template>
            <el-option label="大礼包列表" :value="7"></el-option>
            <el-option label="品牌馆列表" :value="8"></el-option>
            <template v-if="$auths.includes('brandSpace/list')">
              <el-option label="品牌馆详情" :value="9"></el-option>
            </template>
            <template v-if="$auths.includes('activity/list')">
              <el-option label="N宫格详情" :value="10"></el-option>
            </template>
            <!-- 该入口从上面设置静态图 -->
            <!-- <el-option label="内页静态背景图" :value="11"></el-option> -->
            <el-option label="直播间列表" :value="12"></el-option>
            <template v-if="$auths.includes('live/roomList')">
              <el-option label="指定直播间" :value="13"></el-option>
            </template>

            <template v-if="$auths.includes('ppyl/list')">
              <el-option label="指定拼拼活动" :value="19"></el-option>
            </template>
            <template v-if="$auths.includes('specialArea/list')">
              <el-option label="指定限时专场" :value="22"></el-option>
            </template>
            <el-option label="cvip会员中心" :value="709394001"></el-option>
            <el-option label="健康豆商品专区" :value="709394002"></el-option>
            <el-option label="签约协议" :value="23"></el-option>
          </el-select>
          <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">您拥有的权限不同，可以创建的首屏广告动态类型可能会有不一样的可选项哦
          </div>
        </el-form-item>
      </template>
    </el-form>

    <template v-if="formData.type == 2">
      <!-- 单商品 -->
      <template v-if="formData.content_type == 2">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="筛选关联商品">
            <div class="category-ctrl">
              <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect">
                <el-form-item label="" prop="keyword">
                  <el-input v-model="queryForm.keyword" placeholder="请输入商品名称" @keyup.enter.native="queryInfo"></el-input>
                </el-form-item>
                <el-form-item label="分类" prop="category_code">
                  <el-select placeholder="不限" name="category_code" v-model="queryForm.category_code">
                    <el-option label="不限" value></el-option>
                    <el-option v-for="item in categories" :label="item.name" :value="item.code"
                      :key="item.code"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="queryInfo">筛选</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-form style="margin-top: 10px;">
              <el-form-item label-width="0px">
                <div class="discount-commodity-select">
                  <div class="commodity-select-wrapper commodity-spus">
                    <div v-for="(item, index) in spu"
                      :class="{ 'commodity-select-item': true, 'active': spuIndex == index }" :key="item.goods_sn"
                      @click="selectSpu(index)" @dblclick="confirmGoods">{{ item.title }}</div>
                  </div>
                  <el-button type="primary" :disabled="spu.length == 0" @click="confirmGoods">确认商品</el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-form-item>
          <el-form-item label="关联商品">
            <div class="form-content-static">{{ formData.goods.title }}</div>
          </el-form-item>
        </el-form>
      </template>

      <!-- 单优惠券 -->
      <template v-if="formData.content_type == 4">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="选择优惠券" prop="content">
            <el-select placeholder="不限" name="content" v-model="formData.content">
              <el-option v-for="item in coupons" :label="item.name" :value="item.code" :key="item.code"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- 单活动列表 -->
      <template v-if="formData.content_type == 6">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="选择活动" prop="content">
            <el-select placeholder="不限" name="content" v-model="formData.content">
              <el-option v-for="item in actives" :label="item.title" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- 品牌馆详情列表 -->
      <template v-if="formData.content_type == 9">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="选择品牌馆" prop="content">
            <el-select placeholder="不限" name="content" v-model="formData.content">
              <el-option v-for="item in brandSpaces" :label="item.title" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- N宫格列表 -->
      <template v-if="formData.content_type == 10">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="选择N宫格" prop="content">
            <el-select placeholder="不限" name="content" v-model="formData.content">
              <el-option v-for="item in quadrangles" :label="item.title" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- 直播间列表 -->
      <template v-if="formData.content_type == 13">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="选择直播间" prop="content">
            <el-select placeholder="输入关键词筛选" name="content" filterable remote v-model="formData.content"
              :loading="liveLoading" :remote-method="updateSelectKeyword">
              <el-option v-for="item in lives" :label="item.name" :value="item.roomid" :key="item.roomid"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>


      <!-- 拼拼活动列表 -->
      <template v-if="formData.content_type == 19">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="选择拼拼活动" prop="content">
            <el-select name="content" v-model="formData.content">
              <el-option v-for="item in ppyls" :label="item.activity_title" :value="item.activity_code"
                :key="item.activity_code"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- 限时专场列表 -->
      <template v-if="formData.content_type == 22">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="选择限时专场" prop="content">
            <el-select placeholder="输入关键词筛选" name="content" filterable remote v-model="formData.content"
              :loading="specialAreaLoading" :remote-method="updateSelectKeyword">
              <el-option v-for="item in specialAreas" :label="item.title" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- 协议签约列表 -->
      <template v-if="formData.content_type == 23">
        <el-form label-width="100px" style="margin-top: 60px;">
          <el-form-item label="选择协议" prop="content">
            <el-select placeholder="输入关键词筛选" name="content" filterable remote v-model="formData.content"
              :loading="agreementListLoading" :remote-method="updateSelectKeyword">
              <el-option v-for="item in agreementList" :label="item.title" :value="item.ag_sn"
                :key="item.ag_sn"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>

    </template>
  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
import uploadCtrl from '@/util/uploadCtrl';

export default {
  name: 'EditScreenBanner',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      ...formNTimePickerConfig,

      spu: [],
      spuIndex: 0,
      queryForm: {
        keyword: '',
        category_code: ''
      },
      categories: [],
      userTypes: [],

      coupons: [],
      actives: [],
      quadrangles: [],
      brandSpaces: [],

      lives: [],
      liveLoading: false,

      ppyls: [],

      specialAreas: [],
      specialAreaLoading: false,

      agreementList: [],
      agreementListLoading: false

    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getUserType();
  },
  methods: {
    onChange() {
      console.log(this.formData.content);
    },
    init() {
      this.$forceUpdate();
      this.confirmType(true);
    },
    confirmType(notRefresh = false) {
      if(!notRefresh) this.resetContent();
      if(this.formData.content_type == 2) {
        // 单商品
        if(!this.categories || this.categories.length == 0) this.getCategories();
      } else if(this.formData.content_type == 4) {
        // 单优惠券
        if(!this.coupons || this.coupons.length == 0) this.getCoupons();
      } else if(this.formData.content_type == 6) {
        // 活动商品列表
        if(!this.actives || this.actives.length == 0) this.getActives();
      } else if(this.formData.content_type == 9) {
        // 品牌馆详情
        if(!this.brandSpaces || this.brandSpaces.length == 0) this.getBrandSpaces();
      } else if(this.formData.content_type == 10) {
        // N宫格详情
        if(!this.quadrangles || this.quadrangles.length == 0) this.getQuadrangles();
      } else if(this.formData.content_type == 13) {
        // N宫格详情
        if(!this.lives || this.lives.length == 0) this.getLives();
      } else if(this.formData.content_type == 19) {
        // 指定拼拼活动
        if(!this.ppyls || this.ppyls.length == 0) this.getPpyls();
      } else if(this.formData.content_type == 22) {
        // 指定限时专场
        if(!this.specialAreas || this.specialAreas.length == 0) this.getSpecialAreas();
      } else if(this.formData.content_type == 23) {
        // 协议签约
        if(!this.agreementList || this.agreementList.length == 0) this.getAgreementList();
      }
      this.$forceUpdate();
    },
    updateSelectKeyword(keyword) {
      if(this.formData.content_type == 13) {
        this.getLives(keyword);
      } else if(this.formData.content_type == 22) {
        // 限时专场
        this.getSpecialAreas(keyword);
      } else if(this.formData.content_type == 23) {
        // 签约协议
        this.getAgreementList(keyword);
      }
    },
    getUserType() {
      this.$get('/admin/coupon/userType', null, res => {
        this.userTypes = res.data;
      });
    },
    getCoupons() {
      if(!this.$auths.includes('coupon/list')) {
        return;
      }
      let params = {
        type_code: '',
        used_code: '',
        valid_status: ''
      };

      this.$get('/admin/coupon/list', params, res => {
        let coupons = res.data;
        this.coupons = coupons;
        this.$forceUpdate();
      });
    },
    getActives() {
      if(!this.$auths.includes('activity/list')) {
        return;
      }
      let params = {
        keyword: '',
        show_position: [1, 2],   //1首页活动，2全部活动列表， 3N宫格
        searType: 1
      };
      console.log(params);
      this.$get('/admin/activity/list', params, res => {
        let dataList = res.data || [];
        this.actives = dataList;
        this.$forceUpdate();
      });
    },

    getQuadrangles() {
      if(!this.$auths.includes('activity/list')) {
        return;
      }
      let params = {
        keyword: '',
        show_position: [3],   //1首页活动，2全部活动列表， 3N宫格
        searType: 1
      };

      this.$get('/admin/activity/list', params, res => {
        this.quadrangles = res.data;
        this.$forceUpdate();
      });
    },

    getLives(keyword = '') {
      if(!this.$auths.includes('live/roomList')) {
        return;
      }
      let params = {
        page: this.currentPage,
        keyword: keyword,
        show_status: 1  //只筛选正常显示的
      };
      this.liveLoading = true;
      this.$get('/admin/live/roomList', params, res => {
        let dataList = res.data || [];

        this.lives = dataList;
        this.$forceUpdate();
        this.liveLoading = false;
      }, err => {
        this.liveLoading = false;
      });
    },

    getPpyls() {
      if(!this.$auths.includes('ppyl/list')) {
        return;
      }
      let params = {
        keyword: '',
        searType: 2
      };

      this.$get('/admin/ppyl/list', params, res => {
        this.ppyls = res.data;
      });
    },

    getSpecialAreas(keyword = '') {
      if(!this.$auths.includes('specialArea/list')) {
        return;
      }
      let params = {
        keyword: keyword,
        searType: 2 //只筛选正常的
      };
      this.specialAreaLoading = true;
      this.$get('/admin/specialArea/list', params, res => {
        let dataList = res.data || [];

        this.specialAreas = dataList;
        this.$forceUpdate();
        this.specialAreaLoading = false;
      }, err => {
        this.specialAreaLoading = false;
      });
    },
    /**
     * 签约协议列表
     * @param {*} keyword
     */
    getAgreementList(keyword = '') {
      if(!this.$auths.includes('agreement/list')) {
        return;
      }
      let params = {
        page: this.currentPage,
        keyword: keyword,
        searType: 2 //只筛选正常的
      };
      this.agreementListLoading = true;
      this.$get('/admin/agreement/list', params, res => {
        let dataList = res.data || [];

        this.agreementList = dataList;
        console.log('agreementList', agreementList);
        this.$forceUpdate();
        this.agreementListLoading = false;
      }, err => {
        this.agreementListLoading = false;
      });
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
    queryInfo(){
      if(!this.$auths.includes('spu/list')) {
        return;
      }
      let params = {
        keyword: this.queryForm.keyword,
        category_code: this.queryForm.category_code,
        searType: 1,
        page: 1
      };

      this.$get('/admin/spu/list', params, res => {
        this.spu = res.data.list || [];
      });
    },
    selectSpu(index) {
      this.spuIndex = index;
    },

    confirmGoods() {

      let item = {
        title: this.spu[this.spuIndex].title,
        goods_sn: this.spu[this.spuIndex].goods_sn
      }
      this.formData.goods = item;
      this.formData.content = item.goods_sn;
    },

    resetContent() {
      this.formData.content = '';
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
              this.formData.image = url;
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
      this.formData.image = res.data;
      this.$refs.thumb.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },

  }
};
</script>


<style lang="less" scoped>
.discount-commodity-select {
  display: flex;
  align-items: center;
}

.commodity-select-wrapper {
  width: 350px;
  height: 450px;
  margin: 0 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}

.commodity-select-item {
  display: flex;
  align-items: center;
  padding: 5px 15px 5px 0;
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