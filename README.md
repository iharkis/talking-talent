# Talking Talent Performance Management System

A comprehensive web-based performance management system for quarterly "Talking Talent" sessions used by Business Analysts. This system manages hierarchical staff reviews, historical tracking, and replaces current ad-hoc Slack/Excel workflows with a structured, scalable solution.

## Features

### 🎯 Core Functionality
- **Session Mode**: Streamlined interface for live Talking Talent sessions with sequential BA navigation
- **Business Analyst Management**: Complete CRUD operations with hierarchy support
- **Talent Round Management**: Create and manage quarterly review cycles
- **Review Entry**: Individual and bulk review entry with historical context
- **Progress Tracking**: Real-time completion dashboards and deadline alerts

### 🔧 Technical Features
- **Client-side Storage**: Uses localStorage for data persistence (no backend required)
- **Data Export/Import**: JSON-based backup and restore functionality
- **Responsive Design**: Optimized for tablets during live sessions
- **TypeScript**: Full type safety throughout the application
- **Professional UI**: Clean, accessible interface using Tailwind CSS

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Lucide React icons
- **State Management**: Simple service layer with localStorage
- **Build Tool**: Vite
- **Deployment**: Static site (can be deployed anywhere)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd talking-talent
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Quick Start with Sample Data

1. Navigate to Settings in the sidebar
2. Click "Create Sample Data" to populate the system with example business analysts and a talent round
3. Go to Session Mode to try the live review interface
4. Or use Individual Review Entry for one-off reviews

## Usage Guide

### Setting Up Your First Review Round

1. **Add Business Analysts**
   - Go to "Business Analysts" in the sidebar
   - Click "Add Business Analyst" 
   - Fill in details including hierarchy (line manager relationships)
   - Add all your team members

2. **Create a Talent Round**
   - Go to "Talent Rounds" in the sidebar
   - Click "Create Round"
   - Set the quarter, year, and deadline
   - Activate the round when ready

3. **Conduct Reviews**
   - Use "Session Mode" for live Talking Talent sessions (recommended)
   - Or use "Reviews" for individual review entry

### Session Mode (Primary Feature)

Session Mode is optimized for live Talking Talent sessions where one person enters data while the team discusses each BA:

- **Sequential Navigation**: Move through BAs one by one with Previous/Next buttons
- **Progress Tracking**: See completion status and progress bar
- **Historical Context**: Previous review data is prominently displayed
- **Quick Save**: Auto-save functionality with unsaved changes indicators
- **Side Panel**: Quick navigation to any BA in the list

### Review Data Structure

For each BA, capture:
- **Wellbeing Concerns**: Boolean + conditional details
- **Performance Concerns**: Boolean + conditional details  
- **Development Opportunities**: Boolean + conditional details
- **Promotion Readiness**: Ready | Near Ready | Not Ready
- **Action Items**: Dynamic list of follow-up actions
- **General Notes**: Free-form notes

### Data Management

- **Export Data**: Download complete backup as JSON file
- **Import Data**: Restore from previously exported JSON
- **Clear Data**: Reset the entire system (use with caution)

## Project Structure

```
src/
├── components/          # React components
│   ├── BAManagement.tsx    # Business Analyst CRUD interface
│   ├── Dashboard.tsx       # Main dashboard with progress tracking
│   ├── Layout.tsx          # Application layout and navigation
│   ├── ReviewEntry.tsx     # Individual review entry interface
│   ├── RoundManagement.tsx # Talent round management
│   ├── Router.tsx          # Simple client-side routing
│   ├── SessionMode.tsx     # Live session interface (key feature)
│   └── Settings.tsx        # Data management and configuration
├── services/            # Business logic layer
│   ├── businessAnalystService.ts
│   ├── dataExportService.ts
│   ├── reviewService.ts
│   └── talentRoundService.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── cn.ts               # Class name utility
│   ├── date.ts             # Date formatting utilities
│   ├── errorHandler.ts     # Error handling utilities
│   ├── sampleData.ts       # Sample data generation
│   ├── storage.ts          # localStorage utilities
│   └── validation.ts       # Data validation
└── App.tsx              # Application entry point
```

## Key Design Principles

### Simplicity First
- Functions under 20 lines
- Components under 150 lines  
- Single responsibility per file
- Minimal external dependencies

### User Experience
- **Session Mode Priority**: Optimized for live sessions
- **Historical Context**: Always show previous review data
- **Professional Interface**: No emojis, clean design
- **Performance**: Fast load times, responsive interactions

### Business Rules
- Hierarchical reporting relationships (max 5 levels)
- One active round per quarter/year
- Complete reviews required before round completion
- Historical data preservation after round completion

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Testing (Required - see Testing Policy below)
npm test             # Run all tests in watch mode
npm run test:unit    # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:coverage    # Generate coverage report
```

### 🚨 Testing Policy (IMPORTANT)

**⚠️ ALL code changes must include tests FIRST before implementation.**

This project follows **Test-Driven Development (TDD)**:
1. **Write tests FIRST** for any new features or bug fixes
2. **Update existing tests** when modifying functionality  
3. **Verify all tests pass** before committing changes
4. **Maintain 95%+ coverage** for utility functions, 80%+ for business logic

**Test Structure:**
- `tests/unit/` - Fast, isolated function/component tests
- `tests/integration/` - Multi-service workflow tests  
- `tests/e2e/` - Critical user journey tests

**For any conversation with Claude Code:**
Always remind Claude to write/update tests BEFORE making code changes!

### Code Style
- No unnecessary comments (code should be self-explanatory)
- Explicit imports and clear naming
- TypeScript strict mode enabled
- Consistent error handling

## Deployment

This is a static React application that can be deployed to any static hosting service:

### Netlify/Vercel
1. Build the project: `npm run build`
2. Deploy the `dist` folder

### Traditional Web Server
1. Build the project: `npm run build`
2. Copy contents of `dist` folder to web server
3. Configure server to serve `index.html` for all routes

## Data Storage

The application uses browser localStorage for data persistence:

- **Storage Keys**: `tt_business_analysts`, `tt_talent_rounds`, `tt_reviews`
- **Data Format**: JSON objects stored as strings
- **Capacity**: ~5-10MB depending on browser
- **Backup**: Use Settings > Export Data for backups

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Follow the established code style and architecture
2. Keep functions and components small and focused
3. Maintain comprehensive TypeScript types
4. Test changes with sample data
5. Ensure Session Mode functionality works smoothly

## License

This project is licensed under the MIT License.

## Support

For questions or issues:
1. Check the sample data functionality in Settings
2. Use browser developer tools to inspect localStorage
3. Export data regularly as backup
4. Clear data and recreate if issues persist

---

Built with ❤️ for efficient performance management processes.