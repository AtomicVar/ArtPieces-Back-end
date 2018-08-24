import { database, Artwork, User } from './model';
import finale from 'finale-rest';
import { safeLaunch } from './misc';
import restify from 'restify';

const app = restify.createServer();

app.use(restify.plugins.queryParser());
app.use(restify.plugins.bodyParser());

/* Launch the server safely. */
safeLaunch();

finale.initialize({
    app: app,
    sequelize: database,
});

finale.resource({
    model: User,
    endpoints: ['/users', '/users/:email'],
});

finale.resource({
    model: Artwork,
    endpoints: ['/artworks', '/artworks/:id'],
});

app.listen(3000, () => {
    console.log('OK');
});
