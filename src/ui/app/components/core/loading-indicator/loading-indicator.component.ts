import { AfterContentInit, AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '@/ui/app/services/loading.service';

@Component({
    selector: 'app-loading-indicator',
    imports: [
        CommonModule,
        MatProgressBarModule
    ],
    templateUrl: './loading-indicator.component.html',
    styleUrls: ['./loading-indicator.component.scss']
})
export class LoadingIndicatorComponent implements AfterViewInit {
  loading: boolean = false;

  constructor(private loadingService: LoadingService) {    
  }

  ngAfterViewInit() {
    this.loadingService.isLoading.subscribe((loadingStatus) => {
      this.loading = loadingStatus;
    });
  }

}
