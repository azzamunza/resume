# Aaron Munro - Professional Resume Website

A modern, professional HTML resume website with advanced print customisation features. Designed for 3D Artist/Developer showcasing comprehensive work history (1999-2024) with granular print control.

## Features

### Core Design
- **Clean, Traditional Layout**: Full-page resume display inspired by professional CV formats
- **Inline Print Controls**: Checkboxes integrated directly next to each section for intuitive selection
- **Responsive Design**: Optimised for desktop, tablet, and mobile devices
- **A4 Print Output**: CSS optimised for professional A4 (210mm × 297mm) printing
- **Australian English**: All content uses Australian spelling conventions

### Print Customisation
The resume includes checkboxes next to every section and subsection, allowing you to:
- Select/deselect entire sections (Summary, Qualifications, Experience, Skills, etc.)
- Choose individual qualifications to include
- Pick specific jobs from work history
- Select particular project-specific roles
- Include/exclude individual skill categories
- Toggle contact details (phone, email, address, website)
- **Quick Controls**: "Select All" and "Deselect All" buttons in header
- **Persistent Storage**: Preferences saved to browser local storage

### Content Structure
- Personal contact details with selective printing
- Professional summary highlighting CG visualisation expertise
- Three qualifications (AI Generalist Course, Advanced Diploma, Certificate IV)
- Seven core job positions (1999-2024)
- Five project-specific roles
- Major infrastructure projects showcase
- Eight technical skill categories (70+ skills)
- Portfolio video links

## Usage

### Viewing the Resume
1. Open `index.html` in any modern web browser
2. The resume displays as a full-page traditional CV

### Customising for Print
1. Use checkboxes next to each section to select what to include
2. Click "Select All" or "Deselect All" buttons in the header for quick control
3. Your selections are automatically saved to browser storage
4. Click "Download as PDF" or press Ctrl/Cmd+P to print
5. The browser print dialog opens with your customised content

### File Structure
```
/
├── index.html                    # Main resume page (comprehensive content)
├── folder-data.json             # JSON data for archive (auto-generated)
├── generate-folder-data.js      # Script to update archive data
├── generate-downloads.js        # Script to generate downloads.json files
├── resumes/                     # Resume archive directory
│   ├── index.html               # Resume & job archive display (split-screen)
│   └── [date-folders]/          # Date-formatted resume versions
│       ├── index.html
│       ├── resume.docx
│       ├── cover-letter.docx
│       ├── application.json     # Job application metadata
│       └── downloads.json       # File links (auto-generated)
├── jobs/                        # Job listings directory
│   └── [date-folders]/          # Date-formatted job listings
│       └── index.html
├── css/
│   └── style.css                # Styles with print media queries
├── js/
│   └── script.js                # Print customisation logic
└── .github/
    └── workflows/
        └── generate-folder-data.yml  # Auto-update workflow
```

### Resume & Job Archive

The repository includes an automated archive system for resumes and job listings:

- **Archive Page**: `resumes/index.html` displays all resume versions and job listings in a split-screen layout
- **Auto-Update**: GitHub Actions automatically updates `folder-data.json` when new folders are added
- **Date Folders**: 
  - Store resume versions in `resumes/[YYMMDDhhmm]/` format folders
  - Store job listings in `jobs/[YYMMDDhhmm]/` format folders
- **Split-Screen Display**: Left side shows resumes/cover letters, right side shows job listings
- **Documentation**: See `GENERATED-ARCHIVE.md` for full details

## Deployment

### GitHub Pages
1. Push repository to GitHub
2. Go to Settings > Pages
3. Select branch and save
4. Access at: `https://yourusername.github.io/repository-name/`

### Netlify
1. Connect repository to Netlify
2. Build command: (none - static site)
3. Publish directory: `/`
4. Deploy

### Traditional Hosting
Upload all files via FTP/SFTP to your web host's public directory.

## Technical Details

### Technologies
- **HTML5**: Semantic markup with ARIA labels
- **CSS3**: Modern layout with CSS Grid/Flexbox
- **Vanilla JavaScript**: No frameworks, clean ES6+ code
- **Local Storage API**: Persistent print preferences

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any modern browser with ES6 support

### Print Specifications
- **Page Size**: A4 portrait (210mm × 297mm)
- **Margins**: 18mm top/bottom, 15mm left/right
- **Colour Mode**: Exact colour preservation
- **Hidden Elements**: Checkboxes and controls hidden in print
- **Typography**: Optimised font sizes for readability

## Customisation

### Updating Content
Edit `index.html` to modify:
- Personal details in header
- Job descriptions and dates
- Skills lists
- Project information
- Portfolio links

### Styling
Edit `css/style.css` to customise:
- Colour scheme (CSS variables at top)
- Typography (font sizes and weights)
- Spacing and layout
- Print-specific styles (@media print section)

### Print Behaviour
Edit `js/script.js` to modify:
- Checkbox functionality
- Storage preferences
- Keyboard shortcuts

## Design Philosophy

This resume combines:
- **Professional Appearance**: Traditional CV layout for maximum credibility
- **Modern Functionality**: Interactive print customisation for flexibility
- **Clean Design**: Based on proven resume design patterns
- **User Control**: Inline checkboxes for intuitive section selection

The design is inspired by the reference resume in `./0520110420/` while adding comprehensive content and advanced print features.

## Colour Scheme

- **Primary**: Deep blue (#00205B) - professional authority
- **Secondary**: Bright blue (#00B8E8) - modern accent
- **Accent**: Gold (#FFB81C) - highlight important elements
- **Text**: Dark grey (#222222) - optimal readability

## Australian English

All content uses Australian spelling conventions:
- "specialised" not "specialized"
- "visualisation" not "visualization"
- "colour" not "color"
- "organisation" not "organization"

## Credits

**Design**: Aaron Munro  
**Development**: Created with modern web standards  
**Inspiration**: Traditional CV design patterns  
**Hosting**: Deploy anywhere static sites are supported

## License

© 2024 Aaron Munro. All rights reserved.

---

For questions or updates, contact: azzamunza@gmail.com
