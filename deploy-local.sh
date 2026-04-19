#!/bin/bash
# Script local - ejecutar desde tu PC cuando quieras hacer deploy
# Hace commit, push a GitHub y luego ejecuta el deploy en el VPS

VPS_IP="155.133.23.143"
VPS_USER="root"

# Pedir mensaje del commit
echo ""
echo "======================================"
echo "  DEPLOY - SISTEMA ELECTORAL"
echo "======================================"
echo ""
read -p "Descripcion de los cambios: " MENSAJE

if [ -z "$MENSAJE" ]; then
    echo "Error: Debes ingresar una descripcion."
    exit 1
fi

echo ""
echo "[1/3] Subiendo cambios a GitHub..."
git add .
git commit -m "$MENSAJE"
git push origin main
echo "      Push completado."

echo "[2/3] Conectando al VPS y ejecutando deploy..."
ssh ${VPS_USER}@${VPS_IP} "bash /var/www/deploy.sh"

echo "[3/3] Listo."
echo ""
echo "Tu aplicacion esta actualizada en http://${VPS_IP}"
echo ""
