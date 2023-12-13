<template>
  <el-form :model="formData">
    <div class="page-target-tabs-box"
      :class="{ 'adjust-position-top': targetActive, 'adjust-position-left': adjustPositionLeft }">
      <div class="page-target-tabs">
        <div class="page-target-tab" :class="{ 'active': targetActive == 'goods_base' }"
          @click="updateTargetActive('goods_base')">基本信息</div>
        <div class="page-target-tab" :class="{ 'active': targetActive == 'goods_standard' }"
          @click="updateTargetActive('goods_standard')">产品规格</div>
        <div v-show="skuList && skuList.length > 0" class="page-target-tab"
          :class="{ 'active': targetActive == 'goods_sku' }" @click="updateTargetActive('goods_sku')">产品列表</div>
        <div class="page-target-tab" :class="{ 'active': targetActive == 'goods_params' }"
          @click="updateTargetActive('goods_params')">产品参数</div>
        <div class="page-target-tab" :class="{ 'active': targetActive == 'goods_desc' }"
          @click="updateTargetActive('goods_desc')">商品描述</div>
      </div>
    </div>
    <div class="page-target-tabs-static"></div>

    <div class="subpage-content" id="goods_base">
      <div class="default-container">
        <el-form-item v-if="hasDraft" label="点此重置" label-width="100px">
          <el-button type="warning" @click="clearDraft">清除草稿缓存并刷新</el-button>
        </el-form-item>
        <el-form-item label="商品名称" label-width="100px">
          <el-input auto-complete="off" placeholder="填一下新商品的名称呗" v-model="formData.title"></el-input>
        </el-form-item>
        <el-form-item label="商品编码" label-width="100px">
          <el-input auto-complete="off" placeholder="填一下新商品的商品码呗" maxlength="36" v-model="formData.goods_code"></el-input>
        </el-form-item>
        <el-form-item label="商品简介" label-width="100px">
          <el-input auto-complete="off" placeholder="填一下新商品的简介呗" v-model="formData.sub_title"></el-input>
        </el-form-item>


        <el-form-item label="所属分类品牌" label-width="100px">
          <span class="result-title">{{ selectCategory.name }}</span>
          <span v-show="selectBrand.brand_name"> > </span>
          <span class="result-title">{{ selectBrand.brand_name }}</span>
          <el-button :type="selectCategory.name ? 'warning' : 'primary'" @click="showSelectCategory">
            {{ selectCategory.name ? '修改分类' : '选择分类' }}
          </el-button>
        </el-form-item>

        <el-form-item label="关联标签" label-width="100px" prop="tag_id">
          <el-select placeholder="不关联标签" name="tag_id" v-model="formData.tag_id">
            <template v-if="$auths.includes('tag/list')">
              <el-option label="不关联任何标签" value></el-option>
            </template>
            <template v-if="!$auths.includes('tag/list')">
              <el-option label="无查看标签列表权限" value></el-option>
            </template>
            <el-option v-for="item in tags" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="供应商" label-width="100px" prop="supplier_code">
          <el-select placeholder="请选择" name="supplier_code" filterable remote :loading="supplierLoading"
            v-model="formData.supplier_code" :remote-method="updateSupplierFilter">
            <el-option v-for="item in suppliers" :label="item.name" :value="item.supplier_code"
              :key="item.supplier_code"></el-option>
          </el-select>
          <span style="margin-left: 10px; color: #999">可输入供货商名字关键字进行筛选</span>
        </el-form-item>
        <el-form-item label="运费模板" label-width="100px" prop="postage_code">
          <el-select placeholder="不限" name="postage_code" filterable remote :loading="fareTemplateLoading"
            v-model="formData.postage_code" :remote-method="updateFareTemplate" @change="$forceUpdate()">
            <el-option v-for="item in fareTemplate" :label="item.title" :value="item.code" :key="item.code"></el-option>
          </el-select>
          <span style="margin-left: 10px; color: #999">可输入运费模板名称进行筛选</span>
        </el-form-item>

        <el-form-item label="发货仓" label-width="100px" prop="warehouse_icon">
          <el-select placeholder="不选请在描述上传发货图" name="warehouse_icon" v-model="formData.warehouse_icon">
            <el-option label="自行上传发货图" value></el-option>
            <el-option label="集品严选自有仓" :value="1"></el-option>
            <el-option label="国内其他仓" :value="2"></el-option>
            <el-option label="香港直邮仓" :value="3"></el-option>
            <el-option label="海外直邮仓" :value="4"></el-option>
            <el-option label="保税仓" :value="5"></el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="显示状态" label-width="100px" prop="show_status">
          <el-select placeholder="不限" name="show_status" v-model="formData.show_status">
            <el-option label="正常显示" :value="1"></el-option>
            <el-option label="仅商品列表显示" :value="2"></el-option>
            <el-option label="仅活动模块显示" :value="3"></el-option>
            <el-option label="商品列表隐藏" :value="4"></el-option>
          </el-select>
          <span style="margin-left: 10px; color: #999">直播商品可选择“商品列表隐藏”</span>
        </el-form-item>


        <el-form-item label="附加条件" label-width="100px">
          <el-select placeholder="是否有特殊要求" name="attach_type" v-model="formData.attach_type">
            <el-option label="无条件要求" :value="-1"></el-option>
            <el-option label="需要真实身份证信息" :value="1"></el-option>
            <el-option label="需要真实身份证信息及图片" :value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="上架类型" label-width="100px" prop="up_type">
          <el-select placeholder="不限" name="up_type" v-model="formData.up_type">
            <el-option label="立即上架" :value="1"></el-option>
            <el-option label="指定时间上架" :value="2"></el-option>
            <el-option label="不上架" :value="3"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="formData.up_type == 2" label="上架时间段" label-width="100px">
          <el-date-picker style="width: 250px" v-model="upTimes.up_time" type="datetime" placeholder="上架时间">
          </el-date-picker>
          ~
          <el-date-picker style="width: 250px" v-model="upTimes.down_time" type="datetime" placeholder="下架时间，可不填">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="封面图" label-width="100px">
          <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg, image/gif"
            action="/admin/file/upload" ref="thumb" :data="thumbData" :headers="token" :show-file-list="false"
            :before-upload="thumbWatcher" :on-success="thumbnailSuccess" :on-error="uploadError" auto-upload>
            <el-input v-show="false" v-model="formData.main_image" placeholder="缩略图"></el-input>
            <img v-if="formData.main_image" :src="formData.main_image" class="thumbnail" />
            <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>

          </el-upload>
          <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">
            请上传尺寸为400*400px的图片，不超过2M。请注意，活动商品图可能会有其他尺寸</div>
        </el-form-item>

        <el-form-item label="内页广告图" label-width="100px">
          <div class="commedity-banners">
            <div v-for="(item, index) in formData.images" class="commedity-banner" :key="item.code">
              <div class="commedity-banner-delete" @click="deleteBanner(index)">×</div>
              <img :src="item.image_url" class="images" />
            </div>
          </div>
          <el-upload id="banner-uploader" class="banner-uploader" accept="image/png, image/jpeg"
            action="/admin/file/upload" ref="banner" :data="thumbData" :headers="token" :show-file-list="false"
            :before-upload="bannerWatcher" :on-error="uploadError" :on-exceed="overLimit" :limit="5" auto-upload multiple>
            <el-button type="primary">+添加banner</el-button>
          </el-upload>
          <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传尺寸为750*750px的图片，不超过2M</div>
        </el-form-item>

        <el-form-item label="商品介绍视频" label-width="100px">
          <div v-if="formData.intro_video && formData.intro_video !== ''" class="commedity-video">
            <div class="commedity-video-delete" @click="formData.intro_video = null">×</div>
            <video :src="formData.intro_video" class="videos" />
          </div>

          <el-upload v-else id="intro-uploader" class="intro-uploader" accept="video/mp4, video/3gp, video/m3u8"
            action="/admin/file/video" ref="intro" :data="thumbData" :headers="token" :show-file-list="false"
            :before-upload="introWatcher" :on-success="introSuccess" :on-error="videoError" auto-upload>
            <el-button type="primary">+添加视频</el-button>
          </el-upload>
          <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传尺寸为750*750px的视频，不超过5M。可以留空不传
          </div>
        </el-form-item>
      </div>
    </div>

    <div class="subpage-content">
      <div class="default-container">
        <el-form-item label="商品视频" label-width="100px">
          <div class="commedity-videos">
            <div v-for="(item, index) in formData.videos" class="commedity-video" :key="item.code">
              <div class="commedity-video-delete" @click="deleteVideo(index)">×</div>
              <video :src="item.video" class="videos" />
            </div>
          </div>
          <el-upload id="video-uploader" class="video-uploader" accept="video/mp4, video/3gp, video/m3u8"
            action="/admin/file/video" ref="video" :data="thumbData" :headers="token" :show-file-list="false"
            :before-upload="videoWatcher" :on-success="videoSuccess" :on-error="videoError" auto-upload>
            <el-button type="primary">+添加视频</el-button>
          </el-upload>
          <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传尺寸16:9且不超过5M的视频</div>
        </el-form-item>
      </div>
    </div>

    <div class="subpage-content" id="goods_standard">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">产品规格</div>
        </div>
        <div v-show="selectCategory.code">
          <el-form-item v-for="(item, index) in standardItems" label="规格名称" label-width="100px" :key="index">
            <div class="standard-select-box">
              <el-select class="standard-select" style="width: 350px" placeholder v-model="standardSelected[index]"
                @change="updateStandardSelected($event, index)">
                <el-option v-for="(standard, standardIndex) in standards"
                  :label="standard.attribute_name + (standard.attr_sn ? ('(' + standard.attr_sn + ')') : '')"
                  :value="standardIndex" :key="standard.attribute_code"></el-option>
              </el-select>
              <template v-if="$auths.includes('attr/valueUpdate')">
                <el-button type="primary" @click="showAddAttr(index)">新增规格值</el-button>
              </template>
              <el-button v-if="index == 0" type="primary" plain @click="getStandards">刷新规格</el-button>
              <el-button v-if="index == 0" type="primary" @click="addStandardItem">+添加规格</el-button>
              <template v-if="$auths.includes('attr/create')">
                <el-button v-if="index == 0" type="primary" @click="openAddStandard" plain>+新建规格</el-button>
              </template>
              <el-button v-if="index != 0" type="warning" @click="deleteStandardItem(index)" plain>-删除规格</el-button>
            </div>
            <div v-if="standards[standardSelected[index]]" class="standard-items">
              <div v-for="attr in standards[standardSelected[index]].values" class="standard-item"
                :class="{ 'selected': standardResults[index].indexOf(attr.id) >= 0 }"
                @click="selectStandard(index, attr.id, attr.attribute_value)" :key="attr.id">{{ attr.attribute_value }}
              </div>

            </div>

          </el-form-item>
          <el-form-item label label-width="300px">
            <el-button type="primary" @click="confirmStandard">确定规格</el-button>
          </el-form-item>
        </div>

        <div v-show="!selectCategory.code">
          <el-form-item label="规格名称" label-width="100px">
            <div style="font-size: 1.1em; color: #f00">请先选择上方的分类哦</div>
          </el-form-item>
        </div>



      </div>
    </div>

    <div v-show="skuList && skuList.length > 0" class="subpage-content" id="goods_sku">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">基本数据</div>
          <div class="table-ctrl">
            <el-button type="primary" @click="defaultPriceVisible = true">批量填写sku信息</el-button>
            <el-button type="primary" @click="showSkuSort">排序</el-button>
          </div>
        </div>

        <el-form-item label-width="0">
          <el-table style="width: 100%" default-expand-all :data="skuList">
            <el-table-column class="sku-vdc-expand" type="expand">
              <template slot-scope="scope">
                <el-form v-if="scope.row.purchase_prices" label-width="100px" inline>
                  <div v-for="(vdcItem, vdcIndex) in scope.row.purchase_prices" class="sku-vdc-item" :key="vdcIndex">
                    <el-form-item :label="vdcItem.name + '进货价'">
                      <el-input style="width: 120px" type="number" auto-complete="off"
                        :placeholder="vdcItem.name + '进货价'"
                        v-model="skuList[scope.$index].purchase_prices[vdcIndex].purchase_price"></el-input>
                    </el-form-item>
                    <el-form-item v-show="vdcItem.close_divide === 2" :label="vdcItem.name + '一级分润'">
                      <el-input style="width: 120px" auto-complete="off" :placeholder="vdcItem.name + '一级分润'"
                        v-model="skuList[scope.$index].purchase_prices[vdcIndex].vdc_one"></el-input>
                    </el-form-item>
                    <el-form-item v-show="vdcItem.close_divide === 2" :label="vdcItem.name + '二级分润'">
                      <el-input style="width: 120px" auto-complete="off" :placeholder="vdcItem.name + '二级分润'"
                        v-model="skuList[scope.$index].purchase_prices[vdcIndex].vdc_two"></el-input>
                    </el-form-item>
                  </div>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column label="产品图" width="100">
              <template slot-scope="scope">
                <div @click="updateSkuImgIndex(scope.$index)">
                  <el-upload id="sku-uploader" class="sku-uploader" accept="image/png, image/jpeg"
                    action="/admin/file/upload" :ref="'skuImg' + scope.$index" :data="thumbData" :headers="token"
                    :show-file-list="false" :before-upload="skuImgWatcher" :on-success="skuImgSuccess"
                    :on-error="uploadError" auto-upload>
                    <img v-if="scope.row.image" :src="scope.row.image" class="sku-thumbnail" />
                    <i v-else class="el-icon-plus sku-uploader-icon"></i>
                  </el-upload>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column label="货号" prop="code">
            </el-table-column> -->
            <el-table-column v-for="(item, index) in skuStandards" :label="item" align="center" :key="index">
              <template slot="header" slot-scope="scope">
                <el-input class="standard-thead" v-model="skuStandards[index]" placeholder="请输入"
                  :title="skuStandards[index]" />
              </template>
              <template slot-scope="scope">
                <el-input class="standard-tbody" v-model="scope.row.standards[index]" placeholder="请输入"
                  :title="scope.row.standards[index]" />
              </template>
            </el-table-column>
            <el-table-column label="库存" width="130">
              <template slot-scope="scope">
                <el-input style="width: 110px" auto-complete="off" placeholder="填一下" v-model="skuList[scope.$index].stock"
                  type="number"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="销售价格" width="130">
              <template slot-scope="scope">
                <el-input style="width: 110px" auto-complete="off" placeholder="填一下"
                  v-model="skuList[scope.$index].sale_price" type="number"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="市场价" width="130">
              <template slot-scope="scope">
                <el-input style="width: 110px" auto-complete="off" placeholder="填一下"
                  v-model="skuList[scope.$index].market_price" type="number"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="成本价" width="130">
              <template slot-scope="scope">
                <el-input style="width: 110px" auto-complete="off" placeholder="填一下"
                  v-model="skuList[scope.$index].cost_price" type="number"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="deleteSkuItem(scope)">删除</el-button>
              </template>
            </el-table-column>


          </el-table>
          <div class="table-ctrls-bottom">
            <div class="table-ctrl">
              <el-button v-if="skuStandards && skuStandards.length > 0" type="primary"
                @click="addSkuItem">新增sku</el-button>
            </div>
          </div>
        </el-form-item>
      </div>
    </div>


    <div class="subpage-content" id="goods_params">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">产品参数</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('goodsParams/create')">
              <el-button v-if="goodsParams.length > 0" type="primary" @click="newParamVisible = true">保存为新模板</el-button>
            </template>
          </div>
        </div>
        <div class="param">
          <div v-if="goodsParams.length > 0" class="group-content">
            <div v-for="(item, index) in goodsParams" class="group" :key="index">
              <el-form-item label="组件标题" label-width="100px">
                <el-input style="width: 450px" auto-complete="off" placeholder="填一下组件标题"
                  v-model="goodsParams[index].title"></el-input>
                <el-button type="danger" @click="deleteGroup(index)">删除组件</el-button>
              </el-form-item>
              <div v-for="(subgroup, subgroupIndex) in item.subgroups" class="subgroup" :key="subgroupIndex">
                <el-input style="width: 200px" auto-complete="off" placeholder="填一下参数名"
                  v-model="goodsParams[index].subgroups[subgroupIndex].name"></el-input>
                <el-input style="width: 300px" auto-complete="off" placeholder="填一下参数值"
                  v-model="goodsParams[index].subgroups[subgroupIndex].info"></el-input>
                <el-button v-if="item.subgroups.length > 1" type="warning"
                  @click="deleteSubgroup(index, subgroupIndex)">删除</el-button>
                <el-button v-if="subgroupIndex == item.subgroups.length - 1" type="primary"
                  @click="addSubgroup(index)">增加新参数</el-button>
              </div>
            </div>
          </div>
          <el-form-item label label-width="100px">
            <el-button type="primary" @click="addGroup">新增组件</el-button>
            <template v-if="$auths.includes('goodsParams/list')">
              <el-button type="primary" @click="selectParamVisible = true">选择模板注入</el-button>
            </template>
            <el-button v-if="goodsParams.length >= 2" @click="showSortParam">组件排序</el-button>
          </el-form-item>
        </div>
      </div>
    </div>


    <div class="subpage-content" id="goods_desc">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">商品描述</div>
        </div>
        <el-form-item label="详细描述" prop="desc" label-width="100px">
          <el-col :span="22">
            <quill-editor class="multiple-content" v-model="formData.desc" :options="editorOption"
              ref="myQuillEditor"></quill-editor>
          </el-col>
          <div>
            <el-upload id="img-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg, image/gif"
              action="/admin/file/upload" ref="upload" :data="thumbData" :headers="token" :show-file-list="true"
              :before-upload="uploadWatcher" :on-error="uploadError" :on-exceed="overLimit" :limit="5" auto-upload
              multiple></el-upload>
          </div>
        </el-form-item>


        <el-form-item label label-width="300px">
          <el-button type="primary" @click="addItem">保存</el-button>
        </el-form-item>
      </div>
    </div>

    <el-dialog title="选择商品分类和品牌" width="900px" :close-on-click-modal="false" :visible.sync="categoryVisible">
      <SelectCategory ref="selectcategory" :formData="standardData"></SelectCategory>
      <div slot="footer" class="dialog-footer">
        <el-button @click="categoryVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCategory">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增规格" width="900px" :close-on-click-modal="false" :visible.sync="addStandardVisible">
      <AddCategoryStandard :formData="standardData"></AddCategoryStandard>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addStandardVisible = false">取 消</el-button>
        <el-button type="primary" @click="addStandard">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :append-to-body="true" title="新增规格值" :close-on-click-modal="false" width="600px"
      :visible.sync="addAttrVisible">
      <AddAttr ref="addattr" :formData="attrData"></AddAttr>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addAttrVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttr">确 定</el-button>
      </div>
    </el-dialog>


    <el-dialog title="选择参数模板注入" width="900px" :close-on-click-modal="false" :visible.sync="selectParamVisible">
      <SelectParam ref="selectParam"></SelectParam>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectParamVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelectParam">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="组件排序" width="600px" :close-on-click-modal="false" :visible.sync="paramSortVisible">
      <ParamSort :formData="goodsParamSort"></ParamSort>
      <div slot="footer" class="dialog-footer">
        <el-button @click="paramSortVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmParamSort">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="保存为新模板" width="600px" :close-on-click-modal="false" :visible.sync="newParamVisible">
      <div>
        <el-form class="param" @submit.native.prevent>
          <el-form-item label="模板名称" label-width="100px">
            <el-input auto-complete="off" placeholder="填一下要保存的模板名称" v-model="newParamTitle"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newParamVisible = false">取 消</el-button>
        <el-button type="primary" @click="addNewParam">确 定</el-button>
      </div>
    </el-dialog>


    <el-dialog title="sku排序" width="600px" :close-on-click-modal="false" :visible.sync="skuSortVisible">
      <SkuSort :formData="skuSortList"></SkuSort>
      <div slot="footer" class="dialog-footer">
        <el-button @click="skuSortVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSkuSort">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="批量填充sku信息" width="900px" :close-on-click-modal="false" :visible.sync="defaultPriceVisible">
      <DefaultPriceTemplate :vdc="vdc" ref="default_template"></DefaultPriceTemplate>
      <div slot="footer" class="dialog-footer">
        <el-button @click="defaultPriceVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDefaultPriceTemplate">确 定</el-button>
      </div>
    </el-dialog>

  </el-form>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.bubble.css";
import { toolbarOptions } from "@/config";
import QuillEditor from 'vue-quill-editor';


import Sortable from 'sortablejs';

import moment from 'moment';
import uploadCtrl from '@/util/uploadCtrl';
import { publishDate } from '@/config.js';
import AddCategoryStandard from '@/partialviews/commedity/commedity/addOrEdit/AddCategoryStandard';
import SelectCategory from '@/partialviews/commedity/commedity/addOrEdit/SelectCategory';
import SkuSort from '@/partialviews/commedity/commedity/addOrEdit/SkuSort';
import SelectParam from '@/partialviews/commedity/commedity/addOrEdit/SelectParam';
import ParamSort from '@/partialviews/commedity/commedity/addOrEdit/ParamSort';

import AddAttr from '@/partialviews/commedity/standard/AddAttr';

import DefaultPriceTemplate from '@/partialviews/commedity/commedity/addOrEdit/DefaultPriceTemplate';

export default {
  name: 'addCommedity',
  components: {
    AddCategoryStandard,
    SelectCategory,
    SkuSort,
    DefaultPriceTemplate,
    AddAttr,
    SelectParam,
    ParamSort
  },
  data() {
    return {
      targetActive: null, //锚点定位器，默认不定位
      targetInfos: {},
      scrollInfos: {},
      sourceList: [],
      menuWidth: 200, //菜单栏宽度200，折叠时64
      adjustPositionLeft: false,

      formData: {
        title: '',
        goods_code: '',
        sub_title: '',
        main_image: '',
        show_status: 1,
        attach_type: -1,
        tag_id: '',
        supplier_code: '',
        postage_code: '',
        warehouse_icon: '',
        up_type: 1,
        intro_video: null,
        // detailImages: [],
        desc: '',
        images: [],
        videos: []
      },
      suppliers: [],
      fareTemplate: [], //运费模板列表
      vdc: [], //用来计算分润
      tags: [], //标签列表
      properties: [],
      selectCategory: {},
      selectBrand: {},
      categoryVisible: false,
      supplierLoading: false,
      fareTemplateLoading: false,

      upTimes: {
        up_time: moment().add(1, 'days').format('YYYY-MM-DD HH:mm'),
        down_time: moment().add(30, 'days').format('YYYY-MM-DD HH:mm')
      },

      // 规格相关
      standards: [], //规格选项列表
      standardSelected: [
        ''
      ], //每个规格选中值
      standardNameSelected: [
        ''
      ], //每个规格名选中值。 用来做比较，避免出现重名情况
      standardItems: [{}],  //规格项，第一项不可删。用于渲染规格项
      standardResults: [
        []
      ],//选中的规格列表，存id，高亮与否
      standardItemResults: [
      ],  //规格项列表

      attrData: {},
      addAttrVisible: false,

      skuStandards: [], //sku的规格
      skuList: [],  //sku的列表
      skuImgUploadIndex: 0,  //sku的上传图片控件索引

      thumbData: {},
      token: {
        token: localStorage.getItem('token') || ''
      },
      editorOption: {
        placeholder: "在此编辑你的详情描述",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function(value) {
                document.querySelector("#img-uploader input").click();
                this.quill.format("image", false);
              }
            }
          }
        }
      },



      standardData: {},   //新增规格的数据
      addStandardVisible: false, //新增规格的显示与否的控制字段

      skuSortVisible: false,   //用于sku排序
      skuSortList: [],

      defaultPriceVisible: false,   //用于批量填写价格库存等

      goodsParams: [],       //商品参数
      selectParamVisible: false,  //选择参数模板弹窗
      goodsParamSort: [],         //待排序的组件拷贝
      paramSortVisible: false,    //组件排序弹窗
      newParamTitle: '',           //模板名称
      newParamVisible: false,     //新模板保存弹窗

      hasDraft: false,
      draftInterval: null,

      fileList: [],
      uploading: false
    };
  },
  beforeDestroy() {
    if(this.draftInterval) clearInterval(this.draftInterval);
    if(document) {
      // 如果有document，那么在下面我们是有对页面滚动事件进行绑定的，需要在销毁路由时销毁页面

      let $page = document.querySelector('#page');
      if($page) {
        // 页面垂直滚动监听
        $page.removeEventListener('scroll', $page.$handlerScrollVertical)
      }

      let $wrapper = document.querySelector('#wrapper');
      if($wrapper) {
        // 页面横向滚动监听
        $wrapper.removeEventListener('scroll', $wrapper.$handlerScrollHorizontal)
      }

    }
  },
  mounted() {
    if(!this.$auths.includes('goods/postageTemplates')) {
      this.$message.warning('您缺少查看商品邮费模板的权限，无法正常添加商品，请联系管理员为您添加');
      return this.$router.replace('commedities');
    }
    if(!this.$auths.includes('supplier/list')) {
      this.$message.warning('您缺少查看供应商列表的权限，无法正常添加商品，请联系管理员为您添加');
      return this.$router.replace('commedities');
    }
    let lastDraft = localStorage.getItem('draft');
    if(lastDraft && lastDraft != '') {
      // 草稿缓存有效期： 1小时
      if(moment(new Date()).diff(moment(lastDraft.createTime), 'hours') < 1) {
        this.hasDraft = true;
      }
    }
    this.getTags();
    this.getVDC();

    let imagesEl = document.querySelectorAll('.commedity-banners')[0];
    const imagesSortable = Sortable.create(imagesEl, {
        onEnd: evt => { // 监听拖动结束事件
          if(this.formData.images.length == 0) return;
          setTimeout(() => {
            let images = JSON.parse(JSON.stringify(this.formData.images[evt.oldDraggableIndex]));  //缓存选中项

            // 判断old>new，true为往前插入，false为往后插入
            // 进行数据操作，确保数据与视图为一致表现
            if(evt.oldDraggableIndex > evt.newDraggableIndex) {
                this.formData.images.splice(evt.oldDraggableIndex, 1);
                this.formData.images.splice(evt.newDraggableIndex, 0, images);
            } else {
              this.formData.images.splice(evt.newDraggableIndex + 1, 0, images); //往后插入时，必须+1. 保证插入到选中项后面
              this.formData.images.splice(evt.oldDraggableIndex, 1);
            }
            this.$forceUpdate();
          }, 10)
        }
    })

    let videosEl = document.querySelectorAll('.commedity-videos')[0];
    const videosSortable = Sortable.create(videosEl, {
        onEnd: evt => { // 监听拖动结束事件
          if(this.formData.videos.length == 0) return;
          setTimeout(() => {
            let videos = JSON.parse(JSON.stringify(this.formData.videos[evt.oldDraggableIndex]));  //缓存选中项

            // 判断old>new，true为往前插入，false为往后插入
            // 进行数据操作，确保数据与视图为一致表现
            if(evt.oldDraggableIndex > evt.newDraggableIndex) {
                this.formData.videos.splice(evt.oldDraggableIndex, 1);
                this.formData.videos.splice(evt.newDraggableIndex, 0, videos);
            } else {
              this.formData.videos.splice(evt.newDraggableIndex + 1, 0, videos); //往后插入时，必须+1. 保证插入到选中项后面
              this.formData.videos.splice(evt.oldDraggableIndex, 1);
            }
            this.$forceUpdate();
          }, 10)
        }
    })

    if(this.hasDraft) {
      let draft = JSON.parse(lastDraft);
      this.formData = draft.formData;
      this.upTimes = draft.upTimes || [];
      this.properties= draft.properties;
      this.selectCategory = draft.selectCategory;
      this.selectBrand = draft.selectBrand;
      this.standards = draft.standards;
      this.skuStandards = draft.skuStandards;
      this.skuList = draft.skuList;
      this.relationalCommodities = draft.relationalCommodities || [];
      this.goodsParams = draft.goodsParams || [];
      if(this.standards && this.standards.length > 0) {
        // 当存在有规格列表时，选中第一个规格项
        this.standardItemResults = [{
          name: this.standards[0].attribute_name || '',
          attr_sn: this.standards[0].attr_sn || '',
          data: []
        }]
        this.standardNameSelected = [this.standards[0].attribute_name || '']; //使用第一个
        this.standardSelected = [0];  //默认选中第一个
      }

    } else {
      if(lastDraft) localStorage.removeItem('draft');
    }
    this.getFareTemplate('', this.formData.postage_code);
    this.getSuppliers('', this.formData.supplier_code);

    // 开启草稿定时器
    this.draftInterval = setInterval(() => {
      let draft = {
        formData: this.formData,
        properties: this.properties,
        selectCategory: this.selectCategory,
        selectBrand: this.selectBrand,
        upTimes: this.upTimes,
        // 规格相关
        standards: this.standards,

        skuStandards: this.skuStandards,
        skuList: this.skuList,
        createTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        goodsParams: this.goodsParams,
      }
      if(draft.formData) localStorage.setItem('draft', JSON.stringify(draft));
    }, 10000)

    let Delta = QuillEditor.Quill.import('delta');  //只能从页面单独引入才可以用这方法，目前没有思路
    this.$refs.myQuillEditor.quill.clipboard.addMatcher('img', (node, delta) => {
      // 强行接管复制/黏贴事件
      if(node.src) {
          // 检查是不是base64
        if(node.src.startsWith('data:')) {
          // base64转成file类型，然后上传
          let arr = node.src.split(','), mime = arr[0].match(/:(.*?);/)[1], suffix = mime.split('/')[1] || 'jpg',
          bstr = atob(arr[1]), len = bstr.length, u8arr = new Uint8Array(len);
          while(len--){
            u8arr[len] = bstr.charCodeAt(len);
          }
          // 转成一个新的文件，后缀和文件格式从原有的文件中拿
          let file = new File([u8arr], `copy_image_${moment().valueOf()}.${suffix}`, {type: mime || 'image/jpg'});
          this.uploadWatcher(file);
        } else {
          // 不是base64直接给插入
          return delta.compose(new Delta().retain(delta.length()));
        }
      }
      return new Delta(); //如果没有命中，即没有src地址，直接返回空，不执行插入操作
    });

    this.tryAddScrollListener();

  },
  methods: {
    getTags() {
      if(!this.$auths.includes('tag/list')) {
        return; //没有权限就不让看了
      }
      let params = {
        keyword: ''
      }
      this.$sget('/admin/tag/list', params, res => {
        let data = res.data;
        this.tags = data;
      });
    },
    getVDC() {
      let params = {
        keyword: ''
      }
      this.$get('/admin/vdc/list', params, res => {
        let data = res.data;
        this.vdc = data;
      });
    },
    getSuppliers(keyword = '', code) {
      if(!this.$auths.includes('supplier/list')) return;
      let params = {
        page: 1,
        keyword: keyword
      }
      if(code) params.code = code;

      this.supplierLoading = true;
      this.$sget('/admin/supplier/list', params, res => {
        let data = res.data.list || [];
        // this.formData.supplier_code = data[0].supplier_code;
        this.suppliers = data;
        this.supplierLoading = false;
      }, err => {
        this.supplierLoading = false;
      });
    },
    getFareTemplate(keyword = '', code) {
      if(!this.$auths.includes('goods/postageTemplates')) return;
      let params = {
        page: 1,
        keyword: keyword
      }
      if(code) params.code = code;
      this.fareTemplateLoading = true;
      this.$sget('/admin/goods/postageTemplates', params, res => {
        let data = res.data.list || [];
        if(!this.formData.postage_code || this.formData.postage_code === '') this.formData.postage_code = data[0].code;
        this.fareTemplate = data;
        this.fareTemplateLoading = false;
      }, err => {
        this.fareTemplateLoading = false;
      });
    },

    clearDraft() {
      // 清空草稿并刷新
      this.$confirm('是否放弃当前的草稿缓存，并刷新页面重置整个页面？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('draft');
        window.location.reload();
      }).catch(() => {});
    },


    // 尝试给页面加滚动监听，吸顶tabs用
    tryAddScrollListener() {
      if(document) {
        let $menu = document.querySelector('#menu-aside');
        if($menu) this.menuWidth = $menu.clientWidth || 0;

        let $page = document.querySelector('#page');
        if($page) {
          // 必须定义函数句柄，不然无法解除绑定。 这里直接塞dom对象中。
          $page.$handlerScrollVertical = res => {
            // 页面垂直滚动监听
            this.handlerPageScroll($page.scrollTop);
          }
          $page.addEventListener('scroll', $page.$handlerScrollVertical);
        }

        let $wrapper = document.querySelector('#wrapper');
        if($wrapper) {
          $wrapper.$handlerScrollHorizontal = res => {
            // 页面水平滚动监听
            this.handlerPageSlide($wrapper.scrollLeft);
          }
          $wrapper.addEventListener('scroll', $wrapper.$handlerScrollHorizontal);
        }

        this.$nextTick(() => {
          this.initScrollInfo();
          $page.scrollTo(0, 0);
        })
      }
    },
    // 初始化滚动参数
    async initScrollInfo(handler) {
      await this.sourceLoad();  //等待资源加载完毕再执行
      setTimeout(() => {
        this.getScrollInfo();
        this.$nextTick(() => {
          if(handler && typeof handler == 'function') handler();
        })
      }, 50)
    },
    getScrollInfo() {
      let targetInfos = {
        'goods_base': 60  //60是页面面包屑标题栏高度
      };  //存储id对应的节点的位置，用来做
      let scrollInfos = {
        [60]: 'goods_base'
      } //与上面的相反，用来做滚动时的判断点

      const waitCalcElement = ['goods_standard', this.skuList.length > 0 ? 'goods_sku' : null, 'goods_params', 'goods_desc']; //待计算的节点id列表
      for(let i = 0; i < waitCalcElement.length; i++) {
        if(!waitCalcElement[i]) continue;
        const item = document.querySelector(`#${waitCalcElement[i]}`);
        if(item && item.offsetTop) {
          let positionTop = item.offsetTop - (targetInfos['goods_base'] || 0);  //除了base，其他要减去base位置，以给tabs流出足够空间
          targetInfos[waitCalcElement[i]] = positionTop;
          scrollInfos[positionTop] = waitCalcElement[i];
        }
      }
      this.targetInfos = targetInfos;
      this.scrollInfos = scrollInfos;
    },
    // 加载资源
    sourceLoad() {
      const promise = new Promise((resolve, reject) => {
        let goodsImagePaths = [];
        if(this.formData.images) {
          for(let i = 0; i < this.formData.images.length; i++) {
            // 循环提取商品内页广告图地址
            goodsImagePaths.push(this.formData.images[i].image_url);
          }
        }
        // 等待加载的资源，在这里特指图片
        let waitLoadResource = [this.formData.main_image, ...goodsImagePaths];
        let loadNum = 0;  //当前加载了几个了
        for(let i = 0; i < waitLoadResource.length; i++) {
          // 本来希冀于已load的资源不再请求，但事实上如果不请求会导致渲染异步，计算高度会有问题。 时序上无法保证
          // if(!waitLoadResource[i] || this.sourceLoad.includes(waitLoadResource[i])) {
          if(!waitLoadResource[i]) {
            // 图片地址无效，或者已经加载过了
            loadNum++;
            if(loadNum == waitLoadResource.length) resolve(); //到数了
          } else {
            var img = document.createElement("img");

            img.src = waitLoadResource[i];
            img.onload = () => {
              if(!this.sourceList.includes(waitLoadResource[i])){
                this.sourceList.push(waitLoadResource[i]);  //加载成功并且地址还未存入，存入已加载资源列表，后面就不再重复去请求了
              }
              loadNum++;
              if(loadNum == waitLoadResource.length) resolve();
            }
            img.onerror = function () {
              loadNum++;
              if(loadNum == waitLoadResource.length) resolve();
            }
          }
        }
      });
      return promise;
    },
    handlerPageScroll(top) {
      let targetTops = Object.keys(this.scrollInfos);
      if(!targetTops || targetTops.length == 0) return;
      let isActive = false; //是否是要吸顶的标志
      for(let i = targetTops.length; i >= 0; i--) {
        if(top >= targetTops[i]) {
          this.targetActive = this.scrollInfos[targetTops[i]];
          isActive = true;
          break;
        }
      }
      if(!isActive) {
        this.targetActive = null;
      }
    },
    handlerPageSlide(left) {
      if(left > this.menuWidth && !this.adjustPositionLeft) {
        this.adjustPositionLeft = true;
      } else if(left < this.menuWidth && this.adjustPositionLeft) {
        this.adjustPositionLeft = false;
      }
    },
    updateTargetActive(id) {
      const target = document.querySelector(`#${id}`);
      if(!target) return;
      const page = document.querySelector(`#page`);
      let targetY = target.offsetTop - (this.targetInfos['goods_base'] || 0);
      if(targetY < 0) targetY = 0;
      page.scrollTo(0, targetY);
    },

    showSelectCategory() {
      if(!this.$auths.includes('category/list')) {
        return this.$message.warning('您缺少查看分类列表的权限，无法正常选择分类，请联系管理员为您添加');
      }
      this.categoryVisible = true;
    },
    confirmCategory() {
      // console.log(this.$refs.selectcategory);
      let dialog = this.$refs.selectcategory;
      if(!dialog.subCategories[dialog.subCategoryIndex]) {
        return this.$message.error('请选择子分类哦，如没有相关分类请先去添加哈')
      }
      if(!dialog.brands[dialog.brandIndex]) {
        return this.$message.error('请选择品牌哦，如没有相关品牌请先去添加哈')
      }
      this.selectCategory = dialog.subCategories[dialog.subCategoryIndex];
      this.selectBrand = dialog.brands[dialog.brandIndex];
      this.resetStandards();
      this.categoryVisible = false;
    },

    resetStandards() {
      this.standards = []; // 规格相关
      this.standardSelected = [
        0
      ]; //规格选项列表，记录索引。默认首项选第一个
      this.standardItems = [{}]; //规格项，除了第一个规格。用于渲染规格项
      this.standardResults = [
        []
      ];  //选中的规格列表，存id，高亮与否。二维数组。默认存在第一项空数组
      this.standardItemResults = [];  //规格项列表
      this.skuList = [];
      this.getStandards(() => {
        // 重置选中规格结果。默认初始化第一个
        this.standardItemResults = [{
          name: this.standards[0] ? this.standards[0].attribute_name : '',
          attr_sn: this.standards[0] ? this.standards[0].attr_sn : '',
          data: []
        }]
        this.standardNameSelected = [
          this.standards[0] ? this.standards[0].attribute_name : ''
        ];
      });

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },

    updateSupplierFilter(keyword) {
      this.getSuppliers(keyword);
    },
    updateFareTemplate(keyword) {
      this.getFareTemplate(keyword);
    },


    getStandards(handler) {
      if(!this.$auths.includes('goods/attrKey')) {
        this.standards = [];
        if(handler && typeof handler == 'function') handler();
        return this.$message.warning('您缺少获取规格列表的权限，请联系管理员为您添加');
      }
      let params = {
        category_code: this.selectCategory.code
      }
      this.$get('/admin/goods/attrKey', params, res => {
        this.standards = res.data || [];
        if(handler && typeof handler == 'function') handler();
      });
    },


    //新增规格项
    addStandardItem() {
      if(this.standardItems.length >= this.standards.length) {
        return this.$message.warning('规格项超过当前分类下的已有规格列表长度啦。无可用规格项可添加，您可以点击新建规格新增一项哈');
      }
      let hasOtherValue = false;
      for(let i = 0; i < this.standards.length; i++) {
        // 自动选中未选中过的索引
        if(!this.standardSelected.includes(i) && !this.standardNameSelected.includes(this.standards[i].attribute_name)) {
          this.standardSelected.push(i);
          this.standardNameSelected.push(this.standards[i].attribute_name);
          this.standardItems.push({});
          this.standardResults.push([]);
          this.standardItemResults.push({
            name: this.standards[i].attribute_name,
            attr_sn: this.standards[i].attr_sn,
            data: []
          });
          hasOtherValue = true;


          this.initScrollInfo(); //重新算一遍滚动吸顶位置
          break;
        }
      }
      if(!hasOtherValue) this.$message.warning('没有有效的可选规格项了，您可以点击新建规格新增一项哈');

    },
    //移去规格项
    deleteStandardItem(index) {
      this.standardSelected.splice(index, 1);
      this.standardNameSelected.splice(index, 1);
      this.standardItems.splice(index, 1);
      this.standardResults.splice(index, 1);
      this.standardItemResults.splice(index, 1);

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    // 更换规格时，检查是否重复。重置对应规格项的规格子项选中
    updateStandardSelected(selectIndex, index) {
      // 查重
      this.standardNameSelected[index] = this.standards[this.standardSelected[index]].attribute_name;  //更新选中名
      let existTime = 0, nameExistTime = 0;
      for(let i = 0; i < this.standardSelected.length; i++) {
        if(this.standardSelected[i] == selectIndex) {
          existTime += 1;
        }
        if(this.standardNameSelected[i] == this.standards[selectIndex].attribute_name) {
          nameExistTime += 1;
        }
      }
      if(existTime > 1) {
        this.standardSelected[index] = '';
        this.standardNameSelected[index] = '';
        return this.$message.warning('该规格已存在，要选不一样的规格哦')
      }
      if(nameExistTime > 1) {
        this.standardSelected[index] = '';
        this.standardNameSelected[index] = '';
        return this.$message.warning('该规格名已存在，要选不一样的规格名哦')
      }

      let standardItemResults = this.standardItemResults;
      let standardResults = this.standardResults;
      // 重置选中的规格结果及规格高亮子项列表
      standardItemResults[index] = {
        name: this.standards[selectIndex].attribute_name,
        attr_sn: this.standards[selectIndex].attr_sn,
        data: []
      }
      standardResults[index] = [];
      this.standardResults = standardResults;
      this.standardItemResults = standardItemResults;

    },
    // 点击子项高亮与否
    selectStandard(index, id, value) {
      let existIndex = this.standardResults[index].indexOf(id);
      if(existIndex >= 0) {
        this.standardResults[index].splice(existIndex, 1);
        this.standardItemResults[index].data.splice(existIndex, 1);
      } else {
        this.standardResults[index].push(id);
        this.standardItemResults[index].data.push(value);
      }
      this.$forceUpdate();  //因列表循环渲染不更新视图机制，需要强制刷新视图
    },

    // 确认规格。进行空值处理。新建sku列表。
    confirmStandard() {

      this.skuStandards = [];
      let skuItems = [];
      let skuArr = [];
      for(let i = 0; i < this.standardItemResults.length; i++) {
        // 将规格结果转为N阶二维数组，方便计算。存储相关规格名称
        if(!this.standardItemResults[i].data || this.standardItemResults[i].data.length == 0) continue; //没有选中的规格列表将被忽略
        skuArr.push([]);
        this.skuStandards.push(this.standardItemResults[i].name);
        for(let j = 0; j < this.standardItemResults[i].data.length; j++) {
          skuArr[skuArr.length - 1].push(this.standardItemResults[i].data[j])
        }
      }
      if(skuArr.length == 0) {
        return this.$message.error('请至少选择一个规格哦');
      }
      // 进行二维数组排列组合处理
      const getCombination=(array)=>{
        let resultArry=[];
        array.forEach((arrItem)=>{
          if(resultArry.length===0){
            resultArry=arrItem; //初始化第一个数组项目
          }else{
            const emptyArray=[];
            resultArry.forEach((item)=>{
              arrItem.forEach((value)=>{
                // 对数组进行拼接处理 [a] => [a, b] => [[a, b], c] => [a, b, c]
                if(typeof item == 'object') {
                  emptyArray.push([...item,value])
                } else {
                  emptyArray.push([item,value])
                }
              })
            })
            resultArry=emptyArray
          }
        });
        return resultArry;
      }

      // 组合不同身份对应的进货价
      let purchase_prices = [];
      for(let j = 0; j < this.vdc.length; j++) {
        purchase_prices.push({
          level: this.vdc[j].level,
          name: this.vdc[j].name,
          purchase_price: 0,
          vdc_one: this.vdc[j].vdc_one,
          vdc_two: this.vdc[j].vdc_two,
          close_divide: this.vdc[j].close_divide
        })
      }



      let skuList = getCombination(skuArr);
      // 组合sku
      this.skuList = [];
      for(let i = 0; i < skuList.length; i++) {
        this.skuList.push({
          code: new Date().getTime() + i, //保留code，等会删掉。code用来作为拖拽排序的标志
          title: '',
          image: '',
          standards: skuArr.length == 1 ? [skuList[i]] : skuList[i], //skuArr的长度为1时，是一维数组
          virtual_stock: 0,
          stock: 0,
          sale_price: 0,
          member_price: 0,
          market_price: 0,
          cost_price: 0,
          purchase_prices: JSON.parse(JSON.stringify(purchase_prices))  //0622，加入不同身份不同进货价板块
        })
      }

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    // 新增一个新规格项
    openAddStandard() {
      this.standardData = {
        attribute_name: '',
        attr_sn: '',
        desc: '',
        category_code: this.selectCategory.code,
        category_name: this.selectCategory.name,
        attributeValues: [
          {
            attribute_value: '属性1',
            remark: ''
          }
        ]
      }
      this.addStandardVisible = true;
    },
    addStandard() {
      let params = JSON.parse(JSON.stringify(this.standardData));
      if(params.attribute_name == '' || params.category_code == '' || params.attr_sn == '' || params.desc == '') {
        return this.$message.error('请填写名称、规格标志、描述以及选择归属分类')
      }
      for(let i = params.attributeValues.length; i--; i > 0) {
         if(params.attributeValues[i].attribute_value == '') {
           params.attributeValues.splice(i, 1);
         }
      }
      if(params.attributeValues.length == 0) {
        return this.$message.error('请确保至少有一个规格项有值哦');
      }
      for(let i = 0; i < params.attributeValues.length; i++) {
        params.attributeValues[i].sort = i;
      }

      this.$post('/admin/attr/create', params, res => {
        this.$message.success(`新增成功`);
        this.addStandardVisible = false;
        this.resetStandards();
      });
    },

    showAddAttr(index) {
      this.attrData = {
        id: null,
        attr_sn: this.standards[this.standardSelected[index]].attr_sn,
        attribute_code: this.standards[this.standardSelected[index]].attribute_code,
        attribute_value: '',
        index: index
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
        this.standards[this.standardSelected[this.attrData.index]].values.push({
          id: res.data[0],
          attr_sn: this.attrData.attr_sn,
          attribute_code: this.attrData.attribute_code,
          attribute_value: this.attrData.attribute_value
        })
        this.addAttrVisible = false;
      });
    },

    // sku排序
    showSkuSort() {
      this.skuSortList = this.skuList.slice(0);
      this.skuSortVisible = true;
    },
    confirmSkuSort() {
      this.skuList = this.skuSortList.slice(0);
      this.skuSortVisible = false;
    },



    // 产品参数
    addGroup() {
      this.goodsParams.push({
        title: '',
        subgroups: [{
          name: '',
          info: ''
        }]
      })

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    deleteGroup(index) {
      this.goodsParams.splice(index, 1);

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    deleteSubgroup(index, subgroupIndex) {
      this.goodsParams[index].subgroups.splice(subgroupIndex, 1);

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    addSubgroup(index) {
      this.goodsParams[index].subgroups.push({
        name: '',
        info: ''
      })

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    confirmSelectParam() {
      let result = this.$refs.selectParam.returnSelectResult();
      let content = JSON.parse(result.content) || [];
      if(content.length > 0) {
        this.goodsParams.push(...content);
      }
      this.selectParamVisible = false;

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    showSortParam() {
      this.goodsParamSort = this.goodsParams.slice(0);
      for(let i = 0; i < this.goodsParamSort.length; i++) {
        this.goodsParamSort[i].code = new Date().getTime() + i;
      }
      this.paramSortVisible = true;
    },
    confirmParamSort() {
      for(let i = 0; i < this.goodsParamSort.length; i++) {
        delete this.goodsParamSort[i].code;
      }
      this.goodsParams = this.goodsParamSort.slice(0);
      this.paramSortVisible = false;
    },
    addNewParam() {
      let params = {
        title: this.newParamTitle,
        content: [...this.goodsParams]
      }

      params.title = params.title.trim();
      for(let i = 0; i < params.content.length; i++) {
        params.content[i].title = params.content[i].title.trim();
        for(let j = 0; j < params.content[i].subgroups.length; j++) {
          params.content[i].subgroups[j].name = params.content[i].subgroups[j].name.trim();
        }
      }
      if(!params.title || params.title === '') {
        return this.$message.error('请填写参数模板名称哦');
      }
      this.$post('/admin/goodsParams/create', params, res => {
        this.$message.success('新增参数模板成功');
        this.newParamVisible = false;
      });
    },

    // 模板价格
    confirmDefaultPriceTemplate() {
      let info = this.$refs.default_template.getDefaultPriceTemplate();
      if(info) {
        this.$confirm('批量填写默认sku信息会对已有sku的信息进行覆盖，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          for(let i = 0; i < this.skuList.length; i++) {
            this.skuList[i].sale_price = info.sale_price;
            this.skuList[i].market_price = info.market_price;
            this.skuList[i].cost_price = info.cost_price;
            this.skuList[i].stock = info.stock;
            this.skuList[i].purchase_prices = [];
            this.skuList[i].purchase_prices.push(...JSON.parse(JSON.stringify(info.purchase_prices)));
          }
          this.defaultPriceVisible = false;
        }).catch(() => {});

      }
    },


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
          uploadCtrl.validMD5(
            md5,
            url => {
              this.formData.main_image = url;
              this.$refs.thumb.clearFiles();
              this.$forceUpdate();
              this.initScrollInfo(); //重新算一遍滚动吸顶位置
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
      this.formData.main_image = res.data;
      this.$refs.thumb.clearFiles();
      this.$forceUpdate();
      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },


    bannerWatcher(file) {
      console.log('upload', file);
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.banner.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.banner.clearFiles();
        this.$message.error('上传封面图片大小不能超过 2MB');
        return false;
      }

      this.fileList.unshift(file);
      this.tryUpload(url => {
        this.formData.images.push({
          code: new Date().getTime(),
          image_url: url
        });
        this.$refs.banner.clearFiles();
        this.$forceUpdate();

        this.initScrollInfo(); //重新算一遍滚动吸顶位置
      }, res => {
        this.$refs.banner.clearFiles();
      });
      return false; //不让自动上传了，交给上传程序来把握进程

    },
    deleteBanner(index) {
      this.formData.images.splice(index, 1);
      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },


    uploadWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif') {
        this.$refs.upload.clearFiles();
        this.$message.error('只能上传jpg/png/gif图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.upload.clearFiles();
        this.$message.error("上传图片大小不能超过 2MB!");
        return false;
      }
      this.fileList.unshift(file);
      this.tryUpload(url => {
        let quill = this.$refs.myQuillEditor.quill;
        let length = quill.getSelection().index;
        quill.insertEmbed(length, "image", url);
        quill.setSelection(length + 1);
        this.$forceUpdate();
      }, res => {
        this.$refs.upload.clearFiles();
      });
      return false; //不让自动上传了，交给上传程序来把握进程
    },

    /**
     * @param handler 上传成功后要使用的函数。 因是一批同种性质的文件上传，一般都一样
     * @param completeHandler 当结束时要执行的函数
     */
    tryUpload(handler, completeHandler) {
      if(this.uploading) return;
      this.$loading({text: '上传图片中'});
      this.uploading = true;

      let file = this.fileList[this.fileList.length - 1];
      uploadCtrl.getFileMD5(file, md5 => {
        uploadCtrl.svalidMD5(
          md5,
          url => {
            this.uploading = false;
            if(handler && typeof handler == 'function') handler(url); //将处理方法作为参数引入

            // 如果文件列表还有没有上传的，上传下一张
            this.tryUploadNext(handler, completeHandler);
        }, err => {
          // 没有拿到md5对应的图片，直接走上传逻辑
          let params = new FormData();
          params.append('file',file, file.name);
          params.append('md5', md5);
          uploadCtrl.upload('/admin/file/upload', params, res => {
            this.uploading = false;

            let data = res.data;
            if(handler && typeof handler == 'function') handler(data); //将处理方法作为参数引入

            // 如果文件列表还有没有上传的，上传下一张
            this.tryUploadNext(handler, completeHandler);
          }, err => {
            this.uploading = false;
            this.tryUploadNext(handler, completeHandler);

            console.log(err);
          })
        })
      }, err => {
        this.uploading = false;
        this.tryUploadNext(handler, completeHandler);
      });
    },
    /**
     * @param handler 上传成功后要使用的函数。 因是一批同种性质的文件上传，一般都一样
     * @param completeHandler 当结束时要执行的函数
     */
    tryUploadNext(handler, completeHandler) {
      this.fileList.splice(this.fileList.length - 1, 1);
      if(this.fileList.length > 0) {
        this.tryUpload(handler, completeHandler);
      } else {
        if(completeHandler && typeof completeHandler == 'function') completeHandler();
        this.$loading().close();
      }
    },


    updateSkuImgIndex(index){
      this.skuImgUploadIndex = index;
    },

    skuImgWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs[`skuImg${this.skuImgUploadIndex}`].clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs[`skuImg${this.skuImgUploadIndex}`].clearFiles();
        this.$message.error('上传商品图片大小不能超过 2MB');
        return false;
      }
      return new Promise((resolve, reject) => {
        uploadCtrl.getFileMD5(file, md5 => {
          this.thumbData = {
            md5: md5
          };
          uploadCtrl.validMD5(
            md5,
            url => {
              let skuList = JSON.parse(JSON.stringify(this.skuList));
              skuList[this.skuImgUploadIndex].image = url;
              this.skuList = skuList;
              this.$refs[`skuImg${this.skuImgUploadIndex}`].clearFiles();
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
    skuImgSuccess(res, file) {
      let skuList = JSON.parse(JSON.stringify(this.skuList));
      skuList[this.skuImgUploadIndex].image = res.data;
      this.skuList = skuList;
      this.$refs[`skuImg${this.skuImgUploadIndex}`].clearFiles();
      this.$forceUpdate();
    },

    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
    overLimit() {
      this.$message.error(`一次最多只能选择5张图片`);
    },

    // 视频相关
    // banner视频
    introWatcher(file) {
      if (file.type != 'video/mp4' && file.type != 'video/3gp' && file.type != 'video/m3u8') {
        this.$refs.intro.clearFiles();
        this.$message.error('只能上传mp4/m3u8/3gp格式的视频');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isLt5M) {
        this.$refs.intro.clearFiles();
        this.$message.error('上传视频大小不能超过 5MB');
        return false;
      }

      return new Promise((resolve, reject) => {
        uploadCtrl.getFileMD5(file, md5 => {
          this.thumbData = {
            md5: md5,
            type: 2
          };
          uploadCtrl.validMD5(
            md5,
            url => {
              this.formData.intro_video = url;
              this.$refs.intro.clearFiles();
              this.$forceUpdate();

              this.initScrollInfo(); //重新算一遍滚动吸顶位置
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
    introSuccess(res, file) {
      this.formData.intro_video = res.data;
      this.$refs.intro.clearFiles();
      this.$forceUpdate();

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    // 详情视频
    videoWatcher(file) {
      if (file.type != 'video/mp4' && file.type != 'video/3gp' && file.type != 'video/m3u8') {
        this.$refs.video.clearFiles();
        this.$message.error('只能上传mp4/m3u8/3gp格式的视频');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isLt5M) {
        this.$refs.video.clearFiles();
        this.$message.error('上传视频大小不能超过 5MB');
        return false;
      }

      return new Promise((resolve, reject) => {
        uploadCtrl.getFileMD5(file, md5 => {
          this.thumbData = {
            md5: md5,
            type: 2
          };
          uploadCtrl.validMD5(
            md5,
            url => {
              this.formData.videos.push({
                code: new Date().getTime(),
                video: url
              });
              this.$refs.video.clearFiles();
              this.$forceUpdate();

              this.initScrollInfo(); //重新算一遍滚动吸顶位置
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
    videoSuccess(res, file) {
      this.formData.videos.push({
        code: new Date().getTime(),
        video: res.data
      });
      this.$refs.video.clearFiles();
      this.$forceUpdate();

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    deleteVideo(index) {
      this.formData.videos.splice(index, 1);

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    videoError(err) {
      this.$message.error('您未能正确上传视频，请选择大小不超过 20M 的mp4/m3u8/3gp格式的视频上传或检查您的网络哦');
    },


    deleteSkuItem(scope) {
      this.skuList.splice(scope.$index, 1);

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },
    addSkuItem() {
      let standards = [];
      for(let i = 0; i < this.skuStandards.length; i++) {
        standards.push('');
      }
      let purchase_prices = [];
      for(let j = 0; j < this.vdc.length; j++) {
        purchase_prices.push({
          level: this.vdc[j].level,
          name: this.vdc[j].name,
          purchase_price: 0,
          vdc_one: this.vdc[j].vdc_one,
          vdc_two: this.vdc[j].vdc_two,
          close_divide: this.vdc[j].close_divide
        })
      }
      this.skuList.push({
        code: new Date().getTime() + 1, //保留code，等会删掉。code用来作为拖拽排序的标志
        title: '',
        image: '',
        standards: standards,
        virtual_stock: 0,
        stock: 0,
        sale_price: 0,
        member_price: 0,
        market_price: 0,
        cost_price: 0,
        purchase_prices: JSON.parse(JSON.stringify(purchase_prices))  //0622，加入不同身份不同进货价板块
      })

      this.initScrollInfo(); //重新算一遍滚动吸顶位置
    },

    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));
      if(params.title) params.title = params.title.replace(/\s+/ig, ' ');

      params.sku = JSON.parse(JSON.stringify(this.skuList));
      params.category_code = this.selectCategory.code;
      params.brand_code = this.selectBrand.brand_code;
      if(params.tag_id === '') delete params.tag_id;
      if(params.goods_code === '') delete params.goods_code;
      if(!params.warehouse_icon || params.warehouse_icon === '') delete params.warehouse_icon;
      delete params.videos;  //商品视频也允许为空
      delete params.intro_video;  //允许介绍视频为空
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写/勾选完所有信息，并上传封面、详情图哦');
        }
      }
      if(params.images.length == 0) {
        return this.$message.error('需要上传banner图哦');
      }
      for(let i = 0; i < params.images.length; i++) {
        params.images[i].sort = i + 1;
        delete(params.images[i].code);
      }

      params.goods_videos = [];
      if(this.formData.videos.length > 0) {
        for(let i = 0; i < this.formData.videos.length; i++) {
          let item = {
            sort: i + 1,
            video: this.formData.videos[i].video
          }
          params.goods_videos.push(item);
        }
      }
      params.intro_video = this.formData.intro_video;

      if(params.up_type == 2) {
        if(!this.upTimes.up_time || this.upTimes.up_time == '') {
          return this.$message.error('上架类型为指定时间段上架必选开始时间喔');
        }
        if(moment(this.upTimes.up_time).diff(moment()) <= 0) {
          return this.$message.error('上架开始时间必须比当前往后喔');
        }
        params.up_time = this.upTimes.up_time;
        if(this.upTimes.down_time && this.upTimes.down_time !== '') {
          if(moment(this.upTimes.down_time).diff(moment(this.upTimes.up_time)) <= 0) {
            return this.$message.error('下架时间必须比上架时间往后哦');
          }
          params.down_time = this.upTimes.down_time;
        }
      }


      if(!params.desc || params.desc.length == 0) {
        return this.$message.error('请填写详情信息哦');
      } else if(/<span class="ql-cursor">﻿<\/span>/.test(params.desc)) {
        // 修复quill-editor自身的虚拟光标问题，quill-editor推荐用getContents来获取内容但是需要自己解析内容，内容解析成本高
        params.desc = params.desc.replace(/<span class="ql-cursor">﻿<\/span>/ig, '');
      }

      if(!params.sku || params.sku.length == 0) {
        return this.$message.error('请勾选分类、规格，至少生成一组sku哦');
      }
      if(!this.skuStandards || this.skuStandards.length == 0) {
        return this.$message.error('sku规格长度有误，请检查');
      }
      const existStandardsName = [];  //已存在的规格名
      for(let i = 0; i < this.skuStandards.length; i++) {
        if(!this.skuStandards[i] || this.skuStandards[i] === '') {
          return this.$message.error(`第${i + 1}个规格名为空，请检查`);
        }
        if(existStandardsName.includes(this.skuStandards[i])) {
          return this.$message.error(`第${i + 1}个规格存在相同的规格名，请检查`);
        }
        existStandardsName.push(this.skuStandards[i]);
      }

      let skuExistStandards = []; //规格判断，已存在的规格组合
      for(let i = 0; i < params.sku.length; i++) {
        // 检查sku的合法性
        let currentSku = params.sku[i];
        // if(
        //   !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(currentSku.sale_price)) ||
        //   !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(currentSku.market_price)) ||
        //   !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(currentSku.member_price)) ||
        //   parseFloat(currentSku.sale_price) <= 0 ||
        //   parseFloat(currentSku.market_price) <= 0 ||
        //   parseFloat(currentSku.member_price) <= 0
        // ) {
        //   return this.$message.error(`第${i + 1}个sku的价格要为大于零的数哦，请检查下哈`)
        // }
        // 暂不验证会员价
        if(
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(currentSku.sale_price)) ||
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(currentSku.market_price)) ||
          !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(currentSku.cost_price)) ||
          parseFloat(currentSku.sale_price) <= 0 ||
          parseFloat(currentSku.market_price) <= 0 ||
          parseFloat(currentSku.cost_price) <= 0
        ) {
          return this.$message.error(`第${i + 1}个sku的各个价格要为大于零的数哦，请检查下哈`)
        }

        if(!(/^(0|[1-9][0-9]*)$/.test(currentSku.stock))) {
          return this.$message.error(`第${i + 1}个sku的库存要为0，1，2，3，4这种正整数哦，请检查下哈`)
        }
        if(!(/^(0|[1-9][0-9]*)$/.test(currentSku.virtual_stock))) {
          return this.$message.error(`第${i + 1}个sku的虚拟库存要为0，1，2，3，4这种正整数哦，请检查下哈`)
        }
        if(currentSku.image == '') {
          return this.$message.error(`第${i + 1}个sku的图片未上传，请检查下哈`)
        }

        // 检验sku的售价合法性
        for(let j = 0; j < currentSku.purchase_prices.length; j++) {
          if(
            !(/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(currentSku.purchase_prices[j].purchase_price)) ||
            parseFloat(currentSku.purchase_prices[j].purchase_price) <= 0
          ) {
            return this.$message.error(`第${i + 1}个sku的${currentSku.purchase_prices[j].name}价格要为大于零的数哦，请检查下哈`)
          }
          if(
            !/^(\d|[1-9]\d+)(\.\d+)?$/.test(currentSku.purchase_prices[j].vdc_one) ||
            !/^(\d|[1-9]\d+)(\.\d+)?$/.test(currentSku.purchase_prices[j].vdc_two) ||
            parseFloat(currentSku.purchase_prices[j].vdc_one) >= 1 ||
            parseFloat(currentSku.purchase_prices[j].vdc_two) >= 1
          ) {
            return this.$message.error(`第${i + 1}个sku的${currentSku.purchase_prices[j].name}一二级分润比例都要为小于1的正数哦`);
          }
          if(j != 0) {
            if(
              parseFloat(currentSku.purchase_prices[j].purchase_price) < parseFloat(currentSku.purchase_prices[j - 1].purchase_price)
            ) {
              return this.$message.error(`第${i + 1}个sku的${currentSku.purchase_prices[j].name}价格有问题，按规则价格应随会员等级降低而提高，请检查下哈`)
            }
          }
        }

        params.sku[i].title = params.title;  //现在sku名字跟随spu
        params.sku[i].sub_title = params.sub_title; //现在sku副标跟随spu
        params.sku[i].supplier_code = params.supplier_code; //sku供货商编码要和spu一致
        params.sku[i].sort = i;  //设置排序
        params.sku[i].attach_type = params.attach_type;  //设置sku跟随spu的购物身份证要求
        params.sku[i].postage_code = params.postage_code; //设置运费模板
        params.sku[i].attr = {};
        params.sku[i].attr_sn = {}; //规格sn
        // 保留两位小数
        params.sku[i].sale_price = parseFloat(currentSku.sale_price).toFixed(2);
        params.sku[i].market_price = parseFloat(currentSku.market_price).toFixed(2);
        params.sku[i].cost_price = parseFloat(currentSku.cost_price).toFixed(2);
        params.sku[i].member_price = parseFloat(currentSku.member_price).toFixed(2);

        if(skuExistStandards.includes(JSON.stringify(currentSku.standards))) {
          return this.$message.error(`第${i + 1}个sku的规格值已重复，请检查`)
        }
        skuExistStandards.push(JSON.stringify(currentSku.standards));
        for(let j = 0; j < currentSku.standards.length; j++) {
          if(currentSku.standards[j] === '') {
            return this.$message.error(`第${i + 1}个sku的第${j + 1}个规格值有问题，请检查`)
          }
          // 以属性名为key，属性值为value
          params.sku[i].attr[this.skuStandards[j]] = currentSku.standards[j];
        }


        // 加入分润信息
        params.sku[i].vdc = [];
        for(let j = 0; j < this.vdc.length; j++) {
          let vdcData = {};
          vdcData.level = this.vdc[j].level;
          vdcData.vdc_one = parseFloat(params.sku[i].purchase_prices[j].vdc_one).toFixed(3);
          vdcData.vdc_two = parseFloat(params.sku[i].purchase_prices[j].vdc_two).toFixed(3);
          vdcData.vdc_genre = this.vdc[j].vdc_genre;
          vdcData.purchase_price = parseFloat(params.sku[i].purchase_prices[j].purchase_price).toFixed(2);  //用暂存起来的值
          params.sku[i].vdc.push(vdcData);
        }

        delete params.sku[i].purchase_price;  //删除暂存的销售价字段
        delete params.sku[i].standardItemResults; //删除暂存的attr属性值
        delete params.sku[i].standards; //删除暂存的attr项
        delete params.sku[i].code;  //删掉拖拽排序用的code
      }

      // 补充参数
      let goodsParams = JSON.parse(JSON.stringify(this.goodsParams)) || [];
      for(let i = 0; i < goodsParams.length; i++) {
        goodsParams[i].title = goodsParams[i].title.trim();
        for(let j = 0; j < goodsParams[i].subgroups.length; j++) {
          goodsParams[i].subgroups[j].name = goodsParams[i].subgroups[j].name.trim();
        }
      }
      if(goodsParams.length > 0) params.params = goodsParams;

      // delete params.postage_code; //删除最外层运费
      // params.property_id = this.formData.property_id.toString();
      params.unit = '件'; //单位默认填件
      this.$post('/admin/goods/create', params, res => {
        this.$message.success('添加商品成功，正在返回列表');
        setTimeout(() => {
          localStorage.removeItem('draft');
          if(this.draftInterval) clearInterval(this.draftInterval);
          localStorage.setItem('shouldRefresh', 'on');
          this.$router.replace('commedities');
        }, 1500)
      });
    }
  }
};
</script>

<style lang="less" scoped>
.page-target-tabs-box {
  position: absolute;
  width: 100%;
  height: 60px;

  &.adjust-position-top {
    top: 0;

    .page-target-tabs {
      position: fixed;
      box-shadow: 0 16px 24px 0 rgba(0, 0, 0, 0.08);
    }
  }

  &.adjust-position-left {
    .page-target-tabs {
      left: 0;
    }
  }
}

.page-target-tabs-static {
  height: 60px;
}

.page-target-tabs {
  position: absolute;
  // top: 0;
  // left: 0;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #fff;
  z-index: 3;
}

.page-target-tab {
  position: relative;
  padding: 20px 30px;
  cursor: pointer;

  &:hover {
    color: #4877e8;
  }

  &.active {
    color: #4877e8;

    &:after {
      content: '';
      position: absolute;
      bottom: 3px;
      left: 0;
      right: 0;
      width: 2em;
      height: 3px;
      margin: 0 auto;
      background-color: #4877e8;
    }
  }
}

.commedity-banners,
.commedity-videos {
  display: flex;
  flex-wrap: wrap;
}

.commedity-banner,
.commedity-video {
  position: relative;
  width: 180px;
  margin-right: 20px;
}

.commedity-video {
  height: 101px;
}

.commedity-banner-delete,
.commedity-video-delete {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #fff;
  cursor: pointer;
  background-color: rgba(0, 0, 0, .8);
  user-select: none;
  z-index: 2;
}

.commedity-banner-delete:hover,
.commedity-video-delete:hover {
  background-color: #ef0000;
}

.images {
  display: block;
  width: 180px;
  margin-bottom: 10px;
}

.videos {
  display: block;
  width: 180px;
  height: 180px;
  margin-bottom: 10px;
}

.detail-image {
  position: relative;
  width: 375px;
}


.standard-select {
  width: 450px;
}

.standard-items {
  display: flex;
  flex-wrap: wrap;
}

.standard-item {
  padding: 12px 20px;
  margin-right: 15px;
  margin-top: 15px;
  border: 1px solid #4877e8;
  border-radius: 8px;
  line-height: 1.4;
  color: #4877e8;
  cursor: pointer;
}

.standard-item:hover,
.standard-item.selected {
  background-color: #dee2ee;
}

.sku-uploader {
  width: 90px;
}

.sku-thumbnail {
  width: 70px;
}

.sku-uploader-icon {
  position: relative;
  width: 68px;
  height: 68px;
  border: 1px dashed #000;
  border-radius: 6px;
  line-height: 68px;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
}

.sku-vdc-expand {
  background-color: #fcfdfd;
}

.multiple-content {
  width: 375px;
}


.sku-vdc-item {
  margin-bottom: 10px;
}

.sku-vdc-item:last-child {
  margin-bottom: 0;
}


// 参数模板
.group-content {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f2f3f3;
}

.group {
  &:not(:last-child) {
    padding-bottom: 10px;
    margin-bottom: 15px;
    border-bottom: 1px solid #ccc;
  }
}

.subgroup {
  padding-left: 100px;
  margin-bottom: 5px;
}

.table-ctrls-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>

<style lang="less">
.standard-thead,
.standard-tbody {
  max-width: 280px;
}

.standard-thead .el-input__inner {
  font-weight: bold;
  text-align: center;
}

.standard-tbody .el-input__inner {
  text-align: center;
}
</style>