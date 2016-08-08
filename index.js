//Import dependencies
var fs = require('fs');
var pstat = require('pstat');

//Define the default read chunk
var readChunk = 1024;

//Define the line break
var endl = 0x0a;

//Read line from file
function readl(fd, position)
{
  //Create the buffer
  var buff = new Buffer(readChunk);

  //Get the chunk
  var bytesRead = fs.readSync(fd, buff, 0, readChunk, start);

  //Check the length
  if(bytesRead === 0){ return false; }

  //Get the line end
  var index = buff.indexOf(endl);

  //Slice the buffer
  buff = (index === -1) ? buff.slice(0, bytesRead) : buff.slice(0, index);

  //Return the buffer
  return buff;
}

//Exports to node
module.exports = function(file, opt, callback)
{
  //Check the file
  if(typeof file !== 'string'){ return new Error('Undefined file name'); }

  //Check for no options
  if(typeof opt === 'undefined'){ return new Error('Undefined callback function'); }

  //Check the options
  if(typeof opt === 'function'){ var callback = opt; opt = {}; }

  //Check the options
  if(typeof opt === 'string'){ opt = { encoding: opt }; }

  //Check the encoding option
  if(typeof opt.encoding === 'undefined'){ opt.encoding = 'utf8'; }

  //Check the empty line option
  if(typeof opt.emptyLines === 'undefined'){ opt.emptyLines = true; }

  //Check for no options
  if(typeof callback === 'undefined'){ return new Error('Undefined callback function'); }

  //Check if file exists
  if(pstat.isFileSync(file) === false){ return new Error('File not found'); } 

  //Open the file
  var fd = fs.openSync(file, 'r');

  //Actual position
  var position = 0;

  //Line count
  var count = 0;

  //Read all the lines
  while(true)
  {
    //Get the line
    var line = readl(fd, position);

    //Check for exit
    if(line === false){ break; }

    //Convert the line to utf8
    line = line.toString(opt.encoding);

    //Check for empty line
    if(line.replace(/\s/g, '') === '' && opt.emptyLines === false){ continue; }

    //Do the callback
    var next = callback(line, count);

    //Check the next
    if(typeof next === 'undefined'){ var next = true; }

    //Check for breaking the loop
    if(next === false){ break; }

    //Increment the line counter
    count = count + 1;

    //Increment the position
    position = position + line.length + 1;
  }

  //Exit
  return;
};
