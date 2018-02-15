var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tau = 2 * Math.PI;
var _ref = _,
    _random = _ref.random;
var abs = Math.abs,
    max = Math.max,
    sin = Math.sin,
    cos = Math.cos;

var Vector = function () {
  function Vector() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Vector);

    this.x = x;
    this.y = y;
  }

  _createClass(Vector, [{
    key: "clone",
    value: function clone() {
      return new Vector(this.x, this.y);
    }
  }, {
    key: "add",
    value: function add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
  }, {
    key: "mul",
    value: function mul(x) {
      this.x *= x;
      this.y *= x;
      return this;
    }
  }, {
    key: "dist",
    value: function dist(v) {
      var dx = void 0,
          dy = void 0;
      return Math.sqrt((dx = this.x - v.x) * dx, (dy = this.y - v.y) * dy);
    }
  }, {
    key: "norm",
    value: function norm() {
      var r = this.r;
      return new Vector(this.x / r, this.y / r);
    }
  }, {
    key: "r",
    get: function get() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    set: function set(r) {
      var n = this.norm();
      this.x = r * n.x;
      this.y = r * n.y;
      return r;
    }
  }, {
    key: "a",
    get: function get() {
      return Math.atan2(this.y, this.x);
    },
    set: function set(a) {
      var r = this.r;
      this.x = r * cos(a);
      this.y = r * sin(a);
      return a;
    }
  }], [{
    key: "fromPolar",
    value: function fromPolar(r, a) {
      var x = r * cos(a),
          y = r * sin(a);
      return new Vector(x, y);
    }
  }]);

  return Vector;
}();

// canvas' built-in drawing methods have a lot of
// overhead. this buffer class is for optimized
// drawing of pixels with alpha. it works by directly 
// manipulating pixel data and flushing to the canvas
// by calling putImageData


var CanvasBuffer = function () {
  function CanvasBuffer(canvas) {
    _classCallCheck(this, CanvasBuffer);

    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    this.clear();
  }

  _createClass(CanvasBuffer, [{
    key: "clear",
    value: function clear() {
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, this.w, this.h);
      this.buf = this.ctx.getImageData(0, 0, this.w, this.h);
    }

    // draws floating point coordinate pixel
    // similar to antialiasing

  }, {
    key: "drawPixel",
    value: function drawPixel(x, y, c) {
      var fx = ~~x,
          fy = ~~y,
          dx = x - fx,
          dy = y - fy;

      this.drawCell(fx, fy, c, (1 - dx) * (1 - dy));
      this.drawCell(fx + 1, fy, c, dx * (1 - dy));
      this.drawCell(fx, fy + 1, c, (1 - dx) * dy);
      this.drawCell(fx + 1, fy + 1, c, dx * dy);
    }

    // set color of cell with alpha, for drawPixel

  }, {
    key: "drawCell",
    value: function drawCell(x, y, c, a) {
      if (x < 0 || x >= this.w) return;
      if (y < 0 || y >= this.h) return;

      var data = this.buf.data,
          i = 4 * (x + y * this.w),
          r = data[i + 0],
          g = data[i + 1],
          b = data[i + 2];

      a *= c[3];
      r += c[0] * a;
      g += c[1] * a;
      b += c[2] * a;

      // overflow color math so red + red = white
      var ro = max(0, r - 255),
          go = max(0, g - 255),
          bo = max(0, b - 255),
          to = (ro + bo + go) / 3;

      data[i + 0] = r + to;
      data[i + 1] = g + to;
      data[i + 2] = b + to;
    }
  }, {
    key: "flush",
    value: function flush() {
      this.ctx.putImageData(this.buf, 0, 0);
    }
  }]);

  return CanvasBuffer;
}();

var Noise = function () {
  function Noise(w, h, oct) {
    var si = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, Noise);

    this.width = w;
    this.height = h;
    this.octaves = oct;
    this.canvas = Noise.compositeNoise(w, h, oct, si);
    var ctx = this.canvas.getContext('2d');
    this.data = ctx.getImageData(0, 0, w, h).data;
  }

  // create w by h noise


  _createClass(Noise, [{
    key: "getNoise",


    // returns noise value from -1.0 to 1.0
    value: function getNoise(x, y) {
      var ch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      // bitwise ~~ to floor
      var i = (~~x + ~~y * this.width) * 4;
      return this.data[i + ch] / 127.5 - 1;
    }
  }], [{
    key: "noise",
    value: function noise(w, h) {
      var cv = document.createElement('canvas'),
          ctx = cv.getContext('2d');

      cv.width = w;
      cv.height = h;

      var img = ctx.getImageData(0, 0, w, h),
          data = img.data;

      for (var i = 0, l = data.length; i < l; i += 4) {
        data[i + 0] = _random(0, 255);
        data[i + 1] = _random(0, 255);
        data[i + 2] = _random(0, 255);
        data[i + 3] = 255;
      }

      ctx.putImageData(img, 0, 0);
      return cv;
    }

    // create composite noise with multiple octaves

  }, {
    key: "compositeNoise",
    value: function compositeNoise(w, h, soct, eoct) {
      var cv = document.createElement('canvas'),
          ctx = cv.getContext('2d');

      cv.width = w;
      cv.height = h;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1 / (eoct - soct);

      for (var i = soct; i < eoct; i++) {
        var _noise = Noise.noise(w >> i, h >> i);
        ctx.drawImage(_noise, 0, 0, w, h);
      }

      return cv;
    }
  }]);

  return Noise;
}();

var Particle = function () {
  function Particle() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var vx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var vy = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, Particle);

    this.pos = new Vector(x, y);
    this.vel = new Vector(vx, vy);
    this.acc = new Vector(0, 0);
    this.col = [127, 255, 0, 0.1];
  }

  _createClass(Particle, [{
    key: "update",
    value: function update(noise) {
      var _pos = this.pos,
          x = _pos.x,
          y = _pos.y;

      var dx = noise.getNoise(x, y, 0),
          dy = noise.getNoise(x, y, 1),
          d = new Vector(dx, dy);

      this.col[3] *= 0.99;

      // this.vel.add(this.acc)
      // this.acc.add(d.mul(0.1))
      // this.acc.mul(0.95)
      this.vel.add(d);
      this.vel.mul(0.95);
    }
  }]);

  return Particle;
}();

var ParticleSystem = function () {
  function ParticleSystem(num, noise) {
    _classCallCheck(this, ParticleSystem);

    this.noise = noise;
    this.particles = [];

    for (var i = 0; i < num; i++) {
      this.particles.push(new Particle());
    }

    var r = h / 2 * (5 / 6);

    // this.random()
    // this.circle(r)
    // this.star(r)
    this.polygon(r, 3);
    // this.fn(x => (random() ? -1 : 1) * abs(x), [-w / 2, w / 2])
    this.rainbowify();
  }

  _createClass(ParticleSystem, [{
    key: "circle",
    value: function circle(radius) {
      var thickness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.particles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var p = _step.value;

          // get random radius and angle
          var r1 = radius + thickness * _random(-0.5, 0.5),
              a1 = _random(0, tau),
              r2 = _random(0, 1, true),
              a2 = _random(0, tau);

          var pos = Vector.fromPolar(r1, a1),
              vel = Vector.fromPolar(-3, a1);

          pos.add(new Vector(w / 2, h / 2));

          p.pos = pos;
          p.vel = vel;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "polygon",
    value: function polygon(radius, sides) {
      // calculate lines of polygon
      var lines = [];
      for (var i = 0; i < sides; i++) {
        var a = i * tau / sides - tau / 4,
            x1 = radius * cos(a),
            y1 = radius * sin(a),
            x2 = radius * cos(a + tau / sides),
            y2 = radius * sin(a + tau / sides);
        lines.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
      }

      var yd = (abs(lines[0].y1) - abs(lines[sides >> 1].y1)) / 2;

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.particles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var p = _step2.value;

          // choose random line
          var _lines$_random = lines[_random(0, sides - 1)],
              _x10 = _lines$_random.x1,
              _x11 = _lines$_random.x2,
              _y = _lines$_random.y1,
              _y2 = _lines$_random.y2;
          // lerp between points


          var t = _random(0, 1, true),
              x = _x10 + t * (_x11 - _x10),
              y = _y + t * (_y2 - _y);

          var pos = new Vector(x, y),
              vel = pos.norm().mul(2);

          // center on canvas
          pos.add(new Vector(w / 2, h / 2 + yd));

          p.pos = pos;
          p.vel = vel;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: "star",
    value: function star(radius) {
      // calculate lines of star
      var lines = [];
      for (var i = 0; i < 5; i++) {
        var a = i * tau / 5 - tau / 4,
            x1 = radius * cos(a),
            y1 = radius * sin(a),
            x2 = radius * cos(a + tau * 2 / 5),
            y2 = radius * sin(a + tau * 2 / 5);
        lines.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
      }

      // centering factor
      var yd = (abs(lines[0].y1) - abs(lines[2].y1)) / 2;

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.particles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var p = _step3.value;

          // choose random line 
          var _lines$_random2 = lines[_random(0, 4)],
              _x12 = _lines$_random2.x1,
              _x13 = _lines$_random2.x2,
              _y3 = _lines$_random2.y1,
              _y4 = _lines$_random2.y2;

          // magic number is tip to valley on star


          var t = _random(0, 0.381966011250105);
          if (_random(0, 1)) t = 1 - t;

          // lerp between points
          var x = _x12 + t * (_x13 - _x12),
              y = _y3 + t * (_y4 - _y3);

          var pos = new Vector(x, y),
              vel = pos.norm().mul(2);

          // center on canvas
          pos.add(new Vector(w / 2, h / 2 + yd));

          p.pos = pos;
          p.vel = vel;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "fn",
    value: function fn(_fn, domain) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.particles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var p = _step4.value;

          var x = _random.apply(undefined, _toConsumableArray(domain).concat([1])),
              y = _fn(x),
              t = (x + domain[0]) / (domain[1] - domain[0]),
              rgb = hsl2rgb(t, 1, 0.5);

          var pos = new Vector(x, y),
              vel = pos.norm().mul(2);

          pos.add(new Vector(w / 2, h / 2));
          rgb.push(p.col[3]);

          p.col = rgb;
          p.pos = pos;
          p.vel = vel;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: "random",
    value: function random() {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.particles[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var p = _step5.value;

          var x = _random(0, w, true),
              y = _random(0, h, true);
          p.pos = new Vector(x, y);
          // p.vel = Vector.fromPolar(5, random(0, tau))
          // p.vel = new Vector(0, 0)
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: "freeze",
    value: function freeze() {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.particles[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var p = _step6.value;

          p.vel.mul(0);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: "update",
    value: function update() {
      var n = 4;

      // break up into n steps to make smooth lines
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.particles[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var p = _step7.value;

          p.update(this.noise);
          var step = p.vel.clone().mul(1 / n);
          for (var i = 0; i < n; i++) {
            cbuf.drawPixel(p.pos.x, p.pos.y, p.col);
            p.pos.add(step);
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      cbuf.flush();
    }
  }, {
    key: "rainbowify",
    value: function rainbowify() {
      var oa = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.particles[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var p = _step8.value;

          var c = p.pos.clone().add(new Vector(-w / 2, -h / 2)),
              a = (c.a + tau / 4 + oa) / tau,
              rgb = hsl2rgb(a, 1, 0.5);

          rgb.push(p.col[3]);
          p.col = rgb;
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  }]);

  return ParticleSystem;
}();

function init() {
  frame = 0;
  noise = new Noise(w, h, 5, 8);
  system = new ParticleSystem(15000, noise);
  // uncomment this and re-run to see noise texture
  // document.body.appendChild(noise.canvas)

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  cbuf.clear();
  animate();
}

// click once to pause, twice to regen
function generate() {
  if (rid) {
    window.cancelAnimationFrame(rid);
    rid = 0;
  } else {
    init();
  }
}

function animate() {
  frame++;
  system.update();

  if (frame < 300) rid = window.requestAnimationFrame(animate);else rid = false;
}

function save() {
  var data = cv.toDataURL();
  window.open(data);
}

// round dpr to nearest 0.5
var dpr = 2,
    //Math.round(devicePixelRatio * 2) * 0.5,
w = innerWidth * dpr,
    h = innerHeight * dpr,
    noise = void 0,
    system = void 0,
    rid = void 0,
    frame = void 0,
    cv = document.createElement('canvas'),
    ctx = cv.getContext('2d');

// w = 2880
// h = 1800

cv.width = w;
cv.height = h;

var cbuf = new CanvasBuffer(cv);

document.body.appendChild(cv);
cv.addEventListener('click', generate);

document.addEventListener('keypress', function (e) {
  // alert(e.which)
  if (e.which == 115) save();
});

init();