import fs from 'fs';
import csv from 'csv-parser';

const results = [];

const allowedTypes = ["Town", "Village", "City", "Community", "Locality"];

fs.createReadStream('./Nova_Scotia_GeoNAMES.csv')
  .pipe(csv({
    mapHeaders: ({ header }) => header.trim() // remove spaces
  }))
  .on('data', (data) => {
    // Normalize GENERIC_TM: remove anything in parentheses
    const type = data.GENERIC_TM.replace(/\s*\(.*\)/, '').trim();
    if (allowedTypes.includes(type)) {
      results.push({
        name: data.GEONAME,
        lat: parseFloat(data.NAD83_LAT),
        lng: parseFloat(data.NAD83_LON)
      });
    }
  })
  .on('end', () => {
    fs.writeFileSync('nova_scotia_towns.json', JSON.stringify(results, null, 2));
    console.log(`Done! JSON file created with ${results.length} places.`);
  });
