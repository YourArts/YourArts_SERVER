'use strict';

const request = require('request');

const userModel = require('../models/UserModel');
const config = require('../config/config');
const resMsg = require('../errors.json');


/*******************
 *  Register
 ********************/
exports.register = async(req, res, next) => {
  let pw;
  if (req.body.pw1 !== req.body.pw2) {
    return res.status(400).json(resMsg[1404])
  } else {
    pw = req.body.pw1
  }

  let result = '';
  try {
    const userData = {
      id: req.body.id,
      pw: config.do_cipher(pw),
      nickname: req.body.nickname,

    };

    result = await userModel.register(userData);

  } catch (error) {
    // TODO 에러 잡았을때 응답메세지, 응답코드 수정할것
    //   if (isNaN(error)) {
    //     // console.log(error);
    //     return res.status(500).json(resMsg[9500]);
    //   } else {
    //     console.log(error);
    //     return res.status(400).json(resMsg[8400]);
    //   }
    console.log(error);
    return next(error)
  }
  //jjj
  ///qqq

  // success
  return res.status(201).json({
    "status": true,
    "message": "success",
    "result" : result[0]
  });
};

//TODO 토큰받아올때 예외처리 추가할 것!!!
exports.fbRegister = async(req, res, next) => {
  const data = {
    access_token : req.body.access_token
  };

  let userData = {};
  let result ;

  const uri = {
    method:'GET',
    uri:'https://graph.facebook.com/v2.10/me?access_token='+data.access_token+'&fileds=id,name'
  };

  function option(error, response, body){
    if(error){
      throw error;
    }

    userData = JSON.parse(body);

    cb(userData);
  }

  async function cb(data){

    try {
      userData.id = data.id;
      userData.name = data.name;

      result = await userModel.fbRegister(userData);


    } catch (error) {
      console.log(error);
      return next(error);
    }

    return res.r(result)

  }
  request(uri, option, cb);






};

exports.check = async(req, res, next) => {
  let result = '';
  try {
    const userData = req.body.id;
    result = await userModel.check(userData);
  } catch (error) {
    // console.log(error); // 1401
    if (isNaN(error)) {
      // console.log(error);
      return res.status(500).json(resMsg[9500]);
    } else {
      // console.log(error);
      return res.status(409).json(resMsg[1401]);
    }
  }

  // FIXME 리턴값 수정하기
  return res.status(200).json(result);

};

/*******************
 *  Login
 ********************/
exports.login = async(req, res, next) => {

  if (!req.body.id || !req.body.pw) {
    return res.status(400).end();
  }

  let result = '';

  try {
    const userData = {
      id: req.body.id,
      pw: config.do_cipher(req.body.pw)
    };

    result = await userModel.login(userData);
  } catch (error) {
    return next(error);
  }

  // success
  // return res.json({
  //   "status": true,
  //   "message": "success",
  //   "result": result
  // });
  return res.r(result);
};

exports.fbLogin = async(req, res,next) => {
  const data = {
    access_token : req.body.access_token
  };

  let userData = {};
  let result ='';
  const uri = {
    method:'GET',
    uri:'https://graph.facebook.com/v2.10/me?access_token='+data.access_token+'&fileds=id,name'
  };

  function option(error, response, body){
    if(error){
      throw error;
    }

    userData = JSON.parse(body);

    cb(userData);
  }

  async function cb(data){

    try {
      userData.id = data.id;
      userData.name = data.name;

      result = await userModel.fbLogin(userData);


    } catch (error) {
      console.log(error);
      return next(error);
    }

    return res.r(result)

  }
  request(uri, option, cb);

};


exports.profile = async(req, res, next) => {
  let result ='';
  try {
    const userData = req.user_idx;

    result = await userModel.profile(userData)

  } catch (error) {
    console.log(error);
    return next(error)
  }
  return res.json(result);
};
