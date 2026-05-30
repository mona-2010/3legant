# 3legant — E-Commerce Website

A modern, full-stack e-commerce platform built with **Next.js**, **Supabase**, **Redux Toolkit**, and **Stripe**. Designed for performance, scalability, and a seamless shopping experience across all devices.

---

## Live Demo

> https://3legant-tau.vercel.app

---

## Features

### Customer-facing
- Product browsing with category filters, price filters, and sort options
- Detailed product pages with image gallery, colour selection, stock status, and countdown timer for deals
- Shopping cart with quantity controls and real-time subtotal calculation
- Coupon code application with validation (expiry, usage limit, minimum purchase)
- Wishlist to save products for later
- Secure checkout with saved shipping addresses
- Stripe payment integration (credit card and PayPal)
- Order confirmation page with full order summary
- Order history and tracking in the account dashboard
- Customer reviews and star ratings with threaded replies and likes
- Blog listing and detail pages
- Contact form

### Admin-facing
- Admin dashboard with revenue, order count and payment history
- Full product management (add, edit, delete, image upload)
- Order management with status updates (pending → shipped → delivered)
- Coupon management (create, activate/deactivate, set expiry and usage limits)
- Blog post management (create, publish, feature)
- Contact message inbox

### Technical
- Server-side rendering (SSR) and static site generation (SSG) via Next.js App Router
- Row-Level Security (RLS) policies on all Supabase tables
- Centralised state management for cart, coupons, and orders via Redux Toolkit
- Fully responsive UI built with Tailwind CSS
- Image storage via Supabase Storage
- Real-time order status updates
- All 19 functional test cases passing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit |
| Backend & Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Payments | Stripe |
| Deployment | Vercel |

---
## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- A [Supabase](https://supabase.com) account
- A [Stripe](https://stripe.com) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MonalisaPadhy/3legant.git
   cd 3legant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Set up the Supabase database**

   - Create a new Supabase project
   - Run the SQL schema from `/supabase/schema.sql` in the Supabase SQL editor
   - Enable Row-Level Security on all tables
   - Set up Supabase Storage buckets for product images and blog cover images

5. **Run the development server**
   ```bash
   npm run dev
   ```
---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side only) |

---

## Deployment

The project is deployed on **Vercel**.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Add all environment variables in the Vercel project dashboard under **Settings → Environment Variables** before deploying.

---

## Future Scope

- Real-time order tracking via Supabase real-time subscriptions
- AI-powered product recommendations based on browsing and purchase history
- Redis-based caching for frequently accessed product data
- Email notification service (Resend or SendGrid)
- Loyalty rewards system
- Admin sales analytics dashboard

---

## License

This project is for educational and portfolio purposes.
