import { Component, Input } from '@angular/core';
import { URLSearchParams, QueryEncoder, Http } from '@angular/http';

import { UserElement } from './user.element';


@Component({
    selector: 'user-files',
    templateUrl: './user.files.html',
    styleUrls: ['./app.component.css'],
    providers: []
})

export class UserFilesComponent {
    @Input()
    userElements : Array<UserElement>;
}