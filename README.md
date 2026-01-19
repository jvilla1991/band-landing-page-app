# Musician Landing Page

A minimal, production-ready React landing page for a musician that functions as a "link-in-bio" page. Built with React, TypeScript, and Vite.

## Features

- Single-page layout with dark, modern aesthetic (metal/alt vibe)
- Profile image/logo at top with artist name and tagline
- Primary CTA button ("Listen Now")
- Secondary buttons for social links
- Fully responsive and mobile-first design
- Links configured in a separate config file
- SEO optimized with Open Graph meta tags

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Plain CSS** (no UI frameworks) for styling
- **CSS Custom Properties** for theming

## Getting Started

### Prerequisites

- **Node.js v18 or higher** (required - Vite 5+ requires Node.js 18+)
- npm or yarn

**Note:** If you're using Node.js 16 or earlier, you'll need to upgrade. You can use a Node version manager like [nvm](https://github.com/nvm-sh/nvm) (Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows)) to install and switch between Node.js versions.

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Customization

### Updating Links and Content

Edit `src/config/links.ts` to customize:

- Artist name and tagline
- Primary CTA link (Spotify, Apple Music, Bandcamp, etc.)
- Social media links (Instagram, Twitter/X, YouTube, etc.)
- SEO metadata (title, description, URL)
- Asset paths

Example:
```typescript
export const config: AppConfig = {
  artistName: "Your Artist Name",
  tagline: "Your tagline here",
  primaryCTA: {
    label: "Listen Now",
    href: "https://your-music-link.com",
  },
  socialLinks: [
    {
      label: "Instagram",
      href: "https://instagram.com/yourhandle",
    },
    // Add more social links...
  ],
  // ... rest of config
};
```

### Adding Assets

1. Place your images in the `public/images/` directory
2. Recommended images:
   - `profile-image.jpg` - Profile image/logo (square, at least 400x400px recommended)
   - `og-image.jpg` - Open Graph image for social sharing (1200x630px recommended)

3. Update the asset paths in `src/config/links.ts` if you use different filenames:
```typescript
assets: {
  profileImage: "/images/your-profile-image.jpg",
  ogImage: "/images/your-og-image.jpg",
}
```

### Updating Meta Tags

Edit `index.html` to update:
- Page title
- Meta description
- Open Graph tags
- Twitter Card tags
- Site URL

Make sure the meta tags match your config in `src/config/links.ts` for consistency.

### Styling

- Global styles: `src/styles/index.css`
- Component styles: `src/styles/App.css`
- CSS custom properties (CSS variables) are defined in `index.css` for easy theming

To change colors, update the CSS variables in `:root`:
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --text-primary: #f5f5f5;
  --accent-primary: #ff4444;
  /* ... */
}
```

## Building for Production

1. Build the project:
```bash
npm run build
```

2. The production-ready files will be in the `dist/` directory

3. Preview the production build locally:
```bash
npm run preview
```

## Deploying

The `dist/` directory contains static files that can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder, or connect your Git repository
- **Vercel**: Connect your repository or use the Vercel CLI
- **GitHub Pages**: Use a GitHub Action to build and deploy
- **Any static host**: Upload the contents of `dist/` to your web server

## Project Structure

```
band-landing-page-app/
├── public/
│   └── images/          # Place your images here
├── src/
│   ├── components/      # React components
│   ├── config/          # Configuration (links.ts)
│   ├── styles/          # CSS files
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html           # HTML template with meta tags
└── package.json         # Dependencies and scripts
```

## License

This project is open source and available for personal or commercial use.
