# Micrungeon [![Build Status](https://travis-ci.org/blackjack26/micrungeon.svg?branch=develop)](https://travis-ci.org/blackjack26/micrungeon)

## Set Up

### Clone Repository

Navigate into your workspace directory and run:

```sh
git clone https://github.com/blackjack26/micrungeon.git
```

### Install NodeJS and NPM

https://nodejs.org/en/

### Install Dependencies

Navigate to the cloned repo's directory and install dependencies:

```sh
cd /path/to/micrungeon
npm install
```

### Run the Development Server

The development server allows you to run the game in a browser. It also provides live-reloading for quicker development when files are changed.

Run the following command:

```sh
npm start
```

This should compile the source code to the `dev/` directory and open your browser to `localhost:3000`. If not, open your browser and navigate to `http://localhost:3000`.

### Build Production Code

To optimize and minimize the code for production deployment, run:

```sh
npm run deploy
```

The output of this command is in the `app/` directory. This command also creates an `.exe` file to install the game as a desktop app. This is located in the `build/dist` directory.

### Test & Documentation

To verify your code run:

```sh
npm test
```

To generate documentation based on the JSDoc comments, run:

```sh
npm run doc
```

## License

Micrungeon is released under the [MIT License](https://github.com/blackjack26/micrungeon/blob/develop/LICENSE)

## Authors

[Jack Grzechowiak](https://github.com/blackjack26)

[Phil Kirwin](https://github.com/philkir22)
