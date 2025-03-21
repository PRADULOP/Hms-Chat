const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');  // Your Cloudinary config file
const Report = require('../models/Reports');
const router = express.Router();
const mongoose = require('mongoose');

// ✅ Cloudinary Storage Setup for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'patient_reports',      // Cloudinary folder name
    resource_type: 'raw',           // Handles PDF, doc, etc.
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

// ✅ Upload Report Route - Uploads to Cloudinary
router.post('/upload', upload.single('reportFile'), async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const report = new Report({
      doctorId,
      patientId,
      fileName: req.file.originalname,
      filePath: req.file.path,  // Cloudinary URL
      createdAt: new Date()
    });

    await report.save();

    res.status(200).json({ message: '✅ Report uploaded successfully', report });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ✅ Get Reports for a Patient with Cloudinary Download URL
router.get('/:patientId', async (req, res) => {
  const { patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ message: 'Invalid Patient ID' });
  }

  try {
    const reports = await Report.find({ patientId }).populate('doctorId', 'name');
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ✅ Download Route - Optional (Redirects to Cloudinary File)
router.get('/download/:reportId', async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.setHeader('Content-Disposition', `attachment; filename=${report.fileName}`);
    // ✅ Redirect to Cloudinary link for download
    res.redirect(report.filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
