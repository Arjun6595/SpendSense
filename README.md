# SpendSense - React + Vite

A personal finance management web application built with React and Vite. SpendSense helps you track expenses, manage budgets, and make informed financial decisions.

## Overview

This project has been successfully converted from Next.js to React + Vite for improved development speed and build performance.

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 5.4.1
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Notifications**: Sonner + Radix UI Toast

## Project Structure

```
├── src/                    # Main source directory
│   ├── App.jsx            # Main App component with routing
│   └── main.jsx           # Application entry point
├── app/                   # Application pages and components
│   ├── components/        # Reusable components
│   ├── contexts/          # React Context providers
│   ├── dashboard/         # Dashboard page
│   ├── add-expense/       # Add expense page
│   ├── add-category/      # Add category page
│   ├── budget-planner/    # Budget planner page
│   ├── set-income/        # Set income page
│   ├── settings/          # Settings page
│   ├── login/             # Login/signup page
│   └── globals.css        # Global styles
├── components/            # UI component library
│   ├── ui/                # Radix UI components
│   └── theme-provider.tsx # Theme management
├── lib/                   # Utility libraries
│   ├── firebase.js        # Firebase configuration
│   └── utils.ts           # Utility functions
└── hooks/                 # Custom React hooks

```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Firebase account (for authentication and database)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication and Firestore
   - Copy your Firebase config to `lib/firebase.js`

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5714 in your browser

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Features

- **Dashboard**: Financial overview with charts and statistics
- **Expense Tracking**: Add, edit, and categorize expenses
- **Budget Planning**: Set and monitor budgets by category
- **Income Management**: Track income sources
- **Categories**: Custom expense categories with color coding
- **Settings**: Customize currency and preferences
- **Authentication**: Secure login/signup with Firebase
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization with Firebase

## Key Changes from Next.js Version

1. **Routing**: Converted from Next.js App Router to React Router DOM
2. **Build System**: Migrated from Next.js to Vite for faster builds
3. **Components**: Removed Next.js specific imports (`next/link`, `next/navigation`, `next/image`)
4. **Client Components**: Removed `"use client"` directives
5. **Theme Provider**: Custom implementation instead of `next-themes`
6. **Entry Point**: Standard React app structure with `src/main.jsx`

## Development Notes

- All pages are now standard React components
- Navigation uses React Router's `Link` and `useNavigate`
- Image optimization uses standard `img` tags
- Theme switching implemented with custom React Context
- Hot Module Replacement (HMR) works seamlessly with Vite

## Production Deployment

1. Build the project:
```bash
npm run build
```

2. The built files will be in the `dist/` directory
3. Deploy the `dist/` folder to your hosting provider
4. Configure your hosting for Single Page Application (SPA) routing

## Troubleshooting

- If you encounter import errors, ensure all paths use the `@/` alias correctly
- For Firebase errors, verify your configuration in `lib/firebase.js`
- CSS issues may require clearing browser cache after major changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.