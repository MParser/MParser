import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';

import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    UnoCSS(),
    AutoImport({
      imports: [
        'vue',
        {
          'vue-router': [
            'useRoute',
            'useRouter'
          ],
          pinia: [
            ['storeToRefs', 'refStore']
          ],
          '@/stores': [
            'useAppStore',
            'useUserStore'
          ],
          '@vueuse/core': [
            'useDark',
            'useToggle'
          ]
        },
        {
          from: 'vue-router',
          imports: [
            'RouteLocationRaw'
          ],
          type: true
        },
        {
          from: '@/types',
          imports: [
            'Page',
            'Menu',
            'SidebarMenu',
            'User',
            'Department'
          ],
          type: true
        }
      ],
      resolvers: [
        ElementPlusResolver()
      ],
      dts: './src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [
        ElementPlusResolver()
      ],
      dirs: [
          './src/components',
          './src/core/components',
      ],
      dts: './src/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src/core', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      }
    }
  }
});
