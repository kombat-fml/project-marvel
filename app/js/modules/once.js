const once = fn => () => {
  if (!fn) return;
  const res = fn();
  fn = null;
  return res;
}

export default once;