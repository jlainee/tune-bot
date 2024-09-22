export function isURL(url: string): boolean {
  const urlPattern = /^(https?:\/\/|www\.)[^\s\/$.?#].\S*$/;
  return urlPattern.test(url);
}
