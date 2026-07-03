const crypto = require('crypto');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const Application = require('../models/Application');

// eSewa Sandbox constants
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8g8M8PlwO6153773';
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';

exports.initializePayment = async (req, res, next) => {
  try {
    const { applicationId, paymentMethod } = req.body;

    const application = await Application.findById(applicationId).populate('event');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const event = application.event;
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to pay for this shift' });
    }

    // Calculate pay: payAmount * hours (or simple total amount if hours not tracked, fallback to total pay)
    // Find the role applied for in the event's rolesNeeded array
    const assignedRole = event.rolesNeeded.find(r => r.roleName === application.roleAppliedFor);
    
    const payRate = assignedRole ? assignedRole.payAmount : 500; // default NPR 500/hr
    // Let's assume standard 8 hr shift if not specified
    const amount = payRate * 8; 

    // Create unique payment ID/transaction UUID
    const transactionUuid = `TX-${Date.now()}-${applicationId}`;

    const payment = await Payment.create({
      event: event._id,
      organizer: req.user.id,
      worker: application.worker,
      application: application._id,
      amount,
      paymentMethod,
      refId: transactionUuid
    });

    if (paymentMethod === 'esewa') {
      // eSewa signature message formula: "total_amount=VAL,transaction_uuid=VAL,product_code=VAL"
      const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
      
      const signature = crypto
        .createHmac('sha256', ESEWA_SECRET_KEY)
        .update(message)
        .digest('base64');

      return res.json({
        success: true,
        paymentMethod: 'esewa',
        paymentId: payment._id,
        amount,
        transactionUuid,
        productCode: ESEWA_PRODUCT_CODE,
        signature,
        actionUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
      });
    }

    // Fallback/Mock Khalti initialization
    return res.json({
      success: true,
      paymentMethod: 'khalti',
      paymentId: payment._id,
      amount,
      transactionUuid,
      actionUrl: '/payments/khalti/mock'
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { encodedData } = req.body;
    if (!encodedData) {
      return res.status(400).json({ message: 'Missing response data' });
    }

    // Decode base64 callback data from eSewa
    const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
    const callbackData = JSON.parse(decodedString);

    const { transaction_code, status, total_amount, transaction_uuid, signature } = callbackData;

    // Reconstruct message and signature validation
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const expectedSignature = crypto
      .createHmac('sha256', ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Signature verification failed' });
    }

    const payment = await Payment.findOne({ refId: transaction_uuid });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (status === 'COMPLETE') {
      payment.status = 'completed';
      payment.transactionId = transaction_code;
      await payment.save();

      // Mark application as paid
      await Application.findByIdAndUpdate(payment.application, { isPaid: true });

      return res.json({ success: true, message: 'Payment verified', payment });
    } else {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : req.user.role === 'organizer' 
        ? { organizer: req.user.id } 
        : { worker: req.user.id };

    const payments = await Payment.find(query)
      .populate('event', 'title eventDate')
      .populate('organizer', 'name email')
      .populate('worker', 'name email')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    next(error);
  }
};
