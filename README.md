# Aaron Munro - Professional Resume Website

A modern, responsive HTML resume website with advanced print customisation features, optimised for A4 output and featuring embedded portfolio videos.

## 🌟 Features

### Core Features
- **Comprehensive Content**: Complete work history, qualifications, skills, and project portfolio
- **Responsive Design**: Optimised for desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Australian English**: All content uses Australian English spelling conventions

### Print Customisation System
- **Selective Printing**: Choose which sections to include in printed output
- **Granular Control**: Toggle individual qualifications, jobs, projects, and skills
- **Contact Details**: Select which personal details to show (phone, email, address, website)
- **Quick Actions**: "Select All" and "Deselect All" buttons for easy management
- **Print Preview**: Review selections before printing
- **A4 Optimised**: Print styles specifically designed for A4 paper (210mm × 297mm)
- **Persistent Preferences**: Selections saved to browser local storage

### Portfolio Integration
- **YouTube Videos**: Embedded portfolio videos from [@vector6portfolio](https://youtube.com/@vector6portfolio)
- **Responsive Embeds**: Videos scale properly on all screen sizes
- **Direct Link**: Button to view full portfolio on YouTube

### Interactive Elements
- **Smooth Scroll Navigation**: Click navigation links for smooth scrolling
- **Collapsible Details**: Expand/collapse job descriptions to manage space
- **Sticky Navigation**: Navigation bar stays visible while scrolling
- **Keyboard Shortcuts**: Ctrl/Cmd+P to print, Escape to close print panel

## 📁 File Structure

```
/
├── index.html          # Main resume page with full content
├── css/
│   └── style.css      # All styles including print media queries
├── js/
│   └── script.js      # Print customisation and interactive features
└── README.md          # This file - instructions and documentation
```

## 🚀 Getting Started

### Local Viewing
1. Download or clone this repository
2. Open `index.html` in a web browser
3. That's it! No build process or dependencies required

### Deployment Options

#### GitHub Pages
1. Push to a GitHub repository
2. Go to repository Settings → Pages
3. Select branch (main/master) and root folder
4. Your site will be available at `https://username.github.io/repository-name`

#### Netlify
1. Drag and drop the folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your Git repository for automatic deployments

#### Traditional Web Hosting
1. Upload all files to your web server
2. Ensure `index.html` is in the root directory
3. Files can be accessed via your domain

## 🖨️ Using the Print Feature

### Opening Print Controls
- Click **"Print Controls"** button in the navigation bar
- Or click the **"Hide/Show Controls"** toggle in the print panel

### Customising Print Output
1. **Select Sections**: Check/uncheck boxes for sections you want to include
2. **Personal Details**: Choose which contact information to show
3. **Individual Items**: Toggle specific jobs, projects, qualifications, or skills
4. **Quick Actions**:
   - Click **"Select All"** to include everything
   - Click **"Deselect All"** to start fresh
5. **Preview**: Click **"Print Preview"** to see what will be printed
6. **Print**: Click **"Print Resume"** or use Ctrl/Cmd+P

### Print Settings
When the print dialog opens:
- **Paper Size**: A4 (210mm × 297mm)
- **Orientation**: Portrait
- **Margins**: Default or custom (15mm recommended)
- **Scale**: 100% (recommended)
- **Destination**: Save as PDF or physical printer

### Saving Selections
Your print selections are automatically saved to browser local storage, so they persist between visits.

## 🎨 Customisation

### Colours
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #003366;    /* Deep blue */
    --secondary-color: #0066cc;  /* Medium blue */
    --accent-color: #ff6600;     /* Orange */
    --text-color: #333333;       /* Dark grey */
}
```

### Content
Edit the HTML directly in `index.html`. Each section is clearly marked with comments.

### Fonts
Current setup uses system fonts for fast loading. To use custom fonts:
1. Add Google Fonts link to `<head>` in `index.html`
2. Update `--font-primary` or `--font-secondary` in CSS

## 📱 Responsive Breakpoints

- **Desktop**: > 992px (full layout)
- **Tablet**: 768px - 992px (adjusted grid)
- **Mobile**: < 768px (single column, stacked navigation)
- **Small Mobile**: < 480px (optimised for small screens)

## 🌐 Browser Compatibility

### Tested Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Print Compatibility
- ✅ Chrome (best results)
- ✅ Edge
- ⚠️ Firefox (some colour variations)
- ⚠️ Safari (test print preview)

## 💡 Tips & Best Practices

### For Job Applications
1. **Tailor Content**: Use print customisation to show only relevant experience
2. **Keep it Concise**: For 2-page resumes, deselect some older positions
3. **Highlight Skills**: Select skill categories most relevant to the role
4. **Save as PDF**: Print to PDF for consistent formatting

### For Best Print Results
1. Use Chrome or Edge browser
2. Set paper size to A4
3. Enable "Background graphics" if colours don't appear
4. Use "Save as PDF" for consistent results
5. Check print preview before finalising

### Performance
- All resources are local (no external dependencies except YouTube embeds)
- YouTube videos use lazy loading
- CSS and JavaScript are minified-ready
- Images are optimised (add images to `/images` folder if needed)

## 📊 Technical Details

### Technologies Used
- **HTML5**: Semantic markup, accessibility features
- **CSS3**: Flexbox, Grid, custom properties, media queries
- **Vanilla JavaScript**: No frameworks, just modern ES6+ features
- **LocalStorage API**: For saving user preferences

### Accessibility
- Semantic HTML elements (`<nav>`, `<header>`, `<main>`, `<section>`, `<article>`)
- ARIA roles where appropriate
- Keyboard navigation support
- High contrast colours for readability

### SEO Features
- Meta description tag
- Semantic heading hierarchy (H1 → H6)
- Descriptive link text
- Alt text ready (add to images as needed)

## 🔧 Troubleshooting

### Print Controls Not Working
- Check browser console for JavaScript errors
- Ensure JavaScript is enabled in your browser
- Clear browser cache and reload

### Videos Not Loading
- Check internet connection
- Ensure YouTube is not blocked by firewall/network
- Try different browser

### Print Layout Issues
- Try Chrome browser (best print support)
- Check paper size is set to A4
- Enable "Background graphics" in print settings
- Adjust scale if content is cut off

### Preferences Not Saving
- Check if browser allows local storage
- Not available in private/incognito mode
- Clear local storage and try again

## 📝 Maintenance

### Updating Content
1. Edit `index.html` for content changes
2. Update dates, add new jobs/projects as needed
3. Test changes in browser before deploying

### Adding New Skills
1. Find the appropriate skill category in HTML
2. Add new `<li>` item to the list
3. Add corresponding checkbox in print controls section

### Adding New Videos
1. Get YouTube video ID from URL
2. Add new `.portfolio-item` in the Portfolio section
3. Update iframe `src` to: `https://www.youtube.com/embed/VIDEO_ID`

## 🤝 Support

For issues or questions:
- **Email**: azzamunza@gmail.com
- **Website**: www.vector6.com.au/resume

## 📄 Licence

© 2024 Aaron Munro. All rights reserved.

This resume website is for personal use. Feel free to use the structure as a template for your own resume, but please don't copy the personal content.

---

**Last Updated**: November 2024  
**Version**: 1.0.0