const formatDateString = dateString => {
    if (!dateString.match(/\d{2}\.\d{2}\.\d{4}/)) {
        throw new Error('Not correct string')
    }

    return dateString.split('.').reverse().join('-')
}

module.exports = {formatDateString}