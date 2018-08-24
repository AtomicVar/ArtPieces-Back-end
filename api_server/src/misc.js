import 'colors';
import { question } from 'readline-sync';
import { database } from './model';

const safeLaunch = () => {
    /* showPrompt: Ask the user to choose from Dev Mode and Production Mode
     *
     * Dev Mode: The structure of the database will be rebuilt
     * Production Mode: The date in database will not be erased
     */

    if (process.argv[2] == 'dev') {
        let answer = question(
            'Are you sure to switch to' +
                ' DEV '.red +
                'mode? It will' +
                ' erase '.red +
                'the database!(y/n)'
        );
        if (answer == 'y') {
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

    if (process.env.NODE_ENV == 'dev') {
        database.sync({ force: true });
    } else {
        database.sync();
    }
};

export { safeLaunch };
