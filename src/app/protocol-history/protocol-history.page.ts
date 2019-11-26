import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { DatePipe } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { ExcelService } from '../services/excel';
import { PdfExportService } from '../services/pdf-export';
import { ActivatedRoute } from '@angular/router';

/**
 * Generated class for the ProtocolHistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'app-protocol-history',
    templateUrl: './protocol-history.page.html',
    styleUrls: ['./protocol-history.page.scss'],
})

export class ProtocolHistoryPage implements OnInit {
    public prtclLst: any[] = [];
    public allnodes: any[] = [];
    public selectedColumns: any[];
    public idCustomer = 0;
    public protocolList: any[] = [];
    public removeRow: any;
    public cols: any[] = [];
    public colsExcel: any[] = [];
    public idProduct = 0;
    public titleProduct: any;
    public lang: string = localStorage.getItem('lang');
    public url: any;
    public listCount: any[] = [];
    public pageCount: any;
    public pageTotalCount: any;
    public pdfxlsButton: boolean;
    public mobilePlatform: boolean;

    constructor(public navCtrl: NavController,
                public route: ActivatedRoute,
                public userdata: UserdataService,
                public apiService: ApiService,
                public translate: TranslateService,
                public alertCtrl: AlertController,
                public excelService: ExcelService,
                public pdf: PdfExportService,
                public platform: Platform) {

    }

    ngOnInit() {
        this.platform.ready().then(() => {
            if (this.platform.is('ios') ||
                this.platform.is('android') ||
                this.platform.is('ipad') ||
                this.platform.is('iphone') ||
                this.platform.is('mobile') ||
                this.platform.is('phablet') ||
                this.platform.is('tablet')) {
                this.mobilePlatform = true;
                console.log('platform mobile:', this.platform.platforms());
            } else {
                console.log('platform not mobile:', this.platform.platforms());
                this.mobilePlatform = false;
            }
        });

        this.cols = [
            { field: 'protocol_number', header: this.translate.instant('Protokoll Nummer') },
            { field: 'protocol_date', header: this.translate.instant('Datum') }
        ];

        this.colsExcel = [
            { field: 'protocol_number', header: this.translate.instant('Protokoll Nummer') },
            { field: 'protocol_date', header: this.translate.instant('Datum') }
        ];

        this.url = this.apiService.pvsApiURL;
        if (this.route.snapshot.data['special']) {
            let params = this.route.snapshot.data['special'];
            this.idCustomer = params['idCustomer'];
            this.idProduct = params['idProduct'];
            this.titleProduct = params['titleProduct'];
            this.loadProtocol();
        }
    }

    loadProtocol() {
        this.apiService.pvs4_get_protocol_history(this.idCustomer, this.idProduct).then((result: any) => {
           // console.log('loadProtocol pvs4_get_protocol_history :', result.list);
           const nodes: any[] = JSON.parse(JSON.stringify(result.list));
           for (let i = 0; i < nodes.length; i++) {
                const prdct = JSON.parse(nodes[i].data.product);
                this.removeRow = 0;
                for (let j = 0; j < prdct.length; j++) {
                if (prdct[j].id == this.idProduct && this.removeRow == 0) {
                    this.removeRow = 1;
                }
                }
                if (this.removeRow == 0) {
                nodes.splice(i, 1);
                i--;
                }
            }

            this.title_translate(nodes);

            this.prtclLst = nodes;
            this.pageTotalCount = this.prtclLst.length;
            this.pdfxlsButton = true;
            if (this.pageTotalCount > 0) {
                this.pdfxlsButton = false;
            }

            const pList: any[] = [];
            this.pageCount = 0;
            for (let index = 0; index < this.prtclLst.length; index++) {
                if (index >= this.pageCount && index <= this.pageCount + 3) {
                    pList.push(this.prtclLst[index]);
                }
            }

            this.protocolPage(pList);

        });

    }

    title_translate(nodes: any[]): any {
        for (let i = 0; i < nodes.length; i++) {
            const title = JSON.parse(nodes[i].data.title);
            let product = [];
            if (nodes[i].data.product) {
                product = JSON.parse(nodes[i].data.product);
                let productText = '';
                for (let index = 0; index < product.length; index++) {
                    if (index != 0) {
                        productText +=' , ';
                    }
                    productText += product[index].id_number;
                }
                nodes[i].data.product = productText;
            }
            nodes[i].data.title = title[this.lang];
        }
    }

    protocolPage(prtcl: any[]) {
        this.protocolList = [];
        this.listCount = [];
        for (let index = 0; index < prtcl.length; index++) {
            let options = JSON.parse(prtcl[index].data.items);
            // console.log('options :', options);
            this.listCount.push(index);
            if (options == null) {
                options = [];
            }

            for (let i = 0; i < options.length; i++) {
                if (!this.cols.find(x => x.field == options[i].title[this.lang])) {
                    this.cols.push({ field: options[i].title[this.lang], header: options[i].title[this.lang] });
                }
                const pipe = new DatePipe('en-US');
                if (options[i].type == 5) {
                    prtcl[index].data[options[i].title[this.lang]] = pipe.transform(options[i].value, 'dd.MM.yyyy');
                }
                if (options[i].type != 5) {
                    prtcl[index].data[options[i].title[this.lang]] = options[i].value;
                }
            }

            this.protocolList.push(prtcl[index]);
        }

        this.selectedColumns = JSON.parse(JSON.stringify(this.cols));
        console.log('nodes .... :', prtcl);
    }

    pageBack() {
        const pList: any[] = [];
        this.pageCount = this.pageCount - 4;
        for (let index = 0; index < this.prtclLst.length; index++) {
            if (index >= this.pageCount && index <= this.pageCount + 3) {
                pList.push(this.prtclLst[index]);
            }
        }

        this.protocolPage(pList);
    }

    pageForward() {
        const pList: any[] = [];
        this.pageCount = this.pageCount + 4;
        for (let index = 0; index < this.prtclLst.length; index++) {
            if (index >= this.pageCount && index <= this.pageCount + 3) {
                pList.push(this.prtclLst[index]);
            }
        }

        this.protocolPage(pList);
    }

    printExcel() {
        console.log('excel_all');
        this.protocolPage(this.prtclLst);
        const data: any = [];
        this.allnodes = [];
        console.log('allnodes :', this.allnodes);
        this.data_tree(this.protocolList);
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
        this.excelService.exportAsExcelFile(data, 'protocol_history.xlsx');

        const pList: any[] = [];
        for (let index = 0; index < this.prtclLst.length; index++) {
            if (index >= this.pageCount && index <= this.pageCount + 3) {
                pList.push(this.prtclLst[index]);
            }
        }
        this.protocolPage(pList);
    }

    data_tree(nodes: TreeNode[]): any {
        for (let i = 0; i < nodes.length; i++) {
            this.allnodes.push(nodes[i].data);
            if (nodes[i].children && nodes[i].children.length > 0) {
                this.data_tree(nodes[i].children);
            }
        }
    }

    printPdf() {
        this.protocolPage(this.prtclLst);
        let headerArray: any[] = [];
        let widthsArray: string[] = [];
        const bodyArray: any[] = [];
        let colArray: any[] = [];
        let colCountStart: any;
        let colCountEnd: any;
        let pageCount: any = 0;
        const HeaderCount: any = 6;
        let colCountAdd: any = 0;
        const headerRowVisible: any = 1;

        if (this.listCount.length > HeaderCount ) {
            colCountStart = 0;
            colCountEnd = HeaderCount;
        } else {
            colCountStart = 0;
            colCountEnd = this.listCount.length;
        }

        if ((this.listCount.length / HeaderCount) > (Math.round(this.listCount.length / HeaderCount))) {
            pageCount = Math.round(this.listCount.length / HeaderCount) + 1;
        } else {
            pageCount = Math.round(this.listCount.length / HeaderCount);
        }

        for (let x = 0, lenX = pageCount; x < lenX; x++) {
            // Header
            headerArray = [];
            widthsArray = [];
            for (let k = 0, len = HeaderCount + 1; k < len; k++) {
                headerArray.push({ text: '.', style: 'header' });
                widthsArray.push('*');
            }

            // Body
            for (let i = 0, lenA = this.cols.length; i < lenA; i++) {
                colArray.push(this.cols[i].header);
                let colCnt: any = 0;
                for (let j = colCountStart + colCountAdd, lenB = colCountEnd + colCountAdd; j < lenB; j++) {
                    if (this.cols[i].field == 'protocol_date') {
                        const pipe = new DatePipe('en-US');
                        colArray.push((pipe.transform(this.protocolList[j].data[this.cols[i].field], 'dd.MM.yyyy')).replace('undefined', ''));
                    } else {
                        if (i > 1) {
                            colArray.push(('' + this.protocolList[j].data[this.cols[i].field] + '').replace('undefined', ''));
                        } else {
                            colArray.push((this.protocolList[j].data[this.cols[i].field]).replace('undefined',''));
                        }
                    }
                    colCnt = colCnt + 1;
                }

                if (colCnt < HeaderCount) {
                    for (let e = 0, lenE = HeaderCount - colCnt; e < lenE; e++) {
                        colArray.push('');
                    }
                }
                bodyArray.push(colArray);
                colArray = [];
            }

            colCountAdd = colCountAdd + HeaderCount;
            if (colCountEnd + colCountAdd >= this.listCount.length) {
                colCountEnd = this.listCount.length;
                colCountStart = colCountStart + HeaderCount;
                colCountAdd = 0;
            }
        }

        let docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: 20,
            background: { image: '', width: 800, margin: 20 },
            defaultStyle: {
                font: 'Times',
                fontSize: 8
            }
        };
        docDefinition = JSON.parse(JSON.stringify(docDefinition));
        this.pdf.get_ListDocDefinition(bodyArray,
                                       widthsArray,
                                       headerRowVisible,
                                       this.translate.instant('Protokollverlauf'),
                                       this.translate.instant('Protokollverlauf') + '.pdf');

        const pList: any[] = [];
        for (let index = 0; index < this.prtclLst.length; index++) {
            if (index >= this.pageCount && index <= this.pageCount + 3) {
                pList.push(this.prtclLst[index]);
            }
        }
        this.protocolPage(pList);
    }

}
