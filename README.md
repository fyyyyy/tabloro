
#  <a href="http://www.tabloro.com/" target="_blank" class="tabloro" >Tabloro.com</a>

Your game table in the browser. Play <strong>any</strong> board or card game with friends & family.

Tabloro runs on your mac, pc, tablet, or smartphone. Every game session is saved online. Every move can be replayed or rewinded any time. ( TODO )

Built in private <a href="http://iswebrtcreadyyet.com/" target="_blank" class="text-default" ><u>peer to peer</u></a> video & audio chat in the browser.

Scan & upload your own board game tiles, share the link and start playing with friends & family.

**NEW March 2020:** Simple Server branch perfect for you and your friends - uses local storage instead of AWS and updated to work with node 10  (plenty of deprecated warnings remain though).
~See simpleserver_setup_notes.txt ~

---


Built with nodejs, express, mongodb, eureca, http://phaser.io and http://peerjs.com/ for peer2peer video&audio chat

Based on madhums <a href="https://github.com/madhums/node-express-mongoose-demo">express demo</a>, look there for **setup** instructions
More detailed instructions for setup specifically for the simpleserver branch can be found in **simpleserver_setup_notes.txt**

Using functional programming concepts in many areas. Instead of classes i have used namespaces like *T* for Tile which is a bunch of functions that apply Tile like functionality to objects, e.g. *T.onFlip*. Or e.g. *Dice* as in *Dice.spin* for dice-like functionality. These functions can be mixed and matched to add functionality to game objects. They are really just namespaces, not instances of classes.

Released under MIT License https://opensource.org/licenses/MIT

<a href="http://ramdajs.com/">Ramda</a> is used throughout as functional toolkit. Its a little bit cleaner than underscore or lo-dash, but thats also a matter of taste.

<img src="http://www.tabloro.com/img/meta.jpg"></img>




You need to set the env variables for your amazon s3 storage etc.
Please use US-standard region buckets, otherwise there is a bug with middleware

ADMIN_MAIL

test@test.com

IMAGER_S3_BUCKET

e.g. mytabloro

IMAGER_S3_KEY

IMAGER_S3_SECRET

MONGOHQ_URL

e.g. mongodb://heroku_app...

MONGOLAB_URI

e.g. mongodb://heroku_....

NODE_ENV

e.g. production

NODE_PATH

e.g. ./config:./app/controllers:./lib

PORT

e.g. 80

