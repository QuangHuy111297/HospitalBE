'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        //   email: DataTypes.STRING,
        // password: DataTypes.STRING,
        // firstName: DataTypes.STRING,
        // lastName: DataTypes.STRING,
        // address: DataTypes.STRING,
        // phonenumber: DataTypes.STRING,
        // gender: DataTypes.BOOLEAN,
        // image: DataTypes.STRING,
        // roleId: DataTypes.STRING,
        // positionId: DataTypes.STRING,
        email: 'admin@gmail.com',
        password: '123123',
        firstName: 'Quang',
        lastName: 'Huy',
        address: 'USA',
        phoneNumber: '0901379146',
        gender: 1,
        image: '',
        roleId: 'ROE',
        positionId: 'R1',

        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
}
