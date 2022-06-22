import db from '../models/index'
import bcrypt from 'bcryptjs'

const salt = bcrypt.genSaltSync(10)

let createNewUser = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPasswordFromBcrypt = await hashUserPassword(data.password)
      await db.User.create({
        email: data.email,
        password: hashPasswordFromBcrypt,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phoneNumber: data.phoneNumber,
        gender: data.gender === '1' ? true : false,
        roleId: data.roleId,
      })

      resolve('Ok! create a new user success')
    } catch (e) {
      reject(e)
    }
  })
}

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt)
      resolve(hashPassword)
    } catch (e) {
      reject(e)
    }
  })
}

let getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({ raw: true })
      resolve(users)
    } catch (e) {
      reject(e)
    }
  })
}

let getUserInfoById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: userId },
        raw: true,
      })

      if (user) {
        resolve(user)
      } else {
        resolve({})
      }
    } catch (e) {
      reject(e)
    }
  })
}

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: data.id },
      })
      if (user) {
        user.firstName = data.firstName
        user.lastName = data.lastName
        user.address = data.address
        user.phoneNumber = data.phoneNumber

        await user.save()

        let allUsers = await db.User.findAll()

        resolve(allUsers)
      } else {
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

let deleteUserById = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: userId },
      })

      if (user) {
        user.destroy()
      }

      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  createNewUser: createNewUser,
  getAllUser: getAllUser,
  getUserInfoById: getUserInfoById,
  updateUserData: updateUserData,
  deleteUserById: deleteUserById,
}
