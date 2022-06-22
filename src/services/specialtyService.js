const db = require('../models')

let createSpecialty = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        })
      } else {
        await db.Specialty.create({
          name: data.name,
          image: data.imageBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        })

        resolve({
          errCode: 0,
          errMessage: 'ok',
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

let getAllSpecialty = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Specialty.findAll({})
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = Buffer.from(item.image, 'base64').toString('binary')
          return item
        })
      }
      resolve({
        errCode: 0,
        errMessage: 'ok',
        data,
      })
    } catch (e) {
      reject(e)
    }
  })
}

let getDetailSpecialtyById = (inputId, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId || !location) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        })
      } else {
        let data = await db.Specialty.findOne({
          where: {
            id: inputId,
          },
          attributes: ['descriptionHTML', 'descriptionMarkdown'],
        })

        if (data) {
          // do something with the data
          let doctorSpecialty = []
          if (location === 'ALL') {
            doctorSpecialty = await db.Doctor_Info.findAll({
              where: { specialtyId: inputId },
              attributes: ['doctorId', 'provinceId'],
            })
          } else {
            // find by location
            doctorSpecialty = await db.Doctor_Info.findAll({
              where: { specialtyId: inputId, provinceId: location },
              attributes: ['doctorId', 'provinceId'],
            })
          }

          data.doctorSpecialty = doctorSpecialty
        } else data = {}

        resolve({
          errCode: 0,
          errMessage: 'ok',
          data,
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  getDetailSpecialtyById: getDetailSpecialtyById,
}
