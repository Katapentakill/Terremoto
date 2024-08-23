// moveFiles.js
const fs = require('fs-extra'); // Import the fs-extra module, which adds file system methods that aren't included in the native fs module
const path = require('path'); // Import the path module for handling file and directory paths

// Define the moveFiles function to move files from the download directory to the target directory
const moveFiles = async (folderName) => {
    const downloadDir = 'D:\\Descarga'; // Specify the path to the downloads folder
    const targetDir = path.join('D:\\Ale\\WebScrapping\\Practica\\Alexander', folderName); // Define the target directory path using the folderName parameter

    try {
        // Create the target directory if it doesn't exist
        await fs.ensureDir(targetDir);
        console.log(`Target directory created or already exists: ${targetDir}`);

        // Read all files in the downloads folder
        const files = await fs.readdir(downloadDir);
        console.log(`Files in the downloads folder: ${files.join(', ')}`);

        // Iterate over each file in the downloads directory
        for (const file of files) {
            // Skip the desktop.ini file (a system file)
            if (file === 'desktop.ini') {
                console.log(`Skipping file: ${file}`);
                continue; // Continue to the next file
            }

            const srcPath = path.join(downloadDir, file); // Define the source file path
            const destPath = path.join(targetDir, file); // Define the destination file path

            // Check if the current item is a file (not a directory)
            if (fs.statSync(srcPath).isFile()) {
                console.log(`Moving: ${srcPath} to ${destPath}`);
                await fs.move(srcPath, destPath, { overwrite: true }); // Move the file to the target directory, overwriting any existing files with the same name
                console.log(`Moved: ${file}`);
            } else {
                console.log(`Not a file: ${srcPath}`);
            }
        }

        console.log('All files have been moved.');
    } catch (err) {
        console.error('Error moving files:', err); // Catch and log any errors that occur during the file moving process
    }
};

// Export the moveFiles function so it can be used in other scripts
module.exports = moveFiles;