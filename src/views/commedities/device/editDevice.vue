<template>
  <el-dialog
  title="更新设备信息"
  width="940px"
  :before-close="close"
  :visible.sync="editDeviceVisible"
>
   <el-form label-position="right" ref="editDeviceForm" :model="editDeviceForm" label-width="120px">
      <el-form-item label="设备名" size="small">
       <el-input v-model="editDeviceForm.device_name" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="门店编号" size="small">
       <el-input v-model="editDeviceForm.store_sn" style="width: 250px;"></el-input>
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
         <el-input v-show="false" v-model="editDeviceForm.device_image" placeholder="缩略图"></el-input>
         <img v-if="editDeviceForm.device_image" :src="editDeviceForm.device_image" class="thumbnail" />
         <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>

       </el-upload>
       <div
           style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
         >请上传尺寸为400*400px的图片，不超过2M。请注意，活动商品图可能会有其他尺寸</div>
      </el-form-item>
      <el-form-item label="设备自编码" size="small">
       <el-input v-model="editDeviceForm.device_show_sn" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="投资客编号" size="small">
       <el-input v-model="editDeviceForm.investor_sn" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="联系人名" size="small">
       <el-input v-model="editDeviceForm.concact_name" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="联系人手机号" size="small">
       <el-input v-model="editDeviceForm.concact_phone" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="设备状态" size="small">
       <el-input v-model="editDeviceForm.device_status" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="排序" size="small">
       <el-input v-model="editDeviceForm.sort" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="设备IMEI" size="small">
       <el-input v-model="editDeviceForm.power_imei" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="设备" size="small">
       <el-input v-model="editDeviceForm.power_number" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="智能开关" size="small">
       <el-input v-model="editDeviceForm.power_status" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="经度" size="small">
       <el-input v-model="editDeviceForm.longitude" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="纬度" size="small">
       <el-input  v-model="editDeviceForm.latitude" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="地址省级" size="small">
       <el-input v-model="editDeviceForm.address_detail.Province" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="地址市级" size="small">
       <el-input v-model="editDeviceForm.address_detail.City" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="地址区级" size="small">
       <el-input v-model="editDeviceForm.address_detail.Area" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="省级编码" size="small">
       <el-input v-model="editDeviceForm.address_detail.ProvinceId" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="市级编码" size="small">
       <el-input v-model="editDeviceForm.address_detail.CityId" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="区级编码" size="small">
       <el-input v-model="editDeviceForm.address_detail.AreaId" style="width: 250px;"></el-input>
      </el-form-item>
      <el-form-item label="设备地址" size="small">
       <el-input v-model="editDeviceForm.address_detail.address" style="width: 250px;"></el-input>
      </el-form-item>
   </el-form>
<div slot="footer" class="dialog-footer">
  <el-button @click="close">取 消</el-button>
  <el-button type="primary" @click="editDeviceSubmit"
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
editDeviceVisible:{
  type:Boolean,
  default:false
},
device_sn:{
  type:String,
  default:""
}
},
data () {
 return {
   editDeviceForm:{
    device_name: "",
        store_sn: "",
        device_image: "",
        device_show_sn: "",
        investor_sn: "",
        concact_name: "",
        concact_phone: "",
        device_status: "",
        sort: "",
        power_imei: "",
        power_number: "",
        power_status: "",
        longitude: "",
        latitude: "",
        address_detail: {
        Province: "",
        City: "",
        Area: "",
        ProvinceId: "",
        CityId: "",
        AreaId: "",
        address: ""
 }
   },
   thumbData: {},
   token: {
     token: localStorage.getItem('token') || ''
   },
 }
},
created () {
  console.log(this.device_sn,155)
},
mounted () {

},
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
          this.editDeviceForm.device_image = url;
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
  this.editDeviceForm.device_image = res.data;
  this.$refs.thumb.clearFiles();
  this.$forceUpdate();
 },
 uploadError(err) {
   this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
 },
 overLimit() {
   this.$message.error(`一次最多只能选择5张图片`);
 },
 editDeviceSubmit(){
  const params=this.editDeviceForm
   this.$post('/admin/device/update',params,res=>{
      this.$message.success("更新设备成功");
      this.close();
      this.$parent.getList()
   })
 },
 close () {
  this.$emit("update:editDeviceVisible", !this.editDeviceVisible);
 }
},
}
</script>

<style lang="less" scoped>
</style>
