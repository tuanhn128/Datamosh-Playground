if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const formidable = require('formidable')
const port = process.env.PORT || 3000

const fs = require('fs')
const rimraf = require('rimraf')
const path = require('path')

app.set('views', path.join(__dirname, "../views"))
app.set("view engine", "hbs")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const pFrameDupe = require('./utils/p-frame-dupe')
const iFrameDelete = require('./utils/i-frame-delete')
const vid = require('./utils/vid')

/* Function to convert timestamp inputs into decimal number of seconds */
const convToSecs = (min, sec, ms) => {
    result = parseInt(min) * 60 + parseInt(sec)
    /* Convert to string and add terminal 0's to milliseconds */
    while (ms.length < 3) {
        ms += '0'
    }
    return result + parseInt(ms) / 1000
}

/* Function to generate random unique id. Taken from: https://gist.github.com/gordonbrander/2230317 */
const getMoshID = () => {
    return '_' + Math.random().toString(36).substr(2, 9)
}

app.get('/', (req, res) => {
    res.render('home')
})

/** TODO: ERROR CHECKING ON INPUTS **/
app.post('/pdupe', async (req, res) => {
    try {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
            if (err) {
                throw err
            }

            /* Create a temp folder which will hold intermediate files and will be deleted afterwards */
            moshID = getMoshID()
            console.log(moshID)
            const tmpPath = path.join(__dirname, '../tmp-' + moshID)
            await fs.promises.mkdir(tmpPath)

            /* Handle inputs of form */
            const inDir = files.vid_file.path
            const resultDir = path.join(tmpPath, moshID + '_result.avi')
            const loopStart = convToSecs(fields.loop_start_min, fields.loop_start_sec, fields.loop_start_ms)
            const loopEnd = convToSecs(fields.loop_end_min, fields.loop_end_sec, fields.loop_end_ms)
            const numLoops = fields.num_loops
    
            /* Perform p-Frame duplication */
            await pFrameDupe(inDir, resultDir, tmpPath, moshID, loopStart, loopEnd, numLoops)

            /* Download file and delete the entire temp folder afterwards in the callback */
            res.download(resultDir, (err) => {
                if (err) {
                    throw err
                }
                rimraf.sync(tmpPath)
            })
        })
    } catch (e) {
        res.send(e)
        console.error('ERROR: ', e)
    }    
})

app.post('/idelete', async (req, res) => {
    try {
        new formidable.IncomingForm().parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err)
                throw err
            }

            /* Create a temp folder which will hold intermediate files and will be deleted afterwards */
            moshID = getMoshID()
            console.log(moshID)
            const tmpPath = path.join(__dirname, '../tmp-' + moshID)
            await fs.promises.mkdir(tmpPath)

            /* Handle inputs of form */
            const inDir = files.vid_file.path
            const resultDir = path.join(tmpPath, moshID + '_result.avi')

            /* Perform i-frame deletion */
            await iFrameDelete(inDir, resultDir, tmpPath, moshID, process.env.FFPROBE_PATH)

            /* Download file and delete the entire temp folder afterwards in the callback */
            res.download(resultDir, (err) => {
                if (err) {
                    throw err
                }
                rimraf.sync(tmpPath)
            })
        })
    } catch (e) {
        res.send(e)
        console.error('ERROR: ', e)
    }
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})