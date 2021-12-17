const bcrypt = require("bcrypt");
class Router {
  constructor(app, db) {
    this.login(app, db);
    this.logout(app, db);
    this.isLoggedIn(app, db);
    this.getReviews(app, db);
    this.getMovies(app, db);
    this.getWatchList(app, db);
    this.removeWatchList(app, db);
    this.removeWatchListByID(app, db);
    this.addToWishList(app, db);
    this.getAvgRating(app, db);
    this.getUserMovieRating(app, db);
    this.checkIfOnWishlist(app, db);
  }

  login(app, db) {
    app.post("/api/login", (req, res) => {
      let username = req.body.username;
      let password = req.body.password;
      username = username.toLowerCase();
      if (username && password) {
        let cols = [username];
        db.query(
          "SELECT * FROM users WHERE username=? ",
          [username],
          (err, data, fields) => {
            if (data && data.length > 0) {
              bcrypt.compare(
                password,
                data[0].password,
                (bcryptErr, verified) => {
                  if (verified) {
                    req.session.userID = data[0].id;
                    res.json({
                      success: true,
                      username: data[0].username,
                      userID: data[0].id,
                    });
                    res.end();
                    return;
                  }
                }
              );
            } else {

              res.json({
                success: false,
                msg: "incorrect username or Password",
              });
            }
          }
        );
      }
    });
  }
  logout(app, db) {
    app.post("/api/logout", (req, res) => {
      req.session.destroy();
      res.json({
        success: true,
      });
      return true;
    });
  }

  isLoggedIn(app, db) {
    app.post("/api/isLoggedIn", (req, res) => {
      if (req.body.userID) {
        let cols = [req.body.userID];
        db.query(
          "SELECT * FROM users WHERE id = ? LIMIT 1",
          cols,
          (err, data, fields) => {
            if (data && data.length === 1) {
              res.json({
                success: true,
                username: data[0].username,
              });
              return true;
            } else {
              res.json({
                success: false,
              });
            }
          }
        );
      } else {
        res.json({
          success: false,
        });
      }
    });
  }

  getReviews(app, db) {
    app.post("/api/getReviews", (req, res) => {
      if (req.body.userID) {
        let cols = [req.body.userID];
        db.query(
          "SELECT * FROM reviews INNER JOIN movies ON reviews.movieID=movies.id WHERE UserID=?; ",
          cols,
          (err, data, fields) => {
            if (data && data.length > 0) {
              res.json({
                success: true,
                data: data,
              });
              return true;
            } else {
              res.json({
                success: false,
              });
            }
          }
        );
      } else {
        res.json({
          success: false,
        });
      }
    });
  }

  getMovies(app, db) {
    app.get("/api/getMovies", (req, res) => {
      db.query("SELECT * FROM movies ORDER BY `movies`.`release date` DESC ", (err, data, fields) => {
        res.json({
          data: data,
        });
        res.end();
      });
    });
  }

  getWatchList(app, db) {
    app.post("/api/getWatchList", (req, res) => {
      let cols = [req.body.userID];
      db.query(
        "select watchlist.MovieID, movies.title, movies.url FROM watchlist inner JOIN movies on watchlist.MovieID=movies.id WHERE UserID=?",
        cols,
        (err, data, fields) => {
          res.json({
            data: data,
          });
        }
      );
    });
  }

  removeWatchList(app, db) {
    app.delete("/api/removeWatchList", (req, res) => {
      let cols = req.body.userID;
      let movieID = req.body.id;
      db.query(
        "DELETE FROM watchlist WHERE MovieID=? AND UserID=?",
        [movieID, cols],
        (err, data, fields) => {
          res.json({
            data: data,
          });
        }
      );
    });
  }

  removeWatchListByID(app, db) {
    app.post("/api/removeWatchListByID", (req, res) => {
      let cols = req.body.userID;
      let movieID = req.body.id;
      db.query(
        "DELETE FROM watchlist WHERE MovieID=? AND UserID=?",
        [movieID, cols],
        (err, data, fields) => {
          res.json({
            data: data,
          });
        }
      );
    });
  }

  addToWishList(app, db) {
    app.put("/api/addToWishList", (req, res) => {
      let cols = [req.body.userID];
      let movieID = [req.body.movieID];
      db.query(
        "INSERT INTO watchlist (`id`, `UserID`, `MovieID`) VALUES (NULL, ?, ?)",
        [cols, movieID],
        (data) => {
          res.json({
            data: data,
          });
        }
      );
    });
  }

  getAvgRating(app, db) {
    app.post("/api/getAvgRating", (req, res) => {
      let movieID = req.body.movieID;

      db.query(
        "select rating from reviews where movieID =?",
        [movieID],
        (err, data, fields) => {
          if (data.length === 0) {
            res.json({
              data: 0,
            });
          } else {
            var total = 0;
            for (let i = 0; i < data.length; i++) {
              total += data[0].rating;
            }
            res.json({
              avgRating: total,
            });
          }
        }
      );
    });
  }

  getUserMovieRating(app, db) {
    app.post("/api/getUserMovieRating", (req, res) => {
      let MovieID = req.body.MovieID;
      let userID = req.body.UserID;
	console.log(MovieID, userID);
      db.query(
        "select rating from reviews where movieID =? and UserID=?",
        [MovieID, userID],

        (err, data, fields) => {
if (data.length === 0) {
            res.json({
              data: 0,
            });
          } else {

          res.json({
            userRating: data[0].rating,
            movieID: MovieID,
          });
}
        }
      );
    });
  }

  checkIfOnWishlist(app, db) {
    app.post("/api/checkIfOnWishlist", (req, res) => {
      let MovieID = req.body.movieID;
      let userID = req.body.userID;
      db.query(
        "select * from watchlist where movieID =? and UserID=?",
        [MovieID, userID],

        (err, data, fields) => {
          console.log(data);
          if (data.length > 0) {
            res.json({
              onList: true,
            });
          } else {
            res.json({
              onList: false,
            });
          }
        }
      );
    });
  }
}
module.exports = Router;
