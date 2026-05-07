const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { db } = require('../db/database');
const { emitNotification } = require('../socket');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

router.post('/', upload.array('files', 50), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const insertedFiles = [];
    const insertFile = db.prepare(`
      INSERT INTO files (name, size, type, path) 
      VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
      for (const file of files) {
        const info = insertFile.run(
          file.originalname,
          file.size,
          file.mimetype,
          file.filename
        );

        insertedFiles.push({
          id: info.lastInsertRowid,
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
          path: file.filename,
          status: 'complete'
        });
      }
    })();

    // Insert Notification
    let notificationMessage = '';
    if (files.length > 3) {
      notificationMessage = `${files.length} files uploaded successfully (bulk)`;
    } else {
      notificationMessage = `${files.length} file(s) uploaded successfully`;
    }

    const insertNotification = db.prepare(`
      INSERT INTO notifications (message, type) 
      VALUES (?, ?)
    `);

    const notifInfo = insertNotification.run(notificationMessage, 'success');

    const notification = {
      id: notifInfo.lastInsertRowid,
      message: notificationMessage,
      type: 'success',
      is_read: 0,
      created_at: new Date().toISOString()
    };

    // Emit socket event
    emitNotification(notification);

    res.json({ files: insertedFiles, notification });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

module.exports = router;
