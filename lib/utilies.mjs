import {writeFileSync, existsSync, mkdirSync} from 'fs';

const writeToFile = (filepath, data, opts) => {
    const defaults = {
        'encoding': 'utf8'
    };

    const options = Object.assign(defaults, opts);
    writeFileSync(filepath, data, options);
};

const safeCreateFolder = (path) => {
    if (!existsSync(path)) {
        mkdirSync(path);
    }

    return true;
};

export {writeToFile, safeCreateFolder}