import axios from 'axios/lib/axios';
import cheerio from 'cheerio/lib/cheerio';

const searchAutotrader = opts => {
    global.hasNewPage = false;
    const base = 'https://www.autotrader.co.uk/car-search';

    const defaults = {
        'sort': 'sponsored',
        'radius': '1500'
    };

    Object.assign(defaults, opts);

    const params = Object.keys(defaults)
        .map( k => `${k}=${defaults[k]}`)
        .join('&');

    const fullurl = `${base}?${params}`;
    console.log(`Fetching: ${fullurl}`);
    return axios.get(fullurl);
};

const extractAdverts = html => {
    console.log(`Processing page ${global.page}`);
    const $ = cheerio.load(html);

    const next_page = $('.pagination--right__active');
    if (next_page) {
        global.hasNewPage = true;
        global.page = next_page.attr('data-paginate');
        console.log(`Found new page ${global.page}`);
    }

    let results = Array.from($('.search-page__result'))
        .map(res => {
            // General
            const id = $(res).attr('id');
            const advertType = $(res).find('article').attr('data-standout-type');
            const title = $(res).find('.listing-title > a').text();
            const keySpecsElements = $(res).find('.listing-key-specs > li');

            const keySpecs = Array.from(keySpecsElements)
                .map(spec => $(spec).text());

            // Pricing
            const price = $(res).find('.vehicle-price').text();
            let finance_price = $(res).clone().find('.finance-price')
                .children().remove().end().text().trim();
            const finance_type = $(res).find('.finance-label').text();

            // Location
            const location = $(res).find('.seller-location');
            const town = location.find('.seller-town').text();
            const distance = location.clone().children().remove().end()
                .text().replace('-','').trim();

            return {
                'id': id,
                'type': advertType === '' ? 'normal' : advertType,
                'date': (new Date()).getTime(),
                'title': title,
                // Keys specs are always in the same order
                'key-specs': {
                    // @TODO: Add regex to extract year/plate age into object
                    'age': keySpecs[0],
                    'shape': keySpecs[1],
                    'mileage': {
                        'string': keySpecs[2],
                        'value': Number(keySpecs[2].substr(0, keySpecs[2].length-6).replace(',',''))
                    },
                    'engine': keySpecs[3],
                    'horsepower': {
                        'string': keySpecs[4],
                        'value': Number(keySpecs[4].replace('bhp',''))
                    },
                    'transmission': keySpecs[5],
                    'fuel': keySpecs[6],
                },
                'price': {
                    'cash': {
                        'string': price,
                        'value': Number(price.substr(1).replace(',',''))
                    },
                    'finance': {
                        'price': {
                            'string': finance_price,
                            'value': Number(finance_price.substr(1).replace(',',''))
                        },
                        'type': finance_type
                    }
                },
                'location': {
                    'town': town,
                    'distance': {
                        'string': distance,
                        'value': Number(distance.substr(0, distance.length-11).replace(',',''))
                    }
                }
            };
        });

    return results;
};

export {searchAutotrader, extractAdverts};