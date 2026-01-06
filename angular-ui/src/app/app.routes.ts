import { Routes } from '@angular/router';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { HomeComponent } from './components/home/home.component';
import { TemporalOperationsCenterComponent } from './components/temporal-operations-center/temporal-operations-center.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'audit', component: AuditLogComponent },
    { path: 'toc', component: TemporalOperationsCenterComponent }
];
