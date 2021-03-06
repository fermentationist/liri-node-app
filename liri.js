const keys = require("./keys.js");
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const request = require("request");
const fs = require("file-system");
const spotifyID = keys.spotifyKeys.clientID;
const spotifySecret = keys.spotifyKeys.clientSecret;
const inquirer = require("inquirer");
const fileName = "liri-log-" + Date.now() + ".txt";
let command = process.argv[2] || "";
let args = process.argv.slice(3).join(" ");
var toFile = false;
//clears console
process.stdout.write('\033c');

//call main menu
menu();


function menu() {
	const commands = ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says", "toggle print to file", "exit"];
	let chosenCommand = "";
	const inquiry = [{
		type: "list",
		message: "Select a command:",
		choices: commands,
		name: "choice"
	}];
	inquirer.prompt(inquiry)
		.then(function(answer) {
			chosenCommand = answer.choice;
			if (chosenCommand === "exit") {
				return exit();
			}
			if (chosenCommand === "toggle print to file"){
				process.stdout.write('\033c');
				toFile = !toFile;
				console.log ("print to file =", toFile, "\n");
				return menu();
			}  
			inquirer.prompt({
				type: "input",
				message: "Enter optional arguments:",
				name: "args"
			}).then(function(answer) {
				process.stdout.write('\033c');
				switch (chosenCommand) {
					case "my-tweets":
						return myTweets(answer.args);
					case "spotify-this-song":
						return spotifyThisSong(answer.args);
					case "movie-this":
						return movieThis(answer.args);
					case "do-what-it-says":
						return doWhatItSays(answer.args);
					default:
						return menu();
				}
			});
		});
}


function exit() {
	process.stdout.write('\033c');
	console.log("goodbye...");
	setTimeout(function() {
		running = false;
		return process.stdout.write('\033c');
	}, 1500);

}

// console.log (command, args);

// switch (command.toLowerCase()){
// 	case "my-tweets":
// 		return myTweets(args);
// 	case "spotify-this-song":
// 		return spotifyThisSong(args);
// 	case "movie-this":
// 		return movieThis(args);
// 	case "do-what-it-says":
// 		return doWhatItSays(args);
// 	default: 
// 		console.log("\nInvalid input. \nAvailable commands: my-tweets, spotify-this-song, \nmovie-this, do-what-it-says\n");
// 		return //something something//wait for new input
// }


function myTweets(args) {
	var twitter = new Twitter({
		consumer_key: keys.twitterKeys.consumer_key,
		consumer_secret: keys.twitterKeys.consumer_secret,
		access_token_key: keys.twitterKeys.access_token_key,
		access_token_secret: keys.twitterKeys.access_token_secret
	})
	let screenName = args || "@StephenAtHome";
	let params = { screen_name: screenName, count: 20 }
	twitter.get('statuses/user_timeline', params, function(error, tweets, response) {
		if (error) {
			throw error;
		}
		for (let i = 0; i < tweets.length; i++) {
			let created_at = tweets[i].created_at;
			let text = tweets[i].text;
			let tweet = { time: created_at, tweet: text }
			displayResults(tweet, i + 1, toFile);
		}
		return menu();
	})
}


function spotifyThisSong(args) {
	const songName = args || "We're Desperate";
	var spotify = new Spotify({
		id: spotifyID,
		secret: spotifySecret
	});
	spotify.search({ type: 'track', query: songName, limit: 1 }, function(err, data) {
		if (err) {
			console.log('Error occurred: ' + err);
			return menu();
		}
		let results = data.tracks.items[0];
		let artist = results.artists[0].name;
		let name = results.name;
		let preview_url = results.preview_url;
		let album = results.album.name;
		let trackInfo = { name: name, artist: artist, album: album, preview_link: preview_url };
		displayResults(trackInfo, "Spotify results", toFile);
		return menu();
	});
}


function doWhatItSays(args) {
	fs.readFile("./random.txt", "utf8", function(error, content) {
		if (error) {
			console.log("error", error);
		}
		let argArray = content.split(",");
		let command = argArray[0];
		let args = argArray[1];
		console.log(command, args);
		switch (command.toLowerCase()) {
			case "my-tweets":
				return myTweets(args);
			case "spotify-this-song":
				return spotifyThisSong(args);
			case "movie-this":
				return movieThis(args);
			case "do-what-it-says":
				return doWhatItSays(args);
			default:
				console.log("\nInvalid input. \nAvailable commands: my-tweets, spotify-this-song, \nmovie-this, do-what-it-says\n");
				return menu()
		}
	})
}


function movieThis(args) {
	const searchTerm = args || "The Room";
	const omdbKey = keys.omdbKey;
	let queryUrl = "http://www.omdbapi.com/?apikey=" + omdbKey + "&s=" + searchTerm;
	request(queryUrl, function(error, response, body) {
		if (error) {
			console.log("error", error);
		}
		let bodyObj = JSON.parse(body);
		let results = bodyObj.Search[0];
		let imdbID = results.imdbID;
		let url = "http://www.omdbapi.com/?apikey=" + omdbKey + "&i=" + imdbID;
		request(url, function(error, response, body) {
			if (error) {
				console.log("error", error);
			}
			let movieData = JSON.parse(body);
			let title = movieData.Title;
			let year = movieData.Year;
			let imdbRating = movieData.imdbRating;
			let rottenRating = "not listed";
			let country = movieData.Country;
			let language = movieData.Language + "\n";
			let plot = movieData.Plot + "\n";
			let actors = movieData.Actors;
			movieData.Ratings.forEach(function(rating) {
				if (rating.Source === "Rotten Tomatoes") {
					rottenRating = rating.Value;
				}
			});
			let movieInfo = {
				Title: title,
				Year: year,
				IMDB_Rating: imdbRating,
				Rotten_Tomatoes_Rating: rottenRating,
				Country: country,
				Language: language,
				Plot: plot,
				Actors: actors
			};
			displayResults(movieInfo, "OMDB Results", toFile);
			return menu();

		});
	});
}


// function displayResultsOld(obj, heading = "") {
// 	console.log("\n=========================")
// 	console.log(heading + "\n");
// 	for (prop in obj) {
// 		console.log(prop, ":", obj[prop]);
// 	}
// 	console.log("=========================\n")
// }


function displayResults(obj, heading = "", toFile) {
	console.log('displayResults called and toFile = ', toFile);
	let headStr = ("\n=========================\n" + heading + "\n");
	if (toFile){
		fs.appendFile(fileName, headStr)
	}
	console.log(headStr);
	for (prop in obj) {
		let line = (prop + " : " + obj[prop]);
		if (toFile){
			fs.appendFile(fileName, line + "\n");
		}
		console.log(line);
	}
	const endStr = "=========================\n";
	if (toFile){
			fs.appendFile(fileName, endStr);
	}
	return console.log(endStr);
}

















