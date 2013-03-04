// Generated by CoffeeScript 1.4.0
(function() {
  var Base, Keyboard, Program, Ui, fs, program,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  program = require('commander');

  Ui = require('./Ui').Ui;

  Base = require('./Base').Base;

  Keyboard = require('./Keyboard').Keyboard;

  Program = (function(_super) {

    __extends(Program, _super);

    function Program(options) {
      var _base, _ref;
      this.options = options != null ? options : {};
      this.run = __bind(this.run, this);

      this.close = __bind(this.close, this);

      this.setupHandlers = __bind(this.setupHandlers, this);

      this.initUi = __bind(this.initUi, this);

      this.initKeyboard = __bind(this.initKeyboard, this);

      this.initFreebox = __bind(this.initFreebox, this);

      this.parseOptions = __bind(this.parseOptions, this);

      this.initCommander = __bind(this.initCommander, this);

      if ((_ref = (_base = this.options).name) == null) {
        _base.name = 'freebox-remote-keyboard';
      }
      this.initCommander();
      return this;
    }

    Program.prototype.initCommander = function() {
      program.name = this.options.name;
      return program.version(Program.getVersion()).usage('--code=xxxx').option('-v, --verbose', 'verbose').option('-d, --debug', 'debug').option('-c, --code <code>', 'remote code').option('-s, --host <host>', 'hostname/ip', 'hd1.freebox.fr').option('-p, --port <port>', 'port', 80);
    };

    Program.prototype.parseOptions = function() {
      var key, _base, _i, _len, _ref, _ref1;
      program.parse(process.argv);
      _ref = ['code', 'verbose', 'debug', 'port', 'host', 'name'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        if ((_ref1 = (_base = this.options)[key]) == null) {
          _base[key] = program[key];
        }
      }
      if (this.options.code == null) {
        console.error("You must specify a code");
        program.help();
        return process.exit(1);
      }
    };

    Program.prototype.initFreebox = function(fn) {
      var Remote;
      if (fn == null) {
        fn = null;
      }
      Remote = require('freebox-player').Remote;
      this.remote = new Remote({
        host: this.options.host,
        port: this.options.port,
        verbose: this.options.debug,
        code: this.options.code
      });
      return fn(false, {});
    };

    Program.prototype.initKeyboard = function(fn) {
      if (fn == null) {
        fn = null;
      }
      this.keyboard = new Keyboard(this.options);
      this.keyboard.start();
      if (fn) {
        return fn(false);
      }
    };

    Program.prototype.initUi = function(fn) {
      if (fn == null) {
        fn = null;
      }
      this.ui = new Ui(this.options);
      this.ui.start();
      if (fn) {
        return fn(false);
      }
    };

    Program.prototype.setupHandlers = function() {
      var _this = this;
      this.ui.on('input', function(human, c, i) {
        return _this.keyboard.emit('input', human, c, i);
      });
      this.ui.on('quit', function() {
        return _this.close();
      });
      this.keyboard.on('quit', function() {
        return _this.close();
      });
      this.keyboard.on('apiSendInput', function(method, args) {
        if (args == null) {
          args = null;
        }
        return _this.remote.press(method, function(err, data) {});
      });
      return this.keyboard.on('unknownInput', function(c, i) {
        return _this.log("Unknown input", c, i);
      });
    };

    Program.prototype.close = function(reason) {
      if (reason == null) {
        reason = '';
      }
      console.log(reason ? "Exiting (" + reason + ")" : "closing");
      if (this.ui) {
        this.ui.close();
      }
      return process.exit(1);
    };

    Program.prototype.run = function() {
      var _this = this;
      this.parseOptions();
      return this.initFreebox(function(err, reason) {
        if (reason == null) {
          reason = null;
        }
        if (err) {
          return _this.close(reason);
        }
        return _this.initUi(function(err, reason) {
          if (reason == null) {
            reason = null;
          }
          if (err) {
            return _this.close(reason);
          }
          return _this.initKeyboard(function(err, reason) {
            if (reason == null) {
              reason = null;
            }
            if (err) {
              return _this.close(reason);
            }
            return _this.setupHandlers();
          });
        });
      });
    };

    Program.getVersion = function() {
      return JSON.parse(fs.readFileSync("" + __dirname + "/../package.json", 'utf8')).version;
    };

    Program.create = function(options) {
      if (options == null) {
        options = {};
      }
      return new Program(options);
    };

    Program.run = function() {
      return (Program.create()).run();
    };

    return Program;

  })(Base);

  module.exports = {
    Program: Program,
    run: Program.run,
    create: Program.create,
    getVersion: Program.getVersion
  };

}).call(this);