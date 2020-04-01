import { wrapperTest, HttpClient, Method, validateResponseSuccessfully } from "../../test/helpers";

import { app } from "../src";

wrapperTest(app, (chai) => {

    //const expect = chai.expect;
  
    describe("Nearby Bins", () => {
  
      describe("GET /me/nearbyBins", () => {
        it("Get all nearby bins", (done) => {
          HttpClient(chai.request(app), {
            method: Method.GET,
            path: "/me/nearbyBins"
          }).end((_error, res) => {
            validateResponseSuccessfully(res);
            console.log(res);
            //expect(res.body).to.have.a("array");
            done();
          });
        });
      });
    });
});
// var assert = require('assert');
// var trashBins = require('../handlers/trashBins');

// describe('demo test', function(){
//     it('should throw some errors', function(){
//         try
//         {assert.equal(2,3);
//         }catch(e)
//         {
//             console.log(e);
//         }
//         })
// });
// describe('GET /me/nearbyBins', function() {
//     it('returns a list of tasks', function(done) {
//         trashBins.get('/me/nearbyBins')
//             .expect(200)
//             .end(function(_error, res) {
//                 //expect(res.body).to.have.lengthOf(1);
//                 done();
//                 console.log(res);
//             });
//     });
// });

