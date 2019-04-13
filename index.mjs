import {searchAutotrader, extractAdverts} from './lib/autotrader';
import {writeToFile, safeCreateFolder} from './lib/utilies'

let searchOpts = {
    'postcode': 'cf54js',
    'make': 'FORD',
    'model': 'FOCUS',
    'aggregatedTrim': 'RS'
};

// @TODO: Refactor to not use globals
global.hasNewPage = true;
global.page = 1;

function saveAdvert(adverts) {
    const curPage = global.page - 1;
    const filepath = `${dirName}/page-${curPage}.json`;
    writeToFile(filepath, JSON.stringify(adverts));
    console.log(`Saved Adverts Page ${curPage} as ${filepath}`);
}

function handleNextPage () {
    if (global.hasNewPage) {
        processPage(dirName)
    }
}

function processPage() {
    searchOpts.page = global.page;
    searchAutotrader(searchOpts)
        .then(response => response.data)
        .then(extractAdverts)
        .then(saveAdvert)
        .then(handleNextPage)
        .catch(e => console.log(e));
}

const timeStamp = (new Date()).getTime();
const dirName = `./data/adverts-${timeStamp}`;
safeCreateFolder(dirName);
writeToFile(`${dirName}/data.json`, JSON.stringify({
    'timeStamp': timeStamp,
    'searchOptions': searchOpts
}));
processPage();