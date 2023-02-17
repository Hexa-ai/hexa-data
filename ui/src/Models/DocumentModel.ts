import BaseModel from "./BaseModel";

class DocumentModel extends BaseModel{
  public id:number =0
  public name:string =''
  public type:number =0
  public file: any = null
  public projectId:number =0
  public updatedAt:string=''
}

export default DocumentModel
