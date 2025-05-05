// import { NgModule } from '@angular/core';
// import {
//   BrowserModule,
//   provideClientHydration,
//   withEventReplay,
// } from '@angular/platform-browser';
// import {
//   HTTP_INTERCEPTORS,
//   provideHttpClient,
//   withFetch,
//   withInterceptorsFromDi,
// } from '@angular/common/http';

// import { AppComponent } from './app.component';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { LayoutModule } from '@angular/cdk/layout';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatListModule } from '@angular/material/list';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatExpansionModule } from '@angular/material/expansion';

// import { httpInterceptorProviders } from './interceptors/interceptor-barrel';
// import { AuthBypassComponent } from './components/core/auth-bypass/auth-bypass.component';
// import { LoadingIndicatorComponent } from './components/core/loading-indicator/loading-indicator.component';
// import { StyleManagerService } from './services/core/style-manager-service';

// import { MatDialogModule } from '@angular/material/dialog';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { ClientSelectorComponent } from "./components/client-selector/client-selector.component";

// @NgModule({
//   declarations: [AppComponent],
//   bootstrap: [AppComponent],
//   imports: [
//     BrowserModule,
//     // AppRoutingModule,
//     BrowserAnimationsModule,
//     LayoutModule,
//     MatToolbarModule,
//     MatTooltipModule,
//     MatExpansionModule,
//     MatButtonModule,
//     MatDialogModule,
//     MatSidenavModule,
//     MatIconModule,
//     MatListModule,
//     MatMenuModule,
//     MatNativeDateModule,
//     LoadingIndicatorComponent,
//     AuthBypassComponent,
//     ClientSelectorComponent
// ],
//   providers: [
//     StyleManagerService,
//     httpInterceptorProviders,
//     provideHttpClient(withFetch(), withInterceptorsFromDi()),
//     provideClientHydration(withEventReplay()),
//   ],
// })
// export class AppModule {}
