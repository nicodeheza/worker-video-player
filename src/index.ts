import MP4Box from 'mp4box'

const file = MP4Box.createFile()
console.log(file)
console.log(file.getTrackById(0))
