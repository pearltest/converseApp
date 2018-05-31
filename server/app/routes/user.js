const router = require('express').Router();
const passport = require('passport');
const User = require('../../model/user');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const each = require ('lodash/filter');
const _ = require('underscore');


// List all users:
router.get('/:list', (req, res, next) => {
  let limit = parseInt(req.query.limit);
  let offset = 0;
  User.findAndCountAll()
  .then((data) => {
    let page = parseInt(req.query.page);
    let pages = Math.ceil(data.count / limit);
		offset = limit * (page - 1);
    User.findAll({
      where:{
        TUSER_User_Name: {
          $like: '%' + req.query.search + '%'
        }
      },
      attributes: ['TUser_UID', 'TUSER_User_Name', 'TUser_Image'],
      limit: limit,
      offset: offset,
      $sort: { TUser_UID: 1 }
    })
    .then((users) => {

      let filterCurrentUser = _.filter(users, function(currentObject) {
        return currentObject.TUser_UID != req.query.userId;
      });

      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        data: filterCurrentUser,
        count: data.count,
        pages: pages
      });
    });
  })
  .catch(next);
});

function failureHandler(data, res){
  res.setHeader("statusCode", 400);
  res.status(400).json({
    status: "Failed",
    statusCode: 400,
    data: data
  });
}

function successHandler(data, res){
	res.setHeader("statusCode", 200);
	res.status(200).json({
		status: "Success",
		statusCode: 200,
		data: data
	});
}

module.exports = router;
