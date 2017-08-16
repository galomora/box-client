import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';

import { BoxLoginService } from './box.login.service';
import { BoxAppService } from './box.app.service';
import { BoxAppConfig } from './box.app.config';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [BoxAppService]
})
export class AppComponent implements OnInit {
  boxLoginURL: string;
  config: BoxAppConfig = new BoxAppConfig();
  errorMessage: string;
  showError : boolean = false;
  linkGenerated : boolean = false;

  constructor(private boxLoginService: BoxLoginService, private boxAppService: BoxAppService) {
    
  }

  ngOnInit(): void {
    this.showError = false;
    this.boxAppService.getBoxAppConfig().subscribe(
      boxConfig => {
        this.config = boxConfig;
        this.boxLoginURL = this.boxLoginService.generateBoxLoginURL(boxConfig);
        this.linkGenerated = true;
      },
      error => {
        this.errorMessage = error.toString();
        this.showError = true;
        console.log('Error obtener configuracion ' + error.toString());
        this.linkGenerated = false;
      }
    );
  }

}

