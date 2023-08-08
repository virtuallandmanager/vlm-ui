String.prototype.createSlug = function () {
  let str = this.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str;
};

String.prototype.capitalize = function () {
  return this.toLowerCase().replace(/\b\w/g, function (m) {
    return m.toUpperCase();
  });
};

String.prototype.removeUnderscore = function () {
  return this.replace(/_/g, " ");
};

String.prototype.removeDash = function () {
  return this.replace(/-/g, " ");
};

String.prototype.truncateWallet = function () {
  return this.substring(0, 6) + "...." + this.substring(this.length - 4, this.length);
};
