const Payment = require('../models/Payment');

class PaymentRepository {
  async findPaymentById(paymentId) {
    return Payment.findByPk(paymentId, {
      include: ['order'],
    });
  }

  async findPaymentByExternalId(externalId) {
    return Payment.findOne({
      where: { externalId },
      include: ['order'],
    });
  }

  async findOrderPayments(orderId) {
    return Payment.findAll({
      where: { orderId },
      order: [['createdAt', 'DESC']],
    });
  }

  async createPayment(orderId, amount, method, paymentGateway = 'STRIPE', metadata = null) {
    return Payment.create({
      orderId,
      amount,
      method,
      status: 'PENDING',
      paymentGateway,
      metadata,
    });
  }

  async updatePaymentStatus(paymentId, status, externalId = null) {
    const updateData = { status };
    if (externalId) {
      updateData.externalId = externalId;
    }

    return Payment.update(updateData, { where: { id: paymentId } });
  }

  async updatePaymentByExternalId(externalId, status, metadata = null) {
    const updateData = { status };
    if (metadata) {
      updateData.metadata = metadata;
    }

    return Payment.update(updateData, { where: { externalId } });
  }
}

module.exports = new PaymentRepository();
