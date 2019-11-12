import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, Events, LoadingController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { TreeTable } from 'primeng/components/treetable/treetable';
import { TreeNode, MenuItem, LazyLoadEvent } from 'primeng/api';
import { ExcelService } from '../services/excel';
import { NoteEditComponent } from '../components/note-edit/note-edit.component';
import { PdfExportService } from '../services/pdf-export';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SystemService } from '../services/system';
import { DataService } from '../services/data.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

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
    public noteListSearch: TreeNode[] = [];
    public cols: any[] = [];
    public selectedNode: TreeNode;
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public xlsHeader: any[];
    public splitFilter = false;
    public idCustomer = 0;
    public columnFilterValues = { title: '',
                                  notes: '',
                                  notes_date: '',
                                  category: '',
                                  name_user: '',
                                  name_contact: '',
                                  search_all: '' };
    public categoryNames: string[] = ['Besuchsberichte',
                                      'Kundenpotential',
                                      'Kundenbeziehung',
                                      'Mitbewerber',
                                      'Dokumentation',
                                      'Werbegeschenke',
                                      'Jahreswechsel',
                                      'Dienstleistungen',
                                      'Sonstiges',
                                      'Disposition',
                                      'Neukundenakquise'];
    public filterCols: string[];
    public expendedNodes: string[] = [];
    public rowRecords: number = 0;
    public totalRecords: number = 0;
    public heightCalc: any;
    public authorList: any = [];
    public pointofContactList: any = [];
    modelChanged: Subject<any> = new Subject<any>();
    public rowHeight = 26;
    public rowCount = 100;
    public sortedColumn = { sort_field : null, sort_order : 0 };
    public filterText = '';
    public filterOn = false;

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
    }];

    public popupMenu: MenuItem[] = [{
        label: this.translate.instant('Menü'),
        icon: 'fa fa-fw fa-list',
        items: this.menuItems
    }];

    @ViewChild('tt') dataTable: TreeTable;
    @ViewChild('divHeightCalc') divHeightCalc: ElementRef;

    constructor(public navCtrl: NavController,
        public userdata: UserdataService,
        public apiService: ApiService,
        public translate: TranslateService,
        public modalCtrl: ModalController,
        public excelService: ExcelService,
        public alertCtrl: AlertController,
        public pdf: PdfExportService,
        public events: Events,
        public system: SystemService,
        private route: ActivatedRoute,
        private loadingCtrl: LoadingController,
        private dataService: DataService,
        private screenOrientation: ScreenOrientation) {
            this.modelChanged.pipe(
                debounceTime(700))
                .subscribe(model => {
                    if (this.isFilterOn()) {
                        this.menuItems[5].items[0]['disabled'] = false;
                    } else {
                        this.menuItems[5].items[0]['disabled'] = true;
                    }
                    this.generate_noteList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
                    localStorage.setItem('filter_values_note', JSON.stringify(this.columnFilterValues));
            });

    }

    ngOnInit() {
        this.cols = [
            { field: 'title', header: this.translate.instant('Titel'), width: '170px' },
            { field: 'notes', header: this.translate.instant('Notiz'), width: '350px' },
            { field: 'notes_date', header: this.translate.instant('Datum'), width: '85px' },
            { field: 'category', header: this.translate.instant('Kategorie'), width: '110px' },
            { field: 'name_user', header: this.translate.instant('Verfasser'), width: '100px' },
            { field: 'name_contact', header: this.translate.instant('Ansprechpartner'), width: '100px' }
        ];

        this.filterCols = [
            'title',
            'notes',
            'notes_date',
            'category',
            'name_user',
            'name_contact',
            'search_all'
        ];
        this.selectedColumns = JSON.parse(JSON.stringify(this.cols));

        this.idCustomer = parseInt(this.route.snapshot.paramMap.get('id'));

        if (localStorage.getItem('sort_column_note') != undefined) {
            this.sortedColumn = JSON.parse(localStorage.getItem('sort_column_note'));
        }
        this.filterText = this.route.snapshot.paramMap.get('filterText');
      //  if (this.filterText.length > 0) { this.filterOn = true; }
        console.log('filterText :', this.filterText);

        console.log('NoteListPage idCustomer:', this.idCustomer);
        this.page_load();

    }

    update(data: any): void {
        console.log('update():', data );
        if (data.lable === 'searchText') {
            this.columnFilterValues['search_all'] = data.text;
            this.generate_noteList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
            localStorage.setItem('filter_values_product', JSON.stringify(this.columnFilterValues));
        }
        if(data.lable === 'toggleFilter') {
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
                localStorage.setItem('sort_column_note', JSON.stringify(this.sortedColumn));
            }
            this.generate_noteList(event.first, event.rows, event.sortField, event.sortOrder);
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
        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        this.rowRecords = 0;
        this.totalRecords = 0;
        this.events.publish('prozCustomer', 0);
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
                if (ci < 0) { ci = 8; }
                let cn = this.categoryNames[ci];
                // console.log('categoryName:', cn, ci, this.noteListAll[i]);
                this.noteListAll[i].data.category = this.translate.instant(cn);
            }

            this.generate_noteList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
            loader.dismiss();
        });
        this.funcHeightCalc();
    }

    try_filter(node: TreeNode): boolean {
        let ret: any = false;
        for (let i = 0; i < this.cols.length; i++) {
            if ( this.columnFilterValues['search_all'].trim().length > 0 &&
                 node.data[this.cols[i].field] != undefined &&
                 node.data[this.cols[i].field].toLowerCase().indexOf(this.columnFilterValues['search_all'].trim().toLowerCase()) >= 0) {
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
            if (fx.length > 0 &&
                node.data[this.cols[i].field] != undefined &&
                node.data[this.cols[i].field].toLowerCase().indexOf(fx.toLowerCase()) < 0) {
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
            this.columnFilterValues = { title: '',
                                        notes: '',
                                        notes_date: '',
                                        category: '',
                                        name_user: '',
                                        name_contact: '',
                                        search_all: '' };
        }
        localStorage.setItem('filter_values_note', JSON.stringify(this.columnFilterValues));
        this.generate_noteList(0, this.rowCount, this.sortedColumn.sort_field, this.sortedColumn.sort_order);
    }

    generate_noteList(start_index: number, end_index: number, sort_field, sort_order) {
        console.log('generate_noteList', this.isFilterOn());

        if (!this.isFilterOn()) {
            this.noteListView = JSON.parse(JSON.stringify(this.noteListAll));
        } else {
            let try_list = JSON.parse(JSON.stringify(this.noteListAll));
            this.dir_try_filter(try_list);
            this.noteListView = try_list;
            this.noteListSearch = try_list;
        }
        if (sort_field != null) {
            this.noteListView = this.noteListView.sort((a, b) => {
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
        this.rowRecords = this.noteListView.length;
        this.totalRecords = this.noteListAll.length;

        console.log('start_index - end_index :', start_index, end_index);

        if ((start_index + end_index + this.rowCount) >= this.rowRecords) {
            this.noteListView = this.noteListView.slice(start_index, this.rowRecords);
        } else {
            this.noteListView = this.noteListView.slice(start_index, (start_index + end_index));
        }
        if (this.noteListView.length > 0) {
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
    }

    onColResize(event) {
        let index  = this.apiService.columnIndex(event.element);
        this.selectedColumns[index].width = event.element.offsetWidth + 'px';
        let width2 = this.selectedColumns[index + 1].width;
        this.selectedColumns[index + 1].width = parseInt(width2.replace('px', '')) - event.delta + 'px';
        localStorage.setItem('show_columns_note', JSON.stringify(this.selectedColumns));
    }

    onColReorder(event) {
        this.selectedColumns = event.columns;
        localStorage.setItem('show_columns_note', JSON.stringify(this.selectedColumns));
    }


    nodeSelect(event) {
        // console.log('nodeSelect:', event, this.menuItems);
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
                cssClass: 'noteedit-modal-css',
                componentProps: {
                    id: 0, idCustomer: this.idCustomer, redirect: 1
                }
            });

            modal.onDidDismiss().then(async data => {
                console.log('menu_new ret:', data['data']);
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
                let id = parseInt(this.selectedNode.data.id);
                console.log('menu_edit id', id);
                const modal =
                    await this.modalCtrl.create({
                        component: NoteEditComponent,
                        cssClass: 'noteedit-modal-css',
                        componentProps: {
                            id: id, idCustomer: this.idCustomer, redirect: 1
                        }
                    });
                modal.onDidDismiss().then(async data => {
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
                const data = {
                    id: parseInt(this.selectedNode.data.id),
                    idCustomer: this.idCustomer
                };
                this.dataService.setData(data);
                this.navCtrl.navigateForward(['/note-details']);
            }
        }
    }

    async excel_export() {
        console.log('excel_view');
        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

        let data: any = [];
        this.allnodes = [];
        if (this.isFilterOn()) {
            this.data_tree(this.noteListSearch);
        } else {
            this.data_tree(this.noteListAll);
        }
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            let obj = this.allnodes[i];
            obj.notes = obj.notes.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
            let json: any = {};
            for (var j = 0; j < this.selectedColumns.length; j++) {
                if (obj[this.selectedColumns[j].field]) {
                    json[this.selectedColumns[j].header] = obj[this.selectedColumns[j].field];
                } else {
                    json[this.selectedColumns[j].header] = '';
                }
            }
            // console.log('>>json :', json);
            data.push(json);
        }
        this.excelService.exportAsExcelFile(data, 'note_view.xlsx');
        loader.dismiss();
    }

    async pdf_export() {
        const loader = await this.loadingCtrl.create({
            message: this.translate.instant('Bitte warten')
        });
        loader.present();

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
        if (this.isFilterOn()) {
            this.data_tree(this.noteListSearch);
        } else {
            this.data_tree(this.noteListAll);
        }
        let obj: any;
        let rowArray: any[] = [];
        for (var i = 0, len = this.allnodes.length; i < len; i++) {
            obj = this.allnodes[i];
            obj.notes = obj.notes.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
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
                                       this.translate.instant('Notiz') + ' ' + this.translate.instant('Liste'),
                                       this.translate.instant('Notiz') + this.translate.instant('Liste') + '.pdf');
        loader.dismiss();
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
        localStorage.setItem('split_filter_note', JSON.stringify(this.splitFilter));
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
        this.show_alert(inputs);
    }

    async show_alert(inputs) {
        let alert = await this.alertCtrl.create({
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
            if ( (this.columnFilterValues[this.filterCols[i]]) && (this.columnFilterValues[this.filterCols[i]].trim().length > 0) ) {
                ret = true;
            }
        }
        return ret;
    }

}
