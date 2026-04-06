exports.handler = async () => {
  try {
    const fallbackConfig = {
      apiKey: "AIzaSyCn4CsXikHCNwOzqQWK8C8kibalkS5zvG4",
      authDomain: "reportroyalcafe1.firebaseapp.com",
      projectId: "reportroyalcafe1",
      storageBucket: "reportroyalcafe1.firebasestorage.app",
      messagingSenderId: "528999602313",
      appId: "1:528999602313:web:2af6caaa838305baa10e58",
      measurementId: "G-XY2LD7VQB6"
    };
    // =========================
    // 1) Leer env vars Netlify
    // =========================
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || fallbackConfig.apiKey,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
      projectId: process.env.FIREBASE_PROJECT_ID || fallbackConfig.projectId,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
      appId: process.env.FIREBASE_APP_ID || fallbackConfig.appId,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId
    };

    // =========================
    // 2) Validación dura
    // =========================
    const requiredKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];
    const faltantes = requiredKeys.filter(key => !firebaseConfig[key]);

    if (faltantes.length) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          error: "Faltan variables de entorno en Netlify",
          faltantes
        })
      };
    }

    // =========================
    // 3) Respuesta
    // =========================
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify(firebaseConfig)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Error getConfig", message: err.message })
    };
  }
};
