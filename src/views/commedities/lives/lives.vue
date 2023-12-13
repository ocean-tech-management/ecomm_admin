<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入直播间名、主播名" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          
          <el-form-item label="显示状态" prop="show_status">
            <el-select placeholder="不限" name="show_status" v-model="queryForm.show_status">
              <el-option label="不限" value></el-option>
              <el-option label="正常显示" :value="1"></el-option>
              <el-option label="不显示" :value="2"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">直播间列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('live/syncRoomList')">
            <el-button type="primary" @click="syncRoomList">同步直播间</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="房间号" prop="roomid" width="70">
        </el-table-column>
        <el-table-column label="房间名" prop="name" width="180"></el-table-column>
        <el-table-column label="主播名称" prop="anchor_name" width="100">
        </el-table-column>
        <el-table-column label="状态" width="100" prop="show_status">
          <template slot-scope="scope">
            {{showStatusTexts[scope.row.show_status]}}
          </template>
        </el-table-column>
        <el-table-column label="直播计划时间" width="170">
          <template slot-scope="scope">
            {{scope.row.start_time}} ~ {{scope.row.end_time}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('live/roomShowStatus')">
              <el-button
                :class="{'warning-color': scope.row.show_status == 1, 'success-color': scope.row.show_status == 2}"
                type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.show_status == 1 ? '隐藏' : '显示'}}
              </el-button>
            </template>
            <template v-if="$auths.includes('live/shareCode')">
              <el-button type="text" size="default" @click="getCode(scope.row)">获取二维码</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>


    <el-dialog title="二维码，请自行复制/保存" width="450px" :visible.sync="qrInfoVisible">
      <div>
        <div style="text-align: center">因微信机制，请复制下方链接在微信中访问、查看/保存</div>
        <div style="margin-top: 10px; text-align: center; font-size: 13px; color: #999">{{qrInfo.image}}</div>
        <div style="margin-top: 20px; font-size: 20px; text-align: center">{{qrInfo.name}}</div>
      </div>
    </el-dialog>

  </div>
</template>

<script>

  export default {
    name: 'tags',
    data() {
      return {
        currentPage: 1,
        count: 1,
        queryForm: {
          keyword: '',
          show_status: ''
        },
        filter: {
          keyword: '',
          show_status: ''
        },
        showStatusTexts: {
          [1]: '正常显示',
          [2]: '已隐藏'
        },
        dataList: [],
        formData: {},

        qrInfo: {},
        qrInfoVisible: false
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
          keyword: '',
          show_status: ''
        };
        this.currentPage = 1;
        this.getList();
      },
      //查询
      queryInfo() {
        this.currentPage = 1;
        this.filter = {
          keyword: this.queryForm.keyword,
          show_status: this.queryForm.show_status
        }
        this.getList();
      },

      //获取列表
      getList() {
        let queryVal = {
          page: this.currentPage,
          keyword: this.filter.keyword,
          show_status: this.filter.show_status
        };

        this.$get('/admin/live/roomList', queryVal, res => {
          let dataList = res.data.list || [];

          this.dataList = dataList;
          this.count = res.data.pageTotal;
        });
      },

      updateParentCategory(val) {
        if (!val || val === '') {
          this.subCategories = [];
          this.queryForm.category_code = '';
        } else {
          this.getSubCategories(val);
        }
      },

      // 分页
      handleCurrentChange(value) {
        this.currentPage = value;
        this.getList();
      },

      syncRoomList() {
        this.$get('/admin/live/syncRoomList', null, res => {
          this.$message.success('同步直播间成功');
          this.reloadPage();
        });
      },

      toggleItem(row) {
        let ctrlName = row.show_status == 1 ? '隐藏' : '显示';

        let params = {
          roomid: row.roomid,
          show_status: row.show_status
        }

        this.$post('/admin/live/roomShowStatus', params, res => {
          this.$message.success(`${ctrlName}成功`);
          this.reloadPage();
        });

      },
      getCode(row) {
        let params = {
          room_id: row.roomid,
          params: ''
        }
        this.$post(
          "/admin/live/shareCode", params,
          (res) => {
            this.qrInfo = {
              image: res.data.cdnUrl,
              name: row.name
            }
            this.qrInfoVisible = true;
          }
        );
      }
    }
  };

</script>
<style lang="less" scoped>
  .live-img {
    width: 120px;
  }

</style>
