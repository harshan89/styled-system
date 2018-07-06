import PropTypes from 'prop-types'

const noop = n => n

export const propTypes = {
  numberOrString: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  responsive: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.array,
  ]),
}

export const defaultBreakpoints = [ 40, 52, 64, ].map(n => n + 'em')
export const is = n => n !== undefined && n !== null
export const num = n => typeof n === 'number' && !isNaN(n)
export const px = n => num(n) ? n + 'px' : n

export const idx = (obj, ...paths) => paths.join('.').split('.')
  .reduce((a, b) => (a && a[b]) ? a[b] : null, obj)

export const get = (obj, paths, fallback) => typeof obj === 'string'
  ? props => get(props.theme, obj) || paths
  : idx(obj, paths) || fallback

export const merge = (a, b) => Object.assign({}, a, b, Object
  .keys(b || {}).reduce((obj, key) =>
    Object.assign(obj, {
      [key]: a[key] !== null && typeof a[key] === 'object'
      ? merge(a[key], b[key])
      : b[key]
    }),
    {}))

export const compose = (...funcs) => {
  const fn = props => funcs
    .map(fn => fn(props))
    .reduce(merge)

  fn.propTypes = funcs
    .map(fn => fn.propTypes)
    .reduce(merge)
  return fn
}

export const createMediaQuery = n => `@media screen and (min-width: ${n})`

export const createMediaRule = breakpoints => (obj, i) => is(obj)
  ? breakpoints[i]
    ? { [breakpoints[i]]: obj }
    : obj
  : null

export const style = ({
  prop,
  cssProperty,
  key,
  getter = noop,
}) => {
  const css = cssProperty || prop
  const fn = props => {
    const val = props[prop]
    if (!is(val)) return null

    const scale = get(props.theme, key) || {}
    const style = n => is(n) ? ({
      [css]: getter(
        get(scale, n) || n
      )
    }) : null

    if (!Array.isArray(val)) {
      return style(val)
    }

    // how to hoist this up??
    const breakpoints = [
      null,
      ...(get(props.theme, 'breakpoints') || defaultBreakpoints)
        .map(createMediaQuery)
    ]

    let styles = {}

    for (let i = 0; i < val.length; i++) {
      const media = breakpoints[i]
      if (!media) {
        styles = style(val[i])
        continue
      }
      styles[media] = style(val[i])
    }

    return styles
  }

  fn.propTypes = { [prop]: propTypes.responsive }

  return fn
}
