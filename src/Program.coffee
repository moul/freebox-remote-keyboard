fs         = require 'fs'
program    = require 'commander'
{Ui}       = require './Ui'
{Base}     = require './Base'
{Keyboard} = require './Keyboard'

class Program extends Base
  constructor: (@options = {}) ->
    @options.name   ?= 'freebox-remote-keyboard'
    do @initCommander
    return @

  initCommander: =>
    program.name = @options.name
    program
      .version(do Program.getVersion)
      .usage('--code=xxxx')
      .option('-v, --verbose',             'verbose')
      .option('-d, --debug',               'debug')
      .option('-c, --code <code>',         'remote code')
      .option('-s, --host <host>',         'hostname/ip',        'hd1.freebox.fr')
      .option('-p, --port <port>',         'port',               80)

  parseOptions: =>
    program.parse process.argv
    @options[key] ?= program[key] for key in ['code', 'verbose', 'debug', 'port', 'host', 'name']
    unless @options.code?
      console.error "You must specify a code"
      do program.help
      process.exit 1

  initFreebox: (fn = null) =>
    {Remote} = require 'freebox-player'
    @remote = new Remote
      host:       @options.host
      port:       @options.port
      verbose:    @options.debug
      code:       @options.code
    # TODO: check if everything is OK
    fn false, {}

  initKeyboard: (fn = null) =>
    @keyboard = new Keyboard @options
    do @keyboard.start
    fn false if fn

  initUi: (fn = null) =>
    @ui = new Ui @options
    do @ui.start
    fn false if fn

  setupHandlers: =>
    @ui.on 'input', (human, c, i) =>
      @keyboard.emit 'input', human, c, i

    @ui.on 'quit', =>
      do @close

    @keyboard.on 'quit', =>
      do @close

    @keyboard.on 'apiSendInput', (method, args = null) =>
      @remote.press method, (err, data) =>

    @keyboard.on 'unknownInput', (c, i) =>
      @log "Unknown input", c, i

  close: (reason = '') =>
    console.log if reason then "Exiting (#{reason})" else "closing"
    do @ui.close if @ui
    process.exit 1

  run: =>
    do @parseOptions
    @initFreebox (err, reason = null) =>
      return @close reason if err
      @initUi (err, reason = null) =>
        return @close reason if err
        @initKeyboard (err, reason = null) =>
          return @close reason if err
          do @setupHandlers

  @getVersion: -> JSON.parse(fs.readFileSync "#{__dirname}/../package.json", 'utf8').version

  @create: (options = {}) -> new Program options

  @run: -> do (do Program.create).run

module.exports =
  Program:    Program
  run:        Program.run
  create:     Program.create
  getVersion: Program.getVersion
