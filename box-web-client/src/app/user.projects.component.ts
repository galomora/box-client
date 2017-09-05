import { Component, Input } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http } from '@angular/http';

import { BoxLoginService } from './box.login.service';
import { UserFilesService } from './user.files.service';
import { BoxAppService } from './box.app.service';
import { BoxItemInfo } from './box.item.info';
import { BoxAppConfig } from './box.app.config';
import { UserElement } from './user.element';


@Component({
    selector: 'user-projects',
    templateUrl: './user.projects.html',
    styleUrls: ['./user.projects.css'],
    providers: [BoxLoginService, BoxAppService]
})

export class UserProjectsComponent {
    @Input()
    userProjects : Array<BoxItemInfo>;
    selectedProject : BoxItemInfo;
    boxAppConfig: BoxAppConfig;
    errorMessage: string;
    userElements: Array<UserElement> = [];
    showError: boolean = false;
    
    constructor(private boxLoginService: BoxLoginService,
        private userFilesService: UserFilesService,
        private boxAppService: BoxAppService) {
    }
    
    selectProject (projectFolder) {
        this.selectedProject = projectFolder; 
        this.getSelectedProjectFolders ();
        }
    
    private getSelectedProjectFolders() {
        this.userElements = [];
        this.boxAppService.getBoxAppConfig().subscribe(
            boxConfig => {
                this.boxAppConfig = boxConfig;
                let boxClient = this.boxAppService.getClient(this.boxAppConfig);
                this.userFilesService.getFolder(this.selectedProject.id, boxClient).subscribe(
                    rootFolderInfo => {
                        this.userFilesService.getFolderElements(rootFolderInfo, this.userElements, boxClient);
                    },
                    error => {
                        this.errorMessage = error.toString();
                        console.log('Error consultar directorios ' + error.toString());
                        this.showError = true;
                    }
                );
            },
            error => {
                this.errorMessage = error.toString();
                console.log('Error obtener configuracion ' + error.toString());
                this.showError = true;
            }
        );
    }
}