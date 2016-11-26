'use strict'
module.exports = {findBestRay}

const _ = require('lodash')

const extendedPointMethods = require('./extended-point-methods')
const labelRectangleIntersection = require('./label-rectangle-intersection').labelRectangleIntersection
const labelSegmentIntersection = require('./label-segment-intersection').labelSegmentIntersection
const multiInterval = require('./multi-interval').multiInterval
const utils = require('./utils')

const TOLERANCE = 2 // pixels

function findBestRay (pointsToLabel, pointsNotToLabel) {
  // We follow the article page 4 Algorithm 1
  var P = pointsToLabel
  var P0 = pointsNotToLabel.concat(pointsToLabel)
  // int P min in the article
  var minimumAvailableSpace = Number.POSITIVE_INFINITY
  var rbest
  var Vbest
  var pbest // This is not in the original algorithm but allows to easily find the corresponding point
  P0.forEach(p=> extendedPointMethods.updateAvailableSpace(p))
  P.forEach(p=> extendedPointMethods.updateMinima(p))
  P.sort((p1, p2) => p2.availableMeasure - p1.availableMeasure )
  for (let pi of P) {
    let mindik = _.minBy(pi.rays, 'minimum').minimum
    let R = pi.rays.filter(rij => rij.minimum < mindik + TOLERANCE)
    rijloop: for (let rij of R) {
      let Vij = []
      let segment = {x: rij.vector.x * rij.minimum, y: rij.vector.y * rij.minimum}
      const rectangle = extendedPointMethods.translateLabel(pi, segment)
      for (let pk of P0) {
        if (pk === pi) continue
        // No sense to wait for the intersection if rbest is defined

        //int pk
        let availableSpace = 0
        // Not doing the preintersection here. Something fishy in the article, if preintersect is empty then  integral pk- is 0 which does not make much sense
        for (let rkl of pk.rays) {
          // We have split label rectangle intersection into two algorithms, label rectangle and label segment. Those two intervals should intersect since the segment intersects the rectangle, so we can coalesce the intervals
          let labelInterval = labelRectangleIntersection(rectangle, pk.label, rkl.vector, pk.position)
          let segmentInterval = labelSegmentIntersection(pi.position, segment, pk.label, rkl.vector, pk.position)
          availableSpace += rkl.available.multipleRemove(multiInterval.coalesce(labelInterval, segmentInterval)).measure()
        }
        // This ray is not good because we try to maximize the minimum
        if (rbest && availableSpace < minimumAvailableSpace) {
          continue rijloop
        }
        Vij.push(availableSpace)
      }
      Vij.sort((i,j) => i - j) // order to compare in lexicographical order
      if (!Vbest || utils.compareArraysLexicographically(Vij, Vbest) < 0) {
        rbest = rij
        Vbest = Vij
        minimumAvailableSpace = _.min(Vij)
        pbest = pi
      }
    }
  }
  return {rbest: rbest, pbest: pbest}
}