import clinicService from '../services/clinicService'

let createClinic = async (req, res) => {
  try {
    let info = await clinicService.createClinic(req.body)
    return res.status(200).json(info)
  } catch (e) {
    console.log(e)
    return res.status(400).json({
      errCode: -1,
      message: 'Error from server ...',
    })
  }
}

let getAllClinic = async (req, res) => {
  try {
    let info = await clinicService.getAllClinic()
    return res.status(200).json(info)
  } catch (e) {
    console.log(e)
    return res.status(400).json({
      errCode: -1,
      message: 'Error from server ...',
    })
  }
}

let getDetailClinicById = async (req, res) => {
  try {
    let info = await clinicService.getDetailClinicById(req.query.id)
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
  createClinic: createClinic,
  getAllClinic: getAllClinic,
  getDetailClinicById: getDetailClinicById,
}
