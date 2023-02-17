# Tags CSV export

The application allows the import and export of tags via the following routes:

```
projects/:projectId/tags/exportCsv
projects/:projectId/tags/importCsv
```

|  Fields         | Descriptions                                                | Rules                                                 |
|-----------------|-------------------------------------------------------------|-------------------------------------------------------|
|  id             | auto increment in DB                                        | required for update and prohibited for creation       |
|  name           | name of the tag                                             | description for language number 1 of the application  |
|  description_l1 | description for language number 1 of the application        |                                                       |
|  description_l2 | description for language number 2 of the application        |                                                       |
|  description_l3 | description for language number 3 of the application        |                                                       |
|  unit           | unit value                                                  |                                                       |
|  type           | type of tag ( 1=GTS, 2=Text tag, 3=Macro tag )              |                                                       |
|  device_id      | id of the device concerned                                  | required only if type=1                               |
|  value_type     | datatype of value (1=Boolean, 2=Integer, 3=Float, 4=String) |                                                       |

The other fields relating in particular to the macro are not exportable for the moment
