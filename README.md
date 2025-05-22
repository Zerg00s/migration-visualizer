# Migration Visualizer

An interactive web application for visualizing Microsoft 365 migration scenarios with drag-and-drop functionality, animated transitions, and real-time connection mapping.

![Migration Visualizer](https://img.shields.io/badge/Status-Active-green)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Font Awesome](https://img.shields.io/badge/Font%20Awesome-339AF0?logo=fontawesome&logoColor=white)

## 🌟 Features

### Interactive Migration Types
- **Tenant-to-Tenant Migration** - Visualize Microsoft 365 to Microsoft 365 migrations
- **File Shares to M365** - On-premises file shares to SharePoint Online with AD to Entra ID mapping
- **SharePoint On-Prem to M365** - SharePoint Server to SharePoint Online with InfoPath to Power Apps transformation
- **Google Workspace to M365** - Google Workspace to Microsoft 365 migration with Gmail to Exchange transformation

### Visual Elements
- **Drag & Drop Interface** - Intuitive object manipulation
- **Animated Migrations** - Smooth flying animations during object migration
- **Connection Lines** - Dynamic SVG connections showing relationships
- **Color-Coded Objects** - Distinct colors for different object types
- **Status Indicators** - Visual feedback for migrated objects
- **Interactive Tooltips** - Detailed object information on hover

### Object Types Supported
- **Users** (Entra ID/AD Users)
- **Security Groups**
- **Microsoft Teams**
- **SharePoint Sites**
- **OneDrive**
- **M365 Groups**
- **Exchange Mailboxes**
- **Power Platform** (Apps, Automate, BI)
- **File Shares**
- **InfoPath Forms** → **Power Apps**
- **Workflows** → **Power Automate**
- **Google Workspace Objects** (Users, Groups, Gmail, Drive, Shared Drives)

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (recommended) or live server extension

### Installation

1. **Clone or Download**
   ```bash
   git clone <repository-url>
   cd migration-visualizer
   ```

2. **Serve Locally**
   ```bash
   # Using Python 3
   python -m http.server 5500
   
   # Using Node.js http-server
   npx http-server -p 5500
   
   # Using VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

3. **Open in Browser**
   ```
   http://localhost:5500
   ```

## 📁 Project Structure

```
migration-visualizer/
├── index.html                 # Main landing page
├── tenant-to-tenant.html      # Tenant-to-Tenant migration page
├── file-shares.html           # File Shares migration page
├── sharepoint-onprem.html     # SharePoint On-Prem migration page
├── google-workspace.html      # Google Workspace migration page
├── css/
│   ├── styles.css            # Main stylesheet
│   ├── migration-animations.css
│   ├── migration-zone.css
│   ├── status-indicators.css
│   └── ...
├── js/
│   ├── app.js               # Main application entry
│   ├── migration-zone.js    # Migration zone functionality
│   ├── data/                # Data loaders and models
│   ├── visualizer/          # Core visualizer components
│   ├── file-shares/         # File shares specific code
│   ├── google-workspace/    # Google Workspace specific code
│   └── sharepoint-onprem/   # SharePoint On-Prem specific code
├── data/                    # JSON data files
│   ├── tenant-to-tenant-data.json
│   ├── file-shares-data.json
│   ├── google-workspace-data.json
│   └── sharepoint-onprem-data.json
└── images/                  # Static assets
```

## 🎮 How to Use

### Basic Navigation
1. **Home Page** - Overview and navigation to different migration types
2. **Select Migration Type** - Choose from the available migration scenarios
3. **Interactive Visualization** - Drag objects, view connections, perform migrations

### Migration Process
1. **Select Objects** - Click on objects in the source environment
2. **View Details** - Selected object details appear in the sidebar
3. **Show Connections** - Toggle connection lines to see relationships
4. **Migrate Objects** - Drag to migration zone or use migration controls
5. **View Results** - Migrated objects appear in destination environment

### Controls
- **Show All Connections** - Toggle visibility of relationship lines
- **Reset** - Clear all selections and reset the visualization
- **Object Selection** - Click objects to select/deselect
- **Migration Zone** - Central area for initiating migrations

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Poppins)
- **Graphics**: SVG for connection lines
- **Animation**: CSS transitions and keyframes
- **Visualization**: D3.js for connection rendering

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance Features
- **Modular Architecture** - Component-based JavaScript modules
- **Lazy Loading** - Data loaded on demand
- **Optimized Animations** - Hardware-accelerated CSS transitions
- **Efficient DOM Manipulation** - Minimal reflows and repaints

## 📊 Data Structure

### Object Format
```javascript
{
  id: "unique_identifier",
  name: "Display Name",
  type: "object_type",
  color: "#hex_color",
  icon: "fa-icon-name",
  environment: "source|destination",
  migrated: boolean,
  // Type-specific properties...
}
```

### Connection Format
```javascript
{
  source: "source_object_id",
  target: "target_object_id"
}
```

## 🎨 Customization

### Adding New Object Types
1. Update data loader in `js/data/`
2. Add CSS styles for new object type
3. Update type mappings in visualizer components
4. Add icon and color definitions

### Modifying Animations
- Edit `css/migration-animations.css` for migration effects
- Modify `js/visualizer/animations.js` for JavaScript animations
- Adjust timing in migration zone handlers

### Color Themes
- Primary colors defined in CSS custom properties
- Object-specific colors in data loaders
- Environment colors (source/destination) in root variables

## 🔧 Configuration

### Environment Settings
```css
:root {
  --source-color: #1e88e5;      /* Source environment theme */
  --destination-color: #43a047;  /* Destination environment theme */
  --primary-color: #1e88e5;      /* Primary UI color */
  --secondary-color: #7e57c2;    /* Secondary UI color */
}
```

### Object Type Colors
- **Users**: `#64b5f6` (Light Blue)
- **Groups**: `#7e57c2` (Purple)
- **SharePoint**: `#4caf50` (Green)
- **Teams**: `#673ab7` (Deep Purple)
- **OneDrive**: `#2196f3` (Blue)
- **Exchange**: `#e91e63` (Pink)
- **Power Platform**: Various blues and purples

## 📝 Data Files

### Sample Data Structure
Each migration type has its own JSON data file containing:
- **Users** - User accounts with properties
- **Groups** - Security and distribution groups
- **Resources** - SharePoint sites, Teams, etc.
- **Connections** - Relationships between objects

### Adding Custom Data
1. Follow the existing JSON structure
2. Ensure unique IDs across all objects
3. Define proper relationships in connections
4. Update data loader if adding new properties

## 🐛 Troubleshooting

### Common Issues

**Icons Not Displaying**
- Ensure Font Awesome CDN is accessible
- Check for JavaScript errors in browser console
- Verify icon class names match Font Awesome 6.x syntax

**Animations Not Working**
- Confirm CSS animation support in browser
- Check for conflicting CSS styles
- Verify JavaScript animation timing

**Connection Lines Missing**
- Enable "Show All Connections" toggle
- Check SVG container positioning
- Verify D3.js library loading

**Migration Not Working**
- Check browser console for JavaScript errors
- Ensure data files are accessible
- Verify object IDs match between source and connections

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
window.debugMode = true;
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across different browsers
5. Submit a pull request

### Code Style
- Use ES6+ JavaScript features
- Follow consistent indentation (2 spaces)
- Add comments for complex logic
- Maintain modular architecture

### Testing
- Test all migration types
- Verify animations work smoothly
- Check responsive design on different screen sizes
- Validate accessibility features

## 📄 License

This project is created for educational and demonstration purposes.

## 👨‍💻 Author

**By Denis Molodtsov with 💗**

---

## 🎯 Roadmap

### Planned Features
- [ ] Export migration reports
- [ ] Custom migration templates
- [ ] Batch migration operations
- [ ] Advanced filtering and search
- [ ] Migration progress tracking
- [ ] Integration with Microsoft Graph API
- [ ] Mobile responsiveness improvements
- [ ] Accessibility enhancements

### Known Limitations
- Static data (no real Microsoft 365 integration)
- No persistent state across sessions
- Limited to predefined object types
- No authentication required

---

*For questions, issues, or feature requests, please create an issue in the repository.*