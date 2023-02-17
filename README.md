# Hexa-Data

Monitoring and data collection platform dedicated to industrial applications

## Prerequisite

* Docker ( Version >= 20.0.0 )
* Bash

## Installation

Enter this command at the root of the directory

```./install.sh```
## Testing
To test the application, go to the /server directory and execute the command below

```
node -r @adonisjs/assembler/build/register japaFile.ts
```
To exclude all tests using external services, notably for continuous integration, add the '-ci' argument
```
node -r @adonisjs/assembler/build/register japaFile.ts -ci
```
## Documentation

- [Tags CSV export](Documentation/tagsExport.md)
- [MQTT data acquisition](Documentation/mqttDataAcquisition.md)
- [WARP10 data structure](Documentation/warp10DataStructure.md)

