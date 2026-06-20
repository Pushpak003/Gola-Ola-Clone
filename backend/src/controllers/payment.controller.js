import {
  createPaymentOrderService,
  verifyPaymentService,
  handleWebhookService,
  getPaymentStatusService,
} from "../services/payment.service.js";

export const createOrder = async (req, res) => {
  try {
    const { rideId } = req.body;
    const order = await createPaymentOrderService({ rideId, userId: req.user.id });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { rideId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const payment = await verifyPaymentService({
      rideId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId: req.user.id,
    });
    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Raw body needed for Razorpay webhook signature check
export const webhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    await handleWebhookService({ body: req.body, signature });
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const payment = await getPaymentStatusService({ rideId });
    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};