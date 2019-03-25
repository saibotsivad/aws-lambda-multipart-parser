const getValueIgnoringKeyCase = (object, key) => {
    const foundKey = Object
        .keys(object)
        .find(currentKey => currentKey.toLocaleLowerCase() === key.toLowerCase())
    return object[foundKey]
}

const getBoundary = headers => getValueIgnoringKeyCase(headers, 'Content-Type').split('=')[1]

const getBody = (isBase64Encoded, body) => isBase64Encoded
    ? Buffer.from(body, 'base64').toString('binary')
    : body

/**
 * @typedef {Object} MultipartFile
 * @property {String} fieldName - Form field name as it appears on the request.
 * @property {Buffer} file - The fully-realized file object.
 * @property {String} fileName - The original provided name of the file.
 * @property {String} mimeType - The MIME type of the file.
 */

/**
 * @typedef {Object} MultipartField
 * @property {String} name - Form field name as it appears on the request.
 * @property {String} value - The value of the entry.
 */

/**
 * @typedef {Object} MultipartForm
 * @property {Array.<MultipartField>} fields - The list of all fields parsed from the body.
 * @property {Array.<MultipartFile>} files - The list of all files parsed from the body.
 */

/**
 * Parses the headers of a multipart POST request.
 *
 * @param {Object} headers - The HTTP request headers, containing the 'Content-Type' property.
 * @param {String|Buffer} body - The HTTP request body from the Lambda event.
 * @param {Boolean} isBase64Encoded - The Lambda event will tell you if the body is Base64 encoded or not.
 * @returns {MultipartForm} The parsed multipart form data.
 */
module.exports = ({ headers, body, isBase64Encoded }) => getBody(isBase64Encoded, body)
    .split(getBoundary(headers))
    .reduce(({ fields, files }, item) => {
        if (/filename=".+"/g.test(item)) {
            const fieldName = item.match(/name=".+";/g)[0].slice(6, -2)

            const contentTypeStartIndex = item.search(/Content-Type:\s.+/g)
            const contentTypeEndIndex = item.match(/Content-Type:\s.+/g)[0].length
            const content = item.slice(contentTypeStartIndex + contentTypeEndIndex + 4, -4)

            files.push({
                fieldName,
                file: content,
                fileName: item.match(/filename=".+"/g)[0].slice(10, -1),
                mimeType: item.match(/Content-Type:\s.+/g)[0].slice(14)
            })
        } else if (/name=".+"/g.test(item)) {
            const fieldName = item.match(/name=".+"/g)[0].slice(6, -1)

            fields.push({
                name: fieldName,
                value: item.slice(item.search(/name=".+"/g) + item.match(/name=".+"/g)[0].length + 4, -4)
            })
        }
        return { fields, files }
    }, { fields: [], files: [] })
