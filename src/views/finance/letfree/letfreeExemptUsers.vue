<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">
          乐小活免签用户列表
          <SloganTip type="danger"></SloganTip>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('letfree/exemptUserCreate')">
            <el-upload id="excel-uploader" class="excel-uploader" style="margin-right: 10px"
              accept=".xls,.xlsx,application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              action="/admin/file/importExcel" ref="importUsers" :data="thumbData" :headers="token"
              :show-file-list="false" :before-upload="excelWatcher" :on-success="excelSuccess" :on-error="uploadError"
              auto-upload>
              <el-button type="primary" title="请确保用户信息无误">导入用户</el-button>
            </el-upload>
            <a style="margin-right: 8px" href="/static/docs/导入乐小活免签用户模版.xlsx" target="blank">
              <el-button type="primary" plain>下载导入模板</el-button>
            </a>
          </template>
          <template v-if="$auths.includes('letfree/exemptUserCreate')">
            <el-button type="primary" @click="showAssignPopup">指定用户</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="80">
        </el-table-column>
        <el-table-column label="姓名" width="100" prop="user_name">
        </el-table-column>
        <el-table-column label="真实姓名" width="100" prop="real_name">
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>
        <!-- <el-table-column label="身份" width="100" prop="vip_name"></el-table-column> -->
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('letfree/exemptUserDelete')">
              <el-button class="error-color" type="text" size="small" @click="delItem(scope.row)">取消免签身份</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>
    <el-dialog title="指定乐小活免签用户" width="800px" :close-on-click-modal="false" :visible.sync="assignVisible">
      <div slot="title" class="el-dialog__title">
        指定乐小活免签用户
        <SloganTip type="danger"></SloganTip>
      </div>
      <Assign :formData="formData"></Assign>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button type="primary" @click="assign">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="导入免签用户结果" width="800px" :close-on-click-modal="false" :visible.sync="assignsVisible">
      <Assigns :users="assignUsers"></Assigns>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignsVisible = false">取 消</el-button>
        <el-button type="primary" @click="tryAssigns">确定指定用户</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Assign from '@/partialviews/finance/letfree/letfreeExemptUser/Assign';
import Assigns from '@/partialviews/finance/letfree/letfreeExemptUser/Assigns';
import SloganTip from '@/components/SloganTip';
export default {
  name: 'letfreeExemptUsers',
  components: {
    Assign,
    Assigns,
    SloganTip
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],

      formData: {},

      assignVisible: false,

      token: {
        token: localStorage.getItem('token')
      },
      thumbData: {
        type: 7
      },
      assignUsers: [],
      assignsVisible: false
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };

      this.$get('/admin/letfree/exemptUserList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    showAssignPopup() {
      this.formData = {
        name: '',
        uid: '',
        userPhone: '',
        realName: ''
      }

      this.assignVisible = true;
    },
    assign() {
      // 指定
      if(!this.formData.uid || this.formData.uid === '') {
        return this.$message.error('请选择用户')
      }
      if(!this.formData.realName || this.formData.realName === '') {
        return this.$message.error('请填写用户真实姓名')
      }
      let params = {
        user_list: [{
          userPhone: this.formData.userPhone,
          realName: this.formData.realName
        }]
      }
      this.$confirm(`是否确定指定乐小活免签用户身份操作`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/letfree/exemptUserCreate', params, res => {
          this.$message.success(`指定乐小活免签用户成功`);
          this.assignVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },


    // 上传excel文件
    excelWatcher(file) {
      if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type != 'application/vnd.ms-excel') {
        this.$refs.importUsers.clearFiles();
        this.$message.error('只能上传标准的.xlsx或者.xls文件哦');
        return false;
      }

      this.$loading('正在导入免签用户数据，请不要进行其他任何操作');
      return;
    },
    excelSuccess(res, file) {
      this.$loading().close();
      // 因为是复用了http请求，所以要有状态值判断
      if(res && res.error_code == 0) {

        this.assignUsers = res.data || [];
        if(this.assignUsers.length == 0) {
          this.$message.error('没有查询到有效用户信息');
        } else {
          this.assignsVisible = true;
        }
        this.$refs.importUsers.clearFiles();
      } else {
        this.$message.error(res.msg || '上传文件失败，请检查');
        this.$refs.importUsers.clearFiles();
      }
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$loading().close();
      this.$message.error('您未能正确上传excel文件，请选择符合 模板要求 的标准excel文件上传或检查您的网络哦。 请留意用户信息是否正确无误');
    },

    tryAssigns() {
      let params = {
        user_list: this.assignUsers || []
      }
      if(params.user_list.length == 0) return this.$message.error('无有效用户，请检查')
      this.$confirm(`是否确定对这些用户进行指定乐小活免签用户身份操作`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/letfree/exemptUserCreate', params, res => {
          this.$message.success(`指定乐小活免签用户成功`);
          this.assignsVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },


    delItem(row) {
      // 指定升级
      let params = {
        uid: row.uid
      }
      this.$confirm('是否取消该用户的乐小活免签用户身份', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/letfree/exemptUserDelete', params, res => {
          this.$message.success('取消乐小活免签用户身份成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },


  }
};
</script>

<style lang="less" scoped>
.excel-uploader {
  display: inline-block;
}
</style>
