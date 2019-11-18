import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chart-pie',
  templateUrl: './chart-pie.component.html',
  styleUrls: ['./chart-pie.component.scss'],
})
export class ChartPieComponent implements OnInit {
  @Input() data;
  chartData;
  chartEmptyData;
  chartFullData;
  chartOptions;

  constructor() { }

  ngOnInit() {
   // console.log('ngOnInit data', this.data);
     if ( this.data.ratingA == 0 && this.data.ratingB == 0 && this.data.ratingC == 0 && this.data.ratingF == 0) {
      this.chartEmptyData = {
        labels: ['Null'],
        datasets: [
          {
            data:  [1],
            backgroundColor: [
              '#FFFFFF'
            ],
            hoverBackgroundColor: [
              '#000000'
            ]
          }
        ]
      };
      this.chartData = this.chartEmptyData;
    } else {
      this.chartFullData = {
        labels: ['A', 'B', 'C', 'F'],
        datasets: [
          {
            data:  [
              this.data.ratingA,
              this.data.ratingB,
              this.data.ratingC,
              this.data.ratingF],
            backgroundColor: [
              '#FFC107',
              '#03A9F4',
              '#4CAF50',
              '#A204BE'
            ],
            hoverBackgroundColor: [
              '#FFE082',
              '#81D4FA',
              '#A5D6A7',
              '#D47FFF'
            ]
          }
        ]
      };
      this.chartData = this.chartFullData;
    }

    this.chartOptions = {
      legend: {display: false}
    };
  }
}
