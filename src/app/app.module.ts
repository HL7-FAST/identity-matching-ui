import { NgModule } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';

import { httpInterceptorProviders } from './interceptors/interceptor-barrel';
import { ThemePickerComponent } from './components/core/theme-picker/theme-picker.component';
import { AuthBypassComponent } from "./components/core/auth-bypass/auth-bypass.component";
import { LoadingIndicatorComponent } from './components/core/loading-indicator/loading-indicator.component';
import { StyleManagerService } from './services/core/style-manager-service';

import { environment } from '../environments/environment';



@NgModule({
    declarations: [
        AppComponent
    ],
    providers: [
        StyleManagerService,
        httpInterceptorProviders
    ],
    bootstrap: [AppComponent],
    imports: [
        OAuthModule.forRoot({
            resourceServer: {
                allowedUrls: [`${environment.baseApiUrl}`],
                sendAccessToken: true
            }
        }),
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        LayoutModule,
        MatToolbarModule,
        MatExpansionModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        ThemePickerComponent,
        MatMenuModule,
        MatNativeDateModule,
        LoadingIndicatorComponent,
        AuthBypassComponent
    ]
})
export class AppModule { }
