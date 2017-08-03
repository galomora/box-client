import { Injectable } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http, Response } from '@angular/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs/Observable';
import * as BoxSDKNode from 'box-node-sdk';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { BoxClientService } from './box.client.service';
import { UserElement } from './user.element';
import { BoxAppConfig } from './box.app.config';
import { BoxItemInfo } from './box.item.info';


@Injectable()
export class UserFilesService {

    constructor(private boxClientService: BoxClientService) { }

    /**
     * Cambiar forma de obtener directorios de proyectos a partir del directorio raiz
     * Se debe tener un estandar
     */
    getProjectFoldersFromRoot(rootFolderInfo: any): Array<BoxItemInfo> {
        let entries: Array<any> = rootFolderInfo.item_collection.entries;
        let folders: Array<any> = entries.filter(
            function(entry) {
                return (entry.type === 'folder');
            });
        return folders.map(entry => this.mapBoxInfo(entry));
    }
    
    private mapBoxInfo(itemJson: any): BoxItemInfo {
        let itemInfo: BoxItemInfo = new BoxItemInfo();
        itemInfo.itemType = itemJson.type;
        itemInfo.id = itemJson.id;
        itemInfo.sequenceId = itemJson.sequence_id;
        itemInfo.etag = itemJson.etag;
        itemInfo.name = itemJson.name;
        return itemInfo;
    }

    // carpetas retornan un json como any

    getRootFolder(boxClient: any): Observable<any> {
        return this.getFolder('0', boxClient);
    }

    getFolder(id: string, boxClient: any): Observable<any> {
        return Observable.fromPromise(boxClient.folders.get(id));
    }
    
    generateFolderLink (id: string, boxClient: any): Observable<any> {
        return Observable.fromPromise(boxClient.folders.update(
            id, {shared_link: boxClient.accessLevels.OPEN})
        );
    }

    generateFileLink (id: string, boxClient: any): Observable<any> {
        return Observable.fromPromise(boxClient.files.update(
            id, {shared_link: boxClient.accessLevels.DEFAULT})
        );
    }
    
    // archivos

    /**
     * folderInfo JSON de informacion de carpeta de Box
     * elements Array en el que se agregaran los elementos
     */
    getFolderElements(folderInfo: any, elements: Array<UserElement>, boxClient: any): Array<UserElement> {
        //        let elements: Array<UserElement> = [];
        let entries: Array<any> = folderInfo.item_collection.entries;
        entries.forEach(entry => {
            if (entry.type === 'folder') {
                this.generateFolderLink (entry.id, boxClient).subscribe(folderInfo => {
                    elements.push(this.mapFolderElement(folderInfo));
                    this.getFolderElements(folderInfo, elements, boxClient);
//                this.getFolder(entry.id, boxClient).subscribe(folderInfo => {
//                    this.getFolderElements(folderInfo, elements, boxClient);
                });
            } else if (entry.type === 'file') {
                this.generateFileLink (entry.id, boxClient).subscribe(fileInfo => {
                    elements.push(this.mapFileElement(fileInfo));
                });
//                elements.push(this.mapFileElement(entry));
            }
        }
        );
        return elements;
    }

    private mapFolderElement(itemInfo: any): UserElement {
        console.log('dirJson ' + JSON.stringify(itemInfo));
        let element: UserElement = new UserElement();
        element.id = itemInfo.id;
        element.name = itemInfo.name;
        element.route = this.computeRoute (itemInfo);
        element.editLink = itemInfo.shared_link.url;
//        element.downloadLink = ;
        element.isFolder = true;
        element.isFile = false;
        return element;
    }

    private mapFileElement(itemInfo: any): UserElement {
        console.log('fileJson ' + JSON.stringify(itemInfo));
        let element: UserElement = new UserElement();
        element.id = itemInfo.id;
        element.name = itemInfo.name;
        element.route = this.computeRoute (itemInfo);
        element.editLink = itemInfo.shared_link.url;
        element.downloadLink = itemInfo.shared_link.download_url;
        element.isFolder = false;
        element.isFile = true;
        return element;
    }

    private computeRoute (itemInfo: any) : string {
        let route : string = '';
        let pathCollection : Array<any> = itemInfo.path_collection.entries;
        pathCollection.forEach (path => {
            route = route.concat (path.name + '/');
        });
        return route;
    }
    
}