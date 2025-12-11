# EncycloDex 📚

A cross-platform mobile and web application for reading and organizing esoteric, religious, and philosophical texts. Built with React Native (Expo) and TypeScript.

## 📱 Overview

EncycloDex is a comprehensive digital library application that provides access to a curated collection of books across multiple categories including Hermetic philosophy, Kabbalah, Enochian texts, Egyptian literature, Biblical texts, Solomonic works, maps, and more.

## ✨ Features

- **📖 Multi-format Support**: Read books in both PDF and Markdown formats
- **🔍 Advanced Search**: Full-text search across all books using Fuse.js
- **📑 Categories**: Organized by 8 main categories with color-coded navigation
- **🔖 Bookmarks**: Save your reading progress and favorite sections
- **📱 Cross-Platform**: Works on iOS, Android, and Web
- **🌙 Responsive Design**: Optimized for mobile and tablet devices
- **💾 Offline Support**: Books are cached for offline reading

## 🏗️ Tech Stack

### Core Framework
- **React Native** (0.81.5) - Cross-platform mobile development
- **Expo** (~54.0.25) - Development platform and tooling
- **Expo Router** (~6.0.15) - File-based routing
- **TypeScript** (~5.9.2) - Type safety

### State Management
- **Zustand** (^5.0.9) - Lightweight state management

### UI & Navigation
- **React Native Paper** - Material Design components
- **React Navigation** - Navigation system
- **React Native Gesture Handler** - Touch interactions
- **React Native Reanimated** - Smooth animations

### File Handling
- **Expo File System** (~19.0.19) - File operations
- **Expo Document Picker** (~14.0.7) - Document selection
- **React Native PDF** (^7.0.3) - PDF viewing
- **React Native Markdown Display** (^7.0.2) - Markdown rendering

### Search & Data
- **Fuse.js** (^7.1.0) - Fuzzy search
- **AsyncStorage** (2.2.0) - Local data persistence

### Development Tools
- **Expo Dev Client** (~6.0.18) - Custom development builds
- **Expo Updates** (~29.0.13) - OTA updates

## 📂 Project Structure

```
EncycloDex/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Library screen
│   │   ├── search.tsx     # Search screen
│   │   ├── categories.tsx # Categories screen
│   │   └── bookmarks.tsx  # Bookmarks screen
│   └── book/              # Book reader
│       └── [id].tsx       # Dynamic book route
├── assets/                # Static assets
│   ├── books/             # Book files (PDF & Markdown)
│   │   ├── biblical/
│   │   ├── egyptian/
│   │   ├── enochian/
│   │   ├── hermetic/
│   │   ├── kabbalah/
│   │   ├── solomonic/
│   │   ├── maps/
│   │   └── other/
│   ├── icon.png
│   └── splash-icon.png
├── components/            # Reusable components
│   ├── BookCard.tsx
│   ├── CategoryFilter.tsx
│   ├── MarkdownViewer.tsx
│   ├── PDFViewer.tsx
│   ├── SearchBar.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useBooks.ts
│   ├── useBookmarks.ts
│   └── useSearch.ts
├── lib/                   # Core utilities
│   ├── assetLoader.ts     # Asset loading logic
│   ├── books.ts           # Book data management
│   ├── books-metadata.json # Book metadata
│   ├── categories.ts      # Category definitions
│   ├── search.ts          # Search functionality
│   └── storage.ts          # Local storage utilities
├── scripts/               # Build and organization scripts
│   ├── generate-metadata.js
│   ├── organize-by-folders.js
│   ├── deduplicate-books.js
│   └── ...
├── types/                 # TypeScript type definitions
│   └── book.ts
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── metro.config.js       # Metro bundler configuration
└── package.json          # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for macOS) or Android Studio (for Android development)
- EAS CLI (optional, for builds): `npm install -g eas-cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EncycloDex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your platform**
   - **iOS**: Press `i` in the terminal or run `npm run ios`
   - **Android**: Press `a` in the terminal or run `npm run android`
   - **Web**: Press `w` in the terminal or run `npm run web`

### Development Build

For a custom development build with native modules:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build development client
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

## 📚 Book Organization

Books are organized in the `assets/books/` directory by category. Each book can have:
- A PDF file (`.pdf`)
- A Markdown file (`.md`)
- Both formats

### Adding New Books

1. Place PDF and/or Markdown files in the appropriate category folder under `assets/books/`
2. Run the metadata generation script:
   ```bash
   node scripts/generate-metadata.js
   ```
3. The app will automatically detect and index the new books

### Scripts

- `generate-metadata.js` - Generate book metadata from file structure
- `organize-by-folders.js` - Organize books into category folders
- `deduplicate-books.js` - Remove duplicate book entries
- `cleanup-folders.js` - Clean up empty or invalid folders
- `copy-books.js` - Copy books to distribution directory

## 🏗️ Building for Production

### EAS Build

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

### Web Build

```bash
# Build static web output
npx expo export:web
```

The web build will be output to the `dist/` directory.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
EXPO_PUBLIC_API_URL=https://your-api-url.com
```

### Metro Configuration

The Metro bundler is configured in `metro.config.js` to:
- Serve static files from `assets/books/` directory
- Handle PDF and Markdown files correctly
- Support CORS for WebView PDF loading

### EAS Configuration

EAS build profiles are configured in `eas.json`:
- **development**: Development builds with dev client
- **preview**: Internal distribution builds
- **production**: Production app store builds

## 📖 Categories

The app supports 8 main categories:

1. **Hermetic** - Hermetic philosophy and alchemy texts
2. **Kabbalah** - Kabbalistic texts and teachings
3. **Enochian** - Enochian magic and calls
4. **Egyptian** - Ancient Egyptian texts and literature
5. **Biblical** - Biblical texts and apocrypha
6. **Solomonic** - Solomonic magic and grimoires
7. **Maps** - Historical and reference maps
8. **Other** - Miscellaneous texts

## 🔍 Search

The app uses Fuse.js for fuzzy search across:
- Book titles
- Categories
- Content (when available)

Search results are ranked by relevance and can be filtered by category.

## 💾 Data Storage

- **Bookmarks**: Stored locally using AsyncStorage
- **Reading Progress**: Tracked per book
- **Book Metadata**: Generated from file structure and cached

## 🐛 Troubleshooting

### Metro bundler issues
```bash
# Clear Metro cache
npx expo start --clear
```

### Build issues
```bash
# Clear Expo cache
expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Asset loading issues
- Ensure books are in `assets/books/` directory
- Check file paths in `books-metadata.json`
- Verify Metro config is serving static files correctly

## 📝 License

[Add your license information here]

## 👤 Author

[Add your information here]

## 🙏 Acknowledgments

- All authors and contributors of the texts included in this library
- Expo team for the excellent development platform
- React Native community for the amazing ecosystem

---

**Note**: This app is for educational and research purposes. Please respect copyright laws and intellectual property rights.

