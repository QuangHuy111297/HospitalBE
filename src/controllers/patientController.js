import patientService from '../services/patientService'

let postBookAppointment = async (req, res) => {
  try {
    let info = await patientService.postBookAppointment(req.body)
    return res.status(200).json(info)
  } catch (e) {
    console.log(e)
    return res.status(400).json({
      errCode: -1,
      message: 'Error from server ...',
    })
  }
}

let postVerifyBookAppointment = async (req, res) => {
  try {
    let info = await patientService.postVerifyBookAppointment(req.body)
    return res.status(200).json(info)
  } catch (e) {
    console.log(e)
    return res.status(400).json({
      errCode: -1,
      message: 'Error from server ...',
    })
  }
}

module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
}
