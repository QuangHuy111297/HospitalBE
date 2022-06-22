import { reject } from 'bcrypt/promises'
import userService from '../services/userService'

let handleLogin = async (req, res) => {
  let email = req.body.email
  let password = req.body.password

  //   check email
  // compare password
  //   return userInfo
  //   accessToken (JWT)

  if (!email || !password) {
    return res.status(500).json({ errCode: 1, message: 'Missing inputs' })
  }

  let userData = await userService.handleUserLogin(email, password)

  return res.status(200).json({
    errCode: userData.errCode,
    message: userData.errMessage,
    user: userData.user ? userData.user : {},
  })
}

let handleGetAllUsers = async (req, res) => {
  let id = req.query.id //All, id

  if (!id) {
    return res.status(200).json({
      errCode: 1,
      message: 'Missing required parameters',
      users: [],
    })
  }

  let users = await userService.getAllUsers(id)

  return res.status(200).json({
    errCode: 0,
    message: 'Ok',
    users,
  })
}

let handleCreateNewUser = async (req, res) => {
  let message = await userService.createNewUser(req.body)
  return res.status(200).json(message)
}

let handleDeleteUser = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      message: 'Missing required parameters!',
    })
  }
  let message = await userService.deleteNewUser(req.body.id)
  return res.status(200).json({ message })
}

let handleEditUser = async (req, res) => {
  let data = req.body
  let message = await userService.updateUserData(data)
  return res.status(200).json({ message })
}

let getAllCode = async (req, res) => {
  try {
    let data = await userService.getAllCodeService(req.query.type)
    return res.status(200).json(data)
  } catch (e) {
    console.log('Get all code error', e)
    return res.status(200).json({
      errCode: -1,
      message: 'Error from server',
    })
  }
}

module.exports = {
  handleLogin: handleLogin,
  handleGetAllUsers: handleGetAllUsers,
  handleCreateNewUser: handleCreateNewUser,
  handleEditUser: handleEditUser,
  handleDeleteUser: handleDeleteUser,
  getAllCode: getAllCode,
}
