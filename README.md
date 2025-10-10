# 🚀 Coding Progress Tracker

A comprehensive web application to track your coding journey including CSES problems, Codeforces contests, courses, and daily routines.

## 🔒 SECURITY MODEL

**Status: Website works for now**

This application uses **client-side password protection** with improved security:

### Security Features:
- **Private Config**: Password hash stored in `config.js` (not committed to GitHub)
- **Git Protection**: Sensitive files excluded via `.gitignore`
- **Firebase Deployment**: Hash stays secure on your server, not in public repo
- **UI-Level Protection**: Prevents accidental edits

### Security Limitations:
- **Still Client-Side**: Hash is downloaded to user's browser when they visit the site
- **No Server Auth**: Anyone can view network requests and find the hash
- **Protection Level**: Deters casual users but not determined attackers

### For Production Use:
- Implement server-side authentication (Firebase Auth, custom backend)
- Use environment variables for secrets
- Add proper access controls and rate limiting

This approach provides reasonable security for personal projects while being much better than hardcoded secrets in the repository.

## 📁 Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── script.js           # Main JavaScript functionality
├── firebaseConfig.js   # Firebase configuration
└── firebase.js         # Legacy Firebase setup (optional)
```

## 🔧 Setup Instructions

### 1. Clone and Configure
1. Clone the repository
2. Copy `config.sample.js` to `config.js`
3. Generate your password hash:
   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
   ```
4. Update `config.js` with your hash

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing project
3. Enable Firestore Database
4. Install Firebase CLI: `npm install -g firebase-tools`
5. Login: `firebase login`

### 2. Hosting Options

#### Option A: GitHub Pages
1. Push code to GitHub repository
2. Go to Repository Settings → Pages
3. Select source branch (main)
4. Your site will be available at `https://username.github.io/repository-name`

#### Option B: Netlify
1. Create account at [Netlify](https://netlify.com)
2. Drag and drop your project folder
3. Site will be deployed automatically

#### Option C: Vercel
1. Create account at [Vercel](https://vercel.com)
2. Import GitHub repository
3. Deploy with default settings

#### Option D: Local Development
1. Use VS Code Live Server extension
2. Or run `python -m http.server 8000` in project directory
3. Open `http://localhost:8000`

## ✨ Features

- **📊 Dashboard**: Overview of all progress metrics
- **🧩 CSES Tracking**: Track 400 CSES problems with categories
- **🏆 Codeforces Integration**: Manual and API-based problem tracking
- **📚 Course Progress**: TensorFlow, GFG DSA, Coding Blocks tracking
- **📅 Daily Routine**: Task management with streak tracking
- **🌙 Dark/Light Theme**: Toggle between themes
- **📱 Responsive Design**: Works on all devices
- **☁️ Firebase Integration**: Real-time data sync across devices

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase Firestore
- **Icons**: Font Awesome
- **Hosting**: GitHub Pages / Netlify / Vercel compatible

## 🚨 Important Notes

1. **Firebase Rules**: Make sure Firestore security rules allow read/write access
2. **CORS**: Some features may require proper CORS configuration
3. **API Limits**: Codeforces API has rate limits (be mindful of sync frequency)

## 📖 Usage

1. **CSES Progress**: Click "Mark Problem Solved" to increment counter
2. **Tasks**: Add daily tasks and mark them complete
3. **Codeforces Sync**: Enter username and sync solved problems
4. **Course Tracking**: Use sliders to update progress
5. **Theme Toggle**: Click moon/sun icon to switch themes

## 🔒 Security

- Firebase configuration is exposed (normal for client-side apps)
- Set up proper Firestore security rules for production
- Consider adding authentication for multi-user support

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Happy Coding! 🎯**