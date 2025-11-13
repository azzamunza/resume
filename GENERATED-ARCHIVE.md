# Generated.html - Resume Archive

## Overview

The `generated.html` file provides a table view of all resume versions stored in date-formatted folders (YYMMDDhhmm format). It automatically displays links to HTML resumes, DOCX resumes, and cover letters for each version.

## Features

- **Dynamic Loading**: Reads folder data from `folder-data.json` to display all available resume versions
- **Date Formatting**: Converts folder names (e.g., `2511070204`) to readable dates (e.g., "07 Nov 2025 02:04")
- **File Links**: Direct links to HTML, DOCX resume, and cover letter files
- **Copy URL Icons**: Click the 📋 icon next to any file to copy its absolute URL to clipboard
- **Missing File Handling**: Shows "Not Generated" for files that don't exist
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Usage

### Viewing the Archive

1. Open `generated.html` in a web browser
2. The page will load and display all resume versions from the JSON data file

### Copying URLs

1. Find the file you want to share
2. Click the 📋 icon next to the file link
3. The absolute URL is now copied to your clipboard
4. Paste the URL wherever needed (emails, applications, etc.)

## Updating with New Folders

When new date-formatted folders are added to the repository:

1. Run the generation script:
   ```bash
   node generate-folder-data.js
   ```

2. This will scan all date-formatted folders and update `folder-data.json`

3. The next time `generated.html` is loaded, it will show the new folders automatically

## File Structure

```
/
├── generated.html              # The archive webpage
├── folder-data.json           # JSON data with folder information
├── generate-folder-data.js    # Script to scan and update folder data
└── [date-folders]/            # Date-formatted folders (e.g., 2511070204)
    ├── index.html             # HTML resume
    ├── resume.docx            # DOCX resume
    └── cover-letter.docx      # Cover letter
```

## Date Folder Format

Folders must be named in YYMMDDhhmm format:
- YY: Year (2 digits)
- MM: Month (01-12)
- DD: Day (01-31)
- hh: Hour (00-23)
- mm: Minute (00-59)

Example: `2511070204` = November 7, 2025 at 02:04

## Technical Details

- **JSON Data**: The page loads folder information from `folder-data.json`
- **No Server Required**: Works as a static HTML page
- **JavaScript**: Uses vanilla JavaScript (no frameworks required)
- **Browser Compatibility**: Works in all modern browsers with ES6 support
- **Clipboard API**: Uses the modern Clipboard API for copy functionality

## Styling

The page uses the same color scheme as the main resume:
- Primary: Deep blue (#00205B)
- Secondary: Bright blue (#00B8E8)
- Hover effects and responsive design included

## Maintenance

### Regular Updates

Run `node generate-folder-data.js` whenever:
- New date folders are added
- Files are added/removed from existing folders
- File names change in any folder

### Automation (Optional)

You can add the script to your build process or CI/CD pipeline to automatically update the JSON file when changes are detected.

## Troubleshooting

**Problem**: Table shows "No date folders found"
- **Solution**: Run `node generate-folder-data.js` to generate/update the JSON file

**Problem**: New folders don't appear
- **Solution**: Regenerate the JSON file with `node generate-folder-data.js`

**Problem**: Copy icon doesn't work
- **Solution**: Ensure you're using HTTPS or localhost (Clipboard API requirement)

**Problem**: Date shows as raw folder name (e.g., "0520110420")
- **Solution**: This indicates an invalid date format. Check that the folder name follows YYMMDDhhmm format with valid month (01-12)
