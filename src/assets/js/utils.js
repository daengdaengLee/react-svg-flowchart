export function _pipe(...fs) {
  return (..._) => fs.slice(1).reduce((v, f) => f(v), fs[0](..._));
}
