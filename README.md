# Create Npm Package

> Note that you will need to use npm 6 or higher.

Run:

```
npm i -g npm
```

To install latest version of `npm`

## Usage


### Interactive mode
```
npx @achavarriafh/create-npm-package
```
##### Or using npm init
```
npm init @achavarriafh/npm-package
```

### Command mode

```
npx @achavarriafh/create-npm-package <projectName>
```
Example:
```
npx @achavarriafh/create-npm-package my-first-package
```
##### Or using npm init
```
npm init @achavarriafh/npm-package <projectName>
```
Example:

```
npm init @achavarriafh/npm-package my-first-package
```

### Using a proxy

If you are behind a proxy, configure `https_proxy` environment variable.

## Built-in starters

- Default [library](https://github.com/amurilloFH/npm-package-template) template

## Developing locally

If you want to add features, clone this repo, open terminal:

#### Install dependencies

```bash
npm install
```

Then, compile and run the starter:

```bash
npm run dev
```

And it will help you test out your changes.


## Citations

Created by Alexander Chavarria:
* [github/AchavarriaFH](https://github.com/achavarriafh)


Forked from Create Stencil App:
* [github/ionic-team/create-stencil](https://github.com/ionic-team/create-stencil)



## License
* MIT