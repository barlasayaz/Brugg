import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, ModalController, Events } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode, MenuItem } from 'primeng/api';
import { ExcelService } from '../services/excel';
import { AlertController } from '@ionic/angular';
import { CustomerEditComponent } from '../components/customer-edit/customer-edit.component';
import { PdfExportService } from '../services/pdf-export';

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
        public events: Events) {
    }
    public customerListAll: TreeNode[] = [];
    public customerListView: TreeNode[] = [];
    public cols: any[] = [];
    public selectedNode: TreeNode;
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public xlsHeader: any[];
    public customerList: any[];
    public splitFilter: boolean = false;
    public idCustomer: number = 0;
    public heightCalc: any = '700px';
    public move_id: number = 0;
    public move_obj: any = {};
    public columnFilterValues = { company: '', id: '', customer_number: '', rating: '', zip_code: '', place: '', employees: '', last_date: '', next_date: '', inspector: '', search_all: '' };
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public rowRecords: number = 0;
    public totalRecords: number = 0;

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
            if (this.userdata.role_set.edit_customer != true) { return; }
            console.log('command menuitem:', event);
            this.menu_edit();
        }
    },
    {
        label: this.translate.instant('Bewegen'),
        icon: 'pi pi-fw pi-arrow-up',
        visible: this.userdata.role_set.edit_customer,
        disabled: true,
        command: (event) => {
            if (this.userdata.role_set.edit_customer != true) { return; }
            console.log('command menuitem:', event);
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
            console.log('command menuitem:', event);
            this.menu_move(2);
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
                    console.log('command menuitem:', event);
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
    }];

    @ViewChild('tt') dataTable: TreeTable;
    @ViewChild('divHeightCalc') divHeightCalc: any;

    ngOnInit(): void {
        this.cols = [
            { field: 'company', header: this.translate.instant('Firma') },
            { field: 'id', header: 'DB-ID' },
            { field: 'customer_number', header: '#' },
            { field: 'rating', header: this.translate.instant('Typ') },
            { field: 'zip_code', header: this.translate.instant('PLZ') },
            { field: 'place', header: this.translate.instant('Ort') },
            { field: 'employees', header: this.translate.instant('Mitarbeiter') },
            { field: 'last_date', header: '<< ' + this.translate.instant('Termin') },
            { field: 'next_date', header: '>> ' + this.translate.instant('Termin') },
            { field: 'inspector', header: this.translate.instant('Prüfer') }
        ];

        this.filterCols = [
            'company', 'id', 'customer_number', 'rating', 'zip_code', 'place', 'employees', 'last_date', 'next_date', 'inspector', 'search_all'
        ];
        this.selectedColumns = this.cols;
        console.log('CustomerTablePage idCustomer:', this.idCustomer);
        this.page_load();
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
        console.log('heightCalc 1 :', x, this.heightCalc );
    }

    page_load() {
        console.log('ionViewDidLoad CustomerTablePage');
        this.rowRecords = 0;
        this.totalRecords = 0;
        this.events.publish('prozCustomer', 0);
        this.apiService.pvs4_get_customer_list(0).then((result: any) => {
            console.log('ionViewDidLoad result :', result);

            this.customerListAll = result.list;

            console.log(' customerListAll ', this.customerListAll );
            if (localStorage.getItem('filter_values') != undefined) {
                this.columnFilterValues = JSON.parse(localStorage.getItem('filter_values'));
            }
            if (localStorage.getItem('split_filter') != undefined) {
                this.splitFilter = JSON.parse(localStorage.getItem('split_filter'));
                this.funcHeightCalc();
            }
            if (localStorage.getItem('show_columns') != undefined) {
                this.selectedColumns = JSON.parse(localStorage.getItem('show_columns'));
            }
            this.generate_customerList();
        });
        this.funcHeightCalc();
    }

    try_filter(node: TreeNode): boolean {
        //console.log('try_filter', node );
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
            //console.log('node.data[this.cols[i].field]', node.data[this.cols[i].field] );
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
        //console.log('dir_try_filter', nodes, nodes.length);
        let del_ret = false;
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].children) {
                let ret = this.dir_try_filter(nodes[i].children);
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
            this.menuItems[7].items[2]['disabled'] = false;
        } else {
            this.menuItems[7].items[2]['disabled'] = true;
        }
        this.generate_customerList();
        localStorage.setItem('filter_values', JSON.stringify(this.columnFilterValues));
    }

    cancel_filters(cancel_type) {
        console.log('cancel_filters');
        this.menuItems[7].items[2]['disabled'] = true;
        if (cancel_type == 1) {
            for (let i = 0; i < this.cols.length; i++) {
                this.columnFilterValues[this.cols[i].field] = '';
            }
        } else {
            this.columnFilterValues = { company: '',
                                        id: '',
                                        customer_number: '',
                                        rating: '',
                                        zip_code: '',
                                        place: '',
                                        employees: '',
                                        last_date: '',
                                        next_date: '',
                                        inspector: '',
                                        search_all: '' };
        }
        this.generate_customerList();
    }

    generate_customerList() {
        if (!this.isFilterOn()) {
            this.customerListView = JSON.parse(JSON.stringify(this.customerListAll));
        } else {
            let try_list = JSON.parse(JSON.stringify(this.customerListAll));
            this.dir_try_filter(try_list);
            this.customerListView = try_list;
        }

        if (this.customerListView.length > 0) {
            this.menuItems[7].items[0]['disabled'] = false;
            this.menuItems[7].items[1]['disabled'] = false;
            this.menuItems[7].items[3]['disabled'] = false;
        } else {
            this.menuItems[7].items[0]['disabled'] = true;
            this.menuItems[7].items[1]['disabled'] = true;
            this.menuItems[7].items[3]['disabled'] = true;
        }

        this.rowRecords = this.customerListView.length;
        this.totalRecords = this.customerListAll.length;
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

    nodeSelect() {
        console.log('nodeSelect:', this.menuItems);
        this.menuItems[0].disabled = false;
        this.menuItems[1].disabled = false;
        this.menuItems[2].disabled = false;
        let id_sn = 0;
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
            this.apiService.pvs4_set_customer(this.move_obj).then((result: any) => {
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
        const obj = { id: 0, parent: 0 };
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                obj.parent = this.selectedNode.data.id;
            }
        }
        const modal =
        await this.modalCtrl.create({
          component: CustomerEditComponent,
          componentProps: {
            obj: obj
          }
        });
        modal.onDidDismiss().then(data => {
            if (data['data']) {
              this.page_load();
            }
          }); 
          modal.present();
    }

    async menu_edit() {
        console.log('menu_edit', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                const id = parseInt(this.selectedNode.data.id);
                console.log('menu_edit id', id);
                const modal =
                await this.modalCtrl.create({
                  component: CustomerEditComponent,
                  componentProps: {
                    id: id
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
            this.menuItems[2].visible = false;
            this.menuItems[3].visible = true;
        } else if (n == 2) {
            // in Stammordner
            console.log('move item :', this.move_id, this.move_obj);
            this.move_obj.parent = 0;
            this.apiService.pvs4_set_customer(this.move_obj).then((result: any) => {
                console.log('result: ', result);
                this.page_load();
            });
            this.menuItems[2].visible = true;
            this.menuItems[3].visible = false;
            this.move_id = 0;
            this.menuItems[2].visible = true;
            this.menuItems[3].visible = false;
            this.move_id = 0;
        }
    }

    customer_list(num) {
        console.log('customer_list');
        let data: any = [];
        this.allnodes = [];
        this.data_tree(this.customerListAll);
        for (let i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];

            data.push({
                'company': obj.company,
                'id': obj.id,
                'customer_number': obj.customer_number,
                'rating': obj.rating,
                'zip_code': obj.zip_code,
                'place': obj.place,
                'employees': obj.employees,
                'last_date': obj.last_date, 
                'next_date': obj.next_date,
                'inspector': obj.inspector
            });
        }
        this.customerList = data;
    }

    menu_view() {
        console.log('menu_view', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                let id = parseInt(this.selectedNode.data.id);
                console.log('menu_view id', id);
                this.navCtrl.navigateForward('/customer-details/' + id);
            }
        }
    }

    excel_all() {
        console.log('excel_all');
        let data: any = [];
        this.allnodes = [];
        console.log('allnodes :', this.allnodes);
        this.data_tree(this.customerListAll);
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];
            obj.company = obj.company.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.country = obj.country.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.place   = obj.place.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.po_box  = obj.po_box.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.sector  = obj.sector.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.street  = obj.street.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            console.log('obj >>> ', obj);
            let json: any = {};
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                } else {
                    json[this.selectedColumns[j].header] = '';
                }
            }
            console.log('>>json :', json);
            data.push(json);
        }
        this.excelService.exportAsExcelFile(data, 'customer_all.xlsx');
    }

    excel_view() {
        console.log('excel_view');
        let data: any = [];
        this.allnodes = [];
        this.data_tree(this.customerListView);
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];
            obj.company = obj.company.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.country = obj.country.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.place   = obj.place.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.po_box  = obj.po_box.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.sector  = obj.sector.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            obj.street  = obj.street.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            let json: any = {};
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                } else {
                    json[this.selectedColumns[j].header] = '';
                }
            }
            console.log('>>json :', json);
            data.push(json);
        }
        this.excelService.exportAsExcelFile(data, 'customer_view.xlsx');
    }

    printPdf() {
        let columns: any[] = [];
        let widthsArray: string[] = [];
        let headerRowVisible: any = 1;
        for (var k = 0; k < this.selectedColumns.length; k++) {
            columns.push({ text: this.selectedColumns[k].header, style: 'header' });
            widthsArray.push('*');
        }
        let bodyArray: any[] = [];
        bodyArray.push(columns);
        this.allnodes = [];
        this.data_tree(this.customerListView);
        let obj: any;
        let rowArray: any[] = [];
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            obj = this.allnodes[i];
            rowArray = [];
            for (var j = 0; j < this.selectedColumns.length; j++) {
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
        const inputs : any[] = [];
      for (let i = 0; i < this.cols.length; i++) {
          inputs.push({
              type: 'checkbox',
              label: this.cols[i].header,
              value: this.cols[i].field,
              checked: this.selectedColumns.find(x => x.field == this.cols[i].field)
          });
      } 
          const alert = await this.alertCtrl.create({header: this.translate.instant('Spalten Auswählen'), inputs: inputs,
          buttons: [{
              text: this.translate.instant('dismiss'),
              handler: data => {
                  //  alert.dismiss();
              }
          },
          {
              text: this.translate.instant('okay'),
              handler: data => {
                  console.log('Checkbox data:', data );
                  this.selectedColumns = this.cols.filter(function (element, index, array) { return data.includes(element.field) });
                  localStorage.setItem('show_columns', JSON.stringify(this.selectedColumns));
              }
          }
      ] });

          await alert.present();
    }

    isFilterOn(): any {
        let ret = false;
        for (let i = 0; i < this.filterCols.length; i++) {
            if (this.columnFilterValues[this.filterCols[i]].trim().length > 0) {
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

    onNodeExpand(event) {
        this.expendedNodes.push(event.node.data['id']);
        localStorage.setItem('expanded_nodes', JSON.stringify(this.expendedNodes));
    }
    onNodeCollapse(event) {
        this.expendedNodes = this.expendedNodes.filter(function (element, index, array) { return element != event.node.data['id'] });
        localStorage.setItem('expanded_nodes', JSON.stringify(this.expendedNodes));
    }

}
