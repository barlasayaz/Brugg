import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, ModalController, Events, LoadingController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode, MenuItem, LazyLoadEvent } from 'primeng/api';
import { ExcelService } from '../services/excel';
import { AlertController } from '@ionic/angular';
import { CustomerEditComponent } from '../components/customer-edit/customer-edit.component';
import { PdfExportService } from '../services/pdf-export';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SystemService } from '../services/system';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-customer-table',
    templateUrl: './customer-table.page.html',
    styleUrls: ['./customer-table.page.scss'],
})

export class CustomerTablePage implements OnInit {
    constructor(public navCtrl: NavController,
        public userdata: UserdataService,
        public apiService: ApiService,
        public translate: TranslateService,
        public modalCtrl: ModalController,
        public excelService: ExcelService,
        public alertCtrl: AlertController,
        public pdf: PdfExportService,
        public system: SystemService,
        public events: Events,
        public loadingCtrl: LoadingController,
        private screenOrientation: ScreenOrientation,
        private route: ActivatedRoute) {
            this.modelChanged.pipe(
                debounceTime(700))
                .subscribe(model => {
                    if (this.isFilterOn()) {
                        this.menuItems[7].items[0]['disabled'] = false;
                    } else {
                        this.menuItems[7].items[0]['disabled'] = true;
                    }
                    this.generate_customerList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
                    localStorage.setItem('filter_values_customer', JSON.stringify(this.columnFilterValues));
            });
    }
    public customerListAll: TreeNode[] = [];
    public customerListView: TreeNode[] = [];
    public customerListSearch: TreeNode[] = [];
    public cols: any[] = [];
    public selectedNode: TreeNode;
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public xlsHeader: any[];
    public customerList: any[];
    public splitFilter = false;
    public idCustomer = 0;
    public heightCalc: any;
    public move_id = 0;
    public move_to = 0;
    public move_obj: any = {};
    public columnFilterValues = { edit: '',
                                  company: '',
                                  id: '',
                                  customer_number: '',
                                  rating: '',
                                  zip_code: '',
                                  place: '',
                                  employees: '',
                                  last_date: '',
                                  next_date: '',
                                  inspector: '',
                                  sector: '',
                                  search_all: '' };
    public filterCols: string[];
    public expendedNodes: string[] = [];
    modelChanged: Subject<any> = new Subject<any>();
    public totalRecords: number;
    public rowRecords: number;
    public rowHeight = 26;
    public rowCount = 100;
    public sortedColumn = { sort_field : null, sort_order : 0 };
    public filterText: string = "";
    public filterOn: boolean = false;
    public workMode: boolean = false;
    public editMode: boolean = false;
    public moveMode: boolean = false;

    public menuItems: MenuItem[] = [{
        label: this.translate.instant('Ansicht'),
        icon: 'pi pi-fw pi-eye',
        disabled: true,
        command: (event) => {
            console.log('command menuitem:', event);
            this.menu_view();
        }
    },
    {
        label: this.translate.instant('Bearbeiten'),
        icon: 'pi pi-fw pi-pencil',
        disabled: true,
        visible: this.userdata.role_set.edit_customer,
        command: (event) => {            
            console.log('command menuitem:', event);
            this.menu_edit();
        }
    },
    {
        label: this.translate.instant('Bewegen'),
        icon: 'pi pi-fw pi-chevron-up',
        visible: this.userdata.role_set.edit_customer,
        disabled: true,
        command: (event) => {            
            console.log('command menuitem:', event);
            this.menu_move();
        }
    },
    {
        label: this.translate.instant('Stammordner'),
        icon: 'pi pi-fw pi-chevron-down',
        visible: false,
        disabled: false,
        command: (event) => {
            if (this.userdata.role_set.edit_customer != true) { return; }
            console.log('command menuitem:', event);
            this.menu_move();
        }
    },
    {
        label: this.translate.instant('Neu'),
        icon: 'pi pi-fw pi-plus',
        visible: this.userdata.role_set.edit_customer,
        command: (event) => {
            if (this.userdata.role_set.edit_customer != true) { return; }
            console.log('command menuitem:', event);
            this.menu_new();
        }
    },
    {
        label: this.translate.instant('Filter'),
        icon: 'pi pi-fw pi-filter',
        command: (event) => {
            console.log('command menuitem:', event);
            this.menu_filter();
        }
    },
    {
        label: this.translate.instant('Spalten'),
        icon: 'pi pi-fw pi-eject',
        command: (event) => {
            console.log('command menuitem:', event);
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
                    console.log('command menuitem:', event);
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
    }];

    public popupMenu: MenuItem[] = [{
        label: this.translate.instant('Menü'),
        icon: 'fa fa-fw fa-list',
        items: this.menuItems
    }];

    @ViewChild('tt') dataTable: TreeTable;
    @ViewChild('divHeightCalc') divHeightCalc: any;

    update(data:any):void{
        console.log('update():',data );
        if(data.lable==="searchText"){
            this.columnFilterValues['search_all'] = data.text;
            if (this.isFilterOn()) {
                this.menuItems[7].items[0]['disabled'] = false;
            } else {
                this.menuItems[7].items[0]['disabled'] = true;
            }
            this.generate_customerList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
            localStorage.setItem('filter_values_customer', JSON.stringify(this.columnFilterValues));
        }  
        if(data.lable==="newCustomer"){
            if (this.userdata.role_set.edit_customer != true) { return; }
            this.menu_new();
        }
        if(data.lable==="toggleFilter"){
            this.menu_filter();
        }
        if(data.lable==="showColumns"){
            this.show_columns();
        }

        
    }

    ngOnInit(): void {
        if (this.editMode) {
            this.cols = [
                { field: 'company', header: this.translate.instant('Firma'), width: '200px' },
                { field: 'id', header: 'DB-ID', width: '60px' },
                { field: 'customer_number', header: 'ID', width: '85px'},
                { field: 'rating', header: this.translate.instant('Typ'), width: '100px' },
                { field: 'zip_code', header: this.translate.instant('PLZ'), width: '85px'},
                { field: 'place', header: this.translate.instant('Ort'), width: '200px' },
                { field: 'employees', header: this.translate.instant('Mitarbeiter'), width: '170px' },
                { field: 'last_date', header: this.translate.instant('Letzter besuch'), width: '120px' },
                { field: 'next_date', header: this.translate.instant('Nächster besuch'), width: '120px' },
                { field: 'inspector', header: this.translate.instant('Prüfer'), width: '170px' },
                { field: 'sector', header: this.translate.instant('Branche'), width: '200px' }
            ];
        } else {
            this.cols = [
                { field: 'company', header: this.translate.instant('Firma'), width: '200px' },
                { field: 'edit', header: this.translate.instant('Bearbeiten'), width: '60px' },
                { field: 'id', header: 'DB-ID', width: '60px' },
                { field: 'customer_number', header: 'ID', width: '85px'},
                { field: 'rating', header: this.translate.instant('Typ'), width: '100px' },
                { field: 'zip_code', header: this.translate.instant('PLZ'), width: '85px'},
                { field: 'place', header: this.translate.instant('Ort'), width: '200px' },
                { field: 'employees', header: this.translate.instant('Mitarbeiter'), width: '170px' },
                { field: 'last_date', header: this.translate.instant('Letzter besuch'), width: '120px' },
                { field: 'next_date', header: this.translate.instant('Nächster besuch'), width: '120px' },
                { field: 'inspector', header: this.translate.instant('Prüfer'), width: '170px' },
                { field: 'sector', header: this.translate.instant('Branche'), width: '200px' }
            ];
    
        }

        this.filterCols = ['company',
                           'id',
                           'customer_number',
                           'rating',
                           'zip_code',
                           'place',
                           'employees',
                           'last_date',
                           'next_date',
                           'inspector',
                           'sector',
                           'search_all'];
        this.selectedColumns = this.cols;
        console.log('CustomerTablePage idCustomer:', this.idCustomer, this.system.platform);
        if (localStorage.getItem('sort_column_customer') != undefined) {
            this.sortedColumn = JSON.parse(localStorage.getItem('sort_column_customer'));
        }
        this.filterText = this.route.snapshot.paramMap.get('filterText');
        if(this.filterText.length>0) this.filterOn = true;
        console.log('filterText :', this.filterText);

        this.page_load();
    }

    onResize(event) {
        this.funcHeightCalc();
    }

    async loadNodes(event: LazyLoadEvent) {
        if (this.totalRecords > 0) {
            if(event.sortField && event.sortField.length>0)
            {
                this.sortedColumn.sort_field = event.sortField;
                this.sortedColumn.sort_order = event.sortOrder;
                localStorage.setItem('sort_column_customer', JSON.stringify(this.sortedColumn));
            }
            this.generate_customerList(event.first, event.rows, event.sortField, event.sortOrder);
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

        this.rowRecords = 0;
        this.totalRecords = 0;
        this.events.publish('prozCustomer', 0);
        this.apiService.pvs4_get_customer_list(0, this.filterText).then((result: any) => {
            console.log('page_load result :', result);

            this.customerListAll = result.list;
            console.log('total records :', this.customerListAll.length);

            // console.log(' customerListAll ', this.customerListAll );
            if (localStorage.getItem('filter_values_customer') != undefined) {
                this.columnFilterValues = JSON.parse(localStorage.getItem('filter_values_customer'));
            }
            if (localStorage.getItem('split_filter') != undefined) {
                this.splitFilter = JSON.parse(localStorage.getItem('split_filter'));
            }
            if (localStorage.getItem('show_columns') != undefined) {
                this.selectedColumns = JSON.parse(localStorage.getItem('show_columns'));
            }

           this.generate_customerList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
           this.funcHeightCalc();
          // this.selectedColumns = this.cols;
           loader.dismiss();
        });
        this.funcHeightCalc();
    }

    try_filter(node: TreeNode): boolean {
        let ret: any = false;

        for (let i = 0; i < this.cols.length; i++) {
            if (this.columnFilterValues['search_all'].trim().length > 0 && node.data[this.cols[i].field] != undefined
                && node.data[this.cols[i].field].toLowerCase().indexOf(this.columnFilterValues['search_all'].trim().toLowerCase()) >= 0) {
                ret = true;
            }
        }

        if (this.columnFilterValues['search_all'].trim().length > 0 && !ret) {
            return false;
        } else if (this.columnFilterValues['search_all'].trim().length == 0 && !ret) {
            ret = true;
             }

        for (let i = 0; i < this.cols.length; i++) {
            let fx = '';
            if (this.columnFilterValues[this.cols[i].field]) {
                fx = this.columnFilterValues[this.cols[i].field].trim();
            }
            if  (fx.length > 0) {
                if (node.data[this.cols[i].field]) {
                    if ( (node.data[this.cols[i].field].toLowerCase().indexOf(fx.toLowerCase()) < 0) ) { return false; }
                } else {
                    return false;
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
        this.menuItems[7].items[0]['disabled'] = true;
        if (cancel_type == 1) {
            for (let i = 0; i < this.cols.length; i++) {
                this.columnFilterValues[this.cols[i].field] = '';
            }
        } else {
            this.columnFilterValues = { edit: '',
                                        company: '',
                                        id: '',
                                        customer_number: '',
                                        rating: '',
                                        zip_code: '',
                                        place: '',
                                        employees: '',
                                        last_date: '',
                                        next_date: '',
                                        inspector: '',
                                        sector: '',
                                        search_all: '' };
        }
        localStorage.setItem('filter_values_customer', JSON.stringify(this.columnFilterValues));
        this.generate_customerList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
    }

    generate_customerList(start_index: number, end_index: number, sort_field, sort_order) {
        console.log('generate_customerList()');
        if (!this.isFilterOn()) {
            this.customerListView = JSON.parse(JSON.stringify(this.customerListAll));
        } else {
            const try_list = JSON.parse(JSON.stringify(this.customerListAll));
            this.dir_try_filter(try_list);
            this.customerListView = try_list;
            this.customerListSearch = try_list;
        }
        if (sort_field != null) {
            this.customerListView = this.customerListView.sort((a, b) => {
                const value1 = a.data[sort_field];
                const value2 = b.data[sort_field];

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

        this.rowRecords = this.customerListView.length;
        this.totalRecords = this.customerListAll.length;

        console.log('start_index - end_index :', start_index, end_index);

        if ((start_index + end_index + this.rowCount) >= this.rowRecords) {
            this.customerListView = this.customerListView.slice(start_index, this.rowRecords);
        } else {
            this.customerListView = this.customerListView.slice(start_index, (start_index + end_index));
        }

        if (this.customerListView.length > 0) {
            if (this.isFilterOn()) {
                this.menuItems[7].items[0]['disabled'] = false;
            } else {
                this.menuItems[7].items[0]['disabled'] = true;
            }
            this.menuItems[7].items[1]['disabled'] = false;
            this.menuItems[7].items[2]['disabled'] = false;
        } else {
            this.menuItems[7].items[0]['disabled'] = true;
            this.menuItems[7].items[1]['disabled'] = true;
            this.menuItems[7].items[2]['disabled'] = true;
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

        if (localStorage.getItem('expanded_nodes') != undefined) {
            this.expandChildren(this.customerListView, JSON.parse(localStorage.getItem('expanded_nodes')));
        }
    }

    async editCustomer(rowNode){
        console.log('editCustomer:', rowNode);
        if (rowNode.id) {
            const id = parseInt(rowNode.id);
            console.log('menu_edit id', id);
            const modal =
            await this.modalCtrl.create({
                component: CustomerEditComponent,
                cssClass: 'customeredit-modal-css',
                componentProps: {
                id: id
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

    nodeSelect() {
        console.log('nodeSelect:', this.menuItems, this.workMode);
        let id_sn = 0;

        if(this.workMode){
            this.selectedNode = null;
            return;
        }else{
            //id_sn = this.selectedNode.data.id;
            this.menu_view();
        }
       
        return;
        /* todo */
        
        this.menuItems[0].disabled = false;
        this.menuItems[1].disabled = false;
        this.menuItems[2].disabled = false;
        
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                id_sn = this.selectedNode.data.id;
            }
        }

        if (id_sn == this.move_id) {
            this.menuItems[2].visible = this.userdata.role_set.edit_customer;
            this.menuItems[3].visible = false;
            this.move_id = 0;
        } else if (this.move_id > 0) {
            console.log('move item :', this.move_id, this.move_obj);
            this.move_obj.parent = id_sn;
            this.apiService.pvs4_set_customer(this.move_obj).then(async (result: any) => {
                console.log('result: ', result);
                this.page_load();
            });
            this.menuItems[2].visible = this.userdata.role_set.edit_customer;
            this.menuItems[3].visible = false;
            this.move_id = 0;
        }
    }

    nodeUnselect() {
        console.log('nodeUnselect:');
        this.menuItems[0].disabled = true;
        this.menuItems[1].disabled = true;
        this.menuItems[2].disabled = true;
        this.menuItems[2].visible = this.userdata.role_set.edit_customer;
        this.menuItems[3].visible = false;
        this.move_id = 0;
    }

    async menu_new() {
        console.log('menu_new', this.selectedNode);
        const idCustomer = 0;
        let parentCustomer = 0;
        if (this.selectedNode != undefined) {
            if (this.selectedNode.data.id) {
                parentCustomer = parseInt(this.selectedNode.data.id);
            }
        }
        const modal =
        await this.modalCtrl.create({
          component: CustomerEditComponent,
          cssClass: 'customeredit-modal-css',
          componentProps: {
            id: idCustomer,
            parent: parentCustomer
          }
        });
        modal.onDidDismiss().then(async data => {
            if (data['data']) {
                this.page_load();
            }
        });
        modal.present();
    }

    workBreak(){
        this.workMode = false;
        this.editMode = false;  
        this.moveMode = false; 
        this.move_id = 0;
        this.move_to = 0;
        this.move_obj = {};
    }

    menu_edit() {
        console.log('menu_edit')
        if (this.userdata.role_set.edit_customer != true) { return; };
        this.workMode = true;
        this.editMode = true;       
    }

    async moveCustomer(step,rowNode){
        console.log('moveCustomer',step,rowNode);
        if(step==1){
            this.move_id = parseInt(rowNode.id);
            this.move_obj = JSON.parse(JSON.stringify(rowNode));
        }
        if(step==2){
            this.move_to = parseInt(rowNode.id);
            if(this.move_to===this.move_id ) 
            {
                this.move_to=0; //Stammordner
            }

            const alert = await this.alertCtrl.create({
                header: this.translate.instant('Achtung'),
                message: this.translate.instant('Möchten Sie diesen Kunden wirklich verschieben?'),
                buttons: [{
                    text: this.translate.instant('nein'),
                    handler: data => {
                        this.workBreak();
                    }
                },
                {
                    text: this.translate.instant('ja'),
                    handler: data => {
                        this.move_obj.parent = this.move_to;
                        this.apiService.pvs4_set_customer(this.move_obj).then(async (result: any) => {
                            console.log('result: ', result);
                            this.workBreak();
                            this.page_load();
                        });
                    }
                }
                ]
            });
            await alert.present();

            //this.move_obj = JSON.parse(JSON.stringify(rowNode));
        }
    }

    menu_move() { 
        console.log('menu_move_up');
        this.workMode = true;
        this.moveMode = true; 
        this.move_id = 0;
        this.move_to = 0;
        this.move_obj = {};
    }

    customer_list(num) {
        console.log('customer_list');
        const data: any = [];
        this.allnodes = [];
        this.data_tree(this.customerListAll);
        for (let i = 0, len = this.allnodes.length; i < len; i++) {
            const obj = this.allnodes[i];

            data.push({
                'edit': obj.edit,
                'company': obj.company,
                'id': obj.id,
                'customer_number': obj.customer_number,
                'rating': obj.rating,
                'zip_code': obj.zip_code,
                'place': obj.place,
                'employees': obj.employees,
                'last_date': obj.last_date,
                'next_date': obj.next_date,
                'inspector': obj.inspector,
                'sector': obj.sector
            });
        }
        this.customerList = data;
    }

    menu_view() {
        console.log('menu_view', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const id = parseInt(this.selectedNode.data.id);
                console.log('menu_view id', id);
                this.navCtrl.navigateForward('/customer-details/' + id);
            }
        }
    }

    async excel_export() {
        console.log('excel_view', this.isFilterOn());

        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        const data: any = [];
        this.allnodes = [];
        if (this.isFilterOn()) {
            this.data_tree(this.customerListSearch);
        } else {
            this.data_tree(this.customerListAll);
        }
        for (let i = 0, len = this.allnodes.length; i < len; i++) {
            const obj = this.allnodes[i];
            obj.company = obj.company.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.country = obj.country.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.place   = obj.place.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.po_box  = obj.po_box.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.sector  = obj.sector.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.street  = obj.street.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
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
        this.excelService.exportAsExcelFile(data, 'customer_view.xlsx');
        loader.dismiss();
    }

    async pdf_export() {
        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        const columns: any[] = [];
        const widthsArray: string[] = [];
        const headerRowVisible: any = 1;
        for (let k = 0; k < this.selectedColumns.length; k++) {
            columns.push({ text: this.selectedColumns[k].header, style: 'header' });
            widthsArray.push('auto');
        }
        const bodyArray: any[] = [];
        bodyArray.push(columns);
        this.allnodes = [];
        if (this.isFilterOn()) {
            this.data_tree(this.customerListSearch);
        } else {
            this.data_tree(this.customerListAll);
        }
        let obj: any;
        let rowArray: any[] = [];
        for (let i = 0, len = this.allnodes.length; i < len; i++) {
            obj = this.allnodes[i];
            rowArray = [];
            for (let j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                   rowArray.push(obj[this.selectedColumns[j].field]);
                } else {
                   rowArray.push('');
                }
            }
            bodyArray.push(rowArray);
        }

        this.pdf.get_ListDocDefinition(bodyArray,
                                       widthsArray,
                                       headerRowVisible,
                                       this.translate.instant('Kunde') + ' ' + this.translate.instant('Liste'),
                                       this.translate.instant('Kunde') + this.translate.instant('Liste') + '.pdf');
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
        console.log('menu_filter()');
        this.splitFilter = !this.splitFilter;
        if (!this.splitFilter) {
            this.cancel_filters(1);
        }
        localStorage.setItem('split_filter', JSON.stringify(this.splitFilter));
        this.funcHeightCalc();
    }

    async  show_columns() {
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

    async  show_alert(inputs) {
        const alert = await this.alertCtrl.create({header: this.translate.instant('Spalten Auswählen'), inputs: inputs,
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
                    localStorage.setItem('show_columns', JSON.stringify(this.selectedColumns));
                }
            }
            ] });

          await alert.present();
    }

    isFilterOn(): any {
        let ret = false;
        for (let i = 0; i < this.filterCols.length; i++) {
            if ( (this.columnFilterValues[this.filterCols[i]]) && (this.columnFilterValues[this.filterCols[i]].trim().length > 0) ) {
                ret = true;
            }
        }
        return ret;
    }

    expandChildren(nodes: TreeNode[], expended: string[]) {
        for (let i = 0; i < nodes.length; i++) {
            if (expended != null ) {
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
        localStorage.setItem('show_columns', JSON.stringify(this.selectedColumns));
    }

    onColReorder(event) {
        this.selectedColumns = event.columns;
        localStorage.setItem('show_columns', JSON.stringify(this.selectedColumns));
    }

    onNodeExpand(event) {
        this.expendedNodes.push(event.node.data['id']);
        localStorage.setItem('expanded_nodes', JSON.stringify(this.expendedNodes));
    }
    onNodeCollapse(event) {
        this.expendedNodes = this.expendedNodes.filter(function (element, index, array) { return element != event.node.data['id']; });
        localStorage.setItem('expanded_nodes', JSON.stringify(this.expendedNodes));
    }

}
