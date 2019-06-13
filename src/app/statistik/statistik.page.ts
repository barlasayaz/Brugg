import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api';
import { UserdataService } from '../services/userdata';
import { ExcelService } from '../services/excel';

/**
 * Generated class for the StatistikPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-statistik',
  templateUrl: './statistik.page.html',
  styleUrls: ['./statistik.page.scss'],
})
export class StatistikPage {
  public jahr: any = "2017";
  public monat: any = "01";
  public type: any = "1";
  public email: any = "Patrick.Kosek@brugg.com";
  public listeDaten: any = [];
  public aktivWarten: boolean;
  public rowData: any = [];
  public columnDefs: any = [];
  public params: any;
  public rowGroupMetadata: any=[];

  constructor(public navCtrl: NavController, 
    public translate : TranslateService,
    public apiService : ApiService,
    public userdata: UserdataService,
    public excelService: ExcelService) { 

    this.aktivWarten=true;
    this.changeStatistik();
    
  }

  changeStatistik() {
		console.log("changeStatistik", this.jahr, this.monat, this.type );
    this.params = '{"jahr":'+this.jahr+',"monat":"'+this.monat+'","type":'+this.type+'}';
    console.log(this.params);
    this.apiService.postData(JSON.parse(this.params),"statistik.php").then((result)=>{
     
      this.columnDefs =  [
                          {field: 'Firma', headerName: this.translate.instant('Firma')},
                          {field: 'Wertung', headerName: this.translate.instant('Wertung')},
                          {field: 'PLZ', headerName: this.translate.instant('PLZ')},
                          {field: 'Branche', headerName: this.translate.instant('Branche')},
                          {field: 'Anzahl', headerName: this.translate.instant('Anzahl')}
                         ];
      /*
      this.columnDefs= [
        { name: 'Name', grouping: { groupPriority: 0 } ,visible:false},
        { name: 'Firma', customTreeAggregationFn : function( aggregation, fieldValue, numValue, row ) { 
            if(!aggregation.anz){ 
              aggregation.anz =1;
            }else{
              aggregation.anz++;
            }
            aggregation.rendered = row.entity.Name+" (Kunden: "+aggregation.anz+") ";
          } },
        { name: 'Wertung' ,customTreeAggregationFn : function( aggregation, fieldValue, numValue, row ) { 
            if(!aggregation.a){ aggregation.a=0; }
            if(!aggregation.b){ aggregation.b=0; }
            if(!aggregation.c){ aggregation.c=0; }
            if(!aggregation.f){ aggregation.f=0; }
            if(row.entity.Wertung =="A"){
              aggregation.a++; 
            }else  if(row.entity.Wertung =="B"){
              aggregation.b++; 
            }else  if(row.entity.Wertung =="C"){
              aggregation.c++; 
            }else  if(row.entity.Wertung =="F"){
              aggregation.f++; 
            }  
            
            aggregation.rendered =  "(A-B-C-F "+aggregation.a+"-"+aggregation.b+"-"+aggregation.c+"-"+aggregation.f+")";
          }},
        { name: 'PLZ'},
        { name: 'Branche'},
        { name: 'Anzahl' , customTreeAggregationFn : function( aggregation, fieldValue, numValue, row ) { 
              if(!aggregation.anz){ 
                aggregation.anz =row.entity.Anzahl;
              }else{
                aggregation.anz= parseInt(aggregation.anz)+parseInt(row.entity.Anzahl);
              }
              aggregation.rendered = aggregation.anz;
            } }		
        ];
        */
      console.log(this.columnDefs);
      this.rowData=result["zeilen"];
      this.updateRowGroupMetaData();
    });
  }
  

updateRowGroupMetaData() {
    this.rowGroupMetadata = {};
    if (this.rowData) {
        for (let i = 0; i < this.rowData.length; i++) {
            let rd = this.rowData[i];
            let Name = rd.Name;
            if (i == 0) {
                this.rowGroupMetadata[Name] = { index: 0, size: 1 };
            }
            else {
                let previousRowData = this.rowData[i - 1];
                let previousRowGroup = previousRowData.Name;
                if (Name == previousRowGroup)
                    this.rowGroupMetadata[Name].size++;
                else
                    this.rowGroupMetadata[Name] = { index: i, size: 1 };
            }
        }
    }
}

  logout() {
    this.userdata.delStorage();
    this.navCtrl.navigateForward("/login"); 
  }

  sendeStatistik() {
    console.log("sendeStatistik" );
    this.aktivWarten = true;    
    let params = {jahr:this.jahr,
                  monat:this.monat,
                  type:this.type,
                  email:this.email
    };
    console.log(this.params);
    this.apiService.postData(params, "statistik_email.php").then((result) => {
      console.log('response', result);
			this.aktivWarten = false;
    });
  }

  xlsxExport() {
    let data: any = [];
    let auswertung:  any;
    let kdnr: any;
    let kunde: any;
    let wertung: any;
    let plz: any;
    let branche: any;
    let besuchsberichte: any;
    let monattext: any;
    
    if(this.monat == '01') monattext = this.translate.instant('Januar');
    if(this.monat == '02') monattext = this.translate.instant('Februar');
    if(this.monat == '03') monattext = this.translate.instant('März');
    if(this.monat == '04') monattext = this.translate.instant('April');
    if(this.monat == '05') monattext = this.translate.instant('Mai');
    if(this.monat == '06') monattext = this.translate.instant('Juni');
    if(this.monat == '07') monattext = this.translate.instant('Juli');
    if(this.monat == '08') monattext = this.translate.instant('August');
    if(this.monat == '09') monattext = this.translate.instant('September');
    if(this.monat == '10') monattext = this.translate.instant('Oktober');
    if(this.monat == '11') monattext = this.translate.instant('November');
    if(this.monat == '12') monattext = this.translate.instant('Dezember');

    if (this.type == 1) {besuchsberichte = this.translate.instant('Besuchsberichte')}
    else {besuchsberichte = this.translate.instant('Termin')};

    auswertung = this.translate.instant('Auswertung ' + monattext + ' ' + this.jahr);
    kdnr = 'KD-Nr.';
    kunde = this.translate.instant('Kunde');
    wertung = this.translate.instant('Wertung');
    plz = this.translate.instant('PLZ');
    branche = this.translate.instant('Branche');

    let header = [
        { 'key': 'A1', 'value': auswertung},
        { 'key': 'B1', 'value': kdnr},
        { 'key': 'C1', 'value': kunde},
        { 'key': 'D1', 'value': wertung},
        { 'key': 'E1', 'value': plz},
        { 'key': 'F1', 'value': branche},         
        { 'key': 'G1', 'value': besuchsberichte}
    ]; 

    for (var i = 0, len = this.rowData.length; i < len; i++) {
        let obj = this.rowData[i];
        data.push(  
        { 'auswertung': obj.Auswertung, 
          'kdnr' : obj.KD,
          'kunde' : obj.Kunde,
          'wertung' : obj.Wertung, 
          'plz' : obj.PLZ,
          'branche' : obj.Branche,
          'besuchsberichte' : obj.Besuchsberichte  
        });
    } 

    console.log('xlsxExport() :', data);
    this.excelService.exportAsExcelFile(data, 'statistik_7.xlsx', header);
  }

}
