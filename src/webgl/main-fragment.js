module.exports = {mainFragment}

const mainIntersectionFragment = require('./main-intersection-fragment')
const segmentSegmentIntersectsFragment = require('./segment-segment-intersects-fragment')
const segmentSegmentIntersectionFragment = require('./segment-segment-intersection-fragment')
const labelRectangleIntersectionFragment = require('./label-rectangle-intersection-fragment')
const labelSegmentIntersectionFragment = require('./label-segment-intersection-fragment')
const rayRectangleIntersectionFragment = require('./ray-rectangle-intersection-fragment')
const raySegmentIntersectionFragment = require('./ray-segment-intersection-fragment')
function mainFragment (size, numberOfRays) {
  return `
  precision mediump float;
  // we are in clamped mode so we are ok
  float infinity = 1./0.0000001;
  uniform sampler2D u_points_texture;
  uniform sampler2D u_radius_texture;
  uniform sampler2D u_rectangle_texture;
  uniform vec4 u_label_texture;
  uniform vec4 u_rect_point;
  varying vec2 pos;
  float get_index (void) {
    return (pos.x * ${size * 2}. -1.)/2. + ${size}.0 * (pos.y * ${size * 2}. - 1.)/2.;
  }
  vec2 get_rectangle_index (void) {
    return vec2((mod(get_index(), ${numberOfRays}.0) + 0.5) / (${size}.), 1./ ${2 * size}.);
  }
  vec4 read_point (void) {
    return texture2D(u_points_texture, pos);
  }
  vec2 read_radius (void) {
    return texture2D(u_radius_texture, pos).rg;
  }
  vec4 read_rectangle (void) {
    return texture2D(u_rectangle_texture,  get_rectangle_index());
  }
  vec4 read_rectangle_point (void) {
    return u_rect_point;
  }
  void commit (vec4 val) {
    gl_FragColor = val;
  }
  ${segmentSegmentIntersectsFragment.segmentSegmentIntersectsFragment()}
  ${segmentSegmentIntersectionFragment.segmentSegmentIntersectionFragment()}
  ${labelRectangleIntersectionFragment.labelRectangleIntersectionFragment()}
  ${labelSegmentIntersectionFragment.labelSegmentIntersectionFragment()}
  ${rayRectangleIntersectionFragment.rayRectangleIntersectionFragment()}
  ${raySegmentIntersectionFragment.raySegmentIntersectionFragment()}
  ${mainIntersectionFragment.mainIntersectionFragment(size, numberOfRays)}
  `
}