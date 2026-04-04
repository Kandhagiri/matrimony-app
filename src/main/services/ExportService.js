const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

class ExportService {
  constructor(appDataPath) {
    this.appDataPath = appDataPath;
    this.backupPath = path.join(appDataPath, 'backups');
  }

  async createBackup() {
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.zip`;
    const backupFilePath = path.join(this.backupPath, backupFileName);

    // Ensure backups directory exists
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }

    // Add database or JSON file
    const dbPath = path.join(this.appDataPath, 'matrimony.db');
    const jsonPath = path.join(this.appDataPath, 'profiles.json');

    if (fs.existsSync(dbPath)) {
      const dbData = fs.readFileSync(dbPath);
      zip.file('matrimony.db', dbData);
    } else if (fs.existsSync(jsonPath)) {
      const jsonData = fs.readFileSync(jsonPath);
      zip.file('profiles.json', jsonData);
    }

    // Add images directory
    const imagesPath = path.join(this.appDataPath, 'images');
    if (fs.existsSync(imagesPath)) {
      const images = fs.readdirSync(imagesPath);
      images.forEach(imageFile => {
        const imagePath = path.join(imagesPath, imageFile);
        if (fs.statSync(imagePath).isFile()) {
          const imageData = fs.readFileSync(imagePath);
          zip.file(`images/${imageFile}`, imageData);
        }
      });
    }

    // Create manifest
    let profileCount = 0;
    try {
      const DatabaseService = require('./DatabaseService');
      const dbService = new DatabaseService(this.appDataPath);
      dbService.init(); // Initialize database before using it
      const profiles = dbService.getAllProfiles();
      profileCount = Array.isArray(profiles) ? profiles.length : 0;
    } catch (error) {
      console.error('Error getting profiles for manifest:', error);
      // Continue with profileCount = 0 if we can't read profiles
    }

    const manifest = {
      version: '1.0',
      created: new Date().toISOString(),
      storageType: fs.existsSync(dbPath) ? 'sqlite' : 'json',
      profileCount: profileCount,
    };

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Generate ZIP file
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(backupFilePath, buffer);

    return {
      path: backupFilePath,
      filename: backupFileName,
      size: buffer.length,
    };
  }

  async restoreBackup(backupFilePath) {
    const zipData = fs.readFileSync(backupFilePath);
    const zip = await JSZip.loadAsync(zipData);

    // Validate manifest
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Invalid backup file: manifest.json not found');
    }

    const manifestContent = await manifestFile.async('string');
    const manifest = JSON.parse(manifestContent);

    // Create backup of current data before restore
    const restoreBackupPath = path.join(this.appDataPath, 'backup_before_restore');
    if (!fs.existsSync(restoreBackupPath)) {
      fs.mkdirSync(restoreBackupPath, { recursive: true });
    }

    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const currentBackupPath = path.join(restoreBackupPath, `backup-${now}`);

    // Backup current database
    const currentDbPath = path.join(this.appDataPath, 'matrimony.db');
    const currentJsonPath = path.join(this.appDataPath, 'profiles.json');

    if (fs.existsSync(currentDbPath)) {
      if (!fs.existsSync(currentBackupPath)) {
        fs.mkdirSync(currentBackupPath, { recursive: true });
      }
      fs.copyFileSync(currentDbPath, path.join(currentBackupPath, 'matrimony.db'));
    }

    if (fs.existsSync(currentJsonPath)) {
      if (!fs.existsSync(currentBackupPath)) {
        fs.mkdirSync(currentBackupPath, { recursive: true });
      }
      fs.copyFileSync(currentJsonPath, path.join(currentBackupPath, 'profiles.json'));
    }

    // Backup current images
    const currentImagesPath = path.join(this.appDataPath, 'images');
    if (fs.existsSync(currentImagesPath)) {
      if (!fs.existsSync(currentBackupPath)) {
        fs.mkdirSync(currentBackupPath, { recursive: true });
      }
      const backupImagesPath = path.join(currentBackupPath, 'images');
      if (!fs.existsSync(backupImagesPath)) {
        fs.mkdirSync(backupImagesPath, { recursive: true });
      }

      const images = fs.readdirSync(currentImagesPath);
      images.forEach(imageFile => {
        const sourcePath = path.join(currentImagesPath, imageFile);
        const destPath = path.join(backupImagesPath, imageFile);
        fs.copyFileSync(sourcePath, destPath);
      });
    }

    // Restore database
    const dbFile = zip.file('matrimony.db');
    const jsonFile = zip.file('profiles.json');

    if (dbFile) {
      const dbData = await dbFile.async('nodebuffer');
      fs.writeFileSync(path.join(this.appDataPath, 'matrimony.db'), dbData);
    } else if (jsonFile) {
      const jsonData = await jsonFile.async('nodebuffer');
      fs.writeFileSync(path.join(this.appDataPath, 'profiles.json'), jsonData);
    }

    // Restore images
    const imagesFolder = zip.folder('images');
    if (imagesFolder) {
      const imagesPath = path.join(this.appDataPath, 'images');
      if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath, { recursive: true });
      }

      const imageFiles = Object.keys(imagesFolder.files);
      for (const imageFile of imageFiles) {
        if (!imagesFolder.files[imageFile].dir) {
          const imageData = await imagesFolder.files[imageFile].async('nodebuffer');
          const fileName = path.basename(imageFile);
          fs.writeFileSync(path.join(imagesPath, fileName), imageData);
        }
      }
    }

    return {
      success: true,
      manifest,
    };
  }

  async listBackups() {
    if (!fs.existsSync(this.backupPath)) {
      return [];
    }

    const files = fs.readdirSync(this.backupPath);
    const backups = files
      .filter(file => file.endsWith('.zip'))
      .map(file => {
        const filePath = path.join(this.backupPath, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    return backups;
  }

  async deleteBackup(filename) {
    const filePath = path.join(this.backupPath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    throw new Error('Backup file not found');
  }
}

module.exports = ExportService;



