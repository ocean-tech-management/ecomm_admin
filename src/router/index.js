import Vue from 'vue'
import Router from 'vue-router'
import Main from '../views/main.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    // childPath： 对应值为寻址时Nav显示项判断条件。如path在childPath内，认为该项为Nav渲染用的数据
    // Content.vue： 一级页面仅做渲染容器时所用模板，仅做渲染容器不处理页面逻辑
    // meta： 页面相关渲染用额外配置参数
    // title： 用于Nav项文字渲染，当breadcrumb无对应值时亦做面包屑的标题渲染
    // breadcrumb： 面包屑标题，接受Array格式
    // subpage： 存在切真值时表明该项为二级页面（内页），不做Nav项渲染
    // parentPath： subpage项有真值时，该项值需要提供，指向父级页面，为Nav值高亮项
    // icon： 一级分类的图标类名

    // require：要求用户有某项权限方可进入该页面。 权限板块！
    // moduleName：模块名，用来确定顶部导航栏的各个项在哪个范围内进行页面选择跳转

    {
      path: '',
      alias: '/main',
      component: Main,
      children: [{
        path: '/',
        meta: {
          title: '控制台',
          childPath: [
            '/',
            '/index',
            // '/dataTencent',
            '/leaderBoard',
            '/goodsSale'
          ],
          icon: 'el-icon-s-marketing'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [{
          path: '/',
          alias: '/index',
          meta: {
            title: '运营数据统计'
          },
          component: () =>
            import('../views/console/dataOperator.vue')
        },
        {
          path: '/goodsSale',
          meta: {
            title: '销售情况',
            require: 'summary/goodsSale'
          },
          component: () =>
            import('../views/console/goodsSale/goodsSale.vue')
        },
        {
          path: '/leaderBoard',
          meta: {
            title: '销售排行',
            require: 'summary/goods'
          },
          component: () =>
            import('../views/console/leaderBoard/leaderBoard.vue')
        }
        // {
        //   path: '/dataTencent',
        //   meta: {
        //     title: '腾讯移动分析数据接入'
        //   },
        //   component: () =>
        //     import('../views/console/dataTencent.vue')
        // }
      ]
      },
      {
        path: '/',
        meta: {
          title: '用户管理',
          childPath: [
            '/users',
            '/agents',
            '/teamDivideUsers',
            '/exps',
            '/teamShareholders',
            '/userOpreations',
            '/userSelfBuys',
            '/crowdBalancesTransferLimitUsers',
            '/banBuyUsers',
            '/userExtraWithdrawLimit',

            '/userBalanceList',
            '/userHealthyBalance',
            '/userIntegralBalance',
            '/userTicketBalance',
            '/userCrowdBalances',
            '/userAdvanceBalance',
            '/userFreezeCrowdBalances',
            '/userStockList',
            '/integralRechargeList',
            '/advanceRechargeList',
            '/userAuthClearRecord',
            '/userAuthType',
            '/userAuthList',
            '/balanceLimit',
            '/crowdBalanceSummary',
          ],
          moduleName: 'user',
          icon: 'el-icon-user-solid'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [{
            path: '/users',
            meta: {
              title: '用户管理',
              require: 'user/list'
            },
            component: () =>
              import('../views/users/users.vue')
          },
          {
            path: '/agents',
            meta: {
              title: '代理人管理',
              require: 'member/list'
            },
            component: () =>
              import('../views/users/agents.vue')
          },
          {
            path: '/teamDivideUsers',
            meta: {
              title: '团队业绩代理人',
              require: 'teamMember/list'
            },
            component: () =>
              import('../views/users/teamDivideUsers.vue')
          },
          {
            path: '/exps',
            meta: {
              title: '体验中心',
              require: 'exp/list'
            },
            component: () =>
              import('../views/users/exps.vue')
          },
          {
            path: '/teamShareholders',
            meta: {
              title: '团队股东',
              require: 'teamShareholder/list'
            },
            component: () =>
              import('../views/users/teamShareholders.vue')
          },
          {
            path: '/userOpreations',
            meta: {
              title: '操作记录',
              require: 'manager/updateUserPwdList'
            },
            component: () =>
              import('../views/users/userOpreations.vue')
          },
          {
            path: '/userSelfBuys',
            meta: {
              title: '自购业绩',
              require: 'user/orderList'
            },
            component: () =>
              import('../views/users/userSelfBuys.vue')
          },

          {
            path: '/crowdBalancesTransferLimitUsers',
            meta: {
              title: '互转白名单',
              require: 'user/banTransferUserList',
            },
            component: () =>
              import('../views/users/crowdBalancesTransferLimitUsers.vue')
          },
          {
            path: '/banBuyUsers',
            meta: {
              title: '禁购名单',
              require: 'user/banBuyUserList',
            },
            component: () =>
              import('../views/users/banBuyUsers.vue')
          },
          {
            path: '/userExtraWithdrawLimit',
            meta: {
              title: '额外提现额度',
              require: 'userExtra/list',
            },
            component: () =>
              import('../views/users/userExtraWithdrawLimit.vue')
          },
          {
            path: '/integralRechargeList',
            meta: {
              title: '集品豆充值',
              require: 'integral/rechargeList',
            },
            component: () =>
              import('../views/users/integralRechargeList.vue')
          },
          {
            path: '/advanceRechargeList',
            meta: {
              title: '集品卡充值',
              require: 'advance/rechargeList',
            },
            component: () =>
              import('../views/users/advanceRechargeList.vue')
          },
          {
            path: '/userAuthClearRecord',
            meta: {
              title: '授权清除记录',
              require: 'userAuthClear/list',
            },
            component: () =>
              import('../views/users/userAuthClearRecord.vue')
          },
          {
            path: '/userAuthList',
            meta: {
              title: '授权列表',
              require: 'userAuthType/allList'
            },
            component: () =>
              import('../views/users/userAuthList.vue')
          },
          {
            path: '/balanceLimit',
            meta: {
              title: '余额限制管理',
              require: 'userBalanceLimit/list'
            },
            component: () =>
              import('../views/users/balanceLimit.vue')
          },
          {
            path: '/crowdBalanceSummary',
            meta: {
              title: '福利余额汇总',
              require: 'crowdFunding/crowdBalanceSummary'
            },
            component: () =>
              import('../views/users/crowdBalanceSummary.vue')
          },
          {
            path: '/userBalanceList',
            meta: {
              title: '余额明细',
              subpage: true,
              tabs: 'usersDetailRecord',
              parentPath: '/users',
              require: 'user/balance'
            },
            component: () =>
              import('../views/users/userBalanceList.vue')
          },
          {
            path: '/userCrowdBalances',
            meta: {
              title: '集品券明细',
              subpage: true,
              tabs: 'usersDetailRecord',
              parentPath: '/users',
              require: 'crowdFunding/balance'
            },
            component: () =>
              import('../views/users/userCrowdBalances.vue')
          },
          {
            path: '/userHealthyBalance',
            meta: {
              title: '健康豆明细',
              subpage: true,
              tabs: 'usersDetailRecord',
              parentPath: '/users',
              require: 'healthy/balance'
            },
            component: () =>
              import('../views/users/userHealthyBalance.vue')
          },
          {
            path: '/userIntegralBalance',
            meta: {
              title: '集品豆明细',
              subpage: true,
              tabs: 'usersDetailRecord',
              parentPath: '/users',
              require: 'integral/balance'
            },
            component: () =>
              import('../views/users/userIntegralBalance.vue')
          },
          {
            path: '/userTicketBalance',
            meta: {
              title: '礼品券明细',
              subpage: true,
              tabs: 'usersDetailRecord',
              parentPath: '/users',
              require: 'ticket/balance'
            },
            component: () =>
              import('../views/users/userTicketBalance.vue')
          },
          {
            path: '/userAdvanceBalance',
            meta: {
              title: '集品卡明细',
              subpage: true,
              tabs: 'usersDetailRecord',
              parentPath: '/users',
              require: 'advance/balance'
            },
            component: () =>
              import('../views/users/userAdvanceBalance.vue')
          },
          {
            path: '/userFreezeCrowdBalances',
            meta: {
              title: '待释放集品券明细',
              subpage: true,
              tabs: 'usersDetailRecord',
              parentPath: '/users',
              require: 'crowdFuse/balance'
            },
            component: () =>
              import('../views/users/userFreezeCrowdBalances.vue')
          },
          {
            path: '/userStockList',
            meta: {
              title: '股票明细',
              subpage: true,
              tabs: 'usersDetailRecord',
              parentPath: '/users',
              require: 'divide/stocksList'
            },
            component: () =>
              import('../views/users/userStockList.vue')
          },
          {
            path: '/userAuthType',
            meta: {
              title: '授权详情',
              subpage: true,
              parentPath: '/users',
              require: 'userAuthType/list'
            },
            component: () =>
              import('../views/users/userAuthType.vue')
          },
        ]
      },
      {
        path: '/',
        meta: {
          title: '卡券管理',
          childPath: [
            '/coupons',
            // '/giftCardBatchs',
            '/deleteCoupons',
            '/deliverHistory',
            '/couponRecords',
            '/addCoupon',
            '/editCoupon',
            // '/giftCards',
            '/deliverCoupon'
          ],
          moduleName: 'coupon',
          icon: 'el-icon-s-ticket'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [{
            path: '/coupons',
            meta: {
              title: '优惠券',
              require: 'coupon/list'
            },
            component: () =>
              import('../views/coupons/coupons/coupons.vue')
          },
          // {
          //   path: '/giftCardBatchs',
          //   meta: {
          //     title: '礼品卡',
          //     require: 'coupon/list'
          //   },
          //   component: () =>
          //     import('../views/coupons/giftCards/giftCardBatchs.vue')
          // },
          {
            path: '/destoryCoupons',
            meta: {
              title: '已销毁的优惠券',
              subpage: true,
              parentPath: '/coupons',
              require: 'coupon/deleteList'
            },
            component: () =>
              import('../views/coupons/coupons/destoryCoupons.vue')
          },
          {
            path: '/deliverHistory',
            meta: {
              title: '派/补券记录',
              subpage: true,
              parentPath: '/coupons',
              require: 'coupon/deliverHistory'
            },
            component: () =>
              import('../views/coupons/coupons/deliverHistory.vue')
          },
          {
            path: '/couponRecords',
            meta: {
              title: '优惠券领取记录',
              subpage: true,
              parentPath: '/coupons',
              require: 'coupon/userCoupon'
            },
            component: () =>
              import('../views/coupons/coupons/couponRecords.vue')
          },
          {
            path: '/addCoupon',
            meta: {
              title: '添加优惠券',
              subpage: true,
              parentPath: '/coupons',
              require: 'coupon/create'
            },
            component: () =>
              import('../views/coupons/coupons/addCoupon.vue')
          }, {
            path: '/editCoupon',
            meta: {
              title: '编辑优惠券',
              subpage: true,
              parentPath: '/coupons',
              require: 'coupon/update'
            },
            component: () =>
              import('../views/coupons/coupons/editCoupon.vue')
          },
          {
            path: '/deliverCoupon',
            meta: {
              title: '派发优惠券',
              subpage: true,
              parentPath: '/coupons',
              require: 'coupon/deliver'
            },
            component: () =>
              import('../views/coupons/coupons/deliverCoupon.vue')
          },
          // {
          //   path: '/giftCards',
          //   meta: {
          //     title: '礼品卡列表',
          //     subpage: true,
          //     parentPath: '/giftCardBatchs',
          //     require: 'coupon/list'
          //   },
          //   component: () =>
          //     import('../views/coupons/giftCards/giftCards.vue')
          // },
        ]

      }, {
        path: '/',
        meta: {
          title: '产品商城',
          childPath: [
            '/commedities',
            '/actives',
            '/brandSpace',
            '/specialAreas',
            '/specialPayList',
            '/collages',
            '/commedityCategories',
            '/brands',
            '/standards',
            '/fareTemplates',
            '/suppliers',
            '/tags',
            '/params',
            '/entrances',
            '/screenBanners',
            '/quadrangle',
            '/ads',
            '/reputations',
            '/lives',
            // '/recommends',
            '/addCommedity',
            '/editCommedity',
            '/categoryCommedities',
            '/activeCommedities',
            '/specialPayCommedities',
            '/brandSpaceCommedities',
            '/specialAreaCommedities',
            '/collageCommedities',
            '/addRecommend',
            '/reputators'
          ],
          moduleName: 'goods',
          icon: 'el-icon-s-shop'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [{
            path: '/commedities',
            meta: {
              title: '商品列表',
              require: 'spu/list'
            },
            component: () =>
              import('../views/commedities/commedities/commedities.vue')
          }, {
            path: '/actives',
            meta: {
              title: '活动管理',
              require: 'activity/list'
            },
            component: () =>
              import('../views/commedities/actives/actives.vue')
          }, {
            path: '/brandSpace',
            meta: {
              title: '品牌馆',
              require: 'brandSpace/list'
            },
            component: () =>
              import('../views/commedities/brandSpace/brandSpace.vue')
          }, {
            path: '/specialAreas',
            meta: {
              title: '限时专场',
              require: 'specialArea/list'
            },
            component: () =>
              import('../views/commedities/specialAreas/specialAreas.vue')
          },
          {
            path: '/collages',
            meta: {
              title: '拼团管理',
              require: 'pt/list'
            },
            component: () =>
              import('../views/commedities/collages/collages.vue')
          },
          {
            path: '/commedityCategories',
            meta: {
              title: '商品分类',
              require: 'category/list'
            },
            component: () =>
              import('../views/commedities/commedityCategories/commedityCategories.vue')
          }, {
            path: '/brands',
            meta: {
              title: '品牌管理',
              require: 'brand/list'
            },
            component: () =>
              import('../views/commedities/brands/brands.vue')
          }, {
            path: '/standards',
            meta: {
              title: '规格管理',
              require: 'goods/attrKey'
            },
            component: () =>
              import('../views/commedities/standards/standards.vue')
          }, {
            path: '/fareTemplates',
            meta: {
              title: '邮费模板',
              require: 'ship/template'
            },
            component: () =>
              import('../views/commedities/fareTemplates/fareTemplates.vue')
          }, {
            path: '/suppliers',
            meta: {
              title: '供货商管理',
              require: 'supplier/list'
            },
            component: () =>
              import('../views/commedities/suppliers/suppliers.vue')
          },

          // {
          //     path: '/comments',
          //     meta: {
          //         title: '评论管理'
          //     },
          //     component: () =>
          //         import('../views/commedities/comments/comments.vue')
          // },
          {
            path: '/tags',
            meta: {
              title: '商品标签',
              require: 'tag/list'
            },
            component: () =>
              import('../views/commedities/tags/tags.vue')
          },
          {
            path: '/params',
            meta: {
              title: '参数模板',
              require: 'goodsParams/list'
            },
            component: () =>
              import('../views/commedities/params/params.vue')
          },
          {
            path: '/screenBanners',
            meta: {
              title: '首屏广告',
              require: 'screenBanner/list'
            },
            component: () =>
              import('../views/commedities/screenBanners/screenBanners.vue')
          },
          {
            path: '/entrances',
            meta: {
              title: '首屏入口',
              require: 'entrance/list'
            },
            component: () =>
              import('../views/commedities/entrances/entrances.vue')
          },
          {
            path: '/quadrangle',
            meta: {
              title: 'N宫格',
              require: 'activity/list'
            },
            component: () =>
              import('../views/commedities/quadrangle/quadrangle.vue')
          },
          {
            path: '/specialPayList',
            meta: {
              title: '特殊支付活动',
              require: 'activity/specialPayList'
            },
            component: () =>
              import('../views/commedities/actives/actives.vue')
          },
          {
            path: '/ads',
            meta: {
              title: '广告位',
              require: 'banner/list'
            },
            component: () =>
              import('../views/commedities/ads/ads.vue')
          },
          {
            path: '/reputations',
            meta: {
              title: '口碑评论',
              require: 'reputation/list'
            },
            component: () =>
              import('../views/commedities/reputations/reputations.vue')
          },
          {
            path: '/lives',
            meta: {
              title: '直播间',
              require: 'live/roomList'
            },
            component: () =>
              import('../views/commedities/lives/lives.vue')
          },
          // {
          //   path: '/recommends',
          //   meta: {
          //     title: '超值推荐'
          //   },
          //   component: () =>
          //     import('../views/commedities/recommends/recommends.vue')
          // },
          {
            path: '/addCommedity',
            meta: {
              title: '添加商品',
              subpage: true,
              parentPath: '/commedities',
              require: 'goods/create'
            },
            component: () =>
              import('../views/commedities/commedities/addCommedity.vue')
          }, {
            path: '/editCommedity',
            meta: {
              title: '编辑商品',
              subpage: true,
              parentPath: '/commedities',
              require: 'goods/update'
            },
            component: () =>
              import('../views/commedities/commedities/editCommedity.vue')
          }, {
            path: '/categoryCommedities',
            meta: {
              title: '分类关联商品',
              subpage: true,
              parentPath: '/commedityCategories',
              require: 'spu/list'
            },
            component: () =>
              import('../views/commedities/commedityCategories/categoryCommedities.vue')
          }, {
            path: '/activeCommedities',
            meta: {
              title: '活动商品列表',
              subpage: true,
              parentPath: '/actives',
              require: 'activity/goodsInfo'
            },
            component: () =>
              import('../views/commedities/actives/activeCommedities.vue')
          },{
            path: '/specialPayCommedities',
            meta: {
              title: '特殊支付活动列表',
              subpage: true,
              parentPath: '/specialPayList',
              require: 'activity/goodsInfo'
            },
            component: () =>
              import('../views/commedities/actives/activeCommedities.vue')
          },{
            path: '/brandSpaceCommedities',
            meta: {
              title: '品牌馆商品列表',
              subpage: true,
              parentPath: '/brandSpace',
              require: 'brandSpace/goodsInfo'
            },
            component: () =>
              import('../views/commedities/brandSpace/brandSpaceCommedities.vue')
          }, {
            path: '/specialAreaCommedities',
            meta: {
              title: '限时专场商品列表',
              subpage: true,
              parentPath: '/specialAreas',
              require: 'specialArea/goodsInfo'
            },
            component: () =>
              import('../views/commedities/specialAreas/specialAreaCommedities.vue')
          }, {
            path: '/collageCommedities',
            meta: {
              title: '拼团商品列表',
              subpage: true,
              parentPath: '/collages',
              require: 'pt/goodsInfo'
            },
            component: () =>
              import('../views/commedities/collages/collageCommedities.vue')
          }, {
            path: '/addRecommend',
            meta: {
              title: '新增超值推荐',
              subpage: true,
              parentPath: '/recommends'
            },
            component: () =>
              import('../views/commedities/recommends/addRecommend.vue')
          }, {
            path: '/reputators',
            meta: {
              title: '口碑评价官',
              subpage: true,
              parentPath: '/reputations',
              require: 'reputation/userList'
            },
            component: () =>
              import('../views/commedities/reputations/reputators.vue')
          },
        ]
      }, {
        path: '/',
        meta: {
          title: '拼拼',
          childPath: [
            '/ppylActivities',
            '/ppylDistribute',
            '/ppylSetting',
            '/ppylUsers',
            '/userBalance',
            '/cvipCombos',
            '/ppylOrders',
            '/ppylQueues',
            '/ppylRewards',
            '/ppylBanners',
            '/ppylActivityAreas',
            '/ppylActivityGoods'
          ],
          moduleName: 'ppyl',
          icon: 'el-icon-s-order'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [{
            path: '/ppylActivities',
            meta: {
              title: '拼拼活动',
              require: 'ppyl/list'
            },
            component: () =>
              import('../views/ppyls/ppylActivities/ppylActivities.vue')
          },
          {
            path: '/ppylDistribute',
            meta: {
              title: '拼拼规则',
              require: 'ppylMember/list'
            },
            component: () =>
              import('../views/ppyls/ppylDistribute/ppylDistribute.vue')
          },
          {
            path: '/ppylSetting',
            meta: {
              title: '拼拼设置',
              require: 'ppylConfig/info'
            },
            component: () =>
              import('../views/ppyls/ppylSetting/ppylSetting.vue')
          },
          {
            path: '/ppylUsers',
            meta: {
              title: '拼拼会员',
              require: 'ppyl/userList'
            },
            component: () =>
              import('../views/ppyls/ppylUsers/ppylUsers.vue')
          },
          {
            path: '/userBalance',
            meta: {
              title: '佣金余额',
              require: 'ppyl/userList'
            },
            component: () =>
              import('../views/ppyls/userBalance/userBalance.vue')
          },
          {
            path: '/cvipCombos',
            meta: {
              title: '会员套餐',
              require: 'ppylCVIP/list'
            },
            component: () =>
              import('../views/ppyls/cvipCombos/cvipCombos.vue')
          },
          {
            path: '/ppylOrders',
            meta: {
              title: '拼拼订单',
              require: 'ppyl/order'
            },
            component: () =>
              import('../views/ppyls/ppylOrders/ppylOrders.vue')
          },
          {
            path: '/ppylRewards',
            meta: {
              title: '拼拼奖励',
              require: 'ppyl/reward'
            },
            component: () =>
              import('../views/ppyls/ppylRewards/ppylRewards.vue')
          },
          {
            path: '/ppylQueues',
            meta: {
              title: '拼拼队列',
              require: 'ppyl/waitOrder'
            },
            component: () =>
              import('../views/ppyls/ppylQueues/ppylQueues.vue')
          },
          {
            path: '/ppylBanners',
            meta: {
              title: '拼拼广告',
              require: 'ppylBanner/list'
            },
            component: () =>
              import('../views/ppyls/ppylBanners/ppylBanners.vue')
          },
          {
            path: '/ppylActivityAreas',
            meta: {
              title: '拼拼活动专区',
              subpage: true,
              parentPath: '/ppylActivities',
              require: 'ppylArea/list'
            },
            component: () =>
              import('../views/ppyls/ppylActivities/ppylActivityAreas.vue')
          },
          {
            path: '/ppylActivityGoods',
            meta: {
              title: '拼拼活动商品',
              subpage: true,
              parentPath: '/ppylActivities',
              require: 'ppyl/goodsInfo'
            },
            component: () =>
              import('../views/ppyls/ppylActivities/ppylActivityGoods.vue')
          }
        ]
      }, {
        path: '/',
        meta: {
          title: '福利',
          childPath: [
            '/crowdFundingOrderList',
            '/crowdFundings',
            '/crowdFundingRule',
            '/crowdFundingRecharges',
            '/crowdFundingRechargeApplications',
            '/crowdFundingRechargeSetting',
            '/crowdFundingLotterys',
            '/devices',
            '/deviceCombos',
            '/deviceOrders',
            '/deviceDivides',

            '/exchangeActiveCommedities',
            '/healthyRecharges',
            '/healthyConverList',

            '/crowdFundingStages',
            '/crowdFundingCommedities',
            '/crowdFundingDurations',
            '/crowdFundingLotteryWinners',

            '/achievementRecharge',
            '/achievementWithdrawals',
            '/achievementFreezeCustom'
          ],
          moduleName: 'crowd',
          icon: 'el-icon-s-order'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [{
            path: '/crowdFundingOrderList',
            meta: {
              title: '福利订单',
              require: 'crowdFunding/orderList'
            },
            component: () =>
              import('../views/crowdFundings/crowdFundingOrderList/crowdFundingOrderList.vue')
          }, {
            path: '/crowdFundings',
            meta: {
              title: '福利专区',
              require: 'crowdFunding/activityList'
            },
            component: () =>
              import('../views/crowdFundings/crowdFundings/crowdFundings.vue')
          }, {
            path: '/crowdFundingRule',
            meta: {
              title: '福利规则',
              require: 'crowdFunding/configInfo'
            },
            component: () =>
              import('../views/crowdFundings/crowdFundingRule/crowdFundingRule.vue')
          }, {
            path: '/crowdFundingRecharges',
            meta: {
              title: '集品券充值',
              require: 'finance/crowdBalanceList'
            },
            component: () =>
              import('../views/crowdFundings/crowdFundingRecharges/crowdFundingRecharges.vue')
          }, {
            path: '/crowdFundingRechargeApplications',
            meta: {
              title: '充值申请',
              require: 'offlineRecharge/list'
            },
            component: () =>
              import('../views/crowdFundings/crowdFundingRechargeApplications/crowdFundingRechargeApplications.vue')
          }, {
            path: '/crowdFundingRechargeSetting',
            meta: {
              title: '充值设置',
              require: 'offlineRecharge/configInfo'
            },
            component: () =>
              import('../views/crowdFundings/crowdFundingRechargeSetting/crowdFundingRechargeSetting.vue')
          }, {
            path: '/crowdFundingLotterys',
            meta: {
              title: '福利抽奖',
              require: 'crowdFundingLottery/list'
            },
            component: () =>
              import('../views/crowdFundings/crowdFundingLotterys/crowdFundingLotterys.vue')
          },
          {
            path: '/crowdFundingStages',
            meta: {
              title: '福利期次列表',
              subpage: true,
              parentPath: '/crowdFundings',
              require: 'crowdFunding/periodList',
            },
            component: () =>
              import('../views/crowdFundings/crowdFundings/crowdFundingStages.vue')

          },
          {
            path: '/crowdFundingCommedities',
            meta: {
              title: '福利期次商品列表',
              subpage: true,
              parentPath: '/crowdFundings',
              require: 'crowdFunding/periodGoodsInfo',
            },
            component: () =>
              import('../views/crowdFundings/crowdFundings/crowdFundingCommedities.vue')
          }, {
            path: '/crowdFundingDurations',
            meta: {
              title: '福利期次开放时间段列表',
              subpage: true,
              parentPath: '/crowdFundings',
              require: 'crowdFunding/durationList',
            },
            component: () =>
              import('../views/crowdFundings/crowdFundings/crowdFundingDurations.vue')
          }, {
            path: '/crowdFundingLotteryWinners',
            meta: {
              title: '福利抽奖活动中奖者列表',
              subpage: true,
              parentPath: '/crowdFundingLotterys',
              require: 'crowdFundingLottery/winInfo',
            },
            component: () =>
              import('../views/crowdFundings/crowdFundingLotterys/crowdFundingLotteryWinners.vue')
          },


          {
            path: '/devices',
            meta: {
              title: '设备管理',
              require: 'device/list'
            },
            component: () =>
              import('../views/crowdFundings/devices/devices.vue')
          },
          {
            path: '/deviceCombos',
            meta: {
              title: '设备套餐管理',
              subpage: true,
              parentPath: '/devices',
              require: 'device/comboList'
            },
            component: () =>
              import('../views/crowdFundings/devices/deviceCombos.vue')
          },

          {
            path: '/deviceOrders',
            meta: {
              title: '设备订单',
              require: 'device/orderList'
            },
            component: () =>
              import('../views/crowdFundings/deviceOrders/deviceOrders.vue')
          },
          {
            path: '/deviceDivides',
            meta: {
              title: '设备订单分润',
              require: 'device/divide'
            },
            component: () =>
              import('../views/crowdFundings/deviceDivides/deviceDivides.vue')
          },

          {
            path: '/exchangeActiveCommedities',
            meta: {
              title: '健康豆专区',
              require: 'exchange/goodsList'
            },
            component: () =>
              import('../views/crowdFundings/exchangeActiveCommedities/exchangeActiveCommedities.vue')
          },
          {
            path: '/healthyRecharges',
            meta: {
              title: '健康豆充值',
              require: 'finance/healthyBalanceList'
            },
            component: () =>
              import('../views/crowdFundings/healthyRecharges/healthyRecharges.vue')
          },
          {
            path: '/healthyConverList',
            meta: {
              title: '健康豆转换',
              require: 'healthy/hbConverList'
            },
            component: () =>
              import('../views/crowdFundings/healthyConverList/healthyConverList.vue')
          },
          {
            path: '/achievementWithdrawals',
            meta: {
              title: '自定义用户提现业绩',
              require: 'crowdFunding/withdrawCustomList'
            },
            component: () =>
              import('../views/crowdFundings/achievementWithdrawals/achievementWithdrawals.vue')
          },
          {
            path: '/achievementFreezeCustom',
            meta: {
              title: '自定义冻结金额列表',
              require: 'crowdFunding/freezeCustomList'
            },
            component: () =>
              import('../views/crowdFundings/achievementFreezeCustom/achievementFreezeCustom.vue')
          },
          {
            path: '/achievementRecharge',
            meta: {
              title: '用户关联充值业绩',
              require: 'user/linkRechargeList'
            },
            component: () =>
              import('../views/crowdFundings/achievementRecharge/achievementRecharge.vue')
          },
        ]
      }, {
        path: '/',
        meta: {
          title: '订单管理',
          childPath: [
            '/commedityOrders',
            '/afterSales',
            '/deliveryOrders',
            '/divideRecord',
            '/abnormalHandsels'

          ],
          moduleName: 'order',
          icon: 'el-icon-s-order'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [{
            path: '/commedityOrders',
            meta: {
              title: '订单管理',
              require: 'order/list'
            },
            component: () =>
              import('../views/orders/commedityOrders/commedityOrders.vue')
          },
          {
            path: '/afterSales',
            meta: {
              title: '退售后管理',
              require: 'afterSale/list'
            },
            component: () =>
              import('../views/orders/afterSales/afterSales.vue')
          },
          {
            path: '/deliveryOrders',
            meta: {
              title: '发货管理',
              require: 'ship/orderList'
            },
            component: () =>
              import('../views/orders/deliveryOrders/deliveryOrders.vue')
          },
          {
            path: '/divideRecord',
            meta: {
              title: '订单分润记录',
              require: 'divide/divideRecordList'
            },
            component: () =>
              import('../views/orders/divideRecord/divideRecord.vue')
          },
          {
            path: '/abnormalHandsels',
            meta: {
              title: '异常套餐记录',
              require: 'handselStand/abnormalList'
            },
            component: () =>
              import('../views/orders/abnormalHandsels/abnormalHandsels.vue')
          },
        ]
      }, {
        path: '/',
        meta: {
          title: '营销设置',
          childPath: [
            '/distribute',
            '/teamDivideRule',
            '/expDivideRule',
            // '/propagandaRewardRules',
            '/propagandaRewardPlans',
            '/shareholderRewardRules',
            '/shareholderDivide',
            '/shareholderRewardPlans',
            '/shareholders',
            '/areaAgentRewardRules',
            '/areaAgents',
            '/growthValue',

            '/propagandaRewardGrantInfo',
            '/propagandaRewardAppointGrant',
            '/shareholderRewardGrantInfo',
            '/shareholderRewardAppointGrant',
          ],
          moduleName: 'vdc',
          icon: 'el-icon-s-data'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [{
            path: '/distribute',
            meta: {
              title: '营销规则',
              require: 'divide/list'
            },
            component: () =>
              import('../views/distribute/distribute/distribute.vue')
          }, {
            path: '/teamDivideRule',
            meta: {
              title: '团队业绩规则',
              require: 'teamDivide/list'
            },
            component: () =>
              import('../views/distribute/teamDivideRule/teamDivideRule.vue')
          }, {
            path: '/expDivideRule',
            meta: {
              title: '体验分润规则',
              require: 'expDivide/list'
            },
            component: () =>
              import('../views/distribute/expDivideRule/expDivideRule.vue')
          }, {
            path: '/propagandaRewardRules',
            meta: {
              title: '广宣奖规则',
              require: 'propagandaRewardRule/list'
            },
            component: () =>
              import('../views/distribute/propagandaRewardRule/propagandaRewardRules.vue')
          }, {
            path: '/propagandaRewardPlans',
            meta: {
              title: '广宣奖计划',
              require: 'propagandaRewardPlan/list'
            },
            component: () =>
              import('../views/distribute/propagandaRewardPlan/propagandaRewardPlans.vue')
          },
          // {
          //   path: '/shareholderRewardRules',
          //   meta: {
          //     title: '股东奖规则',
          //     require: 'shareholderRule/list'
          //   },
          //   component: () =>
          //     import('../views/distribute/shareholderRewardRule/shareholderRewardRules.vue')
          // },
          {
            path: '/shareholderDivide',
            meta: {
              title: '股东规则',
              require: 'shareholderDivide/list'
            },
            component: () =>
              import('../views/distribute/shareholderDivide/shareholderDivide.vue')

          },
          {
            path: '/shareholders',
            meta: {
              title: '股东列表',
              subpage: true,
              parentPath: '/shareholderRewardPlans',
              require: 'shareholderMember/list'
            },
            component: () =>
              import('../views/distribute/shareholderRewardRule/shareholders.vue')
          },
          {
            path: '/shareholderRewardPlans',
            meta: {
              title: '股东奖计划',
              require: 'shareholderRewardPlan/list'
            },
            component: () =>
              import('../views/distribute/shareholderRewardPlan/shareholderRewardPlans.vue')
          },
          {
            path: '/areaAgentRewardRules',
            meta: {
              title: '区代规则',
              require: 'areaDivide/list'
            },
            component: () =>
              import('../views/distribute/areaAgentRewardRules/areaAgentRewardRules.vue')
          },
          {
            path: '/areaAgents',
            meta: {
              title: '区代列表',
              subpage: true,
              parentPath: '/areaAgentRewardRules',
              require: 'areaMember/list'
            },
            component: () =>
              import('../views/distribute/areaAgentRewardRules/areaAgents.vue')
          }, {
            path: '/growthValue',
            meta: {
              title: '成长值记录',
              require: 'growthValue/list'
            },
            component: () =>
              import('../views/distribute/growthValue/growthValue.vue')
          },
          // {
          //   path: '/distributeWithdraw',
          //   meta: {
          //     title: '分润提现'
          //   },
          //   component: () =>
          //     import('../views/distribute/distributeWithdraw/distributeWithdraw.vue')
          // },

          {
            path: '/propagandaRewardGrantInfo',
            meta: {
              title: '广宣奖发放详情',
              subpage: true,
              parentPath: '/propagandaRewardPlans',
              require: 'propagandaReward/rewardList'
            },
            component: () =>
              import('../views/distribute/propagandaRewardPlan/propagandaRewardGrantInfo.vue')
          },
          {
            path: '/propagandaRewardAppointGrant',
            meta: {
              title: '指定用户发放广宣奖',
              subpage: true,
              parentPath: '/propagandaRewardPlans',
              require: 'propagandaReward/grant'
            },
            component: () =>
              import('../views/distribute/propagandaRewardPlan/propagandaRewardAppointGrant.vue')
          },
          {
            path: '/shareholderRewardGrantInfo',
            meta: {
              title: '股东奖发放详情',
              subpage: true,
              parentPath: '/shareholderRewardPlans',
              require: 'shareholderReward/rewardList'
            },
            component: () =>
              import('../views/distribute/shareholderRewardPlan/shareholderRewardGrantInfo.vue')
          },
          {
            path: '/shareholderRewardAppointGrant',
            meta: {
              title: '指定用户发放股东奖',
              subpage: true,
              parentPath: '/shareholderRewardPlans',
              require: 'shareholderReward/grant'
            },
            component: () =>
              import('../views/distribute/shareholderRewardPlan/shareholderRewardAppointGrant.vue')
          },
        ]
      }, {
        path: '/',
        meta: {
          title: '财务管理',
          childPath: [
            '/withdraws',
            '/orderProfit',
            '/paySupplier',
            '/agentAchievement',
            '/letfreeExemptUsers',
            '/balanceSummary',
            '/rechargeRecords',
            '/withdrawRecords',
            '/withdrawExportList'
          ],
          moduleName: 'finance',
          icon: 'el-icon-s-order'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [
          {
            path: '/withdraws',
            meta: {
              title: '提现记录',
              require: 'finance/withdrawList'
            },
            component: () =>
              import('../views/finance/withdraws/withdraws.vue')
          },
          {
            path: '/orderProfit',
            meta: {
              title: '订单收益',
              require: 'divide/divideList'
            },
            component: () =>
              import('../views/finance/orderProfit/orderProfit.vue')
          },
          {
            path: '/withdrawExportList',
            meta: {
              title: '查看提现记录',
              subpage: true,
              parentPath: '/withdraws',
              require: 'excel/WithdrawExportList'
            },
            component: () =>
              import('../views/finance/withdraws/withdrawExportList.vue')
          },
          {
            path: '/paySupplier',
            meta: {
              title: '订单对账',
              require: 'goods/spuSaleList'
            },
            component: () =>
              import('../views/finance/paySupplier/paySupplier.vue')
          },
          {
            path: '/agentAchievement',
            meta: {
              title: '用户业绩',
              require: 'summary/performance'
            },
            component: () =>
              import('../views/finance/agentAchievement/agentAchievement.vue')
          },
          {
            path: '/balanceSummary',
            meta: {
              title: '资金池',
              require: 'finance/balanceSummary'
            },
            component: () =>
              import('../views/finance/balanceSummary/balanceSummary.vue')
          },
          {
            path: '/letfreeExemptUsers',
            meta: {
              title: '免签用户',
              require: 'letfree/exemptUserList'
            },
            component: () =>
              import('../views/finance/letfree/letfreeExemptUsers.vue')
          },
          {
            path: '/rechargeRecords',
            meta: {
              title: '充值记录',
              require: 'rechargeRecord/list'
            },
            component: () =>
              import('../views/finance/rechargeRecords/rechargeRecords.vue')
          },
          {
            path: '/withdrawRecords',
            meta: {
              title: '资金池提现金额记录',
              require: 'finance/fundsWithdrawList',
              subpage: true,
              parentPath: '/balanceSummary'
            },
            component: () =>
              import('../views/finance/balanceSummary/withdrawRecords.vue')
          },
        ]

      }, {
        path: '/',
        meta: {
          title: '权限管理',
          childPath: [
            '/admins',
            '/adminGroups'
          ],
          moduleName: 'auth',
          icon: 'el-icon-s-custom'
        },
        component: () =>
          import('../layout/Content.vue'),
          children: [{
            path: '/admins',
            meta: {
              title: '管理员管理',
              require: 'manager/list'
            },
            component: () =>
              import('../views/permission/admins/admins.vue')
          },{
            path: '/adminGroups',
            meta: {
              title: '岗位管理',
              require: 'auth/groupList'
            },
            component: () =>
              import('../views/permission/adminGroups/adminGroups.vue')
          }, ]
      }, {
        path: '/',
        meta: {
          title: '系统',
          childPath: [
            '/systemInfo',
            '/customInfo',
            '/userAgreement',
            '/agreement',
            '/agreementInfo',
            '/appInfo'
          ],
          moduleName: 'system',
          icon: 'el-icon-s-tools'
        },
        component: () =>
          import('../layout/Content.vue'),
        children: [
          {
            path: '/systemInfo',
            meta: {
              title: '系统设置',
              require: 'system/info'
            },
            component: () =>
              import('../views/system/systemInfo/systemInfo.vue')
          },
          {
            path: '/customInfo',
            meta: {
              title: '海报设置',
              require: 'system/info'
            },
            component: () =>
              import('../views/system/customInfo/customInfo.vue')
          },
          {
            path: '/agreement',
            meta: {
              title: '协议列表',
              require: 'agreement/list'
            },
            component: () =>
              import('../views/system/agreement/agreement.vue')
          },
          {
            path: '/userAgreement',
            meta: {
              title: '用户协议签约列表',
              require: 'userAgreement/list'
            },
            component: () =>
              import('../views/system/userAgreement/userAgreement.vue')
          },
          {
            path: '/agreementInfo',
            meta: {
              title: '协议详情',
              require: 'agreement/list',
              subpage: true,
              parentPath: '/agreement'
            },
            component: () =>
              import('../views/system/agreement/info.vue')
          },
          {
            path: '/appInfo',
            meta: {
              title: 'APP设置',
              require: 'appVersion/list'
            },
            component: () =>
              import('../views/system/appInfo/appInfo.vue')
          }
        ]
      },
      {
        path: '/404',
        component: () => import( /* webpackChunkName: "404" */ '../views/404.vue'),
        meta: {
            title: '404'
        }
      },
      {
        path: '/403',
        component: () => import( /* webpackChunkName: "403" */ '../views/403.vue'),
        meta: {
            title: '403'
        }
      }]
    },
    {
      name: 'login', //确保login的这个name存在，这个name是作为判断是否需要检验token的标志
      path: '/login',
      component: () =>
        import('../views/login.vue')
    },
    {
      path: '*',
      redirect: '/404'
    }
  ]
})
