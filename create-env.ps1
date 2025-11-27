# Script PowerShell para criar o arquivo .env
# Execute: .\create-env.ps1

Write-Host "Criando arquivo .env..." -ForegroundColor Green

$envContent = @"
VITE_FIREBASE_API_KEY=AIzaSyCbPxawpRYpo7mpEX1lGiR9re8ZcPKWM4g
VITE_FIREBASE_AUTH_DOMAIN=delivery-53b5b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=delivery-53b5b
VITE_FIREBASE_STORAGE_BUCKET=delivery-53b5b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=508925414452
VITE_FIREBASE_APP_ID=1:508925414452:web:0aec75c8cdc9fcfe630e61
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host "Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host "Agora você pode executar: npm run dev" -ForegroundColor Yellow

