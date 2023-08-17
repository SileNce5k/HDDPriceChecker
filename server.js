const express = require('express');
const fs = require('fs');
const app = express();
const port = 3001;

function roundToQuarter(number) {
    return Math.round(number * 4) / 4;
}
function formatNumber(num, numberFormat = "nb-NO" , minFractionDigits = 0, maxFractionDigits = 2) {
    return new Intl.NumberFormat(numberFormat, {
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: maxFractionDigits
    }).format(num);
}
app.use(express.static('public'));


function currencyConverter(amount, fromCurrency, toCurrency) {
    const USDInNOK = 10.56;
    let convertedPrice;
    if(fromCurrency === "NOK" && toCurrency === "USD"){
        convertedPrice = amount / USDInNOK;
    }
    else if(fromCurrency === "USD" && toCurrency === "NOK"){
        convertedPrice = amount * USDInNOK;
    }
    return convertedPrice;

    
}



app.get('/', (req, res) => {
    
    
    fs.readFile('HDD.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the file.');
            return;
        }

        const hardDrives = JSON.parse(data);
        for (let drive of hardDrives) {
            const pricePerTB = drive.price / drive.size;
            drive.pricePerTB = roundToQuarter(pricePerTB).toFixed(2);
            drive.price = drive.price.toFixed(2);
            drive.pricePerTBUSD = roundToQuarter(currencyConverter(drive.pricePerTB, "NOK", "USD")).toFixed(2);
            drive.priceUSD = roundToQuarter(currencyConverter(drive.price, "NOK", "USD")).toFixed(2);
        }

        let html = `
        <html>
        <head>
            <link rel="stylesheet" type="text/css" href="/light.min.css">
        </head>
        <body>
            
        <h2>Hard Drives</h2>
        
        <table border="1" id="HDDPrices">
            <thead>
                <tr>
                    <th>Name</a></th>
                    <th>Price</a></th>
                    <th>Size</a></th>
                    <th>Price per TB</a></th>
                    <th>Price (USD)</a></th>
                    <th>Price per TB (USD)</a></th>
                    <th>URL</a></th>
                </tr>
            </thead>
            <tbody>
        
        </body>
        </html>
        `;

        for (let drive of hardDrives) {
            html += `
                <tr>
                    <td>${drive.name}</td>
                    <td>${formatNumber(drive.price)} kr</td>
                    <td>${drive.size} TB</td>
                    <td>${formatNumber(drive.pricePerTB)} kr</td>
                    <td>$${drive.priceUSD}</td>
                    <td>$${drive.pricePerTBUSD}</td> 
                    <td><a href="${drive.url}">here</a></td>
                </tr>
            `;
        }

        html += `
            </tbody>
        </table>
        `;


        html += `
        <h2>Add New Hard Drive</h2>
        <form action="/add" method="post">
            Name: <input type="text" name="name" required><br><br>
            Price: <input type="number" step="1" name="price"><br><br>
            Size (TB): <input type="number" step="1" name="size" required><br><br>
            URL: <input type="text" name="url" required><br><br>
            <input type="submit" value="Add Drive">
        </form>
        `;

        


        res.send(html);
    });
});

const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));

app.post('/add', (req, res) => {
    const newDrive = {
        name: req.body.name,
        price: parseFloat(req.body.price),
        size: parseFloat(req.body.size),
        url: [req.body.url]
    };

    fs.readFile('HDD.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the file.');
            return;
        }

        const hardDrives = JSON.parse(data);
        hardDrives.push(newDrive);
        

        fs.writeFile('HDD.json', JSON.stringify(hardDrives, null, 4), (err) => {
            if (err) {
                res.status(500).send('Error saving the new drive.');
                return;
            }

            res.redirect('/');
        });
    });
});


app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
