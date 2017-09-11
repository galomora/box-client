import { Component, Input } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http } from '@angular/http';
import { NotificationsService } from 'angular2-notifications';

import { BoxLoginService } from './box.login.service';
import { UserFilesService } from './user.files.service';
import { BoxAppService } from './box.app.service';
import { BoxItemInfo } from './box.item.info';
import { BoxAppConfig } from './box.app.config';
import { UserElement } from './user.element';

import { NotificationOptions } from './notification.options';


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
    
    userElements: Array<UserElement> = [];
    
    constructor(private boxLoginService: BoxLoginService,
        private userFilesService: UserFilesService,
        private boxAppService: BoxAppService,
        private notificationsService : NotificationsService) {
    }
    
    selectProject(projectFolder) {
        this.selectedProject = projectFolder;
        this.getSelectedProjectFolders();
        this.notificationsService.info('Current Project Folder', projectFolder.name, NotificationOptions.options);
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
                        this.printError ('Error consultar directorios ', error)
                    }
                );
            },
            error => {
                this.printError ('Error obtener configuracion ', error)
            }
        );
    }
    
    private printError(consoleMessage: string, error: any) {
        console.log(consoleMessage + error.toString());
        this.notificationsService.error('Error', error.toString(), NotificationOptions.options);
    }
}