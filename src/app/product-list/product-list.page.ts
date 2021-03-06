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
import { ProductMigrationPage } from '../product-migration/product-migration.page';
import { ActivatedRoute } from '@angular/router';
import { SlideMenu } from 'primeng/primeng';
import { DataService } from '../services/data.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProductCopyPage } from '../product-copy/product-copy.page';
import { SystemService } from '../services/system';
import * as moment from 'moment';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.page.html',
    styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
    public productListAll: TreeNode[] = [];
    public productListView: TreeNode[] = [];
    public productListSearch: TreeNode[] = [];
    public cols: any[] = [];
    public selectedNode: any;
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public xlsHeader: any[];
    public splitFilter = false;
    public idCustomer = 0;
    public heightCalc: any;
    public move_id = 0;
    public move_to = 0;
    public move_obj: any = {};
    public columnFilterValues = { title: '',
                                  nfc_tag_id: '',
                                  id: '',
                                  id_number: '',
                                  articel_no: '',
                                  customer_description: '',
                                  check_interval: '',
                                  search_all: '' };
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public totalRecords: number;
    public rowRecords: number;
    public childRecords: number;
    public lang: string = localStorage.getItem('lang');
    public navigationSubscription: any;
    public childCount: number;
    public modelChanged: Subject<any> = new Subject<any>();
    public selectedRow: number;
    public rowHeight = 26;
    public rowCount = 20;
    public showBasicInfo = true;
    public lengthBasicInfo = 90;
    public sortedColumn = { sort_field : null, sort_order : 0 };
    public showActivePassiveProduct: boolean;
    public selectMode: boolean;
    public workMode: boolean;
    public editMode: boolean;
    public moveMode: boolean;
    public deleteMode: boolean;
    public protocolMode: boolean;
    public pdfMode: boolean;
    public excelMode: boolean;
    public copyMode: boolean;
    public migrationMode: boolean;
    public historyMode: boolean;
    public selCols: any[] = [];

    @ViewChild('tt') dataTable: TreeTable;
    @ViewChild('divHeightCalc') divHeightCalc: any;
    @ViewChild('menu') menu: SlideMenu;

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
                    this.generate_productList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
                    localStorage.setItem('filter_values_product', JSON.stringify(this.columnFilterValues));
            });

    }
    @ViewChild('fab1') fab1: any;
    @ViewChild('fab2') fab2: any;

    fabClick(nr: number) {
        console.log('fabClick():', nr);
        if (nr === 1) { this.fab2.close(); }
        if ((nr === 2) && this.fab1) { this.fab1.close(); }
    }

    update(data: any): void {
        console.log('update():', data );
        if (data.lable === 'searchText') {
            this.columnFilterValues['search_all'] = data.text;
            this.generate_productList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
            localStorage.setItem('filter_values_product', JSON.stringify(this.columnFilterValues));
        }
        if (data.lable === 'toggleFilter') {
            this.menu_filter();
        }
        if (data.lable === 'showColumns') {
            this.show_columns();
        }
    }

    lengthOfBasis() {
        const alert = this.alertCtrl.create({
            header: this.translate.instant('Basisinformation'),
            message: this.translate.instant('Anzahl der maximal angezeigten Zeichen (min:10, max:300)'),
            inputs: [
                {
                  name: 'countC',
                  placeholder: String(this.lengthBasicInfo)
                }
              ],
            buttons: [
                {
                    text: this.translate.instant('okay'),
                    handler: (e) => {
                        console.log('Basisinformation:', e);
                        let x = parseInt(e.countC);
                        if ((x >= 10) && (x <= 300)) { this.lengthBasicInfo = x; }
                        for (let i = 0; i < this.productListView.length; i++ ) {
                            let info = this.productListView[i].data['_basic_info_'];
                            if (info.length > this.lengthBasicInfo + 3) {
                                info = info.substring(0, this.lengthBasicInfo) + '...';
                            }
                            this.productListView[i].data['_basic_info_show_'] = info;
                        }
                    }
                }
            ]
        }).then(x => x.present());
        this.showBasicInfo = true;
    }

    ngOnInit() {
        this.cols = [ 
            { field: 'work_column', header: '', width: '60px' },
            { field: 'nfc_tag_id', header: 'NFC', width: '80px' },
            { field: 'title', header: this.translate.instant('Bezeichnung'), width: '220px' },
            { field: 'id_number', header: 'ID', width: '85px' },
            { field: 'id', header: 'DB-ID', width: '85px' },
            { field: 'articel_no', header: this.translate.instant('Artikel-Nr.'), width: '100px' },
            { editField: true, editFieldEN:'customer_description', field: 'customer_description', header: this.translate.instant('Kundenbezeichnung'), width: '200px' },
            { field: 'last_protocol_date', header: this.translate.instant('letzte Prüfung'), width: '100px' },
            { field: 'last_protocol_next', header: this.translate.instant('nächste Prüfung'), width: '100px' },
            { field: 'check_interval', header: this.translate.instant('Intervall Prüfen'), width: '130px' }
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
        this.showActivePassiveProduct = true;
        this.work_mode(0);
        this.page_load();
    }

    onResize(event) {
        // console.log('onResize');
        this.funcHeightCalc();
    }

    async loadNodes(event: LazyLoadEvent) {
        console.log('loadNodes:', event);
        setTimeout(() => {
            if (this.totalRecords > 0) {
                if (event.sortField && event.sortField.length > 0) {
                    this.sortedColumn.sort_field = event.sortField;
                    this.sortedColumn.sort_order = event.sortOrder;
                    localStorage.setItem('sort_column_product', JSON.stringify(this.sortedColumn));
                }
                this.generate_productList(event.first, event.rows, event.sortField, event.sortOrder);
            }
        }, 100);
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

    prepare_line( line: any ) {
        let pr = line.data.last_protocol;
        if (pr) {
            if (pr.length > 0) {
                try {
                    pr = JSON.parse(pr);
                    if (pr.protocol_date) {
                        line.data.last_protocol_date = this.apiService.mysqlDate2view(pr.protocol_date);
                    }
                    line.data.last_protocol_next_color = 'rgb(74, 83, 86)';
                    if (pr.protocol_date_next) {
                        line.data.last_protocol_next = this.apiService.mysqlDate2view(pr.protocol_date_next);
                        let x = moment(pr.protocol_date_next, 'YYYY-M-D');
                        let y = moment();
                        let diffDays = x.diff(y, 'days');
                        if (diffDays < 90) { line.data.last_protocol_next_color = '#f1c40f'; }
                        if (diffDays < 30) { line.data.last_protocol_next_color = '#e74c3c'; }
                        // console.log('x :', pr.protocol_date_next ,  diffDays);
                    }

                    if (pr.result) {
                        if (pr.result == 1) {
                            line.data.last_protocol_next = this.translate.instant('reparieren');
                            line.data.last_protocol_next_color = '#f1c40f';
                        }
                        if (pr.result == 3) {
                            line.data.last_protocol_next = this.translate.instant('unauffindbar');
                            line.data.last_protocol_next_color = '#e74c3c';
                        }
                        if ((pr.result == 2) || (pr.result == 4)) {
                            line.data.last_protocol_next = this.translate.instant('ausmustern');
                            line.data.last_protocol_next_color = '#C558D3';
                        }
                    }
                } catch (e) {
                    console.error('JSON.parse(pr) err :', e);
                    console.log('pr :', pr);
                }
            }
        }

        // options
        let options = [];
        if (line.data.items) {
            // console.log("items :", line.data.items);
            try {
                options = JSON.parse(line.data.items);
                // console.log("options :", options);
            } catch (e) {
                console.error('JSON.parse options err :', e);
                console.log('options :', line.data);
            }
        }
        // console.log('options :', options);

        if (options == null) { options = []; }
        let info = '';
        for (let i = 0; i < options.length; i++) {
            // console.log('this.lang :', this.lang);
            if (!this.cols.find(x => x.field === options[i].title[this.lang])) {
                let obj = { editField: false, editFieldEN: '', field: options[i].title[this.lang],  header: options[i].title[this.lang] , width: '200px'};
                if(options[i].title['en'] === 'Location' ) {
                    obj.editField = true;
                    obj.editFieldEN = 'Location' ; 
                }
                if(options[i].title['en'] === 'Note' ) {
                    obj.editField = true;
                    obj.editFieldEN = 'Note' ;
                }
                this.cols.push(obj);
                // console.log('this.lang :', options[i].title[this.lang]);
            }

            if (options[i].type == 0) { 
                if (options[i].value == true) {
                    options[i].value = '√';
                }
                if (options[i].value == false) {
                     options[i].value = 'x';
                }
                line.data[options[i].title[this.lang]] = options[i].value;
            } else if (options[i].type == 1) {
                for (let j = 0; j < options[i].options.length; j++) {
                    if (options[i].value == options[i].options[j].de ||
                        options[i].value == options[i].options[j].en ||
                        options[i].value == options[i].options[j].fr ||
                        options[i].value == options[i].options[j].it
                        ) {
                        options[i].value = options[i].options[j][this.lang];
                    }
                }
                line.data[options[i].title[this.lang]] = options[i].value;
            } else if (options[i].type == 4) {
                const pipe = new DatePipe('en-US');
                if (options[i].value && options[i].value.length == 5 ) {
                    line.data[options[i].title[this.lang]] = options[i].value;
                } else {
                    line.data[options[i].title[this.lang]] = pipe.transform(options[i].value, 'HH:mm');
                }
            } else if (options[i].type == 5) {
                const pipe = new DatePipe('en-US');
                line.data[options[i].title[this.lang]] = pipe.transform(options[i].value, 'dd.MM.yyyy');
            } else if (options[i].type == 6) {
                try{
                    line.data[options[i].title[this.lang]] = '(' + options[i].value.lat.toString().substring(0, 6) + ',' + options[i].value.long.toString().substring(0, 6) + ')';
                }catch(e){
                    console.error('options[i].value.lat or options[i].value.long err :', e);
                    console.error( options[i] );
                    line.data[options[i].title[this.lang]] = '(?,?)';
                }              
            } else if (options[i].type == 2) {
                if(options[i].value === null) options[i].value="";
                if(options[i].value === undefined) options[i].value="";
                line.data[options[i].title[this.lang]] = options[i].value;
            } else {
                line.data[options[i].title[this.lang]] = options[i].value;
            }

            if ((options[i].type != 0) && (options[i].type != 6)) {
                let t = line.data[options[i].title[this.lang]] ;
                let h = '';
                // console.log(options[i].base);
                if (options[i].base === undefined) { options[i].base = true; }
                if (options[i].base) {
                    if (t) { h = t.trim(); }
                    if ( h !== '') {
                        if ( info !== '') { info += ', '; }
                        info += h;
                    }
                }
            }
        }
        // console.log("index :", index);
        line.data['_basic_info_'] = info;
        if (info.length > this.lengthBasicInfo + 3) {
            info = info.substring(0, this.lengthBasicInfo) + '...';
        }
        line.data['_basic_info_show_'] = info;

        // children
        if(line.children){
            // console.log('prepare_line', line.children);
            for (let i = 0; i < line.children.length; i++) {
                this.prepare_line(line.children[i]);
            }
        }

    }

    async page_load() {
        console.log('page_load ProductListPage');

        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        let progressBar = 0;
        this.rowRecords = 0;
        this.totalRecords = 0;
        this.childCount = 0;
        this.selectedNode = [];
        this.selectedRow = 0;
        this.events.publish('progressBar', progressBar);
        this.events.publish('rowRecords', this.rowRecords);
        this.events.publish('totalRecords', this.totalRecords);

        this.apiService.pvs4_get_product_list(this.idCustomer, this.showActivePassiveProduct).then((result: any) => {
            console.log('pvs4_get_product_list ok');
            const list = JSON.parse(JSON.stringify(result.list));
            this.productListAll = list;
            this.childRecords = 0;
            this.data_tree(this.productListAll);
            this.totalRecords = this.productListAll.length + this.childRecords;
            console.log('total records :', this.totalRecords);

            let json = '{';
            for (let j = 0; j < this.cols.length; j++) {
                json += '"' + this.cols[j].field + '":""';
                json += ',';
            }
            json += '"search_all":""}';
                // console.log('columnFilterValues :', json);
            try {
                this.columnFilterValues = JSON.parse(json);
                this.selectedColumns = JSON.parse(JSON.stringify(this.cols));
                if (localStorage.getItem('filter_values_product') != undefined) {
                    this.columnFilterValues = JSON.parse(localStorage.getItem('filter_values_product'));
                }
                if (localStorage.getItem('split_filter_product') != undefined) {
                    this.splitFilter = JSON.parse(localStorage.getItem('split_filter_product'));
                    this.funcHeightCalc();
                }
                if (localStorage.getItem('show_columns_product') != undefined) {
                    this.selectedColumns = JSON.parse(localStorage.getItem('show_columns_product'));
                    this.fixReorder();
                }
                if (localStorage.getItem('selcols_product') != undefined) {
                    this.selCols = JSON.parse(localStorage.getItem('selcols_product'));
                } else {
                    this.selCols = this.cols;
                    localStorage.setItem('selcols_product', JSON.stringify(this.selCols));
                }
            } catch (e) {
                console.error('JSON.parse filter err :', e);
                console.log('columnFilterValues', json);
            }

            this.title_translate(this.productListAll);
            console.log('title_translate ok');

            for (let index = 0; index < this.productListAll.length; index++) {
                // last_protocol & last_protocol_next
                this.prepare_line(this.productListAll[index]);
            }

            this.generate_productList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
            loader.dismiss();
        });
        this.funcHeightCalc();
    }

    async deSelectAll() {
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
                    }
                }
                ]
            });
            await alert.present();
        }
    }

    title_translate(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            /*if(nodes[i].data.nfc_tag_id) {
                nodes[i].data.nfc_tag_id = true;
            } else {
                nodes[i].data.nfc_tag_id = false;
            }*/
            let title = nodes[i].data.title;

            try {
                title = JSON.parse(nodes[i].data.title);
                // console.log("options :", options);
            } catch (e) {
                 console.error('JSON.parse options err :', e);
                 console.log('title :', nodes[i].data, title);
            }

            nodes[i].data.titleJson = title;
            nodes[i].data.title = title[this.lang];
            if (nodes[i].children && nodes[i].children.length > 0) {
                this.title_translate(nodes[i].children);
            }
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
                if (this.columnFilterValues[this.cols[i].field].trim().length > 0
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
        let del_ret = false;
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].children) {
                const ret = this.dir_try_filter(nodes[i].children);
                if (ret == true) {
                    del_ret = true;
                }
                if (nodes[i].children.length <= 0) {
                    delete nodes[i].children;
                    if (this.try_filter(nodes[i]) == false) {
                        nodes.splice(i, 1);
                        i--;
                    }
                }
            } else {
                if (this.try_filter(nodes[i]) == false) {
                    nodes.splice(i, 1);
                    i--;
                }
            }
        }
        return del_ret;
    }

    search_all() {
        this.modelChanged.next(this.columnFilterValues);
    }

    test(x) {
        console.log(x);
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
        localStorage.setItem('filter_values_product', JSON.stringify(this.columnFilterValues));
        this.generate_productList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
    }

    generate_productList(start_index: number, end_index: number, sort_field, sort_order) {
        console.log('generate_productList', this.isFilterOn());

        let actvPssvProduct = [];
        try {
            actvPssvProduct = JSON.parse(JSON.stringify(this.productListAll));
        } catch (e) {
            console.error('JSON.parse productListAll err :', e);
            console.log('productListAll :', this.productListAll);
        }

        if (!this.isFilterOn()) {
            this.productListView = JSON.parse(JSON.stringify(actvPssvProduct));
        } else {
            const try_list = JSON.parse(JSON.stringify(actvPssvProduct));
            this.dir_try_filter(try_list);
            this.productListView = try_list;
            this.productListSearch = try_list;
        }

        if (sort_field != null) {
            this.productListView = this.productListView.sort((a, b) => {
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

        this.childRecords = 0;
        if (this.isFilterOn()) {
            this.data_tree(this.productListSearch);
        } else {
            this.data_tree(this.productListAll);
        }
        this.rowRecords = this.productListView.length + this.childRecords;

        console.log('start_index - end_index :', start_index, end_index);

        if ((start_index + end_index + this.rowCount) >= this.rowRecords) {
            this.productListView = this.productListView.slice(start_index, this.rowRecords);
        } else {
            this.productListView = this.productListView.slice(start_index, (start_index + end_index));
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

        if (localStorage.getItem('expanded_nodes_product') != undefined) {
            this.expandChildren(this.productListView, JSON.parse(localStorage.getItem('expanded_nodes_product')));
        }

    }

    menu_new() {
        const obj = { id: 0, parent: 0, idCustomer: this.idCustomer };
        this.dataService.setData(obj);
        this.navCtrl.navigateForward(['/product-edit']);
    }

    work_mode(mode: number) {
        console.log('work_mode()', mode);
        if (mode === 0) {
            this.workMode = false;
            this.editMode = false;
            this.moveMode = false;
            this.deleteMode = false;
            this.protocolMode = false;
            this.selectMode = false;
            this.copyMode = false;
            this.pdfMode = false;
            this.excelMode = false;
            this.migrationMode = false;
            this.historyMode = false;
            this.move_id = 0;
            this.move_to = 0;
            this.move_obj = {};
            this.selectedNode = [];
        } else if (mode === 1) {
            if (this.userdata.role_set.edit_products != true) { return; }
            this.workMode = true;
            this.editMode = true;
        } else if (mode === 2) {
            if (this.userdata.role_set.edit_products != true) { return; }
            this.workMode = true;
            this.deleteMode = true;
            this.selectMode = true;
        } else if (mode === 3) {
            if (this.userdata.role_set.edit_products != true) { return; }
            this.workMode = true;
            this.moveMode = true;
            this.move_id = 0;
            this.move_to = 0;
            this.move_obj = {};
        } else if (mode === 4) {
            if (this.userdata.role_set.check_products != true) { return; }
            this.workMode = true;
            this.selectMode = true;
            this.protocolMode = true;
        } else if (mode === 5) {
            if (this.userdata.role_set.edit_products != true) { return; }
            this.workMode = true;
            this.copyMode = true;
        } else if (mode === 6) {
            if (this.userdata.role_set.edit_products != true) { return; }
            this.workMode = true;
            this.migrationMode = true;
        } else if (mode === 7) {
            if (this.userdata.role_set.edit_products != true) { return; }
            this.workMode = true;
            this.historyMode = true;
        } else if (mode === 8) {
            this.workMode = true;
            this.selectMode = true;
            this.pdfMode = true;
        } else if (mode === 9) {
            this.workMode = true;
            this.selectMode = true;
            this.excelMode = true;
        }
    }

    async moveProduct(step, rowNode) {
        console.log('moveProduct', step, rowNode);
        if (step == 1) {
            this.move_id = parseInt(rowNode.id);
            this.move_obj = JSON.parse(JSON.stringify(rowNode));
        }
        if (step == 2) {
            this.move_to = parseInt(rowNode.id);
            if (this.move_to === this.move_id ) {
                this.move_to = 0; // Stammordner
            }

            const alert = await this.alertCtrl.create({
                header: this.translate.instant('Achtung'),
                message: this.translate.instant('Möchten Sie dieses Produkt wirklich verschieben?'),
                buttons: [{
                    text: this.translate.instant('nein'),
                    handler: data => {
                        this.work_mode(0);
                    }
                },
                {
                    text: this.translate.instant('ja'),
                    handler: data => {
                        this.move_obj.parent = this.move_to;
                        this.move_obj.title = JSON.stringify(this.move_obj.titleJson);
                        this.apiService.pvs4_set_product(this.move_obj).then(async (result: any) => {
                            console.log('result: ', result);
                            this.work_mode(0);
                            this.page_load();
                        });
                    }
                }
                ]
            });
            await alert.present();
            // this.move_obj = JSON.parse(JSON.stringify(rowNode));
        }
    }

    editProduct(data) {
        console.log('editProduct()', data);
        const obj = {
            id: data.id,
            idCustomer: this.idCustomer,
            parent: data.parent
        };
        this.dataService.setData(obj);
        this.navCtrl.navigateForward(['/product-edit']);
    }

    clickCol(field, data, text){
        console.log('clickCol()', field, data, text, data.id);
        if (field.field === 'title') { this.viewProduct(data); }

        if (field.editField != true) { return; }
        if (text === undefined) { return; }
        if (text === null) { return; } 

        if(field.editFieldEN === 'customer_description') {
            let otext = '';
            if (data.customer_description) { otext = String(data.customer_description); }
            const alert = this.alertCtrl.create({
                header: this.translate.instant('Kundenbezeichnung'),
                message: otext,
                inputs: [
                    {
                      name: 'input',
                      value: otext
                    }
                  ],
                buttons: [
                    {
                        text: this.translate.instant('abbrechen'),
                        handler: data => {
                            //  alert.dismiss();
                        }
                    },{
                        text: this.translate.instant('okay'),
                        handler: (e) => {
                            console.log('customer_description:', e);
                            let s = String(e.input);
                            this.apiService.pvs4_get_product(data.id).then((result: any) => {
                                const activProduct = result.obj;
                                activProduct.customer_description = s;
                                this.apiService.pvs4_set_product(activProduct).then((setResult: any) => {
                                    console.log('result: ', setResult);
                                    this.page_load();
                                });
                            });
                        }
                    }
                ]
            }).then(x => x.present());
        }

        if(field.editFieldEN==='Note') {
            let otext = '';
            if (data[field.field]) { otext = String(data[field.field]); }
            const alert = this.alertCtrl.create({
                header: field.field,
                message: otext,
                inputs: [ 
                    {
                      name: 'input',
                      value: otext
                    }
                  ],
                buttons: [
                    {
                        text: this.translate.instant('abbrechen'),
                        handler: data => {
                            //  alert.dismiss();
                        }
                    },
                    {
                        text: this.translate.instant('okay'),
                        handler: (e) => {
                            console.log('Note:', e);
                            let s = String(e.input);
                            this.apiService.pvs4_get_product(data.id).then((result: any) => {
                                const activProduct = result.obj;
                                console.log('activProduct: ', activProduct);
                                try {
                                    let items = JSON.parse(activProduct.items);
                                    for (let i = 0; i < items.length; i++) {
                                        if (items[i].type != 2) { continue; }
                                        if (items[i].title['en'] === 'Note') {
                                            items[i].value = s;
                                            break;
                                        }
                                    }
                                    items = JSON.stringify(items);
                                    // console.log("items new:", items);
                                    activProduct.items = items;
                                    this.apiService.pvs4_set_product(activProduct).then((setResult: any) => {
                                        console.log('result: ', setResult);
                                        this.page_load();
                                    });
                                } catch (e) {
                                    console.error('JSON.parse items err :', e);
                                    console.log('items :', activProduct);
                                }

                            });
                        }
                    }
                ]
            }).then(x => x.present());
        }

        if(field.editFieldEN==='Location') {
            let otext = '';
            if (data[field.field]) { otext = String(data[field.field]); }
            const alert = this.alertCtrl.create({
                header: field.field,
                message: otext,
                inputs: [ 
                    {
                      name: 'input',
                      value: otext
                    }
                  ],
                buttons: [
                    {
                        text: this.translate.instant('abbrechen'),
                        handler: data => {
                            //  alert.dismiss();
                        }
                    },
                    {
                        text: this.translate.instant('okay'),
                        handler: (e) => {
                            console.log('Location:', e);
                            let s = String(e.input);
                            this.apiService.pvs4_get_product(data.id).then((result: any) => {
                                const activProduct = result.obj;
                                console.log('activProduct: ', activProduct);
                                try {
                                    let items = JSON.parse(activProduct.items);
                                    for (let i = 0; i < items.length; i++) {
                                        if (items[i].type != 2) { continue; }
                                        if (items[i].title['en'] === 'Location') {
                                            items[i].value = s;
                                            break;
                                        }
                                    }
                                    items = JSON.stringify(items);
                                    // console.log("items new:", items);
                                    activProduct.items = items;
                                    this.apiService.pvs4_set_product(activProduct).then((setResult: any) => {
                                        console.log('result: ', setResult);
                                        this.page_load();
                                    });
                                } catch (e) {
                                    console.error('JSON.parse items err :', e);
                                    console.log('items :', activProduct);
                                }

                            });
                        }
                    }
                ]
            }).then(x => x.present());
        }
    }

    viewProduct(data) {
        console.log('viewProduct', data, data.id, data.parent, this.idCustomer);
        const obj = {
            id: data.id,
            idCustomer: this.idCustomer,
            parent: data.parent
        };
        this.dataService.setData(obj);
        this.navCtrl.navigateForward(['/product-details']);
    }

    menu_history(data) {
        console.log('menu_history', data);
        if (data) {
            if (data.id) {
                const id = parseInt(data.id);
                console.log('menu_history id', id);

                const obj = {
                    idCustomer: this.idCustomer,
                    idProduct: id,
                    titleProduct: data.title
                };
                this.dataService.setData(obj);
                this.navCtrl.navigateForward(['/protocol-history']);
            }
        }
    }

    async product_migration(data) {
        console.log('product_migration', data);
        if (this.userdata.role_set.edit_products == false) { return; }
        if (data) {
            const nodeList: string[]  = [];
            nodeList.push(data);
            const modal =
                await this.modalCtrl.create({
                    component: ProductMigrationPage,
                    cssClass: 'productmigration-modal-css',
                    componentProps: {
                        'idCustomer': this.idCustomer, productList: JSON.stringify(nodeList)
                    }
                });

            modal.onDidDismiss().then(async retData => {
                if (retData['data']) {
                    this.page_load();
                }
            });
            modal.present();
        }
    }

    menu_move(n) {
        console.log('menu_move_up', this.selectedNode);
        if (n == 1) {
            if (this.selectedNode) {
                if (this.selectedNode.data.id) {
                    this.move_id = parseInt(this.selectedNode.data.id);
                    this.move_obj = JSON.parse(JSON.stringify(this.selectedNode.data));
                }
            }
            this.selectMode = true;
        } else if (n == 2) {
            // in Root
            this.move_obj.parent = 0;
            this.move_obj.title = JSON.stringify(this.move_obj.titleJson);
            this.apiService.pvs4_set_product(this.move_obj).then(async (result: any) => {
                console.log('result: ', result);
                this.page_load();
            });
            this.move_id = 0;
            // this.selectMulti = 1;
            this.selectMode = false;
        }
    }

    create_template() {
        if (this.userdata.role_set.edit_product_templates == false) { return; }
        console.log('create_template()');
        const data = {
            idCustomer: this.idCustomer
        };
        this.dataService.setData(data);
        this.navCtrl.navigateForward(['/product-template']);
    }

    create_protocol() {
        if (this.selectedNode) {
            console.log('create_protocol', this.selectedNode);
            const nodeList = [];
            for (let index = 0; index < this.selectedNode.length; index++) {
                const element = this.selectedNode[index];
                nodeList.push({
                    'id': element.data.id,
                    'title': element.data.title,
                    'id_number': element.data.id_number,
                    'check_interval': element.data.check_interval
                });
                // nodeList.push(element.data);
            }

            const data = {
                id: 0,
                idCustomer: this.idCustomer,
                productList: JSON.stringify(nodeList)
            };
            this.dataService.setData(data);
            this.navCtrl.navigateForward(['/protocol-edit']);
        }
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
                    this.data_tree(this.productListSearch);
                }
            } else {
                if (this.selectedNode.length > 0) {
                    for (let i = 0; i < this.selectedNode.length; i++) {
                        this.allnodes.push(this.selectedNode[i].data);
                    }
                } else {
                    this.data_tree(this.productListAll);
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
            this.excelService.exportAsExcelFile(data, 'product_view.xlsx');
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
            const pdfTitle: any = this.translate.instant('Produkt') + ' ' + this.translate.instant('Liste');
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
                    this.data_tree(this.productListSearch);
                }
            } else {
                if (this.selectedNode.length > 0) {
                    for (let i = 0; i < this.selectedNode.length; i++) {
                        this.allnodes.push(this.selectedNode[i].data);
                    }
                } else {
                    this.data_tree(this.productListAll);
                }
            }
            let obj: any;
            const headerRowVisible: any = 0;
            let selectColumnsLength: any = this.selectedColumns.length;
            if (this.selectedColumns.length < 10) {
                selectColumnsLength = this.selectedColumns.length;
            } else {
                selectColumnsLength = 10;
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
            } else if (selectColumnsLength == 9) {
                widthsArray.push('auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto');
            } else if (selectColumnsLength == 10) {
                widthsArray.push('auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto');
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
                    rowArray.push({ text: '', border: [false, false, false, false] });
                    rowArray.push({ text: '', border: [false, false, false, false] });
                    rowArray.push({ text: '', border: [false, false, false, false] });
                    rowArray.push({ text: '', border: [false, false, false, false] });
                    rowArray.push({ text: '', border: [false, false, false, false] });
                    rowArray.push({ text: '', border: [false, false, false, false] });
                    rowArray.push({ text: '', border: [false, false, false, false] });
                    bodyArray.push(rowArray);
                }

                rowArray = [];
                for (let j = 0; j < selectColumnsLength - 1; j++) {
                    rowArray.push({ text: '', border: [false, false, false, false] });
                }
                bodyArray.push(rowArray);
            }

            this.pdf.get_ListDocDefinition(bodyArray,
                                            widthsArray,
                                            headerRowVisible,
                                            pdfTitle,
                                            this.translate.instant('Produkt') + this.translate.instant('Liste') + '.pdf');
            loader.dismiss();

        } catch (e) {
            console.log('!!! PDF Error !!!');
            loader.dismiss();
        }
    }

    data_tree(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            this.allnodes.push(nodes[i].data);
            if (nodes[i].data.parent != 0) {
                this.childRecords++;
            }
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
        localStorage.setItem('split_filter_product', JSON.stringify(this.splitFilter));
        this.funcHeightCalc();
    }

    async show_columns() {
        let inputs: any[] = [];
        for (let i = 0; i < this.cols.length; i++) {
            if (this.cols[i].field === 'work_column') { continue; }
            if (this.cols[i].field === 'nfc_tag_id') { continue; }
            if (this.cols[i].field === 'title') { continue; }
            if (this.cols[i].field === 'id_number') { continue; }
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
                            if (this.cols[i].field === 'nfc_tag_id') { continue; }
                            if (this.cols[i].field === 'title') { continue; }
                            if (this.cols[i].field === 'id_number') { continue; }
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
                            if (this.cols[i].field === 'nfc_tag_id') { continue; }
                            if (this.cols[i].field === 'title') { continue; }
                            if (this.cols[i].field === 'id_number') { continue; }
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
                        console.log('Checkbox data:', data );
                        this.selectedColumns = this.cols.filter(function (element, index, array) { return data.includes(element.field); });
                        this.selectedColumns.unshift(this.cols[3]);
                        this.selectedColumns.unshift(this.cols[2]);
                        this.selectedColumns.unshift(this.cols[1]);
                        this.selectedColumns.unshift(this.cols[0]);
                        this.selCols = this.cols.filter(function (element, index, array) { return data.includes(element.field); });
                        this.selCols.unshift(this.cols[3]);
                        this.selCols.unshift(this.cols[2]);
                        this.selCols.unshift(this.cols[1]);
                        this.selCols.unshift(this.cols[0]);
                        console.log('Checkbox data:', this.selectedColumns );
                        localStorage.setItem('show_columns_product', JSON.stringify(this.selectedColumns));
                        localStorage.setItem('selcols_product', JSON.stringify(this.selCols));
                    }
                }
            ]
        });
        await alert.present();
    }

    isFilterOn(): any {
        let ret = false;
        for (let i = 0; i < this.cols.length; i++) {
            if (this.columnFilterValues[this.cols[i].field]) {
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
        localStorage.setItem('show_columns_product', JSON.stringify(this.selectedColumns));
    }

    onColReorder(event) {
        console.log('onColReorder()', event );
        this.selCols = JSON.parse(localStorage.getItem('selcols_product'));
        const dragIndex = event.dragIndex + 1;
        const dropIndex = event.dropIndex + 1;
        function array_move(arr, old_index, new_index) {
            new_index =((new_index % arr.length) + arr.length) % arr.length;
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        }
        if (dragIndex > 3 && dropIndex > 3) {
            array_move(this.selCols, dragIndex, dropIndex);
        }
        // this.selectedColumns = event.columns;
        // this.fixReorder();
        this.selectedColumns = this.selCols;
        localStorage.setItem('show_columns_product', JSON.stringify(this.selectedColumns));
        localStorage.setItem('selcols_product', JSON.stringify(this.selCols));
    }

    fixReorder() {
        console.log('fixReorder()', this.selectedColumns );
        let cols = [
            { field: 'work_column', header: '', width: '60px' },
            { field: 'nfc_tag_id', header: 'NFC', width: '80px' },
            { field: 'title', header: this.translate.instant('Bezeichnung'), width: '220px' },
            { field: 'id_number', header: 'ID', width: '85px' }
        ];
        for (let i = 0; i < this.selectedColumns.length; i++) {
            if (this.selectedColumns[i].field === 'work_column') { continue; }
            if (this.selectedColumns[i].field === 'nfc_tag_id') { continue; }
            if (this.selectedColumns[i].field === 'title') { continue; }
            if (this.selectedColumns[i].field === 'id_number') { continue; }
            cols.push(this.selectedColumns[i]);
        }
        this.selectedColumns = cols;
    }

    onNodeExpand(event) {
        this.expendedNodes.push(event.node.data['id']);
        localStorage.setItem('expanded_nodes_product', JSON.stringify(this.expendedNodes));
    }

    onNodeCollapse(event) {
        this.expendedNodes = this.expendedNodes.filter(function (element, index, array) { return element != event.node.data['id']; });
        localStorage.setItem('expanded_nodes_product', JSON.stringify(this.expendedNodes));
    }

    productDeactivate() {
        const alert = this.alertCtrl.create({
            header: this.translate.instant('Achtung'),
            message: this.translate.instant('Möchten Sie dieses Produkt wirklich deaktivieren'),
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
                        if (this.selectedNode) {
                            console.log('delete product :', this.selectedNode);
                            let isChild = 0;
                            for (let index = 0; index < this.selectedNode.length; index++) {
                                console.log('selectedNode : ', this.selectedNode[index].data, this.selectedNode[index].children);
                                if (this.selectedNode[index].children != undefined) {
                                    if (this.selectedNode[index].children.length > 0) {
                                        isChild++;
                                    }
                                }
                            }
                            if (isChild > 0) {
                                this.showChildMsg();
                            } else {
                                for (let i = 0; i < this.selectedNode.length; i++) {
                                    console.log('selectedNode id :', this.selectedNode[i].data.id);
                                    this.apiService.pvs4_get_product(this.selectedNode[i].data.id).then((result: any) => {
                                        const activProduct = result.obj;
                                        activProduct.active = 0;
                                        this.apiService.pvs4_set_product(activProduct).then((setResult: any) => {
                                            console.log('result: ', setResult);
                                            this.work_mode(0);
                                            this.page_load();
                                        });
                                    });
                                }
                            }
                        }
                    }
                }
            ]
        }).then(x => x.present());
    }

    showChildMsg() {
        const alert = this.alertCtrl.create({
            header: this.translate.instant('information'),
            message: this.translate.instant('Produkte mit untergeordneten Datensätzen können nicht gelöscht werden.'),
            buttons: [
                {
                    text: this.translate.instant('okay'),
                    handler: () => {

                    }
                }
            ]
        }).then(x => x.present());
    }

    async product_copy(data) {
        if (this.userdata.role_set.edit_products == false) { return; }
        const modal =
            await this.modalCtrl.create({
            component: ProductCopyPage,
            cssClass: 'productcopy-modal-css',
            componentProps: {
                readOnly: false, idProduct: data.id, idCustomer: this.idCustomer
            }
        });

        modal.present();
    }

    activePassiveProduct() {
        console.log('activePassiveProduct()');
        this.selectedNode = [];
        this.selectedRow = 0;
        this.showActivePassiveProduct = !this.showActivePassiveProduct;
        this.page_load();

        // this.generate_productList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
    }
}
