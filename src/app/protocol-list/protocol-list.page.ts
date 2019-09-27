import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, Events, LoadingController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode, MenuItem, LazyLoadEvent } from 'primeng/api';
import { ExcelService } from '../services/excel';
import { PdfExportService } from '../services/pdf-export';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SystemService } from '../services/system';

@Component({
    selector: 'app-protocol-list',
    templateUrl: './protocol-list.page.html',
    styleUrls: ['./protocol-list.page.scss'],
})
export class ProtocolListPage implements OnInit {
    public protocolListAll: TreeNode[] = [];
    public protocolListView: TreeNode[] = [];
    public protocolListSearch: TreeNode[] = [];
    public cols: any[] = [];
    public selectedNode: any;
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public xlsHeader: any[];
    public splitFilter = false;
    public idCustomer = 0;
    public columnFilterValues = { protocol_number: '', title: '', product: '', id: '', protocol_date: '', search_all: '' };
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public rowRecords = 0;
    public totalRecords = 0;
    public lang: string = localStorage.getItem('lang');
    public heightCalc: any;
    public activCustomer: any = {};
    public customer_number: any;
    modelChanged: Subject<any> = new Subject<any>();
    public selectedRow: number;
    public rowHeight = 26;
    public rowCount = 100;
    public sortedColumn = { sort_field : null, sort_order : 0 };

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
            label: this.translate.instant('Neue Protokollvorlage'),
            icon: 'pi pi-fw pi-plus',
            visible:  this.userdata.role_set.edit_protocol_templates,
            disabled: !this.userdata.role_set.edit_protocol_templates,
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
            label: this.translate.instant('Aktion'),
            icon: 'pi pi-fw pi-cog',
            items: [
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
                    label: this.translate.instant('XLSx export'),
                    icon: 'pi pi-fw pi-save',
                    command: (event) => {
                        this.excel_export();
                    }
                },
                {
                    label: this.translate.instant('PDF export'),
                    icon: 'pi pi-fw pi-save',
                    command: (event) => {
                        this.pdf_export();
                    }
                }
            ]
        }
    ];
    public popupMenu: MenuItem[] = [{
        label: this.translate.instant('Menü'),
        icon: 'fa fa-fw fa-list',
        items: this.menuItems
    }];

    @ViewChild('tt') dataTable: TreeTable;
    @ViewChild('divHeightCalc') divHeightCalc: any;

    constructor(public navCtrl: NavController,
        public userdata: UserdataService,
        public apiService: ApiService,
        public translate: TranslateService,
        public modalCtrl: ModalController,
        public excelService: ExcelService,
        public alertCtrl: AlertController,
        public pdf: PdfExportService,
        public events: Events,
        private dataService: DataService,
        public system: SystemService,
        private route: ActivatedRoute,
        private loadingCtrl: LoadingController) {
            this.modelChanged.pipe(
                debounceTime(700))
                .subscribe(model => {
                    if (this.isFilterOn()) {
                        this.menuItems[5].items[0]['disabled'] = false;
                    } else {
                        this.menuItems[5].items[0]['disabled'] = true;
                    }
                    this.generate_protocolList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
                    localStorage.setItem('filter_values_protocol', JSON.stringify(this.columnFilterValues));
            });
    }

    ngOnInit() {
        this.cols = [
            { field: 'protocol_number', header: this.translate.instant('Protokoll'), width: '100px' },
            { field: 'title', header: this.translate.instant('Titel'), width: '200px' },
            { field: 'product', header: this.translate.instant('Produkt'), width: '200px' },
            { field: 'id', header: 'DB-ID', width: '95px' },
            { field: 'protocol_date', header: this.translate.instant('Datum'), width: '95px'},
            { field: 'result', header: this.translate.instant('Prüfergebnis'), width: '160px' },
            { field: 'protocol_date_next', header: this.translate.instant('Nächste prüfung'), width: '95px' }
        ];

        console.log('ProductListPage idCustomer:', this.idCustomer, this.system.platform);
        this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));
        if (localStorage.getItem('sort_column_protocol') != undefined) {
            this.sortedColumn = JSON.parse(localStorage.getItem('sort_column_protocol'));
        }
        this.page_load();
    }

    onResize(event) {
        // console.log('onResize');
        this.funcHeightCalc();
    }

    async loadNodes(event: LazyLoadEvent) {
        if (this.totalRecords > 0) {
            if(event.sortField && event.sortField.length>0)
            {
                this.sortedColumn.sort_field = event.sortField;
                this.sortedColumn.sort_order = event.sortOrder;
                localStorage.setItem('sort_column_protocol', JSON.stringify(this.sortedColumn));
            }
            this.generate_protocolList(event.first, event.rows, event.sortField, event.sortOrder);
        }

        // in a production application, make a remote request to load data using state metadata from event
        // event.first = First row offset
        // event.rows = Number of rows per page
        // event.sortField = Field name to sort with
        // event.sortOrder = Sort order as number, 1 for asc and -1 for dec
        // filters: FilterMetadata object having field as key and filter value, filter matchMode as value
    }

    funcHeightCalc() {
        let x = this.divHeightCalc.nativeElement.scrollHeight;
        if (x == 0) { x = 550; }
        if (x > 572 && this.system.platform == 2) { x = 600; }
        if (this.splitFilter) { x = x - 51; }
        // if (x < 80) { x = 80; }
        this.heightCalc = x + 'px';
        // console.log('heightCalc 3 :', x, this.heightCalc );
    }

    async page_load() {
        console.log('page_load CustomerTablePage');

        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        this.rowRecords = 0;
        this.totalRecords = 0;
        this.menuItems[0].disabled = true;
        this.menuItems[1].disabled = true;
        this.selectedNode = [];
        this.selectedRow = 0;
        this.events.publish('prozCustomer', 0);

        this.apiService.pvs4_get_customer(this.idCustomer).then((result: any) => {
            this.activCustomer = result.obj;
            this.customer_number = this.activCustomer.customer_number;
        });
        console.log('ProtocolListPage idCustomer:', this.idCustomer);

        this.apiService.pvs4_get_protocol_list(this.idCustomer).then((result: any) => {
            console.log('result protocol :', result);
            this.protocolListAll = JSON.parse(JSON.stringify(result.list));
            // console.log('protocolListAll :', this.protocolListAll);

            this.title_translate(this.protocolListAll);

            for (let index = 0; index < this.protocolListAll.length; index++) {
                let options = [];
                try {
                    options = JSON.parse(this.protocolListAll[index].data.items);
                } catch {
                    console.error('JSON.parse index:' + index, this.protocolListAll[index].data );
                }

                for (let i = 0; i < options.length; i++) {
                    if (!this.cols.find(x => x.field == options[i].title[this.lang])) {
                        this.cols.push({ field: options[i].title[this.lang], header: options[i].title[this.lang], width: '200px' });
                    }

                    if (options[i].type == 0) {
                        if (options[i].value == true) {
                            options[i].value = this.translate.instant('Wahr');
                        }
                        if (options[i].value == false) {
                            options[i].value = this.translate.instant('Falsch');
                        }
                        this.protocolListAll[index].data[options[i].title[this.lang]] = options[i].value;
                    } else if (options[i].type == 1) {
                        if (options[i].value != null) {
                            options[i].value = options[i].value.trim();
                        }
                        for (let j = 0; j < options[i].options.length; j++) {
                            if (options[i].value == options[i].options[j].de ||
                                options[i].value == options[i].options[j].en ||
                                options[i].value == options[i].options[j].fr ||
                                options[i].value == options[i].options[j].it
                                ) {
                                options[i].value = options[i].options[j][this.lang];
                            }
                        }
                        this.protocolListAll[index].data[options[i].title[this.lang]] = options[i].value;
                    } else if (options[i].type == 4) {
                        const pipe = new DatePipe('en-US');
                        this.protocolListAll[index].data[options[i].title[this.lang]] = pipe.transform(options[i].value, 'HH:mm');
                    } else if (options[i].type == 5) {
                        const pipe = new DatePipe('en-US');
                        this.protocolListAll[index].data[options[i].title[this.lang]] = pipe.transform(options[i].value, 'dd.MM.yyyy');
                    } else {
                        this.protocolListAll[index].data[options[i].title[this.lang]] = options[i].value;
                    }
                }

                if (this.protocolListAll[index].data.result == 0) {
                    this.protocolListAll[index].data.result = this.translate.instant('betriebsbereit');
                }
                if (this.protocolListAll[index].data.result == 1) {
                    this.protocolListAll[index].data.result = this.translate.instant('reparieren');
                }
                if (this.protocolListAll[index].data.result == 3) {
                    this.protocolListAll[index].data.result = this.translate.instant('unauffindbar');
                }
                if ((this.protocolListAll[index].data.result == 2) || (this.protocolListAll[index].data.result == 4)) {
                    this.protocolListAll[index].data.result = this.translate.instant('ausmustern');
                }
            }

            this.selectedColumns = JSON.parse(JSON.stringify(this.cols));
            for (let k = 0; k < this.cols.length; k++) {
                this.columnFilterValues[this.cols[k].field] = '';
            }
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

            this.generate_protocolList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
            this.funcHeightCalc();
            loader.dismiss();
        });
    }

    title_translate(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {

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

            let title = nodes[i].data.title;
            try {
                title = JSON.parse(nodes[i].data.title);
                title = title[this.lang];
            } catch {
                console.error('JSON.parse i:' + i, nodes[i].data );
            }
            nodes[i].data.title = title ;
        }
    }

    try_filter(node: TreeNode): boolean {
        let ret: any = false;
        for (let i = 0; i < this.cols.length; i++) {
            if (this.columnFilterValues['search_all'].trim().length > 0
                && node.data[this.cols[i].field] != undefined
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
            if (this.columnFilterValues[this.cols[i].field]) {
                if ( this.columnFilterValues[this.cols[i].field].trim().length > 0
                    && (node.data[this.cols[i].field] == undefined || (node.data[this.cols[i].field] != undefined
                        && node.data[this.cols[i].field].toString().
                                                        toLowerCase().
                                                        indexOf(this.columnFilterValues[this.cols[i].field].trim().toLowerCase()) < 0))) {
                    ret = false;
                }
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
        this.modelChanged.next(this.columnFilterValues);
    }

    cancel_filters(cancel_type) {
        console.log('cancel_filters');
        this.menuItems[5].items[0]['disabled'] = true;
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
            json += '"search_all":""}';
            this.columnFilterValues = JSON.parse(json);
        }
        localStorage.setItem('filter_values_protocol', JSON.stringify(this.columnFilterValues));
        this.generate_protocolList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
    }

    generate_protocolList(start_index: number, end_index: number, sort_field, sort_order) {
        // console.log('generate_protocolList', this.isFilterOn());

        if (!this.isFilterOn()) {
            this.protocolListView = JSON.parse(JSON.stringify(this.protocolListAll));
        } else {
            const try_list = JSON.parse(JSON.stringify(this.protocolListAll));
            this.dir_try_filter(try_list);
            this.protocolListView = try_list;
            this.protocolListSearch = try_list;
        }

        if (sort_field != null) {
            this.protocolListView = this.protocolListView.sort((a, b) => {
                let value1 = a.data[sort_field];
                let value2 = b.data[sort_field];

                if (this.apiService.isEmpty(value1) && !this.apiService.isEmpty(value2)) {
                    return-1 * sort_order;
                } else if (!this.apiService.isEmpty(value1) && this.apiService.isEmpty(value2)) {
                    return 1 * sort_order;
                } else if (this.apiService.isEmpty(value1) && this.apiService.isEmpty(value2)) {
                    return 0;
                } else if ( !isNaN(Number(value1)) && !isNaN(Number(value2)) && Number(value1) > Number(value2)) {
                    return 1 * sort_order;
                } else if ( !isNaN(Number(value1)) && !isNaN(Number(value2)) && Number(value1) < Number(value2)) {
                    return -1 * sort_order;
                } else if ( value1.toLowerCase( ) > value2.toLowerCase( )) {
                    return 1 * sort_order;
                } else if ( value1.toLowerCase( ) < value2.toLowerCase( )) {
                    return -1 * sort_order;
                } else {
                    return 0;
                }
            });
        }
        this.rowRecords = this.protocolListView.length;
        this.totalRecords = this.protocolListAll.length;

        console.log('start_index - end_index :', start_index, end_index);

        if ((start_index + end_index + this.rowCount) >= this.rowRecords) {
            this.protocolListView = this.protocolListView.slice(start_index, this.rowRecords);
        } else {
            this.protocolListView = this.protocolListView.slice(start_index, (start_index + end_index));
        }

        if (this.protocolListView.length > 0) {
            if (this.isFilterOn()) {
                this.menuItems[5].items[0]['disabled'] = false;
            } else {
                this.menuItems[5].items[0]['disabled'] = true;
            }
            this.menuItems[5].items[1]['disabled'] = false;
            this.menuItems[5].items[2]['disabled'] = false;
        } else {
            this.menuItems[5].items[0]['disabled'] = true;
            this.menuItems[5].items[1]['disabled'] = true;
            this.menuItems[5].items[2]['disabled'] = true;
        }

        let progressBar;
        if (this.totalRecords > 0 ) {
            progressBar = Math.round(this.rowRecords * 100 / this.totalRecords);
        } else {
            progressBar = 100;
        }
        this.events.publish('progressBar', progressBar);
        this.events.publish('rowRecords', this.rowRecords);
        this.events.publish('totalRecords', this.totalRecords);

        if (localStorage.getItem('expanded_nodes_protocol') != undefined) {
            this.expandChildren(this.protocolListView, JSON.parse(localStorage.getItem('expanded_nodes_protocol')));
        }
    }

    nodeSelect(event, selectedNode) {
        this.selectedNode.data = event.node.data;
        this.selectedRow = selectedNode.length;
        if (selectedNode.length == 0) {
            this.menuItems[0].disabled = true;
            this.menuItems[1].disabled = true;
        } else if (selectedNode.length == 1) {
            this.selectedNode.data = this.selectedNode[0].data;
            this.menuItems[0].disabled = false;
            this.menuItems[1].disabled = false;
        } else if (selectedNode.length > 1) {
            this.menuItems[0].disabled = true;
            this.menuItems[1].disabled = false;
        }
    }

    menu_new() {
        console.log('menu_new', this.idCustomer);
        let data = {
            id: 0,
            idCustomer: this.idCustomer
        };
        this.dataService.setData(data);
        this.navCtrl.navigateForward(['/protocol-edit']);
    }

    menu_edit() {
        // console.log('menu_edit', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                let data = {
                    id: this.selectedNode.data.id,
                    idCustomer: this.idCustomer
                };
                this.dataService.setData(data);
                this.navCtrl.navigateForward(['/protocol-edit']);
            }
        }
    }

    menu_view() {
        console.log('menu_view', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const id = parseInt(this.selectedNode.data.id);
                console.log('menu_view id', id);

                let data = {
                    idCustomer: this.idCustomer,
                    customer_number: this.customer_number,
                    idProtocol: id
                  };
                this.dataService.setData(data);
                this.navCtrl.navigateForward(['/protocol-details/' + id]);
            }
        }
    }

    create_template() {
        let data = {
            idCustomer: this.idCustomer
        };
        this.dataService.setData(data);
        this.navCtrl.navigateForward(['/protocol-template']);
    }

    async excel_export() {
        console.log('excel_view');

        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        const data: any = [];
        this.allnodes = [];
        if (this.isFilterOn()) {
            this.data_tree(this.protocolListSearch);
        } else {
            this.data_tree(this.protocolListAll);
        }
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
            // console.log('>>json :', json);
            data.push(json);
        }
        console.log('data :', data);
        this.excelService.exportAsExcelFile(data, 'protocol_view.xlsx');
        loader.dismiss();
    }

    async pdf_export() {
        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        const pdfTitle: any = this.translate.instant('Protokolle') + ' ' + this.translate.instant('Liste');
        let columns: any[] = [];
        const widthsArray: string[] = [];
        const bodyArray: any[] = [];
        this.allnodes = [];
        let rowArray: any[] = [];
        if (this.isFilterOn()) {
            this.data_tree(this.protocolListSearch);
        } else {
            this.data_tree(this.protocolListAll);
        }
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
        loader.dismiss();
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
        this.show_alert(inputs);
    }

    async show_alert(inputs) {
        const alert = await this.alertCtrl.create({
            header: this.translate.instant('Spalten Auswählen'), inputs: inputs,
            buttons: [
                {
                    text: this.translate.instant('Alle Abwählen'),
                    handler: data => {
                        inputs = [];
                        for (let i = 0; i < this.cols.length; i++) {
                            inputs.push({
                                type: 'checkbox',
                                label: this.cols[i].header,
                                value: this.cols[i].field,
                                checked: false
                            });
                        }
                        return this.show_alert(inputs);
                    }
                },
                {
                    text: this.translate.instant('Wählen Alle'),
                    handler: data => {
                        inputs = [];
                        for (let i = 0; i < this.cols.length; i++) {
                            inputs.push({
                                type: 'checkbox',
                                label: this.cols[i].header,
                                value: this.cols[i].field,
                                checked: true
                            });
                        }
                        return this.show_alert(inputs);
                    }
                },
                {
                    text: this.translate.instant('abbrechen'),
                    handler: data => {
                        //  alert.dismiss();
                    }
                },
                {
                    text: this.translate.instant('okay'),
                    handler: data => {
                        console.log('Checkbox data:', data);
                        this.selectedColumns = this.cols.filter(function (element, index, array) { return data.includes(element.field); });
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
            if (this.columnFilterValues[this.cols[i].field] ) {
                if (this.columnFilterValues[this.cols[i].field].trim().length > 0) {
                    ret = true;
                }
            }
        }
        if (this.columnFilterValues['search_all'].trim().length > 0) {
            ret = true;
        }
        return ret;
    }

    expandChildren(nodes: TreeNode[], expended: string[]) {
        for (let i = 0; i < nodes.length; i++) {
            if (expended != null) {
                if (nodes[i].children && expended.find(x => x == nodes[i].data['id'])) {
                    nodes[i].expanded = true;
                    this.expandChildren(nodes[i].children, expended);
                }
            }
        }
    }

    
    onColResize(event) {
        let index  = this.apiService.columnIndex(event.element);
        this.selectedColumns[index].width = event.element.offsetWidth+"px";
        let width2 = this.selectedColumns[index+1].width;
        this.selectedColumns[index+1].width = parseInt(width2.replace('px',''))-event.delta + "px";
        localStorage.setItem('show_columns_protocol', JSON.stringify(this.selectedColumns));
    }

    onColReorder(event) {
        this.selectedColumns = event.columns;
        localStorage.setItem('show_columns_protocol', JSON.stringify(this.selectedColumns));
    }

    onNodeExpand(event) {
        this.expendedNodes.push(event.node.data['id']);
        localStorage.setItem('expanded_nodes_protocol', JSON.stringify(this.expendedNodes));
    }

    onNodeCollapse(event) {
        this.expendedNodes = this.expendedNodes.filter(function (element, index, array) { return element != event.node.data['id']; });
        localStorage.setItem('expanded_nodes_protocol', JSON.stringify(this.expendedNodes));
    }

    protocolDeactivate() {
        console.log('delete');
        this.showConfirmAlert(this.selectedNode.data.id);
    }

    async deSelectAll() {
        if (this.selectedRow > 0) {
            const alert = await this.alertCtrl.create({
                header: this.translate.instant('Achtung'),
                message: this.translate.instant('Möchten Sie wirklich alle abwählen'),
                buttons: [{
                    text: this.translate.instant('nein'),
                    handler: data => {
                        //  alert.dismiss();
                    }
                },
                {
                    text: this.translate.instant('ja'),
                    handler: data => {
                        this.selectedNode = [];
                        this.selectedRow = 0;
                        this.menuItems[0].disabled = true;
                        this.menuItems[1].disabled = true;
                    }
                }
                ]
            });
            await alert.present();
        }
    }

    showConfirmAlert(idProtocol) {
        const alert = this.alertCtrl.create({
            header: this.translate.instant('Achtung'),
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
                        this.selectedNode.forEach(element => {
                            this.apiService.pvs4_get_protocol(element.data.id).then((result: any) => {
                                const activProtocol = result.obj;

                                activProtocol.active = 0;
                                this.apiService.pvs4_set_protocol(activProtocol).then((setResult: any) => {
                                    console.log('result: ', setResult);
                                    this.page_load();
                                });
                            });
                        });
                    }
                }
            ]
        }).then(x => x.present());
    }

}
