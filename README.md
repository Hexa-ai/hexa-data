<h1 align="center">Welcome to Hexa-Data 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.2.17-blue.svg?cacheSeconds=2592000" />
  <a href="https://www.gnu.org/licenses/" target="_blank">
    <img alt="License: AGPL--3.0" src="https://img.shields.io/badge/License-AGPL--3.0-yellow.svg" />
  </a>
</p>

> Backend Monitoring and data collection application dedicated to industrial applications

## Prerequisites

- node v16
- docker >= v20
- docker-compose

```sh
node -v && docker -v && docker-compose -v
```

## Install

```sh
chmod +x install.sh
./install.sh
```

## Usage

Go to the [application](http://localhost:3333)

## Run tests

```sh
node -r @adonisjs/assembler/build/register japaFile.ts
```
To exclude all tests using external services, notably for continuous integration, add the '-ci' argument
```sh
node -r @adonisjs/assembler/build/register japaFile.ts -ci
```

## Author

👤 **Julien Talbourdet**

* Website: www.hexa-ai.fr
* Github: [@jtalbourdet](https://github.com/jtalbourdet)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2023 [Julien Talbourdet](https://github.com/jtalbourdet).<br />
This project is [AGPL--3.0](https://www.gnu.org/licenses/) licensed.
