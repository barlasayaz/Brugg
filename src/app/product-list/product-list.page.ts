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
import { ProductMigrationPage } from '../product-migration/product-migration.page';
import { ActivatedRoute } from '@angular/router';
import { SlideMenu } from 'primeng/primeng';
import { DataService } from '../services/data.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProductCopyPage } from '../product-copy/product-copy.page';
import { SystemService } from '../services/system';

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
    public heightCalc: any = '700px';
    public move_id = 0;
    public move_obj: any = {};
    public columnFilterValues = { title: '',
                                  nfc_tag_id: '',
                                  id_number: '',
                                  articel_no: '',
                                  customer_description: '',
                                  check_interval: '',
                                  search_all: '' };
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public totalRecords: number;
    public rowRecords: number;
    public lang: string = localStorage.getItem('lang');
    public company = '';
    public navigationSubscription: any;
    public childCount: number;
    modelChanged: Subject<any> = new Subject<any>();
    public selectedRow: number;
    public selectMode: boolean = false;
    public rowHeight = 26;
    public rowCount = 100;

    public menuItems: MenuItem[] = [{
        label: this.translate.instant('Ansicht'),
        icon: 'pi pi-fw pi-eye',
        disabled: true,
        command: (event) => {
            console.log('command menuitem:', event.item);
            this.menu_view();
        }
    },
    {
        label: this.translate.instant('Bearbeiten'),
        icon: 'pi pi-fw pi-pencil',
        disabled: true,
        visible: this.userdata.role_set.edit_products,
        command: (event) => {
            if (this.userdata.role_set.edit_products == false) { return; }
            console.log('command menuitem:', event.item);
            this.menu_edit();
        }
    },
    {
        label: this.translate.instant('löschen'),
        icon: 'pi pi-fw pi-trash',
        disabled: true,
        visible:  this.userdata.role_set.check_products,
        command: (event) => {
            console.log('command menuitem:', event.item);
            this.productDeactivateAlert();
        }
    },
    {
        label: this.translate.instant('Bewegen'),
        icon: 'pi pi-fw pi-chevron-up',
        visible: this.userdata.role_set.edit_products,
        disabled: true,
        command: (event) => {
            if (this.userdata.role_set.edit_products == false) { return; }
            console.log('command menuitem:', event.item);
            this.menu_move(1);
        }
    },
    {
        label: this.translate.instant('Stammordner'),
        icon: 'pi pi-fw pi-chevron-down',
        visible: false,
        styleClass: 'move_now',
        disabled: false,
        command: (event) => {
            if (this.userdata.role_set.edit_products == false) { return; }
            console.log('command menuitem:', event.item);
            this.menu_move(2);
        }
    },
    {
        label: this.translate.instant('Neu'),
        icon: 'pi pi-fw pi-plus',
        visible: (this.userdata.role_set.edit_products || this.userdata.role_set.check_products),
        items: [
            {
                label: this.translate.instant('Neue Produktvorlage'),
                icon: 'pi pi-fw pi-plus',
                visible: this.userdata.role_set.edit_product_templates,
                disabled: false,
                command: (event) => {
                    if (this.userdata.role_set.edit_products == false) { return; }
                    console.log('command menuitem:', event.item);
                    this.create_template();
                }
            },
            {
                label: this.translate.instant('Neues Produkt'),
                icon: 'pi pi-fw pi-plus',
                visible: this.userdata.role_set.edit_products,
                disabled: false,
                command: (event) => {
                    if (this.userdata.role_set.edit_products == false) { return; }
                    console.log('command menuitem:', event.item);
                    this.menu_new();
                }
            },
            {
                label: this.translate.instant('Neues Protokoll'),
                icon: 'pi pi-fw pi-plus',
                visible: this.userdata.role_set.check_products,
                disabled: true,
                command: (event) => {
                    if (this.userdata.role_set.check_products == false) { return; }
                    console.log('command menuitem:', event.item);
                    this.create_protocol();
                }
            }
        ]
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
                label: this.translate.instant('XLSx Export'),
                icon: 'pi pi-fw pi-save',
                command: (event) => {
                    this.excel_export();
                }
            },
            {
                label: this.translate.instant('PDF Export'),
                icon: 'pi pi-fw pi-save',
                command: (event) => {
                    this.pdf_export();
                }
            },
            {
                label: this.translate.instant('Produkt Migration'),
                icon: 'pi pi-fw pi-arrow-right',
                visible: this.userdata.role_set.edit_products,
                disabled: true,
                command: (event) => {
                    if (this.userdata.role_set.edit_products == false) { return; }
                    console.log('command menuitem:', event.item);
                    this.product_migration();
                }
            },
            {
                label: this.translate.instant('Produkt duplizieren alt'),
                icon: 'pi pi-fw pi-copy',
                visible: this.userdata.role_set.edit_products,
                disabled: true,
                command: (event) => {
                    if (this.userdata.role_set.edit_products == false) { return; }
                    console.log('command menuitem:', event.item);
                    this.product_copy();
                }
            },
            {
                label: this.translate.instant('Protokollverlauf'),
                icon: 'pi pi-fw pi-info-circle',
                disabled: true,
                command: (event) => {
                    console.log('command menuitem:', event.item);
                    this.menu_history();
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
        private loadingCtrl: LoadingController) {
            this.modelChanged.pipe(
                debounceTime(700))
                .subscribe(model => {
                    if (this.isFilterOn()) {
                        this.menuItems[8].items[0]['disabled'] = false;
                    } else {
                        this.menuItems[8].items[0]['disabled'] = true;
                    }
                    this.generate_productList(0, this.rowCount, null, 0);
                    localStorage.setItem('filter_values_product', JSON.stringify(this.columnFilterValues));
            });
        }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.cols = [
                { field: 'nfc_tag_id', header: 'NFC', width: '80px' },
                { field: 'title', header: this.translate.instant('Titel'), width: '220px' },
                // { field: 'id', header: 'DB-ID' },
                { field: 'id_number', header: '#', width: '85px' },
                { field: 'articel_no', header: this.translate.instant('Artikel-Nr.'), width: '100px' },
                { field: 'customer_description', header: this.translate.instant('Kundenbezeichnung'), width: '200px' },
                { field: 'last_protocol_date', header: '<<' + this.translate.instant('Termin'), width: '100px' },
                { field: 'last_protocol_next', header: this.translate.instant('Termin') + '>>', width: '100px' },
                { field: 'check_interval', header: this.translate.instant('Intervall Prüfen'), width: '130px' }
            ];
            this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));

            console.log('ProductListPage idCustomer:', this.idCustomer);
            this.page_load();
        });
    }

    onResize(event) {
        // console.log('onResize');
        this.funcHeightCalc();
    }

    async loadNodes(event: LazyLoadEvent) {
        if (this.totalRecords > 0) {
            this.generate_productList(event.first, event.rows, event.sortField, event.sortOrder);
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
        // console.log('heightCalc 2 :', x, this.heightCalc);
    }

    async page_load() {
        console.log('page_load ProductListPage');

        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        this.rowRecords = 0;
        this.totalRecords = 0;
        this.childCount = 0;
        this.selectedNode = [];
        this.selectedRow = 0;
        this.menuItems[0].disabled = true;
        this.menuItems[1].disabled = true;
        this.menuItems[2].disabled = true;
        this.menuItems[3].disabled = true;
        this.menuItems[5].items[0]['disabled'] = !this.userdata.role_set.edit_product_templates;
        this.menuItems[5].items[1]['disabled'] = false;
        this.menuItems[5].items[2]['disabled'] = true;
        this.menuItems[8].items[3]['disabled'] = true;
        this.menuItems[8].items[4]['disabled'] = true;
        this.menuItems[8].items[5]['disabled'] = true;

        this.events.publish('prozCustomer', 0);
        this.apiService.pvs4_get_product_list(this.idCustomer).then((result: any) => {
            console.log('pvs4_get_product_list ok');
            const list = JSON.parse(JSON.stringify(result.list));
            this.productListAll = list;

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
                }
            } catch (e) {
                console.error('JSON.parse filter err :', e);
                console.log('columnFilterValues', json);
            }

            this.title_translate(this.productListAll);
            console.log('title_translate ok');

            for (let index = 0; index < this.productListAll.length; index++) {
                // last_protocol & last_protocol_next
                let pr = this.productListAll[index].data.last_protocol;
                if (pr) {
                    if (pr.length > 0) {
                        // console.log("pr :", pr);
                        try {
                            pr = JSON.parse(pr);
                            if (pr.protocol_date) {
                                this.productListAll[index].data.last_protocol_date = this.apiService.mysqlDate2view(pr.protocol_date);
                            }
                            if (pr.protocol_date_next) {
                                this.productListAll[index].data.last_protocol_next = this.apiService.mysqlDate2view(pr.protocol_date_next);
                            }
                            this.productListAll[index].data.last_protocol_next_color = "rgb(74, 83, 86)";
                            if (pr.result) {
                                if (pr.result == 1) {
                                    this.productListAll[index].data.last_protocol_next = this.translate.instant('reparieren');
                                    this.productListAll[index].data.last_protocol_next_color = "#f1c40f";
                                }
                                if (pr.result == 3) {
                                    this.productListAll[index].data.last_protocol_next = this.translate.instant('unauffindbar');
                                    this.productListAll[index].data.last_protocol_next_color = "#e74c3c";
                                }
                                if ((pr.result == 2) || (pr.result == 4)) {
                                    this.productListAll[index].data.last_protocol_next = this.translate.instant('ausmustern');
                                    this.productListAll[index].data.last_protocol_next_color = "#C558D3";
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

                if (this.productListAll[index].data.items) {
                    // console.log("items :", this.productListAll[index].data.items);
                    try {
                        options = JSON.parse(this.productListAll[index].data.items);
                        // console.log("options :", options);
                    } catch (e) {
                        console.error('JSON.parse options err :', e);
                        console.log('options :', this.productListAll[index].data);
                    }
                }

                // console.log('options :', options);

                if (options == null) { options = []; }

                for (let i = 0; i < options.length; i++) {
                    //console.log('options :', options[i]);
                    // console.log('options :', options[i].id);
                    // console.log('options :', options[i].title);

                    //console.log('this.lang :', this.lang);
                    if (!this.cols.find(x => x.field == options[i].title[this.lang])) {
                        this.cols.push({ field: options[i].title[this.lang], header: options[i].title[this.lang] , width: '200px'});
                        //console.log('this.lang :', options[i].title[this.lang]);
                    }
                    const pipe = new DatePipe('en-US');
                    if (options[i].type == 5) {
                        this.productListAll[index].data[options[i].title[this.lang]] = pipe.transform(options[i].value, 'dd.MM.yyyy');
                    }
                    if (options[i].type != 5) {
                        this.productListAll[index].data[ options[i].title[this.lang] ] = options[i].value;
                    }
                }
                // console.log("index :", index);
            }

            this.generate_productList(0, this.rowCount, null, 0);
            loader.dismiss();
        });
        this.funcHeightCalc();
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
                        this.menuItems[2].disabled = true;
                        this.menuItems[3].disabled = true;
                        this.menuItems[3].visible = this.userdata.role_set.edit_products;
                        this.menuItems[4].visible = false;
                        this.menuItems[5].items[0]['disabled'] = !this.userdata.role_set.edit_product_templates;
                        this.menuItems[5].items[1]['disabled'] = false;
                        this.menuItems[5].items[2]['disabled'] = true;
                        this.menuItems[8].items[3]['disabled'] = true;
                        this.menuItems[8].items[4]['disabled'] = true;
                        this.menuItems[8].items[5]['disabled'] = true;
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

    cancel_filters(cancel_type) {
        console.log('cancel_filters');
        this.menuItems[8].items[0]['disabled'] = true;
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
        this.generate_productList(0, this.rowCount, null, 0);
    }

    generate_productList(start_index: number, end_index: number, sort_field, sort_order) {
        console.log('generate_productList', this.isFilterOn());

        if (!this.isFilterOn()) {
            this.productListView = JSON.parse(JSON.stringify(this.productListAll));
        } else {
            const try_list = JSON.parse(JSON.stringify(this.productListAll));
            this.dir_try_filter(try_list);
            this.productListView = try_list;
            this.productListSearch = try_list;
        }

        if (sort_field != null) {
            this.productListView = this.productListView.sort((a, b) => {
                let value1 = a.data[sort_field];
                let value2 = b.data[sort_field];

                if (this.apiService.isEmpty(value1) && !this.apiService.isEmpty(value2)) {
                    return-1 * sort_order;
                } else if (!this.apiService.isEmpty(value1) && this.apiService.isEmpty(value2)) {
                    return 1 * sort_order;
                } else if (this.apiService.isEmpty(value1) && this.apiService.isEmpty(value2)) {
                    return 0;
                } else if ( value1.toLowerCase( ) > value2.toLowerCase( )) {
                    return 1 * sort_order;
                } else if ( value1.toLowerCase( ) < value2.toLowerCase( )) {
                    return -1 * sort_order;
                } else {
                    return 0;
                }
            });
        }
        this.rowRecords = this.productListView.length;
        this.totalRecords = this.productListAll.length;

        console.log('start_index - end_index :', start_index, end_index);

        if (this.rowRecords < 22) {
            this.rowHeight = 48;
        } else {
            this.rowHeight = 26;
        }

        // console.log('aaa :', this.totalRecords, this.rowCount, start_index, end_index, (start_index + end_index + this.rowCount));
        if ((start_index + end_index + this.rowCount) >= this.rowRecords) {
            this.productListView = this.productListView.slice(start_index, this.rowRecords);
        } else {
            this.productListView = this.productListView.slice(start_index, (start_index + end_index));
        }

        if (this.productListView.length > 0) {
            if (this.isFilterOn()) {
                this.menuItems[8].items[0]['disabled'] = false;
            } else {
                this.menuItems[8].items[0]['disabled'] = true;
            }
            this.menuItems[8].items[1]['disabled'] = false;
            this.menuItems[8].items[2]['disabled'] = false;
        } else {
            this.menuItems[8].items[0]['disabled'] = true;
            this.menuItems[8].items[1]['disabled'] = true;
            this.menuItems[8].items[2]['disabled'] = true;
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

    nodeSelect(event, selectedNode) {
        console.log('nodeSelect :', event, selectedNode);

        let selectedNodeLength = selectedNode.length;
        this.selectedRow = selectedNodeLength;

        if (this.selectMode) {
            selectedNodeLength = 1;
        }
        this.selectedNode.data = event.node.data;
        this.menuItems[0].disabled = false;
        this.menuItems[1].disabled = false;
        this.menuItems[2].disabled = false;
        this.menuItems[3].disabled = false;
        this.menuItems[5].items[0]['disabled'] = !this.userdata.role_set.edit_product_templates;
        this.menuItems[5].items[1]['disabled'] = false;
        this.menuItems[5].items[2]['disabled'] = false;
        this.menuItems[8].items[3]['disabled'] = false;
        this.menuItems[8].items[4]['disabled'] = false;
        this.menuItems[8].items[5]['disabled'] = false;
        let id_sn = 0;

        if (selectedNodeLength == 1) {
            if (this.selectedNode) {
                if (this.selectedNode.data.id) {
                    id_sn = this.selectedNode.data.id;
                }
            }
            if (this.move_id > 0) {
                this.move_obj.parent = id_sn;
                this.move_obj.title = JSON.stringify(this.move_obj.titleJson);
                this.apiService.pvs4_set_product(this.move_obj).then(async (result: any) => {
                    console.log('result: ', result);
                    this.menuItems[3].visible = this.userdata.role_set.edit_products;
                    this.menuItems[4].visible = false;
                    this.menuItems[5].items[2]['disabled'] = true;
                    this.move_id = 0;
                    this.page_load();
                });
            }
        } else {
            this.menuItems[0].disabled = true;
            this.menuItems[1].disabled = true;
            this.menuItems[2].disabled = true;
            this.menuItems[3].disabled = true;
            this.menuItems[3].visible = this.userdata.role_set.edit_products;
            this.menuItems[4].visible = false;
            this.menuItems[8].items[3]['disabled'] = true;
            this.menuItems[8].items[4]['disabled'] = true;
            this.menuItems[8].items[5]['disabled'] = true;
        }
        if (selectedNodeLength == 0) {
            this.menuItems[2].disabled = true;
            this.menuItems[5].items[2]['disabled'] = true;
            this.menuItems[8].items[3]['disabled'] = true;
        } else {
            this.menuItems[2].disabled = false;
            this.menuItems[5].items[2]['disabled'] = false;
            this.menuItems[8].items[3]['disabled'] = false;
        }
        if (selectedNodeLength >= 2) {
            this.menuItems[5].items[1]['disabled'] = true;
        }

        if (this.selectedNode.data.parent != 0) {
            this.childCount++;
        }
        if (this.childCount > 0) {
            this.menuItems[8].items[3]['disabled'] = true;
        }

    }

    onNodeUnselect(event, selectedNode) {
        console.log('nodeSelect :', event, selectedNode);
        if (this.selectMode) {
            this.menuItems[0].disabled = true;
            this.menuItems[1].disabled = true;
            this.menuItems[2].disabled = true;
            this.menuItems[3].visible = true;
            this.menuItems[3].disabled = false;
            this.menuItems[4].visible = false;
            this.menuItems[5].items[0]['disabled'] = !this.userdata.role_set.edit_product_templates;
            this.menuItems[5].items[1]['disabled'] = false;
            this.menuItems[5].items[2]['disabled'] = true;
            this.menuItems[8].items[0]['disabled'] = false;
            this.menuItems[8].items[1]['disabled'] = false;
            this.menuItems[8].items[2]['disabled'] = false;
            this.selectMode = false;
            this.move_id = 0;
        } else {
            let selectedNodeLength = selectedNode.length;
            this.selectedRow = selectedNodeLength;
            this.selectedNode.data = event.node.data;
            this.menuItems[0].disabled = false;
            this.menuItems[1].disabled = false;
            this.menuItems[2].disabled = false;
            this.menuItems[3].disabled = false;
            this.menuItems[4].disabled = false;
            this.menuItems[5].items[0]['disabled'] = !this.userdata.role_set.edit_product_templates;
            this.menuItems[5].items[1]['disabled'] = false;
            this.menuItems[5].items[2]['disabled'] = false;
            this.menuItems[8].items[3]['disabled'] = false;
            this.menuItems[8].items[4]['disabled'] = false;
            this.menuItems[8].items[5]['disabled'] = false;

            if (selectedNodeLength == 0) {
                this.menuItems[0].disabled = true;
                this.menuItems[1].disabled = true;
                this.menuItems[2].disabled = true;
                this.menuItems[3].disabled = true;
                this.menuItems[5].items[2]['disabled'] = true;
                this.menuItems[8].items[3]['disabled'] = true;
                this.menuItems[8].items[4]['disabled'] = true;
                this.menuItems[8].items[5]['disabled'] = true;
            }
            if (selectedNodeLength >= 2) {
                this.menuItems[0].disabled = true;
                this.menuItems[1].disabled = true;
                this.menuItems[3].disabled = true;
                this.menuItems[5].items[1]['disabled'] = true;
                this.menuItems[8].items[4]['disabled'] = true;
                this.menuItems[8].items[5]['disabled'] = true;
            }

            if (event.node.data.parent != 0) {
                this.childCount--;
            }
            if (this.childCount > 0) {
                this.menuItems[8].items[4]['disabled'] = true;
            }
            this.move_id = 0;
        }
    }

    menu_new() {
        console.log('menu_new', this.selectedNode, this.idCustomer);
        const obj = { id: 0, parent: 0, idCustomer: this.idCustomer };
        if (this.selectedNode.length > 0) {
            if (this.selectedNode.data.id) {
                obj.parent = this.selectedNode.data.id;
            }
        }
        this.dataService.setData(obj);
        this.navCtrl.navigateForward(['/product-edit']);
    }

    menu_edit() {
        console.log('menu_edit', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const data = {
                    id: this.selectedNode.data.id,
                    idCustomer: this.idCustomer,
                    parent: this.selectedNode.data.parent,
                    company: this.company
                };
                this.dataService.setData(data);
                this.navCtrl.navigateForward(['/product-edit']);
            }
        }
    }

    menu_history() {
        console.log('menu_history', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const id = parseInt(this.selectedNode.data.id);
                console.log('menu_history id', id);

                const data = {
                    idCustomer: this.idCustomer,
                    idProduct: id,
                    titleProduct: this.selectedNode.data.title,
                    company: this.company
                };
                this.dataService.setData(data);
                this.navCtrl.navigateForward(['/protocol-history']);
            }
        }
    }

    async product_migration() {
        console.log('product_migration', this.selectedNode);
        if (this.selectedNode) {
            const nodeList: string[]  = [];
            for (let index = 0; index < this.selectedNode.length; index++) {
                const element = this.selectedNode[index];
                nodeList.push(element.data);
            }
            const modal =
                await this.modalCtrl.create({
                    component: ProductMigrationPage,
                    componentProps: {
                        'idCustomer': this.idCustomer, productList: JSON.stringify(nodeList)
                    }
                });

            modal.onDidDismiss().then(async data => {
                if (data['data']) {
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
            //this.menuItems[3].visible = false;
            //this.menuItems[4].visible = true;
            // this.selectMulti = 0;
            this.menuItems[0].disabled = true;
            this.menuItems[1].disabled = true;
            this.menuItems[2].disabled = true;
            this.menuItems[3].visible = false;
            this.menuItems[4].visible = true;
            this.menuItems[5].items[0]['disabled'] = true;
            this.menuItems[5].items[1]['disabled'] = true;
            this.menuItems[5].items[2]['disabled'] = true;
            this.menuItems[8].items[0]['disabled'] = true;
            this.menuItems[8].items[1]['disabled'] = true;
            this.menuItems[8].items[2]['disabled'] = true;
            this.menuItems[8].items[3]['disabled'] = true;
            this.menuItems[8].items[4]['disabled'] = true;
            this.menuItems[8].items[5]['disabled'] = true;
            this.selectMode = true;
        } else if (n == 2) {
            // in Root
            this.move_obj.parent = 0;
            this.move_obj.title = JSON.stringify(this.move_obj.titleJson);
            this.apiService.pvs4_set_product(this.move_obj).then(async (result: any) => {
                console.log('result: ', result);
                this.page_load();
            });
            this.menuItems[3].visible = true;
            this.menuItems[4].visible = false;
            this.menuItems[3].visible = true;
            this.menuItems[4].visible = false;
            this.menuItems[5].items[2]['disabled'] = true;
            this.move_id = 0;
            // this.selectMulti = 1;
            this.selectMode = false;
        }
    }

    menu_view() {
        console.log('menu_view', this.selectedNode[0]);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const id = parseInt(this.selectedNode.data.id);
                // console.log('menu_view :', id, JSON.stringify(this.selectedNode.data));

                this.navCtrl.navigateForward(['/product-details', id] );
            }
        }
    }

    create_template() {
        console.log('create_template', this.selectedNode);

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

        const data: any = [];
        this.allnodes = [];
        if (this.isFilterOn()) {
            this.data_tree(this.productListSearch);
        } else {
            this.data_tree(this.productListAll);
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
        this.excelService.exportAsExcelFile(data, 'product_view.xlsx');
        loader.dismiss();
    }

    async pdf_export() {
        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        const pdfTitle: any = this.translate.instant('Produkt') + ' ' + this.translate.instant('Liste');
        let columns: any[] = [];
        const widthsArray: string[] = [];
        const bodyArray: any[] = [];
        this.allnodes = [];
        let rowArray: any[] = [];
        if (this.isFilterOn()) {
            this.data_tree(this.productListSearch);
        } else {
            this.data_tree(this.productListAll);
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
                rowArray.push({ text: '', border: [false, false, false, false] });
                rowArray.push({ text: '', border: [false, false, false, false] });
                rowArray.push({ text: '', border: [false, false, false, false] });
                rowArray.push({ text: '', border: [false, false, false, false] });
                rowArray.push({ text: '', border: [false, false, false, false] });
                bodyArray.push(rowArray);
            }

            rowArray = [];
            rowArray.push({ text: '', border: [false, false, false, false] });
            rowArray.push({ text: '', border: [false, false, false, false] });
            rowArray.push({ text: '', border: [false, false, false, false] });
            rowArray.push({ text: '', border: [false, false, false, false] });
            rowArray.push({ text: '', border: [false, false, false, false] });
            rowArray.push({ text: '', border: [false, false, false, false] });
            rowArray.push({ text: '', border: [false, false, false, false] });
            bodyArray.push(rowArray);
        }

        this.pdf.get_ListDocDefinition(bodyArray,
                                        widthsArray,
                                        headerRowVisible,
                                        pdfTitle,
                                        this.translate.instant('Produkt') + this.translate.instant('Liste') + '.pdf');
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
        localStorage.setItem('split_filter_product', JSON.stringify(this.splitFilter));
        this.funcHeightCalc();
    }

    async show_columns() {
        let inputs: any[] = [];
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
                        console.log('Checkbox data:', data );
                        this.selectedColumns = this.cols.filter(function (element, index, array) { return data.includes(element.field); });
                        localStorage.setItem('show_columns_product', JSON.stringify(this.selectedColumns));
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

    onNodeExpand(event) {
        this.expendedNodes.push(event.node.data['id']);
        localStorage.setItem('expanded_nodes_product', JSON.stringify(this.expendedNodes));
    }

    onNodeCollapse(event) {
        this.expendedNodes = this.expendedNodes.filter(function (element, index, array) { return element != event.node.data['id']; });
        localStorage.setItem('expanded_nodes_product', JSON.stringify(this.expendedNodes));
    }

    productDeactivateAlert() {
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
                        this.productDeactivate();
                    }
                }
            ]
        }).then(x => x.present());
    }

    productDeactivate() {
        console.log('productDeactivate');
        let isChild = 0;
        this.selectedNode.forEach(element => {
            if (element['children'] != undefined) {
                if (element.children.length > 0) {
                    isChild++;
                }
            }
        });
        if (isChild > 0) {
            this.showChildMsg();
        } else {
            this.selectedNode.forEach(element => {
                this.apiService.pvs4_get_product(element.data.id).then((result: any) => {
                    const activProduct = result.obj;
                    activProduct.active = 0;
                    this.apiService.pvs4_set_product(activProduct).then((setResult: any) => {
                        console.log('result: ', setResult);
                        this.page_load();
                    });
                });
            });
        }
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

    async product_copy() {
    const modal =
        await this.modalCtrl.create({
        component: ProductCopyPage,
        componentProps: {
            readOnly: false, idProduct: this.selectedNode.data.id, idCustomer: this.idCustomer
        }
        });

    modal.present();
    }

    editProduct() {
        console.log('editProduct', this.selectedNode.data);
        if (this.selectedNode.data.id) {
            const data = {
                id: this.selectedNode.data.id,
                idCustomer: this.idCustomer,
                parent: this.selectedNode.data.parent,
                company: this.company
            };
            this.dataService.setData(data);
            this.navCtrl.navigateForward(['/product-edit']);
        }
    }

}
