<template>
  <div>
    <el-form :model="formData">
      <el-form-item label="规格名称" label-width="100px">
        <div class="form-content-static">{{formData.attribute_name}}</div>
      </el-form-item>
      <el-form-item label="规格属性" label-width="100px">
        <div class="standard-items">
          <div class="standard-inputs">
            <div v-for="(item, index) in formData.attributeValues" class="standard-input" :key="index">
              <div class="standard-input-content">{{item.attribute_value}}</div>
              <div>
                
                <template v-if="$auths.includes('attr/valueUpdate')">
                  <el-button type="text" size="small" title="编辑属性值" @click="showEditAttr(index)">
                    <i class="el-icon-edit"></i>
                  </el-button>
                </template>
                <template v-if="$auths.includes('attr/valueDelete')">
                  <el-button type="text" size="small" title="删除属性值" @click="deleteAttr(index)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </template>
                
        
              </div>
            </div>
          </div>
          <div>
            <template v-if="$auths.includes('attr/valueCreate')">
              <el-button type="primary" @click="showAddAttr">新增</el-button>
            </template>
          </div>
        </div>
        <div style="font-size: 12px; color: #999;">规格属性值为空会被忽略</div>
      </el-form-item>

    </el-form>

    <el-dialog :append-to-body="true" title="新增属性" width="600px" :visible.sync="addAttrVisible">
      <AddAttr ref="addattr" :formData="attrData"></AddAttr>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addAttrVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttr">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :append-to-body="true" title="编辑属性" width="600px" :visible.sync="editAttrVisible">
      <EditAttr ref="addattr" :formData="attrData"></EditAttr>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editAttrVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAttr">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AddAttr from '@/partialviews/commedity/standard/AddAttr';
import EditAttr from '@/partialviews/commedity/standard/EditAttr';
export default {
  name: 'EditStandardData',
  components: {
    AddAttr,
    EditAttr
  },
  data() {
    return {
      addAttrVisible: false,
      editAttrVisible: false,
      editIndex: 0,
      attrData: {}
    }
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: { 
    showEditAttr(index) {
      this.attrData = {
        id: this.formData.attributeValues[index].id,
        attr_sn: this.formData.attr_sn,
        attribute_code: this.formData.attributeValues[index].attribute_code,
        attribute_value: this.formData.attributeValues[index].attribute_value
      }
      this.editIndex = index;
      this.editAttrVisible = true;

    },
    editAttr() {
      let params = JSON.parse(JSON.stringify(this.attrData));
      if(params.attribute_value == '') {
        return this.$message.error('请填写名称')
      }
      this.$post('/admin/attr/valueUpdate', [params], res => {
        this.$message.success(`编辑规格属性信息成功`);
        this.formData.attributeValues[this.editIndex] = {
          id: this.attrData.id,
          attr_sn: this.attrData.attr_sn,
          attribute_code: this.attrData.attribute_code,
          attribute_value: this.attrData.attribute_value
        }
        this.editAttrVisible = false;
      });

    },
    showAddAttr() {
      this.attrData = {
        id: null,
        attr_sn: this.formData.attr_sn,
        attribute_code: this.formData.attribute_code,
        attribute_value: ''
      }
      this.addAttrVisible = true;

    },
    addAttr() {
      let params = JSON.parse(JSON.stringify(this.attrData));
      if(params.attribute_value == '') {
        return this.$message.error('请填写名称')
      }
      this.$post('/admin/attr/valueCreate', [params], res => {
        this.$message.success(`新增规格属性信息成功`);
        this.formData.attributeValues.push({
          id: res.data[0],
          attr_sn: this.attrData.attr_sn,
          attribute_code: this.attrData.attribute_code,
          attribute_value: this.attrData.attribute_value
        }) 
        this.addAttrVisible = false;
      });
    },
    deleteAttr(index) {
      this.$confirm(`您将删除${this.formData.attributeValues[index].attribute_value}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/attr/valueDelete', {
          id: this.formData.attributeValues[index].id
        }, res => {
          this.$message.success('删除成功');
          this.formData.attributeValues.splice(index, 1);
        });
      }).catch(() => {});
    }
      
  }
};
</script>

<style scoped>
  .standard-items {
    display: flex;
    flex-wrap: wrap;
  }
  .standard-inputs {
    width: 550px;
    display: flex;
    flex-wrap: wrap;
  }
  .standard-input {
    display: flex;
    align-items: center;
    width: 220px;
    padding: 5px 15px;
    margin-right: 15px;
    margin-bottom: 15px;
    border-radius: 5px;
    background-color: #e2e3e3;
  }
  .standard-input-content {
    flex: 1;
    width: 80px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

</style>