# CKUA Song Search

This is a web app for searching through the radio
station [CKUA](http://ckua.com)'s old playlist data and displaying charts of the
results over time. I have no affiliation with CKUA and they have not endorsed
this project in any way; I'm just a fan of their radio station who finds this
kind of thing interesting. If you enjoy CKUA's
programming, [please consider donating here](http://www.ckua.com/support/) so
that they can continue making it.

## Building and Running

This app requires PostgreSQL, Python 3, pip, and Node.JS. To install
dependencies and build the app, from the project root run:

    pip install -r requirements.txt
    yarn

Of course, you can replace `yarn` with `npm i` if you want. The app will assume
there is a database of songs available at `postgres://localhost:5432/ckua`; a
dump of such a database (current to May 14th, 2017) is provided in the file
`db.sql` and (assuming appropriate system privileges) the database can be
created and populated with the commands:

    npm run db-restore

Finally, the app can be started with:

    python app.py

...and then it should be available at `http://localhost:5000`!
