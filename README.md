# Datamosh Playground

JavsScript program for programatically performing datamoshing.

Converts videos to `.avi` format and then manipulates the frames to perform both major types of datamoshing:
- `i-frame-delete.js` performs `i-frame deletion`, which produces glitchy transitions between scenes. 
- `p-frame-dupe.js` performs `p-frame duplication`, which produces a "bloom" looping effect.

Videos compressed into `.avi` contain three types of frames: i-frames, p-frames, and b-frames. I-frames, or key frames,
contain the full image's content. P-frames and b-frames do not, and they only contain differences in the picture from 
the previous and/or following frames.

Thus, the deletion of an i-frame leads to the following p-frames being applied to the wrong picture. This produces the
glitchy transition effect which works particularly well for stark scene changes which contain motion in the following scene,
as this motion gets applied to the previous scene.

P-frame duplication on the other hand, applies the same p-frame data to the same picture repeatedly. This time, a single
p-frame's transition is applied onto itself over and over, leading to the "bloom" effect.
