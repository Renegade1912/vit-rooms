# VIT Rooms

Small webpanel to manage [OpenEPaperLink](https://github.com/OpenEPaperLink/OpenEPaperLink) tags in the VIT network. It uses [RFC5545 (iCalendar)](https://www.rfc-editor.org/rfc/rfc5545) compliant calendars to fetch the events and renders them as a room schedule on the tags. 

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) version 18 or higher.
- [VIT Tag Renderer](https://github.com/Renegade1912/vit-tag-renderer) up and running (check README.md in the repository)

### Install

1. Clone the repository.
2. Setup your `.env` file based on the provided `.env.example`.
3. Run `npm install`.
4. Execute `npx prisma generate` to generate the Prisma client.
5. Execute `npx prisma db push` to generate the database file based on Prisma's schema.
6. Execute `npx prisma db seed` to generate the default user 'admin' with the well known default password.

## Database Setup

This project is set up with SQLite as the default database using Prisma. Upon running the `npx prisma db push` command, the SQLite database file is automatically created as specified in the `DATABASE_URL` environment variable.

To use another database, you can replace the `provider` in Prisma's schema and update the `DATABASE_URL` in your `.env` file. Refer to Prisma's documentation on how to connect your desired database: [Prisma - Connect Your Database](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/connect-your-database-typescript-postgresql).

## Environment Variables

The required environment variables:

- `DATABASE_URL`: Your database URL.
- `AUTH_ORIGIN`: Base url of the project (set at *runtime*!)
- `AUTH_SECRET`: A secret string you define, to ensure correct encryption for sessions
- `ICAL_USER`: User for fetching the calendars
- `ICAL_PASSWORD`: User password for fetching calendars
- `AP_IMG_UPLOAD_URL`: [OpenEPaperLink](https://github.com/OpenEPaperLink/OpenEPaperLink) Access Point Image upload url ([read more](https://github.com/OpenEPaperLink/OpenEPaperLink/wiki/Image-upload))
- `RENDER_SERVER_URL`: Url of the [VIT Tag Renderer](https://github.com/Renegade1912/vit-tag-renderer) to get images from

Please ensure that these variables are correctly set in your `.env` file. You can use the provided `.env.example` as a reference. Read the [Docs](https://nuxt.com/docs/guide/directory-structure/env) for more informations.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build and run the application for/in production:

```bash
# build
npm run build

# run 
node .output/server/index.mjs
```

Make sure to use the database file name for production (.env variable) while building. Otherwise the database file will not be copied. The SQLite db must exist and needs to be configured (see number 4 to 6 in [install](#install)).

We provided example scripts ([PowerShell](run.production.ps1) / [Bash](run.production.sh)) for running the production build with environment variables.

## Integration
The website includes a fully REST API. You can use the workflows in your own software. For more information we exported our [Postman](https://www.postman.com/) collection as a [file](/VIT-Rooms.postman_collection.json). 