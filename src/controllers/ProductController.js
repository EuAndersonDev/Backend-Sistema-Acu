const Product = require('../models/Product');

const index = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      order: [['last_updated', 'DESC'], ['createdAt', 'DESC']],
    });

    return res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

const show = async (req, res) => {
  try {
    const { ml_id } = req.params;

    const product = await Product.findByPk(ml_id);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

module.exports = {
  index,
  show,
};
