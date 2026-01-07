const Product = require('../models/Product');

const index = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

const store = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price || product.price,
      stock: stock !== undefined ? stock : product.stock,
    });

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await product.destroy();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};
