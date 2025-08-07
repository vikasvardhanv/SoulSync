import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// Create a crypto payment
router.post('/create', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }),
  body('currency').isIn(['USD', 'EUR', 'BTC', 'ETH']),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { amount, currency, description } = req.body;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        status: 'pending',
        provider: 'coinbase',
        metadata: {
          description: description || 'SoulSync Premium Subscription',
          timestamp: new Date().toISOString()
        }
      }
    });

    // In a real implementation, you would integrate with Coinbase Commerce API
    // For now, we'll simulate the payment creation
    const coinbaseCharge = {
      id: `charge_${payment.id}`,
      hosted_url: `https://commerce.coinbase.com/charges/${payment.id}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      pricing: {
        local: {
          amount: amount.toString(),
          currency: currency
        }
      }
    };

    // Update payment with provider ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerId: coinbaseCharge.id,
        metadata: {
          ...payment.metadata,
          coinbaseCharge
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment: {
          ...payment,
          providerId: coinbaseCharge.id,
          hostedUrl: coinbaseCharge.hosted_url,
          expiresAt: coinbaseCharge.expires_at
        }
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
});

// Webhook handler for Coinbase Commerce
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-cc-webhook-signature'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature (in production, use your webhook secret)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.COINBASE_WEBHOOK_SECRET || 'your-secret')
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const { event } = req.body;

    if (event.type === 'charge:confirmed') {
      const chargeId = event.data.id;
      
      // Find payment by provider ID
      const payment = await prisma.payment.findFirst({
        where: {
          providerId: chargeId,
          status: 'pending'
        }
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            metadata: {
              ...payment.metadata,
              confirmedAt: new Date().toISOString(),
              event: event
            }
          }
        });

        // Create premium subscription for the user
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        await prisma.subscription.create({
          data: {
            userId: payment.userId,
            plan: 'premium',
            status: 'active',
            expiresAt
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook'
    });
  }
});

// Get payment status
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
});

// Create a NOWPayments payment
router.post('/nowpayments', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }),
  body('currency').isIn(['USD', 'EUR', 'BTC', 'ETH']),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { amount, currency, description } = req.body;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        status: 'pending',
        provider: 'nowpayments',
        metadata: {
          description: description || 'SoulSync Premium Subscription',
          timestamp: new Date().toISOString()
        }
      }
    });

    // In a real implementation, you would integrate with NOWPayments API
    // For now, we'll simulate the payment creation
    const nowpaymentsInvoice = {
      id: `nowpayments_${payment.id}`,
      invoice_url: `https://nowpayments.io/payment/${payment.id}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      price_amount: amount,
      price_currency: currency
    };

    // Update payment with provider ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerId: nowpaymentsInvoice.id,
        metadata: {
          ...payment.metadata,
          nowpaymentsInvoice
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'NOWPayments invoice created successfully',
      data: {
        payment: {
          ...payment,
          providerId: nowpaymentsInvoice.id,
          hostedUrl: nowpaymentsInvoice.invoice_url,
          expiresAt: nowpaymentsInvoice.expires_at
        }
      }
    });
  } catch (error) {
    console.error('Create NOWPayments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create NOWPayments invoice'
    });
  }
});

// Get user's payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        payments
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

export default router; 