import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, Events } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode, MenuItem } from 'primeng/api';
import { ExcelService } from '../services/excel';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfExportService } from '../services/pdf-export';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
    selector: 'app-protocol-list',
    templateUrl: './protocol-list.page.html',
    styleUrls: ['./protocol-list.page.scss'],
})
export class ProtocolListPage implements OnInit {
    public protocolListAll: TreeNode[] = [];
    public protocolListView: TreeNode[] = [];
    public cols: any[] = [];
    public selectedNode: TreeNode;
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public xlsHeader: any[];
    public splitFilter = false;
    public idCustomer = 0;
    public columnFilterValues = { protocol_number: '', title: '', id: '', protocol_date: '', product: '', search_all: '' };
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public rowRecords = 0;
    public totalRecords = 0;
    public lang: string = localStorage.getItem('lang');
    public company = '';
    public heightCalc: any = '700px';

    public menuItems: MenuItem[] = [
        {
            label: this.translate.instant('Ansicht'),
            icon: 'pi pi-fw pi-eye',
            disabled: true,
            command: (event) => {
                console.log('command menuitem:', event.item);
                this.menu_view();
            }
        },
        {
            label: this.translate.instant('Neue Protokollvorlage'),
            icon: 'pi pi-fw pi-plus',
            visible:  this.userdata.role_set.check_products,
            command: (event) => {
                console.log('command menuitem:', event.item);
                this.create_template();
            }
        },
        {
            label: this.translate.instant('Filter'),
            icon: 'pi pi-fw pi-filter',
            command: (event) => {
                console.log('command menuitem:', event.item);
                this.menu_filter();
            }
        },
        {
            label: this.translate.instant('Spalten'),
            icon: 'pi pi-fw pi-eject',
            command: (event) => {
                console.log('command menuitem:', event.item);
                this.show_columns();
            }
        },
        {
            label: this.translate.instant('l\u00f6schen'),
            icon: 'pi pi-fw pi-trash',
            disabled: true,
            visible:  this.userdata.role_set.check_products,
            command: (event) => {
                console.log('command menuitem:', event.item);
                this.protocolDeactivate();
            }
        },
        {
            label: this.translate.instant('Aktion'),
            icon: 'pi pi-fw pi-cog',
            items: [
                {
                    label: this.translate.instant('XLSx Export') + ' ' + this.translate.instant('Alle'),
                    icon: 'pi pi-fw pi-save',
                    command: (event) => {
                        this.excel_all();
                    }
                },
                {
                    label: this.translate.instant('XLSx Export') + ' ' + this.translate.instant('Ansicht'),
                    icon: 'pi pi-fw pi-save',
                    command: (event) => {
                        this.excel_view();
                    }
                },
                {
                    label: this.translate.instant('Cancel filters'),
                    icon: 'pi pi-fw pi-filter',
                    disabled: true,
                    command: (event) => {
                        console.log('command menuitem:', event.item);
                        this.cancel_filters(2);
                    }
                },
                {
                    label: this.translate.instant('PDF Ansicht'),
                    icon: 'pi pi-fw pi-save',
                    command: (event) => {
                        this.printPdf();
                    }
                }
            ]
        }];
    public popupMenu: MenuItem[] = [{
        label: this.translate.instant('Menü'),
        icon: 'fa fa-fw fa-list',
        items: this.menuItems
    }]

    @ViewChild('tt') dataTable: TreeTable;

    constructor(public navCtrl: NavController,
        public userdata: UserdataService,
        public apiService: ApiService,
        public translate: TranslateService,
        public modalCtrl: ModalController,
        public excelService: ExcelService,
        public alertCtrl: AlertController,
        public pdf: PdfExportService,
        public events: Events,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.rowRecords = 0;
        this.totalRecords = 0;
        this.events.publish('prozCustomer', 0);
        this.cols = [
            { field: 'protocol_number', header: this.translate.instant('Protokoll') },
            { field: 'title', header: this.translate.instant('Titel') },
            { field: 'id', header: 'DB-ID' },
            { field: 'protocol_date', header: this.translate.instant('Datum') },
            { field: 'result', header: this.translate.instant('Prüfergebnis') },
            { field: 'protocol_date_next', header: this.translate.instant('nächste Prüfung') },
            { field: 'product', header: this.translate.instant('Produkt') }
        ];
        this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));
        console.log('ProtocolListPage idCustomer:', this.idCustomer);

        this.apiService.pvs4_get_protocol_list(this.idCustomer).then((result: any) => {
            this.protocolListAll = JSON.parse(JSON.stringify(result.list));

            this.title_translate(this.protocolListAll);

            for (let index = 0; index < this.protocolListAll.length; index++) {
                // console.log("data :", this.protocolListAll[index].data);
                let options = JSON.parse(this.protocolListAll[index].data.items);
                // console.log("options :", options);
                if (options == null) { options = []; }

                for (let i = 0; i < options.length; i++) {
                    if (!this.cols.find(x => x.field == options[i].title[this.lang])) {
                        this.cols.push({ field: options[i].title[this.lang], header: options[i].title[this.lang] });
                    }
                    this.protocolListAll[index].data[options[i].title[this.lang]] = options[i].value;
                }

                if (this.protocolListAll[index].data.result === 0) {
                    this.protocolListAll[index].data.result = this.translate.instant('betriebsbereit');
                }
                if (this.protocolListAll[index].data.result === 1) {
                    this.protocolListAll[index].data.result = this.translate.instant('reparieren');
                }
                if (this.protocolListAll[index].data.result === 3) {
                    this.protocolListAll[index].data.result = this.translate.instant('unauffindbar');
                }
                if (this.protocolListAll[index].data.result === 4) {
                    this.protocolListAll[index].data.result = this.translate.instant('ausmustern');
                }
            }

            this.selectedColumns = JSON.parse(JSON.stringify(this.cols));

            if (localStorage.getItem('filter_values_protocol') != undefined) {
                this.columnFilterValues = JSON.parse(localStorage.getItem('filter_values_protocol'));
            }
            if (localStorage.getItem('split_filter_protocol') != undefined) {
                this.splitFilter = JSON.parse(localStorage.getItem('split_filter_protocol'));
                this.funcHeightCalc();
            }
            if (localStorage.getItem('show_columns_protocol') != undefined) {
                this.selectedColumns = JSON.parse(localStorage.getItem('show_columns_protocol'));
            }

            for (let k = 0; k < this.cols.length; k++) {
                this.columnFilterValues[this.cols[k].field] = '';
            }

            this.generate_protocolList();
            this.funcHeightCalc();
        });
    }

    onResize(event) {
        console.log('onResize');
        this.funcHeightCalc();
     }

    @ViewChild('divHeightCalc') divHeightCalc: any;
    funcHeightCalc() {
        let x = this.divHeightCalc.nativeElement.offsetHeight;
        if (this.splitFilter) { x = x - 51; }
        if (x < 80) { x = 80; }
        this.heightCalc = x + 'px';
        console.log('heightCalc:', x, this.heightCalc );
    }


    title_translate(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            const title = JSON.parse(nodes[i].data.title);
            let product = [];
            if (nodes[i].data.product) {
                product = JSON.parse(nodes[i].data.product);
                let productText = '';
                for (let index = 0; index < product.length; index++) {
                    if (index != 0) {
                        productText += ' , ';
                    }
                    productText += product[index].id_number;
                }
                nodes[i].data.product = productText;
            }
            nodes[i].data.title = title[this.lang];
        }
    }

    try_filter(node: TreeNode): boolean {
        let ret: any = false;
        for (let i = 0; i < this.cols.length; i++) {
            if (this.columnFilterValues['search_all'].trim().length > 0
                && node.data[this.cols[i].field] !== undefined
                && node.data[this.cols[i].field].toString().
                                                 toLowerCase().
                                                 indexOf(this.columnFilterValues['search_all'].trim().toLowerCase()) >= 0) {
                ret = true;
            }
        }

        if (this.columnFilterValues['search_all'].trim().length > 0 && !ret) {
            return false;
        } else if (this.columnFilterValues['search_all'].trim().length == 0 && !ret) {
            ret = true;
             }

        for (let i = 0; i < this.cols.length; i++) {
            if (this.columnFilterValues[this.cols[i].field].trim().length > 0
                && (node.data[this.cols[i].field] == undefined || (node.data[this.cols[i].field] != undefined
                    && node.data[this.cols[i].field].toString().
                                                     toLowerCase().
                                                     indexOf(this.columnFilterValues[this.cols[i].field].trim().toLowerCase()) < 0))) {
                ret = false;
            }
        }

        return ret;
    }

    dir_try_filter(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            if (this.try_filter(nodes[i]) == false) {
                nodes.splice(i, 1);
                i--;
            }
        }
    }
    search_all() {
        if (this.isFilterOn()) {
            this.menuItems[5].items[2]['disabled'] = false;
        } else {
            this.menuItems[5].items[2]['disabled'] = true;
        }
        this.generate_protocolList();
        localStorage.setItem('filter_values_protocol', JSON.stringify(this.columnFilterValues));
    }

    cancel_filters(cancel_type) {
        console.log('cancel_filters');
        this.menuItems[5].items[2]['disabled'] = true;
        if (cancel_type == 1) {
            for (let i = 0; i < this.cols.length; i++) {
                this.columnFilterValues[this.cols[i].field] = '';
            }
        } else {
            let json = '{';
            for (let j = 0; j < this.cols.length; j++) {
                json += '"' + this.cols[j].field + '":""';
                json += ',';
            }
            json += 'search_all:""}';
            this.columnFilterValues = JSON.parse(json);
        }
        this.generate_protocolList();
    }

    generate_protocolList() {
        console.log('generate_protocolList', this.isFilterOn());

        if (!this.isFilterOn()) {
            this.protocolListView = JSON.parse(JSON.stringify(this.protocolListAll));
        } else {
            const try_list = JSON.parse(JSON.stringify(this.protocolListAll));
            this.dir_try_filter(try_list);
            this.protocolListView = try_list;
        }

        this.rowRecords = this.protocolListView.length;
        this.totalRecords = this.protocolListAll.length;
        let progressBar = 100;
        if (this.totalRecords > 0 ) { progressBar = Math.round(this.rowRecords * 100 / this.totalRecords); }
        this.events.publish('progressBar', progressBar);
        this.events.publish('rowRecords', this.rowRecords);
        this.events.publish('totalRecords', this.totalRecords);

    }

    nodeSelect(event) {
        console.log('nodeSelect:', event, this.menuItems);
        this.menuItems[0].disabled = false;
        this.menuItems[4].disabled = false;
    }

    nodeUnselect() {
        console.log('nodeUnselect:');
        this.menuItems[0].disabled = true;
        this.menuItems[4].disabled = true;
    }

    menu_new() {
        console.log('menu_new', this.idCustomer);

        const navigationExtras: NavigationExtras = {
            queryParams: { id: 0, idCustomer: this.idCustomer }
        };
        this.navCtrl.navigateForward(['/protocol-edit'], navigationExtras);
    }

    menu_edit() {
        console.log('menu_edit', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const navigationExtras: NavigationExtras = {
                    queryParams: { 'id': this.selectedNode.data.id, idCustomer: this.idCustomer, parent: this.selectedNode.data.parent }
                };
                this.navCtrl.navigateForward(['/protocol-edit'], navigationExtras);
            }
        }
    }

    menu_view() {
        console.log('menu_view', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const id = parseInt(this.selectedNode.data.id);
                console.log('menu_view id', id);
                const navigationExtras: NavigationExtras = {
                    queryParams: { idCustomer: this.idCustomer, idProtocol: id, protocol: JSON.stringify(this.selectedNode.data) }
                };
                this.navCtrl.navigateForward(['/protocol-details/' + id], navigationExtras);
            }
        }
    }

    create_template() {
        //console.log('create_template', this.selectedNode);
        const navigationExtras: NavigationExtras = {
            queryParams:  { idCustomer: this.idCustomer }
        };

        this.navCtrl.navigateForward(['/protocol-template'], navigationExtras);
    }

    excel_all() {
        console.log('excel_all');
        const data: any = [];
        this.allnodes = [];
        console.log('allnodes :', this.allnodes);
        this.data_tree(this.protocolListAll);
        for (let i = 0, len = this.allnodes.length; i < len; i++) {
            const obj = this.allnodes[i];
            obj.items = obj.items.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            const json: any = {};
            for (let j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                } else {
                    json[this.selectedColumns[j].header] = '';
                }
            }
            console.log('>>json :', json);
            data.push(json);
        }
        /* let json: string = "";
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];
            json = "{";
            for (var j = 0; j < this.selectedColumns.length; j++) {
                json += '"' + this.selectedColumns[j].header + '":"' + obj[this.selectedColumns[j].field] + '"'
                if (j < this.selectedColumns.length - 1)
                    json += ',';
                json = json.replace("undefined", "");
            }
            json += '}';
            data.push(JSON.parse(json));
        } */
        this.excelService.exportAsExcelFile(data, 'product_all.xlsx');
    }

    excel_view() {
        console.log('excel_view');
        const data: any = [];
        this.allnodes = [];
        this.data_tree(this.protocolListView);
        for (let i = 0, len = this.allnodes.length; i < len; i++) {
            const obj = this.allnodes[i];
            obj.items = obj.items.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            const json: any = {};
            for (let j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                } else {
                    json[this.selectedColumns[j].header] = '';
                }
            }
            console.log('>>json :', json);
            data.push(json);
        }
        console.log('data :', data);
        this.excelService.exportAsExcelFile(data, 'product_view.xlsx');
    }

    printPdf() {
        const pdfTitle: any = this.translate.instant('Protokolle') + ' ' + this.translate.instant('Liste');
        let columns: any[] = [];
        const widthsArray: string[] = [];
        const bodyArray: any[] = [];
        this.allnodes = [];
        let rowArray: any[] = [];
        this.data_tree(this.protocolListView);
        let obj: any;
        const headerRowVisible: any = 0;
        widthsArray.push('*', 'auto', '*', '*', '*', '*', '*');

        for (let i = 0, len = this.allnodes.length; i < len; i++) {
            obj = this.allnodes[i];
            obj.items = obj.items.replace(/(\\r\\n|\\n|\\r)/gm, ' ');

            columns = [];
            for (let k = 0; k < 7; k++) {
                columns.push({ text: this.selectedColumns[k].header, style: 'header' });
            } 
            bodyArray.push(columns);

            rowArray = [];
            for (let j = 0; j < 7; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    rowArray.push(obj[this.selectedColumns[j].field]);
                } else {
                    rowArray.push('');
                }
            }
            bodyArray.push(rowArray);

            for (let l = 7; l < this.selectedColumns.length; l++) {
                rowArray = [];
                rowArray.push({ text: this.selectedColumns[l].header, style: 'header' });
                if (obj[this.selectedColumns[l].field]) {
                    rowArray.push(obj[this.selectedColumns[l].field]);
                } else {
                    rowArray.push('');
                }
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                bodyArray.push(rowArray);
            }

                rowArray = [];
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                rowArray.push({text: '', border: [false, false, false, false]});
                bodyArray.push(rowArray);
        }

        this.pdf.get_ListDocDefinition(bodyArray, 
                                       widthsArray, 
                                       headerRowVisible, 
                                       pdfTitle, this.translate.instant('Protokolle') + this.translate.instant('Liste') + '.pdf');
    } 

    data_tree(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            this.allnodes.push(nodes[i].data);
            if (nodes[i].children && nodes[i].children.length > 0) {
                this.data_tree(nodes[i].children);
            }
        }
    }

    menu_filter() {
        this.splitFilter = !this.splitFilter;
        if (!this.splitFilter) {
            this.cancel_filters(1);
        }
        localStorage.setItem('split_filter_protocol', JSON.stringify(this.splitFilter));
        this.funcHeightCalc();
    }

    async show_columns() {
        const inputs: any[] = [];
        for (let i = 0; i < this.cols.length; i++) {
            inputs.push({
                type: 'checkbox',
                label: this.cols[i].header,
                value: this.cols[i].field,
                checked: this.selectedColumns.find(x => x.field == this.cols[i].field)
            });
        }
        const alert = await this.alertCtrl.create({
            header: this.translate.instant('Spalten Auswählen'), inputs: inputs,
            buttons: [{
                text: this.translate.instant('dismiss'),
                handler: data => {
                    //  alert.dismiss();
                }
            },
            {
                text: this.translate.instant('okay'),
                handler: data => {
                    console.log('Checkbox data:', data);
                    this.selectedColumns = this.cols.filter(function (element, index, array) { return data.includes(element.field) });
                    localStorage.setItem('show_columns_protocol', JSON.stringify(this.selectedColumns));
                }
            }
            ]
        });
        await alert.present();
    }

    isFilterOn(): any {
        let ret = false;
        for (let i = 0; i < this.cols.length; i++) {
            if (this.columnFilterValues[this.cols[i].field].trim().length > 0) {
                ret = true;
            }
        }
        if (this.columnFilterValues['search_all'].trim().length > 0) {
            ret = true;
        }
        return ret;
    }


    protocolDeactivate() {
        console.log('delete');
        this.showConfirmAlert(this.selectedNode.data.id);
    }

    showConfirmAlert(idProtocol) {
        const alert = this.alertCtrl.create({
            header: this.translate.instant('Deaktivierung des Protokolls bestätigen'),
            message: this.translate.instant('Möchten Sie dieses Protokoll wirklich deaktivieren'),
            buttons: [
                {
                    text: this.translate.instant('nein'),
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: this.translate.instant('ja'),
                    handler: () => {
                        this.apiService.pvs4_get_protocol(idProtocol).then((result: any) => {
                            const activProtocol = result.obj;
                            console.log('loadProtocol: ', activProtocol);

                            activProtocol.active = 0;
                            this.apiService.pvs4_set_protocol(activProtocol).then((setResult: any) => {
                                console.log('result: ', setResult);
                                this.navCtrl.navigateForward('/protocol-list/' + this.idCustomer);
                            });
                        });
                    }
                }
            ]
        }).then(x => x.present());
    }

}