# Capricornus Turn-based Strategy Game

HTML5 browser-based turn-based strategy game (in the style of Advance Wars), written in JavaScript. 


## Dependencies for playing

* Any current desktop browser (Chrome or Firefox recommended, but Safari and Edge will work as well, though sound will not work in Edge)


## Dependencies for development

* Either a local or remote webserver to serve the files, such as Apache or nginx, or follow the directions on how to use Python 2.7 to serve the files
* The `minify.rb` script to minify the JavaScript and CSS source files (this is optional step) requires Ruby 2.3, Sassc and UglifyJS (command line version)


## Known Issues

* Internet Explorer is not supported
* The game is unplayable at mobile screen sizes
* No sound in Microsoft Edge


## Getting Started

* Download or clone this repository
* Configure your webserver to serve the `public_html` directory, or follow the instructions below on how to serve it using Python


## Serving the application using Python on Windows

* Make sure you have Python 2.7 installed in the default directory
* Open the command prompt and `cd` to the public_html directory inside this repository
* Run this command `C:\Python27\python.exe -m SimpleHTTPServer 3000`
* If you get a firewall warning, make sure to approve it
* Open a browser at [localhost:3000](localhost:3000). You should be able to view the site


## Serving the application using Python on Linux/Unix/MacOs (assumes Python 2.7 is already installed)

* `cd` to the public_html directory inside this repository
* Run this command `python -m SimpleHTTPServer 3000`
* Open a browser at [localhost:3000](localhost:3000). You should be able to view the site


## License

Code copyright (c) 2017 Allen Garvey, Kyle Livermore & Stephen Griffin. The art and audio files are copyright of their respective owners and used with permission.