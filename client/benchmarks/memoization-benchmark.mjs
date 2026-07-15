import React, { createElement, memo } from 'react'
import TestRenderer, { act } from 'react-test-renderer'

// Reproduces the Courses page's row-rendering pattern with 20 stable course
// objects and 50 unrelated parent updates. The baseline row is un-memoized;
// the optimized row uses the same React.memo strategy as Courses.jsx.
const courses = Array.from({ length: 20 }, (_, index) => ({
  id: String(index),
  code: `CSCI-${index}`,
  title: `Course ${index}`,
}))

let baselineRowRenders = 0
let memoizedRowRenders = 0

function BaselineRow({ course }) {
  baselineRowRenders += 1
  return createElement('span', null, `${course.code}: ${course.title}`)
}

const MemoizedRow = memo(function MemoizedRow({ course }) {
  memoizedRowRenders += 1
  return createElement('span', null, `${course.code}: ${course.title}`)
})

function CourseList({ revision, Row }) {
  return createElement(
    'div',
    { 'data-revision': revision },
    courses.map((course) => createElement(Row, { key: course.id, course })),
  )
}

function measure(Row) {
  let renderer
  act(() => {
    renderer = TestRenderer.create(createElement(CourseList, { revision: 0, Row }))
  })
  for (let revision = 1; revision <= 50; revision += 1) {
    act(() => {
      renderer.update(createElement(CourseList, { revision, Row }))
    })
  }
  renderer.unmount()
}

measure(BaselineRow)
measure(MemoizedRow)

const avoided = baselineRowRenders - memoizedRowRenders
const reduction = (avoided / baselineRowRenders) * 100

console.log(`Baseline row renders: ${baselineRowRenders}`)
console.log(`Memoized row renders: ${memoizedRowRenders}`)
console.log(`Avoided row renders: ${avoided} (${reduction.toFixed(1)}% reduction)`)
