export default {
    // Target (https://go.nuxtjs.dev/config-target)
    target: 'static',

    // Global page headers (https://go.nuxtjs.dev/config-head)
    head: {
        title: 'Spiritual gifts discovery app',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: '' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
    },

    // Global CSS (https://go.nuxtjs.dev/config-css)
    css: [
        // swiper style
        'swiper/css/swiper.css',
    ],

    // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
    plugins: [{
            src: '@/plugins/vue-awesome-swiper.client',
            mode: "client"
        },
        {
            src: '@plugins/vue-am4charts.client',
            mode: "client"
        },
        {
            src: "@/plugins/vue-storage-watcher.client",
            mode: "client"
        }
    ],

    // Auto import components (https://go.nuxtjs.dev/config-components)
    components: true,

    // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
    buildModules: [],

    // Modules (https://go.nuxtjs.dev/config-modules)
    modules: [
        // https://go.nuxtjs.dev/bootstrap
        ['bootstrap-vue/nuxt', {
            icons: true
        }],
        ['nuxt-i18n', {
            lazy: true,
            langDir: 'lang/',
            defaultLocale: 'rw',
            locales: [{
                    name: 'Kinyarwanda',
                    code: 'rw',
                    iso: 'rw-RW',
                    file: 'rw-RW.js'
                }, {
                    name: 'English',
                    code: 'en',
                    iso: 'en-US',
                    file: 'en-US.js'
                },
                {
                    name: 'Français',
                    code: 'fr',
                    iso: 'fr-FR',
                    file: 'fr-FR.js'
                }
            ],
        }],
    ],

    // Build Configuration (https://go.nuxtjs.dev/config-build)
    build: {
        extend(config, ctx) {
            if (ctx.isDev) {
                config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
            }
        }
    }
}