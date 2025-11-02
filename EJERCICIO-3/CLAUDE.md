# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router architecture with TypeScript, React 19, and Tailwind CSS v4. The project is a fresh create-next-app bootstrap with minimal configuration.

## Commands

All commands must be run from the `web/` directory:

```bash
cd web
```

### Development
- `npm run dev` - Start the Next.js development server on http://localhost:3000
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Package Management
- `npm install` - Install dependencies after cloning or when package.json changes

## Architecture

### Project Structure
- `web/` - Main Next.js application directory
  - `app/` - Next.js App Router directory (Next.js 13+ convention)
    - `layout.tsx` - Root layout component with Geist font configuration
    - `page.tsx` - Home page component
    - `globals.css` - Global styles including Tailwind directives
  - `public/` - Static assets (SVG files for UI elements)
  - `next.config.ts` - Next.js configuration (TypeScript)
  - `tsconfig.json` - TypeScript configuration with path alias `@/*` pointing to root

### Key Technologies
- **Next.js 16** with App Router (not Pages Router)
- **React 19.2.0** - Latest React version
- **TypeScript 5** - Strict mode enabled
- **Tailwind CSS v4** - Using @tailwindcss/postcss (v4 architecture, no separate config file needed)
- **Geist Fonts** - Custom font family (Geist Sans and Geist Mono) loaded via next/font/google

### TypeScript Configuration
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` maps to project root
- Strict mode: enabled
- JSX mode: react-jsx (React 19 transform)

### Styling Architecture
- Tailwind CSS v4 with PostCSS integration
- Dark mode support via `dark:` class prefixes
- Global styles in `app/globals.css`
- Geist font variables available as CSS variables: `--font-geist-sans` and `--font-geist-mono`

## Development Notes

### App Router Conventions
- Server Components by default (unless 'use client' directive is added)
- File-based routing in `app/` directory
- `layout.tsx` wraps all pages and persists across navigation
- `page.tsx` defines the UI for a route segment
- Metadata exported from layouts/pages for SEO

### Image Optimization
- Use Next.js `<Image>` component from `next/image` for automatic optimization
- Static assets in `public/` are served from root path (e.g., `/next.svg`)

### Adding New Pages
Create new `page.tsx` files in `app/` subdirectories following App Router conventions:
- `app/about/page.tsx` → `/about` route
- `app/blog/[slug]/page.tsx` → `/blog/:slug` dynamic route
