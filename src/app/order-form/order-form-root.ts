export class ofroot {
    public _bestellungenIndex: any = 0;
    public _anz_wahrenkorb: any;
    public _bestellungen: any = [];
    public _offerten: any = [];
    public _pruefungen: any = [];
    public _latitude:any;
    public _longitude:any;

    get latitude() {
        return this._latitude;
    }

    set latitude(latitude) {
        this._latitude = latitude;
    }

    get longitude() {
        return this._longitude;
    }

    set longitude(longitude) {
        this._longitude = longitude;
    }

    get bestellungenIndex() {
        return this._bestellungenIndex;
    }

    set bestellungenIndex(bestellungenIndex) {
        this._bestellungenIndex = bestellungenIndex;
    }

    get anz_wahrenkorb() {
        return this._anz_wahrenkorb;
    }

    set anz_wahrenkorb(anz_wahrenkorb) {
        this._anz_wahrenkorb = anz_wahrenkorb;
    }

    get bestellungen() {
        return this._bestellungen;
    }

    set bestellungen(bestellungen) {
        this._bestellungen = bestellungen;
    }

    get offerten() {
        return this._offerten;
    }

    set offerten(offerten) {
        this._offerten = offerten;
    }

    get pruefungen() {
        return this._pruefungen;
    }

    set pruefungen(pruefungen) {
        this._pruefungen = pruefungen;
    }

}