const mlNotification = async (req, res) => {
    try {
        // Endpoint esqueleto para futuras atualizacoes via webhook do Mercado Livre.
        // Aqui voce pode validar a assinatura e enfileirar um job de sincronizacao.
        return res.status(200).json({ received: true });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao processar webhook' });
    }
};

module.exports = {
    mlNotification,
};
