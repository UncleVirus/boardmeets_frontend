# BoardMeet + Angular

\_\_author: Valens NSENGIMANA

This is the project to facilitate the board members to collaborate and conduct the meetings also to help members to be able to perform all other tasks related to the board members within organization.

## Get started

### Clone the repo

```shell
git clone https://github.com/coseke/boardmeets_frontend.git
cd boardmeets_frontend
```

### Install npm packages

Install the `npm` packages described in the `package.json` and verify that it works:

```shell
npm install
npm start
```

The `npm start` command builds (compiles TypeScript and copies assets) the application into `dist/`, watches for changes to the source files, and runs `lite-server` on port `3000`.

Shut it down manually with `Ctrl-C`.

Access the application on web browser `http://localhost:4200/`

#### npm scripts

These are the most useful commands defined in `package.json`:

- `npm start` - runs the TypeScript compiler, asset copier, and a server at the same time, all three in "watch mode".
- `npm run build` - runs the TypeScript compiler and asset copier once.
- `npm run build:watch` - runs the TypeScript compiler and asset copier in "watch mode"; when changes occur to source files, they will be recompiled or copied into `dist/`.
- `npm run lint` - runs `tslint` on the project files.
- `npm run serve` - runs `lite-server`.

These are the test-related scripts:

- `npm test` - builds the application and runs tests (both unit and functional) one time.
- `npm run ci` - cleans, lints, and builds the application and runs tests (both unit and functional) one time.

# Boardmeets deployment

- `Provider` - Hostgator [read more about hostgator](https://www.hostgator.com/)
- `access url` - Hostgator [click here to open the app](https://cosekeeboard.com/)

- Deployment process

  - `npm run build --prod`
  - Upload files in dist folder created by above command
  - Paste the files in public_html folder in cpanel
  - Access the application.
