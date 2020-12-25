// const ffmpeg = require('fluent-ffmpeg')
const { FFmpeg, ffprobe, ffprobeSync } = require("kiss-ffmpeg");
const path = require('path')
const fs = require('fs');

/* Converts video file to an avi file with large key frame interval 
   (video format conducive for glitching) */
const convertToAvi = (inDir, outDir) => {
    const maxGOP = 999999 // Arbitrarily large Key Frame Interval
    return new Promise((resolve, reject) => {
        // ffmpeg(inDir)
        //     .videoCodec('libxvid')
        //     .output(outDir)
        //     .outputOptions('-g ' + maxGOP)
        //     .on('error', (err) => {
        //         reject(err)
        //     })
        //     .on('end', () => {
        //         resolve()
        //     })
        //     .run()
        new FFmpeg({
            inputs: inDir,
            outputs: {
                url: outDir,
                options: '-c:v libxvid -g ' + maxGOP
            }
        })
        .on('error', (proc, err) => {
            reject(err);
        })
        .on('end', () => {
            console.log('conversion to avi successful')
            resolve()
        })
        .run()
    })
}

/* Clips the video file at inDir, starting at inTime and ending at outTime.
   And puts the resulting clip at outDir. The video is clipped using stream copy
   and copyinkf, so it copies non-keyframes at the beginning (essential for datamoshing). */
const clipVideo = (inDir, outDir, inTime, outTime) => {
    return new Promise((resolve, reject) => {
        // let clip = ffmpeg(inDir)
        // if (inTime != null) {
        //     clip.seek(inTime)
        // }
        // if (outTime != null) {
        //     clip.inputOptions('-to ' + outTime.toString())
        // }
        // clip.output(outDir)
        //     .videoCodec('copy')
        //     .audioCodec('copy')
        //     .outputOptions('-copyinkf')
        //     .on('error', (err) => {
        //         reject(err)
        //     })
        //     .on('end', () => {
        //         resolve()
        //     })
        //     .run()
        let clip = new FFmpeg({
            inputs: {
                url: inDir,
            },
            outputs: {
                url: outDir,
                options: '-c:v copy -c:a copy -copyinkf'
            }
        })
        if (inTime != null) {
            clip.outputs.options += ' -ss ' + inTime.toString()
        }
        if (outTime != null) {
            clip.inputs.options = '-to ' + outTime.toString()
        }
        clip
        .on('error', (proc, err) => {
            reject(err);
        })
        .on('end', () => {
            console.log('clipping successful')
            resolve()
        })
        .run()
    })
}

/* Takes in an array of strings which refer to paths to video files. 
   Concatenates those videos stream copy and copyinkf. */
const concatVids = (dirList, outDir) => {
    var concatString = 'concat:' + dirList[0]
    for (let i = 1; i < dirList.length; i++) {
        concatString += '|' + dirList[i]
    }
    return new Promise((resolve, reject) => {
        // ffmpeg(concatString)
        // .output(outDir)
        // .videoCodec('copy')
        // .audioCodec('copy')
        // .on('error', (err) => {
        //     reject(err)
        // })
        // .on('end', () => {
        //     resolve()
        // })
        // .run()
        new FFmpeg({
            inputs: concatString,
            outputs: {
                url: outDir,
                options: '-c copy'
            }
        })
        .on('error', (proc, err) => {
            reject(err);
        })
        .on('end', () => {
            console.log('concatenation successful')
            resolve()
        })
        .run()
    })
}

const getIFrameInfo = async (inDir, ffprobePath) => {
    frameInfo = await ffprobe(inDir, {
        command: ffprobePath,
        select_streams: 'v',
        show_frames: null,
        show_entries:'frame=pict_type',
    })
    const secondsPerFrame = frameInfo.streams[0].duration / frameInfo.frames.length
    let iFrameTimestamps = []
    for (i = 0; i < frameInfo.frames.length; i++) {
        if (frameInfo.frames[i].pict_type == 'I') {
            iFrameTimestamps.push(i * secondsPerFrame)
        } 
    }
    return {
        timestamps: iFrameTimestamps,
        secondsPerFrame: secondsPerFrame
    }
}

module.exports = {
    convertToAvi: convertToAvi,
    clipVideo: clipVideo,
    concatVids: concatVids,
    getIFrameInfo: getIFrameInfo,
}