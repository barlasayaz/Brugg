import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, Events } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode, MenuItem } from 'primeng/api';
import { ExcelService } from '../services/excel';
import { PdfExportService } from '../services/pdf-export';
import { DatePipe } from '@angular/common';
import { ProductMigrationPage } from '../product-migration/product-migration.page';
import { ActivatedRoute } from '@angular/router';
import { SlideMenu } from 'primeng/primeng';
import { DataService } from '../services/data.service';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.page.html',
    styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
    public productListAll: TreeNode[] = [];
    public productListView: TreeNode[] = [];
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
    public columnFilterValues = { title: '', nfc_tag_id: '', id_number: '', articel_no: '', check_interval: '', search_all: '' };
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public rowRecords = 0;
    public totalRecords = 0;
    public lang: string = localStorage.getItem('lang');
    public company = '';
    public selectMulti: number;
    public navigationSubscription: any;


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
        label: this.translate.instant('Protokolle'),
        icon: 'pi pi-fw pi-info-circle',
        disabled: true,
        command: (event) => {
            console.log('command menuitem:', event.item);
            this.menu_history();
        }
    },
    {
        label: this.translate.instant('Bewegen'),
        icon: 'pi pi-fw pi-arrow-up',
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
        icon: 'pi pi-fw pi-arrow-down',
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
                visible: this.userdata.role_set.edit_products,
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
            }
        ]
    }];

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
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const refresh = params['refresh'];
            if (refresh) {
                this.cols = [
                    { field: 'nfc_tag_id', header: 'NFC' },
                    { field: 'title', header: this.translate.instant('Titel') },
                    // { field: 'id', header: 'DB-ID' },
                    { field: 'id_number', header: '#' },
                    { field: 'articel_no', header: this.translate.instant('Artikel-Nr.') },
                    { field: 'last_protocol_date', header: '<<' + this.translate.instant('Termin') },
                    { field: 'last_protocol_next', header: this.translate.instant('Termin') + '>>' },
                    { field: 'check_interval', header: this.translate.instant('Intervall Prüfen') }
                ];
                this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));
        
                console.log('ProductListPage idCustomer:', this.idCustomer);
                this.page_load();
            }
          });
    }

    onResize(event) {
        console.log('onResize');
        this.funcHeightCalc();
    }

    funcHeightCalc() {
        let x = this.divHeightCalc.nativeElement.scrollHeight;
        if (x == 0) { x = 550; }
        if (this.splitFilter) { x = x - 51; }
        // if (x < 80) { x = 80; }
        this.heightCalc = x + 'px';
        console.log('heightCalc 2 :', x, this.heightCalc);
    }

    page_load() {
        console.log('ionViewDidLoad ProductListPage');
        this.rowRecords = 0;
        this.totalRecords = 0;
        this.selectMulti = 1;

        this.events.publish('prozCustomer', 0);
        this.apiService.pvs4_get_product_list(this.idCustomer).then((result: any) => {
            console.log('pvs4_get_product_list ok');
            try {
                let list = JSON.parse(JSON.stringify(result.list));
                this.productListAll = list;
            } catch (e) {
                console.log('JSON.parse err :', e);
            }

            try {
                let json = '{';
                for (var j = 0; j < this.cols.length; j++) {
                    json += '"' + this.cols[j].field + '":""';
                    json += ',';
                }
                json += '"search_all":""}';
                //console.log('columnFilterValues :', json);
                this.columnFilterValues = JSON.parse(json);
                
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
                console.log('JSON.parse filter err :', e);
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
                            if (pr.protocol_date) this.productListAll[index].data.last_protocol_date = this.apiService.mysqlDate2view(pr.protocol_date);
                            if (pr.protocol_date_next) this.productListAll[index].data.last_protocol_next = this.apiService.mysqlDate2view(pr.protocol_date_next);
                            if (pr.result) {
                                if (pr.result == 1) this.productListAll[index].data.last_protocol_next = this.translate.instant('reparieren');
                                if (pr.result == 3) this.productListAll[index].data.last_protocol_next = this.translate.instant('unauffindbar');
                                if (pr.result == 4) this.productListAll[index].data.last_protocol_next = this.translate.instant('ausmustern');
                            }
                        } catch (e) {
                            console.log('JSON.parse(pr) err :', e);
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
                        console.error("JSON.parse options err :", e);
                        console.log("options :", this.productListAll[index].data);
                    }
                }

                //console.log('options :', options);

                if (options == null) { options = []; }

                for (let i = 0; i < options.length; i++) {
                    //console.log('options :', options[i]);
                    //console.log('options :', options[i].id);
                    //console.log('options :', options[i].title);

                    if (!this.cols.find(x => x.field == options[i].title[this.lang])) { this.cols.push({ field: options[i].title[this.lang], header: options[i].title[this.lang] }); }
                    const pipe = new DatePipe('en-US');
                    if (options[i].type == 5) { this.productListAll[index].data[options[i].title[this.lang]] = pipe.transform(options[i].value, 'dd.MM.yyyy'); }
                    if (options[i].type != 5) { this.productListAll[index].data[options[i].title[this.lang]] = options[i].value; }
                }
                // console.log("index :", index);
            }
            console.log("selectedColumns");
            this.selectedColumns = JSON.parse(JSON.stringify(this.cols));

            this.generate_productList();
        });
        this.funcHeightCalc();
    }

    title_translate(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            /*if(nodes[i].data.nfc_tag_id) {
                nodes[i].data.nfc_tag_id = true;
            } else {
                nodes[i].data.nfc_tag_id = false;
            }*/
            const title = JSON.parse(nodes[i].data.title);
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
            if(this.columnFilterValues[this.cols[i].field]){
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
        if (this.isFilterOn()) {
            this.menuItems[8].items[2]['disabled'] = false;
        } else {
            this.menuItems[8].items[2]['disabled'] = true;
        }
        this.generate_productList();
        localStorage.setItem('filter_values_product', JSON.stringify(this.columnFilterValues));
    }

    cancel_filters(cancel_type) {
        console.log('cancel_filters');
        this.menuItems[8].items[2]['disabled'] = true;
        if (cancel_type == 1) {
            for (let i = 0; i < this.cols.length; i++) {
                this.columnFilterValues[this.cols[i].field] = '';
            }
        } else {
            let json = '{';
            for (var j = 0; j < this.cols.length; j++) {
                json += '"' + this.cols[j].field + '":""';
                json += ',';
            }
            json += 'search_all:""}';
            this.columnFilterValues = JSON.parse(json);
        }
        this.generate_productList();
    }

    generate_productList() {
        console.log('generate_productList', this.isFilterOn());

        if (!this.isFilterOn()) {
            this.productListView = JSON.parse(JSON.stringify(this.productListAll));
        } else {
            const try_list = JSON.parse(JSON.stringify(this.productListAll));
            this.dir_try_filter(try_list);
            this.productListView = try_list;
        }

        if (this.productListView.length > 0) {
            this.menuItems[8].items[0]['disabled'] = false;
            this.menuItems[8].items[1]['disabled'] = false;
            this.menuItems[8].items[3]['disabled'] = false;
        } else {
            this.menuItems[8].items[0]['disabled'] = true;
            this.menuItems[8].items[1]['disabled'] = true;
            this.menuItems[8].items[3]['disabled'] = true;
        }

        this.rowRecords = this.productListView.length;
        this.totalRecords = this.productListAll.length;
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
        console.log('nodeSelect selectedNode :', selectedNode.length);
        let selectedNodeLength = selectedNode.length;
        console.log('selectMulti :', this.selectMulti);
        if (!this.selectMulti) {
            selectedNodeLength = 1;
            this.selectMulti = 1;
        }

        console.log('nodeSelect event:', event  );
        console.log('nodeSelect selectedNodeLength:',  selectedNodeLength);
        this.selectedNode.data = event.node.data;
        this.menuItems[0].disabled = false;
        this.menuItems[1].disabled = false;
        this.menuItems[2].disabled = false;
        this.menuItems[3].disabled = false;
        this.menuItems[5].items[0]['disabled'] = false;
        this.menuItems[5].items[1]['disabled'] = false;
        this.menuItems[8].items[4]['disabled'] = false;
        let id_sn = 0;

        console.log('selectedNodeLength :', selectedNodeLength);
        if (selectedNodeLength == 1) {
            this.selectedNode.data = this.selectedNode[0].data;
            if (this.selectedNode) {
                if (this.selectedNode.data.id) {
                    id_sn = this.selectedNode.data.id;
                }
            }
            if (id_sn == this.move_id) {
                this.menuItems[3].visible = this.userdata.role_set.edit_products;
                this.menuItems[4].visible = false;
                this.move_id = 0;
            } else if (this.move_id > 0) {
                this.move_obj.parent = id_sn;
                this.move_obj.title = JSON.stringify(this.move_obj.titleJson);
                this.apiService.pvs4_set_product(this.move_obj).then((result: any) => {
                    console.log('result: ', result);
                    this.page_load();
                });
                this.menuItems[3].visible = this.userdata.role_set.edit_products;
                this.menuItems[4].visible = false;
                this.move_id = 0;
            }
        } else {
            this.menuItems[0].disabled = true;
            this.menuItems[1].disabled = true;
            this.menuItems[2].disabled = true;
            this.menuItems[3].disabled = true;
            this.menuItems[3].visible = this.userdata.role_set.edit_products;
            this.menuItems[4].visible = false;
            this.menuItems[8].items[4]['disabled'] = true;
            this.move_id = 0;
        }
        if (selectedNodeLength == 0) {
            this.menuItems[5].items[2]['disabled'] = true;
            this.menuItems[8].items[4]['disabled'] = true;
        } else {
            this.menuItems[5].items[2]['disabled'] = false;
            this.menuItems[8].items[4]['disabled'] = false;
        }
        if (selectedNodeLength >= 2) {
            this.menuItems[5].items[0]['disabled'] = true;
            this.menuItems[5].items[1]['disabled'] = true;
        }
    }

    menu_new() {
        console.log('menu_new', this.selectedNode, this.idCustomer);
        const obj = { id: 0, parent: 0, idCustomer: this.idCustomer };
        if (this.selectedNode) {
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
                let data = {
                    id: this.selectedNode.data.id,
                    idCustomer: this.idCustomer,
                    parent: this.selectedNode.data.parent,
                    company: this.company
                }
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

                let data = {
                    idCustomer: this.idCustomer,
                    idProduct: id,
                    titleProduct: this.selectedNode.data.title,
                    company: this.company
                }
                this.dataService.setData(data);
                this.navCtrl.navigateForward(['/protocol-history']);
            }
        }
    }

    async product_migration() {
        console.log('product_migration', this.selectedNode);
        if (this.selectedNode) {
            let nodeList : string[]  = [];
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

            modal.onDidDismiss().then(data => {
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
            this.menuItems[3].visible = false;
            this.menuItems[4].visible = true;
            this.selectMulti = 0;
        } else if (n == 2) {
            // in Root
            this.move_obj.parent = 0;
            this.move_obj.title = JSON.stringify(this.move_obj.titleJson);
            this.apiService.pvs4_set_product(this.move_obj).then((result: any) => {
                console.log('result: ', result);
                this.page_load();
            });
            this.menuItems[3].visible = true;
            this.menuItems[4].visible = false;
            this.menuItems[3].visible = true;
            this.menuItems[4].visible = false;
            this.move_id = 0;
            this.selectMulti = 1;
        }
    }

    menu_view() {
        console.log('menu_view', this.selectedNode[0]);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const id = parseInt(this.selectedNode.data.id);
                console.log('menu_view :', id, JSON.stringify(this.selectedNode.data));
     
                this.navCtrl.navigateForward(['/product-details',id] );
            }
        }
    }

    create_template() {
        console.log('create_template', this.selectedNode);
    
        let data = {
            idCustomer: this.idCustomer
        }
        this.dataService.setData(data);
        this.navCtrl.navigateForward(['/product-template']);
    }

    create_protocol() {
        if (this.selectedNode) {
            console.log('create_protocol', this.selectedNode);
            let nodeList = [];
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
              
            let data = {
                id: 0, 
                idCustomer: this.idCustomer,
                productList: JSON.stringify(nodeList)
            }
            this.dataService.setData(data);
            this.navCtrl.navigateForward(['/protocol-edit']);
        }
    }

    excel_all() {
        console.log('excel_all');
        const data: any = [];
        this.allnodes = [];
        console.log('allnodes :', this.allnodes);
        this.data_tree(this.productListAll);
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
        console.log('excel_all data :', data);
        this.excelService.exportAsExcelFile(data, 'product_all.xlsx');
    }

    excel_view() {
        console.log('excel_view');
        const data: any = [];
        this.allnodes = [];
        this.data_tree(this.productListView);
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
        this.excelService.exportAsExcelFile(data, 'product_view.xlsx');
    }

    printPdf() {
        const pdfTitle: any = this.translate.instant('Produkt') + ' ' + this.translate.instant('Liste');
        let columns: any[] = [];
        const widthsArray: string[] = [];
        const bodyArray: any[] = [];
        this.allnodes = [];
        let rowArray: any[] = [];
        this.data_tree(this.productListView);
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

            for (var l = 7; l < this.selectedColumns.length; l++) {
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
        const inputs: any[] = [];
        for (var i = 0; i < this.cols.length; i++) {
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
            if(this.columnFilterValues[this.cols[i].field]){
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
        this.expendedNodes = this.expendedNodes.filter(function (element, index, array) { return element != event.node.data['id'] });
        localStorage.setItem('expanded_nodes_product', JSON.stringify(this.expendedNodes));
    }
}