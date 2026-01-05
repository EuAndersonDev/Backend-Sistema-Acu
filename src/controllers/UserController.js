const User = require('../models/User');

class UserController {
  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'DESC']],
      });

      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se o email já está em uso por outro usuário
      if (email && email !== user.email) {
        const emailExists = await User.findOne({
          where: { email },
          attributes: ['id'],
        });

        if (emailExists) {
          return res.status(400).json({ error: 'Email já em uso' });
        }
      }

      await user.update({
        name: name || user.name,
        email: email || user.email,
        password: password || user.password,
      });

      // Retornar sem a senha
      const userWithoutPassword = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      });

      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.destroy();

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
}

module.exports = new UserController();
