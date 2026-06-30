import {
  createPaymentOrderService,
  verifyPaymentService,
  handleWebhookService,
  getPaymentStatusService,
  devCompletePaymentService,
} from "../services/payment.service.js";

export const createOrder = async (req, res) => {
  try {
    const { rideId } = req.body;
    const order = await createPaymentOrderService({ rideId, userId: req.user.id });
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("createOrder error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { rideId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const payment = await verifyPaymentService({
      rideId, razorpayOrderId, razorpayPaymentId, razorpaySignature, userId: req.user.id,
    });
    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DEV MODE ONLY: mark payment as paid without real Razorpay
export const devCompletePayment = async (req, res) => {
  try {
    if (process.env.RAZORPAY_KEY_ID) {
      return res.status(400).json({ success: false, message: "Dev mode only — Razorpay is configured" });
    }
    const { rideId } = req.body;
    const payment = await devCompletePaymentService({ rideId, userId: req.user.id });
    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const webhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const parsedBody = JSON.parse(rawBody.toString());
    await handleWebhookService({ body: parsedBody, rawBody, signature });
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