import BaseModel from "./BaseModel";

class TileModel extends BaseModel{
    public x:number =0
    public y:number =0
    public w:number =1
    public h:number =1
    public L1:string =''
    public L2:string =''
    public L3:string =''
    public chartType =''
    public deleted:boolean = false
    public showOutLine: boolean = true
    public script:string =''
    public eventHandler:string=''
    public vars:string=''
    public headerColor:string='#111827'
    public headerJustify:string=''
    public bgColor:string='#FFFFFF'
    public autoRefresh:number =-1
    public showInitializeTemplate: boolean = false
}

export default TileModel
