import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const appName = env.VITE_APP_NAME || 'Mehman';

    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
                manifest: {
                    name: appName,
                    short_name: appName,
                    description: 'Holiday rentals, cabins, beach, houses & more',
                    theme_color: '#ffffff',
                    background_color: '#ffffff',
                    display: 'standalone',
                    orientation: 'portrait',
                    start_url: '/',
                    icons: [
                        {
                            src: '/icons/pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                            purpose: 'any'
                        },
                        {
                            src: '/icons/pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any'
                        },
                        {
                            src: '/icons/pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'maskable'
                        }
                    ]
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
                    runtimeCaching: [
                        {
                            urlPattern: ({ request }) => request.destination === 'image',
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'images-cache',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
                                }
                            }
                        },
                        {
                            urlPattern: ({ url }) => url.pathname.startsWith('/api') || url.hostname.includes('api'),
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'api-cache',
                                networkTimeoutSeconds: 10,
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 24 * 60 * 60 // 1 Day
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'static-assets-cache',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
                                }
                            }
                        }
                    ],
                    navigateFallback: '/index.html',
                    navigateFallbackDenylist: [/^\/api/]
                },
                devOptions: {
                    enabled: false,
                }
            })
        ],
        server: {
            host: '0.0.0.0',
            port: 5174,
        }
    }
})
