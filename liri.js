const keys = require("./keys.js");
const twitter = require("twitter");
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
	return console.log("myTweets", args);
}

function spotifyThisSong(args){

	var spotify = new Spotify ({
		id: spotifyID,
		secret: spotifySecret
	});

	spotify.search({ type: 'track', query: args, limit: 20}, function(err, data) {
  		if (err) {
    		return console.log('Error occurred: ' + err);
  		}
		console.log("\n", data.tracks); 
	});
	return;// console.log("spotifyThisSong", args);
}

function doWhatItSays(args){
	return console.log("doWhatItSays", args);
}

function movieThis(args){
	return console.log("movieThis", args);
}
