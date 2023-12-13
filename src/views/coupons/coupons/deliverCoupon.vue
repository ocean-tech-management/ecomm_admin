<template>
  <div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">券包内优惠券组合</div>
          <div class="table-ctrl">
            <el-button type="primary" @click="showSelectCoupons">点击选择优惠券</el-button>
          </div>
        </div>
        <el-table style="width: 100%" :data="coupons">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column label="优惠名称" prop="name" width="250"></el-table-column>
          <el-table-column label="优惠方式" width="150">
            <template slot-scope="scope">
              <div class="coupon-used">
                {{scope.row.u_name || ''}}
              </div>
              <div>{{couponTypeContent(scope.row)}}  </div>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="80">
            <template slot-scope="scope">{{scope.row.t_name || ''}}</template>
          </el-table-column>
          <el-table-column label="谁可领" width="100">
            <template slot-scope="scope">{{scope.row.us_name || ''}}</template>
          </el-table-column>
          <el-table-column label="限领" width="80">
            <template slot-scope="scope">{{scope.row.take_limit || ''}}</template>
          </el-table-column>
          <el-table-column label="数量" prop="total_balance">
            <template slot-scope="scope">
              <el-input style="width: 150px" auto-complete="off" placeholder="填一下" v-model="coupons[scope.$index].count" type="number"></el-input>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <el-button class="error-color" type="text" size="small" @click="deleteCoupon(scope.$index)">剔除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="default-container" style="margin-top: 15px">
        <div class="table-ctrls">
          <div class="table-title">派券人员列表</div>
          <div class="table-ctrl">
            <el-upload
              id="excel-uploader"
              class="excel-uploader" 
              accept=".xls,.xlsx,application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              action="/admin/user/excelInfo"
              ref="importUsers"
              :data="thumbData"
              :headers="token"
              :show-file-list="false"
              :before-upload="excelWatcher"
              :on-success="excelSuccess"
              :on-error="uploadError"
              auto-upload 
            >
              <el-button type="plain">导入用户列表</el-button>
            </el-upload>   
            <el-button v-if="users.length > 0" @click="showQuicklyChangeCount">批量更改领取数量</el-button>
            <el-button type="primary" @click="showSelectUsers">点击选择用户</el-button>
          </div>
        </div>

        <el-table :data="users">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.avatarUrl"/>
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="130" prop="name">
          </el-table-column>
          <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
          <el-table-column label="可领取本次优惠券包的次数(注意是券包)" prop="total_balance">
            <template slot-scope="scope">
              <el-input style="width: 180px" auto-complete="off" placeholder="填一下" v-model="users[scope.$index].count" type="number"></el-input>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <el-button class="error-color" type="text" size="small" @click="deleteUser(scope.$index)">剔除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <el-button style="margin-top: 25px" type="primary" @click="confirmDeliver">确认派券</el-button>
      
    </div>

    <el-dialog title="选择用户" width="800px" :close-on-click-modal="false" :visible.sync="usersVisible">
      <DeliverUsers ref="deliverUsers"></DeliverUsers>
      <div slot="footer" class="dialog-footer">
        <el-button @click="usersVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmUsers">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择优惠券" width="800px" :close-on-click-modal="false" :visible.sync="couponsVisible">
      <DeliverCoupons ref="deliverCoupons"></DeliverCoupons>
      <div slot="footer" class="dialog-footer">
        <el-button @click="couponsVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCoupons">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="批量修改领取数" width="800px" :close-on-click-modal="false" :visible.sync="quicklyChangeCountVisible">
      <div>
        <el-form label-width="120px">
          <el-form-item label="数量" prop="quicklyCount">
            <el-input style="width: 300px" type="number" v-model="quicklyCount" placeholder="数量，正整数"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="quicklyChangeCountVisible = false">取 消</el-button>
        <el-button type="primary" @click="quicklyChangeCount">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="派券结果" width="800px" :close-on-click-modal="false" :show-close="false" :visible.sync="deliverErrorResultVisible">
      <div>
        <template v-if="deliverErrorResult.length > 0">
          <div style="font-size: 28px">
            存在 <span class="warning-color">派券失败</span> 情况
          </div>
          <div style="margin-top: 20px">
            本次派券共有{{deliverErrorResult.length || 0}}位用户出现了问题，具体可点击下方的 “下载错误汇总” 按钮下载、查看相关信息
          </div>
          <div style="margin-top: 10px">
            <el-button type="text" size="small" @click="exportErrorData">下载错误汇总</el-button>
          </div>
        </template>
        <template v-else>
          <div style="font-size: 28px">
            <span class="success-color">派券成功</span>， 请点击 “确认并返回列表”按钮返回列表页
          </div>
        </template>
      </div>
      <div slot="footer" class="dialog-footer">
        <template v-if="deliverErrorResult.length > 0">
          <el-button @click="confirmAndBack">确定并返回列表</el-button>
          <el-button type="primary" @click="confirmAndRefresh">重新派券</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="successAndBack">确定并返回列表</el-button>
        </template>
      </div>
    </el-dialog>

  </div>
</template>
<script>
  import XLSX from 'xlsx';
  import moment from 'moment';  

  import DeliverUsers from '@/partialviews/coupon/coupon/deliver/DeliverUsers';
  import DeliverCoupons from '@/partialviews/coupon/coupon/deliver/DeliverCoupons';
  export default {
    name: 'deliverCoupon',
    components: {
      DeliverUsers,
      DeliverCoupons
    },
    data() {
      return {
        users: [],
        coupons: [],
        
        token: {
          token: localStorage.getItem('token')
        },
        thumbData: null,

        usersVisible: false,
        couponsVisible: false,

        quicklyCount: 1,  //批量
        quicklyChangeCountVisible: false,

        deliverErrorResultVisible: false,  //派券结果
        deliverErrorResult: {},
        couponName: {},
        hasTryDownload: false   //是不是点过下载
      }
    },
    mounted() {
      if(!this.$auths.includes('coupon/list')) {
        this.$message.warning('您缺少查看优惠券列表的权限，无法正常派券，请联系管理员为您添加');
        return this.$router.replace('index');
      }
      if(!this.$auths.includes('user/list')) {
        this.$message.warning('您缺少查看用户列表的权限，无法正常添加派券，请联系管理员为您添加');
        return this.$router.replace('coupons');
      }
    },
    methods: {
      couponTypeContent(row) {
        if(row.t_type == 1) {
          return `满${row.with_amount}减${row.used_amount}`
        } else if(row.t_type == 2) {
          return `满${row.with_amount}减${row.used_amount}(可叠加)`
        } else if(row.t_type == 3) {
          return `无门槛减${row.used_amount}`
        } else if(row.t_type == 4) {
          return `打折券${row.with_discount * 1000 / 100}折`
        } else if(row.t_type == 5) {
          return row.with_condition === 1 ? `满${row.with_amount}抵扣${row.used_amount}` : `抵扣${row.used_amount}`;
        } else {
          return ''
        }
      },

        
      // 上传excel文件，新增会员
      excelWatcher(file) {
        if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type != 'application/vnd.ms-excel') {
          this.$refs.importUsers.clearFiles();
          this.$message.error('只能上传标准的.xlsx或者.xls文件哦');
          return false;
        }

        this.$loading('导入中');
        return;
      },
      excelSuccess(res, file) {
        this.$loading().close();
        // 因为是复用了http请求，所以要有状态值判断
        if(res && res.error_code == 0) {
          let users = res.data;
          let uids = [];
          for(let i = 0; i < this.users.length; i++) {
            uids.push(this.users[i].uid);
          }
          let existNum = 0, invalidNum = 0;
          for(let i = 0; i < users.length; i++) {
            if(!users[i].info) {
              invalidNum += 1;
              continue;  //无有效信息
            }
            if(uids.includes( users[i].info.uid)) {
              existNum += 1;
              continue;  //已存在
            }
            let item = {
              uid:  users[i].info.uid,
              avatarUrl:  users[i].info.avatarUrl,
              phone:  users[i].info.phone,
              name:  users[i].info.name,
              count: users[i].number || 1
            }
            this.users.push(item);
          }
          this.$refs.importUsers.clearFiles();
          let successText = '上传文件成功';
          if(existNum > 0 || invalidNum > 0) successText += '。其中：';
          if(existNum > 0) successText += `已存在用户${existNum}人（以已存在数据为准）  `;
          if(invalidNum > 0) successText += `非法用户${invalidNum}人（已移除）`;
          this.$message.success(successText);
        } else {
          this.$message.error(res.msg || '上传文件失败，请检查');
          this.$refs.importUsers.clearFiles();
        }
        this.$forceUpdate();
      },
      uploadError(err) {
        this.$loading().close();
        this.$message.error('您未能正确上传excel文件，请选择符合 模板要求 的标准excel文件上传或检查您的网络哦。 请留意会员等级文案是否正确无误');
      },
      


      showSelectUsers() {
        if(this.$refs.deliverUsers) this.$refs.deliverUsers.resetSelectUsers(this.users);
        this.usersVisible = true;
      },
      confirmUsers() {
        this.users = this.$refs.deliverUsers.confirmResult();
        this.usersVisible = false;
      },
      deleteUser(index) {
        this.users.splice(index, 1);
      },
      showQuicklyChangeCount() {
        this.quicklyCount = 1;
        this.quicklyChangeCountVisible = true;
      },
      quicklyChangeCount() {
        if(!(/^([1-9][0-9]*)$/.test(this.quicklyCount))) {
          return this.$message.error(`数量要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
        }
        let users = this.users;
        for(let i = 0; i < users.length; i++) {
          users[i].count = this.quicklyCount;
        }
        this.users = users;
        this.quicklyChangeCountVisible = false;
      },

      showSelectCoupons() {
        if(this.$refs.deliverCoupons) this.$refs.deliverCoupons.resetSelectCoupons(this.coupons);
        this.couponsVisible = true;
      },
      confirmCoupons() {
        this.coupons = this.$refs.deliverCoupons.confirmResult();
        this.couponsVisible = false;
      },
      deleteCoupon(index) {
        this.$confirm('确认从券包中剔除该优惠券？', '警告', {
          $confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          this.coupons.splice(index, 1);
        })
        .catch(() => {});
      },

      confirmDeliver() {
        if(!this.coupons || this.coupons.length == 0) {
          return this.$message.error(`券包未选中任何优惠券，请检查下哈`)
        }
        if(!this.users || this.users.length == 0) {
          return this.$message.error(`未选中任何派券人员，请检查`)
        }
        let params = {
          user: {},
          coupon: {}
        };
        for(let i = 0; i < this.coupons.length; i++) {
          if(!(/^([1-9][0-9]*)$/.test(this.coupons[i].count))) {
            return this.$message.error(`第${i + 1}个优惠券的数量要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
          }
          if(this.coupons[i].count > this.coupons[i].take_limit) {
            return this.$message.error(`第${i + 1}个优惠券的数量超过了它的限领数哦，请检查下哈`)
          }
          params.coupon[this.coupons[i].code] = this.coupons[i].count;
        }
        for(let i = 0; i < this.users.length; i++) {
          if(!(/^([1-9][0-9]*)$/.test(this.users[i].count))) {
            return this.$message.error(`第${i + 1}个用户的领取量要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
          }
          for(let j = 0; j < this.coupons.length; j++) {
            if(this.users[i].count * this.coupons[j].count > this.coupons[j].take_limit) {
              return this.$message.error(`第${i + 1}个用户的第${j + 1}个优惠券的领取总量超过了它的限领数哦，请检查下哈`)
            }
          }
          params.user[this.users[i].uid] = this.users[i].count;
        }
        this.$confirm(`您将对列表里的${this.users.length}个用户进行派券操作, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          
          this.$post('/admin/coupon/deliver', params, res => {
            if(res.data.fail && !res.data.fail.length) {
              let couponName = {};
              for(let i = 0; i < res.data.couponInfo.length; i++) {
                couponName[res.data.couponInfo[i].code] = res.data.couponInfo[i].name;
              }
              this.couponName = couponName;
              this.tryConcatData(res.data.fail); //拼装数据
            }
          });
        }).catch(() => {});
      },

      tryConcatData(data) {
        let errorData = [], userArray = [];
        let keys = Object.keys(data);
        let vals = Object.values(data);
        for(let i = 0; i < vals.length; i++) {  //优惠券错误数组
          let couponErrInfos = vals[i];
          for(let j = 0; j < couponErrInfos.length; j++) {
            let couponErr = couponErrInfos[j];
            if(userArray.includes(couponErr.userInfo.uid)) {
              let index = userArray.indexOf(couponErr.userInfo.uid);
              errorData[index].errs[keys[i]] = {
                ...this.calcErrInfo(couponErr.res)
              };
            } else {
              let item = {
                uid: couponErr.userInfo.uid,
                name: couponErr.userInfo.name,
                phone: couponErr.userInfo.phone,
                errs: {}
              }
              item.errs[keys[i]] = {
                ...this.calcErrInfo(couponErr.res)
              };
              errorData.push(item);
              userArray.push(couponErr.userInfo.uid);
            }
          }
        }
        this.hasTryDownload = false;
        this.deliverErrorResult = errorData;
        this.deliverErrorResultVisible = true;
      },
      /**
       * @param data <Object> 不是Array {1: '请求出错'}
       * @returns 处理完的一个json数组，key是错误信息， value是这个错误信息总共出现多少次
       */
      calcErrInfo(data) { 
        let result = {}, vals = Object.values(data);
        for(let i = 0; i < vals.length; i++) {
          if(!result[vals[i]]) {
            // 还没有这个错误信息
            result[vals[i]] = 1;
          } else {
            result[vals[i]] += 1;
          }
        }
        return result;
      },

      exportErrorData() {
        let data = this.deliverErrorResult;
        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('订单数超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }
        let excelData = [];
        excelData.push([
          '姓名',
          '手机号码',
          '错误详情'
        ]);
        for(let i = 0; i < data.length; i++) {
          // 汇总错误信息
          let result = data[i];
          let errorCoupon = Object.keys(result.errs);
          let errorInfos = Object.values(result.errs);
          let errorArr = [];
          for(let j = 0; j < errorInfos.length; j++) {
            // 统计每张券的错误信息
            let errorKey = Object.keys(errorInfos[j]);
            let errorInfoArr = [];
            for(let k = 0; k < errorKey.length; k++) {
              // 汇总每张券的每个错误信息
              let info = `${errorKey[k]} ×${errorInfos[j][errorKey[k]]}`;
              errorInfoArr.push(info);
            }
            errorArr.push(`${this.couponName[errorCoupon[j]]}(${errorInfoArr.join('、')})`);  //券名+原因
          }
          result.errorInfo = `${errorArr.join('；')}`;

          // 拼装excel数据
          excelData.push([
            result.name || '',
            result.phone || '',
            result.errorInfo || '不详',
          ]);
        }
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 140},
          {wpx: 600}
        ]

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "派券失败信息列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `派券失败信息列表${time}.xlsx`);
        this.hasTryDownload = true;
      },
      successAndBack() {
        this.deliverErrorResultVisible = false;
        setTimeout(() => {
          localStorage.setItem('shouldRefresh', 'on');
          this.$router.replace('coupons');
        }, 0);
      },
      confirmAndBack() {
        if(this.hasTryDownload) {
          this.deliverErrorResultVisible = false;
          setTimeout(() => {
            localStorage.setItem('shouldRefresh', 'on');
            this.$router.replace('coupons');
          }, 0);
        } else {
          this.$confirm(`存在派券失败信息且似乎您还未下载派券失败信息列表文件, 是否忽略本次派券失败信息并返回列表页?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.deliverErrorResultVisible = false;
            setTimeout(() => {
              localStorage.setItem('shouldRefresh', 'on');
              this.$router.replace('coupons');
            }, 0);
          }).catch(err => {})
        }
        
      },
      confirmAndRefresh() {
        // 重置页面数据
        if(this.hasTryDownload) {
          this.users = [];
          this.coupons = [];
          this.deliverErrorResultVisible = false;
          this.deliverErrorResult = {};
          this.hasTryDownload = false;
        } else {
          this.$confirm(`存在派券失败信息且似乎您还未下载派券失败信息列表文件, 是否忽略本次派券失败信息并清空当前券包及用户列表?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.users = [];
            this.coupons = [];
            this.deliverErrorResultVisible = false;
            this.deliverErrorResult = {};
            this.hasTryDownload = false;
          }).catch(err => {})
        }
      }
      

    }
  }

</script>
<style lang="less" scoped>
.user-area-select {
  display: flex;
  align-items: center;
}
.user-area-wrapper {
  width: 200px;
  height: 300px;
  margin: 0 15px 0 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}
.excel-uploader {
  display: inline-block;
  margin-right: 15px;
}
</style>
