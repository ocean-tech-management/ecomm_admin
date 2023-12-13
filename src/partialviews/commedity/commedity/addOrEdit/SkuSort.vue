<template>
  <div>
    <div class="sku-sort-list">
      <div v-for="item in formData" class="sku-sort-item" draggable="true" :key="item.code">
        规格：{{item.standards.toString()}}
      </div>
    </div>
  </div>
</template>

<script>
import Sortable from 'sortablejs';
export default {
  name: 'SkuSort',
  data() {
    return {
    };
  },
  props: {
    formData: Array
  },
  mounted() {
    let el = document.querySelectorAll('.sku-sort-list')[0];
    const sortable = Sortable.create(el, {
        onEnd: evt => { // 监听拖动结束事件
          if(this.formData.length == 0) return;
          setTimeout(() => {
            let skuItem = JSON.parse(JSON.stringify(this.formData[evt.oldDraggableIndex]));  //缓存选中项
            
            // 判断old>new，true为往前插入，false为往后插入
            // 进行数据操作，确保数据与视图为一致表现
            if(evt.oldDraggableIndex > evt.newDraggableIndex) {
                this.formData.splice(evt.oldDraggableIndex, 1);
                this.formData.splice(evt.newDraggableIndex, 0, skuItem);
            } else {
              this.formData.splice(evt.newDraggableIndex + 1, 0, skuItem); //往后插入时，必须+1. 保证插入到选中项后面
              this.formData.splice(evt.oldDraggableIndex, 1);
            }
            this.$forceUpdate();
          }, 10)
        }
    })
  },
  methods: {

  }
};
</script>

<style lang="less" scoped>
  .sku-sort-item {
    margin-top: 15px;
    padding: 5px 15px;
    border: 1px solid #ccc;
    background-color: #f2f3f3;
    user-select: none;
  }
</style>