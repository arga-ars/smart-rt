const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { google } = require('googleapis');
const nodeCron = require('node-cron');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const BACKUP_FOLDER = path.join(__dirname, '../backups');

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_FOLDER)) {
  fs.mkdirSync(BACKUP_FOLDER, { recursive: true });
}

async function authenticateGoogleDrive() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
    scopes: SCOPES
  });

  return google.drive({ version: 'v3', auth });
}

async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_FOLDER, `smart-rt-backup-${timestamp}.gz`);

    console.log('📦 Starting MongoDB backup...');

    // Backup MongoDB
    const mongoUri = process.env.MONGODB_URI

    execSync(
      `mongodump --uri="${mongoUri}" --gzip --archive="${backupFile}"`,
      { stdio: 'inherit' }
    );

    console.log(`✅ Backup created: ${backupFile}`);

    // Upload to Google Drive
    await uploadToGoogleDrive(backupFile);

    // Delete local backup after upload
    const uploaded = await uploadToGoogleDrive(backupFile)

    if (uploaded) {
      fs.unlinkSync(backupFile)
    }
    console.log('🗑️  Local backup deleted');

  } catch (err) {
    console.error('❌ Backup error:', err.message);
  }
}

async function uploadToGoogleDrive(filePath) {
  try {
    const drive = await authenticateGoogleDrive();
    const fileName = path.basename(filePath);

    // Find or create Smart RT Backups folder
    const folderQuery = "name='Smart RT Backups' and mimeType='application/vnd.google-apps.folder' and trashed=false";
    const folderResult = await drive.files.list({
      q: folderQuery,
      spaces: 'drive',
      pageSize: 1,
      fields: 'files(id, name)'
    });

    let folderId;
    if (folderResult.data.files.length === 0) {
      const folderMeta = {
        name: 'Smart RT Backups',
        mimeType: 'application/vnd.google-apps.folder'
      };
      const folder = await drive.files.create({
        resource: folderMeta,
        fields: 'id'
      });
      folderId = folder.data.id;
      console.log(`📁 Created folder: Smart RT Backups (${folderId})`);
    } else {
      folderId = folderResult.data.files[0].id;
    }

    // Upload file
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: 'application/gzip',
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });

    console.log(`☁️  Uploaded to Google Drive (ID: ${response.data.id})`);

    // Keep only last 7 backups
    await cleanOldBackups(drive, folderId);

  } catch (err) {
    console.error('❌ Google Drive upload error:', err.message);
  }
}

async function cleanOldBackups(drive, folderId) {
  try {
    const query = `'${folderId}' in parents and trashed=false`;
    const result = await drive.files.list({
      q: query,
      spaces: 'drive',
      pageSize: 100,
      orderBy: 'createdTime desc',
      fields: 'files(id, name, createdTime)'
    });

    const files = result.data.files || [];
    
    // Keep only 7 latest backups
    if (files.length > 7) {
      const filesToDelete = files.slice(7);
      
      for (const file of filesToDelete) {
        await drive.files.delete({ fileId: file.id });
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      }
    }
  } catch (err) {
    console.error('Error cleaning old backups:', err.message);
  }
}

// Setup cron job - runs daily at 2 AM
function startBackupSchedule() {
  nodeCron.schedule('0 2 * * *', () => {
    console.log('⏰ Running scheduled backup...');
    backupDatabase();
  });
  
  console.log('✅ Backup scheduler started (runs daily at 2 AM)');
}

module.exports = { backupDatabase, startBackupSchedule };