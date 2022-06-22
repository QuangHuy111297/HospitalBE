import db from '../models/index'
require('dotenv').config()
import _ from 'lodash'
import emailService from '../services/emailService'

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE

let getTopDoctorHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: { roleId: 'R2' },
        order: [['createdAt', 'DESC']],
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: db.Allcode,
            as: 'positionData',
            attributes: ['valueEn', 'valueVi'],
          },
          {
            model: db.Allcode,
            as: 'genderData',
            attributes: ['valueEn', 'valueVi'],
          },
        ],
        raw: true,
        nest: true,
      })

      resolve({
        errCode: 0,
        data: users,
      })
    } catch (e) {
      reject(e)
    }
  })
}

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: 'R2' },
        attributes: {
          exclude: ['password', 'image'],
        },
      })

      resolve({
        errCode: 0,
        data: doctors,
      })
    } catch (e) {
      reject(e)
    }
  })
}

let checkRequiredFields = (inputData) => {
  let arrFields = [
    'doctorId',
    'contentHTML',
    'contentMarkdown',
    'action',
    'selectedPrice',
    'selectedPayment',
    'selectedProvince',
    'addressClinic',
    'note',
    'specialtyId',
    'clinicId',
  ]
  let isValid = true
  let element = ''
  for (let i = 0; i < arrFields.length; i++) {
    if (!inputData[arrFields[i]]) {
      isValid = false
      element = arrFields[i]
      break
    }
  }
  return {
    isValid: isValid,
    element: element,
  }
}

let saveDetailInfoDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObj = checkRequiredFields(inputData)
      if (checkObj.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameter: ${checkObj.element}`,
        })
      } else {
      }

      // upsert to Doctor info
      let doctorInfo = await db.Doctor_Info.findOne({
        where: {
          doctorId: inputData.doctorId,
        },
        raw: false,
      })

      if (doctorInfo) {
        // update
        doctorInfo.doctorId = inputData.doctorId
        doctorInfo.priceId = inputData.selectedPrice
        doctorInfo.provinceId = inputData.selectedProvince
        doctorInfo.paymentId = inputData.selectedPayment
        doctorInfo.addressClinic = inputData.addressClinic
        doctorInfo.note = inputData.note
        doctorInfo.specialtyId = inputData.specialtyId
        doctorInfo.clinicId = inputData.clinicId

        await doctorInfo.save()
      } else {
        // create
        await db.Doctor_Info.create({
          doctorId: inputData.doctorId,
          priceId: inputData.selectedPrice,
          provinceId: inputData.selectedProvince,
          paymentId: inputData.selectedPayment,
          addressClinic: inputData.addressClinic,
          note: inputData.note,
          specialtyId: inputData.specialtyId,
          clinicId: inputData.clinicId,
        })
      }

      resolve({
        errCode: 0,
        errMessage: 'Save info doctor successfully',
      })
    } catch (e) {
      reject(e)
    }
  })
}

let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter',
        })
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ['password'],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ['description', 'contentHTML', 'contentMarkdown'],
            },
            {
              model: db.Allcode,
              as: 'positionData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Doctor_Info,
              attributes: {
                exclude: ['id', 'doctorId'],
              },
              include: [
                {
                  model: db.Allcode,
                  as: 'priceTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'provinceTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'paymentTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        })

        if (data && data.image) {
          data.image = Buffer.from(data.image, 'base64').toString('binary')
        }

        if (!data) data = {}

        resolve({
          errCode: 0,
          data: data,
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.formattedDate) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        })
      } else {
        let schedule = data.arrSchedule
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE
            return item
          })
        }
        // console.log('check data schedule', schedule)

        let existing = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: '' + data.formattedDate },
          attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
          raw: true,
        })

        // convert date
        // if (existing && existing.length > 0) {
        //   existing = existing.map((item) => {
        //     item.date = new Date(item.date).getTime()
        //     return item
        //   })
        // }

        let toCreate = _.differenceWith(schedule, existing, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date
        })

        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate)
        }

        resolve({
          errCode: 0,
          errMessage: 'OK',
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        })
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: { doctorId: doctorId, date: date },
          include: [
            {
              model: db.Allcode,
              as: 'timeTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.User,
              as: 'doctorData',
              attributes: ['firstName', 'lastName'],
            },
          ],
          raw: false,
          nest: true,
        })
        if (!dataSchedule) dataSchedule = []

        resolve({
          errCode: 0,
          data: dataSchedule,
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

let getInfoDoctorById = (idInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!idInput) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        })
      } else {
        let data = await db.Doctor_Info.findOne({
          where: {
            doctorId: idInput,
          },
          attributes: {
            exclude: ['id', 'doctorId'],
          },
          include: [
            {
              model: db.Allcode,
              as: 'priceTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Allcode,
              as: 'provinceTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Allcode,
              as: 'paymentTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
          ],
          raw: false,
          nest: true,
        })

        if (!data) data = {}
        resolve({
          errCode: 0,
          data: data,
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

let getProfileDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        })
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ['password'],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ['description', 'contentHTML', 'contentMarkdown'],
            },
            {
              model: db.Allcode,
              as: 'positionData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Doctor_Info,
              attributes: {
                exclude: ['id', 'doctorId'],
              },
              include: [
                {
                  model: db.Allcode,
                  as: 'priceTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'provinceTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'paymentTypeData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        })

        if (data && data.image) {
          data.image = Buffer.from(data.image, 'base64').toString('binary')
        }

        if (!data) data = {}

        resolve({
          errCode: 0,
          data: data,
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        })
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: 'S2',
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.User,
              as: 'patientData',
              attributes: ['email', 'lastName', 'address', 'gender'],
              include: [
                {
                  model: db.Allcode,
                  as: 'genderData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
            {
              model: db.Allcode,
              as: 'timeTypeDataPatient',
              attributes: ['valueEn', 'valueVi'],
            },
          ],
          raw: false,
          nest: true,
        })

        resolve({
          errCode: 0,
          data: data,
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.patientId ||
        !data.timeType ||
        !data.imgBase64
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        })
      } else {
        // update patient status
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: 'S2',
          },
          raw: false,
        })

        if (appointment) {
          appointment.statusId = 'S3'
          await appointment.save()
        }
        // send email
        await emailService.sendAttachMent(data)

        resolve({
          errCode: 0,
          errMessage: 'Ok',
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInfoDoctor: saveDetailInfoDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getInfoDoctorById: getInfoDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
}
