# Pubble Plastering Website

A modern, professional website and admin system for Pubble Plastering, a UK-based plastering and construction company.

## Features

### Public Website

- **Homepage** - Hero section, services overview, featured projects, testimonials
- **About** - Company story, values, team information
- **Services** - Detailed service offerings with descriptions
- **Projects** - Portfolio gallery with filtering by category
- **Blog** - SEO-optimized articles with categories, tags, and table of contents
- **Contact** - Contact form with quote request functionality

### Admin Dashboard

- **Dashboard** - Overview with stats, recent projects, and quote requests
- **Clients** - Client management with contact details and project history
- **Projects** - Project tracking with status management and image gallery
- **Invoices** - Invoice generation with line items, VAT calculation, and PDF export
- **Receipts** - Payment recording and receipt generation
- **Blog** - Full blog editor with SEO tools and media management
- **Media Library** - Image upload and management
- **Quote Requests** - Lead management with status tracking
- **Settings** - Company settings, invoicing configuration, notifications

## Tech Stack

- **Framework**: Next.js 14.1.0 with React 18
- **Database**: Prisma ORM with SQLite (easily switchable to PostgreSQL)
- **Styling**: Tailwind CSS 3.4.1 with custom design system
- **Authentication**: NextAuth.js 4.24.5
- **PDF Generation**: jsPDF 2.5.1
- **Email**: Nodemailer 6.9.8
- **Icons**: React Icons (Feather icon set)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pubble-plastering
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration.

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed the database with sample data:

```bash
npx prisma db seed
```

6. Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the site.

### Creating an Admin User

To create your first admin user, you can use the Prisma Studio:

```bash
npx prisma studio
```

Or create a seed script to add a user with a hashed password.

## Project Structure

```
pubble-plastering/
├── prisma/
│   └── schema.prisma       # Database schema
├── public/
│   └── uploads/            # Uploaded media files
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── blog/           # Blog-specific components
│   │   ├── common/         # Reusable UI components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components (Navbar, Footer)
│   │   └── projects/       # Project-related components
│   ├── config/
│   │   └── siteSettings.js # Site configuration
│   ├── lib/
│   │   ├── prisma.js       # Prisma client
│   │   ├── email.js        # Email utilities
│   │   └── utils.js        # Helper functions
│   ├── pages/
│   │   ├── admin/          # Admin pages
│   │   ├── api/            # API routes
│   │   ├── blog/           # Blog pages
│   │   ├── projects/       # Projects pages
│   │   └── ...             # Other public pages
│   ├── services/           # Backend services
│   └── styles/             # CSS files
├── .env.example            # Environment variables template
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json
```

## Customization

### Branding

Update the brand colors in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#ED7620', // Main brand color
    // ... other shades
  },
}
```

Update company information in `src/config/siteSettings.js`:

```javascript
export const siteSettings = {
  company: {
    name: "Pubble Plastering",
    phone: "07123 456789",
    email: "info@pubbleplastering.co.uk",
    // ...
  },
};
```

### Database

The project uses SQLite by default for easy development. To switch to PostgreSQL:

1. Update `DATABASE_URL` in `.env.local`
2. Update the provider in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run `npx prisma generate && npx prisma db push`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm start
```

## API Routes

### Public

- `POST /api/quotes` - Submit quote request
- `POST /api/contact` - Submit contact form
- `GET /api/blog` - Get published blog posts
- `GET /api/blog/[slug]` - Get single blog post

### Protected (Admin)

- `/api/clients` - Client CRUD
- `/api/projects` - Project CRUD
- `/api/invoices` - Invoice CRUD
- `/api/blog` (POST/PUT/DELETE) - Blog management
- `/api/upload` - File uploads

## License

Private - All rights reserved.

## Support

For support, email support@pubbleplastering.co.uk
