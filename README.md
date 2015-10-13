
# Tabloro

Your game table in the browser. Play <strong>any</strong> board or card game with friends & family.

Tabloro runs on your mac, pc, tablet, or smartphone. Every game session is saved online. Every move can be replayed or rewinded any time. ( TODO )

Built in private <a href="http://iswebrtcreadyyet.com/" target="_blank" class="text-default" ><u>peer to peer</u></a> video & audio chat in the browser.

Scan & upload your own board game tiles, share the link and start playing with friends & family.

---


Built with nodejs, express, mongodb, eureca, http://phaser.io and http://peerjs.com/ for peer2peer video&audio chat

Based on madhums <a href="https://github.com/madhums/node-express-mongoose-demo">express demo</a>, look there for **setup** instructions

Using functional programming concepts in many areas. Instead of classes i have used namespaces like *T* for Tile which is a bunch of functions that apply Tile like functionality to objects, e.g. *T.onFlip*. Or e.g. *Dice* as in *Dice.spin* for dice-like functionality. These functions can be mixed and matched to add functionality to game objects. They are really just namespaces, not instances of classes.

<a href="http://ramdajs.com/">Ramda</a> is used throughout as functional toolkit. Its a little bit cleaner than underscore or lo-dash, but thats also a matter of taste.

<img src="http://www.tabloro.com/img/meta.jpg"></img>

