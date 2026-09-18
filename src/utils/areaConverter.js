// Pakistani Real Estate Area Conversion Utility
// Standard Punjab / Sindh urban metric: 1 Marla = 225 sq ft, 1 Kanal = 20 Marla = 4,500 sq ft

export const MARLA_SQFT = 225;
export const KANAL_SQFT = 4500;
export const SQYD_SQFT = 9;

export const convertArea = (value, fromUnit = 'sqft', toUnit = 'sqft') => {
  const num = Number(value);
  if (!num || isNaN(num)) return 0;
  if (fromUnit === toUnit) return num;

  // Convert to base sqft first
  let sqft = 0;
  switch (fromUnit.toLowerCase()) {
    case 'marla':
      sqft = num * MARLA_SQFT;
      break;
    case 'kanal':
      sqft = num * KANAL_SQFT;
      break;
    case 'sqyd':
      sqft = num * SQYD_SQFT;
      break;
    case 'sqft':
    default:
      sqft = num;
      break;
  }

  // Convert from sqft to target unit
  switch (toUnit.toLowerCase()) {
    case 'marla':
      return Number((sqft / MARLA_SQFT).toFixed(2));
    case 'kanal':
      return Number((sqft / KANAL_SQFT).toFixed(2));
    case 'sqyd':
      return Number((sqft / SQYD_SQFT).toFixed(2));
    case 'sqft':
    default:
      return Math.round(sqft);
  }
};

export const formatPrice = (price) => {
  const num = Number(price);
  if (!num || isNaN(num)) return '0';
  if (num >= 10000000) {
    const crore = num / 10000000;
    return `${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
  }
  return num.toLocaleString();
};

export const formatArea = (areaSize, areaUnit = 'sqft') => {
  const num = Number(areaSize);
  if (!num || isNaN(num)) return '-';
  const unit = (areaUnit || 'sqft').toLowerCase();

  const labels = {
    marla: 'Marla',
    kanal: 'Kanal',
    sqyd: 'Sq. Yd',
    sqft: 'Sq. Ft',
  };

  const label = labels[unit] || unit;

  if (unit === 'marla' && num >= 20) {
    const kanal = Number((num / 20).toFixed(2));
    return `${kanal} Kanal (${num} Marla)`;
  }

  if (unit !== 'sqft') {
    const sqft = convertArea(num, unit, 'sqft');
    return `${num} ${label} (~${sqft.toLocaleString()} sq ft)`;
  }

  return `${num.toLocaleString()} ${label}`;
};
