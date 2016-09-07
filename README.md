#beam-basic-sounds

A basic soundboard, requires a number of votes before a sound.

# Use
1. Create a game at beam.pro/lab .
1. Ensure frequency analysis is checked for each button
1. Set spark cost, cooldown and name to your specifications.
1. Clone/Download zip
1. npm install in project root
1. [Get A Token](interactive.beam.pro/request)
1. Edit the default config file, paste in your token.
1. Dump sound files in sounds/
1. for each sound add an object to the sounds array in the config file, see sample below
1. `node index.js` to start

## Sample Sound Config
```
{
	"file":"congratulations.mp3",
	"id":0,
	"votesRequired":10,
	"cooldown":60000
}
```
- id: button id from the developer lab game
- file: file name for the sound to play, local to the sounds directory, don't include any '/'s.
- votesRequired: how many votes before this is triggered
- cooldown: how long should the cooldown be after this button is triggered

# Troubleshooting
Sound playback only tested on win64.

