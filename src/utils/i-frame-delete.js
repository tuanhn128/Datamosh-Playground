const extractKeyframes = require('extract-keyframes')
const vid = require('./vid')
const path = require('path')
const fs = require('fs')

// const iFrameDelete = async (inDir, resultDir, tmpPath, moshID) => {
//     try {
//         const aviDir = path.join(tmpPath, moshID + "_max_int.avi")
//         await vid.convertToAvi(inDir, aviDir)

//         let keyFrames = []
//         const extractionProcess = await extractKeyframes(aviDir)
//         extractionProcess.on('start', () => {
//             console.log('Started')
//         })

//         extractionProcess.on('finish', () => {
//             console.log('Finished')
//         })
//     } catch (e) {
//         console.log(e)
//     }
// }

const iFrameDelete = async (inDir, resultDir, tmpPath, moshID) => {
    console.log('Test')
    const aviDir = path.join(tmpPath, moshID + "_max_int.avi")
    await vid.convertToAvi(inDir, aviDir)
    extractKeyframes(aviDir).then(extractionProcess => {
        extractionProcess.on('start', () => {
            console.log('Started')
        }, false)
    })
}

module.exports = iFrameDelete