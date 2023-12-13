<template>
      <el-dialog
      title="添加设备"
      width="940px"
      :before-close="close"
      :visible.sync="addDeviceVisible"
    >
       <el-form label-position="right" ref="addDeviceForm" :model="addDeviceForm" label-width="120px">
          <el-form-item label="设备名" size="small">
           <el-input v-model="addDeviceForm.device_name" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="门店编号" size="small">
           <el-input v-model="addDeviceForm.store_sn" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="设备图片" size="small">
           <el-upload
             id="thumbnail-uploader"
             class="thumbnail-uploader"
             accept="image/png, image/jpeg, image/gif"
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
             <el-input v-show="false" v-model="addDeviceForm.device_image" placeholder="缩略图"></el-input>
             <img v-if="addDeviceForm.device_image" :src="addDeviceForm.device_image" class="thumbnail" />
             <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>

           </el-upload>
           <div
               style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
             >请上传尺寸为400*400px的图片，不超过2M。请注意，活动商品图可能会有其他尺寸</div>
          </el-form-item>
          <el-form-item label="设备自编码" size="small">
           <el-input v-model="addDeviceForm.device_show_sn" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="投资客编号" size="small">
           <el-input v-model="addDeviceForm.investor_sn" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="联系人名" size="small">
           <el-input v-model="addDeviceForm.concact_name" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="联系人手机号" size="small">
           <el-input v-model="addDeviceForm.concact_phone" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="设备状态" size="small">
           <el-input v-model="addDeviceForm.device_status" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="排序" size="small">
           <el-input v-model="addDeviceForm.sort" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="设备IMEI" size="small">
           <el-input v-model="addDeviceForm.power_imei" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="设备" size="small">
           <el-input v-model="addDeviceForm.power_number" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="智能开关" size="small">
           <el-input v-model="addDeviceForm.power_status" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="经度" size="small">
           <el-input v-model="addDeviceForm.longitude" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="纬度" size="small">
           <el-input  v-model="addDeviceForm.latitude" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="地址省级" size="small">
           <el-input v-model="addDeviceForm.address_detail.Province" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="地址市级" size="small">
           <el-input v-model="addDeviceForm.address_detail.City" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="地址区级" size="small">
           <el-input v-model="addDeviceForm.address_detail.Area" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="省级编码" size="small">
           <el-input v-model="addDeviceForm.address_detail.ProvinceId" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="市级编码" size="small">
           <el-input v-model="addDeviceForm.address_detail.CityId" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="区级编码" size="small">
           <el-input v-model="addDeviceForm.address_detail.AreaId" style="width: 250px;"></el-input>
          </el-form-item>
          <el-form-item label="设备地址" size="small">
           <el-input v-model="addDeviceForm.address_detail.address" style="width: 250px;"></el-input>
          </el-form-item>
       </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="addDeviceSubmit"
      >确 定</el-button
      >
    </div>
  </el-dialog>
 </template>

 <script>
 /*
  *@Date: 2023-04-10 14:26:56
  *@Description: 模块描述
 */
 import uploadCtrl from '@/util/uploadCtrl';
 export default {
   name: '',
   props:{
    addDeviceVisible:{
      type:Boolean,
      default:()=>false
    },
   },
   data () {
     return {
       addDeviceForm:{
        device_name: "测试设备",
        store_sn: "59341595",
        device_image: "",
        device_show_sn: "NO1244551544",
        investor_sn: "",
        concact_name: "张三",
        concact_phone: "13566665555",
        device_status: "1",
        sort: "999",
        power_imei: "111222233333444444",
        power_number: "1",
        power_status: "1",
        longitude: "120.6652",
        latitude: "65.325145",
        address_detail: {
        Province: "广东省",
        City: "深圳市",
        Area: "宝安区",
        ProvinceId: "44",
        CityId: "4403",
        AreaId: "440306",
        address: "留仙三路创兴达商务大厦3009"
 }
       },
       thumbData: {},
       token: {
         token: localStorage.getItem('token') || ''
       },
     }
   },
   created () {},
   mounted () {},
   methods: {
     thumbWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif') {
        this.$refs.thumb.clearFiles();
        this.$message.error('只能上传jpg/png/gif图片哦');
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
          console.log(this.thumbData,158)
          uploadCtrl.validMD5(
            md5,
            url => {
              this.addDeviceForm.device_image = url;
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
      this.addDeviceForm.device_image = res.data;
      this.$refs.thumb.clearFiles();
      this.$forceUpdate();
     },
     uploadError(err) {
       this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
     },
     overLimit() {
       this.$message.error(`一次最多只能选择5张图片`);
     },
     addDeviceSubmit(){
      const params=this.addDeviceForm
       this.$post('/admin/device/create',params,res=>{
          this.$message.success("添加设备成功");
          this.close();
          this.$parent.getList()
       })
     },
     close () {
      this.$emit("update:addDeviceVisible", !this.addDeviceVisible);
     }
   },
 }
 </script>

 <style lang="less" scoped>
 </style>
