require('colors');
const readlineSync = require('readline-sync');

const showPrompt = () => {
    /* showPrompt: Ask the user to choose from Dev Mode and Production Mode
     *
     * Dev Mode: The structure of the database will be rebuilt
     * Production Mode: The date in database will not be erased
     */

    if (process.argv[2] == 'dev') {
        let szAns = readlineSync.question(
            'Are you sure to switch to' + ' DEV '.red + 'mode? It will' + ' erase '.red + 'the database!(y/n)');
        if (szAns == 'y') {
            process.env.NODE_ENV = 'dev';
            console.log('Development Mode'.red + '. Be care.');
        } else {
            process.env.NODE_ENV = 'prod';
            console.log('Production Mode'.green + '. Everything will be fine.');
        }
    } else {
        process.env.NODE_ENV = 'prod';
        console.log('Production Mode'.green + '. Everything will be fine.');
    }
};

module.exports = {
    showPrompt: showPrompt
};
