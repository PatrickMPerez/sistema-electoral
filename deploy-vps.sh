#!/bin/bash
# Script de deploy en el VPS - se ejecuta desde el servidor
set -e

BACKEND="/var/www/backend"
FRONTEND_SRC="/var/www/repo/sistema-electoral-frontend"
FRONTEND_WEB="/var/www/frontend"

echo ""
echo "======================================"
echo "  DEPLOY - SISTEMA ELECTORAL"
echo "======================================"

# ---- BACKEND ----
echo ""
echo "[1/4] Actualizando backend Laravel..."
cd $BACKEND
git pull origin main
composer install --no-dev --optimize-autoloader --quiet
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link 2>/dev/null || true
chown -R www-data:www-data storage bootstrap/cache
echo "      Backend OK"

# ---- FRONTEND ----
echo "[2/4] Actualizando frontend Angular..."
cd $FRONTEND_SRC
git pull origin main
npm ci --silent
echo "[3/4] Construyendo Angular para produccion..."
npm run build -- --configuration production

echo "[4/4] Publicando frontend..."
rm -rf $FRONTEND_WEB
cp -r dist/sistema-electoral-frontend/browser $FRONTEND_WEB
chown -R www-data:www-data $FRONTEND_WEB

# ---- SERVICIOS ----
systemctl reload nginx
systemctl restart php8.2-fpm

echo ""
echo "======================================"
echo "  DEPLOY COMPLETADO con exito"
echo "======================================"
echo ""
