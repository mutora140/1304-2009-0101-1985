# Netflix Website Like System

## Overview
This like system allows users to like/unlike movies and shows on the Netflix website. The system persists data across sessions using localStorage and provides a seamless user experience with real-time updates and animations.

## Features

### Core Functionality
- **Like/Unlike**: Click on any heart icon to like or unlike a movie/show
- **Persistent Storage**: Likes are saved in localStorage and persist across browser sessions
- **Real-time Updates**: Like counts update immediately for all users
- **User-specific**: Each user has their own like history
- **Cross-device**: Likes are stored locally but can be exported/imported

### User Interface
- **Heart Icons**: Clickable heart icons that change color when liked
- **Like Counters**: Real-time display of total likes for each item
- **Animations**: Smooth heart beat animations and hover effects
- **Notifications**: Toast notifications for like/unlike actions

### Advanced Features
- **Statistics**: View total likes, your likes, and averages
- **Data Export**: Backup your likes data to JSON file
- **Data Import**: Restore likes from backup files
- **Keyboard Shortcuts**: Quick access to features
- **Dynamic Content**: Automatically handles new content loaded via AJAX

## How It Works

### Technical Implementation
1. **LikeSystem Class**: Core JavaScript class managing all like functionality
2. **localStorage**: Persistent storage for likes data
3. **Unique User IDs**: Each user gets a unique identifier
4. **Event Delegation**: Handles clicks on dynamically added content
5. **MutationObserver**: Watches for new content and applies like functionality

### Data Structure
```javascript
{
  "movie-title-1": {
    "user_1234567890_abc123": true,
    "user_0987654321_xyz789": true
  },
  "movie-title-2": {
    "user_1234567890_abc123": true
  }
}
```

## Usage

### Basic Like/Unlike
1. Find any movie or show on the page
2. Click the heart icon next to the like count
3. The heart will turn red and the count will increase
4. Click again to unlike

### Accessing Advanced Features
1. Click on your user profile picture in the header
2. Select from the dropdown menu:
   - **Like Statistics**: View your like statistics
   - **Export Likes**: Download your likes data
   - **Clear All Likes**: Remove all your likes (with confirmation)

### Keyboard Shortcuts
- **Ctrl/Cmd + L**: Show like statistics
- **Ctrl/Cmd + E**: Export likes data

## File Structure

### JavaScript
- `main.js`: Contains the LikeSystem class and initialization

### CSS
- `style.css`: Styling for like buttons, animations, and dropdowns

### HTML
- `index.html`: Updated with like system integration and user controls

## Customization

### Changing Colors
Modify the CSS variables in `style.css`:
```css
.heart-icon.liked {
    color: #e50914; /* Change this to your preferred color */
}
```

### Adding New Features
Extend the LikeSystem class in `main.js`:
```javascript
class LikeSystem {
    // ... existing methods ...
    
    yourNewMethod() {
        // Your custom functionality
    }
}
```

## Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Features Used
- ES6 Classes
- localStorage
- MutationObserver
- CSS Grid/Flexbox
- CSS Animations

## Troubleshooting

### Common Issues

1. **Likes not saving**
   - Check if localStorage is enabled
   - Ensure JavaScript is running
   - Check browser console for errors

2. **Heart icons not working**
   - Verify the LikeSystem class is initialized
   - Check if event listeners are properly attached
   - Ensure CSS classes are correctly applied

3. **Count not updating**
   - Refresh the page to see changes
   - Check if the item has a valid data-item-id
   - Verify the count-box class is present

### Debug Mode
Open browser console to see:
- Like system initialization messages
- User ID generation
- Like data updates
- Error messages

## Performance Considerations

### Optimization Features
- **Event Delegation**: Single event listener for all heart icons
- **Lazy Updates**: Only update UI elements that have changed
- **Efficient Storage**: Minimal data structure for localStorage
- **Debounced Updates**: Prevents excessive DOM updates

### Memory Management
- **Cleanup**: Automatic cleanup of removed elements
- **Observer Disconnection**: Proper cleanup of MutationObserver
- **Event Listener Management**: Efficient event handling

## Future Enhancements

### Planned Features
- **Server-side Storage**: Move from localStorage to database
- **User Authentication**: Real user accounts and profiles
- **Social Features**: Share likes, follow other users
- **Analytics**: Detailed like statistics and trends
- **Mobile App**: Native mobile application

### API Integration
- **TMDB Integration**: Pull movie data and metadata
- **User Recommendations**: Suggest content based on likes
- **Social Sharing**: Share likes on social media
- **Export Options**: Multiple export formats (CSV, XML)

## Contributing

### Development Setup
1. Clone the repository
2. Open `index.html` in a web browser
3. Make changes to `main.js` or `style.css`
4. Test functionality in browser
5. Submit pull request with changes

### Code Style
- Use ES6+ JavaScript features
- Follow existing naming conventions
- Add comments for complex logic
- Maintain consistent formatting

## License
This like system is part of the Netflix website project. Please refer to the main project license for usage terms.

## Support
For questions or issues:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify browser compatibility
4. Check file paths and dependencies

---

**Note**: This like system is designed for demonstration and educational purposes. In a production environment, consider implementing server-side storage, user authentication, and additional security measures. 