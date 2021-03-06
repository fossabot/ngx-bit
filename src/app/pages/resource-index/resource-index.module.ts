import { NgModule } from '@angular/core';
import { ResourceIndexComponent } from './resource-index.component';
import { RouterModule, Routes } from '@angular/router';
import { AppExtModule } from '@ext';

const routes: Routes = [
  {
    path: '',
    component: ResourceIndexComponent
  }
];

@NgModule({
  imports: [
    AppExtModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ResourceIndexComponent]
})
export class ResourceIndexModule {
}
