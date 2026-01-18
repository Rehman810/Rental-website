import admin from 'firebase-admin';
// import serviceAccount from './config/serviceAccountKey/serviceAccountKey.json' assert { type: 'json' };

const service = {
 "type": "service_account",
  "project_id": "airbnb-4f322",
  "private_key_id": "8bb45cf7df50837981e2208cd8207dcb2f771758",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3khCBcZkMOpjn\nvNBVDzASA/5CwhANEIUesRBH3GFniJyuWep1iAmy8RTzE3k1kXYW2ihtEbAgOzwD\nxjvoY4UP4Rg6br7Uh25JlMkbpYKmUYCCk2ysukk91L5fsvYLiMdjd/mIvsmYe1Rc\ncisGKaz4QSBx9v1YHy50JkuAYVSlEWW7cmMMfGX0qojfQusGNF5VBU5VxFqjZa51\nIBYZ/xRYZQS7aeriXqXHOnJH1Czj9mo0SUuAbUIBlGqBGaZ5MydihCQAliD+r5dk\naCBSTAafeO09vxjB1Xn5pGtXc5ewIImLQAgBiL4lPfWPAeFOLymPoo9oKFuvquEn\nEOkxh4BlAgMBAAECggEAAiZI9gcTQc18MGHUNlwa6z8WOV27No1IuHBeLoU8s8EU\nWptNb5+5Q1nngvrUUBsFB7qkFLY2D9k5uEPtkX38LHstijOf8u5SDYpbOi0Q5QCD\n0Xjx9xTTBOZqmJrIdEqfURbHeoEyFvcXaLdihxbdAmba1H14qnvqUpcHNSM5TJnX\nihiiFHkvw3ZxStGp9SkceWbIRw/b+xe0VWcFtz+M9I+ZUX9/dolZf9+uOJoL+pLZ\ntXGFo9pGS68UBzu8UKn4xdY24kRdtkUyDZ4VcCWoGpQuOEAITWbbheqYu7L0A2j7\nVB1bJ5PBoTKGbH+rTNXPTzEM5BuEb1txV13tNsmNiQKBgQDsHLQZzWrak0py9oBB\n+Az6dOtb0sJHoqnE7GgN4tjcFaVEy1lMFw0ytL+Dpo5HWEapvqt3CX5Yz03pg1q7\nFyGgoATpu78Cz/8Je4vSI4CWDNnjrEGc3u9iOvrrJLaa/xA1ghVIQBx7JhPmvzGU\n3Pvf3sIF+61S0dn2Ov/qERNt6QKBgQDHCGepXgDQWvDOErIcc5GtCa+yIDiEmu2k\nKwBTSxp58KspypkDv5DuHnUB1AcgsHdA7mi754T5uQfp0/y6YRxquAyC6eHiEEDA\nHwXRgtrP7YMccGilIk9yo6Ejlbk4D2MW37Z81o1NGmlCiZ5FqGZq2sLgKMPovrjc\na0Sl0iqFHQKBgQCRJoAtkJPM9VmCXTmx1G0eF3yNAX8ADOazMeYyCy/n9MKaDSzD\nUzSA5I8Lvvuero0aUyYT0tlCfYbXNDI16913YohCrHGbqASQbswhDkRBensEtOPN\nLVwalkmk/vfnR0BOtL6ioQ8hQeJgK0+uxT9ufAHpLbR6wpls/w5Oddrs6QKBgQCD\n2jWSJgwz+4r7ebc00fr3vyr9vgqzDk/QKgyVIXPwxFcf4G9t5EKG/PZWt7fhGAZo\npYgMs1uMc9+iMCWE80B4EmV3dKmHsWyz2dlo6l860AXDmVQ50XkAYRYnFNEXKlpi\nlOG34grJwW1p/vEzBFSVBUeEaH0gevjMTOO1Vn2EoQKBgHZ6KNMAFy3hFjil3rf9\nrALxPFFsi/JVSV402bmv45ETrqtXsFARcqXpIXQc7GaQW+kQ0AqcPeas/6r/AYLC\nteprvwBOOiq9XWe769wp7D4mT+EQMX6QAJPRC6VQUWnLBFjukwBlxhvbs8CCDsW8\nPfxD+SgTLsokZQrqrsUZYCOU\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-ankmr@airbnb-4f322.iam.gserviceaccount.com",
  "client_id": "106647115597863669666",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ankmr%40airbnb-4f322.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(service),
  databaseURL: 'https://airbnb-4f322-default-rtdb.firebaseio.com', 
});

const database = admin.database();

export { admin, database }
