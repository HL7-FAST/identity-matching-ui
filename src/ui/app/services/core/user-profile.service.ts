import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IUserProfile } from '@/ui/app/interfaces/user-profile.interface';
import { UserProfile } from '@/ui/app/models/user-profile.model';
import { SessionStorageService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private profileKey = "user-profile";
  private _userProfileUpdatedSubject = new Subject<UserProfile>();
  userProfileUpdated = this._userProfileUpdatedSubject.asObservable();

  constructor(private sessionStorageSrv: SessionStorageService) { }

  setProfile(profile: IUserProfile) {
    this.sessionStorageSrv.storeItem(this.profileKey, JSON.stringify(profile));
    this._userProfileUpdatedSubject.next(profile);
  }

  async getProfile(): Promise<IUserProfile> {
    const profile = await this.sessionStorageSrv.getItem(this.profileKey);

    if (profile) {
      return JSON.parse(profile) as IUserProfile;
    }
    else {
      return new UserProfile('', '', '', [''], [''], ['']); 
    } 

  }

}
