const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const PDFDocument = require('pdfkit');
const Prescription = require('../models/Prescriptions');
const router = express.Router();
const upload = multer();

// ✅ POST API to create prescription
router.post('/create', upload.any(), async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        console.log("Incoming Request Body:", req.body);

        const { doctorId, patientId, doctorName, patientName } = req.body;
        const prescriptionText = req.body.prescriptionText || req.body.prescription;

        // ✅ Validate required fields
        if (!doctorId || !patientId || !prescriptionText || !doctorName || !patientName) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // ✅ Generate PDF using pdfkit
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));

        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);

            // ✅ Cloudinary Upload with Error Handling
            let pdfUpload;
            try {
                pdfUpload = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'raw', folder: 'prescriptions', format: 'pdf', type: 'upload' },
                        (error, result) => (error ? reject(error) : resolve(result))
                    );
                    streamifier.createReadStream(pdfBuffer).pipe(stream);
                });
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
                return res.status(500).json({ success: false, message: 'Failed to upload PDF' });
            }

            // ✅ Save the prescription to the Database
            const prescription = new Prescription({
                doctorId,
                patientId,
                doctorName,
                patientName,
                prescriptionText,
                pdfUrl: pdfUpload.secure_url,
                createdAt: new Date() // ✅ Timestamp
            });

            await prescription.save();
            console.log("Prescription Saved Successfully");

            res.status(200).json({ success: true, prescription });
        });

        // ✅ Compose PDF content
        doc.fontSize(16).text('*** Prescription ***', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Doctor: ${doctorName}`);
        doc.text(`Patient: ${patientName}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.text('Prescription Details:');
        doc.text(prescriptionText);
        doc.end();

    } catch (err) {
        console.error("Error creating prescription:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ GET API to fetch prescriptions by doctor or patient
router.get('/get/:userId', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const prescriptions = await Prescription.find({
            $or: [{ doctorId: userId }, { patientId: userId }]
        }).sort({ createdAt: -1 });  // ✅ Sort by latest first

        res.status(200).json(prescriptions);
    } catch (err) {
        console.error("Error fetching prescriptions:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



// ✅ DOWNLOAD API - Redirects directly to the public URL
router.get('/download/:prescriptionId', async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.prescriptionId);
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        // ✅ Directly redirect to the Cloudinary public PDF URL
        res.redirect(prescription.pdfUrl);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});





module.exports = router;
