# Scrapper README ![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)

> Short instruction how to run scrapper

Use pupetter to retrieve data from any site

## Run

1. Run TOR docker image, in tor image create shell script, eg. `watch` linux command to restart tor service periodically, use command `pkill -sighup tor`
2. Run script

```js
node .\pararel.js 1400 1499
```

3. In main() function list Tor SOCKS ports that we defined in torrc file

```js
const ports = [
  '9060',
  '9062',
  '9064',
  '9066',
  '9053',
  '9054',
  '9052',
  '9056',
  '9058',
  '9059',
];
```
