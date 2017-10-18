'use strict';

const mysql = require('mysql');
const DBConfig = require('./../config/DBConfig');
const pool = mysql.createPool(DBConfig);
// const jwt = require('jsonwebtoken');
// const config = require('../config/config');


/*******************
 *  user의콜랙션조회
 *  @param userIdxData
 ********************/
exports.userCollection = (userIdxData) => {
 return new Promise((resolve, reject) =>{
   const sql =
     `
     SELECT
       collection_idx,
       user_idx,
       exhibition_idx,
       collection_content,
       collection_image
     FROM collection
     WHERE user_idx=?;
     `;

   pool.query(sql, userIdxData, (err, rows) => {
     if (err) {
       reject(err);
     } else {
       resolve(rows);
     }
   })
 });
};

/*******************
 *  컬렉션작성
 *  @param collectionData = {user_idx, exhibition_idx, content, image, created}
 ********************/
 exports.collectionPost = (collectionData) => {
  return new Promise((resolve, reject) => {
     const sql = "INSERT INTO collection set ?";

      pool.query(sql, collectionData, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          if (rows.affectedRows === 1) {
            resolve(rows);
          } else {
            const _err = new Error("Collection Post error");
            reject(_err);
          }
        }
      });
    }
  ).then((result) => {
      return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM collection WHERE collection_idx = ?";

        pool.query(sql, result.insertId, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  );
};

/*******************
 *  컬렉션상세조회
 *  @param collectionData = collection_idx
 ********************/
exports.detailCollection = (collectionIdxData) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
        SELECT
          collection_idx,
          user_idx,
          e.exhibition_name,
          collection_content,
          collection_image
        FROM collection AS c
          LEFT JOIN exhibition AS e ON c.exhibition_idx = e.exhibition_idx
        WHERE collection_idx = ?
        `;

    pool.query(sql, collectionIdxData, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0]);
      }
    })
  })
};


//
/*******************
 *  컬렉션수정
 *  @param editData = {user_idx, collection_idx, collection_content}}
 ********************/

exports.editCollection = (editData) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
        SELECT user_idx
        FROM collection
        WHERE collection_idx = ?
      `;
    pool.query(sql, [editData.collection_idx], (err, rows) => {
      if(err){
        reject(err)
      }else{
        if (editData.user_idx !== rows[0].user_idx){
          // 글쓴이인지 확인
          reject(9402)
        } else {
          resolve(null)
        }
      }
    })
  }).then(() => {
    return new Promise((resolve, reject) => {
      const sql =
        `
        UPDATE collection
        SET collection_content= ?
        WHERE collection_idx= ?
        `;
      pool.query(sql, [editData.collection_content, editData.collection_idx], (err, rows) => {
        if(err){
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }).then(() => {
    return new Promise((resolve, reject) => {
      const sql =
        `
        SELECT *
        FROM collection
        WHERE collection_idx=?
        `;

      pool.query(sql, [editData.collection_idx], (err,rows) => {
        if(err){
          reject(err)
        } else {
          resolve(rows)
        }
      })
    });
  });
};


/*******************
 *  컬렉션삭제
 *  @param collectionData = collection_idx
 ********************/
exports.delCollection = (delData) => {
  return new Promise((resolve, reject) => {
    const sql =
      `
        SELECT user_idx
        FROM collection
        WHERE collection_idx = ?
      `;

    pool.query(sql, [delData.collection_idx], (err, rows) => {
      if(err){
        reject(err)
      }else{
        if (delData.user_idx !== rows[0].user_idx){
          // 글쓴이인지 확인
          reject(9402)
        } else {
          resolve(null)
        }
      }
    })
  }).then(() => {
    return new Promise((resolve, reject) => {
      const sql =
        `
        DELETE FROM collection WHERE collection_idx=?
        `;
      pool.query(sql, [delData.collection_idx], (err, rows) => {
        if(err){
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  });
};
