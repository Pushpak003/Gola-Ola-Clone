import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../config/db.js";
import { getIo } from "../sockets/socket.js";
import { onlineUsers } from "../sockets/onlineUsers.js";
import { onlineDrivers } from "../sockets/onlineDrivers.js";

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * Create a Razorpay order for a completed ride.
 * Returns the order details that the frontend needs to open the Razorpay checkout.
 */
export const createPaymentOrderService = async ({ rideId, userId }) => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { payment: true },
  });

  if (!ride) throw new Error("Ride not found");
  if (ride.userId !== userId) throw new Error("Unauthorized");
  if (ride.status !== "COMPLETED") throw new Error("Ride is not completed yet");

  // If a pending payment already exists, return it
  if (ride.payment && ride.payment.status === "PENDING" && ride.payment.razorpayOrderId) {
    return {
      orderId: ride.payment.razorpayOrderId,
      amount: Math.round(ride.fare * 100),    // paise
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  // If already paid, don't create another order
  if (ride.payment && ride.payment.status === "PAID") {
    throw new Error("Ride is already paid");
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(ride.fare * 100),      // paise
    currency: "INR",
    receipt: `ride_${rideId}`,
    notes: { rideId, userId },
  });

  // Upsert payment record
  await prisma.payment.upsert({
    where: { rideId },
    create: {
      rideId,
      amount: ride.fare,
      currency: "INR",
      method: "RAZORPAY",
      status: "PENDING",
      razorpayOrderId: order.id,
    },
    update: {
      status: "PENDING",
      razorpayOrderId: order.id,
      failureReason: null,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

/**
 * Verify Razorpay signature after payment is completed on the frontend.
 * Marks payment as PAID and notifies the captain via socket.
 */
export const verifyPaymentService = async ({
  rideId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  userId,
}) => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { payment: true },
  });

  if (!ride) throw new Error("Ride not found");
  if (ride.userId !== userId) throw new Error("Unauthorized");

  // Verify HMAC signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    // Mark as failed
    await prisma.payment.update({
      where: { rideId },
      data: { status: "FAILED", failureReason: "Signature mismatch" },
    });
    throw new Error("Payment verification failed");
  }

  // Mark as PAID
  const payment = await prisma.payment.update({
    where: { rideId },
    data: {
      status: "PAID",
      razorpayPaymentId,
      razorpaySignature,
    },
  });

  // Notify captain via socket that payment is received
  if (ride.captainId) {
    const captainSocketData = onlineDrivers.get(ride.captainId);
    if (captainSocketData) {
      getIo().to(captainSocketData.socketId).emit("payment-received", {
        rideId,
        amount: ride.fare,
        paymentId: razorpayPaymentId,
      });
    }
  }

  return payment;
};

/**
 * Razorpay webhook handler (optional but recommended for production).
 * Handles async events like payment.failed.
 */
export const handleWebhookService = async ({ body, signature }) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return; // Webhook not configured — skip

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  if (expectedSig !== signature) throw new Error("Invalid webhook signature");

  const event = body.event;
  const paymentEntity = body.payload?.payment?.entity;

  if (event === "payment.failed" && paymentEntity) {
    const orderId = paymentEntity.order_id;
    if (orderId) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId, status: "PENDING" },
        data: {
          status: "FAILED",
          failureReason: paymentEntity.error_description || "Payment failed",
        },
      });
    }
  }
};

/**
 * Get payment status for a ride (used by captain to check payment).
 */
export const getPaymentStatusService = async ({ rideId }) => {
  const payment = await prisma.payment.findUnique({ where: { rideId } });
  return payment;
};