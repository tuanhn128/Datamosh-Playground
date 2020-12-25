const vid = require('./vid')
const path = require('path')
const fs = require('fs')

const iFrameDelete = async (inDir, resultDir, tmpPath, moshID, ffprobePath) => {
    /* Convert original video to an avi with a large keyframe interval */
    // const aviDir = path.join(tmpPath, moshID + "_max_int.avi")
    const aviDir = 'vids/fly_avi_test2.avi'
    await vid.convertToAvi(inDir, aviDir)

    /* Get indices of all i-frames*/
    const iFrameInfo = await vid.getIFrameInfo(aviDir, ffprobePath)
    console.log(iFrameInfo.secondsPerFrame)
    console.log(iFrameInfo.timestamps)

    const firstCutDir = path.join(tmpPath, moshID + "cut0.avi")
    const firstCut = await vid.clipVideo(aviDir, firstCutDir, null, iFrameInfo.timestamps[1])
    let dirList = [firstCutDir]
    for (let i = 1; i < iFrameInfo.timestamps.length; i++) {
        let outTimestamp = null
        if (i != iFrameInfo.timestamps.length - 1) {
            outTimestamp = iFrameInfo.timestamps[i + 1]
        }
        currCutDir = path.join(tmpPath, moshID + "cut" + i.toString() + ".avi")
        dirList.push(currCutDir)
        currCut = await vid.clipVideo(aviDir, currCutDir, iFrameInfo.timestamps[i] + iFrameInfo.secondsPerFrame, iFrameInfo.timestamps[i + 1])
    }
    console.log(dirList)

    await vid.concatVids(dirList, resultDir)
}

module.exports = iFrameDelete