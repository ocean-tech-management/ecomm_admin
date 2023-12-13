<template>
  <div class="subpage-content">
    <div class="default-container">
      <!--      <div class="page-ctrl">-->
      <!--        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">-->
      <!--          <el-form-item label="关键词" prop="keyword">-->
      <!--            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>-->
      <!--          </el-form-item>-->

      <!--          <el-form-item label="类型" prop="transfer_type">-->
      <!--            <el-select placeholder="不限" name="transfer_type" v-model="queryForm.transfer_type">-->
      <!--              <el-option label="不限" value></el-option>-->
      <!--              <el-option label="新增" :value="1"></el-option>-->
      <!--              <el-option label="减少" :value="2"></el-option>-->
      <!--            </el-select>-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="创建时间" prop="createDate">-->
      <!--            <el-date-picker-->
      <!--              v-model="createDate"-->
      <!--              type="datetimerange"-->
      <!--              :picker-options="pickerOptions"-->
      <!--              range-separator="至"-->
      <!--              start-placeholder="开始日期"-->
      <!--              end-placeholder="结束日期"-->
      <!--              format="yyyy-MM-dd HH:mm:ss"-->
      <!--              value-format="yyyy-MM-dd HH:mm:ss"-->
      <!--              :clearable="false"-->
      <!--              align="right"-->
      <!--            ></el-date-picker>-->
      <!--          </el-form-item>-->
      <!--          <el-form-item>-->
      <!--            <el-button type="primary" @click="queryInfo">查询</el-button>-->
      <!--            <el-button @click="resetQuery('queryForm')">重置</el-button>-->
      <!--          </el-form-item>-->
      <!--        </el-form>-->
      <!--      </div>-->
      <template v-if="$auths.includes('crowdFunding/createFreezeCustom')">
        <div class="table-ctrls">
          <div class="table-title">
            自定义集品券冻结金额列表
            <SloganTip type="danger"></SloganTip>
          </div>
          <div class="table-ctrl">
            <el-button type="primary" @click="showAdd">操作</el-button>
          </div>
        </div>
      </template>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.user_avatarUrl" />
          </template>
        </el-table-column>
        <el-table-column label="用户名" width="120" prop="user_name"></el-table-column>
        <el-table-column label="手机号码" width="140" prop="user_phone"></el-table-column>
        <el-table-column label="金额" width="120" prop="price"></el-table-column>
        <el-table-column label="操作类型" width="100" align="center">
          <template slot-scope="scope">
            {{ withdrawalsType[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="350" prop="remark"></el-table-column>
        <el-table-column label="状态" width="100" prop="status" align="center">
          <template slot-scope="scope">
            <span :class="{ 'error-color': scope.row.status != 1 }">{{ statusTexts[scope.row.status] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="auto" prop="create_time"></el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>
    <el-dialog title="操作" width="640px" :close-on-click-modal="false" :visible.sync="addVisible">
      <div slot="title" class="el-dialog__title">
        操作
        <SloganTip type="danger"></SloganTip>
      </div>
      <el-alert :closable="false" type="error" description="操作数据后将无法修改，请谨慎填写" style="margin-bottom: 20px;"></el-alert>
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Add from '@/partialviews/crowdFunding/achievementWithdrawals/Add';
import SloganTip from '@/components/SloganTip';
export default {
  name: 'achievementFreezeCustom',
  components: { Add, SloganTip },
  data() {
    return {
      currentPage: 1,
      count: 1,
      dataList: [],

      withdrawalsType: {
        [1]: '新增',
        [2]: '减少'
      },
      statusTexts: {
        [1]: '正常',
        [2]: '禁用',
        [-1]: '删除'
      },

      // 新增业绩弹窗
      addVisible: false,
      formData: {}
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 获取提现列表
    getList() {
      let queryVal = {
        page: this.currentPage
      };
      this.$get('/admin/crowdFunding/freezeCustomList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    // 弹窗-新增业绩
    showAdd() {
      this.formData = {
        user_name: '',
        price: '',
        remark: '',
      };
      this.$refs.add && this.$refs.add.resetQuery('queryForm')
      this.addVisible = true;
    },
    // 弹窗-新增业绩-确认
    addItem() {
      let params = {
        uid: this.formData.uid,
        price: this.formData.price,
        remark: this.formData.remark,
      }
      const valid = (e) => e == undefined || e == null || e == ''
      if (valid(params.uid) || valid(params.price)) return this.$message.error('请填写、勾选完所有信息哦');

      //新增业绩数据后将无法修改，请谨慎填写
      this.$confirm(`操作数据后将无法修改，请谨慎填写, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/crowdFunding/createFreezeCustom', params, res => {
          this.addVisible = false;
          this.$message.success('新增成功');
          this.currentPage = 1
          this.getList();
        });
      }).catch(() => {})
    }
  }
}
</script>
