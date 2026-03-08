import L from 'leaflet';

/**
 * Creates a Leaflet divIcon that renders as a price label pill.
 * @param {number} price - The nightly price to display
 * @param {boolean} active - Whether this pin is currently selected/hovered
 * @returns {L.DivIcon}
 */
export function createPriceIcon(price, active = false) {
  const bg = active ? '#222222' : '#FFFFFF';
  const color = active ? '#FFFFFF' : '#222222';
  const border = active ? '#222222' : '#DDDDDD';
  const shadow = active ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)';
  const scale = active ? 'scale(1.1)' : 'scale(1)';

  return L.divIcon({
    className: 'price-pin',
    html: `
      <div style="
        background: ${bg};
        color: ${color};
        border: 1px solid ${border};
        border-radius: 20px;
        padding: 4px 10px;
        font-size: 13px;
        font-weight: 700;
        font-family: 'DM Sans', sans-serif;
        white-space: nowrap;
        box-shadow: ${shadow};
        transform: ${scale};
        transition: all 0.15s ease;
        cursor: pointer;
      ">$${price}</div>
    `,
    iconSize: [0, 0],
    iconAnchor: [30, 15],
  });
}
