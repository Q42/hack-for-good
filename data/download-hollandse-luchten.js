const request = require('request');
const fs = require('fs');

const dataDir = "./downloaded-data/hollandse-luchten"

// Got from https://data.waag.org/api/holu/holukit/calibrated/recent?format=csv
// Extracted using `cat <file.csv> | cut -d, -f1 | pbcopy`
const ids = [
    'HLL_zps-08',
    'HLL_zps-07',
    'HLL_zps-03',
    'HLL_zps-01',
    'HLL_MUV_device_1339832',
    'HLL_MUV_device_1338445',
    '99',
    '98',
    '90',
    '9',
    '89',
    '87',
    '84',
    '83',
    '82',
    '80',
    '79',
    '77',
    '66',
    '63',
    '62',
    '61',
    '57',
    '55',
    '53',
    '50',
    '5',
    '42',
    '36',
    '30',
    '24',
    '23',
    '22',
    '217',
    '216',
    '215',
    '213',
    '212',
    '204',
    '20',
    '199',
    '195',
    '194',
    '193',
    '192',
    '191',
    '19',
    '189',
    '184',
    '181',
    '180',
    '179',
    '178',
    '176',
    '174',
    '173',
    '172',
    '166',
    '165',
    '164',
    '163',
    '162',
    '161',
    '160',
    '158',
    '156',
    '155',
    '154',
    '152',
    '151',
    '140',
    '14',
    '138',
    '137',
    '135',
    '133',
    '131',
    '130',
    '127',
    '126',
    '125',
    '123',
    '122',
    '121',
    '119',
    '115',
    '113',
    '110',
    '11',
    '108',
    '107',
    '106',
    '105',
    '103',
    '102',
    '101',
    '100',
    '10',
    '1',
];

downloadSensorData = (id) => {
    request(
        `https://data.waag.org/api/holu/holukit/calibrated/hourly?sensor_id=${id}&start=2020-01-01T00:00:01.000Z&end=2020-11-26T00:00:01.000Z&format=csv`,
        (err, res) => {
            if (err) {
                console.log(err)
            }
        }
    )
    .pipe(fs.createWriteStream(`${dataDir}/${id}.csv`))
    .on('close', () => {
        console.log(`Downloaded data for ${id}`);
    });
}

for (id of ids) {
    downloadSensorData(id);
}
