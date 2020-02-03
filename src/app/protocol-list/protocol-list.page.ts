import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, Events, LoadingController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode,  LazyLoadEvent } from 'primeng/api';
import { ExcelService } from '../services/excel';
import { PdfExportService } from '../services/pdf-export';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SystemService } from '../services/system';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

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
    public columnFilterValues = { protocol_number: '',
                                  title: '',
                                  product: '',
                                  id: '',
                                  protocol_date: '',
                                  search_all: '' };
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
    public rowCount = 20;
    public sortedColumn = { sort_field : null, sort_order : 0 };
    public selectMode: boolean;
    public workMode: boolean;
    public deleteMode: boolean;
    public pdfMode: boolean;
    public excelMode: boolean;
    public selCols: any[] = [];

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
        private loadingCtrl: LoadingController,
        private screenOrientation: ScreenOrientation) {
            this.modelChanged.pipe(
                debounceTime(700))
                .subscribe(model => {
                    this.generate_protocolList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
                    localStorage.setItem('filter_values_protocol', JSON.stringify(this.columnFilterValues));
            });
    }

    ngOnInit() {
        this.cols = [
            { field: 'work_column', header: '', width: '60px' },
            { field: 'protocol_number', header: this.translate.instant('Protokoll'), width: '100px' },
            { field: 'title', header: this.translate.instant('Bezeichnung'), width: '200px' },
            { field: 'product', header: this.translate.instant('Produkt'), width: '200px' },
            { field: 'id', header: 'DB-ID', width: '95px' },
            { field: 'protocol_date', header: this.translate.instant('Datum'), width: '95px'},
            { field: 'result', header: this.translate.instant('Prüfergebnis'), width: '160px' },
            { field: 'protocol_date_next', header: this.translate.instant('nächste Prüfung'), width: '95px' }
        ];

        this.filterCols = [
            'work_column',
            'protocol_number',
            'title',
            'product',
            'id',
            'protocol_date',
            'result',
            'protocol_date_next',
            'search_all'
        ];
        this.selectedColumns = JSON.parse(JSON.stringify(this.cols));
        this.selCols = JSON.parse(JSON.stringify(this.cols));

        this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));
        if (localStorage.getItem('sort_column_protocol') != undefined) {
            this.sortedColumn = JSON.parse(localStorage.getItem('sort_column_protocol'));
        }
        console.log('ProductListPage idCustomer:', this.idCustomer, this.system.platform);

    }

    ionViewWillEnter() {
        this.work_mode(0);
        this.page_load();
    }

    work_mode(mode: number) {
        console.log('work_mode()', mode);
        if (mode === 0) {
            this.workMode = false;
            this.deleteMode = false;
            this.selectMode = false;
            this.pdfMode = false;
            this.excelMode = false;
            this.selectedNode = [];
        } else if (mode === 1) {
            if (this.userdata.role_set.edit_products != true) { return; }
            this.workMode = true;
            this.deleteMode = true;
            this.selectMode = true;
        } else if (mode === 2) {
            this.workMode = true;
            this.selectMode = true;
            this.pdfMode = true;
        } else if (mode === 3) {
            this.workMode = true;
            this.selectMode = true;
            this.excelMode = true;
        }
    }

    update(data: any): void {
        console.log('update():', data );
        if (data.lable === 'searchText') {
            this.columnFilterValues['search_all'] = data.text;
            this.generate_protocolList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
            localStorage.setItem('filter_values_protocol', JSON.stringify(this.columnFilterValues));
        }
        if (data.lable === 'toggleFilter') {
            this.menu_filter();
        }
        if (data.lable === 'showColumns') {
            this.show_columns();
        }
    }

    onResize(event) {
        // console.log('onResize');
        this.funcHeightCalc();
    }

    async loadNodes(event: LazyLoadEvent) {
        if (this.totalRecords > 0) {
            if (event.sortField && event.sortField.length > 0) {
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
        /*
        console.log('screenOrientation :', this.screenOrientation.type); // logs the current orientation, example: 'landscape'

        // set to landscape
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

        // allow user rotate
        this.screenOrientation.unlock();

        // detect orientation changes
        this.screenOrientation.onChange().subscribe(() => {
            console.log('Orientation Changed');
        });
        */

        let x = this.divHeightCalc.nativeElement.scrollHeight;
        let y = x;
        if (x == 0) { x = 550; }
        if (this.system.platform == 2) {
            if (this.screenOrientation.type == 'portrait-primary') {
                x = 875;
                if (y > x) {
                    x = y - 5;
                }
            }
            if (this.screenOrientation.type == 'landscape-primary') {
                x = 615;
                if (y > x) {
                    x = y - 5;
                }
            }
        }
        if (this.splitFilter) { x = x - 51; }
        // if (x < 80) { x = 80; }
        this.heightCalc = x + 'px';
        console.log('funcHeightCalc:', x , this.heightCalc  );
    }

    async page_load() {
        console.log('page_load CustomerTablePage');

        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        let progressBar = 0;
        this.rowRecords = 0;
        this.totalRecords = 0;
        this.selectedNode = [];
        this.selectedRow = 0;
        this.events.publish('progressBar', progressBar);
        this.events.publish('rowRecords', this.rowRecords);
        this.events.publish('totalRecords', this.totalRecords);

        this.apiService.pvs4_get_customer(this.idCustomer).then((result: any) => {
            this.activCustomer = result.obj;
            this.customer_number = this.activCustomer.customer_number;
        });
        // console.log('ProtocolListPage idCustomer:', this.idCustomer);

        this.apiService.pvs4_get_protocol_list(this.idCustomer).then((result: any) => {
            // console.log('result protocol :', result);
            this.protocolListAll = JSON.parse(JSON.stringify(result.list));
            // console.log('protocolListAll :', this.protocolListAll);

            this.title_translate(this.protocolListAll);

            for (let index = 0; index < this.protocolListAll.length; index++) {
                let pipe = new DatePipe('en-US');
                try {
                    let protocolDate = new Date(this.protocolListAll[index].data.protocol_date.replace(' ', 'T')).toISOString();
                    this.protocolListAll[index].data.protocol_date = pipe.transform(protocolDate, 'dd.MM.yyyy');
                } catch (e) {
                    console.error('protocol_date error:' + index , this.protocolListAll[index].data.protocol_date, e );
                }
                try {
                    if(this.protocolListAll[index].data.protocol_date_next != '0000-00-00'){
                        let next = new Date(this.protocolListAll[index].data.protocol_date_next.replace(' ', 'T')).toISOString();
                        this.protocolListAll[index].data.protocol_date_next = pipe.transform(next, 'dd.MM.yyyy');
                    }
                } catch(e) {
                    console.error('protocol_date_next error:' + index , this.protocolListAll[index].data.protocol_date_next, e );
                }

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
                    options[i].type = parseInt(options[i].type);
                    if (options[i].type == 0) {
                        if (options[i].value == true || options[i].value == 'true') {
                            options[i].value = '√';
                        }
                        if (options[i].value == false || options[i].value == 'false') {
                             options[i].value = 'x';
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
            if (localStorage.getItem('selcols_protocol') != undefined) {
                this.selCols = JSON.parse(localStorage.getItem('selcols_protocol'));
            } else {
                this.selCols = this.cols;
                localStorage.setItem('selcols_protocol', JSON.stringify(this.selCols));
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
                if (typeof value1 === 'boolean') {
                    if (value1 === true) { value1 = '1'; } else { value1 = '0'; }
                }
                if (typeof value2 === 'boolean') {
                    if (value2 === true) { value2 = '1'; } else { value2 = '0'; }
                }
                if (typeof value1 === 'undefined') {
                    return -1 * sort_order;
                }
                if (typeof value2 === 'undefined') {
                    return 1 * sort_order;
                }
                if (this.apiService.isEmpty(value1) && !this.apiService.isEmpty(value2)) {
                    return-1 * sort_order;
                } else if (!this.apiService.isEmpty(value1) && this.apiService.isEmpty(value2)) {
                    return 1 * sort_order;
                } else if (this.apiService.isEmpty(value1) && this.apiService.isEmpty(value2)) {
                    return 0;
                } else if ( !isNaN(Number(value1)) && !isNaN(Number(value2)) && (Number(value1) > Number(value2))) {
                    return 1 * sort_order;
                } else if ( !isNaN(Number(value1)) && !isNaN(Number(value2)) && (Number(value1) < Number(value2))) {
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

        // console.log('start_index - end_index :', start_index, end_index, this.protocolListView );

        if ((start_index + end_index + this.rowCount) >= this.rowRecords) {
            this.protocolListView = this.protocolListView.slice(start_index, this.rowRecords);
        } else {
            this.protocolListView = this.protocolListView.slice(start_index, (start_index + end_index));
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


    menu_new() {
        console.log('menu_new', this.idCustomer);
        let data = {
            id: 0,
            idCustomer: this.idCustomer
        };
        this.dataService.setData(data);
        this.navCtrl.navigateForward(['/protocol-edit']);
    }

    viewProtocol(field, protocol) {
        console.log('viewProtocol()', field, protocol);
        if (field.field != 'title') { return; }
        console.log('viewProtocol.id', protocol.id);
        if (protocol) {
            if (protocol.id) {
                const id = parseInt(protocol.id);
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

        try {
            const data: any = [];
            this.allnodes = [];
            if (this.isFilterOn()) {
                if (this.selectedNode.length > 0) {
                    for (let i = 0; i < this.selectedNode.length; i++) {
                        this.allnodes.push(this.selectedNode[i].data);
                    }
                } else {
                    this.data_tree(this.protocolListSearch);
                }
            } else {
                if (this.selectedNode.length > 0) {
                    for (let i = 0; i < this.selectedNode.length; i++) {
                        this.allnodes.push(this.selectedNode[i].data);
                    }
                } else {
                    this.data_tree(this.protocolListAll);
                }
            }
            for (let i = 0, len = this.allnodes.length; i < len; i++) {
                const obj = this.allnodes[i];
                obj.items = obj.items.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
                const json: any = {};
                for (let j = 0; j < this.selectedColumns.length; j++) {
                    if (this.selectedColumns[j].field === 'work_column') { continue; }
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

        } catch (e) {
            console.log('!!! Excel Error !!!');
            loader.dismiss();
        }
    }

    async pdf_export() {
        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        try {
            const pdfTitle: any = this.translate.instant('Protokolle') + ' ' + this.translate.instant('Liste');
            let columns: any[] = [];
            const widthsArray: string[] = [];
            const bodyArray: any[] = [];
            this.allnodes = [];
            let rowArray: any[] = [];
            if (this.isFilterOn()) {
                if (this.selectedNode.length > 0) {
                    for (let i = 0; i < this.selectedNode.length; i++) {
                        this.allnodes.push(this.selectedNode[i].data);
                    }
                } else {
                    this.data_tree(this.protocolListSearch);
                }
            } else {
                if (this.selectedNode.length > 0) {
                    for (let i = 0; i < this.selectedNode.length; i++) {
                        this.allnodes.push(this.selectedNode[i].data);
                    }
                } else {
                    this.data_tree(this.protocolListAll);
                }
            }
            let obj: any;
            const headerRowVisible: any = 0;
            let selectColumnsLength: any = this.selectedColumns.length;
            if (this.selectedColumns.length < 8) {
                selectColumnsLength = this.selectedColumns.length;
            } else {
                selectColumnsLength = 8;
            }
            if (selectColumnsLength == 2) {
                widthsArray.push('auto');
            } else if (selectColumnsLength == 3) {
                widthsArray.push('auto', 'auto');
            } else if (selectColumnsLength == 4) {
                widthsArray.push('auto', 'auto', 'auto');
            } else if (selectColumnsLength == 5) {
                widthsArray.push('auto', 'auto', 'auto', 'auto');
            } else if (selectColumnsLength == 6) {
                widthsArray.push('auto', 'auto', 'auto', 'auto', 'auto');
            } else if (selectColumnsLength == 7) {
                widthsArray.push('auto', 'auto', 'auto', 'auto', 'auto', 'auto');
            } else if (selectColumnsLength == 8) {
                widthsArray.push('auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto');
            }

            for (let i = 0, len = this.allnodes.length; i < len; i++) {
                obj = this.allnodes[i];
                obj.items = obj.items.replace(/(\\r\\n|\\n|\\r)/gm, ' ');

                columns = [];
                for (let k = 0; k < selectColumnsLength; k++) {
                    if (this.selectedColumns[k].field === 'work_column') { continue; }
                    columns.push({ text: this.selectedColumns[k].header, style: 'header' });
                }
                bodyArray.push(columns);

                rowArray = [];
                for (let j = 0; j < selectColumnsLength; j++) {
                    if (this.selectedColumns[j].field === 'work_column') { continue; }
                    if (obj[this.selectedColumns[j].field]) {
                        rowArray.push(obj[this.selectedColumns[j].field]);
                    } else {
                        rowArray.push('');
                    }
                }
                bodyArray.push(rowArray);

                for (let l = selectColumnsLength; l < this.selectedColumns.length; l++) {
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
                    for (let j = 0; j < selectColumnsLength - 1; j++) {
                        rowArray.push({text: '', border: [false, false, false, false]});
                    }
                    bodyArray.push(rowArray);
            }

            this.pdf.get_ListDocDefinition(bodyArray,
                                        widthsArray,
                                        headerRowVisible,
                                        pdfTitle, this.translate.instant('Protokolle') + this.translate.instant('Liste') + '.pdf');
            loader.dismiss();

        } catch (e) {
            console.log('!!! PDF Error !!!');
            loader.dismiss();
        }
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
            if (this.cols[i].field === 'work_column') { continue; }
            if (this.cols[i].field === 'protocol_number') { continue; }
            if (this.cols[i].field === 'title') { continue; }
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
                            if (this.cols[i].field === 'work_column') { continue; }
                            if (this.cols[i].field === 'protocol_number') { continue; }
                            if (this.cols[i].field === 'title') { continue; }
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
                            if (this.cols[i].field === 'work_column') { continue; }
                            if (this.cols[i].field === 'protocol_number') { continue; }
                            if (this.cols[i].field === 'title') { continue; }
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
                        this.selectedColumns.unshift(this.cols[2]);
                        this.selectedColumns.unshift(this.cols[1]);
                        this.selectedColumns.unshift(this.cols[0]);
                        this.selCols = this.cols.filter(function (element, index, array) { return data.includes(element.field); });
                        this.selCols.unshift(this.cols[2]);
                        this.selCols.unshift(this.cols[1]);
                        this.selCols.unshift(this.cols[0]);
                        localStorage.setItem('show_columns_protocol', JSON.stringify(this.selectedColumns));
                        localStorage.setItem('selcols_protocol', JSON.stringify(this.selCols));
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
        this.selectedColumns[index].width = event.element.offsetWidth + 'px';
        let width2 = this.selectedColumns[index + 1].width;
        this.selectedColumns[index + 1].width = parseInt(width2.replace('px', '')) - event.delta + 'px';
        localStorage.setItem('show_columns_protocol', JSON.stringify(this.selectedColumns));
    }

    onColReorder(event) {
        console.log('onColReorder()', event );
        this.selCols = JSON.parse(localStorage.getItem('selcols_protocol'));
        const dragIndex = event.dragIndex + 1;
        const dropIndex = event.dropIndex + 1;
        function array_move(arr, old_index, new_index) {
            new_index =((new_index % arr.length) + arr.length) % arr.length;
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        }
        if (dragIndex > 2 && dropIndex > 2) {
            array_move(this.selCols, dragIndex, dropIndex);
        }
        this.selectedColumns = this.selCols;
        // this.selectedColumns = event.columns;
        // this.fixReorder();
        localStorage.setItem('show_columns_protocol', JSON.stringify(this.selectedColumns));
        localStorage.setItem('selcols_protocol', JSON.stringify(this.selCols));
    }

    // fixReorder() {
    //     console.log('fixReorder()', this.selectedColumns );
    //     let cols = [
    //         { field: 'work_column', header: '', width: '60px' },
    //         { field: 'protocol_number', header: this.translate.instant('Protokoll'), width: '100px' },
    //         { field: 'title', header: this.translate.instant('Bezeichnung'), width: '200px' }
    //     ];
    //     for (let i = 0; i < this.selectedColumns.length; i++) {
    //         if (this.selectedColumns[i].field === 'work_column') { continue; }
    //         if (this.selectedColumns[i].field === 'protocol_number') { continue; }
    //         if (this.selectedColumns[i].field === 'title') { continue; }
    //         cols.push(this.selectedColumns[i]);
    //     }
    //     this.selectedColumns = cols;
    // }

    onNodeExpand(event) {
        this.expendedNodes.push(event.node.data['id']);
        localStorage.setItem('expanded_nodes_protocol', JSON.stringify(this.expendedNodes));
    }

    onNodeCollapse(event) {
        this.expendedNodes = this.expendedNodes.filter(function (element, index, array) { return element != event.node.data['id']; });
        localStorage.setItem('expanded_nodes_protocol', JSON.stringify(this.expendedNodes));
    }

    async deSelectAll() {
        console.log('selectedNode id :', this.selectedNode);
        if (this.selectedNode.length > 0) {
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
                        // this.selectedRow = 0;
                    }
                }
                ]
            });
            await alert.present();
        }
    }

    protocolDeactivate() {
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
                        console.log('selectedNode id :', this.selectedNode);
                        if (this.selectedNode) {
                            for (let i = 0; i < this.selectedNode.length; i++) {
                                console.log('selectedNode id :', this.selectedNode[i]);
                                this.apiService.pvs4_get_protocol(this.selectedNode[i].data.id).then((result: any) => {
                                    const activProtocol = result.obj;
                                    activProtocol.active = 0;
                                    this.apiService.pvs4_set_protocol(activProtocol).then((setResult: any) => {
                                        console.log('result: ', setResult);
                                        this.work_mode(0);
                                        this.page_load();
                                    });
                                });
                            }
                        }
                    }
                }
            ]
        }).then(x => x.present());
    }

}
