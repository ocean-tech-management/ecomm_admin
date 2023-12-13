项目名称： 常规 商城端<br>
npm webpack init初始化项目

~~~
www 
 ├─setup.cmd             项目快速安装
 ├─launch.cmd            项目快速启动
 ├─build.cmd             项目快速打包
 ├─index.html            项目入口，该文件是整个项目的基础
 ├─.eslintrc.js          eslint配置文件，统一代码风格用
 ├─.browserslistrc       代码检验器，转译及语法检查用
 ├─postcss.config.js     css预编译器配置
 ├─package.json          npm依赖项说明文件，供npm安装使用
 ├─README.md             README 文件
 ├─.babelrc              babel的配置文件,主要适用于编译es6转义为es5
 │
 ├─static                项目使用的外部sdk目录，当前有阿里云的oss相关sdk
 │
 ├─build  
 │  ├─build.js              生产环境构建脚本，打包时所需依赖的引入配置信息
 │  ├─check-versions.js     用来检测node和npm版本
 │  ├─logo.png              项目logo
 │  ├─utils.js              wepack相关配置文件，主要用来处理css-loader和vue-style-loader
 │  ├─vue-loader.conf.js    处理.vue文件的配置文件
 │  ├─webpack.base.conf.js  wabpack基础配置
 │  ├─webpack.dev.conf.js   在webpack.base.conf的基础上增加完善开发环境的配置
 │  └─webpack.prod.conf.js  webpack生产环境的核心配置文件
 │
 ├─config  
 │  ├─dev.env.js            打包测试环境用的配置信息
 │  ├─index.js              基本配置信息，用于项目打包或者运行（包括端口号与代理等）
 │  └─prod.env.js           打包生产环境用的配置信息
 └─src  
    ├─App.vue               页面公共入口，根组件
    ├─config.js             公共配置
    ├─util                  公共处理方法入口，包括网络请求与其他特殊方法
    ├─main.js               项目引用依赖、实例化入口
    ├─store                 store文件入口，公共状态管理
    ├─router                路由配置入口，路由特殊设置见内文件中的代码注释
    ├─assets                资源文件夹
    ├─libs                  公共库
    │  ├─theme.less         主题样式表，配置颜色、字号等
    │  └─layout.less        公共样式表，定义框架页面的基本表现。其他less文件在此注入
    │
    ├─layout                框架基本页面结构目录
    │  │                    首字母大写避免命名冲突
    │  │                    
    │  ├─Header.vue         头部
    │  ├─Nav.vue            侧边栏
    │  ├─Breadcrumbs.vue    面包屑
    │  ├─Content.vue        页面内容容器，一般仅用于路由特殊设计下的视图入口，平常不用上
    │  └─Footer.vue         页脚
    │  
    ├─partialviews          局部视图文件夹（弹窗内容）
    │  │                    首字母大写避免命名冲突    
    │  │                                        
    │  ├─common             通用/复用的局部视图   
    │  ├─order              局部视图板块名，一般为主视图的名称（单数）
    │  │  │      
    │  │  ├─logisticsDetail.vue             板块根目录下文件一般为该模块多处复用的文件  
    │  │  ├─order                           板块下的文件夹一般与主视图下文件夹名（模块）   
    │  │  │  ├─logisticsDetail.vue          局部视图，首字母大写避免命名冲突  
    │  │  │  └─… 
    │  │  └─…                
    │  └─…        
    │
    └─views                 主视图文件夹（页面）
        ├─login.vue         登录页
        ├─main.vue          登录后的App项目入口，在此决定页面基本布局结构
        ├─…        
~~~

启动：
1. 在根目录，运行<br>
```npm i```<br>
2. 安装依赖完成后，以后只要运行<br>
```npm run dev```<br>
即可启动环境

打包发布：
1. 在根目录，运行<br>
```npm run build```<br>
将会在根目录生成dist文件夹，该文件夹用于发布线上代码。

启动与打包也可通过```launch.cmd```与```build.cmd```快速启动

注意事项：
1. ```npm: 5.6.0``` , ```node: v8.11.1```
2. 项目主体框架依赖于```elementUI```，详见[elementUI](http://element.eleme.io/#/zh-CN/component/installation "elementUI")
3. 公共页面为main.vue，路由配置下的main键下面的所有子项都引用main.vue这个外部框
4. 子页面的高亮指向到parantNode值对应的项
5. 权限主要关注require变量，可全局搜索$auths来查看何处引用了权限。主要是用在了侧边栏与路由卫士以及各个操作按钮的显示隐藏上
6. 路由中moduleName为模块名，用来确定顶部导航栏的各个项在哪个范围内进行页面选择跳转。主要取决于服务器返回的权限列表里对应模块的第一个页面要求权限。详情见Header.vue
7. 路由项中仅做模块分块使用的'/'级别，需要引入Content.vue作为模块中的各个项的渲染入口
8. 国内线路推荐使用cnpm安装依赖  ```cnpm i```

### 本地配置项说明
See [Configuration Reference](https://cli.vuejs.org/config/).
