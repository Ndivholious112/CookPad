# CookPad Frontend

A modern Angular application for managing recipes with a beautiful, responsive UI.

## Features

- **Recipe Management**: View, add, and browse recipes
- **User Authentication**: Login and registration system
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Visual feedback during data operations
- **Mock Data**: Works without backend for development and testing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run watch` - Build and watch for changes

## Application Structure

### Components

- **RecipeListComponent**: Displays all recipes in a card layout
- **RecipeCardComponent**: Individual recipe card with title, description, and view button
- **RecipeDetailComponent**: Detailed view of a single recipe
- **RecipeFormComponent**: Form for adding new recipes
- **LoginComponent**: User login form
- **RegisterComponent**: User registration form
- **HeaderComponent**: Navigation header with links
- **FooterComponent**: Application footer

### Services

- **RecipeService**: Handles recipe CRUD operations with fallback to mock data
- **AuthService**: Handles user authentication (mock implementation)

### Features

- **Routing**: Angular Router for navigation between pages
- **Forms**: Reactive forms with validation
- **HTTP Client**: API communication with error handling
- **Styling**: Modern CSS with Tailwind CSS integration
- **Responsive Design**: Mobile-first approach

## Mock Data

The application includes mock data for development and testing:

- 2 sample recipes (Chocolate Chip Cookies, Spaghetti Carbonara)
- Mock authentication system
- Automatic fallback when backend is unavailable

## Backend Integration

The frontend is configured to work with a backend API at `http://localhost:3000/api/recipes`. When the backend is not available, the application automatically falls back to mock data.

## Styling

The application uses:
- Custom CSS with modern design principles
- Tailwind CSS for utility classes
- Responsive design for mobile and desktop
- Consistent color scheme and typography
- Smooth animations and transitions

## Error Handling

- Network errors are caught and displayed to users
- Loading states provide visual feedback
- Form validation prevents invalid submissions
- Graceful fallback to mock data when backend is unavailable

## Development

The application is built with Angular 20 and uses:
- Standalone components
- TypeScript
- RxJS for reactive programming
- Angular Forms for form handling
- Angular Router for navigation