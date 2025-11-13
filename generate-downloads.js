#!/usr/bin/env node

/**
 * Script to generate downloads.json in each date-formatted folder
 * Run this script to create/update downloads.json files with local links to resume and cover letter files
 */

const fs = require('fs');
const path = require('path');

const DATE_FOLDER_PATTERN = /^\d{10}$/;

function scanFolders() {
    const currentDir = __dirname;
    const items = fs.readdirSync(currentDir);
    
    const dateFolders = items.filter(item => {
        const itemPath = path.join(currentDir, item);
        return fs.statSync(itemPath).isDirectory() && DATE_FOLDER_PATTERN.test(item);
    });
    
    // Sort in reverse chronological order
    dateFolders.sort((a, b) => b.localeCompare(a));
    
    return dateFolders;
}

function scanFilesInFolder(folderName) {
    const folderPath = path.join(__dirname, folderName);
    const files = fs.readdirSync(folderPath);
    
    const result = {
        resume: null,
        coverLetter: null
    };
    
    // Separate files by type
    const resumeFiles = [];
    const coverLetterFiles = [];
    
    files.forEach(file => {
        const lowerFile = file.toLowerCase();
        
        // Check for cover letter files
        if (lowerFile.includes('cover') && file.endsWith('.docx')) {
            // Exclude templates
            if (!lowerFile.includes('template')) {
                coverLetterFiles.push(file);
            }
        }
        // Check for resume files
        else if (lowerFile.includes('resume') && file.endsWith('.docx')) {
            // Exclude templates
            if (!lowerFile.includes('template')) {
                resumeFiles.push(file);
            }
        }
        // Fallback: check for generic docx files (not templates, not cover letters)
        else if (file.endsWith('.docx') && !lowerFile.includes('template') && !lowerFile.includes('cover')) {
            resumeFiles.push(file);
        }
    });
    
    // Prefer non-template resume files
    if (resumeFiles.length > 0) {
        // Prefer files with 'resume' in the name
        const namedResume = resumeFiles.find(f => f.toLowerCase().includes('resume'));
        result.resume = namedResume || resumeFiles[0];
    }
    
    // Prefer non-template cover letter files
    if (coverLetterFiles.length > 0) {
        result.coverLetter = coverLetterFiles[0];
    }
    
    return result;
}

function generateDownloadsJson(folderName) {
    const files = scanFilesInFolder(folderName);
    const downloads = [];
    
    // Add resume if found
    if (files.resume) {
        const resumeName = path.parse(files.resume).name; // Remove extension
        downloads.push({
            id: "resume",
            name: resumeName,
            path: `./${files.resume}`
        });
    }
    
    // Add cover letter if found
    if (files.coverLetter) {
        const coverLetterName = path.parse(files.coverLetter).name; // Remove extension
        downloads.push({
            id: "coverLetter",
            name: coverLetterName,
            path: `./${files.coverLetter}`
        });
    }
    
    return {
        downloads: downloads
    };
}

function main() {
    console.log('Scanning for date-formatted folders...');
    
    const folders = scanFolders();
    console.log(`Found ${folders.length} date folders`);
    
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    folders.forEach(folder => {
        const downloadsData = generateDownloadsJson(folder);
        const outputPath = path.join(__dirname, folder, 'downloads.json');
        
        // Check if file already exists
        const existed = fs.existsSync(outputPath);
        
        // Only create downloads.json if there are files to download
        if (downloadsData.downloads.length > 0) {
            fs.writeFileSync(outputPath, JSON.stringify(downloadsData, null, 2));
            
            if (existed) {
                updatedCount++;
                console.log(`  ✓ Updated: ${folder}/downloads.json`);
            } else {
                createdCount++;
                console.log(`  + Created: ${folder}/downloads.json`);
            }
            
            // Show what was added
            downloadsData.downloads.forEach(download => {
                console.log(`      - ${download.id}: ${download.name}`);
            });
        } else {
            skippedCount++;
            console.log(`  - Skipped: ${folder} (no docx files found)`);
        }
    });
    
    console.log(`\nSummary:`);
    console.log(`  Created: ${createdCount}`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
}

if (require.main === module) {
    main();
}

module.exports = { generateDownloadsJson };
