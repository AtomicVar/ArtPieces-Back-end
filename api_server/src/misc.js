import 'colors';
import { question } from 'readline-sync';
import { database } from './model';

const safeLaunch = () => {
    /* safeLaunch: Ask the user to choose from Dev Mode and Production Mode
     *
     * Dev Mode: The structure of the database will be rebuilt
     * Production Mode: The data in database will not be erased
     */

    if (process.argv[2] == 'dev') {
        let ans = question(
            'Are you sure to switch to' +
                ' DEV '.red +
                'mode? It will' +
                ' erase '.red +
                'the database!(y/n)'
        );
        if (ans == 'y') {
            console.log('Development Mode'.red + '. Be care.');
            database.sync({ force: true });
            return;
        }
    }

    console.log('Production Mode'.green + '. Everything will be fine.');
    database.sync();
};

export { safeLaunch };
