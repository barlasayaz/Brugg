import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the UserdataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable({
  providedIn: 'root',
})

export class UserdataService {

  constructor(public http: HttpClient) {
    console.log('Start UserdataProvider Provider');
  }

  public id: number = 0;
  public token: string = '';
  public idKunde: number = 0;
  public Type: number = 0;
  public eMail: string = '';
  public Name: string = '';
  public Vorname: string = '';
  public Telefon: string = '';
  public Mobiltelefon: string = '';
  public Kennung: string = '';
  public Farbe: string = '';
  public Extras: number = 0;
  public Aktiv: number = 0;
  public Fahrtenbuchhinweis: number = 0;
  public KundenGruppe: Array<number> = [];
  public Prueferservice: number = 0;
  public OpcUa: number = 0;
  public Begrenzt: number = 0;
  //PVS4
  public licensee: number = 5;
  public profile: number = 0;
  public role: number = 0; // 1=system , 2=licensee , 3=customer
  public role_nr: number = 0;
  public role_set: any = [];
  public all_role_set: any = [];
  public short_code: string = '??';
  public colour: string = '#FF5511';
  public first_name: string = ' ';
  public last_name: string = ' ';
  public email: string = ' ';
  public phone: string = ' ';


  reset(){
    console.log('UserdataProvider reset()');
    this.id = 0;
    this.eMail = '';
    this.Name = '';
    this.Vorname = '';
    this.Aktiv = 0;
    this.token = '';
    this.idKunde = 0;
    this.Type = 0;
    this.Telefon = '';
    this.Mobiltelefon = '';
    this.Kennung = '';
    this.Farbe = '';
    this.Extras = 0;
    this.Fahrtenbuchhinweis = 0;
    this.KundenGruppe = [];
    this.Prueferservice = 0;
    this.OpcUa = 0;
    this.Begrenzt = 0;
    //PVS4
    this.licensee = 5;
    this.profile = 0;
    this.role = 0;
    this.role_nr = 0;
    this.role_set = [] ;
    this.short_code = '??';
    this.colour = '#FF5511';
  }

  set(userInfo: any){
    console.log('UserdataProvider set()', userInfo);
    this.id = parseInt(userInfo.id);
    this.eMail = userInfo.eMail;
    this.Name = userInfo.Name;
    this.Vorname = userInfo.Vorname;
    this.Type = parseInt(userInfo.Type);
    this.token = userInfo.token;
    if (userInfo.Aktiv) { this.Aktiv = parseInt(userInfo.Aktiv); }
    if (userInfo.idKunde) { this.idKunde = parseInt(userInfo.idKunde); }
    if (userInfo.TelefonTelefon) { this.Telefon = userInfo.TelefonTelefon; }
    if (userInfo.Mobiltelefon) { this.Mobiltelefon = userInfo.Mobiltelefon; }
    if (userInfo.Kennung) { this.Kennung = userInfo.Kennung; }
    if (userInfo.Farbe) { this.Farbe = userInfo.Farbe; }
    if (userInfo.Extras) { this.Extras = parseInt(userInfo.Extras); }
    if (userInfo.Fahrtenbuchhinweis) { this.Fahrtenbuchhinweis = parseInt(userInfo.Fahrtenbuchhinweis); }
    if (userInfo.KundenGruppe) { this.KundenGruppe = userInfo.KundenGruppe; } 
    if (userInfo.Prueferservice) { this.Prueferservice = parseInt(userInfo.Prueferservice); }
    if (userInfo.OpcUa) { this.OpcUa = parseInt(userInfo.OpcUa); }
    if (userInfo.Begrenzt) { this.Begrenzt = parseInt(userInfo.Begrenzt); }
  }

  get(): any{
    console.log('UserdataProvider get()');
    return {
      id: this.id,
      eMail: this.eMail,
      Name: this.Name,
      Vorname: this.Vorname,
      Aktiv: this.Aktiv,
      token: this.token,
      idKunde: this.idKunde,
      Type: this.Type,
      Telefon: this.Telefon,
      Mobiltelefon: this.Mobiltelefon,
      Kennung: this.Kennung,
      Farbe: this.Farbe,
      Extras: this.Extras,
      Fahrtenbuchhinweis: this.Fahrtenbuchhinweis,
      KundenGruppe: this.KundenGruppe,
      Prueferservice: this.Prueferservice,
      OpcUa: this.OpcUa,
      Begrenzt: this.Begrenzt
    };
  }

  delStorage() {
    console.log('UserdataProvider delStorage()');
    // todo: let xin = $rootScope.getAjax('login.php' , { logout:1 });
    this.reset();
    localStorage.removeItem('pvs4_user');
    localStorage.removeItem('pvs4_login');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('pvs4_bruggid');    
    sessionStorage.clear();
  }

}
