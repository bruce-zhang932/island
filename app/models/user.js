const bcrypt = require('bcryptjs');
const { Sequelize, Model } = require('sequelize');

const { sequelize } = require('../../core/db');

class User extends Model {
  static async verifyEmailPassword(email, plainPassword) {
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new global.errs.AuthFailed('账号不存在');
    }
    // user.password === plainPassword
    const correct = bcrypt.compareSync(
      plainPassword, user.password);
    if (!correct) {
      throw new global.errs.AuthFailed('密码不正确');
    }
    return user;
  }
  
  static async getUserByOpenid(openid) {
    return await User.findOne({
      where: {
        openid,
      },
    });
  }

  static async registerByOpenid(openid) {
    return await User.create({
      openid,
    });
  }
}

User.init({
  // 主键 关系型数据库
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nickname: Sequelize.STRING,
  email: {
    type: Sequelize.STRING(128),
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    set(val) {
      const salt = bcrypt.genSaltSync(10);
      const psw = bcrypt.hashSync(val, salt);
      this.setDataValue('password', psw);
    }
  },
  openid: {
    type: Sequelize.STRING(64),
    unique: true
  }
}, {sequelize});

module.exports = { 
  User 
};
