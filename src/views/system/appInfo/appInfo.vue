<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="requestQuery()"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="requestQuery()">查询</el-button>
            <el-button @click="requestQuery(true)">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">APP管理列表
          <div v-if="Object.keys(lastAppVersionVO).length > 0" class="error-color dialog-title">
            <div style="padding-right: 10px;">当前发布版本名称: {{ lastAppVersionVO.version }}</div>
            <div>当前发布版本号: {{ lastAppVersionVO.version_code }}</div>
          </div>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('appVersion/create')">
            <el-button type="primary" @click="addAppVersion">新增APP版本</el-button>
          </template>
          <el-button type="primary" @click="addApkPackage">上传APK</el-button>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="版本名称" width="120" prop="version"></el-table-column>
        <el-table-column label="版本号" width="100" prop="version_code"></el-table-column>
        <el-table-column label="标题" width="120" prop="title"></el-table-column>
        <el-table-column label="版本描述" width="180" prop="desc"></el-table-column>
        <el-table-column label="包地址" width="180" prop="package_url"></el-table-column>
        <el-table-column label="是否强制更新" width="120">
          <template slot-scope="{ row }">
            {{ row.force_update == 1 ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120" align="center">
          <template slot-scope="{ row }">
            {{ typeTexts[row.type] }}
          </template>
        </el-table-column>
        <el-table-column label="发布时间" prop="release_time" width="150"></el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作" fixed="right" min-width="140">
          <template slot-scope="{ row }">
            <template v-if="$auths.includes('appVersion/update') && row.type != 1 && row.isRelease > 0">
              <el-button type="text" size="small" @click="updateApp(row)">更新</el-button>
            </template>
            <template v-if="$auths.includes('appVersion/release') && row.type != 1 && row.isRelease > 0">
              <el-button type="text" size="small" @click="releaseApp(row)">发布</el-button>
            </template>
            <template v-if="$auths.includes('appVersion/delete') && row.type != 1 && row.isRelease > 0">
              <el-button class="error-color" type="text" size="small" @click="deleteApp(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>
    <el-dialog :title="appVersionDialogVO.title[appVersionDialogVO.type]" width="640px" :close-on-click-modal="false"
      :visible.sync="appVersionDialogVO.visible">
      <div>
        <el-form :model="formData" label-width="100px">
          <div v-if="Object.keys(lastAppVersionVO).length > 0" class="error-color dialog-title">
            <div style="padding-right: 10px;">最新发布版本名称: {{ lastAppVersionVO.version }}</div>
            <div>最新发布版本号: {{ lastAppVersionVO.version_code }}</div>
          </div>
          <template v-if="appVersionDialogVO.type == 'add'">
            <el-form-item label="资源包名称">
              <el-input v-model="formData.fileName" style="width: 250px;" auto-complete="off" placeholder="请先输入名称再上传"
                @blur="onBlurTitle"></el-input>
            </el-form-item>
            <el-form-item label="wgt包">
              <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="*" action="/admin/file/app" ref="wgt"
                :data="thumbData" :headers="token" :show-file-list="false" :before-upload="uploadWatcher"
                :on-success="uploadSuccess" :on-error="uploadError" auto-upload>
                <el-button type="primary">点击上传</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item v-if="formData.packageUploadUrl" label="资源包地址">
              <el-input v-model="formData.packageUploadUrl" disabled auto-complete="off" placeholder=""
                style="width: 350px;">
                <el-button slot="append" @click="handleCopy">复制</el-button>
              </el-input>
            </el-form-item>
            <hr style="margin-bottom: 30px;" />
          </template>
          <el-form-item label="版本名称">
            <el-input v-model="formData.version" :disabled="appVersionDialogVO.type == 'edit'" style="width: 350px;"
              auto-complete="off" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="版本号">
            <el-input v-model="formData.version_code" :disabled="appVersionDialogVO.type == 'edit'" style="width: 350px;"
              auto-complete="off" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="包地址">
            <el-input v-model="formData.package_url" style="width: 350px;" auto-complete="off"
              placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="formData.title" style="width: 350px;" auto-complete="off" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="更新内容描述">
            <el-input v-model="formData.desc" style="width: 350px;" auto-complete="off" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="formData.type" placeholder="请选择" name="type" style="width: 350px;">
              <el-option label="灰度测试版本" :value="2"></el-option>
              <el-option label="普通历史版本" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否强制更新">
            <el-select v-model="formData.force_update" placeholder="请选择" name="type" style="width: 350px;">
              <el-option label="是" :value="1"></el-option>
              <el-option label="否" :value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="appVersionDialogVO.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveAppVersion">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="更新APK包" width="640px" :close-on-click-modal="false" :visible.sync="showAddApkVisible">
      <div>
        <el-form :model="formData" label-width="100px">
          <el-form-item label="apk名称">
            <el-input v-model="formData.fileName" style="width: 250px;" auto-complete="off" placeholder="请先输入名称再上传"
              @blur="onBlurTitle"></el-input>
          </el-form-item>
          <el-form-item label="apk包">
            <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="*" action="/admin/file/app" ref="wgt"
              :data="thumbData" :headers="token" :show-file-list="false" :before-upload="uploadWatcher"
              :on-success="uploadSuccess" :on-error="uploadError" auto-upload>
              <el-button type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item v-if="formData.packageUploadUrl" label="apk包地址">
            <el-input v-model="formData.packageUploadUrl" disabled auto-complete="off" placeholder=""
              style="width: 350px;">
              <el-button slot="append" @click="handleCopy">复制</el-button>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddApkVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'appInfo',
  components: { },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
      },
      dataList: [],
      lastAppVersionVO: {}, // 最新的app版本数据

      formData: {},

      typeTexts: {
        [1]: '线上版本',
        [2]: '灰度测试版本',
        [3]: '普通历史版本',
      },

      appVersionDialogVO: {
        title: {
          add: '新增APP版本',
          edit: '更新APP版本'
        },
        type: 'add',
        visible: false
      },
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      showAddApkVisible: false,
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    /**
     * 对比版本号，如需要，请自行修改判断规则
     * 支持比对	("3.0.0.0.0.1.0.1", "3.0.0.0.0.1")	("3.0.0.1", "3.0")	("3.1.1", "3.1.1.1") 之类的
     * @param {Object} v1
     * @param {Object} v2
     * v1 > v2 return 1
     * v1 < v2 return -1
     * v1 == v2 return 0
     */
    compare(v1 = '0', v2 = '0') {
      v1 = String(v1).split('.')
      v2 = String(v2).split('.')
      const minVersionLens = Math.min(v1.length, v2.length);

      let result = 0;
      for (let i = 0; i < minVersionLens; i++) {
        const curV1 = Number(v1[i])
        const curV2 = Number(v2[i])

        if (curV1 > curV2) {
          result = 1
          break;
        } else if (curV1 < curV2) {
          result = -1
          break;
        }
      }

      if (result === 0 && (v1.length !== v2.length)) {
        const v1BiggerThenv2 = v1.length > v2.length;
        const maxLensVersion = v1BiggerThenv2 ? v1 : v2;
        for (let i = minVersionLens; i < maxLensVersion.length; i++) {
          const curVersion = Number(maxLensVersion[i])
          if (curVersion > 0) {
            v1BiggerThenv2 ? result = 1 : result = -1
            break;
          }
        }
      }
      return result;
    },
    //重置查询条件
    requestQuery(isReset = false) {
      if (isReset) {
        this.queryForm = {
          keyword: ''
        }
      }
      this.currentPage = 1;
      this.getList();
    },

    //获取用户
    getList() {
      let params = {
        page: this.currentPage,
        keyword: this.queryForm.keyword,
      };

      this.$get('/admin/appVersion/list', params, res => {
        this.dataList = res.data.list || [];
        if (this.dataList.length > 0) {
          const onlineVO = this.dataList.find(e => e.type == 1)
          if (onlineVO) this.lastAppVersionVO = onlineVO;
          if (Object.keys(this.lastAppVersionVO).length > 0) {
            this.dataList.forEach(e => {
              if (e.type != 1) e.isRelease = this.compare(e.version, this.lastAppVersionVO.version);
            })
          }
        }
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    /**
     * 发布app版本
     * @param {*} row
     */
    releaseApp(row) {
      this.$confirm(`是否发布版本：${row.version}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/appVersion/release', { v_sn: row.v_sn }, res => {
          this.$message.success('发布成功');
          this.getList();
        });
      }).catch(() => {});
    },
    /**
     * 删除app版本
     * @param {*} row
     */
    deleteApp(row) {
      this.$confirm(`是否删除版本：${row.version}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/appVersion/delete', { v_sn: row.v_sn }, res => {
          this.$message.success('删除成功');
          this.getList();
        });
      }).catch(() => {});
    },
    /**
     * 上传apk
     */
    addApkPackage() {
      this.formData = {
        fileName: '',
        packageUploadUrl: '',
      }
      this.showAddApkVisible = true;
    },
    /**
     * 创建app版本
     */
    addAppVersion() {
      this.formData = {
        fileName: '',
        packageUploadUrl: '',
        title: '',
        version: '',
        type: '',
        desc: '',
        package_url: '',
        gray_user: '',
        version_code: '',
        force_update: 1
      }
      this.appVersionDialogVO.type = 'add';
      this.appVersionDialogVO.visible = true;
    },
    /**
     * 更新app版本
     * @param {*} row
     */
    updateApp(row) {
      this.formData = {
        title: row.title,
        version: row.version,
        type: row.type,
        desc: row.desc,
        package_url: row.package_url,
        gray_user: row.gray_user,
        version_code: row.version_code,
        force_update: row.force_update || 1
      }
      this.appVersionDialogVO.type = 'edit';
      this.appVersionDialogVO.visible = true;
    },
    /**
     * 保存app版本
     */
    saveAppVersion() {
      const params = JSON.parse(JSON.stringify(this.formData));
      delete params.gray_user;
      delete params.fileName;
      delete params.packageUploadUrl;
      for (const values of Object.values(params)) {
        if(values == undefined || values == null || values === '') {
          return this.$message.error('请填写完所有信息哦');
        }
      }
      params.gray_user = this.formData.gray_user;
      const url = this.appVersionDialogVO.type == 'edit' ? '/admin/appVersion/update' : '/admin/appVersion/create';
      this.$post(url, params, () => {
        const text = this.appVersionDialogVO.type == 'edit' ? '更新成功' : '新增成功';
        this.$message.success(text);
        this.getList();
        this.appVersionDialogVO.visible = false;
      })
    },
    /**
     * 复制
     */
    handleCopy() {
      this.$copyText(this.formData.packageUploadUrl).then(
        e => {
          this.$message.success("复制成功");
        },
        function(e) {
          this.$message.warning("复制失败, 请手动复制");
          console.log(e);
        }
      );
    },
    /**
     * 输入资源包名监听
     */
    onBlurTitle() {
      this.thumbData = {
        file_name: this.formData.fileName
      }
    },
    /**
     * 上传监听
     */
    uploadWatcher() {
      this.$loading && this.$loading().close && this.$loading().close();
      if (!this.thumbData.file_name) {
        this.$refs.wgt.clearFiles();
        this.$message.error('请输入资源包名称');
        return false;
      }
      this.$loading({
        text: "导入中"
      });
    },
    uploadSuccess(res, file) {
      this.$loading && this.$loading().close && this.$loading().close();
      this.formData.packageUploadUrl = res.data;
      this.formData.package_url = res.data;
      this.$refs.wgt.clearFiles();
      this.$forceUpdate();
      if (res && !res.error_code)this.$message.success('上传成功');
    },
    uploadError(err) {
      this.$loading && this.$loading().close && this.$loading().close();
      this.$message.error('您未能正确上传资源包，请选择wgt格式文件上传或检查您的网络哦');
    },
  }
};
</script>
<style scoped>
.table-title {
  display: flex;
  align-items: center;

  .dialog-title {
    padding: 0 0 0 20px !important;
  }
}

.dialog-title {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  font-size: 16px;
}
</style>