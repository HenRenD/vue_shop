module.exports = {
    lintOnSave: false, // eslint-loader 是否在保存的时候检查

    chainWebpack:(config) => {
        config.when(process.env.NODE_ENV === "production",(config) => {
            config.entry("app").clear().add('./src/main-prod.js')
            config.set("externals", {
                vue: "Vue",
                "vue-router": "VueRouter",
                axios: "axios",
                lodash: "_",
                echarts: "echarts",
                nprogress: "NProgress",
                "vue-quill-editor":"VueQuillEditor"
            })
            config.plugin('html').tap(args => {
                args[0].isProd = true
                return args
                })
        })

        config.when(process.env.NODE_ENV === "development",(config) => {
            config.entry("app").clear().add('./src/main-dev.js')
            config.plugin('html').tap(args => {
                args[0].isProd = false
                return args
                })
        })
    }
}
