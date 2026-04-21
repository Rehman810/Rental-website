# Mehman Website - Frontend Documentation

## Overview
This project is the frontend for an Mehman platform, built with **React.js** and **Vite.js**, designed for dynamic, user-friendly listings, booking systems, and user account management. The website offers both guest and host experiences, including booking management, profile customization, reviews, and real-time messaging.

---

## Table of Contents
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Directory Structure](#directory-structure)
- [Configuration Files](#configuration-files)
- [Components](#components)
- [Pages](#pages)
- [Internationalization](#internationalization)
- [Styling](#styling)
- [Custom Hooks](#custom-hooks)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

---

## Technologies Used
- **React.js**: A JavaScript library for building user interfaces.
- **Vite.js**: A modern build tool optimized for speed.
- **ESLint**: A tool for identifying and reporting on patterns in JavaScript code.
- **i18n (Internationalization)**: For language localization and support.
- **CSS**: For styling and layout design.

---

## Getting Started

To get started with the project, follow these steps:

### Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org) (version >= 14)
- [npm](https://www.npmjs.com/) (package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/airbnb-frontend.git
   ```

2. Install dependencies:
   ```bash
   cd airbnb-frontend
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   This will start the development server at `http://localhost:5173`.

---

### Key Directories
- **public/locales/**: Contains language-specific JSON files for translation (`footer.json`, `translation.json`).
- **src/animations/**: Animation files used throughout the app (e.g., for transitions).
- **src/assets/**: Fonts, icons, images, and styles.
- **src/components/**: Reusable UI components such as `navbar`, `footer`, `searchBar`, etc.
- **src/pages/**: Contains different pages for the platform like `home`, `listings`, `profile`, etc.
- **src/context/**: Context providers for global state management (e.g., `booking`, `wishlist`).
- **src/hooks/**: Custom React hooks used in the application (e.g., `dynamicTitle`).
- **src/config/**: API configuration and service functions.

---

## Configuration Files

### `vite.config.js`
Configures the Vite build system for optimal performance and includes settings such as the base URL and aliases.

### `eslint.config.js`
Configures ESLint for enforcing code style and standards.

### `vercel.json`
Configuration for deployment on [Vercel](https://vercel.com), specifying routing and environment variables.

---

## Components
Here’s a brief overview of some key components in the project:

### `Login/`
- **LoginModal.jsx**: Handles user login logic and modal display.

### `amenities/`
- **amenities.jsx**: Displays available amenities for a listing.

### `cards/`
- **cards.jsx**: Displays individual listing cards for easy browsing.

### `navbar/`
- **navbar.jsx**: Handles the navigation bar functionality.

### `footer/`
- **footer.jsx**: Displays footer content.

### `host/`
- **step1.jsx**, **location.jsx**, **description.jsx**, etc.: Components related to the hosting flow, where users can list properties.

### `profile/`
- **profile.jsx**: Displays the user's profile information.

---

## Pages
The `src/pages/` directory contains various pages that represent different parts of the application:

- **Home Page** (`home.jsx`): Displays a landing page with featured listings and general information.
- **Listings** (`listings.jsx`): Shows all available listings.
- **Messages** (`messages.jsx`): Allows users to view and send messages.
- **Trips** (`trips.jsx`): Displays upcoming trips and past bookings.
- **Wishlist** (`wishlist.jsx`): Shows properties added to the user's wishlist.

---

## Internationalization

This project supports multiple languages, with translation JSON files stored in `public/locales/{languageCode}/`. Supported languages include:
- Arabic (ar)
- German (de)
- English (en)
- French (fr)
- Turkish (tr)
- Urdu (ur)
- Chinese (zh)

---

## Styling

Custom styles are stored in the `src/assets/styles/` directory. Global styling is applied in `App.css`. Specific components may have their own CSS files, such as `navbar.css` in the `navbar/` directory.

---

## Custom Hooks

- **dynamicTitle.jsx**: Custom hook to dynamically set the document title based on the current route.

---

## State Management

State is managed using React Context API, with global states for:
- **Booking**: Managing bookings and reservations.
- **Wishlist**: Managing properties added to the user's wishlist.

---

## API Integration

API calls are managed through the `src/config/Api` and `src/config/ServiceApi` files. The app communicates with the backend server to handle user authentication, property listings, bookings, and other platform-related functionalities.

---

## Contributing

We welcome contributions! To contribute to this project, follow these steps:

1. Fork the repository.
2. Clone your forked repository to your local machine.
3. Create a new branch for your feature/bugfix.
4. Make your changes and test them locally.
5. Commit your changes with a clear message.
6. Push to your forked repository.
7. Open a pull request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

By following this guide, you can set up the project locally, understand the key components, and contribute to the development of the Airbnb-like platform.
