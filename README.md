# Tally

A comprehensive inventory and order management platform built for print-on-demand businesses.

## Overview

Tally streamlines the entire POD workflow from material tracking to order fulfillment. Track inventory levels, manage product catalogs, monitor orders through production stages, and integrate with major sales channels and print providers.

## Features

### Materials Management
- Real-time inventory tracking with low-stock alerts
- Bulk quantity adjustments and pack size management
- Material requirements calculator for production planning
- Color and size variant organization

### Product Catalog
- Template-based product creation with material requirements
- Design library with file preview and organization
- Production feasibility calculator based on current inventory
- SKU and pricing management

### Order Fulfillment
- Multi-stage pipeline from design approval to delivery
- Financial tracking with profit margin analysis
- Shipping management with carrier integration
- Invoice generation and payment status tracking

### Integrations
- **Sales Channels**: Shopify, Etsy, Amazon, WooCommerce
- **Print Providers**: Printful, Printify, Gooten
- **Design Tools**: Canva, Adobe Creative Cloud, Google Drive
- **Analytics**: Facebook Pixel, Google Analytics, Klaviyo

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Database (PostgreSQL recommended)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd tally

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and auth provider details

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tally"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard page
│   └── (auth)/           # Authentication pages
├── components/            # React components
│   ├── AddProductPage.tsx # Product creation form
│   ├── IntegrationsPage.tsx # Third-party integrations
│   ├── FulfillmentPage.tsx # Order management
│   └── MaterialsPage.tsx  # Inventory tracking
├── lib/                   # Utility functions
└── types/                 # TypeScript definitions
```

## Database Schema

The application uses Prisma with the following core entities:

- **User**: Authentication and account management
- **Material**: Inventory items with quantities and specifications
- **Product**: Templates defining material and design requirements
- **Design**: Digital assets and artwork files
- **Order**: Customer orders with fulfillment tracking

## API Reference

### Materials
- `GET /api/materials` - List all materials
- `POST /api/materials` - Create new material
- `PATCH /api/materials/[id]` - Update material quantity

### Products
- `GET /api/products` - List all products with availability
- `POST /api/products` - Create new product template

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order

### Designs
- `GET /api/designs` - List all designs
- `POST /api/designs` - Upload new design

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

The project uses ESLint and follows Next.js conventions. Components are organized by feature with co-located styles and utilities.

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

For other platforms, build the application with `npm run build` and serve the generated files.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue on GitHub or contact the development team.
