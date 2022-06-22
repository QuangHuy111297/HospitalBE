'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Clinics', {
      // statusId: DataTypes.STRING,
      // doctorId: DataTypes.INTEGER,
      // patientId: DataTypes.INTEGER,
      // date: DataTypes.DATE,
      // timeType: DataTypes.STRING,
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      descriptionMarkdown: {
        type: Sequelize.TEXT,
      },
      descriptionHTML: {
        type: Sequelize.TEXT,
      },
      image: {
        type: Sequelize.BLOB('long'),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Clinics')
  },
}
