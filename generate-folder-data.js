#!/usr/bin/env node

/**
 * Script to scan date-formatted folders and generate folder-data.json
 * Run this script whenever new date folders are added to update the archive
 */

const fs = require('fs');
const path = require('path');

const DATE_FOLDER_PATTERN = /^\d{10}$/;

function scanFolders(directory) {
    const scanDir = path.join(__dirname, directory);
    
    // Check if directory exists
    if (!fs.existsSync(scanDir)) {
        console.log(`Directory ${directory} does not exist`);
        return [];
    }
    
    const items = fs.readdirSync(scanDir);
    
    const dateFolders = items.filter(item => {
        const itemPath = path.join(scanDir, item);
        return fs.statSync(itemPath).isDirectory() && DATE_FOLDER_PATTERN.test(item);
    });
    
    // Sort in reverse chronological order
    dateFolders.sort((a, b) => b.localeCompare(a));
    
    return dateFolders;
}

function scanFilesInFolder(directory, folderName) {
    const folderPath = path.join(__dirname, directory, folderName);
    const files = fs.readdirSync(folderPath);
    
    const result = {
        html: null,
        resume: null,
        coverLetter: null,
        applicationData: null
    };
    
    // Separate files by type
    const resumeFiles = [];
    const coverLetterFiles = [];
    
    files.forEach(file => {
        const lowerFile = file.toLowerCase();
        
        // Check for HTML file
        if (file === 'index.html') {
            result.html = file;
        }
        // Check for application.json file
        else if (file === 'application.json') {
            try {
                const appDataPath = path.join(folderPath, file);
                const appDataContent = fs.readFileSync(appDataPath, 'utf8');
                result.applicationData = JSON.parse(appDataContent);
            } catch (error) {
                console.error(`Error reading application.json in ${folderName}:`, error.message);
            }
        }
        // Check for cover letter files
        else if (lowerFile.includes('cover') && file.endsWith('.docx')) {
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

function scanJobFolders(directory) {
    const scanDir = path.join(__dirname, directory);
    
    // Check if directory exists
    if (!fs.existsSync(scanDir)) {
        console.log(`Directory ${directory} does not exist`);
        return [];
    }
    
    const items = fs.readdirSync(scanDir);
    
    const dateFolders = items.filter(item => {
        const itemPath = path.join(scanDir, item);
        return fs.statSync(itemPath).isDirectory() && DATE_FOLDER_PATTERN.test(item);
    });
    
    // Sort in reverse chronological order
    dateFolders.sort((a, b) => b.localeCompare(a));
    
    return dateFolders;
}

function scanJobFilesInFolder(directory, folderName) {
    const folderPath = path.join(__dirname, directory, folderName);
    const files = fs.readdirSync(folderPath);
    
    const result = {
        html: null
    };
    
    files.forEach(file => {
        // Check for HTML file (job listing)
        if (file === 'index.html') {
            result.html = file;
        }
    });
    
    return result;
}

function generateFolderData() {
    // Scan resumes directory
    const resumeFolders = scanFolders('resumes');
    
    const resumeData = resumeFolders.map(folder => {
        const files = scanFilesInFolder('resumes', folder);
        return {
            name: folder,
            files: files
        };
    });
    
    // Scan jobs directory
    const jobFolders = scanJobFolders('jobs');
    
    const jobData = jobFolders.map(folder => {
        const files = scanJobFilesInFolder('jobs', folder);
        return {
            name: folder,
            files: files
        };
    });
    
    const data = {
        resumes: resumeData,
        jobs: jobData,
        lastUpdated: new Date().toISOString()
    };
    
    return data;
}

function main() {
    console.log('Scanning for date-formatted folders...');
    
    const data = generateFolderData();
    
    console.log(`\nFound ${data.resumes.length} resume folders in ./resumes/`);
    data.resumes.forEach(folder => {
        console.log(`  - ${folder.name}:`, folder.files);
    });
    
    console.log(`\nFound ${data.jobs.length} job folders in ./jobs/`);
    data.jobs.forEach(folder => {
        console.log(`  - ${folder.name}:`, folder.files);
    });
    
    const outputPath = path.join(__dirname, 'folder-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`\nGenerated ${outputPath}`);
}

if (require.main === module) {
    main();
}

module.exports = { generateFolderData };
