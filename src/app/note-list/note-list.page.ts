import { Component, ViewChild, ElementRef,OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, Events } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode, MenuItem } from 'primeng/api';
import { ExcelService } from '../services/excel';
import { NoteEditComponent } from '../components/note-edit/note-edit.component';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfExportService } from '../services/pdf-export';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { ActivatedRoute } from '@angular/router';

/**
 * Generated class for the NoteListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'app-note-list',
    templateUrl: './note-list.page.html',
    styleUrls: ['./note-list.page.scss'],
})
export class NoteListPage implements OnInit {
    public noteListAll: TreeNode[] = [];
    public noteListView: TreeNode[] = [];
    public cols: any[] = [];
    public selectedNode: TreeNode;
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public xlsHeader: any[];
    public splitFilter: boolean = false;
    public idCustomer: number = 0;
    public columnFilterValues = { title: "", notes: "", notes_date: "", category: "", name_user: "", name_contact: "", search_all: "" };
    public categoryNames: string[] = ["Besuchsberichte", "Kundenpotential", "Kundenbeziehung", "Mitbewerber", "Dokumentation", "Werbegeschenke", "Jahreswechsel", "Dienstleistungen", "Sonstiges", "Disposition",  "Neukundenakquise"];
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public rowRecords: number = 0;
    public totalRecords: number = 0;
    public company: string = "";
    public heightCalc:any="700px";
    public authorList: any = [];
    public pointofContactList: any = [];

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
        command: (event) => {
            console.log('command menuitem:', event.item);
            this.menu_edit();
        }
    },
    {
        label: this.translate.instant('Neu'),
        icon: 'pi pi-fw pi-plus',
        command: (event) => {
            console.log('command menuitem:', event.item);
            this.menu_new();
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
        icon: "fa fa-fw fa-list",
        items: this.menuItems
    }]

    @ViewChild('tt') dataTable: TreeTable;
    @ViewChild("divHeightCalc") divHeightCalc: ElementRef;

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
        this.cols = [
            { field: 'title', header: this.translate.instant('Titel') },
            { field: 'notes', header: this.translate.instant('Notiz') },
            { field: 'notes_date', header: this.translate.instant('Datum') },
            { field: 'category', header: this.translate.instant('Kategorie') },
            { field: 'name_user', header: this.translate.instant('Verfasser') },
            { field: 'name_contact', header: this.translate.instant('Ansprechpartner') }
        ];

        this.filterCols = [
            'title', 'notes', 'notes_date', 'category', 'name_user', 'name_contact', 'search_all'
        ];
        this.selectedColumns = JSON.parse(JSON.stringify(this.cols));
    
    this.route.queryParams.subscribe(params => {
        this.idCustomer = params["idCustomer"];
       // this.company = params["company"];
       console.log('NoteListPage idCustomer:', this.idCustomer);
       this.page_load();
    });

    }
    onResize(event) {
        console.log("onResize");
        this.funcHeightCalc();
     }

    funcHeightCalc(){
        var x = this.divHeightCalc.nativeElement.offsetHeight;
        if(this.splitFilter) x= x - 51;
        if(x<80) x = 80;
        this.heightCalc = x+"px";
        console.log("heightCalc:",x, this.heightCalc );
    }


    page_load() {
        this.rowRecords = 0;
        this.totalRecords = 0;
        this.events.publish("prozCustomer", 0);
        this.apiService.pvs4_get_note_list(this.idCustomer).then((result: any) => {
            this.noteListAll = JSON.parse(JSON.stringify(result.list));
            if (localStorage.getItem('filter_values_note') != undefined) {
                this.columnFilterValues = JSON.parse(localStorage.getItem('filter_values_note'));
            }
            if (localStorage.getItem('split_filter_note') != undefined) {
                this.splitFilter = JSON.parse(localStorage.getItem('split_filter_note'));
                this.funcHeightCalc();
            }

            if (localStorage.getItem('show_columns_note') != undefined) {
                this.selectedColumns = JSON.parse(localStorage.getItem('show_columns_note'));
            }

            for (let i = 0; i < this.noteListAll.length; i++) {
                let ci = parseInt(this.noteListAll[i].data.category) - 1 ;
                if (ci < 0) ci=8;
                let cn = this.categoryNames[ci];
                console.log('categoryName:', cn, ci, this.noteListAll[i]);
                this.noteListAll[i].data.category = this.translate.instant(cn); 
            }

            this.generate_noteList();
        });
        this.funcHeightCalc();
    }


    try_filter(node: TreeNode): boolean {
        let ret: any = false;
        for (let i = 0; i < this.cols.length; i++) {
            if (this.columnFilterValues["search_all"].trim().length > 0 && node.data[this.cols[i].field] != undefined && node.data[this.cols[i].field].toLowerCase().indexOf(this.columnFilterValues["search_all"].trim().toLowerCase()) >= 0)
                ret = true;
        }

        if (this.columnFilterValues["search_all"].trim().length > 0 && !ret)
            return false;
        else if (this.columnFilterValues["search_all"].trim().length == 0 && !ret)
            ret = true;

        for (let i = 0; i < this.cols.length; i++) {
            let fx = "";
            if(this.columnFilterValues[this.cols[i].field]) {
                fx = this.columnFilterValues[this.cols[i].field].trim();
            }
            if (fx.length > 0 && node.data[this.cols[i].field] != undefined && node.data[this.cols[i].field].toLowerCase().indexOf(fx.toLowerCase()) < 0)
                ret = false;
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
        this.generate_noteList();
        localStorage.setItem("filter_values_note", JSON.stringify(this.columnFilterValues));
    }

    cancel_filters(cancel_type) {
        console.log("cancel_filters");
        this.menuItems[5].items[2]['disabled'] = true;
        if (cancel_type == 1) {
            for (let i = 0; i < this.cols.length; i++) {
                this.columnFilterValues[this.cols[i].field] = "";
            }
        }
        else
            this.columnFilterValues = { title: "", notes: "", notes_date: "", category: "", name_user: "", name_contact: "", search_all: "" };
        this.generate_noteList();
    }

    generate_noteList() {
        console.log('generate_noteList', this.isFilterOn());

        if (!this.isFilterOn()) {
            this.noteListView = JSON.parse(JSON.stringify(this.noteListAll));
        } else {
            let try_list = JSON.parse(JSON.stringify(this.noteListAll));
            this.dir_try_filter(try_list);
            this.noteListView = try_list;
        }

        this.rowRecords = this.noteListView.length;
        this.totalRecords = this.noteListAll.length;
        let progressBar = 100;
        if (this.totalRecords > 0 ) { progressBar = Math.round(this.rowRecords * 100 / this.totalRecords); }
        this.events.publish('progressBar', progressBar);
        this.events.publish('rowRecords', this.rowRecords);
        this.events.publish('totalRecords', this.totalRecords);

    }

    nodeSelect(event) {
        console.log('nodeSelect:', event, this.menuItems);
        this.menuItems[0].disabled = false;
        this.menuItems[1].disabled = false;
    }

    nodeUnselect() {
        console.log('nodeUnselect');
        this.menuItems[0].disabled = true;
        this.menuItems[1].disabled = true;
    }

    async menu_new() {
        console.log('menu_new', this.idCustomer);
        let obj = {};
        const modal =
            await this.modalCtrl.create({
                component: NoteEditComponent,
                componentProps: {
                    id: 0, idCustomer: this.idCustomer, redirect: 1
                }
            });

        modal.present();
    }
    async menu_edit() {
        console.log('menu_edit', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                let id = parseInt(this.selectedNode.data.id);
                console.log('menu_edit id', id);
                const modal =
                    await this.modalCtrl.create({
                        component: NoteEditComponent,
                        componentProps: {
                            "id": id, idCustomer: this.idCustomer
                        }
                    });
                modal.onDidDismiss().then(data => {
                    console.log('menu_edit ret:', data['data']);
                    if (data['data']) {
                        this.page_load();
                    }
                });
                modal.present();
            }
        }
    }

    menu_view() {
        console.log('menu_view', this.selectedNode);
        if (this.selectedNode) {
            if (this.selectedNode.data.id) {
                let id = parseInt(this.selectedNode.data.id);
                console.log('menu_view id', id);
                this.navCtrl.navigateForward(["/note-details/"+id]);
            }
        }
    }

    excel_all() {
        console.log("note-list excel_all");
        let data: any = [];
        this.allnodes = [];
        console.log("allnodes :", this.allnodes);
        this.data_tree(this.noteListAll);
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];
            obj.notes = obj.notes.replace(/(\\r\\n|\\n|\\r)/gm," ");
            let json: any = {};
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if(obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                }else{
                    json[this.selectedColumns[j].header] = "";
                }
            }
            console.log(">>json :", json);
            data.push(json); 
        }
        this.excelService.exportAsExcelFile(data, 'note_all.xlsx');
    }

    excel_view() {
        console.log("excel_view");
        let data: any = [];
        this.allnodes = [];
        this.data_tree(this.noteListView);
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];
            obj.notes = obj.notes.replace(/(\\r\\n|\\n|\\r)/gm," ");
            let json: any = {};
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if(obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                }else{
                    json[this.selectedColumns[j].header] = "";
                }                
            }
            console.log(">>json :", json);
            data.push(json);
        }
        this.excelService.exportAsExcelFile(data, 'note_view.xlsx');
    }

    printPdf() {
        let columns: any[] = [];
        let widthsArray: string[] = [];
        let headerRowVisible: any = 1;
        for (var k = 0; k < this.selectedColumns.length; k++) {
            columns.push({ text: this.selectedColumns[k].header, style: 'header' });
            widthsArray.push("*"); 
        }
        let bodyArray: any[] = [];
        bodyArray.push(columns);
        this.allnodes = [];
        this.data_tree(this.noteListView);
        let obj: any;
        let rowArray: any[] = [];
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            obj = this.allnodes[i];
            obj.notes = obj.notes.replace(/(\\r\\n|\\n|\\r)/gm," ");
            rowArray = [];
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field])
                    rowArray.push(obj[this.selectedColumns[j].field]);
                else
                    rowArray.push('');
            }
            bodyArray.push(rowArray);
        }

        this.pdf.get_ListDocDefinition(bodyArray, widthsArray, headerRowVisible, this.translate.instant("Notiz") + " " + this.translate.instant("Liste"),this.translate.instant("Notiz")+this.translate.instant("Liste")+'.pdf');
    }

    data_tree(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            this.allnodes.push(nodes[i].data);
        }
    }

    menu_filter() {
        this.splitFilter = !this.splitFilter;
        if (!this.splitFilter) {
            this.cancel_filters(1);
        }
        localStorage.setItem("split_filter_note", JSON.stringify(this.splitFilter));
        this.funcHeightCalc();
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
            header: this.translate.instant('Spalten Auswählen'), inputs: inputs, buttons: [{
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
                    localStorage.setItem('show_columns_note', JSON.stringify(this.selectedColumns));
                }
            }
            ]
        });
        await alert.present();
    }

    isFilterOn(): any {
        let ret = false;
        for (let i = 0; i < this.filterCols.length; i++) {
            if (this.columnFilterValues[this.filterCols[i]].trim().length > 0)
                ret = true;
        }
        return ret;
    }

}
