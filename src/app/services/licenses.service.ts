import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LicensesService {
  sessionStorage = window.sessionStorage;
  // BASE_URL = 'https://eboardlicense-tool.herokuapp.com';
  BASE_URL = 'http://127.0.0.1:7000';

  httpAuthOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: this.sessionStorage.getItem('token'),
    }),
  };

  constructor(private http: HttpClient) {}

  getLicenseByOrgRegNo(orgregno: any) {
    return this.http.get(
      this.BASE_URL + '/license/get_license_by_org/' + orgregno,
      this.httpAuthOptions
    );
  }

  getOrganizationByOrRegNo(orgregno: any) {
    return this.http.get(
      this.BASE_URL + '/organization/get_organization_by_orgregno/' + orgregno,
      this.httpAuthOptions
    );
  }

  createOrganizationContact(data) {
    return this.http.post(
      this.BASE_URL + '/organization/create_organization_contact/',
      data,
      this.httpAuthOptions
    );
  }

  createOrganizationSocialMedia(data) {
    return this.http.post(
      this.BASE_URL + '/organization/create_organization_social/',
      data,
      this.httpAuthOptions
    );
  }

  createOrganizationLeaders(data) {
    return this.http.post(
      this.BASE_URL + '/organization/create_organization_leader/',
      data,
      this.httpAuthOptions
    );
  }

  getOrganizationLeaders(org_ref) {
    return this.http.get(
      this.BASE_URL +
        '/organization/get_organization_leader_by_orgregno/' +
        org_ref +
        '/',
      this.httpAuthOptions
    );
  }

  getOrganizationContact(org_ref) {
    return this.http.get(
      this.BASE_URL +
        '/organization/get_organization_contact_by_orgregno/' +
        org_ref +
        '/',
      this.httpAuthOptions
    );
  }

  getOrganizationSocialMedia(org_ref) {
    return this.http.get(
      this.BASE_URL +
        '/organization/get_organization_social_by_orgregno/' +
        org_ref +
        '/',
      this.httpAuthOptions
    );
  }

  deleteOrganizationContact(contact_id) {
    return this.http.delete(
      this.BASE_URL +
        '/organization/organization_contact_by_id/' +
        contact_id +
        '/',
      this.httpAuthOptions
    );
  }

  deleteOrganizationSocial(social_id) {
    return this.http.delete(
      this.BASE_URL +
        '/organization/organization_social_by_id/' +
        social_id +
        '/',
      this.httpAuthOptions
    );
  }

  deleteOrganizationLeaders(leader_id) {
    return this.http.delete(
      this.BASE_URL +
        '/organization/organization_leader_by_id/' +
        leader_id +
        '/',
      this.httpAuthOptions
    );
  }

  updateOrganization(id: any, data: any) {
    return this.http.patch(
      this.BASE_URL + '/organization/update_organization_by_id/' + id + '/',
      data,
      this.httpAuthOptions
    );
  }

  removeActiveUser(data) {
    return this.http.post(
      this.BASE_URL + '/license/remove_active/',
      data,
      this.httpAuthOptions
    );
  }

  activate_generated_license(license_key) {
    const data = {
      license_key: license_key,
    };
    return this.http.post(
      this.BASE_URL + '/api/licenses/activate_generated_license/',
      data,
      this.httpAuthOptions
    );
  }
}
