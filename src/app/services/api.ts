import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/timeout';
import { UserdataService } from './userdata';


// const pvs4_apiURL = 'http://localhost/BruggPVS4/pvs4-api/';
 const pvs4_apiURL = 'https://www.pvs2go.com/pvs4-api/';
// const pvs4_apiURL = 'http://s802403063.online.de/pvs4-api/';

const brugg_id_api = 'https://www.bruggdigital.com/';
const pvs4_client_id = 'brugg-pvs';
const pvs4_client_secret = 'b23c8hfqnvd3qt7865uiat';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  ud: any;
  isLoggedIn: any;
  public pvsApiURL = pvs4_apiURL;
  public maxDate: any = '2050-12-31';
  public appointmentStartTime: string = '08:00';
  public appointmentEndTime: string = '16:59';
  public appointmentMinTime: string = '07:00';
  public appointmentMaxTime: string = '17:59';
  public version: any = '4.4.48';
  private reset_semaphor = false;
  private reset_timeout: any = 0;

  constructor(public http: HttpClient, public userdata: UserdataService) {
    console.log('Start ApiProvider Provider');
  }
  /*********************************** Brugg ID  *********************************************/
  bid_login(email: string, password: string) {
    console.log('api bid_login()');
    return new Promise((res, rej) => {
      // inject our access token
      const tick = Date.now().toString(16).toUpperCase();
      const url = brugg_id_api + 'authorize.php?tick=' + tick;
      const data = {
        'client_id'    : pvs4_client_id, 
        'client_secret': pvs4_client_secret,
        'grant_type'   : 'password',
        'username'     : email,
        'password'     : password
      };
      // call  endpoint
      this.http.post(url, data, { responseType: 'text' })
        .subscribe(
          (data: any) => {
            data = JSON.parse(data);
            console.log('api bid_login() post data: ', data);
            if (data.amount == 1) {
              console.log('api bid_login() ok ');
              window.localStorage['pvs4_login'] = 1;
              window.localStorage['pvs4_user'] = JSON.stringify(data.user_info);
              window.localStorage['access_token'] = data.result.access_token;
              window.localStorage['refresh_token'] = data.result.refresh_token;
              window.localStorage['pvs4_bruggid'] = data.user_info.email;
              this.userdata.first_name = data.user_info.first_name;
              this.userdata.last_name = data.user_info.last_name;
              this.userdata.email = data.user_info.email;
              this.userdata.phone = data.user_info.phone;

              this.pvs4_get_my_profile(email).then((done: any) => {
                done = done.obj;
                done.last_login = this.date2mysql(new Date(), false);
                this.pvs4_set_profile(done).then((done: any) => {
                    console.log('api pvs4_set_profile() ok ');
                },
                  err => { // return the error
                    console.error('api pvs4_set_profile() nok ', err);
                });

                res(data);
              },
                err => { // return the error
                  rej(err);
              });
            } else {
              console.log('api bid_login() nok_1 ');
              window.localStorage['pvs4_login'] = 0;
              localStorage.removeItem('user_info');
              localStorage.removeItem('pvs4_user');
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.localStorage['pvs4_bruggid'] = '';
              rej(data);
            }
          }, // success path
          error => {
            window.localStorage['pvs4_login'] = 0;
            localStorage.removeItem('user_info');
            localStorage.removeItem('pvs4_user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.localStorage['pvs4_bruggid'] = '';
            console.log('api bid_login() nok_2 :', error);
            rej(error);
          }// error path
        );
    });
  }

  async test_semaphor() {
  console.log('test_semaphor()  this.reset_semaphor', this.reset_semaphor);
    return new Promise(resolve => {
      if (this.reset_semaphor) {
        setTimeout(() => {
          console.log('test_semaphor() timeout resolve ');
          let r = this.test_semaphor();
          resolve(r);
        }, 1000);
      } else {
        resolve();
        console.log('test_semaphor() resolve ');
      }
    });
  }


  async bid_reset(orig_url: string, orig_data: any, orig_headers: any) {
    console.log('pvs4_api_reset():', orig_url, orig_data);
    //nur ein Rest zur gleichen zeit
    await this.test_semaphor();
    if (this.reset_semaphor) {
      console.error('error reset_semaphor');
    } else {
      this.reset_semaphor = true;
      let my_prom =  new Promise((res, rej) => {
        // inject our access token
        const tick = Date.now().toString(16).toUpperCase();
        const url = brugg_id_api + 'token.php?tick=' + tick;
        const data = {
          'client_id'    : pvs4_client_id, 
          'client_secret': pvs4_client_secret,
          'grant_type': 'refresh_token',
          'refresh_token' : window.localStorage['refresh_token']
        };
        // call  endpoint
        this.http.post(url, data, { responseType: 'text' }).subscribe( (data: any) => {
              this.reset_semaphor = false;
              data = JSON.parse(data);
              console.log('api bid_reset() post data: ', data);
              window.localStorage['access_token'] = data.access_token;
              window.localStorage['refresh_token'] = data.refresh_token;
              orig_data.token  = data.access_token;
              this.http.post(orig_url, orig_data, { headers: orig_headers , responseType: 'text' }).subscribe((done: any) => {
                // return the result
                try {
                  let done_json = JSON.parse(done);
                  console.log('bid_reset() ok: ', orig_url, done_json);
                  res(done_json);
                } catch {
                  console.error('bid_reset() JSON.parse orig_url error:', orig_url, done);
                }
              },
              err => {
                  console.error('bid_reset() post orig_url error:', orig_url, err);
                  rej(err);
              });
            }, // success path
            error => {
              console.log('api bid_reset() nok :', error);
              this.reset_semaphor = false;
              // res(error);
              this.userdata.delStorage();
              location.reload();
            }// error path
          );
      });
      return my_prom;
    }
  }
  /*
  bid_userdata(email: string) {
    console.log("bid_userdata():", email);
    return new Promise((res, rej) => {
      // inject our access token
      let tick = Date.now().toString(16).toUpperCase();
      let url = brugg_id_api + "userdata.php?tick=" + tick;
      let data = {
        'client_id'    : pvs4_client_id, 
        'client_secret': pvs4_client_secret,
        'username': this.userdata.email,
        'userdata': email,
        'access_token' : window.localStorage['access_token']
      }
      // call  endpoint
      this.http.post(url, data)
        .subscribe(
          (done: any) => {
            console.log("api bid_userdata() post data: ", done);
            res(done);
          }, // success path
          error => {
            console.log("api bid_userdata() nok :", error);
            rej(error);
          }// error path
        );
    });
  }
  */

  /******************* PVS4 API  *********************************************/
  pvs4_api_post(func: string, data: any) {
    console.log('pvs4_api_post():', func, data);
    return new Promise((res, rej) => {
      const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
      const tick = Date.now().toString(16).toUpperCase();
      const url = pvs4_apiURL + func + '?tick=' + tick;
      // inject our access token
      data.token = window.localStorage['access_token'];
      data.bruggid = window.localStorage['pvs4_bruggid'];
      // call  endpoint
      this.http.post(url, data, { headers: headers, responseType: 'text' }).subscribe((done: any) => {
          // return the result
          try {
            let done_json = JSON.parse(done);
            console.log(func, done_json);
            res(done_json);
          } catch {
            console.error(func, done);
            rej(done);
          }
        },
        err => {
            console.log('pvs4_api_post error:', func, err);
            if (err.status == 401) {
              this.bid_reset(url, data, headers).then((done: any) => { // return the result
                res(done);
              },
                err => { // return the error
                  rej(err);
              });
            } else {
              rej(err);
            }
        });
    });
  } 

  pvs4_get_my_profile(email: string) {
    return new Promise((res, rej) => {
      const post_data = {
        email: email
      };
      console.log('pvs4_get_my_profile post_data :', post_data);
      this.pvs4_api_post('get_profile.php', post_data).then((done: any) => { // return the result
        console.log('pvs4_getprofile done ok: ', done);
        let system_role = [];
        if (done.obj.system_role && done.obj.system_role != '' && done.obj.system_role != null) {
           system_role = JSON.parse(done.obj.system_role);
        }
        let licensee_role = [];
        if (done.obj.licensee_role && done.obj.licensee_role != '' && done.obj.licensee_role != null) {
           licensee_role = JSON.parse(done.obj.licensee_role);
        }
        let customer_role = [];
        if (done.obj.customer_role && done.obj.customer_role != '' && done.obj.customer_role != null) {
           customer_role = JSON.parse(done.obj.customer_role);
        }

        this.userdata.profile = parseInt(done.obj.id);
        this.userdata.id = this.userdata.profile;
        this.userdata.licensee = 0;
        this.userdata.role = 0;
        this.userdata.role_nr = 0;
        this.userdata.role_set = {
          check_products: false,​​
          edit_contact_persons: false,          ​​
          edit_customer: false,          ​​
          edit_membership: false,          ​​
          edit_products: false,          ​​
          edit_rights: false,
          edit_product_templates: false,
          edit_protocol_templates: false
        };
        this.userdata.short_code = done.obj.short_code;
        this.userdata.colour = done.obj.colour;
        if (system_role.length > 0) {
          this.userdata.role = 1; 
          this.userdata.role_set = system_role[0];
          this.userdata.all_role_set = system_role;
        } else if (licensee_role.length > 0)  {
          this.userdata.role = 2; 
          this.userdata.role_set = licensee_role[0];
          this.userdata.licensee = licensee_role[0].licensee;
          this.userdata.all_role_set = licensee_role;
        } else if (customer_role.length > 0) {
          this.userdata.role = 3; 
          this.userdata.role_set = customer_role[0];
          this.userdata.all_role_set = customer_role;
        }
        if (!this.userdata.role_set.check_products) { this.userdata.role_set.check_products = false; }
        if (!this.userdata.role_set.edit_contact_persons) { this.userdata.role_set.edit_contact_persons = false; }
        if (!this.userdata.role_set.edit_customer) { this.userdata.role_set.edit_customer = false; }
        if (!this.userdata.role_set.edit_membership) { this.userdata.role_set.edit_membership = false; }
        if (!this.userdata.role_set.edit_products) { this.userdata.role_set.edit_products = false; }
        if (!this.userdata.role_set.edit_rights) { this.userdata.role_set.edit_rights = false; }
        if (!this.userdata.role_set.edit_product_templates) { this.userdata.role_set.edit_product_templates = false; }
        if (!this.userdata.role_set.edit_protocol_templates) { this.userdata.role_set.edit_protocol_templates = false; }
        console.log('pvs4_get_my_profile done ok: ', this.userdata);
        res(done);
      },
        err => { // return the error
          console.log('api bid_login() nok_3 ');
          window.localStorage['pvs4_login'] = 0;
          localStorage.removeItem('user_info');
          localStorage.removeItem('pvs4_user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.localStorage['pvs4_bruggid'] = '';
          rej(err);
      });
    });
  }
/*
  pvs4_run() {
    return new Promise((res, rej) => {
      let post_data = {
      }
      this.pvs4_api_post("_run_.php", post_data).then((done: any) => { //return the result
        console.log("_run_ done ok: ", done);
        res(done);
      },
        err => { // return the error
          rej(err);
      });
    });
  }
*/
  pvs4_get_profile(email: string, check: number= 0) {
    return new Promise((res, rej) => {
      const post_data = {
        email: email,
        check: check
      };
      this.pvs4_api_post('get_profile.php', post_data).then((done: any) => { // return the result
        console.log('pvs4_get_profile done ok: ', done);
        res(done);
      },
        err => { // return the error
          rej(err);
      });
    });
  }

  pvs4_set_profile(obj: any) {
    console.log('pvs4_set_profile():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_profile.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_colleagues_list(role: number, role_set: any, licensee: number) {
    // let userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: this.userdata.id,
        role: role,
        role_set: role_set,
        licensee: licensee
      };
      this.pvs4_api_post('get_colleagues.php', data).then((done: any) => { // return the result
          res(done);
      },
        err => { // return the error
          rej(err);
      });
    });
  }

  pvs4_get_customer_list(parentID: number, csutomerName: string, offset: number= 0) {
    const userID = this.userdata.id;
    const licensee = this.userdata.licensee;
    const role = this.userdata.role;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        parent: parentID,
        licensee: licensee,
        offset : offset,
        role: role,
        customerName: csutomerName
      };
      this.pvs4_api_post('get_customer_list.php', data).then((done: any) => { // return the result
          res(done);
          // console.log("get_customer_list offset:", offset);
          // if(done.amount>0) this.pvs4_get_customer_list(parentID, offset+1);
      },
        err => { // return the error
          rej(err);
      });
    });
  }

  pvs4_get_product_opt(licenseeID: number, viewID: number) {
    const userID = this.userdata.id;
    console.log('api pvs4_get_product_opt');
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        licensee: licenseeID,
        view: viewID,
      };
      this.pvs4_api_post('get_product_opt.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_product_opt(obj: any) {
    console.log('pvs4_set_product_opt():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_product_opt.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_product_tem(licenseeID: number, viewID: number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        licensee: licenseeID,
        view: viewID,
      };
      this.pvs4_api_post('get_product_tem.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }
  pvs4_set_product_tem(obj: any) {
    console.log('pvs4_set_product_tem():', obj);
    return new Promise((res, rej) => {

      this.pvs4_api_post('set_product_tem.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_protocol_opt(licenseeID: number, viewID: number) {
    const userID = this.userdata.id;
    console.log('api pvs4_get_protocol_opt');
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        licensee: licenseeID,
        view: viewID,
      };
      this.pvs4_api_post('get_protocol_opt.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_protocol_opt(obj: any) {
    obj.author = this.userdata.first_name + ' ' + this.userdata.last_name;
    console.log('pvs4_set_protocol_opt():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_protocol_opt.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_protocol_tem(licenseeID: number, viewID: number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        licensee: licenseeID,
        view: viewID,
      };
      this.pvs4_api_post('get_protocol_tem.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_protocol_tem(obj: any) {
    console.log('pvs4_set_protocol_tem():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_protocol_tem.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_note(obj: any) {
    console.log('pvs4_set_note():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_note.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_note(noteID: number) {
    return new Promise((res, rej) => {
      const data = {
        id: noteID
      };
      this.pvs4_api_post('get_note.php', data).then((done: any) => {// return the result
        done.obj.id = parseInt(done.obj.id);
        done.obj.customer = parseInt(done.obj.customer);
        done.obj.active = parseInt(done.obj.active);
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_note_list(customerID: Number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        customer: customerID
      };
      this.pvs4_api_post('get_note_list.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_statistics(type: Number, user: Number, start: String, end: String) {
    return new Promise((res, rej) => {
      const data = {
        user: user,
        type: type,
        start: start,
        end: end
      };

      this.pvs4_api_post('get_statistics.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_protocol(obj: any) {
    obj.author = this.userdata.first_name + ' ' + this.userdata.last_name;
    console.log('pvs4_set_protocol():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_protocol.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_protocol(protocolID: number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        id: protocolID
      };
      this.pvs4_api_post('get_protocol.php', data).then((done: any) => {// return the result
        done.obj.id = parseInt(done.obj.id);
        done.obj.customer = parseInt(done.obj.customer);
        done.obj.active = parseInt(done.obj.active);
        done.obj.result = parseInt(done.obj.result);
        done.obj.protocol_number = parseInt(done.obj.protocol_number);
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_protocol_list(customerID: Number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        customer: customerID
      };
      this.pvs4_api_post('get_protocol_list.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_product(obj: any) {
    obj.author = this.userdata.first_name + ' ' + this.userdata.last_name;
    console.log('pvs4_set_product():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_product.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_product_dynamic(obj: any) {
    console.log('pvs4_set_product_dynamic():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_product_dynamic.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_product_tag(obj: any) {
    console.log('pvs4_set_product():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_product_tag.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_nfc_product(tagID: string) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        tagID: tagID
      };
      this.pvs4_api_post('get_nfc_product.php', data).then((done: any) => {// return the result
        done.amount = parseInt(done.amount);
        if (done.amount > 0) {
          done.obj.id = parseInt(done.obj.id);
          done.obj.active = parseInt(done.obj.active);
          done.obj.parent = parseInt(done.obj.parent);
          done.obj.customer = parseInt(done.obj.customer);
          done.obj.check_interval = parseInt(done.obj.check_interval);
        }
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_qr_product_list(qrCode: string) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        qrCode: qrCode
      };
      this.pvs4_api_post('get_qr_product_list.php', data).then((done: any) => {// return the result
        /*
        done.obj.id = parseInt(done.obj.id);
        done.obj.active = parseInt(done.obj.active);
        done.obj.parent = parseInt(done.obj.parent);
        done.obj.customer = parseInt(done.obj.customer);
        done.obj.check_interval = parseInt(done.obj.check_interval);
        */
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_product(productID: number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        id: productID
      };
      this.pvs4_api_post('get_product.php', data).then((done: any) => {// return the result
        // console.log('get_product :', done);
        if (done.amount) {
          if (done.amount > 0) {
            done.obj.id = parseInt(done.obj.id);
            done.obj.active = parseInt(done.obj.active);
            done.obj.parent = parseInt(done.obj.parent);
            done.obj.customer = parseInt(done.obj.customer);
            done.obj.check_interval = parseInt(done.obj.check_interval);
          }
        }
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_product_list(customerID: Number, activePassiv:boolean= true ) {
    const userID = this.userdata.id;
    let active = 1;
    if(activePassiv===false) active = 0;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        customer: customerID,
        active: active
      };
      this.pvs4_api_post('get_product_list.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_customer(customerID: number) {
    return new Promise((res, rej) => {
      const data = {
        id: customerID
      };
      this.pvs4_api_post('get_customer.php', data).then((done: any) => {// return the result
        if (done.obj != null) {
          done.obj.id = parseInt(done.obj.id);
          done.obj.active = parseInt(done.obj.active);
          done.obj.licensee = parseInt(done.obj.licensee);
          done.obj.parent = parseInt(done.obj.parent);
        }
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_inspection_service(customerID: number, mode: number) {
    return new Promise((res, rej) => {
      const data = {
        id: customerID,
        mode: mode
      };
      this.pvs4_api_post('set_inspection_service.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_customer(obj: any) {
    console.log('pvs4_set_customer():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_customer.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_appointment_list() {
    const userID = this.userdata.id;
    const licensee = this.userdata.licensee;
    const role = this.userdata.role;
    return new Promise((res, rej) => {
      const data = {
        user: userID
        , licensee: licensee
        , role: role
      };
      this.pvs4_api_post('get_appointment_list.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_customer_list_app( a: boolean) {
    const userID = this.userdata.id;
    const licensee = this.userdata.licensee;
    const role = this.userdata.role;
    let all = 0;
    if (a) { all = 1; }
    return new Promise((res, rej) => {
      const data = {
        user: userID
        , all: all
        , licensee: licensee
        , role: role
      };
      this.pvs4_api_post('get_customer_list_app.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_appointment_list_ps(date_start: string, date_end: string) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        licensee: this.userdata.licensee,
        date_start: date_start,
        date_end: date_end
      };
      this.pvs4_api_post('get_appointment_list_ps.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_appointment(obj: any) {
    console.log('pvs4_set_appointment():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_appointment.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_appointment(appointmentID: number) {
    return new Promise((res, rej) => {
      const data = {
        id: appointmentID
      };
      this.pvs4_api_post('get_appointment.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_file(id: any, type: any) {
    return new Promise((res, rej) => {
      const data = {
        id: id,
        type: type
      };
      this.pvs4_api_post('dateiliste.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_del_file(parameters: any) {
    return new Promise((res, rej) => {
      const data = {
        id: parameters.id,
        type: parameters.type,
        dateiname: parameters.dateiname
      };
      this.pvs4_api_post('del_file.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_rebox_pickup(obj: any) {
    console.log('pvs4_set_rebox_pickup():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_rebox_pickup.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_orders_send(obj: any) {
    console.log('pvs4_set_orders_send():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_orders_send.php', obj).then((done: any) => {// return the result
        console.log('pvs4_set_orders_send', done);
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_statistic_send(obj: any) {
    console.log('pvs4_set_statistic_send():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_statistic_send.php', obj).then((done: any) => {// return the result
        console.log('pvs4_set_statistic_send', done);
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_baan(nr: any) {
    return new Promise((res, rej) => {
      const data = {
        id_nr: nr
      };
      this.pvs4_api_post('get_baan.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_mydata(id: number) {
    return new Promise((res, rej) => {
      const data = {
        id: id,
        licensee: this.userdata.licensee
      };
      this.pvs4_api_post('get_mydata.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_mydata(obj: any) {
    console.log('pvs4_set_mydata():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_mydata.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_protocol_history(customerID: Number, productID: Number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        customer: customerID,
        product: productID
      };
      this.pvs4_api_post('get_protocol_history.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_product_parrent(parentID: number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        parentId: parentID
      };
      this.pvs4_api_post('get_product_parrent.php', data).then((done: any) => {// return the result
        // done.obj.id = parseInt(done.obj.id);
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_copy_file(parameters: any) {
    return new Promise((res, rej) => {
      const data = {
        sourceFile: parameters.sourceFile,
        targetFile: parameters.targetFile
      };
      this.pvs4_api_post('copy_file.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_contact_person(customerID: Number) {
    const userID = this.userdata.id;
    return new Promise((res, rej) => {
      const data = {
        user: userID,
        customer: customerID
      };
      this.pvs4_api_post('get_contact_person.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_set_contact_person(obj: any) {
    console.log('pvs4_set_contact_person():', obj);
    return new Promise((res, rej) => {
      this.pvs4_api_post('set_contact_person.php', obj).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_get_appointment_date(idCustomer: any) {
    const userID = this.userdata.id;
    const licensee = this.userdata.licensee;
    return new Promise((res, rej) => {
      const data = {
        user: userID
        , licensee: licensee
        , idCustomer: idCustomer
      };
      this.pvs4_api_post('get_appointment_date.php', data).then((done: any) => {// return the result
        res(done);
      },
        err => { // return the error
          rej(err);
        });
    });
  }

  pvs4_uploadphp(obj: any) {
    console.log('pvs4_uploadphp():', obj);
    return new Promise((resolve, reject) => {
      const tick = Date.now().toString(16).toUpperCase();
      const url = pvs4_apiURL + 'upload.php' + '?tick=' + tick;
      // obj.append("token",this.userdata.token);
      this.http.post(url, obj).subscribe(res => {
        console.log('pvs4_uploadphp done :', res);
        resolve(res);
      }, (err) => {
        console.log('pvs4_uploadphp err :', err);
        reject(err);
      });    
    });
  }

  isEmpty(str) {
    return (!str || str == null || 0 === str.length);
}

 columnIndex(element: any): number {
  let children = element.parentNode.childNodes;
  let num = 0;
  for (var i = 0; i < children.length; i++) {
      if (children[i] == element) return num;
      if (children[i].nodeType == 1) num++;
  }
  return -1;
}
  /********************************************************************************/

  mysql2view(timestamp, kurz) {
    // function parses mysql datetime string and returns javascript Date object
    // input has to be in this format: 2007-06-05 15:26:02
    const regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
    const parts = timestamp.replace(regex, '$1 $2 $3 $4 $5 $6').split(' ');
    if (kurz) {
      return parts[2] + '.' + parts[1] + '.' + parts[0];
    } else {
      return parts[2] + '.' + parts[1] + '.' + parts[0] + ' ' + parts[3] + ':' + parts[4];
    }
  }

  view2mysql(view) {
    // function parses mysql datetime string and returns javascript Date object
    // input has to be in this format: 2007-06-05 15:26:02
    const parts = view.split('.');
    return parts[2] + '-' + parts[1] + '-' + parts[0];
  }

  mysqlDate2view(date) {
    const parts = date.split('-');
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  }

  mysql2date(timestamp) {
    // function parses mysql datetime string and returns javascript Date object
    // input has to be in this format: 2007-06-05 15:26:02
    const regex = /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
    const parts = timestamp.replace(regex, '$1 $2 $3 $4 $5 $6').split(' ');
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
  }

  date2mysql(dateobj, kurz) {
    let date = new Date();
    if (dateobj) { date = new Date(dateobj); }

    // let mysqlDateTime = date.toISOString().slice(0, 19).replace('T', ' ');
    // if(kurz) let mysqlDateTime = date.toISOString().slice(0, 10);

    let mysqlDateTime = date.getFullYear() + '-' + this.addZero(date.getMonth() + 1) + '-' + this.addZero(date.getDate());
    if (!kurz) {
      mysqlDateTime += ' ' + this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes()) + ':' + this.addZero(date.getSeconds());
    }

    return mysqlDateTime;
  }

  time2mysql(dateobj) {
    let date = new Date();
    if (dateobj) { date = new Date(dateobj); }
    let mysqlTime: any = '';
    if (date.getHours() < 10) { mysqlTime = '0' + date.getHours(); } else { mysqlTime = date.getHours(); }
    if (date.getMinutes() < 10) { mysqlTime += ':0' + date.getMinutes(); } else { mysqlTime += ':' + date.getMinutes(); }
    mysqlTime += ':00';
    return mysqlTime;
  }

  addZero(i) {
    if (i < 10) { i = '0' + i; }
    return i;
  }
}
