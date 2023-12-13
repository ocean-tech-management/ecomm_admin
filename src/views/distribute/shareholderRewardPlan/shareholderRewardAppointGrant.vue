<template>
  <div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">指定用户发放股东奖</div>
        </div>
        <el-form :model="planData" label-width="150px">
          <el-form-item label="计划名">
            <div class="form-item-content">{{planData.plan_name}}</div>
          </el-form-item>
          <el-form-item label="奖池总金额">
            <div class="form-item-content error-color">{{planData.total_reward_price}}</div>
            <!-- <el-input style="width: 300px" type="number" auto-complete="off" placeholder="奖池总金额，大于0的正整数" v-model="planData.total_reward_price"></el-input>
            <div class="form-tips">备注：需大于0，最多保留两位小数</div> -->
          </el-form-item>
          <el-form-item label="用户模板">
            
            下载<a href="/static/docs/导入用户模板.xlsx" target="blank">导入用户模板</a>
          </el-form-item>
        </el-form>
      </div>
      
      <div v-for="(item, index) in rules" class="default-container" style="margin-top: 15px" :key="index">
        <div class="table-ctrls">
          <div class="table-title">{{item.name}} 用户池</div>
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
              <el-button type="plain" @click="ctrlIndex = index">导入用户列表</el-button>
            </el-upload>
            <el-button type="primary" @click="showSelectUsers(index)">点击选择用户</el-button>
          </div>
        </div>

        <el-table :data="item.users">
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
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button class="error-color" type="text" size="small" @click="deleteUser(scope.$index, index)">剔除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <el-button style="margin-top: 25px" type="primary" @click="confirmGrant">确认派发</el-button>
      
    </div>

    <el-dialog title="选择用户" width="800px" :close-on-click-modal="false" :visible.sync="usersVisible">
      <SelectUsers ref="SelectUsers"></SelectUsers>
      <div slot="footer" class="dialog-footer">
        <el-button @click="usersVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmUsers">确 定</el-button>
      </div>
    </el-dialog>
   
    <el-dialog title="导入用户有问题" width="800px" :close-on-click-modal="false" :show-close="false" :visible.sync="importErrorVisible">
      <div>
        <div style="font-size: 28px">
          存在 <span class="warning-color">导入异常</span> 情况
        </div>
        <div style="margin-top: 20px">
          本次导入数据共有{{errorsNum || 0}}条用户有问题，具体可点击下方的 “下载错误汇总” 按钮下载、查看相关信息
        </div>
        <div style="margin-top: 10px">
          <el-button type="text" size="small" @click="exportUsersErrors">下载错误汇总</el-button>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="importErrorVisible = false">确 定</el-button>
      </div>
    </el-dialog>


  </div>
</template>
<script>
  import XLSX from 'xlsx';
  import moment from 'moment';  

  import SelectUsers from '@/partialviews/distribute/shareholderRewardPlan/SelectUsers';
  export default {
    name: 'shareholderRewardAppointGrant',
    components: {
      SelectUsers
    },
    data() {
      return {
        plan_sn: '',
        planData: {},
        
        rules: [],

        users: [],
        coupons: [],
        
        token: {
          token: localStorage.getItem('token')
        },
        thumbData: null,

        ctrlIndex: 0,
        validData: [],
        errors: {},
        errorsNum: 0,
        importErrorVisible: false,

        usersVisible: false,
        couponsVisible: false,

        deliverErrorResultVisible: false,  //派券结果
        deliverErrorResult: {},
        couponName: {},
        hasTryDownload: false   //是不是点过下载
      }
    },
    mounted() {
      this.plan_sn = this.$route.query.plan_sn;
      if(!this.plan_sn) {
        this.$message.error('股东奖计划不存在或已失效，正在返回');
        setTimeout(() => {
          window.location.replace('/#/shareholderRewardPlans');
        }, 2000)
        return;
      }
      if(!this.$auths.includes('shareholderRewardRule/list')) {
        this.$message.warning('您缺少查看股东奖规则的权限，无法正常指定用户群体发放，请联系管理员为您添加');
        return this.$router.replace('index');
      }
      if(!this.$auths.includes('user/list')) {
        this.$message.warning('您缺少查看用户列表的权限，无法正常添加派券，请联系管理员为您添加');
        return this.$router.replace('coupons');
      }
      this.getRules();
      this.getData();
    },
    methods: {
      getRules() {
        let params = {
          plan_sn: this.plan_sn
        };

        this.$get('/admin/shareholderRewardRule/list', params, res => {
          let rules = res.data;
          for(let i = 0; i < rules.length; i++) {
            rules[i].users = [];
          }
          this.rules = rules;
        });
      },
      getData() {
        let params = {
          plan_sn: this.plan_sn
        }
        this.$get('/admin/shareholderRewardPlan/info', params, res => {
          let data = res.data;
          
          this.planData = {
            plan_sn: data.plan_sn,
            plan_name: data.plan_name,
            start_type: data.start_type,  //当前强制1
            total_reward_price: data.total_reward_price,
            remark: data.remark
          }
          
        });
      },

        
      // 上传excel文件，新增会员
      excelWatcher(file) {
        if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type != 'application/vnd.ms-excel') {
          this.$refs.importUsers[this.ctrlIndex].clearFiles();
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
          this.$refs.importUsers[this.ctrlIndex].clearFiles();

          let data = res.data;
          if(!data || data.length == 0) {
            return this.$message.error('查不到有效数据');
          }

          let validData = [];
          for(let i = 0; i < data.length; i++) {
            validData.push({
              userName: data[i].userName, //表格数据
              userPhone: data[i].userPhone, //表格数据
              ...data[i].info || {} //查询到的数据
            });
          }
          this.validData = validData;

          this.validErrorUsers(validData, () => {
            let users = [];
            for(let i = 0; i < validData.length; i++) {
              let item = {
                uid:  validData[i].uid,
                avatarUrl:  validData[i].avatarUrl,
                phone:  validData[i].phone,
                name:  validData[i].name
              }
              users.push(item);
            }
            this.rules[this.ctrlIndex].users.push(...users);
            this.$message.success(`上传文件成功，共在 ${this.rules[this.ctrlIndex].name} 池子中新增${users.length}个用户`);
            
          })

          
        } else {
          this.$message.error(res.msg || '上传文件失败，请检查');
          this.$refs.importUsers[this.ctrlIndex].clearFiles();
        }
        this.$forceUpdate();
      },
      uploadError(err) {
        this.$loading().close();
        this.$message.error('您未能正确上传excel文件，请选择符合 模板要求 的标准excel文件上传或检查您的网络哦。 请留意会员等级文案是否正确无误');
      },

      showSelectUsers(index) {
        // 因为是多个池子，需要谨慎操作
        this.ctrlIndex = index;

        let userArr = [];
        for(let i = 0; i < this.rules.length; i++) {
          if(i == index) continue;  //是选中的池子，不需要作为排除项
          if(this.rules[i] && this.rules[i].users) {
            let users = this.rules[i].users;
            for(let j = 0; j < users.length; j++) {
              userArr.push(users[j].uid);
            }
          }
        }

        if(this.$refs.SelectUsers) {
          this.$refs.SelectUsers.resetSelectUsers(this.rules[index].users, userArr);
          this.usersVisible = true;
        } else {
          this.usersVisible = true;
          setTimeout(() => {
            this.$nextTick(() => {
              this.$refs.SelectUsers.resetSelectUsers(this.rules[index].users, userArr);
            })
          }, 50)
        }
      },
      confirmUsers() {
        let users = this.$refs.SelectUsers.confirmResult();
        this.rules[this.ctrlIndex].users = users;
        this.usersVisible = false;
      },
      deleteUser(index, ruleIndex) {
        this.rules[ruleIndex].users.splice(index, 1);
      },

      // 涉及到钱，发出去收不回来，所以导入有问题就肯定得拦住
      validErrorUsers(data, handler) {
        let errors = {};
        let userArr = [];
        for(let i = 0; i < this.rules.length; i++) {
          if(this.rules[i] && this.rules[i].users) {
            let users = this.rules[i].users;
            let uids = []
            for(let j = 0; j < users.length; j++) {
              uids.push(users[j].uid);
            }
            userArr.push(uids);
          }
        }
        
        let addUsers = [];
        for(let i = 0; i < data.length; i++) {
          if(!data[i].uid) {
            errors[i] = `用户不存在；`;
            continue;
          }
          if(addUsers.includes(data[i].uid)) {
            errors[i] = `用户在本批导入数据中重复；`
            continue;
          }
          for(let j = 0; j < userArr.length; j++) {
            if(userArr[j].includes(data[i].uid)) {
              errors[i] = `用户已在 ${this.rules[j].name} 中存在；`
              break;
            }
          }
          addUsers.push(data[i].uid);
        }
        this.errors = errors;
        let errorsNum = Object.keys(this.errors);
        this.errorsNum = errorsNum.length || 0;
        if(this.errorsNum && this.errorsNum > 0) {
          // 有错误
          this.importErrorVisible = true;
        } else {
          if(handler && typeof handler == 'function') handler();
        }
      },
      exportUsersErrors() {
        
        let errorsIndex = Object.keys(this.errors);
        let errorsValue = Object.values(this.errors);
        let data = [];
        for(let i = 0; i < errorsIndex.length; i++) {
          let item = {
            row: parseInt(errorsIndex[i]) + 2,  //索引从0开始，行数从2开始（第1行为表头）
            userName: this.validData[errorsIndex[i]].userName,
            userPhone: this.validData[errorsIndex[i]].userPhone,
            errorInfo: errorsValue[i]
          }
          data.push(item);
        }
        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('错误数超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成');
        }
        let excelData = [];
        excelData.push([
          '出错行',
          '姓名',
          '手机号码',
          '错误信息'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];
          // 拼装excel数据
          excelData.push([
            item.row || '',
            item.userName || '',
            item.userPhone || '',
            item.errorInfo || '不详',
          ]);
        }
        console.log(excelData);
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 100},
          {wpx: 140},
          {wpx: 140},
          {wpx: 600}
        ]

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "导入用户出错信息列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `导入用户出错信息列表${time}.xlsx`);
      },

      

      

      confirmGrant() {
        let selectUserList = [], userLen = 0;
        for(let i = 0; i < this.rules.length; i++) {
          let uids = [];
          if(this.rules[i].users) {
            userLen += this.rules[i].users.length || 0;
            for(let j = 0; j < this.rules[i].users.length; j++) {
              uids.push(this.rules[i].users[j].uid);
            }
          }
          selectUserList.push({
            level: this.rules[i].level,
            uid: uids
          })
        }
        if(userLen == 0) {
          return this.$message.error(`未选中任何人员，请检查`)
        }
        let params = {
          plan_sn: this.plan_sn,
          selectUser: true, //指定用户发放
          selectUserList: selectUserList
        };
        this.$confirm(`您将对用户池里的总共${userLen}个用户进行派发股东奖操作, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          
          this.$post('/admin/shareholderReward/grant', params, res => {
            this.$message.success('指定用户发放成功');
            localStorage.setItem('shouldRefresh', 'on');
            this.$router.replace('shareholderRewardPlans');
          });
        }).catch(() => {});
      },


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
