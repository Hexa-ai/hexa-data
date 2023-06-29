import { WarpGts}  from 'App/Services/Warp10Service'
import Warp10Service  from 'App/Services/Warp10Service'
import { lightTag } from './../Contracts/tags'

export interface HdmFormat {
  version:string,
  protocol:string,
  gtsNames:string[],
  datas:any[]
}

export class HdmIngressService {
  constructor(authorizedTags:{ [index:string] : lightTag }[], projectTokenCollection: string[], gtsProjectIdMapping:{ [index:string] : number }) {
    this.storeInterval=500
    this.warp10Service = new Warp10Service()
    this.buffer={}
    this.bufferToSave={}
    this.bufferSize=0
    this.authorizedTags=authorizedTags
    this.projectTokenCollection=projectTokenCollection
    this.gtsProjectIdMapping=gtsProjectIdMapping
    this.initTimeout(500)


  }
  // Buffer save interval
  readonly storeInterval:number

  protected warp10Service: Warp10Service
  protected bufferSize: number
  protected buffer: { [index:string] : WarpGts }
  protected bufferToSave: { [index:string] : WarpGts }

  // Authorized tags from hexa-data
  public authorizedTags: { [index:string] : lightTag }[]
  // Project Warp10 Token list
  public projectTokenCollection: string[]
  // GTS / ProjetId mapping
  public gtsProjectIdMapping:{ [index:string] : number }

  protected async initTimeout(delay:number){
    setTimeout(()=> this.storeGts(),delay)
  }
  /**
   * Save the Gts buffer in Wap10
   */
  protected async storeGts(){
    // Store this.projectTokenCollection state in case of update
    const projectTokenCollection = this.projectTokenCollection
    this.bufferToSave=this.buffer
    this.buffer={}
    this.bufferSize=0
    this.initTimeout(this.storeInterval)
    const gtsProjectCollection = this.groupByProject(this.bufferToSave)
    await this.warp10Service.storeGtsCollection(gtsProjectCollection, projectTokenCollection)
  }
  /**
   * Reorganize the GTS in the buffer by projects
   *
   * @param buffer { [index:string] : WarpGts }
   * @return WarpGts[][] The first index is the projectId
   */
  protected groupByProject(buffer: { [index:string] : WarpGts }): WarpGts[][] {
    let gtsProjectCollection : WarpGts[][]= []
    for (const gts of Object.values(buffer)) {
      if (typeof(gtsProjectCollection[this.gtsProjectIdMapping[gts.classname]])!='undefined') {
        gtsProjectCollection[this.gtsProjectIdMapping[gts.classname]].push(gts)
      } else {
        gtsProjectCollection[this.gtsProjectIdMapping[gts.classname]] = [gts]
      }
    }
    return gtsProjectCollection
  }
  /**
   * Process new payload (append into buffer)
   *
   * @param payload HdmFormat
   * @param clientId string
   * @returns boolean
   */
  public processPayload(payload: HdmFormat, clientId: string): boolean {
    if (Object.keys(this.authorizedTags).length>0) {
      let authorizedGts: WarpGts[] = []
      authorizedGts = this.getAuthorizedGts(payload, clientId)
      this.addToBuffer(authorizedGts)
    }
    return true
  }
  /**
   * Append GTS to buffer
   *
   * @param gtsCollection WarpGts[]
   */
  protected addToBuffer(gtsCollection: WarpGts[]){
    for (const gts of gtsCollection) {
      if( !(typeof(this.buffer[gts.classname]) == 'undefined')) {
        this.buffer[gts.classname].values?.push(gts.values![0])
        this.bufferSize++
      } else {
        this.buffer[gts.classname] = {
          classname: gts.classname,
          labels: gts.labels,
          values: [gts.values![0]]
        }
        this.bufferSize++
      }
    }

  }
  /**
   *
   *  Generate labels object with classname
   *
   * @param gtsName:string
   *
   */
  public generateLabels(gtsName:string) {
    let labels={}
    const labelsValues = gtsName.split('.')

    for ( const i in labelsValues ) {
      labels['l-'+i]=labelsValues[i]
    }
    if (Object.keys(labels).length>1){
      return labels
    } else {
      return {}
    }
  }
  /**
   * Filters authorized GTS from payload (declared and of the correct type)
   *
   * @param payload HdmFormat
   * @param clientId string
   * @returns WarpGts[]
   */
  public getAuthorizedGts(payload:HdmFormat, clientId:string): WarpGts[] {
    // Store this.authorizedTags state in case of update
    const authorizedTags = this.authorizedTags
    let gtsCollection: WarpGts[] = []
      for (const data of payload.datas) {
      const gtsName = this.getGtsName(data[0], payload)
      const tag: lightTag = authorizedTags[clientId][gtsName]
      if (this.isAuthorizedGts(gtsName, clientId)) {
        if (this.checkGtsType(clientId, gtsName, data[2])){
          if(typeof(data[2])=='boolean') {
            gtsCollection.push({
              classname: tag.namespace + '.' + gtsName,
              labels: {...this.generateLabels(gtsName),...{physicalUnit:tag.physicalUnit}},
              values: [{ts: data[1], value: Number(data[2])}],
            })
          } else {
            gtsCollection.push({
              classname:tag.namespace + '.' + gtsName,
              labels: {...this.generateLabels(gtsName),...{physicalUnit:tag.physicalUnit}},
              values: [{ts: data[1], value: data[2]}],
            })
          }

        }
      }
    }
    return gtsCollection
  }
  /**
   * Get GTS name from payload record index value
   *
   * @param id number
   * @param payload HdmFormat
   * @returns string
   */
  protected getGtsName(id:number, payload:HdmFormat): string{
    if (payload.gtsNames[id]) {
      return payload.gtsNames[id]
    } else {
      return ''
    }
  }
  /**
   * Check if GTS name is authorized for a clientId
   *
   * @param name string
   * @param clientId string
   * @returns boolean
   */
  public isAuthorizedGts(name:string, clientId:string): boolean {
    // Store this.authorizedTags state in case of update
    const authorizedTags=this.authorizedTags
    if (authorizedTags[clientId][name]) {
      return true
    } else {
      return false
    }
  }
  /**
   * Checks if the record of a GTS corresponds to the declared type
   *
   * @param clientId string
   * @param name string
   * @param value boolean|string|number
   * @returns boolean
   */
  public checkGtsType(clientId:string, name:string, value:boolean|string|number): boolean {
    // Store this.authorizedTags state in case of update
    const authorizedTags=this.authorizedTags

    if (typeof(value)=='number') {
      if(Number.isInteger(value) && authorizedTags[clientId][name].valueType==2){
        return true
      } else if (!Number.isInteger(value) && authorizedTags[clientId][name].valueType==3) {
        return true
      }
    } else if (typeof(value)=='boolean' && authorizedTags[clientId][name].valueType==1) {
      return true
    } else if (typeof(value)=='string' && authorizedTags[clientId][name].valueType==4) {
      return true
    }
    return false
  }
}
