const keys = require("./keys.js");
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const request = require("request");
//console.log("Twitter consumer key: ", keys.twitterKeys.consumer_key);
const spotifyID = keys.spotifyKeys.clientID;
const spotifySecret = keys.spotifyKeys.clientSecret;

/*
my-tweets

spotify-this-song

movie-this

do-what-it-says
*/

let command = process.argv[2] || "";
let args = process.argv.slice(3).join(" ");
console.log('args =', args);
console.log('command =', command);

switch (command.toLowerCase()){
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
		return //something something//wait for new input
}

function myTweets(args){

	var twitter = new Twitter({
		consumer_key: keys.twitterKeys.consumer_key,
		consumer_secret: keys.twitterKeys.consumer_secret,
		access_token_key: keys.twitterKeys.access_token_key,
		access_token_secret: keys.twitterKeys.access_token_secret
	})

	let screenName = args || "@StephenAtHome";

	let params = {screen_name: screenName, count: 20}
	twitter.get('statuses/user_timeline', params, function (error, tweets, response){
		if (error){
			throw error;
		}

		for (let i = 0; i < tweets.length ; i ++){
			let created_at = tweets[i].created_at;
			let text = tweets[i].text;
			let tweet = {time: created_at, tweet: text}
			displayResults(tweet, i + 1);
		}


	})
	return console.log("myTweets", args);
}


function spotifyThisSong(args){

	var spotify = new Spotify ({
		id: spotifyID,
		secret: spotifySecret
	});

	spotify.search({ type: 'track', query: args, limit: 1}, function(err, data) {
		if (err) {
			return console.log('Error occurred: ' + err);
		}
		let results = data.tracks.items[0];
		// console.log("\n", results); 
		let artist = results.artists[0].name;
		let name = results.name;
		let preview_url = results.preview_url;
		let album = results.album.name;
		let trackInfo = {name: name, artist: artist, album: album, preview_link: preview_url};
		console.log('trackInfo', trackInfo);
		return displayResults(trackInfo, "Spotify results");
	});
}


function doWhatItSays(args){
	return console.log("doWhatItSays", args);
}


function movieThis(args){
	// * Title of the movie.
	// * Year the movie came out.
	// * IMDB Rating of the movie.
	// * Rotten Tomatoes Rating of the movie.
	// * Country where the movie was produced.
	// * Language of the movie.
	// * Plot of the movie.
	// * Actors in the movie.
	const omdbKey = keys.omdbKey;
	let queryUrl = "http://www.omdbapi.com/?apikey=" + omdbKey + "&s=" + args;
	request (queryUrl, function (error, response, body){
		if (error){
			console.log ("error", error);
		}
		let bodyObj = JSON.parse(body);
		let results = bodyObj.Search[0];
		let imdbID = results.imdbID;
		let url = "http://www.omdbapi.com/?apikey=" + omdbKey + "&i=" + imdbID;
		request (url, function (error, response, body){
			if(error){
				console.log("error", error);
			}
			console.log("body = ", typeof body);
			let movieData = JSON.parse(body);
			console.log('movieData', movieData);
			let title = movieData.Title;
			let year = movieData.Year;
			let imdbRating = movieData.imdbRating;
			let rottenRating = "not listed";
			let country = movieData.Country;
			let language = movieData.Language + "\n";
			let plot = movieData.Plot + "\n";
			let actors = movieData.Actors;
			movieData.Ratings.forEach (function (rating) {
				if (rating.Source === "Rotten Tomatoes") {
					rottenRating = rating.Value;
				}
			});
			let movieInfo = {Title: title, Year: year, IMDB_Rating: imdbRating,
				Rotten_Tomatoes_Rating: rottenRating, Country: country, Language: language,
				Plot: plot, Actors: actors};
			return displayResults(movieInfo, "OMDB Results");

		});
	});
	return console.log ("movieThis", args);
}


function displayResults(obj, heading = ""){
	console.log("\n=========================")
	console.log(heading + "\n");
	for (prop in obj){
		console.log(prop,":", obj[prop]);
	}
	console.log("=========================\n")
}







