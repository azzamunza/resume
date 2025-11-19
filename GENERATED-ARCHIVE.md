# Resume & Job Archive - resumes/index.html

## Overview

The `resumes/index.html` file provides a split-screen view of all resume versions and job listings stored in date-formatted folders (YYMMDDhhmm format). It displays resumes/cover letters on the left and job listings on the right.

## Features

- **Split-Screen Layout**: Left side shows resumes/cover letters, right side shows job listings
- **Dynamic Loading**: Reads folder data from `folder-data.json` to display all available versions
- **Date Formatting**: Converts folder names (e.g., `2511070204`) to readable dates (e.g., "07 Nov 2025 02:04")
- **File Links**: Direct links to HTML, DOCX resume, and cover letter files
- **Job Listing Previews**: Embedded iframes show job listing content
- **Copy URL Icons**: Click the 📋 icon next to any file to copy its absolute URL to clipboard
- **Missing File Handling**: Shows "Not Generated" for files that don't exist
- **Responsive Design**: Works on desktop, tablet, and mobile devices (stacks vertically on smaller screens)

## Usage

### Viewing the Archive

1. Open `resumes/index.html` in a web browser
2. The page will load and display all resume versions (left) and job listings (right) from the JSON data file

### Copying URLs

1. Find the file you want to share
2. Click the 📋 icon next to the file link
3. The absolute URL is now copied to your clipboard
4. Paste the URL wherever needed (emails, applications, etc.)

## Updating with New Folders

### Automatic Updates (GitHub Actions)

When new date-formatted folders are pushed to the main/master branch:

1. A GitHub Actions workflow automatically runs `node generate-folder-data.js` and `node generate-downloads.js`
2. The workflow updates `folder-data.json` and downloads.json files with the new folder information
3. The updated JSON files are automatically committed and pushed back to the repository
4. The next time `resumes/index.html` is loaded, it will show the new folders automatically

This is handled by the `.github/workflows/generate-folder-data.yml` workflow.

### Manual Updates

You can also manually update the folder data:

1. Run the generation script:
   ```bash
   node generate-folder-data.js
   ```

2. This will scan all date-formatted folders and update `folder-data.json`

3. Commit and push the changes to the repository

## File Structure

```
/
├── folder-data.json           # JSON data with folder information (auto-generated)
├── generate-folder-data.js    # Script to scan and update folder data
├── generate-downloads.js      # Script to generate downloads.json files
├── resumes/                   # Resume archive directory
│   ├── index.html             # The archive webpage (split-screen view)
│   └── [date-folders]/        # Date-formatted folders (e.g., 2511070204)
│       ├── index.html         # HTML resume
│       ├── resume.docx        # DOCX resume
│       ├── cover-letter.docx  # Cover letter
│       ├── application.json   # Job application metadata
│       └── downloads.json     # File links (auto-generated)
└── jobs/                      # Job listings directory
    └── [date-folders]/        # Date-formatted job folders
        └── index.html         # Job listing HTML
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

Run the generation scripts whenever:
- New date folders are added to `resumes/` or `jobs/`
- Files are added/removed from existing folders
- File names change in any folder

Commands:
```bash
node generate-folder-data.js   # Updates folder-data.json
node generate-downloads.js     # Updates downloads.json in resume folders
```

### Automation

The repository includes a GitHub Actions workflow that automatically updates `folder-data.json`:

- **Workflow File**: `.github/workflows/generate-folder-data.yml`
- **Trigger**: Runs automatically on push to main/master branch
- **Process**: Scans folders, updates JSON, commits and pushes changes
- **Manual Trigger**: Can also be triggered manually from GitHub Actions tab

You can also add the script to your local build process or other CI/CD pipelines.

## Troubleshooting

**Problem**: Page shows "No date folders found" or "No job listings found"
- **Solution**: Run `node generate-folder-data.js` to generate/update the JSON file

**Problem**: New folders don't appear
- **Solution**: Regenerate the JSON file with `node generate-folder-data.js`

**Problem**: Copy icon doesn't work
- **Solution**: Ensure you're using HTTPS or localhost (Clipboard API requirement)

**Problem**: Date shows as raw folder name (e.g., "0520110420")
- **Solution**: This indicates an invalid date format. Check that the folder name follows YYMMDDhhmm format with valid month (01-12)
