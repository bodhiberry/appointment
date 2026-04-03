# SM Visitor Management System

A secure, QR-based visitor registration and approval system.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   - `DATABASE_URL`: Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Random string for authentication
   - `ADMIN_USERNAME`: Admin login username
   - `ADMIN_PASSWORD`: Admin login password
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret

3. Push schema to database:
   ```bash
   npx prisma db push
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## Deployment

When deploying to Vercel or other platforms, ensure all the above environment variables are added to the environment configuration. **Do not commit `.env` to version control.**
