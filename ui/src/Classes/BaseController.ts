import { compile, ref, Ref } from 'vue';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
interface I_FileField {
  name:string,
  field?:Ref<FileList | undefined>
}
class ModelCollection<Model> {
  data:Model[]=[]
  pagination:Pagination = new Pagination()
}
class Pagination {
  total:number=0
  perPage:number=0
  currentPage:number=0
}
class BaseController<Model>{
  /**
   * Constructor to initialize the BaseController class with required properties
   *
   * @param apiUrl - Base URL of the API
   * @param bearerTokenHeader - Authorization bearer token to be used for the API requests
   * @param model - Instance of the model being used
   * @param fileFields - Array of file fields to be included in the requests
   */
  constructor(route:string, fileFields:I_FileField[],model:Model, bearertoken?:string) {
    function createModelInstance<M>(m: new () => M): M {
      return new m();
    }
    this.model={...model}
    this.route=route
    this.bearerTokenHeader= bearertoken ?? ''
    this.fileFields=fileFields
    this.initFileFields()
  }
  /** The current model instance */
  public model:Model
  /** The files fields, an array containing the name of each file field and a reference to it */
  public fileFields:I_FileField[]
  /** Gets the base URL for the HTTP requests */
  public getUrl(): string {
    return window.location.origin + import.meta.env.VITE_API_PREFIX + this.routePrefix + this.route
  }
  /** The route prefix for the HTTP requests */
  public routePrefix:string = ''
  /** The API route for the HTTP requests */
  public route:string
  /** The bearer token for the HTTP requests */
  public bearerTokenHeader:string
  /**
   * Sets the route prefix for the HTTP requests
   * @param prefix the prefix to set
   */
  public setRoutePrefix(prefix:string){
    this.routePrefix=prefix
  }
  /**
   * Initializes the file fields by setting their value to a new ref
   */
  protected initFileFields(){
    for(const index in this.fileFields ) {
      this.fileFields[index].field = ref<FileList>()
    }
  }
  /**
   * Gets the value of a file field by its name
   * @param fieldName the name of the file field to get the value of
   * @returns a ref containing the value of the file field
   */
  public getFileList(fieldName:string): Ref<FileList | undefined> {
    return this.fileFields.find(obj => obj.name==fieldName)!.field!
  }
  /**
   * Retrieves a collection of models from the API
   * @param page the page number of the models to retrieve
   * @param perPage the number of models to retrieve per page
   * @param searchKey the search key to filter the models by
   * @param opt any additional query parameters to send with the request
   * @returns a ModelCollection object containing the retrieved models and their pagination data
   */
  public async index(page?:number,perPage?:number,searchKey?:string, opt?:{[key:string]:string}): Promise<ModelCollection<Model>> {
    const modelCollection = new ModelCollection<Model>()
    modelCollection.data=[]
    const res = await axios.get(this.getUrl(), this.getReqConf(page,perPage,searchKey,opt))
    for (const raw in Object.entries(res.data.data)) {
        const i= Number(raw)
        for (const key in this.model) {
          this.model[key]=res.data.data[raw][key]
        }
        modelCollection.data![i]= Object.assign({}, this.model)
    }

    modelCollection.pagination.currentPage=res.data.meta.current_page
    modelCollection.pagination.perPage=res.data.meta.per_page
    modelCollection.pagination.total=res.data.meta.total

    return modelCollection
  }

  /**
   * Ask the backend to send information about a model
   * @param id id of the model
   * @returns the model
   */
  public async show<Model>(id?:number): Promise<any> {
    let res: AxiosResponse<any, any>
    if(typeof(id)=='undefined'){
      res = await axios.get(this.getUrl(), this.getReqConf())
    }else {
      res = await axios.get(this.getUrl() + '/' + id, this.getReqConf())
    }

    for (const key in this.model) {
      this.model[key]=res.data[key]
    }

    return {...this.model}
  }
  /**
   *
   * @param id
   * @returns Model
   */
  public async remove<Model>(id?:number): Promise<any> {
    let res: AxiosResponse<any, any>

    res = await axios.delete(this.getUrl() + '/' + id, this.getReqConf())


    for (const key in this.model) {
      this.model[key]=res.data[key]
    }

    return this.model
  }
  /**
   *
   * @param routeSufix
   * @param data
   * @param fileFields?: I_FileField[]
   * @returns Promise<any>
   */
  public async post<Model>(routeSufix:string,data?:any,fileFields?:I_FileField[]): Promise<any> {
    const formData = new FormData()
    let res: AxiosResponse<any, any>

    for (const key in data) {
      if ((fileFields!=null) && (fileFields.find(x => x.name == key)?.name!=key)) {
        if (data[key]!=null){
          formData.append(key, data[key])
        }
      }
    }
    if (fileFields!=null){
      fileFields.map((fileField)=>{
        if (fileField.field!.value != undefined) {
          formData.append(fileField.name, fileField.field!.value[0])
        }
      })
    }
    console.log(formData)
    res = await axios.post(this.getUrl() + '/' + routeSufix, formData, this.getReqConf())

    return res.data
  }
  /**
   *
   * @param routeSufix : string
   * @returns Promise<any>
   */
  public async get<Model>(routeSufix:string): Promise<any> {
    let res: AxiosResponse<any, any>

    res = await axios.get(this.getUrl() + '/' + routeSufix, this.getReqConf())

    return res.data
  }
  /**
   *
   * @param routeSufix: string
   * @param data?: any
   * @param fileFields?: I_FileField[]
   * @returns Promise<any>
   */
  public async patch<Model>(routeSufix:string,data?:any,fileFields?:I_FileField[]): Promise<any> {
    const formData = new FormData()
    let res: AxiosResponse<any, any>

    for (const key in data) {
      formData.append(key, data[key])
    }
    if (fileFields!=null){
      fileFields.map((fileField)=>{
        if (fileField.field!.value != undefined) {
          formData.append(fileField.name, fileField.field!.value[0])
        }
      })
    }

    res = await axios.patch(this.getUrl() + '/' + routeSufix, formData, this.getReqConf())

    return res.data
  }
  public async delete<Model>(routeSufix:string): Promise<any> {
    let res: AxiosResponse<any, any>

    res = await axios.delete(this.getUrl() + '/' + routeSufix, this.getReqConf())

    return res.data
  }
  public async update(model:Model,useId:boolean=true) {
    const formData = new FormData()
    this.model=model
    for (const key in this.model) {
      if (this.fileFields.find(x => x.name == key)?.name!=key) {
        if (this.model[key]!=undefined){
          formData.append(key, String(this.model[key]))
        }
      }
    }

    this.fileFields.map((fileField)=>{
      if (fileField.field!.value != undefined) {
        formData.append(fileField.name, fileField.field!.value[0])
      }
    })

    if(useId==true){
      await axios.patch(this.getUrl() + '/' + this.getModelId(), formData, this.getReqConf())
    } else {
      await axios.patch(this.getUrl(), formData, this.getReqConf())
    }

  }

  public async store(model:Model) {
    const formData = new FormData()
    this.model=model
    for (const key in this.model) {
      if (this.fileFields.find(x => x.name == key)?.name!=key) {
        if (this.model[key]!=null){
          formData.append(key, String(this.model[key]))
        }
      }
    }

    this.fileFields.map((fileField)=>{
      if (fileField.field!.value != undefined) {
        formData.append(fileField.name, fileField.field!.value[0])
      }
    })

    await axios.post(this.getUrl(), formData, this.getReqConf())

  }
  protected getReqConf(page?:number, perPage?:number, searchKey?:string, opt?:{[key:string]:string}): {} {
    let conf:AxiosRequestConfig<any>={}
    if (this.bearerTokenHeader!='') {
      conf.headers={ Authorization: `Bearer ${this.bearerTokenHeader}` }
    }
    conf.params={page:page, perPage:perPage, searchKey:searchKey}
    if (opt!=undefined) {
      for (const key in opt) {
        conf.params[key]=opt[key]
      }
    }
    return conf
  }
  protected getModelId(): number | undefined{
    for (const key in this.model) {
      if (key=='id') {
        return Number(this.model[key])
      }
    }
  }
}


export  {BaseController, ModelCollection, Pagination }
