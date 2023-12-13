<template>
  <div>
    <el-form ref="editForm" :model="formData" label-width="100px">
      <el-form-item label="名称" prop="title">
        <el-input style="max-width: 450px" v-model="formData.title" placeholder="请输入岗位名称"></el-input>
      </el-form-item>
      <el-form-item label="权限数据">
        <div v-for="(item, index) in auths" class="rule-list" :key="item.id">
          <div class="rule-list-title">

            <el-checkbox-group v-model="formData.modules">
              <el-checkbox
                class="rule-checkbox"
                :label="item.id"
                @change="handleChangeModule($event, index)"
              >
                <span class="checkbox-label">{{item.title}}</span>
              </el-checkbox>
            </el-checkbox-group>

          </div>
          <div v-if="item.pages && item.pages.length > 0" class="rule">
            <div v-for="(page, pageIndex) in item.pages" class="page-list" :key="page.id">
              <div class="page-list-title">

                <el-checkbox-group v-model="formData.pages[item.id]">
                  <el-checkbox
                    :label="page.id"
                    @change="handleChangePage($event, index, pageIndex, item.id)"
                  >
                    <span class="checkbox-label">{{page.title}}</span>
                  </el-checkbox>
                </el-checkbox-group>

              </div>
              <div v-if="page.permission && page.permission.length > 0" class="permission-list">
                <el-checkbox-group v-model="formData.permissions[page.id]">
                  <el-checkbox
                    v-for="(permission, permissionIndex) in page.permission"
                    :label="permission.id"
                    @change="handleChangePermission($event, index, pageIndex, permissionIndex, item.id, page.id)"
                    :key="permission.id"
                  >{{permission.title}}</el-checkbox>
                </el-checkbox-group>

              </div>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'EditAdminGroup',
  data() {
    return {
      auths: [],
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getAuths();
  },
  methods: {
    getAuths() {
      let params = {
        keyword: '',
        searType: 1,
      };

      this.$get('/admin/auth/ruleList', params, (res) => {
        let auths = res.data;
        this.resetParams(auths);
      });
    },
    // 重置渲染参数
    resetParams(authList) {
      let auths = authList || this.auths;
      let pages = {},
        permissions = {};
      for (let i = 0; i < auths.length; i++) {
        pages[auths[i].id] = [];
        if(!auths[i].pages || auths[i].pages.length == 0) continue;
        for (let j = 0; j < auths[i].pages.length; j++) {
          permissions[auths[i].pages[j].id] = [];
        }
      }

      // 编辑时多一步渲染回岗位拥有权限的步骤
      let pageKeys = Object.keys(this.formData.initPages);
      let pageValues = Object.values(this.formData.initPages);
      for(let i = 0; i < pageKeys.length; i++) {
        pages[pageKeys[i]] = pageValues[i];
      }
      let permissionKeys = Object.keys(this.formData.initPermissions);
      let permissionValues = Object.values(this.formData.initPermissions);
      for(let i = 0; i < permissionKeys.length; i++) {
        permissions[permissionKeys[i]] = permissionValues[i];
      }

      this.formData.modules = this.formData.initModules.slice(0);
      this.formData.pages = pages;
      this.formData.permissions = permissions;
      this.auths = auths;
      this.$forceUpdate();
    },
    // 模块的选中态切换
    handleChangeModule(val, index) {
      let item = this.auths[index];
      if (val) {
        // 选中
        if (!this.formData.modules.includes(item.id)) {
          this.formData.modules.push(item.id); //兼容，显示看起来不被选中时选中它
        }

        // 遍历子项，筛选、格式化、赋值给对应的字段
        let pages = [];
        if (!item.pages || item.pages.length == 0) {
          this.formData.pages[item.id] = [];
          return this.$forceUpdate;
        }
        for (let i = 0; i < item.pages.length; i++) {
          pages.push(item.pages[i].id);
          let permissions = [];
          if (!item.pages[i].permission || item.pages[i].permission.length == 0) {
            this.formData.permissions[item.pages[i].id] = [];
            continue;
          }
          for (let j = 0; j < item.pages[i].permission.length; j++) {
            permissions.push(item.pages[i].permission[j].id);
          }
          this.formData.permissions[item.pages[i].id] = permissions;
        }
        this.formData.pages[item.id] = pages;
      } else {
        if (this.formData.modules.includes(item.id)) {
          this.formData.modules.splice(this.formData.modules.indexOf(item.id),1); //兼容，显示看起来被选中时移除选中状态
        }
          
        // 清空选中的子项
        this.formData.pages[item.id] = [];
        for (let i = 0; i < item.pages.length; i++) {
          this.formData.permissions[item.pages[i].id] = [];
        }
      }
      this.$forceUpdate();
    },
    // 页面级别的选中态切换
    handleChangePage(val, index, pageIndex, modeluId) {
      let page = this.auths[index].pages[pageIndex];
      if (val) {
        // 选中了页面级别，那么模块级别也肯定会被选中，其子级也要被选中
        if (!this.formData.modules.includes(modeluId)) {
          this.formData.modules.push(modeluId);
        }
        let permissions = []; //准备遍历子级
        if (!page.permission || page.permission.length == 0) {
          this.formData.permissions[page.id] = [];
          return this.$forceUpdate();
        }
        for (let j = 0; j < page.permission.length; j++) {
          permissions.push(page.permission[j].id);
        }
        this.formData.permissions[page.id] = permissions;
      } else {
        if (this.formData.pages[modeluId].length == 0 && this.formData.modules.includes(modeluId)) {
          // 如果模块被选中，但是模块下面没有被选中项，移除其选中态
          this.formData.modules.splice(this.formData.modules.indexOf(modeluId),1);
        }
        this.formData.permissions[page.id] = [];
      }
      this.$forceUpdate();
    },
    handleChangePermission(val, index, pageIndex, permissionIndex, modeluId, pageId) {
      let permission = this.auths[index].pages[pageIndex].permission[permissionIndex];
      if(val) {
        // 选中了权限级别，那么模块级别和页面级别也肯定会被选中
        if (!this.formData.modules.includes(modeluId)) {
          this.formData.modules.push(modeluId);
        }
        if (!this.formData.pages[modeluId].includes(pageId)) {
          this.formData.pages[modeluId].push(pageId);
        }
      } else {
        // 允许只看列表，现在不使用下面的代码
        // if (this.formData.permissions[pageId].length == 0 && this.formData.pages[modeluId].includes(pageId)) {
        //   // 如果页面被选中，但是页面下面没有被选中项，移除其选中态
        //   this.formData.pages[modeluId].splice(this.formData.pages[modeluId].indexOf(pageId),1);
        // }
        // if (this.formData.pages[modeluId].length == 0 && this.formData.modules.includes(modeluId)) {
        //   // 如果模块被选中，但是模块下面没有被选中项，移除其选中态
        //   this.formData.modules.splice(this.formData.modules.indexOf(modeluId),1);
        // }
        
      }
      this.$forceUpdate();
    },
  },
};
</script>

<style scoped>
.rule {
  padding: 0 15px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
}
.rule-list-title .rule-checkbox {
  font-size: 18px;
  line-height: 28px;
}
.rule-list-title .checkbox-label {
  font-size: 20px;
  line-height: 28px;
}

.page-list:not(:last-child) {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px dashed #c2c3c3;
}

.page-list-title .checkbox-label {
  font-size: 14px;
  font-weight: bold;
}
</style>
