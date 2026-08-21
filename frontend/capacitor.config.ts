import type { CapacitorConfig } from '@capacitor/cli';

const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
    appId:   'org.cficiras.cfilink',   // ✅ appId personnalisé (plus io.ionic.starter)
    appName: 'CFI-LINK',
    webDir:  'dist',

    server: {
        // En dev : pointer vers le serveur Vite ou l'IP de la machine
        // En prod : l'app charge les fichiers locaux (dist/)
        ...(isProduction
            ? {}
            : { url: 'http://10.0.2.2:5173', cleartext: true }),  // 10.0.2.2 = localhost pour l'émulateur Android
        androidScheme: 'https',
    },

    plugins: {
        // Préférer les tokens Bearer (pas les cookies HttpOnly) sur WebView mobile
        // Les cookies Sanctum SPA ne fonctionnent pas dans WKWebView iOS ni WebView Android
        // → authService.ts utilise sessionStorage pour le token Bearer
    },
};

export default config;
