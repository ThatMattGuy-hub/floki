// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode'
  ],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api/v1'
    }
  },

  app: {
    head: {
      title: 'Floki - Project Management',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Floki - Comprehensive project management platform' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/floki.png' },
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
          crossorigin: 'anonymous'
        }
      ],
      script: [
        { 
          src: 'https://cdn.tailwindcss.com',
          tagPosition: 'head',
          defer: false
        },
        {
          children: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    primary: {
                      50: '#f0f9ff',
                      100: '#e0f2fe',
                      200: '#bae6fd',
                      300: '#7dd3fc',
                      400: '#38bdf8',
                      500: '#0ea5e9',
                      600: '#0284c7',
                      700: '#0369a1',
                      800: '#075985',
                      900: '#0c4a6e',
                      950: '#082f49'
                    }
                  },
                  fontFamily: {
                    sans: ['Montserrat', 'system-ui', 'sans-serif']
                  }
                }
              }
            }
          `,
          type: 'text/javascript',
          tagPosition: 'head'
        }
      ]
    }
  },

  typescript: {
    strict: true,
    typeCheck: false  // Disable type checking in dev mode
  },

  compatibilityDate: '2024-01-01'
})

