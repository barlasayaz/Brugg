import { UIChart } from 'primeng/chart';
import { Component, OnInit, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chart-horizontal',
  templateUrl: './chart-horizontal.component.html',
  styleUrls: ['./chart-horizontal.component.scss'],
})
export class ChartHorizontalComponent implements OnInit {
  @ViewChild('chart') chart: UIChart;
  @Input() data;
  chartData;
  chartOptions;

  labelsData: any[] = [];
  barData: any[] = [];

  constructor() { }

  ngOnInit() {
    // console.log('ngOnInit data', this.data);

    for (let i = 0; i < this.data.length; i++ ) {
      const item = this.data[i];

      if (item.visitReportSum > 0) {
        this.labelsData.push(item.header);
        this.barData.push(item.companyCount);
      }

    }
    this.chartData = {
      labels: this.labelsData,
      datasets: [
        {
        label: 'Company',
        data: this.barData,
        backgroundColor: '#FF5722',
        hoverBackgroundColor: '#FFAA7F'
        }]
    };

    this.chartOptions = {
      legend: {display: false}
    };
  }
}
