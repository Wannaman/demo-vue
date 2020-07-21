const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
const defaultSettings = require('./src/main.js')
const path = require('path')
const resolve = dir => path.join(__dirname, dir)
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const plugins = [
    [
        'import',
        {
            libraryName: 'vant',
            libraryDirectory: 'es',
            style: true
        },
        'vant'
    ]
]
// 去除 console.log
if (IS_PROD) {
    plugins.push('transform-remove-console')
}

module.exports = {
    publicPath: './', // 署应用包时的基本 URL。 vue-router hash 模式使用
    //  publicPath: '/app/', // 署应用包时的基本 URL。  vue-router history模式使用
    outputDir: 'dist', //  生产环境构建文件的目录
    assetsDir: 'static', //  outputDir的静态资源(js、css、img、fonts)目录
    lintOnSave: process.env.NODE_ENV !== IS_PROD,
    productionSourceMap: false, // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
    devServer: {
        // ....
        proxy: {
            //配置跨域
            '/api': {
                target: 'https://test.xxx.com', // 接口的域名
                // ws: true, // 是否启用websockets
                changOrigin: true, // 开启代理，在本地创建一个虚拟服务端
                pathRewrite: {
                    '^/api': '/'
                }
            }
        }
    },
    css: {
        extract: IS_PROD,
        sourceMap: false,
        loaderOptions: {
            // 给 scss-loader 传递选项
            scss: {
                // 注入 `sass` 的 `mixin` `variables` 到全局, $cdn可以配置图片cdn
                // 详情: https://cli.vuejs.org/guide/css.html#passing-options-to-pre-processor-loaders
                prependData: `
                @import "assets/css/mixin.scss";
                @import "assets/css/variables.scss";
                $cdn: "${defaultSettings.$cdn}";
                 `,
            },
        },
    },
    chainWebpack: config => {
        // 添加别名
        config.resolve.alias
            .set('@', resolve('src'))
            .set('assets', resolve('src/assets'))
            .set('api', resolve('src/api'))
            .set('views', resolve('src/views'))
            .set('components', resolve('src/components'))
            .set('@/config', resolve('src/config/config'))
        // 打包分析
        if (IS_PROD) {
            config.plugin('webpack-report').use(BundleAnalyzerPlugin, [
                {
                    analyzerMode: 'static'
                }
            ])
        }
        config.when(IS_PROD, config => {
            config
                .plugin('ScriptExtHtmlWebpackPlugin')
                .after('html')
                .use('script-ext-html-webpack-plugin', [
                    {
                        // 将 runtime 作为内联引入不单独存在
                        inline: /runtime\..*\.js$/
                    }
                ])
                .end()
            config.optimization.splitChunks({
                chunks: 'all',
                cacheGroups: {
                    // cacheGroups 下可以可以配置多个组，每个组根据test设置条件，符合test条件的模块
                    commons: {
                        name: 'chunk-commons',
                        test: resolve('src/components'),
                        minChunks: 3, //  被至少用三次以上打包分离
                        priority: 5, // 优先级
                        reuseExistingChunk: true // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
                    },
                    node_vendors: {
                        name: 'chunk-libs',
                        chunks: 'initial', // 只打包初始时依赖的第三方
                        test: /[\\/]node_modules[\\/]/,
                        priority: 10
                    },
                    vantUI: {
                        name: 'chunk-vantUI', // 单独将 vantUI 拆包
                        priority: 20, // 数字大权重到，满足多个 cacheGroups 的条件时候分到权重高的
                        test: /[\\/]node_modules[\\/]_?vant(.*)/
                    }
                }
            })
            config.optimization.runtimeChunk('single')
        })
    },
    presets: [['@vue/cli-plugin-babel/preset', {useBuiltIns: 'entry'}]],
    plugins,
}
