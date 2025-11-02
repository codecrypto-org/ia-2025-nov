#!/bin/bash

# Script para iniciar la aplicación de consultas PostgreSQL con MCP

echo "🚀 Iniciando PostgreSQL Query Interface con MCP..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo "Por favor instala Node.js 18 o superior desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Error: Se requiere Node.js 18 o superior${NC}"
    echo "Versión actual: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"

# Verificar si PostgreSQL está corriendo en el puerto 5454
echo ""
echo "🔍 Verificando conexión a PostgreSQL..."

if command -v nc &> /dev/null; then
    if nc -z localhost 5454 2>/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL detectado en puerto 5454${NC}"
    else
        echo -e "${YELLOW}⚠️  Advertencia: No se detectó PostgreSQL en puerto 5454${NC}"
        echo "Asegúrate de que el contenedor Docker esté ejecutándose:"
        echo "  docker ps | grep postgres"
        echo ""
        read -p "¿Deseas continuar de todas formas? (s/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
            exit 1
        fi
    fi
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
fi

# Iniciar el servidor de desarrollo
echo ""
echo "🌐 Iniciando servidor de desarrollo..."
echo -e "${YELLOW}La aplicación estará disponible en http://localhost:3000${NC}"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev

