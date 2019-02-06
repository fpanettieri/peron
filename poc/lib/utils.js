'use strict';

function clone (o)
{
  return JSON.parse(JSON.stringify(o));
}

function humanize (size)
{
  let i = size === 0 ? 0 : Math.floor( Math.log(size) / Math.log(1024) );
  return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

function intervalToMs (interval)
{
  const dimension = interval[interval.length - 1];
  let ms = parseInt(interval.slice(0, -1)) * 1000;

  if (dimension === 'M') {
    ms *= 30;
  } else if (dimension === 'w') {
    ms *= 7;
  }

  switch (dimension) {
    case 'd': ms *= 24;
    case 'h': ms *= 60;
    case 'm': ms *= 60;
  }

  return ms;
}

module.exports = {
  clone: clone,
  humanize: humanize,
  intervalToMs: intervalToMs
}
