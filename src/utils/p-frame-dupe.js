const vid = require('./vid')
const path = require('path')
const fs = require('fs')

const pFrameDupe = async (inDir, resultDir, tmpPath, moshID, loopStart, loopEnd, numLoops) => {
    try {
        /* Convert original video to an avi with a large keyframe interval */
        const aviDir = path.join(tmpPath, moshID + "_max_int.avi")
        await vid.convertToAvi(inDir, aviDir)

        /* Split video into 3 parts: before the glitch, the frames which will be glitched/looped, and
           after the glitch */
        const preGlitchDir = path.join(tmpPath, moshID + "_pre_glitch.avi")
        await vid.clipVideo(aviDir, preGlitchDir, null, loopStart)
        const glitchFramesDir = path.join(tmpPath, moshID + "_glitch_frames.avi")
        await vid.clipVideo(aviDir, glitchFramesDir, loopStart, loopEnd)
        const postGlitchDir = path.join(tmpPath, moshID + "_post_glitch.avi")
        await vid.clipVideo(aviDir, postGlitchDir, loopEnd, null)

        /* Create a list of the directories of these video parts, looping the glitched frames numLoops
           times */
        let dirList = [preGlitchDir]
        for (let i = 0; i < numLoops; i++) {
            dirList.push(glitchFramesDir)
        }
        dirList.push(postGlitchDir)

        /* Concatenate this array of video directories. Producing a glitched "bloom" effect at the time
           of the looped frames */
        await vid.concatVids(dirList, resultDir)
    } catch (e) {
        console.log(e)
    }
}

module.exports = pFrameDupe