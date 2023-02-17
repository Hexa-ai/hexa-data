# MQTT data acquisition

Data acquisition is done on the MQTT protocol. The data transmitted must respect a format understandable by Hexa-Data.

## Histrorical data metric format (HDM)

HDM is an open format created for Hexa-data in order to upload metrics in the application. I format is based on JSON and allows to upload buffered and time-stamped data in Hexa-data

### HDM format sample

```
{
  version: '1.0',
  protocol: 'hdmp',
  gtsNames: [
    'NiveauCuve',
    'NbBoitesProduites',
    'alMoteurConvoyeur',
    'alPompeRemplissage',
    'alVanneSoutirage',
    'doMoteurConvoyeur',
    'doPompeRemplissage',
    'doVanneSoutirage'
  ],
  datas: [
    [ 0, 1639124070058000, 1673.788 ],
    [ 1, 1639124070058000, 8408 ],
    [ 2, 1639124070058000, false ],
    [ 3, 1639124070058000, false ],
    [ 4, 1639124070058000, false ],
    [ 5, 1639124070058000, true ],
    [ 6, 1639124070058000, true ],
    [ 7, 1639124070058000, false ]
  ]
}
```

|  Attribute        |  Description                                                                                        |
|-------------------|-----------------------------------------------------------------------------------------------------|
| version           | Profil version                                                                                      |
| protocol          | Protocol profile (In anticipation of future variations of the format incorporating other features)  |
| gtsNames          | Array of GTS (Tags names) names                                                                     |
| datas             | Buffer of datas [gtsName_id, timestamp in µSecond, Value]                                           |


## Processing new MQTT messages

When a new message arrives, the acquisition worker checks the protocol attribute before processing it. This worker also validates that the tags have been declared in the application as well as the type of data reported.

In order to provide good performance, the list of authorized tags is updated cyclically (every 10 seconds) and loaded into memory.

All the authorized messages are then stacked in a buffer emptied cyclically in the WARP10 database (evrery 500ms).

