# Micrungeon [![Build Status](https://travis-ci.org/blackjack26/micrungeon.svg?branch=develop)](https://travis-ci.org/blackjack26/micrungeon)

A game made for [Game Off 2018](https://itch.io/jam/game-off-2018) to incorporate the "Hybrid" theme.

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
npm run dev
```

This should compile the source code to the `dev/` directory and open your browser to `localhost:3000`. If not, open your browser and navigate to `http://localhost:3000`.

### Build Production Code

To optimize and minimize the code for production deployment, run:

```sh
npm run deploy
```

The output of this command is in the `build/` directory.

If you want to view the production deployment you can use `http-server` for a quick way to serve the files:

```sh
npm i -g http-server
cd /path/to/micrungeon
http-server ./build -p 8081
```

Then navigate to `http://localhost:8081` to view.

## License

Micrungeon is released under the [MIT License](https://github.com/blackjack26/micrungeon/blob/develop/LICENSE)

## Authors

[Jack Grzechowiak](https://github.com/blackjack26)

[Phil Kirwin](https://github.com/philkir22)
