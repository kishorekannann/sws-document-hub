const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { db } = require('../db/database');

// GET /api/files
router.get('/', (req, res) => {
  try {
    const files = db.prepare('SELECT * FROM files ORDER BY uploaded_at DESC').all();
    res.json({ files });
  } catch (error) {
    console.error('Fetch Files Error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// GET /api/files/:id/download
router.get('/:id/download', (req, res) => {
  try {
    const fileId = req.params.id;
    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const absolutePath = path.resolve(__dirname, '..', 'uploads', file.path);
    res.download(absolutePath, file.name);
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// DELETE /api/files/:id
router.delete('/:id', (req, res) => {
  try {
    const fileId = req.params.id;
    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const absolutePath = path.resolve(__dirname, '..', 'uploads', file.path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    db.prepare('DELETE FROM files WHERE id = ?').run(fileId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
