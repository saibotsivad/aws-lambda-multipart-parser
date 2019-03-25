const test = require('tape')
const parse = require('./index.js')

const headers = {
    'Content-Type': 'multipart/form-data; boundary=--------------------------383422778821846493144274'
}

const body = "----------------------------383422778821846493144274\r\nContent-Disposition: form-data; name=\"schoolId\"\r\n\r\nNAIA\r\n----------------------------383422778821846493144274\r\nContent-Disposition: form-data; name=\"dataSource\"\r\n\r\nstatcrew\r\n----------------------------383422778821846493144274\r\nContent-Disposition: form-data; name=\"dataGame\"\r\n\r\ngame1\r\n----------------------------383422778821846493144274\r\nContent-Disposition: form-data; name=\"dataTeam\"\r\n\r\nteam1\r\n----------------------------383422778821846493144274\r\nContent-Disposition: form-data; name=\"dataFile\"; filename=\"canvas_red.png\"\r\nContent-Type: image/png\r\n\r\nPNG\r\n\u001a\n\u0000\u0000\u0000\rIHDR\u0000\u0000\u0000\u0001\u0000\u0000\u0000\u0001\u0001\u0003\u0000\u0000\u0000%ÛVÊ\u0000\u0000\u0000\u0004gAMA\u0000\u0000±\u000büa\u0005\u0000\u0000\u0000 cHRM\u0000\u0000z&\u0000\u0000\u0000\u0000ú\u0000\u0000\u0000è\u0000\u0000u0\u0000\u0000ê`\u0000\u0000:\u0000\u0000\u0017pºQ<\u0000\u0000\u0000\u0006PLTEÿ\u0000\u0000ÿÿÿA\u001d4\u0011\u0000\u0000\u0000\u0001bKGD\u0001ÿ\u0002-Þ\u0000\u0000\u0000\u0007tIME\u0007ã\u0003\u0019\t81%&\u0007\u0000\u0000\u0000\nIDAT\b×c`\u0000\u0000\u0000\u0002\u0000\u0001â!¼3\u0000\u0000\u0000%tEXtdate:create\u00002019-03-25T14:56:49-05:00\bÙ\u0000\u0000\u0000%tEXtdate:modify\u00002019-03-25T14:56:49-05:00yÖa(\u0000\u0000\u0000\u0000IEND®B`\r\n----------------------------383422778821846493144274\r\nContent-Disposition: form-data; name=\"schoolId\"\r\n\r\nNOT-NAIA\r\n----------------------------383422778821846493144274--\r\n"

test('aws-multipart-parser', t => {
    const { fields, files } = parse({ headers, body })

    t.equal(fields.length, 5, 'there are the correct number of fields')
    t.deepEqual(fields, [{
        name: 'schoolId',
        value: 'NAIA'
    },{
        name: 'dataSource',
        value: 'statcrew'
    },{
        name: 'dataGame',
        value: 'game1'
    },{
        name: 'dataTeam',
        value: 'team1'
    },{
        name: 'schoolId',
        value: 'NOT-NAIA'
    }])

    t.equal(files.length, 1, 'there is only the one file')
    t.equal(files[0].fieldName, 'dataFile', 'it has the correct key')
    t.equal(files[0].fileName, 'canvas_red.png', 'it has the original file name')
    t.equal(files[0].mimeType, 'image/png', 'it has the correct mime type')
    t.equal(files[0].file.length, 275, 'it has the correct byte length')

    t.end()
})
