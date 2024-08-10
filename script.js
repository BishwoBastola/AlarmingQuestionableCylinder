//Doyle Numerics used to create sprials. You can play with the values to change shapes and colors where noted in below animation section of code.***
// Initialize
var c = document.getElementsByTagName("canvas")[0],
    $ = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

window.addEventListener('resize', function() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }, false)
  // arithmetic
function cmul(w, z) {
  return [
    w[0] * z[0] - w[1] * z[1],
    w[0] * z[1] + w[1] * z[0]
  ];
}

function csub(w, z) {
  return [w[0] - z[0], w[1] - z[1]];
}

function modulus(p) {
  return Math.sqrt(p[0] * p[0] + p[1] * p[1]);
}

function crecip(z) {
  var d = z[0] * z[0] + z[1] * z[1];
  return [z[0] / d, -z[1] / d];
}

function cpow(z, n) {
  var mod = Math.pow(modulus(z), n),
    arg = Math.atan2(z[1], z[0]) * n;
  return [mod * Math.cos(arg), mod * Math.sin(arg)];
}

// Möbius transformation that maps (0, 1, ∞) to (-1, 0, 1)
function transform_point(p) {
  var x = p[0],
    y = p[1];
  var denom = (x + 1) * (x + 1) + y * y;
  return [(x * x - 1 + y * y) / denom, 2 * y / denom];
  }

  // Doyle spiral drawing
  function spiral(r, start_point, delta, gamma, options) {
    var recip_delta = crecip(delta),
      mod_delta = modulus(delta),
      mod_recip_delta = 1 / mod_delta,
      color_index = options.i,
      colors = options.fill,
      min_d = options.min_d,
      max_d = options.max_d,
      delta_gamma = cmul(delta, gamma),
      delta_over_gamma = cmul(delta, crecip(gamma)),
      gamma_over_delta = cmul(gamma, crecip(delta));

    // Spiral inwards
    for (var q = start_point, mod_q = modulus(q); mod_q > min_d; q = cmul(q, recip_delta), mod_q *= mod_recip_delta) {
      color_index = (color_index + colors.length - 1) % colors.length;
    }

    // Spiral outwards
    for (; mod_q < max_d; q = cmul(q, delta), mod_q *= mod_delta, color_index = (color_index + 1) % colors.length) {
      var quad = [transform_point(q)];
      if (modulus(quad[0]) > 10) continue;

      if (color_index == 0)
        quad.push(transform_point(cmul(q, delta_over_gamma)));
      quad.push(transform_point(cmul(q, delta)));
      if (color_index == 2)
        quad.push(transform_point(cmul(q, delta_gamma)));
      quad.push(transform_point(cmul(q, gamma)));
      if (color_index == 1)
        quad.push(transform_point(cmul(q, gamma_over_delta)));

      if (modulus(csub(quad[0], quad[2])) > 5) continue;
      //block outlines (paths)
      $.fillStyle = colors[color_index];
          $.beginPath();
          $.moveTo(quad[0][0], quad[0][1]);
          $.lineTo(quad[1][0], quad[1][1]);
          $.lineTo(quad[2][0], quad[2][1]);
          $.lineTo(quad[3][0], quad[3][1]);
          $.closePath();
          $.fill();
        }
      }

      // Animation
      //p & q values will change the number of morphed squares
      var p = 9,
        q = 36;
      var root = doyle(p, q);

      var ms_per_repeat = 1000;

      function frame(t) {
        $.setTransform(1, 0, 0, 1, 0, 0);
          $.clearRect(0, 0, c.width, c.height);

          $.translate(Math.round(c.width / 2), cy = Math.round(c.height / 2));
          $.scale(400, 400);
          $.rotate(Math.PI / 24);

          var min_d = 1e-4,
            max_d = 1e4;
          var start = cpow(root.a, t);
          for (var i = 0; i < q; i++) {
            spiral(root.r, start, root.a, root.b, {
              //Play with the below values to change //colors and shapes
              fill: ["#423C40", "#FB7374", "#79BFA1"],
              i: (7 * i) % 2,
              min_d: min_d,
              max_d: max_d
            });
            start = cmul(start, root.b);
          }
        }

var first_timestamp;

function loop(timestamp) {
  if (!first_timestamp) first_timestamp = timestamp;
  frame(((timestamp - first_timestamp) % (3 * ms_per_repeat)) / ms_per_repeat);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);