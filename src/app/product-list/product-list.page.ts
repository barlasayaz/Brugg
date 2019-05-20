import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, Events } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode, MenuItem } from 'primeng/api';
import { ExcelService } from '../services/excel';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { PdfExportService } from '../services/pdf-export';
import { DatePipe } from '@angular/common';
import { ProductMigrationPage } from '../product-migration/product-migration.page';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.page.html',
    styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage {
    public productListAll: TreeNode[] = [];
    public productListView: TreeNode[] = [];
    public cols: any[] = [];
    public selectedNode: TreeNode;
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public xlsHeader: any[];
    public splitFilter: boolean = false;
    public idCustomer: number = 0;
    public move_id: number = 0;
    public move_obj: any = {};
    public columnFilterValues = { title: "", nfc_tag_id: "", id_number: "", articel_no: "", check_interval: "", search_all: "" };
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public rowRecords: number = 0;
    public totalRecords: number = 0;
    public lang: string = localStorage.getItem('lang');
    public company: string = "";
    public selectMulti: number;

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
            if (this.userdata.role_set.edit_products == false) return;
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
            if (this.userdata.role_set.edit_products == false) return;
            console.log('command menuitem:', event.item);
            this.menu_move(1);
        }
    },
    {
        label: this.translate.instant('Stammordner'),
        icon: 'pi pi-fw pi-arrow-down',
        visible: false,
        styleClass: "move_now",
        disabled: false,
        command: (event) => {
            if (this.userdata.role_set.edit_products == false) return;
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
                    if (this.userdata.role_set.edit_products == false) return;
                    console.log('command menuitem:', event.item);
                    this.create_template();
                }
            },
            {
                label: this.translate.instant('Neues Produkt'),
                icon: 'pi pi-fw pi-plus',
                visible: this.userdata.role_set.edit_products,
                command: (event) => {
                    if (this.userdata.role_set.edit_products == false) return;
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
                    if (this.userdata.role_set.check_products == false) return;
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
                    if (this.userdata.role_set.edit_products == false) return;
                    console.log('command menuitem:', event.item);
                    this.product_migration();
                }
            }
        ]
    }];

    public popupMenu: MenuItem[] = [{
        label: this.translate.instant('Menü'),
        icon: "fa fa-fw fa-list",
        items: this.menuItems
    }];

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

        this.cols = [
            { field: 'nfc_tag_id', header: 'NFC', width: "20px" },
            { field: 'title', header: this.translate.instant('Titel') },
            //{ field: 'id', header: 'DB-ID' },
            { field: 'id_number', header: '#' },
            { field: 'articel_no', header: this.translate.instant('Artikel-Nr.') },
            { field: 'last_protocol_date', header: "<<" + this.translate.instant('Termin') },
            { field: 'last_protocol_next', header: this.translate.instant('Termin') + ">>" },
            { field: 'check_interval', header: this.translate.instant('Intervall Prüfen') }
        ];
        this.route.queryParams.subscribe(params => {
            this.idCustomer = params["idCustomer"];
            this.company = params["company"];
        });

        console.log('ProductListPage idCustomer:', this.idCustomer);
        this.page_load();
    }

    page_load() {
        console.log('ionViewDidLoad ProductListPage');
        this.rowRecords = 0;
        this.totalRecords = 0;
        this.selectMulti = 1;

        this.events.publish("prozCustomer", 0);
        this.apiService.pvs4_get_product_list(this.idCustomer).then((result: any) => {
            console.log("ionViewDidLoad result :", result);

            this.productListAll = JSON.parse(JSON.stringify(result.list));

            if (localStorage.getItem('filter_values_product') != undefined) {
                this.columnFilterValues = JSON.parse(localStorage.getItem('filter_values_product'));
            }
            if (localStorage.getItem('split_filter_product') != undefined) {
                this.splitFilter = JSON.parse(localStorage.getItem('split_filter_product'));
            }
            if (localStorage.getItem('show_columns_product') != undefined) {
                this.selectedColumns = JSON.parse(localStorage.getItem('show_columns_product'));
            }

            this.title_translate(this.productListAll);

            for (let index = 0; index < this.productListAll.length; index++) {
                //last_protocol & last_protocol_next
                let pr = this.productListAll[index].data.last_protocol;
                if (pr) {
                    if (pr.length > 0) {
                        console.log("pr :", pr);
                        pr = JSON.parse(pr);
                        if (pr.protocol_date) this.productListAll[index].data.last_protocol_date = this.apiService.mysqlDate2view(pr.protocol_date);
                        if (pr.protocol_date_next) this.productListAll[index].data.last_protocol_next = this.apiService.mysqlDate2view(pr.protocol_date_next);
                        if (pr.result) {
                            if (pr.result == 1) this.productListAll[index].data.last_protocol_next = this.translate.instant('reparieren');
                            if (pr.result == 3) this.productListAll[index].data.last_protocol_next = this.translate.instant('unauffindbar');
                            if (pr.result == 4) this.productListAll[index].data.last_protocol_next = this.translate.instant('ausmustern');
                        }
                    }
                }
                //options
                let options = JSON.parse(this.productListAll[index].data.items);
                console.log("options :", options);
                if (options == null) options = [];

                for (let i = 0; i < options.length; i++) {
                    if (!this.cols.find(x => x.field == options[i].title[this.lang])) this.cols.push({ field: options[i].title[this.lang], header: options[i].title[this.lang] });
                    let pipe = new DatePipe('en-US');
                    if (options[i].type == 5) this.productListAll[index].data[options[i].title[this.lang]] = pipe.transform(options[i].value, 'dd.MM.yyyy');
                    if (options[i].type != 5) this.productListAll[index].data[options[i].title[this.lang]] = options[i].value;
                }
            }

            this.selectedColumns = JSON.parse(JSON.stringify(this.cols));

            let json = "{";
            for (var j = 0; j < this.cols.length; j++) {
                json += '"' + this.cols[j].field + '":""';
                json += ',';
            }
            json += '"search_all":""}';
            this.columnFilterValues = JSON.parse(json);

            this.generate_productList();
        });
    }

    title_translate(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            /*         
            if(nodes[i].data.nfc_tag_id) {
                nodes[i].data.nfc_tag_id = true;
            }
            else {
                nodes[i].data.nfc_tag_id = false;
            }*/
            let title = JSON.parse(nodes[i].data.title);
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
            if (this.columnFilterValues["search_all"].trim().length > 0
                && node.data[this.cols[i].field] != undefined
                && node.data[this.cols[i].field].toString().toLowerCase().indexOf(this.columnFilterValues["search_all"].trim().toLowerCase()) >= 0)
                ret = true;
        }

        if (this.columnFilterValues["search_all"].trim().length > 0 && !ret)
            return false;
        else if (this.columnFilterValues["search_all"].trim().length == 0 && !ret)
            ret = true;

        for (let i = 0; i < this.cols.length; i++) {
            if (this.columnFilterValues[this.cols[i].field].trim().length > 0
                && (node.data[this.cols[i].field] == undefined || (node.data[this.cols[i].field] != undefined
                    && node.data[this.cols[i].field].toString().toLowerCase().indexOf(this.columnFilterValues[this.cols[i].field].trim().toLowerCase()) < 0)))
                ret = false;
        }

        return ret;
    }

    dir_try_filter(nodes: TreeNode[]): any {
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
            this.menuItems[8].items[2]['disabled'] = false;
        } else {
            this.menuItems[8].items[2]['disabled'] = true;
        }
        this.generate_productList();
        localStorage.setItem("filter_values_product", JSON.stringify(this.columnFilterValues));
    }

    cancel_filters(cancel_type) {
        console.log("cancel_filters");
        this.menuItems[8].items[2]['disabled'] = true;
        if (cancel_type == 1) {
            for (let i = 0; i < this.cols.length; i++) {
                this.columnFilterValues[this.cols[i].field] = "";
            }
        }
        else {
            let json = "{";
            for (var j = 0; j < this.cols.length; j++) {
                json += '"' + this.cols[j].field + '":""';
                json += ',';
            }
            json += 'search_all:""}';
            console.log("aaaaaaaa :", json);
            this.columnFilterValues = JSON.parse(json);
        }
        this.generate_productList();
    }

    generate_productList() {
        console.log('generate_productList', this.isFilterOn());

        if (!this.isFilterOn()) {
            this.productListView = JSON.parse(JSON.stringify(this.productListAll));
        } else {
            let try_list = JSON.parse(JSON.stringify(this.productListAll));
            this.dir_try_filter(try_list);
            this.productListView = try_list;
        }

        this.rowRecords = this.productListView.length;
        this.totalRecords = this.productListAll.length;
        let progressBar = Math.round(this.rowRecords * 100 / this.totalRecords);
        this.events.publish("progressBar", progressBar);
        this.events.publish("rowRecords", this.rowRecords);
        this.events.publish("totalRecords", this.totalRecords);

        if (localStorage.getItem('expanded_nodes_product') != undefined)
            this.expandChildren(this.productListView, JSON.parse(localStorage.getItem('expanded_nodes_product')));
    }

    nodeSelect(event, selectedNode) {
        console.log("nodeSelect selectedNode :", selectedNode.length);
        let selectedNodeLength = selectedNode.length;
        console.log("selectMulti :", this.selectMulti);
        if (!this.selectMulti) {
            selectedNodeLength = 1;
            this.selectMulti = 1;
        }

        console.log('nodeSelect:', event, this.menuItems, selectedNodeLength);
        this.selectedNode.data = event.node.data;
        this.menuItems[0].disabled = false;
        this.menuItems[1].disabled = false;
        this.menuItems[2].disabled = false;
        this.menuItems[3].disabled = false;
        this.menuItems[5].items[0]['disabled'] = false;
        this.menuItems[5].items[1]['disabled'] = false;
        this.menuItems[8].items[4]['disabled'] = false;
        let id_sn = 0;

        console.log("selectedNodeLength :", selectedNodeLength);
        if (selectedNodeLength == 1) {

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
        }
        else {
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
        }
        else {
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
        let obj = { id: 0, parent: 0, idCustomer: this.idCustomer };
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                obj.parent = this.selectedNode.data.id;
            }
        }
        this.navCtrl.navigateForward(["/product-edit", obj]);
    }

    menu_edit() {
        console.log('menu_edit', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                this.navCtrl.navigateForward(["/product-edit", { "id": this.selectedNode.data.id, idCustomer: this.idCustomer, parent: this.selectedNode.data.parent, company: this.company }]);
            }
        }
    }

    menu_history() {
        console.log('menu_history', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                let id = parseInt(this.selectedNode.data.id);
                console.log('menu_history id', id);
                this.navCtrl.navigateForward(["/protocol-history", { idCustomer: this.idCustomer, idProduct: id, titleProduct: this.selectedNode.data.title, company: this.company }]);
            }
        }
    }

    async product_migration() {
        console.log('product_migration', this.selectedNode);
        if (this.selectedNode) {
            const modal =
                await this.modalCtrl.create({
                    component: ProductMigrationPage,
                    componentProps: {
                        "idCustomer": this.idCustomer, productList: this.selectedNode
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
            //in Root            
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
        console.log('menu_view', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                let id = parseInt(this.selectedNode.data.id);
                console.log('menu_view id', id);
                this.navCtrl.navigateForward(["/product-details", { idCustomer: this.idCustomer,idProduct: id,  company: this.company, productList: this.selectedNode }]);
            }
        }
    }

    create_template() {
        console.log('create_template', this.selectedNode);
        this.navCtrl.navigateForward(["/product-template", { idCustomer: this.idCustomer, company: this.company }]);
    }

    create_protocol() {
        if (this.selectedNode) {
            console.log('create_protocol', this.selectedNode);
            this.navCtrl.navigateForward(["/protocol-edit", { idCustomer: this.idCustomer, productList: this.selectedNode }]);
        }
    }

    excel_all() {
        console.log("excel_all");
        let data: any = [];
        this.allnodes = [];
        console.log("allnodes :", this.allnodes);
        this.data_tree(this.productListAll);
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];
            obj.items = obj.items.replace(/(\\r\\n|\\n|\\r)/gm, " ");
            let json: any = {};
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                } else {
                    json[this.selectedColumns[j].header] = "";
                }
            }
            console.log(">>json :", json);
            data.push(json);
        }
        this.excelService.exportAsExcelFile(data, 'product_all.xlsx');
    }

    excel_view() {
        console.log("excel_view");
        let data: any = [];
        this.allnodes = [];
        this.data_tree(this.productListView);
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];
            obj.items = obj.items.replace(/(\\r\\n|\\n|\\r)/gm, " ");
            let json: any = {};
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                } else {
                    json[this.selectedColumns[j].header] = "";
                }
            }
            console.log(">>json :", json);
            data.push(json);
        }
        this.excelService.exportAsExcelFile(data, 'product_view.xlsx');
    }

    printPdf() {
        let columns: any[] = [];
        let widthsArray: string[] = [];
        for (var k = 0; k < this.selectedColumns.length; k++) {
            columns.push({ text: this.selectedColumns[k].header, style: 'header' });
            widthsArray.push("*");
        }
        let bodyArray: any[] = [];
        bodyArray.push(columns);
        this.allnodes = [];
        this.data_tree(this.productListView);
        let obj: any;
        let rowArray: any[] = [];
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            obj = this.allnodes[i];
            obj.items = obj.items.replace(/(\\r\\n|\\n|\\r)/gm, " ");
            rowArray = [];
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field])
                    rowArray.push(obj[this.selectedColumns[j].field]);
                else
                    rowArray.push('');
            }
            bodyArray.push(rowArray);
        }

        this.pdf.get_ListDocDefinition(bodyArray, widthsArray, this.translate.instant("Produkt") + " " + this.translate.instant("Liste"), this.translate.instant("Produkt") + this.translate.instant("Liste") + '.pdf');
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
        localStorage.setItem("split_filter_product", JSON.stringify(this.splitFilter));
    }

    async show_columns() {
        let inputs: any[] = [];
        for (var i = 0; i < this.cols.length; i++) {
            inputs.push({
                type: 'checkbox',
                label: this.cols[i].header,
                value: this.cols[i].field,
                checked: this.selectedColumns.find(x => x.field == this.cols[i].field)
            });
        }
        let alert = await this.alertCtrl.create({
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
            if (this.columnFilterValues[this.cols[i].field].trim().length > 0)
                ret = true;
        }
        if (this.columnFilterValues["search_all"].trim().length > 0)
            ret = true;
        return ret;
    }

    expandChildren(nodes: TreeNode[], expended: string[]) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].children && expended.find(x => x == nodes[i].data["id"])) {
                nodes[i].expanded = true;
                this.expandChildren(nodes[i].children, expended);
            }
        }
    }

    onNodeExpand(event) {
        this.expendedNodes.push(event.node.data["id"]);
        localStorage.setItem('expanded_nodes_product', JSON.stringify(this.expendedNodes));
    }
    onNodeCollapse(event) {
        this.expendedNodes = this.expendedNodes.filter(function (element, index, array) { return element != event.node.data["id"] });
        localStorage.setItem('expanded_nodes_product', JSON.stringify(this.expendedNodes));
    }
}
