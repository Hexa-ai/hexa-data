# WARP10 data structure


All metrics are stored in the open source [WARP10](https://www.warp10.io) database.

## Tokens

For each project Hexa-data creates a pair of WARP10 tokens for reading and writing data related to this project. These tokens have a lifespan of 24 hours and are renewed every day at 01:00 am.

Most of the time, tokens are automatically integrated into the user script by Hexa-data. This dynamic integration is managed on the backend side in order to maximize security and not expose these tokens.

### Token pair sample

```
[
    {
        "ident": "0906eaabb6f23c90",
        "params": {
            "owner": "3b8a4db4-d653-4aea-993c-681b7cb88cfe",
            "application": "hexaData",
            "issuance": 1638968172017000,
            "owners": [
                "3b8a4db4-d653-4aea-993c-681b7cb88cfe"
            ],
            "expiry": 1639054572017000,
            "type": "READ",
            "producers": [
                "3b8a4db4-d653-4aea-993c-681b7cb88cfe"
            ],
            "applications": [
                "hexaData"
            ],
            "labels": {
                "type": "globalInfo",
                "projectId": "1"
            }
        },
        "token": "mt1bQvcpmyqcg7Nz6ZJ9XxYPT0IV4Ac2OKTjvQeHoaNnZQDZOoLKggoJ.W_QZH5E9gEZk0Sv_g1q5wcDd8BGJvykgckMpXrmxHVA7g.FsztkaWJSPMhkWa2cVgXSXqDXFzvRvyYLmdsmOfeWWOyDi5PqRoMb2j5g21gGDMNA3D9i9JbV8r5RbN7bH_.Sw2x848JZA5dBoqZ"
    },
    {
        "ident": "67cdcee394f62827",
        "params": {
            "owner": "3b8a4db4-d653-4aea-993c-681b7cb88cfe",
            "application": "hexaData",
            "issuance": 1638968172017000,
            "producer": "3b8a4db4-d653-4aea-993c-681b7cb88cfe",
            "expiry": 1639054572017000,
            "type": "WRITE",
            "labels": {
                "type": "globalInfo",
                "projectId": "1"
            }
        },
        "token": "C7PBfuIxFq8QmglhRQo.TMgjEVq.u4ILU9VOdUFF3nUUxlzThKONg9qR1AZScOqxoJRDck0OntGV._iBQTQVu27tXTu_IfJwOPAmhmN86k2FIhmPSKh7JM7UfUi9GiQr8ZxxZTGnMQAIcnxCVpzs1ZaGRI3HXVY8"
    }
]
```

Each token gives access to the "projectId" label corresponding to the ID of the project to which it is attached

A "globalInfo" "type" label will subsequently allow access to data shared between all the projects.

## WARP10 GTS

The Warp10 GTS automatically integrate the "projectId" label corresponding to the id of the current project. The GTS also include a "deviceId" label referring to the device that produced the data.

For each device a gts is automatically generated and fed with for content the number of MQTT messages received during the last 60 minutes. this can be used to monitor the scaling up of the application or to diagnose communication with a device
