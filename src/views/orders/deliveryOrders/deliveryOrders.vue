<template>
  <div class="subpage-wrapper-content">
    <div class="subpage-flex-fullpage">
      <div class="subpage-flex-fullpage-content">
        <div class="subpage-content subpage-content-ctrls">
          <div class="default-container">
            <div class="page-ctrl">
              <span v-if="lastUpdateTimes && lastUpdateTimes.create_time" style="margin-right: 20px;">最近同步时间：{{
                lastUpdateTimes.create_time }} ({{ lastUpdateTimes.admin_name ||
    '特殊用户' }})</span>
              <template v-if="$auths.includes('ship/sync')">
                <el-button type="primary" @click="syncData">同步数据</el-button>
              </template>
              <template v-if="$auths.includes('ship/autoSplit')">
                <el-button type="primary" @click="trySplitTimes">自动拆单</el-button>
              </template>
            </div>
          </div>
        </div>

        <div class="subpage-content subpage-content-ctrls">
          <div class="default-container">
            <div class="page-ctrl">
              <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
                <el-form-item label="创建时间" prop="createDate">
                  <el-date-picker name="createDate" v-model="queryForm.createDate" type="datetimerange"
                    :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                    format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :clearable="false"
                    :editable="false"></el-date-picker>
                </el-form-item>

                <el-form-item label="状态" prop="searType">
                  <el-select placeholder="不限" name="searType" v-model="queryForm.searType">
                    <el-option label="不限" value></el-option>
                    <el-option v-for="(item, index) in Object.values(statusTexts)" :label="item"
                      :value="Object.keys(statusTexts)[index]" :key="index"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="订单类型" prop="order_type">
                  <el-select placeholder="不限" name="order_type" v-model="queryForm.order_type">
                    <el-option label="不限" value></el-option>
                    <el-option label="普通订单" :value="1"></el-option>
                    <el-option label="拼团" :value="2"></el-option>
                    <el-option label="套餐订单" :value="3"></el-option>
                    <!-- <el-option label="拼拼订单" :value="4"></el-option> -->
                    <el-option label="转售订单" :value="5"></el-option>
                    <!--                <el-option label="福利订单" :value="6"></el-option>-->
                    <el-option label="集品豆订单" :value="7"></el-option>
                    <el-option label="礼品券订单" :value="8"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="支付方式" prop="pay_type">
                  <el-select placeholder="不限" name="pay_type" v-model="queryForm.pay_type">
                    <el-option label="不限" value></el-option>
                    <el-option label="微信支付" :value="2"></el-option>
                    <el-option label="集品券支付" :value="5"></el-option>
                    <el-option label="协议支付" :value="6"></el-option>
                    <el-option label="集品豆支付" :value="7"></el-option>
                    <el-option label="礼品券支付" :value="8"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item v-show="queryForm.searType == 2" label="备货状态" prop="shipping_status">
                  <el-select placeholder="不限" name="shipping_status" v-model="queryForm.shipping_status">
                    <el-option label="不限" value></el-option>
                    <el-option label="未备货" :value="1"></el-option>
                    <el-option label="已备货" :value="2"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="多商品" prop="searMoreGoodsOrder">
                  <el-checkbox :true-label="1" :false-label="0" v-model="queryForm.searMoreGoodsOrder">
                    是
                  </el-checkbox>
                </el-form-item>

                <el-form-item label="订单号" prop="searOrderSn">
                  <el-input v-model="queryForm.searOrderSn" placeholder="请填入完整订单号"
                    @keyup.enter.native="queryInfo"></el-input>
                </el-form-item>


                <el-form-item label="供应商" label-width="100px" prop="searSupplierCode">
                  <el-select placeholder="请输入供应商名筛选" name="searSupplierCode" filterable remote :loading="supplierLoading"
                    v-model="queryForm.searSupplierCode" :remote-method="updateSupplierFilter">
                    <el-option label="不限" value></el-option>
                    <el-option v-for="item in suppliers" :label="item.name" :value="item.supplier_code"
                      :key="item.supplier_code"></el-option>
                  </el-select>
                </el-form-item>


                <el-form-item label="快速标志" prop="order_sign">
                  <el-checkbox-group v-model="queryForm.order_sign">
                    <el-checkbox :label="1">
                      <i class="el-icon-s-flag red"></i>
                    </el-checkbox>
                    <el-checkbox :label="2">
                      <i class="el-icon-s-flag yellow"></i>
                    </el-checkbox>
                    <el-checkbox :label="3">
                      <i class="el-icon-s-flag green"></i>
                    </el-checkbox>
                    <el-checkbox :label="4">
                      <i class="el-icon-s-flag blue"></i>
                    </el-checkbox>
                    <el-checkbox :label="5">
                      <i class="el-icon-s-flag purple"></i>
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
                  <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number"
                    @keyup.enter.native="queryInfo"></el-input>
                </el-form-item>
                <el-form-item label="导出数量" prop="exportNum" title="仅针对导出订单">
                  <el-select placeholder="500" name="exportNum" v-model="queryForm.exportNum">
                    <el-option label="500" :value="500"></el-option>
                    <el-option label="1000" :value="1000"></el-option>
                    <el-option label="2000" :value="2000"></el-option>
                    <el-option label="3000" :value="3000"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="导出类型" prop="needFormatList" title="仅针对导出订单">
                  <el-select placeholder="500" name="needFormatList" v-model="queryForm.needFormatList">
                    <el-option label="不分组" :value="0"></el-option>
                    <el-option label="按商品分组" :value="1"></el-option>
                    <el-option label="按供应商分组" :value="2"></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item v-if="!showExtendFilter">
                  <el-button type="primary" @click="queryInfo">查询</el-button>
                  <el-button @click="resetQuery('queryForm')">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
            <div v-if="showExtendFilter" class="page-ctrl">
              <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
                <template v-if="$auths.includes('order/spuList') || $auths.includes('order/skuList')">
                  <el-form-item label="指定商品">
                    <div v-if="(selectGoodsInfo.searGoodsSpuSn && selectGoodsInfo.searGoodsSpuSn.length > 0) ||
                      (selectGoodsInfo.searGoodsSkuSn && selectGoodsInfo.searGoodsSkuSn.length > 0)">
                      <span class="sku-select-trigger" @click="showSelectGoods">
                        <template v-if="selectGoodsInfo.type == 1">
                          已选择<span class="warning-color">{{ selectGoodsInfo.searGoodsSpuSn.length || 0 }}</span>款商品
                        </template>
                        <template v-if="selectGoodsInfo.type == 2">
                          已选择<span class="warning-color">{{ selectGoodsInfo.searGoodsSpuSn.length || 0 }}</span>款商品，
                          <span class="warning-color">{{ selectGoodsInfo.searGoodsSkuSn.length || 0 }}</span>个规格
                        </template>
                      </span>
                      <span class="sku-select-trigge-clear" @click="resetSelectGoods">取消指定</span>
                    </div>
                    <div v-else class="sku-select-trigger" @click="showSelectGoods">未指定商品</div>
                  </el-form-item>
                </template>

                <el-form-item label="用户昵称" prop="searUserName">
                  <el-input v-model="queryForm.searUserName" placeholder="请完整填入"
                    @keyup.enter.native="queryInfo"></el-input>
                </el-form-item>
                <el-form-item label="用户手机" prop="searUserPhone">
                  <el-input v-model="queryForm.searUserPhone" placeholder="请完整填入" @keyup.enter.native="queryInfo"
                    maxlength="11"></el-input>
                </el-form-item>
                <div>
                  <el-form-item label="收件人姓名" prop="searShippingName">
                    <el-input v-model="queryForm.searShippingName" placeholder="请完整填入"
                      @keyup.enter.native="queryInfo"></el-input>
                  </el-form-item>
                  <el-form-item label="收件人手机" prop="searShippingPhone">
                    <el-input v-model="queryForm.searShippingPhone" placeholder="请完整填入" @keyup.enter.native="queryInfo"
                      maxlength="11"></el-input>
                  </el-form-item>

                  <el-form-item label="物流编码" prop="searShippingCode">
                    <el-input v-model="queryForm.searShippingCode" placeholder="请完整填入"
                      @keyup.enter.native="queryInfo"></el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="queryInfo">查询</el-button>
                    <el-button @click="resetQuery('queryForm')">重置</el-button>
                  </el-form-item>
                </div>
              </el-form>
            </div>
            <div class="filter-extend-trigger-box">
              <div class="filter-extend-trigger" @click="extendFilter">{{ showExtendFilter ? '∧折叠' : '∨展开' }}高级搜索</div>
            </div>
          </div>
        </div>

        <div v-if="logisticsAnalysis" class="subpage-content subpage-content-ctrls">
          <div class="default-container">
            <div class="page-ctrl">
              <div class="analysis-title">
                订单物流统计（共<span class="error-color">{{ logisticsAnalysis.all || 0 }}</span>个样本）
              </div>
              <div class="logistics-analysis-list">
                <div v-for="item in logisticsAnalysis.status" class="logistics-analysis-item" :key="item.title">
                  <div class="logistics-analysis-value">{{ item.percent }}%</div>
                  <div class="logistics-analysis-tips">{{ item.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="subpage-content">
          <div v-loading="dataLoading" class="default-container">


            <div class="table-ctrls">
              <div class="table-title">发货订单列表</div>
              <div class="table-ctrl" style="display: flex;">
                <el-button style="margin-right: 15px;" @click="sgetList">
                  <i class="el-icon el-icon-refresh"></i>
                </el-button>
                <template v-if="$auths.includes('excel/shipOrder')">
                  <el-button style="margin-right: 15px;" type="primary" @click="getExportDatas">导出Excel表格</el-button>
                </template>
                <template v-if="$auths.includes('ship/noShippingCode')">
                  <el-upload id="excel-uploader" class="excel-uploader" accept=".xls, .xlsx" action="" ref="noCodeOrder"
                    :data="{}" :headers="token" :before-upload="noCodeOrderWatcher" :on-error="noCodeOrderUploadError">
                    <el-button type="warning">导入免物流发货订单</el-button>
                  </el-upload>
                </template>
                <template v-if="$auths.includes('file/importExcel')">
                  <el-button type="primary" @click="showImportOrders">导入发货订单</el-button>
                </template>

              </div>
            </div>

            <div class="delivery-list">

              <div class="delivery-table">
                <div class="delivery-table-head">
                  <div class="delivery-table-th" style="width: 50px;">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                      @change="handleCheckAllChange"></el-checkbox>
                  </div>
                  <div class="delivery-table-th" style="width: 80px;">状态</div>
                  <div class="delivery-table-th" style="width: 80px;">类别</div>
                  <div class="delivery-table-th" style="width: 100px;">买家昵称</div>
                  <div class="delivery-table-th auto">交易时间</div>
                  <div class="delivery-table-th auto">付款时间</div>
                  <div class="delivery-table-th" style="width: 140px;">发货状态</div>
                  <div class="delivery-table-th" style="width: 120px;">操作</div>
                </div>

                <div v-if="dataList.length == 0 && !dataLoading" class="delivery-item">
                  <div class="delivery-table-body">
                    <div class="delivery-table-td auto" style="text-align: center">
                      暂无数据
                    </div>
                  </div>
                </div>


                <div v-for="(item, index) in dataList" class="delivery-item" :key="item.order_sn">
                  <div class="delivery-table-body">
                    <div class="delivery-table-td" style="width: 50px;">
                      <el-checkbox v-model="selectOrders" :label="index" @change="handleSelectChange">&nbsp;</el-checkbox>
                    </div>
                    <div class="delivery-table-td" style="width: 80px;">
                      <template v-if="item.order_status == 2">{{ shippingStatusText[item.shipping_status] }}</template>
                      <template v-else>{{ statusTexts[item.order_status] }}</template>
                    </div>
                    <div class="delivery-table-td" style="width: 80px;">{{ item.split_status, item.parent_order_sn |
                      getOrderType }}</div>
                    <div class="delivery-table-td" style="width: 100px;">{{ item.user_name }}</div>
                    <div class="delivery-table-td auto">{{ item.pay_time }}</div>
                    <div class="delivery-table-td auto">{{ item.create_time }}</div>
                    <div class="delivery-table-td" style="width: 140px;">{{ item | getOrderStatus }}</div>
                    <div class="delivery-table-td" style="width: 120px;">
                      <template v-if="$auths.includes('ship/ship')">
                        <el-button v-if="item.order_status == 2 && !item.shipping_code" type="text" size="small"
                          @click="showUpdateLogisticsPopup(item, 1)">填单发货</el-button>
                      </template>
                      <template v-if="$auths.includes('ship/ship')">
                        <el-button v-if="item.order_status == 2 && item.shipping_code" type="text" size="small"
                          @click="confirmDelivery(item)">发货</el-button>
                      </template>
                      <!-- 这个按钮和下面的按钮不一样，这个按钮是发货前显示用，覆盖信息。下面那个是更改信息 -->
                      <template v-if="$auths.includes('ship/updateShip')">
                        <el-button v-if="item.order_status == 2 && item.shipping_code" type="text" size="small"
                          @click="showUpdateLogisticsPopup(item, 1)">修改物流</el-button>
                      </template>
                      <template v-if="$auths.includes('ship/storing')">
                        <el-button v-if="item.order_status == 2 && !item.shipping_code" type="text" size="small"
                          @click="toggleStockUp(item)">
                          {{ item.shipping_status == 2 ? '取消备货' : '备货' }}
                        </el-button>
                      </template>

                      <!-- 物流接口不收权鉴约束 -->
                      <el-button v-if="item.order_status > 2 && item.shipping_code" type="text" size="small"
                        @click="checkLogistics(item)">查看物流</el-button>

                      <template v-if="$auths.includes('ship/updateShip')">
                        <el-button v-if="item.order_status > 2 && item.order_status < 5 && item.shipping_type == 1"
                          type="text" size="small" @click="showUpdateLogisticsPopup(item, 2)">修改物流</el-button>
                      </template>

                    </div>
                  </div>
                  <div class="delivery-content">
                    <div v-if="item.is_attach_order && item.attach" class="delivery-infos">
                      <div class="delivery-info">
                        <div class="warning-color">海外购/特殊订单</div>
                        <el-button style="margin-left: 15px; padding: 0;" type="text" @click="showAttachInfos(item)">
                          <i class="el-icon-info"></i>查看附加信息
                        </el-button>

                        <template v-if="$auths.includes('ship/updateAttach')">
                          <el-button style="margin-left: 15px; padding: 0;" type="text"
                            @click="showEditAttachInfos(item)">
                            <i class="el-icon-edit"></i>更正海外购信息
                          </el-button>
                        </template>
                      </div>
                    </div>
                    <div v-if="item.order_type == 6" class="delivery-infos">
                      <div class="delivery-info">
                        <div class="warning-color">
                          <template>福利专区订单</template>
                          <template v-if="item.advance_buy == 1">[提前购]</template>
                        </div>
                      </div>
                    </div>
                    <div v-if="item.order_remark" class="delivery-infos">
                      <div class="delivery-info">
                        <div class="delivery-info-label">买家留言：</div>
                        <div class="delivery-info-value">{{ item.order_remark }}</div>
                      </div>
                    </div>
                    <div v-if="item.seller_remark" class="delivery-infos">
                      <div class="delivery-info">
                        <div class="delivery-info-label">卖家备注：</div>
                        <div class="delivery-info-value">
                          <i v-if="item.order_sign" class="el-icon-s-flag" :class="flagColor[item.order_sign]"></i>
                          <span>{{ item.seller_remark }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="delivery-infos">
                      <div class="delivery-info">
                        <div class="delivery-info-label">联系方式：</div>
                        <div class="delivery-info-value">
                          {{ item.shipping_name }}，{{ item.shipping_phone }}，{{ item.shipping_address }}，000000</div>
                      </div>
                      <div class="delivery-info">
                        <template v-if="$auths.includes('ship/updateShipInfo')">
                          <el-button v-if="item.order_status == 2" type="text" size="small"
                            @click="showLogisticsInfoPopup(item)">修改联系信息</el-button>
                        </template>
                      </div>
                    </div>
                    <div class="delivery-infos">
                      <div class="delivery-info">
                        <div class="delivery-info-label">订单编号：</div>
                        <div class="delivery-info-value">{{ item.order_sn }}</div>
                      </div>
                      <div v-if="item.parent_order_sn && item.parent_order_sn != item.order_sn" class="delivery-info">
                        <div class="delivery-info-label">主订单：</div>
                        <div class="delivery-info-value">{{ item.parent_order_sn }}</div>
                      </div>
                      <div class="delivery-info">
                        <div class="delivery-info-label">订单实收款：</div>
                        <div class="delivery-info-value">￥{{ item.real_pay_price || 0 }}（邮费￥{{ item.fare_price || 0 }}）
                        </div>
                      </div>
                      <div class="delivery-info">
                        <div class="delivery-info-label">商品总数：</div>
                        <div class="delivery-info-value">{{ item.sku_count }}</div>
                      </div>
                      <div class="delivery-info">
                        <div class="delivery-info-label">商品sku种类：</div>
                        <div class="delivery-info-value">{{ item.item_count }}</div>
                      </div>
                    </div>
                    <div v-if="item.divideTopUser && item.divideTopUser.link_user_name" class="delivery-infos">
                      <div class="delivery-info">
                        <div class="delivery-info-label">顶级分销信息：</div>
                        <div class="delivery-info-value">
                          {{ item.divideTopUser.link_user_name }}({{ item.divideTopUser.link_user_phone }}) 分润￥<span
                            class="error-color">{{ item.divideTopUser.real_divide_price || '0.00' }}</span>

                        </div>
                      </div>
                    </div>
                    <el-table style="width: 100%" :data="item.kids">
                      <el-table-column prop="specs" width="40">
                        <template slot-scope="scope">
                          <div v-if="item.split_status != 2 && item.kids.length > 1">
                            <el-checkbox v-model="breakDeliveries[index]" :label="scope.$index">&nbsp;</el-checkbox>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="商品" width="250">
                        <template slot-scope="scope">
                          <div class="delivery-sku-baseinfo">
                            <div class="delivery-sku-img-box">
                              <img class="delivery-sku-img" :src="scope.row.images" />
                            </div>
                            <div class="delivery-sku-info">
                              <div class="delivery-sku-title">{{ scope.row.title }}</div>
                              <div class="delivery-sku-code">{{ scope.row.sku_sn }}</div>
                            </div>
                          </div>

                        </template>
                      </el-table-column>
                      <el-table-column label="规格属性" prop="attrs">
                      </el-table-column>
                      <el-table-column label="单价" width="90" prop="price">
                      </el-table-column>
                      <el-table-column label="数量" width="90" prop="count" align="center">
                      </el-table-column>
                      <el-table-column label="商品实收款" width="120" prop="real_pay_price" align="center">
                        <template slot-scope="scope">
                          <div>
                            {{ scope.row.real_pay_price }}
                            <div v-if="scope.row.refund_price && scope.row.refund_price != '0.00'">
                              共退<span class="error-color">{{ scope.row.refund_price }}</span>
                            </div>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="100">
                        <template slot-scope="scope">
                          <div v-if="scope.row.after_status == 2 || scope.row.after_status == 3"
                            style="font-weight: bold; color: #f00">
                            {{ afterSaleTexts[scope.row.after_status] }}
                          </div>
                          <el-button
                            v-if="item.order_status == 2 && item.split_status != 2 && item.kids.length == 1 && scope.row.count > 1"
                            type="text" size="small" @click="showBreakSkuNum(scope.row, index)">数量拆分</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div v-if="item.order_status == 2 && item.shipping_status == 1" class="delivery-ctrls">
                      <template v-if="$auths.includes('ship/split')">
                        <el-button v-if="item.kids.length > 1 && item.split_status != 2" type="primary" size="mini"
                          title="可以勾选不同的sku进行拆分订单、发货操作哦" :disabled="breakDeliveries[index].length == 0"
                          @click="breakDeliveryOrder(item, index)">订单拆分</el-button>
                      </template>
                      <template v-if="$auths.includes('ship/cancelSplit')">
                        <el-button v-if="item.parent_order_sn && item.split_status == 1" type="warning" size="mini"
                          title="未发货的货品可以取消拆单，将该拆单合并回原来订单" @click="restoreDeleveryOrder(item)">取消拆单</el-button>
                      </template>
                      <template v-if="$auths.includes('ship/cancelSplit')">
                        <el-button v-if="item.split_status == 2" type="warning" size="mini" title="正常订单的合单可以还原回原来订单"
                          @click="restoreMergeOrder(item)">取消合单</el-button>
                      </template>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
      <div class="table-bottom-bar">
        <div class="table-bottom-ctrls">
          <template v-if="$auths.includes('ship/merge')">
            <el-button type="primary" :disabled="selectOrders.length < 2" @click="mergeSelectOrders">合并订单</el-button>
          </template>
          <template v-if="$auths.includes('ship/ship')">
            <el-button type="primary" :disabled="selectOrders.length == 0" @click="quicklyDelivery">批量发货</el-button>
          </template>
          <span v-if="selectOrders.length > 0" style="margin-left: 10px; font-size: 12px; color: #999;">已选中<span
              class="success-color"> {{ selectOrders.length || 0 }} </span>条记录</span>
        </div>
        <div v-show="dataList && dataList.length > 0" class="pagination-inline">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
            :page-sizes="[10, 25, 50]" :page-size="pageCount" :pager-count="7" layout="sizes, total, prev, pager, next"
            :page-count="count"></el-pagination>
        </div>
      </div>
    </div>


    <el-dialog title="填写单号" width="750px" :close-on-click-modal="false" :visible.sync="updateLogisticsVisible">
      <PerfectLogistics :formData="formData" :logisticsCompanys="logisticsCompanys"></PerfectLogistics>

      <div slot="footer" class="dialog-footer">
        <el-button @click="updateLogisticsVisible = false">取 消</el-button>
        <template v-if="$auths.includes('ship/noShippingCode')">
          <el-button v-if="formData.type == 1" type="warning" @click="confirmNoShippingCode">免物流发货</el-button>
        </template>
        <template v-if="$auths.includes('ship/ship')">
          <el-button v-if="formData.type == 1" type="primary" @click="confirmAndDelivery">确认单号并发货</el-button>
        </template>
        <template v-if="$auths.includes('ship/updateShip')">
          <el-button v-if="formData.type == 1" type="primary" @click="confirmShippingCode">确认单号</el-button>
          <el-button v-if="formData.type == 2" type="warning" @click="confirmShippingCode">修改单号</el-button>
        </template>

      </div>
    </el-dialog>

    <el-dialog title="修改收货人相关信息" width="750px" :close-on-click-modal="false" :visible.sync="logisticsInfoVisible">
      <LogisticsInfo ref="logisticsInfo" :formData="formData"></LogisticsInfo>
      <div slot="footer" class="dialog-footer">
        <el-button @click="logisticsInfoVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateLogisticsInfo">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="物流信息" width="750px" :visible.sync="logisticsVisible">
      <LogisticsDetail :formData="logisticsData"></LogisticsDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="logisticsVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="商品数量拆分" width="750px" :close-on-click-modal="false" :visible.sync="breakSkuNumVisible">
      <BreakSkuNum :formData="formData"></BreakSkuNum>
      <div slot="footer" class="dialog-footer">
        <el-button @click="breakSkuNumVisible = false">取 消</el-button>
        <el-button type="primary" @click="breakSkuNum">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="验证导入数据" width="1200px" :close-on-click-modal="false" :visible.sync="validVisible">
      <ValidOrders ref="valid" :validDatas="validDatas"></ValidOrders>
    </el-dialog>

    <el-dialog title="验证导出数据/备货" width="1200px" :close-on-click-modal="false" :destroy-on-close="true"
      :visible.sync="validExportVisible">
      <ValidExportOrders v-if="validExportVisible" ref="validExport" :exportSummary="exportSummary"></ValidExportOrders>
      <div slot="footer" class="dialog-footer">
        <el-button @click="validExportVisible = false">取 消</el-button>
        <template v-if="$auths.includes('ship/storing')">
          <el-button type="primary" @click="confirmExportAndStockup">确定并更改为备货状态</el-button>
        </template>
      </div>
    </el-dialog>
    <el-dialog title="导出数据汇总错误信息" width="600" :visible.sync="validExportErrorVisible">
      <div>汇总面板数据出现了某些错误，建议您重新刷新页面、查询、导出。如多次弹出该窗口请联系工程师检查原因</div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="validExportErrorVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="批量导入订单" width="900px" :close-on-click-modal="false" :visible.sync="importOrdersVisible">
      <ImportOrders ref="importOrders"></ImportOrders>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importOrdersVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelectImportOrders">确 定</el-button>
      </div>
    </el-dialog>


    <el-dialog title="筛选商品" width="1200px" :close-on-click-modal="false" :visible.sync="selectGoodsVisible">
      <SelectGoods ref="selectGoods"></SelectGoods>
      <div slot="footer" class="dialog-footer">
        <el-button @click="selectGoodsVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSelectGoods">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="海外购/特殊商品补充信息" width="600px" :visible.sync="attachInfosVisible">
      <OrderAttachInfos :formData="formData"></OrderAttachInfos>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="attachInfosVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修正海外购/特殊商品补充信息" width="600px" :close-on-click-modal="false" :visible.sync="editAttachInfosVisible">
      <EditAttachInfos :formData="formData"></EditAttachInfos>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editAttachInfosVisible = false">取 消</el-button>
        <el-button type="primary" @click="tryEditAttachInfos">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="选择自动拆单的周期" width="600px" :close-on-click-modal="false" :visible.sync="splitTimesVisible">
      <SplitTimes ref="splitCycle" :splitInitTime="splitCycle" :lastUpdateTimes="lastUpdateTimes"></SplitTimes>
      <div slot="footer" class="dialog-footer">
        <el-button @click="splitTimesVisible = false">取 消</el-button>
        <el-button type="primary" @click="autoSplit(true)">确定时间并拆单</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import moment from 'moment';
import XLSX from 'xlsx';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import AddressParse from '@/plugins/address-parse/parse';

import PerfectLogistics from '@/partialviews/order/PerfectLogistics';
import LogisticsDetail from '@/partialviews/order/LogisticsDetail';
import LogisticsInfo from '@/partialviews/order/deliverOrder/logisticsInfo';
import BreakSkuNum from '@/partialviews/order/deliverOrder/BreakSkuNum';
import ValidOrders from '@/partialviews/order/deliverOrder/ValidOrders';
import ValidExportOrders from '@/partialviews/order/deliverOrder/ValidExportOrders';

import ImportOrders from '@/partialviews/order/deliverOrder/ImportOrders';

import SelectGoods from '@/partialviews/common/SelectGoods';

import OrderAttachInfos from '@/partialviews/order/OrderAttachInfos';
import EditAttachInfos from '@/partialviews/order/deliverOrder/EditAttachInfos';
import SplitTimes from '@/partialviews/order/deliverOrder/SplitTimes';

import {nTimePickerConfig} from '@/config';


export default {
  name: 'orders',
  components: {
    PerfectLogistics,
    LogisticsDetail,
    LogisticsInfo,
    BreakSkuNum,
    ValidOrders,
    ValidExportOrders,
    ImportOrders,
    SelectGoods,
    OrderAttachInfos,
    EditAttachInfos,
    SplitTimes
  },
  data() {
    return {
      supplierLoading: false,

      currentPage: 1,
      pageCount: 10,
      count: 1,

      showExtendFilter: false,  //是否显示高级筛选项（商品筛选、物流信息筛选）
      queryForm: {
        searOrderSn: '',
        searType: '',
        order_type: null,
        pay_type: null,
        order_sign: [],
        searSupplierCode: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        searMoreGoodsOrder: 0,
        shipping_status: '',

        exportPageNum: 1,
        exportNum: 1000,
        needFormatList: 0,  //0不分组，1按商品分组，2按供应商分组

        searUserName: '',
        searUserPhone: '',
        searShippingName: '',
        searShippingPhone: '',
        searShippingCode: '',
      },
      filter: {
        searOrderSn: '',
        searType: '',
        order_type: null,
        pay_type: null,
        order_sign: [],
        searSupplierCode: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        searMoreGoodsOrder: 0,
        shipping_status: '',

        exportPageNum: 1,
        exportNum: 1000,
        needFormatList: 0,

        searUserName: '',
        searUserPhone: '',
        searShippingName: '',
        searShippingPhone: '',
        searShippingCode: ''
      },
      categories: [],
      spuList: [],
      skuList: [],
      statusTexts: {
        [1]: '未支付',
        [2]: '待发货',
        [3]: '已发货',
        [4]: '已签收',
        [5]: '退货申请',
        [6]: '退货中',
        [7]: '退货成功',
        [8]: '已完成',
        [-1]: '已取消'
      },
      afterSaleTexts: {
        [1]: '正常',
        [2]: '申请售后中',
        [3]: '售后中',
        [4]: '售后成功',
        [5]: '售后被拒',
        [-1]: '用户取消售后'
      },
      statusColors: {
        [1]: 'warning-color',
        [5]: 'error-color',
        [6]: 'warning-color',
        [-1]: 'tips-color'
      },
      splitTypeText: {
        [1]: '子订单',
        [2]: '合并单',
        [3]: '主订单'
      },
      shippingStatusText: {
        [1]: '未发货',
        [2]: '备货中',
        [3]: '已发货'
      },
      flagColor: {
        [1]: 'red',
        [2]: 'yellow',
        [3]: 'green',
        [4]: 'blue',
        [5]: 'purple'
      },

      ...nTimePickerConfig,

      // 根据split_status键确定split_type的值。
      splitTypeMapping: {
        [1]: 2,
        [2]: 3,
        [3]: 1
      },
      dataList: [],
      logisticsAnalysis: null,
      dataLoading: false,

      exportDatas: [],  //导出订单数据
      exportSummary: {},
      exportSummaryList: [],

      formData: {},
      suppliers: [],

      logisticsData: [],
      logistics: {},
      logisticsCompanys: [],
      splitCycle: [], //自动拆单时间区间

      selectGoodsInfo: {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: [],
        searGoodsSkuSn: [],
        selectResults: []
      },

      lastUpdateTimes: null,

      thumbData: {
        type: 1
      },
      token: {
        token: localStorage.getItem('token')
      },
      validDatas: [],
      validVisible: false,
      validExportVisible: false,
      validExportErrorVisible: false, //导出汇总有点问题

      importOrdersVisible: false,      //批量导入订单

      updateLogisticsVisible: false,  //填单发货
      logisticsVisible: false,        //物流详情
      logisticsInfoVisible: false,    //联系人方式修改
      breakSkuNumVisible: false,      //拆单
      selectGoodsVisible: false,      //指定商品筛选
      attachInfosVisible: false,      //海外购补充信息
      editAttachInfosVisible: false,      //海外购补充信息
      splitTimesVisible: false,      //海外购补充信息


      isIndeterminate: false, //全选中间态
      checkAll: false,      //是否为全选

      selectOrders: [], //选中的订单值

      breakDeliveries: [[]]
    };
  },
  filters: {
    getOrderType(status, parent) {
      if(status == 3) {
        return '正常订单'
      } else if(status == 1) {
        return parent ? '拆单子订单' : '拆单主订单'
      } else if(status == 2) {
        return '合单'
      }
    },
    getOrderStatus(item) {
      let orderStatusText = '';
      if(item.order_status == 2) {
        orderStatusText = item.shipping_code ? '已填单，待发货' : '待填单发货'
      } else if(item.order_status == 3) {
        orderStatusText = '已发货'
      } else if(item.order_status == 4) {
        orderStatusText = '已签收'
      }
      if(item.shipping_type) {
        const shippingType = {
          [1]: '',
          [2]: '(免物流)'
        }
        if(shippingType[item.shipping_type]) orderStatusText += shippingType[item.shipping_type];
      }
      return orderStatusText;
    }
  },
  mounted() {
    this.getList();
    this.getLastUpdateTime();
    this.getLogisticsAnalysis();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        searOrderSn: '',
        searType: '',
        order_type: null,
        pay_type: null,
        order_sign: [],
        searSupplierCode: '',
        createDate: [moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
        searMoreGoodsOrder: 0,
        shipping_status: '',

        exportPageNum: 1,
        exportNum: 1000,
        needFormatList: 0,

        searUserName: '',
        searUserPhone: '',
        searShippingName: '',
        searShippingPhone: '',
        searShippingCode: '',
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        searOrderSn: this.queryForm.searOrderSn,
        searType: this.queryForm.searType,
        order_type: this.queryForm.order_type,
        pay_type: this.queryForm.pay_type,
        order_sign: this.queryForm.order_sign,
        searSupplierCode: this.queryForm.searSupplierCode,
        createDate: this.queryForm.createDate,
        searMoreGoodsOrder: this.queryForm.searMoreGoodsOrder,
        shipping_status: this.queryForm.shipping_status,

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum,
        needFormatList: this.queryForm.needFormatList,

        searUserName: this.queryForm.searUserName,
        searUserPhone: this.queryForm.searUserPhone,
        searShippingName: this.queryForm.searShippingName,
        searShippingPhone: this.queryForm.searShippingPhone,
        searShippingCode: this.queryForm.searShippingCode
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        pageNumber: this.pageCount,
        searOrderSn: this.filter.searOrderSn,
        searType: this.filter.searType,
        order_type: this.filter.order_type,
        pay_type: this.filter.pay_type,
        searSupplierCode: this.filter.searSupplierCode,
        searMoreGoodsOrder: this.filter.searMoreGoodsOrder,
        order_sign: this.filter.order_sign,

        order_belong: 1
      };
      if(queryVal.searType == 2) {
        queryVal.shipping_status = this.filter.shipping_status;
      }

      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        queryVal.searUserName = this.filter.searUserName;
        queryVal.searUserPhone = this.filter.searUserPhone;
        queryVal.searShippingName = this.filter.searShippingName;
        queryVal.searShippingPhone = this.filter.searShippingPhone;
        queryVal.searShippingCode = this.filter.searShippingCode;

        if(this.selectGoodsInfo.searGoodsSpuSn) queryVal.searGoodsSpuSn = this.selectGoodsInfo.searGoodsSpuSn;
        if(this.selectGoodsInfo.searGoodsSkuSn) queryVal.searGoodsSkuSn = this.selectGoodsInfo.searGoodsSkuSn;

        if(queryVal.searUserPhone && !/^1[3456789]\d{9}$/.test(queryVal.searUserPhone)) {
          return this.$message.error('筛选 用户手机号码 格式有误，请检查或留空');
        }
        if(queryVal.searShippingPhone && !/^1[3456789]\d{9}$/.test(queryVal.searShippingPhone)) {
          return this.$message.error('筛选 收件人手机号码 格式有误，请检查或留空');
        }
      }

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }
      if(!queryVal.start_time || !queryVal.end_time) {
        return this.$message.error('请选择开始时间和结束时间，再进行查询操作。建议时间跨度不要过大');
      }

      this.dataLoading = true;

      this.$post('/admin/ship/orderList', queryVal, res => {
        // 清空选中的各个项
        this.selectOrders = [];
        this.breakDeliveries = [];

        let dataList = res.data.list || [];

        for(let i = 0; i < dataList.length; i++) {
          // 格式化时间
          dataList[i].pay_time = dataList[i].pay_time ? moment(dataList[i].pay_time).format('YYYY-MM-DD HH:mm') : '——';
          dataList[i].create_time = dataList[i].create_time ? moment(dataList[i].create_time).format('YYYY-MM-DD HH:mm') : '——';

          // 组装子项
          let values = Object.values(dataList[i].goods || {}) || [];
          let sku_count = 0;
          for(let j = 0; j < values.length; j++) {
            // 拼装子项的属性规格
            let specs = JSON.parse(values[j].specs);
            let attrKeys = Object.keys(specs);
            let attrValues = Object.values(specs);

            let attrs = [];
            for(let k = 0; k < attrKeys.length; k++) {
              attrs.push(`${attrKeys[k]}:${attrValues[k]}`)
            }
            values[j].attrs = attrs.join('、');

            sku_count += values[j].count;
          }
          dataList[i].kids = values;
          dataList[i].sku_count = sku_count;

        }
        this.dataList = dataList;
        this.count = res.data.pageTotal || 1;

        this.dataLoading = false;

        let breakDeliveries = [];
        for(let i = 0; i < dataList.length; i++) {
          breakDeliveries.push([]);
        }
        this.breakDeliveries = breakDeliveries;
      }, err => {
        this.dataLoading = false;  //确定加载完了
      });
    },
    sgetList() {
      let queryVal = {
        page: this.currentPage,
        pageNumber: this.pageCount,
        searOrderSn: this.filter.searOrderSn,
        searType: this.filter.searType,
        order_type: this.filter.order_type,
        pay_type: this.filter.pay_type,
        searSupplierCode: this.filter.searSupplierCode,
        searMoreGoodsOrder: this.filter.searMoreGoodsOrder,
        order_sign: this.filter.order_sign,

        order_belong: 1
      };
      if(queryVal.searType == 2) {
        queryVal.shipping_status = this.filter.shipping_status;
      }

      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        queryVal.searUserName = this.filter.searUserName;
        queryVal.searUserPhone = this.filter.searUserPhone;
        queryVal.searShippingName = this.filter.searShippingName;
        queryVal.searShippingPhone = this.filter.searShippingPhone;
        queryVal.searShippingCode = this.filter.searShippingCode;

        if(this.selectGoodsInfo.searGoodsSpuSn) queryVal.searGoodsSpuSn = this.selectGoodsInfo.searGoodsSpuSn;
        if(this.selectGoodsInfo.searGoodsSkuSn) queryVal.searGoodsSkuSn = this.selectGoodsInfo.searGoodsSkuSn;

        if(queryVal.searUserPhone && !/^1[3456789]\d{9}$/.test(queryVal.searUserPhone)) {
          return this.$message.error('筛选 用户手机号码 格式有误，请检查或留空');
        }
        if(queryVal.searShippingPhone && !/^1[3456789]\d{9}$/.test(queryVal.searShippingPhone)) {
          return this.$message.error('筛选 收件人手机号码 格式有误，请检查或留空');
        }
      }

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        queryVal.start_time = this.filter.createDate[0];
        queryVal.end_time = this.filter.createDate[1];
      }
      if(!queryVal.start_time || !queryVal.end_time) {
        return this.$message.error('请选择开始时间和结束时间，再进行查询操作。建议时间跨度不要过大');
      }

      this.dataLoading = true;

      this.$spost('/admin/ship/orderList', queryVal, res => {
        // 清空选中的各个项
        this.selectOrders = [];
        this.breakDeliveries = [];

        let dataList = res.data.list || [];

        for(let i = 0; i < dataList.length; i++) {
          // 格式化时间
          dataList[i].pay_time = dataList[i].pay_time ? moment(dataList[i].pay_time).format('YYYY-MM-DD HH:mm') : '——';
          dataList[i].create_time = dataList[i].create_time ? moment(dataList[i].create_time).format('YYYY-MM-DD HH:mm') : '——';

          // 组装子项
          let values = Object.values(dataList[i].goods || {}) || [];
          let sku_count = 0;
          for(let j = 0; j < values.length; j++) {
            // 拼装子项的属性规格
            let specs = JSON.parse(values[j].specs);
            let attrKeys = Object.keys(specs);
            let attrValues = Object.values(specs);

            let attrs = [];
            for(let k = 0; k < attrKeys.length; k++) {
              attrs.push(`${attrKeys[k]}:${attrValues[k]}`)
            }
            values[j].attrs = attrs.join('、');

            sku_count += values[j].count;
          }
          dataList[i].kids = values;
          dataList[i].sku_count = sku_count;

        }
        this.dataList = dataList;
        this.count = res.data.pageTotal || 1;

        this.dataLoading = false;

        let breakDeliveries = [];
        for(let i = 0; i < dataList.length; i++) {
          breakDeliveries.push([]);
        }
        this.breakDeliveries = breakDeliveries;
      }, err => {
        this.dataLoading = false;  //确定加载完了
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    handleSizeChange(value) {
      this.pageCount = value;
      this.currentPage = 1;
      this.getList();
    },

    getSuppliers(keyword = '') {
      if(!this.$auths.includes('supplier/list')) return;
      let params = {
        keyword: keyword
      }

      this.supplierLoading = true;
      this.$sget('/admin/supplier/list', params, res => {
        let data = res.data;
        this.suppliers = data;
        this.supplierLoading = false;
      }, err => {
        this.supplierLoading = false;
      });
    },
    updateSupplierFilter(keyword) {
      this.getSuppliers(keyword);
    },


    extendFilter() {
      this.showExtendFilter = !this.showExtendFilter;
    },
    showSelectGoods() {
      this.selectGoodsVisible = true;
    },
    confirmSelectGoods() {
      let selectGoodsInfo = this.$refs.selectGoods.confirmSelectResult();
      if(
        (!selectGoodsInfo.searGoodsSkuSn || selectGoodsInfo.searGoodsSkuSn.length == 0) &&
        (!selectGoodsInfo.searGoodsSpuSn || selectGoodsInfo.searGoodsSpuSn.length == 0)) {
        return this.$message.error('请选择至少一项spu或者sku');
      }
      this.selectGoodsInfo = selectGoodsInfo;
      this.selectGoodsVisible = false;
    },
    resetSelectGoods() {
      this.selectGoodsInfo = {
        type: 1, //1spu, 2sku
        searGoodsSpuSn: [],
        searGoodsSkuSn: [],
        selectResults: []
      }
      this.$refs.selectGoods.resetSpuList();
    },

    getLastUpdateTime() {
      this.$get('/admin/ship/syncTime', null, res => {
        let lastUpdateTimes = res.data;
        lastUpdateTimes.create_time = moment(lastUpdateTimes.create_time).format('YYYY年MM月DD日 HH:mm:ss');
        this.lastUpdateTimes = lastUpdateTimes;
      });
    },

    getLogisticsAnalysis() {
      if(!this.$auths.includes('ship/summary')) {
        return;
      }
      this.$get('/admin/ship/summary', null, res => {
        let logisticsAnalysis = res.data;
        if(logisticsAnalysis.status && logisticsAnalysis.status.length > 0) {
          for(let i = 0; i < logisticsAnalysis.status.length; i++) {

            let percent = parseInt(parseFloat(logisticsAnalysis.status[i].scale) * 10000) / 100;
            if(percent.toString().includes('.')) percent.toFixed(2);
            logisticsAnalysis.status[i].percent = percent;
          }
        }
        this.logisticsAnalysis = logisticsAnalysis;
      });
    },

    syncData() {
      // 同步数据
      this.$loading({text: '同步中，因数据量大可能需要几分钟，期间请不要关闭、刷新页面'});  //同步操作需要自行加loading框
      let params = {
        // searTime: {
        //   start_time: moment(new Date()).subtract(3, 'days').format('YYYY-MM-DD HH:mm'),
        //   end_time: moment(new Date()).format('YYYY-MM-DD HH:mm')
        // }
      }
      this.$syncPost('/admin/ship/sync', params, res => {
        this.$message.success('同步成功');
        this.autoSplit();
      });

    },
    autoSplit(force = false) {
      // 同步数据
      if(!this.$auths.includes('ship/autoSplit')) {
        return this.$message.warning('无自动拆单权限，系统不为您进行拆单操作，如需自动拆单请联系管理员为您增加相关权限');
      }

      let params = {};
      if(force) {
        let splitCycle = this.$refs.splitCycle.returnTimeResult();
        if(!splitCycle || !splitCycle.start_time || !splitCycle.end_time) return this.$message.error('请选择自动拆单的周期');
        params.start_time = splitCycle.start_time;
        params.end_time = splitCycle.end_time;

        let endTime = moment(params.end_time).format('YYYY/MM/DD HH:mm:ss');
        let lastTime = moment(this.lastUpdateTimes.create_time).format('YYYY/MM/DD HH:mm:ss');
        if(moment(lastTime).diff(moment(endTime)) < 0) {
          return this.$message.error('周期结束时间要比最后一次同步时间早');
        }
      }
      this.$loading({text: '自动拆单中，期间请一定不要关闭、刷新页面或进行其他操作，否则可能造成数据大批量错误！因数据量大可能需要几分钟，请耐心等待'});  //同步操作需要自行加loading框
      this.$syncPost('/admin/ship/autoSplit', params, res => {
        this.$message.success('自动拆单成功');
        if(force) this.splitTimesVisible = false;
        this.getList();
      });

    },

    trySplitTimes() {
      this.$get('/admin/ship/syncTime', {
        type: 2
      }, res => {
        let data = res.data;
        if(!data || data.length == 0) {
          return this.$message.error('至少需要同步过一次，请您有过同步再进行此操作');
        } else if(data.length == 1) {
          this.splitCycle = [
            moment(data[0].create_time).subtract(1, 'days').format('YYYY-MM-DD 00:00:00'),
            moment(data[0].create_time).format('YYYY-MM-DD HH:mm:ss')
          ];
          let lastUpdateTimes = data[0];
          lastUpdateTimes.create_time = moment(lastUpdateTimes.create_time).format('YYYY年MM月DD日 HH:mm:ss');
          this.lastUpdateTimes = lastUpdateTimes;
          if(this.$refs.splitCycle) this.$refs.splitCycle.initTime(this.splitCycle);
          this.splitTimesVisible = true;
        } else if(data.length == 2) {
          this.splitCycle = [
            moment(data[1].create_time).format('YYYY-MM-DD HH:mm:ss'),
            moment(data[0].create_time).format('YYYY-MM-DD HH:mm:ss')
          ];
          let lastUpdateTimes = data[0];
          lastUpdateTimes.create_time = moment(lastUpdateTimes.create_time).format('YYYY年MM月DD日 HH:mm:ss');
          this.lastUpdateTimes = lastUpdateTimes;
          if(this.$refs.splitCycle) this.$refs.splitCycle.initTime(this.splitCycle);
          this.splitTimesVisible = true;
        }
      });
    },

    handleSelectChange() {
      if(this.selectOrders.length == this.dataList.length) {
        this.isIndeterminate = false;
        this.checkAll = true;
      } else if(this.selectOrders.length > 0) {
        this.isIndeterminate = true;
        this.checkAll = false;
      } else {
        this.isIndeterminate = false;
        this.checkAll = false;
      }
    },

    handleCheckAllChange() {
      if(this.checkAll) {
        this.isIndeterminate = false;
        let selectOrders = [];
        for(let i = 0; i < this.dataList.length; i++) {
          selectOrders.push(i);
        }
        this.selectOrders = selectOrders;
      }  else {
        this.checkAll = false;
        this.selectOrders = [];
      }
    },

    showBreakSkuNum(row, parentIndex) {

      this.formData = {
        title: row.title,
        count: row.count,
        order_sn: this.dataList[parentIndex].order_sn,
        sku_sn: row.sku_sn,
        number: 0,
        split_type: this.splitTypeMapping[this.dataList[parentIndex].split_status]
      }
      this.breakSkuNumVisible = true;
    },
    mergeSelectOrders() {
      // 合单操作
      for(let i = 0; i < this.selectOrders.length; i++) {
        let item = this.dataList[this.selectOrders[i]];
        if(item.split_status != 1 && item.split_status != 3) {
          return this.$message.error('选中的项中出现了已合并的订单，请检查。选中的各个项要么都要为同一个订单的拆单或者都要为正常订单哦');
        }
        if(item.shipping_code) {
          return this.$message.error('选中的项中出现了已填单/发货的订单，请检查。');
        }
        if(item.shipping_status == 2 || item.shipping_status == 3) {
          return this.$message.error('选中的项中出现了备货中的订单，请检查。');
        }
      }

      let originItem = this.dataList[this.selectOrders[0]];
      let sn = [originItem.order_sn];
      for(let i = 1; i < this.selectOrders.length; i++) {
        let item = this.dataList[this.selectOrders[i]];
        if(item.split_status != originItem.split_status) {
          return this.$message.error('选中的订单中有状态不一致的订单，请检查。选中的各个项要么都要为同一个订单的拆单或者都要为正常订单哦');
        } else {
          if(
            item.parent_order_sn != originItem.order_sn &&
            item.parent_order_sn != originItem.parent_order_sn &&
            originItem.parent_order_sn != item.order_sn
            ) {
            return this.$message.error('选中的各个项要么都要为同一个订单的拆单或者都要为正常订单哦');
          }
        }
        if(
          item.shipping_name != originItem.shipping_name ||
          item.shipping_phone != originItem.shipping_phone ||
          item.shipping_address != originItem.shipping_address ||
          item.uid != originItem.uid
        ) {
          return this.$message.error('选中的项存在订单购买人、收货联系人、联系电话、收货地址不一致的情况，无法合并订单，请检查哦');
        }
        sn.push(item.order_sn);
      }
      let params = {
        order_sn: sn,
        merge_type: originItem.split_status == 1 ? 2 : 1    //1正常订单，2子订单
      }
      this.$post('/admin/ship/merge', params, res => {
        this.$message.success('合单成功');
        this.reloadPage();
      });
    },
    restoreMergeOrder(order) {
      // 还原拆单
      this.$confirm('正常订单的合单可以还原为合并前的订单，是否还原', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          order_sn: order.order_sn
        }
        this.$post('/admin/ship/cancelMerge', params, res => {
          this.$message.success('取消合单成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
    breakSkuNum() {
      // 同个sku拆分数量
      let params = {
        order_sn: this.formData.order_sn,
        sku_sn: [this.formData.sku_sn],
        split_type: this.formData.split_type
      };
      if(!(/^[1-9]\d*$/.test(this.formData.number)) || parseInt(this.formData.number) >= this.formData.count) {
        return this.$message.error(`拆的数量超过或等于总数的${this.formData.count}件，请检查哦，需要小于总数且为1，2，3，4这种正整数`)
      }
      params.sku_sn_number = {};
      params.sku_sn_number[this.formData.sku_sn] = this.formData.number;
      delete(params.number);
      this.$post('/admin/ship/split', params, res => {
        this.$message.success('拆单成功');
        this.breakSkuNumVisible = false;
        this.reloadPage();
      });
    },
    breakDeliveryOrder(order, index) {
      if(this.breakDeliveries[index].length == this.dataList[index].kids.length) {
        return this.$message.error(`您勾选了该订单下所有的sku项，拆单无意义，请检查哦`)
      }
      // 拆单操作
      let params = {
        order_sn: order.order_sn,
        sku_sn: [],
        split_type: this.splitTypeMapping[order.split_status]
      }

      for(let i = 0; i < this.breakDeliveries[index].length; i++) {
        params.sku_sn.push(order.kids[this.breakDeliveries[index][i]].sku_sn)
      }

      this.$post('/admin/ship/split', params, res => {
        this.$message.success('拆单成功');
        this.reloadPage();
      });
    },
    restoreDeleveryOrder(order) {
      // 还原拆单
      this.$confirm('是否将该拆出来的订单还原到原有订单', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          order_sn: order.order_sn
        }
        this.$post('/admin/ship/cancelSplit', params, res => {
          this.$message.success('还原拆单成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },


    // 发货弹窗
    showUpdateLogisticsPopup(row, type) {
      this.formData = {
        type: type,
        order_ship: []
      }
      let index = 0; //选中哪个快递公司项
      if(this.logisticsCompanys[0]) {
        if(type == 2) index = this.getCompanyIndex(row.shipping_company_code, this.logisticsCompanys);
        this.formData.order_ship.push({
          order_sn: row.order_sn,
          company: this.logisticsCompanys[index].company,
          company_code: this.logisticsCompanys[index].company_code,
          shipping_code: type == 1 ? '' : row.shipping_code,
          index: index
        })
        this.updateLogisticsVisible = true;
      } else {
        this.$get('/admin/ship/company', null, res => {
          this.logisticsCompanys = res.data;
          if(type == 2) index = this.getCompanyIndex(row.shipping_company_code, this.logisticsCompanys);
          this.formData.order_ship.push({
            order_sn: row.order_sn,
            company: this.logisticsCompanys[index].company,
            company_code: this.logisticsCompanys[index].company_code,
            shipping_code: type == 1 ? '' : row.shipping_code,
            index: index
          })
          this.updateLogisticsVisible = true;
        });
      }
    },
    getCompanyIndex(company_code, companies) {
      let index = 0;
      for(let i = 0; i < companies.length; i++) {
        if(companies[i].company_code == company_code) {
          index = i;
          break;
        }
      }
      return index;
    },

    confirmShippingCode() {
      // 填单，但不发货    或者   修改操作(type == 3)
      let params = JSON.parse(JSON.stringify(this.formData));
      for(let i = 0; i < params.order_ship.length; i++) {
        if(params.order_ship[i].shipping_code == undefined ||
          params.order_ship[i].shipping_code == null ||
          params.order_ship[i].shipping_code === "") {
            return this.$message.error("请填写快递单号哦");
          }
        if(!/^[a-zA-Z0-9]*$/.test(params.order_ship[i].shipping_code)) {
          return this.$message.error("快递单号格式有误哦，必须是大小写字母或数字");
        }
      }
      this.$post('/admin/ship/updateShip', params, res => {
        this.$message.success(params.type == 3 ? '修改单号成功' : '填单成功');
        this.updateLogisticsVisible = false;
        this.reloadPage();
      });

    },
    confirmAndDelivery() {
      // 确定单号并发货， 合并操作
      let params = JSON.parse(JSON.stringify(this.formData));
      for(let i = 0; i < params.order_ship.length; i++) {
        if(params.order_ship[i].shipping_code == undefined ||
          params.order_ship[i].shipping_code == null ||
          params.order_ship[i].shipping_code === "") {
            return this.$message.error("请填写订单编号哦");
          }
        if(!/^[a-zA-Z0-9]*$/.test(params.order_ship[i].shipping_code)) {
          return this.$message.error("快递单号格式有误哦，必须是大小写字母或数字");
        }
      }

      this.$post('/admin/ship/ship', params, res => {
        let data = res.data;
        if(data.fail.count > 0) {
          this.$message.warning(`填单发货结果：成功 ${data.success.count || 0} 个，失败 ${data.fail.count} 个。其中订单${data.fail.order.join('、')}操作失败，请重试`);
        } else {
          this.$message.success('填单并发货成功');
          this.updateLogisticsVisible = false;
          this.reloadPage();
        }
      });
    },
    confirmNoShippingCode() {
      this.$confirm('确定对该订单进行免物流发货操作吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        let params = {
          order_sn: [this.formData.order_ship[0].order_sn]
        }
        this.$post('/admin/ship/noShippingCode', params, res => {
          let data = res.data;
          if(data.fail.count > 0) {
            this.$message.warning(`免物流发货结果：成功 ${data.success.count || 0} 个，失败 ${data.fail.count} 个。其中订单${data.fail.order.join('、')}操作失败，请重试`);
          } else {
            this.$message.success('免物流发货成功');
            this.updateLogisticsVisible = false;
            this.reloadPage();
          }
        });
      }).catch(() => {});

    },
    toggleStockUp(row) {
      let title = row.shipping_status == 2 ? '确定取消该订单的备货状态吗' : '确定对该订单进行备货操作吗';
      this.$confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        let params = {
          order_sn: [row.order_sn],
          type: row.shipping_status
        }
        this.$post('/admin/ship/storing', params, res => {
          let successText = row.shipping_status == 2 ? '取消备货状态成功' : '订单备货操作成功';
          this.$message.success(successText);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    confirmDelivery(row) {
      // 确定发货，需要已填单
      let params = {
        order_ship: [{
          order_sn: row.order_sn,
          company: row.shipping_company,
          company_code: row.shipping_company_code,
          shipping_code: row.shipping_code,
        }]
      }
      for(let i = 0; i < params.order_ship.length; i++) {
        if(params.order_ship[i].shipping_code == undefined ||
          params.order_ship[i].shipping_code == null ||
          params.order_ship[i].shipping_code === "") {
            return this.$message.error("该订单的快递单号还没填写哦，请修改完重试");
          }
        if(!/^[a-zA-Z0-9]*$/.test(params.order_ship[i].shipping_code)) {
          return this.$message.error("该订单的快递单号格式有误哦，必须是大小写字母或数字，请修改完重试");
        }
      }
      this.$post('/admin/ship/ship', params, res => {
        let data = res.data;
        if(data.fail.count > 0) {
          this.$message.warning(`发货结果：成功 ${data.success.count || 0} 个，失败 ${data.fail.count} 个。其中订单${data.fail.order.join('、')}操作失败，请重试`);
        } else {
          this.$message.success('发货成功');
          this.reloadPage();
        }
      });
    },


    checkLogistics(row) {
      let params = {
        shipping_code: row.shipping_code
      };

      this.$get('/admin/ship/info', params, res => {
        let logisticsInfo = res.data;
        let keys = Object.keys(logisticsInfo);
        let values = Object.values(logisticsInfo);
        let logisticsData = [];
        for(let i = 0; i < keys.length; i++) {
          logisticsData.push({
            shipping_code: keys[i],
            company_name: values[i][0] ? values[i][0].company_name : '未知名物流',
            logistics: values[i]
          })
        }
        this.logisticsData = logisticsData;
        this.logisticsVisible = true;
      });
    },

    quicklyDelivery() {
      // 一键发货
      let params = {
        order_ship: []
      };
      for(let i = 0; i < this.selectOrders.length; i++) {
        let item = this.dataList[this.selectOrders[i]];
        if(item.order_status != 2 || !item.shipping_code) {
          return this.$message.error(`第${this.selectOrders[i] + 1}项的订单状态或填单状态有问题，请检查。选中的订单项需要为已填单的待发货订单`);
        }
        params.order_ship.push({
          order_sn: item.order_sn,
          company: item.shipping_company,
          company_code: item.shipping_company_code,
          shipping_code: item.shipping_code
        })
      }

      for(let i = 0; i < params.order_ship.length; i++) {
        if(params.order_ship[i].shipping_code == undefined ||
          params.order_ship[i].shipping_code == null ||
          params.order_ship[i].shipping_code === "") {
            return this.$message.error(`第${this.selectOrders[i] + 1}个订单的快递单号还没填写哦，请修改完重试`);
          }
        if(!/^[a-zA-Z0-9]*$/.test(params.order_ship[i].shipping_code)) {
          return this.$message.error(`第${this.selectOrders[i] + 1}个订单的快递单号格式有误哦，必须是大小写字母或数字，请修改完重试`);
        }
      }
      // 一键对选中项进行发货操作前的询问
      this.$confirm('确定对选中的各个订单进行发货操作吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        this.$post('/admin/ship/ship', params, res => {
          let data = res.data;
          if(data.fail.count > 0) {
            this.$message.warning(`批量发货结果：成功 ${data.success.count || 0} 个，失败 ${data.fail.count} 个。其中订单${data.fail.order.join('、')}操作失败，请重试`);
          } else {
            this.$message.success('批量发货成功');
            this.reloadPage();
          }
        });
      }).catch(() => {});
    },


    showLogisticsInfoPopup(row) {
      // 弹修改联系方式弹窗
      this.formData = {
        order_sn: row.order_sn,
        shipping_name: row.shipping_name,
        shipping_phone: row.shipping_phone,
        shipping_address: row.shipping_address
      }
      if(this.$refs.logisticsInfo) this.$refs.logisticsInfo.reInit();
      this.logisticsInfoVisible = true;
    },
    updateLogisticsInfo() {
      // 修改收货人联系方式、地址
      let params = JSON.parse(JSON.stringify(this.formData));
      let infoValues = Object.values(params);
      for(let i = 0; i < infoValues.length; i++) {
        if(infoValues[i] == undefined || infoValues[i] == null || infoValues[i] === '') {
          return this.$message.error('所有项都必填，请检查');
        }
      }
      if(params.shipping_phone && !/^1[3456789]\d{9}$/.test(params.shipping_phone)) {
        return this.$message.error('手机号码格式有误，请检查');
      }


      let shipping_address = params.shipping_address;

      let discernResults = AddressParse.parse(shipping_address);
      if(!discernResults || discernResults.length === 0) {
        return this.$message.error('未匹配到有效收货地址，请检查');
      }
      let address = discernResults[0];
      if(!address.area || address.area === '') {
        //数据可信任度比较低，不做数据填充。对东莞和中山做额外判断
        return this.$message.error('收货地址可能存在问题，请检查');
      }


      let shipping_address_detail = {
        Province: address.province,
        City: address.city,
        Area: address.area,
        ProvinceId: address.code.substring(0, 2),
        CityId: address.code.substring(0, 4),
        AreaId: address.code,
        address: address.details
      }
      params.shipping_address_detail = shipping_address_detail;

      this.$post('/admin/ship/updateShipInfo', params, res => {
        this.$message.success('修改收货人信息成功');
        this.logisticsInfoVisible = false;
        this.reloadPage();
      });
    },

    showImportOrders() {
      this.importOrdersVisible = true;
      this.$nextTick(() => {
        if(this.$refs.importOrders) this.$refs.importOrders.resetFiles();
      })
    },
    confirmSelectImportOrders(res, file) {
      let selectResult = this.$refs.importOrders.getSelectResult();
      if(selectResult) {
        console.log(selectResult);
        this.validDatas = selectResult;
        this.validVisible = true;
        this.$forceUpdate();
        setTimeout(() => {
          this.$refs.valid.resetTabel();
          this.$refs.valid.$message.success('载入选中文件数据成功，请你校对相关数据');
        })
      }
    },

    noCodeOrderWatcher(file) {
      this.$loading({
        text: '导入中'
      });
      if (file.type != 'application/vnd.ms-excel' && file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        if(file.type == '' && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {

          this.$refs.noCodeOrder.clearFiles();
          this.$message.error('只能上传正确的.xls或.xlsx文件哦');
          this.$loading().close();
          return false;
        }
      }

      // 涉及到文件的读取，有可能执行脚本失败，多加两步catch，避免脚本卡机
      try {

        let reader = new FileReader();  //创建文件读取器
        reader.onload = e => {  //挂载load函数，监听读取文件完毕时的处理函数在此
          try {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, {type: 'array'});
            this.ValidImportExcelData(workbook);
          } catch(err) {
            console.log(err, this);
            this.$message.error('尝试读取文件内容失败，请重试');
            this.$refs.noCodeOrder.clearFiles();
            this.$loading().close();
          }
        }
        reader.readAsArrayBuffer(file); //读取上传的excel文件
      } catch(err) {
        this.$message.error('读取文件内容失败，请重试');
        this.$refs.noCodeOrder.clearFiles();
        this.$loading().close();
      }
      return false; //无论最后校验如何，都不往服务器上传。
    },
    /**
     * @param workbook 读取到的excel信息
    */
    ValidImportExcelData(workbook) {
      if(!workbook.SheetNames || workbook.SheetNames.length == 0) {
        // 没有工作表表名，有问题
        return this.$message.error('导入的excel文件的工作表有问题，请检查。 请注意：系统只读excel里第一个工作表。');
      }
      if(!workbook.SheetNames[0] || !workbook.Sheets[workbook.SheetNames[0]] || !workbook.Sheets[workbook.SheetNames[0]]['!ref']) {
        // 没有有效区间数据
        return this.$message.error('导入的excel文件的工作表里表格数据有问题，请检查。请检查是否有数据在表格中');
      }
      let sheet = workbook.Sheets[workbook.SheetNames[0]];
      let validColKeys = ['A']; //待读取的列索引
      let validArea = sheet['!ref'].split(':');
      let validRowKeys = validArea[1] ? validArea[1].replace(/[^0-9]/ig,"") : validArea[0].replace(/[^0-9]/ig,"");  //检查有效范围，一般取第二个边界值。但是只有起始一格的情况下只会有第一个边界值
      validRowKeys = parseInt(validRowKeys);  //字符串格式转为数字格式，以便于作为循环判断边界

      /**
       * @var list excel中的数据集。
       * @var errorArray excel中数据集的异常数据。
       */
      let list = [];
      for(let i = 2; i <= validRowKeys; i++) { //要从索引2开始，即忽略第一行。要小于等于最后一行
        for(let j = 0; j < validColKeys.length; j++) {
          let loadCube = validColKeys[j] + i; //读取单元格索引，A1,B1...
          let order_sn = sheet[loadCube].v;
          if(!order_sn || order_sn.trim() === '') {
            this.$loading().close();
            return this.$message.error(`第${i}行订单号有误，请检查`)
          }
          list.push(order_sn)
        }
      }
      this.$loading().close();

      if(list.length == 0) return this.$message.error(`无有效导入订单数据`);

      this.tryHandlerNoCodeOrders(list);
      return false;

    },
    noCodeOrderUploadError() {
      this.$refs.noCodeOrder.clearFiles();
      this.$message.error('文件未被正确上传，请检查文件合法性或检查您的网络哦');
    },
    /**
     * @param list 订单sn列表
     */
    tryHandlerNoCodeOrders(list) {
      this.$confirm(`确定对这${list.length}条订单都进行免物流发货操作吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        let params = {
          order_sn: list
        }
        this.$post('/admin/ship/noShippingCode', params, res => {
          let data = res.data;
          if(data.fail.count > 0) {
            this.$message.warning(`免物流发货结果：成功 ${data.success.count || 0} 个，失败 ${data.fail.count} 个。其中订单${data.fail.order.join('、')}操作失败，请重试`);
          } else {
            this.$message.success('免物流发货成功');
            this.reloadPage();
          }
        });
      }).catch(() => {});
    },

    showAttachInfos(order) {
      let attach = order.attach;
      this.formData = attach;
      this.attachInfosVisible = true;
    },

    showEditAttachInfos(order) {
      let attach = order.attach;
      attach.shipping_name = order.shipping_name;
      if(order.parent_order_sn) attach.order_sn = order.parent_order_sn;
      if(!attach.id_card_front) delete attach.id_card_front;
      if(!attach.id_card_back) delete attach.id_card_back;
      this.formData = attach;
      this.editAttachInfosVisible = true;
    },

    tryEditAttachInfos() {
      let params = this.formData;
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，需要身份证图的商品需要上传身份证正反面图哦');
        }
      }
      if(params.real_name != params.shipping_name) {
        return this.$message.error('真实姓名需与收货人姓名一致');
      }
      if(!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(params.id_card)) {
        return this.$message.error('身份证格式有误请检查');
      }

      this.$post('/admin/ship/updateAttach', params, res => {
        this.$message.success('修正海外购/特殊商品补充信息成功');
        this.editAttachInfosVisible = false;
        this.reloadPage();
      });

    },

    getExportDatas() {
      let params = {
        searOrderSn: this.filter.searOrderSn,
        searType: this.filter.searType,
        order_sign: this.filter.order_sign,
        order_type: this.filter.order_type,
        pay_type: this.filter.pay_type,
        searSupplierCode: this.filter.searSupplierCode,
        searMoreGoodsOrder: this.filter.searMoreGoodsOrder,
        order_belong: 1,

        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈

        needFormatList: this.filter.needFormatList   //是否要将数据分组， 0否，1按商品分组，2按供应商分组
      }
      if(params.searType == 2) {
        params.shipping_status = this.filter.shipping_status;
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      if(this.showExtendFilter) {
        // 展开高级搜索，将参数还给他
        params.searUserName = this.filter.searUserName;
        params.searUserPhone = this.filter.searUserPhone;
        params.searShippingName = this.filter.searShippingName;
        params.searShippingPhone = this.filter.searShippingPhone;
        params.searShippingCode = this.filter.searShippingCode;

        if(this.selectGoodsInfo.searGoodsSpuSn) params.searGoodsSpuSn = this.selectGoodsInfo.searGoodsSpuSn;
        if(this.selectGoodsInfo.searGoodsSkuSn) params.searGoodsSkuSn = this.selectGoodsInfo.searGoodsSkuSn;

        if(params.searUserPhone && !/^1[3456789]\d{9}$/.test(params.searUserPhone)) {
          return this.$message.error('筛选 用户手机号码 格式有误，请检查或留空');
        }
        if(params.searShippingPhone && !/^1[3456789]\d{9}$/.test(params.searShippingPhone)) {
          return this.$message.error('筛选 收件人手机号码 格式有误，请检查或留空');
        }
      }

      if(this.filter.createDate && this.filter.createDate.length == 2) {
        params.start_time = this.filter.createDate[0];
        params.end_time = this.filter.createDate[1];
      }
      if(!params.start_time || !params.end_time) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }
      this.$post('/admin/excel/shipOrder', params, res => {
        let data = res.data.list || [];
        let names = [];
        if(params.needFormatList == 0) {
          // 是不分的，塞到一个列表去
          let parseData = {
            info: {
              name: '不分组'
            },
            orderList: []
          }
          parseData.orderList.push(...data);
          data = [parseData];
        } else if(params.needFormatList == 1) {
          // 按商品分组
          for(let i = 0; i < data.length; i++) {
            data[i].info.name = data[i].info.title.length > 18 ? data[i].info.title.slice(0, 12) : data[i].info.title;
            data[i].info.name = data[i].info.name.replace(/[^\u4E00-\u9FA5A-Za-z0-9_]/g, '');
            if(names.includes(data[i].info.name)) {
              let ran = (Math.ceil(Math.random() * 100000)).toString() + '_' + (Math.ceil(Math.random() * 100000)).toString();
              data[i].info.name += ran;
            }
            names.push(data[i].info.name);
          }
        } else if(params.needFormatList == 2) {
          // 按供应商分组，本来就有name字段
          for(let i = 0; i < data.length; i++) {
            data[i].info.name = data[i].info.name.replace(/[^\u4E00-\u9FA5A-Za-z0-9_]/g, '');
            if(names.includes(data[i].info.name)) {
              let ran = data[i].info.supplier_code;
              data[i].info.name += ran;
            }
            names.push(data[i].info.name);
          }
        }

        let exportDataLen = 0;
        for(let i = 0; i < data.length; i++) {
          exportDataLen += data[i].orderList.length;
        }

        if(exportDataLen == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(exportDataLen > 100000) {
          return this.$message.warning('订单数超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        // 对数据的地址进行省市区识别、拆分
        for(let i = 0; i < data.length; i++) {
          let orders = data[i].orderList;
          for(let j = 0; j < orders.length; j++) {
            let shipping_address = orders[j].shipping_address;
            let discernResults = AddressParse.parse(shipping_address);
            if(!discernResults || discernResults.length === 0) continue;  //没有任何结果，不做任何数据填充
            let address = discernResults[0];
            if(!address.area || address.area === '') continue;  //数据可信任度比较低，不做数据填充。对东莞和中山做额外判断

            data[i].orderList[j].province = address.province;
            data[i].orderList[j].city = address.city;
            data[i].orderList[j].area = address.area;
            data[i].orderList[j].detailAddress = address.details;
          }

        }

        this.exportDatas = data;

        try {
          this.getExportSummary();
          this.exportExcel();
        } catch(err) {
          console.log(err);
          setTimeout(() => {
            this.$message.error('生成文件或者打开汇总面板失败，请重试');
          }, 100)
        }

      });
    },
    getExportSummary() {
      if(!this.$auths.includes('ship/orderSummary')) {
        return;
      }
      let data = this.exportDatas;
      let params = {
        order_sn: []
      };
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].orderList.length; j++) {
          params.order_sn.push(data[i].orderList[j].order_sn);
        }
      }

      this.$post('/admin/ship/orderSummary', params, res => {
        let data = res.data;
        let exportSummary = {
          goodsTotal: data.goodsTotal,
          orderTotal: data.orderTotal,
          goods: data.goods.slice(0) || []
        };
        this.exportSummary = exportSummary;
        // if(this.$refs.validExport) this.$refs.validExport.resetTabel();
        this.validExportVisible = true;
      }, err => {
        this.validExportErrorVisible = true;
      });
    },
    confirmExportAndStockup() {
      // 一键对选中项进行备货操作前的询问
      this.$confirm('确定对这些订单进行备货操作吗？注意：只有未发货且未备货的订单会更改备货状态', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = this.exportDatas;
        let params = {
          order_sn: [],
          type: 1
          };
        for(let i = 0; i < data.length; i++) {
          for(let j = 0; j < data[i].orderList.length; j++) {
            params.order_sn.push(data[i].orderList[j].order_sn);
          }
        }


        this.$post('/admin/ship/storing', params, res => {
          this.$message.success('更改导出订单为备货状态成功');
          this.validExportVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },
    exportExcel() {
      let data = this.exportDatas;
      let fileNames = [];

      let zip = new JSZip();
      for(let i = 0; i < this.exportDatas.length; i++) {
        let excelData = [];
        excelData.push([
          '订单编号',
          '快递单号',
          '快递公司',
          '收件人',
          '收件人电话',
          '省',
          '市',
          '区',
          '详细地址',
          '收件人地址',
          '商品标题',
          '商品规格',
          '商品数量',
          '多商品',
          '商品',
          '商品码',
          '下单时间',
          '邮编',
          '卖家留言',
          '买家留言',
          '附加信息',
          '身份证正面',
          '身份证反面',
          '供应商名称',
          '用户注册时间',
          '用户团队等级'
        ]);

        for(let orderIndex = 0; orderIndex < this.exportDatas[i].orderList.length; orderIndex++) {
          let item = this.exportDatas[i].orderList[orderIndex];
          let goodItems = Object.values(item.goods || {}), goods = [], goods_codes = [];
          let supplier = [], supplierCode = [];

          for(let j = 0; j < goodItems.length; j++) {
            let specs = JSON.parse(goodItems[j].specs);
            let attrKeys = Object.keys(specs);
            let attrValues = Object.values(specs);

            let attrs = [];
            for(let k = 0; k < attrKeys.length; k++) {
              attrs.push(`${attrKeys[k]}:${attrValues[k]}`)
            }
            goodItems[j].attrs = attrs.join('、');
            goods.push(`${goodItems[j].title}（${goodItems[j].attrs}） ×${goodItems[j].count || 0}`);
            goods_codes.push(goodItems[j].goods_code);

            if(!goodItems[j].supplier || goodItems[j].supplier.length == 0) continue;
            supplier.push(goodItems[j].supplier.name);
            supplierCode.push(goodItems[j].supplier.supplier_code);
          }

          supplier = supplier.join('；');
          supplierCode = supplierCode.join('；');


          let skuTitle = goodItems.length === 1 ? goodItems[0].title : '';
          let skuAttr = goodItems.length === 1 ? goodItems[0].attrs : '';
          let skuCount = goodItems.length === 1 ? `${goodItems[0].count}` : '';
          let noSingleSku = goodItems.length > 1 ? '是' : '';

          let attachInfo = item.is_attach_order && item.attach ? `${item.attach.real_name} ${item.attach.id_card}` : '';
          let idCardFront = item.is_attach_order && item.attach ? item.attach.id_card_front : '';
          let idCardBack = item.is_attach_order && item.attach ? item.attach.id_card_back : '';

          let shipping_code = item.shipping_type == 2 ? '免物流' : item.shipping_code;

          excelData.push([
            item.order_sn,  //订单编码
            shipping_code,  //快递单号
            item.shipping_company,  //快递公司
            item.shipping_name,  //收件人
            item.shipping_phone,  //收件人电话
            item.province || '',  //省
            item.city || '',  //市
            item.area || '',  //区
            item.detailAddress,  //详细地址
            item.shipping_address,  //收件人地址
            skuTitle,  //商品标题
            skuAttr,  //商品规格
            skuCount,  //商品数量
            noSingleSku,  //多商品？
            goods.join('； '),   //商品
            goods_codes.join('；'), //商品码
            item.create_time,  //下单时间
            '',   //邮编
            item.seller_remark,   //卖家留言
            item.order_remark,   //买家留言
            attachInfo,  //附加信息
            idCardFront,  //身份证正面
            idCardBack,  //身份证反面
            supplier,  //供应商名称
            item.user_create_time || '',  //用户注册时间
            item.user_team_vip_name || ''  //用户团队等级
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 140},
          {wpx: 120},
          {wpx: 90},
          {wpx: 80},
          {wpx: 100},
          {wpx: 80},
          {wpx: 80},
          {wpx: 80},
          {wpx: 120},
          {wpx: 240},
          {wpx: 220},
          {wpx: 180},
          {wpx: 80},
          {wpx: 50},
          {wpx: 300},
          {wpx: 160},
          {wpx: 140},
          {wpx: 60},
          {wpx: 100},
          {wpx: 100},
          {wpx: 140},
          {wpx: 100},
          {wpx: 100},
          {wpx: 200},
          {wpx: 160},
          {wpx: 120},
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let countRow = XLSX.utils.encode_cell({r: i , c: 12});
          ws[countRow].t = 'n';
        }

        XLSX.utils.book_append_sheet(wb, ws, "发货订单列表");

        let time = moment().format('YYYY年MM月DD日HH时mm分');
        let excelInfo = XLSX.write(wb, {
          type: 'base64'
        });

        if(!fileNames.includes(this.exportDatas[i].info.name)) fileNames.push(this.exportDatas[i].info.name);
        zip.file(`${this.exportDatas[i].info.name}_${time}.xlsx`,excelInfo , {base64: true});

      }

      zip.generateAsync({type:"blob"}).then(content => {
        // see FileSaver.js
        let time = moment().format('YYYY年MM月DD日HH时mm分');
        let type = {
          [0]: '订单列表',
          [1]: '订单列表_商品分组',
          [2]: '订单列表_供应商分组'
        }
        FileSaver.saveAs(content, `${type[this.filter.needFormatList]}${time}.zip`);
      });
      /* generate file and send to client */
      // XLSX.writeFile(wb, `发货列表${time}.xlsx`);
    console.log(fileNames);
    }

  },
};
</script>

<style lang="less" scoped>
.subpage-wrapper-content {
  height: calc(100% - 60px);
}

.subpage-flex-fullpage {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.subpage-flex-fullpage-content {
  flex: 1;
  height: 100px;
  overflow-y: auto;
}


.excel-uploader {
  display: inline-block;
  margin: 0 15px;
}


// 表格的模拟
.delivery-table-head {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  background-color: #cecedd;
}

.delivery-table-body {
  display: flex;
  align-items: center;
  font-size: 14px;
  background-color: #f2f3fc;
}

.delivery-table-th,
.delivery-table-td {
  padding: 10px 5px;
}

.delivery-table-th.auto,
.delivery-table-td.auto {
  flex: 1;
  width: 100px;
}

.delivery-item {
  margin-top: 10px;
  font-size: 14px;
}

.delivery-content {
  border: 1px solid #f2f3fc;
  border-top: 0;
  padding: 15px;
}

.delivery-infos {
  display: flex;
  flex-wrap: wrap;
}

.delivery-info {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  margin-right: 20px;
}

.delivery-info-label {
  color: #9b9b9b;
}

.delivery-sku-baseinfo {
  display: flex;
}

.delivery-sku-img-box {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  overflow: hidden;
}

.delivery-sku-img {
  width: 40px;
  height: auto;
}

.delivery-sku-code {
  font-size: 13px;
  color: #999;
}

.delivery-ctrls {
  padding: 20px 15px;
}

// 汇总板块
.analysis-title {
  margin: 10px 10px;
  font-size: 24px;
}

.logistics-analysis-list {
  display: flex;
  flex-wrap: wrap;
}

.logistics-analysis-item {
  flex: 1;
  min-width: 120px;
  padding: 10px;
  margin: 5px 10px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 15px rgba(0, 0, 0, .1);
}

.logistics-analysis-value {
  font-size: 21px;
}

.logistics-analysis-tips {
  margin-top: 10px;
  font-size: 13px;
  color: #999;
}


// 表格底部按钮
.table-bottom-bar {
  display: flex;
  align-items: center;
  padding: 10px 25px;
  background-color: #fcfcfe;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, .3);
}

.table-bottom-ctrls {
  flex: 1;
  width: 80px;
}

// 高级搜索
.filter-extend-trigger-box {
  display: flex;
  justify-content: flex-end;
  font-size: 14px;
}

.filter-extend-trigger {
  color: #66b1ff;
  user-select: none;
  cursor: pointer;
}

.sku-select-trigger {
  color: #66b1ff;
  user-select: none;
  cursor: pointer;
}

.sku-select-trigge-clear {
  margin-left: 10px;
  color: #f00;
  user-select: none;
  cursor: pointer;
}
</style>


<style lang="less">
// 暂时将页脚给隐藏
.page-footer {
  display: none;
}
</style>
