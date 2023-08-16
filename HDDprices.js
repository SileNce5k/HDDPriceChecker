const fs = require('fs');
function roundToQuarter(number) {
    return Math.round(number * 4) / 4;
}
function addPricePerTB(filePath){
    let data = fs.readFileSync(filePath, 'utf-8')
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        const hardDrives = JSON.parse(data);
        for (let drive of hardDrives) {
            const pricePerTB = drive.price / drive.size;
            drive.pricePerTB = parseFloat(roundToQuarter(pricePerTB).toFixed(2));
        }
        const outputData = JSON.stringify(hardDrives, null, 4);
        fs.writeFile(filePath, outputData, (err) => {
            if (err) {
                console.error('Error writing to the file:', err);
                return;
            }
            console.log(`Updated hard drives data saved to ${filePath}`);
        });
}
module.exports = {
    addPricePerTB
}