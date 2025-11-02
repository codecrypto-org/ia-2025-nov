# CLAUDE.md

# Objective

Crear una pagina web que implemente una calculadora de operaciones matematicas basicas.

# Architecture

La web sera desarrollada usando HTML, CSS con Tailwind y Typescript.

## Project Structure

- `index.html` - Página principal con la interfaz de la calculadora
- `calculator.ts` - Lógica de la calculadora en TypeScript
- `calculator.js` - Archivo JavaScript compilado desde TypeScript
- `package.json` - Configuración del proyecto y dependencias
- `tsconfig.json` - Configuración del compilador de TypeScript

## Development Commands

- `npm install` - Instalar dependencias
- `npm run build` - Compilar TypeScript a JavaScript
- `npm run watch` - Compilar TypeScript en modo watch (recompila automáticamente al guardar cambios)

## Running the Application

Abrir `index.html` en un navegador web. La aplicación usa Tailwind CSS via CDN, por lo que no requiere un servidor de desarrollo.

## Calculator Features

La calculadora soporta:
- Operaciones básicas: suma (+), resta (-), multiplicación (×), división (÷)
- Números decimales
- Cambiar signo (+/-)
- Porcentaje (%)
- Botón clear (C) para resetear
