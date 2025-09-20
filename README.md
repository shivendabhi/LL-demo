# Tally

A comprehensive inventory and order management platform built for print-on-demand businesses. Try it out at https://ll-demo@vercel.app
Sign in with:
- email:shiven.dabhi@skiff.com
- pw: password132
<img width="3783" height="1979" alt="image" src="https://github.com/user-attachments/assets/3ae985c1-fb5c-4216-82a3-b87c82ae4d59" />

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

### Integrations(Simulated)
- **Sales Channels**: Shopify, Etsy, Amazon, WooCommerce
- **Print Providers**: Printful, Printify, Gooten
- **Design Tools**: Canva, Adobe Creative Cloud, Google Drive
- **Analytics**: Facebook Pixel, Google Analytics, Klaviyo

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Auth.js
- **Database**: Prisma ORM + Supabase
- **Deployment**: Vercel

## Getting Started
### Installation

```bash
# Clone the repository
git clone [repository-url]
cd tally

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tally"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
DIRECT_URL=""

# Install dependencies
npm install

npx prisma generate && npx prisma db push

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and auth provider details

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.


