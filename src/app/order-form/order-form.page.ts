import { Component } from '@angular/core';
import { NavController, ModalController, Events } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { ofroot } from './order-form-root';
import { DialogObjectNewPage } from './dialog-object-new/dialog-object-new.page';
import { OrderSendPage } from './order-send/order-send.page';
import { NavigationExtras, ActivatedRoute } from '@angular/router';

/**
 * Generated class for the OrderFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'app-order-form',
    templateUrl: './order-form.page.html',
    styleUrls: ['./order-form.page.scss'],
})
export class OrderFormPage {
    public idCustomer: number = 0;
    public company: string = "";
    public Ziel_DropDown: any;
    public Empfaenger: any;
    public aktiverKunde: any;
    public RE_Ansp: any;
    public LA_Ansp: any;
    public LA_Firma: any;
    public LA_Email: any;
    public LA_Name: any;
    public LA_Abteilung: any;
    public LA_Str: any;
    public LA_PLZ_ORT: any;
    public aktiverAnsprechpartnerListe: any[];
    private Dialogobjektneucsss: string;
    public bestellungen: any = [];
    public offerten: any = [];
    public pruefungen: any = [];
    public anz_wahrenkorb: any;

    constructor(public navCtrl: NavController,
        public apiService: ApiService,
        public userdata: UserdataService,
        public translate: TranslateService,
        public modalCtrl: ModalController,
        public events: Events,
        public rs: ofroot,
        private route: ActivatedRoute) {
            
        this.route.queryParams.subscribe(params => {
            this.idCustomer = params["idCustomer"];
            this.company = params["company"];
        });
        this.bestellungen = this.rs.bestellungen;
        this.offerten = this.rs.offerten;
        this.pruefungen = this.rs.pruefungen;
        this.anz_wahrenkorb = this.rs.anz_wahrenkorb;
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OrderFormPage');
    }

    changeZiel() {
        if (this.Ziel_DropDown == 1) {
            this.Empfaenger = 'info.lifting@brugg.com';
            if (this.userdata.Type < 20) {
                if (this.userdata.id == 105) this.Empfaenger = 'vente.lifting@brugg.com';
                if (this.userdata.id == 51970) this.Empfaenger = 'vente.lifting@brugg.com';
                if (this.userdata.id == 51995) this.Empfaenger = 'vente.lifting@brugg.com';
            } else {
                if (this.aktiverKunde.Verantwortlicher_idAusendienster == 105) this.Empfaenger = 'vente.lifting@brugg.com';
                if (this.aktiverKunde.Verantwortlicher_idAusendienster == 51970) this.Empfaenger = 'vente.lifting@brugg.com';
                if (this.aktiverKunde.Verantwortlicher_idAusendienster == 51995) this.Empfaenger = 'vente.lifting@brugg.com';
                if (this.aktiverKunde.Verantwortlicher_idPruefer == 105) this.Empfaenger = 'vente.lifting@brugg.com';
                if (this.aktiverKunde.Verantwortlicher_idPruefer == 51970) this.Empfaenger = 'vente.lifting@brugg.com';
                if (this.aktiverKunde.Verantwortlicher_idPruefer == 51995) this.Empfaenger = 'vente.lifting@brugg.com';
            }
        }
        if (this.Ziel_DropDown == 2) {
            this.Empfaenger = this.RE_Ansp;
            this.LA_Ansp = 0;
            this.LA_Firma = "";
            this.LA_Email = "";
            this.LA_Name = "";
            this.LA_Abteilung = "";
            this.LA_Str = "";
            this.LA_PLZ_ORT = "";
        }
    }

    changeLaAnsp() {
        for (let i = 0; i < this.aktiverAnsprechpartnerListe.length; i++) {
            let ansp = this.aktiverAnsprechpartnerListe[i];
            if (ansp.idAnsprechpartner == this.LA_Ansp) {
                this.LA_Firma = ansp.LA_Firma;
                this.LA_Email = ansp.eMail;
                this.LA_Name = ansp.LA_Name;
                this.LA_Abteilung = ansp.LA_Abteilung;
                this.LA_Str = ansp.LA_Strasse;
                this.LA_PLZ_ORT = ansp.LA_Ort;
                console.log("changeLaAnsp:", ansp);
            }
        }
    }

    async dialogObjectNew(was) {
        if (was == 1 || was == 2) {
            this.Dialogobjektneucsss = "Dialogobjektneu1";
        }
        if (was == 3) {
            this.Dialogobjektneucsss = "Dialogobjektneu2";
        }
        const modal =
            await this.modalCtrl.create({
                component: DialogObjectNewPage,
                componentProps: {
                    objektNeuWas: was, menge: 1, pfelder: 1
                }
            });

        modal.present();

        this.bestellungen = this.rs.bestellungen;
        this.offerten = this.rs.offerten;
        this.pruefungen = this.rs.pruefungen;
    }

    async ordersSend() {
        const modal =
            await this.modalCtrl.create({
                component: OrderSendPage,
                componentProps: {
                    "aktiverKunde": this.aktiverKunde
                }
            });

        modal.present();
    }

    plusIndex(value) {
        console.log(value);
        value.anz = value.anz + 1;
    }

    minusIndex(value) {
        value.anz = value.anz - 1;
        if (value.anz <= 0) {
            value.anz = 1;
        }
    }

    async editOrders(value, was) {
        const modal =
            await this.modalCtrl.create({
                component: DialogObjectNewPage,
                componentProps: {
                    value: value, objektNeuWas: was
                }
            });

        modal.present();
        this.anz_wahrenkorb = this.rs.anz_wahrenkorb;
    }

    delIndex(value, was) {
        console.log("delete", value.index);
        if (was == 11) {
            for (let i = 0; i < this.rs.bestellungen.length; i++) {
                if (this.rs.bestellungen[i].index == value.index) {
                    this.rs.bestellungen.splice(i, 1);
                }
            }
        }
        if (was == 12) {
            for (let i = 0; i < this.rs.offerten.length; i++) {
                if (this.rs.offerten[i].index == value.index) {
                    this.rs.offerten.splice(i, 1);
                }
            }
        }

        if (was == 13) {
            for (let i = 0; i < this.rs.pruefungen.length; i++) {
                if (this.rs.pruefungen[i].index == value["index"]) {
                    this.rs.pruefungen.splice(i, 1);
                }
            }
        }
        this.rs.anz_wahrenkorb = this.rs.bestellungen.length + this.rs.offerten.length + this.rs.pruefungen.length;
        console.log("delIndex :", this.rs.anz_wahrenkorb);
        this.events.publish("anz_wahrenkorb", this.rs.anz_wahrenkorb);
    }

}