const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../assets/images');
const outputFile = path.join(__dirname, '../assets/data/products.json');

const categoryMap = {
    'Accessoire': 'إكسسوارات',
    'Bande medical': 'صحة',
    'Cuisine': 'مطبخ',
    'M electronique': 'إلكترونيات',
    'Patrie parfum': 'عطور',
    'sac': 'حقائب'
};

const products = [];
let idCounter = 1;

function cleanName(filename) {
    // Remove extension
    let name = path.parse(filename).name;
    // Remove common clutter found in filenames
    name = name.replace(/_/g, ' ')
        .replace(/\./g, ' ')
        .replace(/ D$/, '') // trailing D
        .replace(/ D /, ' ')
        .replace(/\d+,\d+/, '') // Remove prices like 100,00
        .replace(/\s+/g, ' ')
        .trim();
    return name;
}

// Read directories
try {
    const dirs = fs.readdirSync(imagesDir);

    dirs.forEach(dir => {
        const dirPath = path.join(imagesDir, dir);
        if (fs.statSync(dirPath).isDirectory()) {
            if (!categoryMap[dir]) return; // Skip unknown folders

            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
                    products.push({
                        id: idCounter++,
                        name: cleanName(file),
                        category: categoryMap[dir],
                        image: `assets/images/${dir}/${file}`,
                        short_description: `منتج عالي الجودة من فئة ${categoryMap[dir]}`
                    });
                }
            });
        }
    });

    fs.writeFileSync(outputFile, JSON.stringify(products, null, 2));
    console.log(`Successfully generated ${products.length} products to ${outputFile}`);

} catch (err) {
    console.error('Error generating products:', err);
}
