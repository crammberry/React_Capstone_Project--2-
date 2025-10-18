# Eternal Rest Memorial Park - Digital Mapping System

A modern React-based web application for cemetery management with interactive mapping, search functionality, and administrative controls.

## Features

- **Interactive Cemetery Map**: Visual representation of burial plots with status indicators
- **Search Functionality**: Find loved ones by name, plot number, or section
- **Admin Dashboard**: Manage burial records, add/edit plots, and update status
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Built with Tailwind CSS v4 and Font Awesome icons

## Technology Stack

- **Frontend**: React 19.1.1 with Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Font Awesome 6.0.0
- **Routing**: React Router DOM 7.9.1

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gmap_capstone
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Public Features

- **View Map**: Click "View Graveyard Map" to see the interactive cemetery layout
- **Search**: Click "Learn More" to access the search functionality
- **Find Loved Ones**: Search by name, plot number, or section

### Admin Features

- **Login**: Use the "Admin Login" button with credentials:
  - Username: `admin`
  - Password: `admin123`
- **Add Plots**: Create new burial records
- **Edit Plots**: Update existing plot information
- **Manage Status**: Mark plots as available, occupied, or reserved

## Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Navigation and admin controls
│   ├── HeroSection.jsx         # Main landing section
│   ├── FeaturesSection.jsx     # About the system
│   ├── SearchSection.jsx       # Search functionality
│   ├── InteractiveMapSection.jsx # Cemetery map display
│   ├── Footer.jsx              # Footer component
│   └── Modal.jsx               # Admin modals
├── App.jsx                     # Main application component
├── index.css                   # Global styles and Tailwind imports
└── main.jsx                    # Application entry point
```

## Customization

### Adding New Plot Types

1. Update the section options in `Modal.jsx`
2. Add corresponding styles in the map section
3. Update the mock data in `App.jsx`

### Styling

The application uses Tailwind CSS v4. Customize the design by:
- Modifying component classes
- Adding custom CSS in `index.css`
- Updating the color scheme in component files

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.